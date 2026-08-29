import os
import uuid
import json
import shutil
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import init_db, get_db, DocumentCase
from models import (
    AnalysisResult,
    UploadResponse,
    AnalyzeRequest,
    ReviewRequest,
    ReviewResponse,
    OCRExtractionResult,
    MRZValidationResult,
    TamperingDetectionResult,
    FaceVerificationResult,
    RiskAssessment
)
from modules.ocr_extractor import perform_ocr
from modules.mrz_validator import parse_mrz, check_consistency
from modules.tampering_detector import generate_tampering_heatmap
from modules.face_verifier import face_engine
from modules.risk_engine import evaluate_risk
from sample_generator import seed_sample_data

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Initialize database
init_db()

# Pre-seed realistic sample data for testing
seed_sample_data(UPLOADS_DIR)

app = FastAPI(title="TRUST-LENS AI API", version="1.0.0")

# CORS Middleware for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded documents & generated heatmaps statically
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "TRUST-LENS AI", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/documents/upload", response_model=UploadResponse)
async def upload_document(
    document: UploadFile = File(...),
    selfie: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    doc_id = str(uuid.uuid4())
    doc_ext = os.path.splitext(document.filename)[1] or ".jpg"
    doc_save_name = f"doc_{doc_id}{doc_ext}"
    doc_path = os.path.join(UPLOADS_DIR, doc_save_name)

    with open(doc_path, "wb") as f:
        content = await document.read()
        f.write(content)

    selfie_save_name = None
    selfie_url = None

    if selfie is not None:
        selfie_ext = os.path.splitext(selfie.filename)[1] or ".jpg"
        selfie_save_name = f"selfie_{doc_id}{selfie_ext}"
        selfie_path = os.path.join(UPLOADS_DIR, selfie_save_name)
        with open(selfie_path, "wb") as f:
            s_content = await selfie.read()
            f.write(s_content)
        selfie_url = f"/uploads/{selfie_save_name}"

    preview_url = f"/uploads/{doc_save_name}"

    # Create initial case record in DB
    new_case = DocumentCase(
        id=doc_id,
        document_filename=doc_save_name,
        selfie_filename=selfie_save_name,
        preview_url=preview_url,
        selfie_url=selfie_url,
        review_status="PENDING"
    )
    db.add(new_case)
    db.commit()

    return UploadResponse(
        documentId=doc_id,
        previewUrl=preview_url,
        selfieUrl=selfie_url
    )

@app.post("/api/documents/analyze", response_model=AnalysisResult)
async def analyze_document(request: AnalyzeRequest, db: Session = Depends(get_db)):
    doc_id = request.documentId
    case = db.query(DocumentCase).filter(DocumentCase.id == doc_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Document case not found.")

    doc_path = os.path.join(UPLOADS_DIR, case.document_filename)
    selfie_path = os.path.join(UPLOADS_DIR, case.selfie_filename) if case.selfie_filename else None

    if not os.path.exists(doc_path):
        raise HTTPException(status_code=404, detail="Document image file missing on server.")

    # 1. Module 1: OCR Extraction
    try:
        ocr_result = perform_ocr(doc_path)
    except Exception as e:
        print(f"[Analysis] OCR Error: {e}")
        ocr_result = OCRExtractionResult(full_text="", confidence_score=0.0)

    # 2. Module 2: Document Validation (ICAO 9303 MRZ Validation)
    try:
        mrz_result = parse_mrz(ocr_result.full_text)
        consistency_checks = check_consistency(ocr_result.model_dump(), mrz_result)
    except Exception as e:
        print(f"[Analysis] MRZ Validation Error: {e}")
        mrz_result = MRZValidationResult(has_mrz=False, mrz_type="NONE")
        consistency_checks = []

    # 3. Module 3: Tampering Detection (ELA + Copy-Move via OpenCV)
    heatmap_filename = f"heatmap_{doc_id}.png"
    heatmap_path = os.path.join(UPLOADS_DIR, heatmap_filename)
    try:
        tampering_result = generate_tampering_heatmap(doc_path, heatmap_path)
    except Exception as e:
        print(f"[Analysis] Tampering Detection Error: {e}")
        tampering_result = TamperingDetectionResult(
            ela_score=0.0,
            copy_move_score=0.0,
            tampering_score=0.0,
            is_tampered=False,
            heatmap_url="",
            cloned_regions_count=0,
            ela_anomaly_detected=False,
            copy_move_detected=False,
            details=[f"Tampering analysis encountered error: {str(e)}"]
        )

    # 4. Module 4: Face Verification
    try:
        face_result = face_engine.verify_faces(doc_path, selfie_path, UPLOADS_DIR, doc_id)
    except Exception as e:
        print(f"[Analysis] Face Verification Error: {e}")
        face_result = FaceVerificationResult(
            selfie_provided=bool(selfie_path),
            document_face_detected=False,
            selfie_face_detected=False,
            details=f"Face verification failed: {str(e)}"
        )

    # 5. Risk Assessment Engine
    risk_result = evaluate_risk(ocr_result, mrz_result, consistency_checks, tampering_result, face_result)

    # Build Aggregate Result
    analysis_result = AnalysisResult(
        case_id=doc_id,
        document_id=doc_id,
        created_at=case.created_at.isoformat() if case.created_at else datetime.utcnow().isoformat(),
        preview_url=case.preview_url,
        selfie_url=case.selfie_url,
        ocr=ocr_result,
        mrz=mrz_result,
        consistency=consistency_checks,
        tampering=tampering_result,
        face_verification=face_result,
        risk=risk_result,
        review_status=case.review_status or "PENDING",
        officer_notes=case.officer_notes,
        officer_decision_at=case.officer_decision_at.isoformat() if case.officer_decision_at else None
    )

    # Persist in SQLite
    case.analysis_json = json.dumps(analysis_result.model_dump())
    db.commit()

    return analysis_result

@app.get("/api/documents/{case_id}", response_model=AnalysisResult)
def get_document_analysis(case_id: str, db: Session = Depends(get_db)):
    case = db.query(DocumentCase).filter(DocumentCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Document case not found.")

    if not case.analysis_json:
        raise HTTPException(status_code=400, detail="Analysis not yet completed for this document.")

    data = json.loads(case.analysis_json)
    return AnalysisResult(**data)

@app.post("/api/review/{case_id}", response_model=ReviewResponse)
def save_officer_review(case_id: str, req: ReviewRequest, db: Session = Depends(get_db)):
    case = db.query(DocumentCase).filter(DocumentCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Document case not found.")

    if req.decision not in ["CONFIRMED", "FLAGGED", "ESCALATED"]:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be CONFIRMED, FLAGGED, or ESCALATED.")

    now = datetime.utcnow()
    case.review_status = req.decision
    case.officer_notes = req.notes
    case.officer_decision_at = now

    # Update in analysis_json if present
    if case.analysis_json:
        try:
            data = json.loads(case.analysis_json)
            data["review_status"] = req.decision
            data["officer_notes"] = req.notes
            data["officer_decision_at"] = now.isoformat()
            case.analysis_json = json.dumps(data)
        except Exception:
            pass

    db.commit()

    return ReviewResponse(
        success=True,
        caseId=case_id,
        review_status=case.review_status,
        officer_notes=case.officer_notes,
        officer_decision_at=now.isoformat()
    )

@app.get("/api/demo/samples")
def get_demo_samples():
    """List pre-configured test scenarios for instant demonstration."""
    return [
        {
            "id": "sample_genuine",
            "title": "Genuine ICAO 9303 Passport",
            "category": "genuine",
            "description": "Authentic Utopia Passport for Anna Eriksson. Passports check digits match perfectly, zero tampering, biometric match with live selfie.",
            "document_filename": "sample_genuine_passport.jpg",
            "selfie_filename": "sample_selfie_anna.jpg",
            "expected_outcome": "LOW RISK (CLEAR) — Valid MRZ, Low ELA/Copy-Move, 95%+ Face Match"
        },
        {
            "id": "sample_tampered",
            "title": "Tampered ID (Cloned Stamp & Spliced Text)",
            "category": "tampered",
            "description": "Manipulated passport with duplicated security stamp (Copy-Move Forgery) and an inserted uncompressed clearance badge (ELA anomaly).",
            "document_filename": "sample_tampered_passport.jpg",
            "selfie_filename": None,
            "expected_outcome": "HIGH / CRITICAL RISK — Forensic Heatmap highlights cloned and spliced regions"
        },
        {
            "id": "sample_invalid_mrz",
            "title": "Corrupted MRZ Checksum Failure",
            "category": "mrz_invalid",
            "description": "Forged document with corrupted check digits on Document Number & Date of Birth. ICAO 9303 7-3-1 weighting flags mathematical invalidity.",
            "document_filename": "sample_invalid_mrz_passport.jpg",
            "selfie_filename": None,
            "expected_outcome": "HIGH RISK (INVESTIGATE) — MRZ check digit mismatch"
        },
        {
            "id": "sample_face_mismatch",
            "title": "Biometric Impersonation / Face Mismatch",
            "category": "face_mismatch",
            "description": "Genuine passport presented by a different traveler. Document photo does not match traveler live selfie.",
            "document_filename": "sample_genuine_passport.jpg",
            "selfie_filename": "sample_selfie_mismatch.jpg",
            "expected_outcome": "HIGH RISK — Biometric match score < 30%"
        }
    ]

@app.post("/api/demo/load/{sample_id}", response_model=UploadResponse)
def load_demo_sample(sample_id: str, db: Session = Depends(get_db)):
    """Instantly load one of the pre-seeded samples as a new case."""
    samples_map = {
        "sample_genuine": ("sample_genuine_passport.jpg", "sample_selfie_anna.jpg"),
        "sample_tampered": ("sample_tampered_passport.jpg", None),
        "sample_invalid_mrz": ("sample_invalid_mrz_passport.jpg", None),
        "sample_face_mismatch": ("sample_genuine_passport.jpg", "sample_selfie_mismatch.jpg"),
    }

    if sample_id not in samples_map:
        raise HTTPException(status_code=404, detail="Sample ID not found.")

    doc_src_name, selfie_src_name = samples_map[sample_id]
    doc_src_path = os.path.join(UPLOADS_DIR, doc_src_name)

    if not os.path.exists(doc_src_path):
        seed_sample_data(UPLOADS_DIR)

    doc_id = str(uuid.uuid4())
    doc_target_name = f"doc_{doc_id}_{doc_src_name}"
    doc_target_path = os.path.join(UPLOADS_DIR, doc_target_name)
    shutil.copyfile(doc_src_path, doc_target_path)

    selfie_target_name = None
    selfie_url = None
    if selfie_src_name:
        selfie_src_path = os.path.join(UPLOADS_DIR, selfie_src_name)
        if os.path.exists(selfie_src_path):
            selfie_target_name = f"selfie_{doc_id}_{selfie_src_name}"
            selfie_target_path = os.path.join(UPLOADS_DIR, selfie_target_name)
            shutil.copyfile(selfie_src_path, selfie_target_path)
            selfie_url = f"/uploads/{selfie_target_name}"

    preview_url = f"/uploads/{doc_target_name}"

    new_case = DocumentCase(
        id=doc_id,
        document_filename=doc_target_name,
        selfie_filename=selfie_target_name,
        preview_url=preview_url,
        selfie_url=selfie_url,
        review_status="PENDING"
    )
    db.add(new_case)
    db.commit()

    return UploadResponse(
        documentId=doc_id,
        previewUrl=preview_url,
        selfieUrl=selfie_url
    )
