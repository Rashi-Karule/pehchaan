from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class MRZCheckDigitResult(BaseModel):
    field_name: str
    raw_value: str
    check_digit: str
    calculated_check_digit: str
    valid: bool
    weight_formula: str = "7-3-1 ICAO 9303"

class MRZValidationResult(BaseModel):
    has_mrz: bool
    mrz_type: str  # "TD1", "TD2", "TD3", "NONE"
    raw_lines: List[str] = []
    document_type: Optional[str] = None
    country_code: Optional[str] = None
    document_number: Optional[str] = None
    birth_date: Optional[str] = None
    sex: Optional[str] = None
    expiry_date: Optional[str] = None
    nationality: Optional[str] = None
    surname: Optional[str] = None
    given_names: Optional[str] = None
    optional_data: Optional[str] = None
    check_digits: List[MRZCheckDigitResult] = []
    all_valid: bool = False

class OCRExtractionResult(BaseModel):
    full_text: str
    name: Optional[str] = None
    surname: Optional[str] = None
    given_names: Optional[str] = None
    date_of_birth: Optional[str] = None
    document_number: Optional[str] = None
    expiration_date: Optional[str] = None
    issuing_country: Optional[str] = None
    document_type: Optional[str] = None
    confidence_score: float = 0.0
    extracted_fields_count: int = 0

class ConsistencyCheck(BaseModel):
    field_name: str
    ocr_value: Optional[str] = None
    mrz_value: Optional[str] = None
    status: str  # "MATCH", "MISMATCH", "NOT_APPLICABLE"
    details: str

class TamperingDetectionResult(BaseModel):
    ela_score: float
    copy_move_score: float
    tampering_score: float
    is_tampered: bool
    heatmap_url: str
    cloned_regions_count: int
    ela_anomaly_detected: bool
    copy_move_detected: bool
    details: List[str] = []

class FaceVerificationResult(BaseModel):
    selfie_provided: bool
    document_face_detected: bool
    selfie_face_detected: bool
    match_score: Optional[float] = None
    cosine_similarity: Optional[float] = None
    is_match: Optional[bool] = None
    document_face_url: Optional[str] = None
    selfie_face_url: Optional[str] = None
    details: str

class RiskAssessment(BaseModel):
    overall_score: float  # 0.0 to 100.0 (0=safe, 100=critical risk)
    risk_level: str       # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    recommendation: str   # "CLEAR", "INVESTIGATE", "REJECT"
    plain_english_explanation: str
    risk_factors: List[str] = []

class AnalysisResult(BaseModel):
    case_id: str
    document_id: str
    created_at: str
    preview_url: str
    selfie_url: Optional[str] = None
    ocr: OCRExtractionResult
    mrz: MRZValidationResult
    consistency: List[ConsistencyCheck] = []
    tampering: TamperingDetectionResult
    face_verification: FaceVerificationResult
    risk: RiskAssessment
    review_status: str = "PENDING"  # "PENDING", "CONFIRMED", "FLAGGED", "ESCALATED"
    officer_notes: Optional[str] = None
    officer_decision_at: Optional[str] = None

class UploadResponse(BaseModel):
    documentId: str
    previewUrl: str
    selfieUrl: Optional[str] = None

class AnalyzeRequest(BaseModel):
    documentId: str

class ReviewRequest(BaseModel):
    decision: str  # "CONFIRMED", "FLAGGED", "ESCALATED"
    notes: Optional[str] = None

class ReviewResponse(BaseModel):
    success: bool
    caseId: str
    review_status: str
    officer_notes: Optional[str] = None
    officer_decision_at: str
