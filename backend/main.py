import os
import io
import uuid
import json
import shutil
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image

from database import init_db, get_db, DocumentCase, Officer
from auth import (
    get_current_officer,
    verify_password,
    create_access_token
)
from models import (
    AnalysisResult,
    UploadResponse,
    AnalyzeRequest,
    ReviewRequest,
    ReviewResponse,
    LoginRequest,
    LoginResponse,
    OfficerInfo,
    DemoSample,
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

# Initialize database & seed initial officer and sample assets
init_db()
seed_sample_data(UPLOADS_DIR)

app = FastAPI(title="PEHCHAAN Border Checkpoint API", version="1.0.0")

# CORS Middleware for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: Static /uploads mount has been deliberately REMOVED to protect traveler document images.
# All document images, heatmaps, and face crops are served through authenticated streaming routes.

def validate_image_upload(file_bytes: bytes, filename: str) -> str:
    """Validate upload size (<10MB) and ensure file is a genuine readable image via Pillow."""
    max_size = 10 * 1024 * 1024  # 10 MB
    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file '{filename}' exceeds the maximum allowed size limit of 10MB."
        )
    try:
        with Image.open(io.BytesIO(file_bytes)) as img:
            img.verify()
            fmt = img.format.lower() if img.format else "jpeg"
            return f"image/{fmt}"
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file '{filename}' is not a valid or readable image format (JPEG, PNG, WEBP required)."
        )

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.post("/api/auth/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Officer authentication endpoint. Verifies bcrypt password hash and issues 8-hour shift JWT."""
    officer = db.query(Officer).filter(Officer.username == req.username).first()
    
    # Generic error to prevent username enumeration
    if not officer or not verify_password(req.password, officer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid officer credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(officer.id, officer.username)
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        officer=OfficerInfo(id=officer.id, username=officer.username)
    )

@app.get("/api/auth/me", response_model=OfficerInfo)
def get_current_officer_info(current_officer: Officer = Depends(get_current_officer)):
    """Return identity and status of currently authenticated border officer session."""
    return OfficerInfo(id=current_officer.id, username=current_officer.username)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "PEHCHAAN DOC-9303",
        "auth_required": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ==========================================
# AUTHENTICATED DOCUMENT IMAGE STREAMING
# ==========================================

@app.get("/api/documents/{case_id}/image")
def stream_document_image(
    case_id: str,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Stream primary identity document image to authenticated border officer."""
    case = db.query(DocumentCase).filter(DocumentCase.id == case_id).first()
    if not case or not case.document_filename:
        raise HTTPException(status_code=404, detail="Document case or image file not found.")

    file_path = os.path.join(UPLOADS_DIR, case.document_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document image file not present on storage volume.")

    ext = os.path.splitext(case.document_filename)[1].lower()
    media_type = "image/png" if ext == ".png" else "image/webp" if ext == ".webp" else "image/jpeg"
    return FileResponse(file_path, media_type=media_type)

@app.get("/api/documents/{case_id}/heatmap")
def stream_tampering_heatmap(
    case_id: str,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Stream forensic tampering ELA/Copy-Move overlay heatmap to authenticated officer."""
    case = db.query(DocumentCase).filter(DocumentCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Document case not found.")

    heatmap_filename = f"heatmap_{case_id}.png"
    file_path = os.path.join(UPLOADS_DIR, heatmap_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Forensic heatmap not yet generated for this case.")

    return FileResponse(file_path, media_type="image/png")

@app.get("/api/documents/{case_id}/selfie")
def stream_traveler_selfie(
    case_id: str,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Stream traveler live selfie image to authenticated officer."""
    case = db.query(DocumentCase).filter(DocumentCase.id == case_id).first()
    if not case or not case.selfie_filename:
        raise HTTPException(status_code=404, detail="No traveler selfie associated with this case.")

    file_path = os.path.join(UPLOADS_DIR, case.selfie_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Traveler selfie image not found on storage volume.")

    ext = os.path.splitext(case.selfie_filename)[1].lower()
    media_type = "image/png" if ext == ".png" else "image/webp" if ext == ".webp" else "image/jpeg"
    return FileResponse(file_path, media_type=media_type)

@app.get("/api/documents/{case_id}/document-face")
def stream_document_face(
    case_id: str,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Stream extracted passport/ID portrait crop to authenticated officer."""
    face_filename = f"doc_face_{case_id}.jpg"
    file_path = os.path.join(UPLOADS_DIR, face_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Extracted document portrait crop not found.")

    return FileResponse(file_path, media_type="image/jpeg")

@app.get("/api/documents/{case_id}/selfie-face")
def stream_selfie_face(
    case_id: str,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Stream extracted traveler live selfie face crop to authenticated officer."""
    face_filename = f"selfie_face_{case_id}.jpg"
    file_path = os.path.join(UPLOADS_DIR, face_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Extracted live selfie face crop not found.")

    return FileResponse(file_path, media_type="image/jpeg")

# ==========================================
# PROTECTED WORKSTATION OPERATIONS
# ==========================================

@app.post("/api/documents/upload", response_model=UploadResponse)
async def upload_document(
    document: UploadFile = File(...),
    selfie: Optional[UploadFile] = File(None),
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Upload and ingest traveler identity documents with size/image validation & officer attribution."""
    doc_id = str(uuid.uuid4())
    
    # Read & validate primary document image
    doc_content = await document.read()
    validate_image_upload(doc_content, document.filename or "document")
    
    doc_ext = os.path.splitext(document.filename)[1] or ".jpg"
    doc_save_name = f"doc_{doc_id}{doc_ext}"
    doc_path = os.path.join(UPLOADS_DIR, doc_save_name)

    with open(doc_path, "wb") as f:
        f.write(doc_content)

    selfie_save_name = None
    selfie_url = None

    if selfie is not None:
        selfie_content = await selfie.read()
        validate_image_upload(selfie_content, selfie.filename or "selfie")
        selfie_ext = os.path.splitext(selfie.filename)[1] or ".jpg"
        selfie_save_name = f"selfie_{doc_id}{selfie_ext}"
        selfie_path = os.path.join(UPLOADS_DIR, selfie_save_name)
        with open(selfie_path, "wb") as f:
            f.write(selfie_content)
        selfie_url = f"/api/documents/{doc_id}/selfie"

    preview_url = f"/api/documents/{doc_id}/image"

    # Create initial case record with audit trail
    new_case = DocumentCase(
        id=doc_id,
        created_at=datetime.now(timezone.utc),
        document_filename=doc_save_name,
        selfie_filename=selfie_save_name,
        preview_url=preview_url,
        selfie_url=selfie_url,
        review_status="PENDING",
        screened_by_officer_id=current_officer.id,
        screened_by_officer_username=current_officer.username
    )
    db.add(new_case)
    db.commit()

    return UploadResponse(
        documentId=doc_id,
        previewUrl=preview_url,
        selfieUrl=selfie_url
    )

@app.post("/api/documents/analyze", response_model=AnalysisResult)
async def analyze_document(
    request: AnalyzeRequest,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Execute 4-module forensic screening pipeline attributed to requesting officer."""
    doc_id = request.documentId
    case = db.query(DocumentCase).filter(DocumentCase.id == doc_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Document case not found.")

    doc_path = os.path.join(UPLOADS_DIR, case.document_filename)
    selfie_path = os.path.join(UPLOADS_DIR, case.selfie_filename) if case.selfie_filename else None

    if not os.path.exists(doc_path):
        raise HTTPException(status_code=404, detail="Document image file missing on storage volume.")

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
            heatmap_url=f"/api/documents/{doc_id}/heatmap",
            cloned_regions_count=0,
            ela_anomaly_detected=False,
            copy_move_detected=False,
            details=[f"Tampering analysis error: {str(e)}"]
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

    # Ensure URLs point to authenticated API streaming routes
    preview_url = f"/api/documents/{doc_id}/image"
    selfie_url = f"/api/documents/{doc_id}/selfie" if case.selfie_filename else None

    # Update case audit trail
    if not case.screened_by_officer_id:
        case.screened_by_officer_id = current_officer.id
        case.screened_by_officer_username = current_officer.username

    screened_by_info = OfficerInfo(
        id=case.screened_by_officer_id,
        username=case.screened_by_officer_username
    ) if case.screened_by_officer_id else OfficerInfo(id=current_officer.id, username=current_officer.username)

    reviewed_by_info = OfficerInfo(
        id=case.reviewed_by_officer_id,
        username=case.reviewed_by_officer_username
    ) if case.reviewed_by_officer_id else None

    # Build Aggregate Result
    analysis_result = AnalysisResult(
        case_id=doc_id,
        document_id=doc_id,
        created_at=case.created_at.isoformat() if case.created_at else datetime.now(timezone.utc).isoformat(),
        preview_url=preview_url,
        selfie_url=selfie_url,
        ocr=ocr_result,
        mrz=mrz_result,
        consistency=consistency_checks,
        tampering=tampering_result,
        face_verification=face_result,
        risk=risk_result,
        review_status=case.review_status or "PENDING",
        officer_notes=case.officer_notes,
        officer_decision_at=case.officer_decision_at.isoformat() if case.officer_decision_at else None,
        screened_by_officer_id=screened_by_info.id,
        screened_by_officer_username=screened_by_info.username,
        reviewed_by_officer_id=reviewed_by_info.id if reviewed_by_info else None,
        reviewed_by_officer_username=reviewed_by_info.username if reviewed_by_info else None,
        screened_by=screened_by_info,
        reviewed_by=reviewed_by_info
    )

    # Persist in SQLite
    case.preview_url = preview_url
    case.selfie_url = selfie_url
    case.analysis_json = json.dumps(analysis_result.model_dump())
    db.commit()

    return analysis_result

@app.get("/api/documents/{case_id}", response_model=AnalysisResult)
def get_document_analysis(
    case_id: str,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Retrieve full screening dossier with audit trail for authenticated officer."""
    case = db.query(DocumentCase).filter(DocumentCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Document case not found.")

    if not case.analysis_json:
        raise HTTPException(status_code=400, detail="Analysis not yet completed for this document.")

    data = json.loads(case.analysis_json)
    
    # Ensure audit fields and URLs are populated correctly
    data["preview_url"] = f"/api/documents/{case_id}/image"
    if case.selfie_filename:
        data["selfie_url"] = f"/api/documents/{case_id}/selfie"
    if data.get("tampering"):
        data["tampering"]["heatmap_url"] = f"/api/documents/{case_id}/heatmap"
    if data.get("face_verification"):
        if data["face_verification"].get("document_face_detected"):
            data["face_verification"]["document_face_url"] = f"/api/documents/{case_id}/document-face"
        if data["face_verification"].get("selfie_face_detected"):
            data["face_verification"]["selfie_face_url"] = f"/api/documents/{case_id}/selfie-face"

    screened_by_id = case.screened_by_officer_id or data.get("screened_by_officer_id") or current_officer.id
    screened_by_name = case.screened_by_officer_username or data.get("screened_by_officer_username") or current_officer.username
    data["screened_by_officer_id"] = screened_by_id
    data["screened_by_officer_username"] = screened_by_name
    data["screened_by"] = {"id": screened_by_id, "username": screened_by_name}

    if case.reviewed_by_officer_id:
        data["reviewed_by_officer_id"] = case.reviewed_by_officer_id
        data["reviewed_by_officer_username"] = case.reviewed_by_officer_username
        data["reviewed_by"] = {"id": case.reviewed_by_officer_id, "username": case.reviewed_by_officer_username}
    elif data.get("reviewed_by_officer_id"):
        data["reviewed_by"] = {"id": data["reviewed_by_officer_id"], "username": data.get("reviewed_by_officer_username", "")}

    return AnalysisResult(**data)

@app.post("/api/review/{case_id}", response_model=ReviewResponse)
def save_officer_review(
    case_id: str,
    req: ReviewRequest,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Record official officer adjudication decision with timestamp and officer audit trail."""
    case = db.query(DocumentCase).filter(DocumentCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Document case not found.")

    if req.decision not in ["CONFIRMED", "FLAGGED", "ESCALATED"]:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be CONFIRMED, FLAGGED, or ESCALATED.")

    now = datetime.now(timezone.utc)
    case.review_status = req.decision
    case.officer_notes = req.notes
    case.officer_decision_at = now
    case.reviewed_by_officer_id = current_officer.id
    case.reviewed_by_officer_username = current_officer.username

    # Update in analysis_json if present
    if case.analysis_json:
        try:
            data = json.loads(case.analysis_json)
            data["review_status"] = req.decision
            data["officer_notes"] = req.notes
            data["officer_decision_at"] = now.isoformat()
            data["reviewed_by_officer_id"] = current_officer.id
            data["reviewed_by_officer_username"] = current_officer.username
            data["reviewed_by"] = {"id": current_officer.id, "username": current_officer.username}
            case.analysis_json = json.dumps(data)
        except Exception:
            pass

    db.commit()

    return ReviewResponse(
        success=True,
        caseId=case_id,
        review_status=case.review_status,
        officer_notes=case.officer_notes,
        officer_decision_at=now.isoformat(),
        reviewed_by_officer_id=current_officer.id,
        reviewed_by_officer_username=current_officer.username
    )

@app.get("/api/demo/samples", response_model=List[DemoSample])
def get_demo_samples(current_officer: Officer = Depends(get_current_officer)):
    """List pre-configured test scenarios for instant demonstration (authenticated)."""
    return [
        DemoSample(
            id="sample_genuine",
            title="Genuine ICAO 9303 Passport",
            category="genuine",
            description="Authentic Utopia Passport for Anna Eriksson. Passports check digits match perfectly, zero tampering, biometric match with live selfie.",
            document_filename="sample_genuine_passport.jpg",
            selfie_filename="sample_selfie_anna.jpg",
            expected_outcome="LOW RISK (CLEAR) — Valid MRZ, Low ELA/Copy-Move, 95%+ Face Match"
        ),
        DemoSample(
            id="sample_tampered",
            title="Tampered ID (Cloned Stamp & Spliced Text)",
            category="tampered",
            description="Manipulated passport with duplicated security stamp (Copy-Move Forgery) and an inserted uncompressed clearance badge (ELA anomaly).",
            document_filename="sample_tampered_passport.jpg",
            selfie_filename=None,
            expected_outcome="HIGH / CRITICAL RISK — Forensic Heatmap highlights cloned and spliced regions"
        ),
        DemoSample(
            id="sample_invalid_mrz",
            title="Corrupted MRZ Checksum Failure",
            category="mrz_invalid",
            description="Forged document with corrupted check digits on Document Number & Date of Birth. ICAO 9303 7-3-1 weighting flags mathematical invalidity.",
            document_filename="sample_invalid_mrz_passport.jpg",
            selfie_filename=None,
            expected_outcome="HIGH RISK (INVESTIGATE) — MRZ check digit mismatch"
        ),
        DemoSample(
            id="sample_face_mismatch",
            title="Biometric Impersonation / Face Mismatch",
            category="face_mismatch",
            description="Genuine passport presented by a different traveler. Document photo does not match traveler live selfie.",
            document_filename="sample_genuine_passport.jpg",
            selfie_filename="sample_selfie_mismatch.jpg",
            expected_outcome="HIGH RISK — Biometric match score < 30%"
        )
    ]

@app.post("/api/demo/load/{sample_id}", response_model=UploadResponse)
def load_demo_sample(
    sample_id: str,
    current_officer: Officer = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Instantly load one of the pre-seeded samples attributed to authenticated officer."""
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
            selfie_url = f"/api/documents/{doc_id}/selfie"

    preview_url = f"/api/documents/{doc_id}/image"

    new_case = DocumentCase(
        id=doc_id,
        created_at=datetime.now(timezone.utc),
        document_filename=doc_target_name,
        selfie_filename=selfie_target_name,
        preview_url=preview_url,
        selfie_url=selfie_url,
        review_status="PENDING",
        screened_by_officer_id=current_officer.id,
        screened_by_officer_username=current_officer.username
    )
    db.add(new_case)
    db.commit()

    return UploadResponse(
        documentId=doc_id,
        previewUrl=preview_url,
        selfieUrl=selfie_url
    )
