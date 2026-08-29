export interface MRZCheckDigitResult {
  field_name: string;
  raw_value: string;
  check_digit: string;
  calculated_check_digit: string;
  valid: boolean;
  weight_formula: string;
}

export interface MRZValidationResult {
  has_mrz: boolean;
  mrz_type: 'TD1' | 'TD2' | 'TD3' | 'NONE';
  raw_lines: string[];
  document_type?: string | null;
  country_code?: string | null;
  document_number?: string | null;
  birth_date?: string | null;
  sex?: string | null;
  expiry_date?: string | null;
  nationality?: string | null;
  surname?: string | null;
  given_names?: string | null;
  optional_data?: string | null;
  check_digits: MRZCheckDigitResult[];
  all_valid: boolean;
}

export interface OCRExtractionResult {
  full_text: string;
  name?: string | null;
  surname?: string | null;
  given_names?: string | null;
  date_of_birth?: string | null;
  document_number?: string | null;
  expiration_date?: string | null;
  issuing_country?: string | null;
  document_type?: string | null;
  confidence_score: number;
  extracted_fields_count: number;
}

export interface ConsistencyCheck {
  field_name: string;
  ocr_value?: string | null;
  mrz_value?: string | null;
  status: 'MATCH' | 'MISMATCH' | 'NOT_APPLICABLE';
  details: string;
}

export interface TamperingDetectionResult {
  ela_score: number;
  copy_move_score: number;
  tampering_score: number;
  is_tampered: boolean;
  heatmap_url: string;
  cloned_regions_count: number;
  ela_anomaly_detected: boolean;
  copy_move_detected: boolean;
  details: string[];
}

export interface FaceVerificationResult {
  selfie_provided: boolean;
  document_face_detected: boolean;
  selfie_face_detected: boolean;
  match_score?: number | null;
  cosine_similarity?: number | null;
  is_match?: boolean | null;
  document_face_url?: string | null;
  selfie_face_url?: string | null;
  details: string;
}

export interface RiskAssessment {
  overall_score: number; // 0-100 (0=safe, 100=critical)
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: 'CLEAR' | 'INVESTIGATE' | 'REJECT';
  plain_english_explanation: string;
  risk_factors: string[];
}

export interface OfficerInfo {
  id: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  officer: OfficerInfo;
}

export interface AnalysisResult {
  case_id: string;
  document_id: string;
  created_at: string;
  preview_url: string;
  selfie_url?: string | null;
  ocr: OCRExtractionResult;
  mrz: MRZValidationResult;
  consistency: ConsistencyCheck[];
  tampering: TamperingDetectionResult;
  face_verification: FaceVerificationResult;
  risk: RiskAssessment;
  review_status: 'PENDING' | 'CONFIRMED' | 'FLAGGED' | 'ESCALATED';
  officer_notes?: string | null;
  officer_decision_at?: string | null;
  screened_by_officer_id?: string | null;
  screened_by_officer_username?: string | null;
  reviewed_by_officer_id?: string | null;
  reviewed_by_officer_username?: string | null;
  screened_by?: OfficerInfo | null;
  reviewed_by?: OfficerInfo | null;
}

export interface UploadResponse {
  documentId: string;
  previewUrl: string;
  selfieUrl?: string | null;
}

export interface AnalyzeRequest {
  documentId: string;
}

export interface ReviewRequest {
  decision: 'CONFIRMED' | 'FLAGGED' | 'ESCALATED';
  notes?: string | null;
}

export interface ReviewResponse {
  success: boolean;
  caseId: string;
  review_status: 'CONFIRMED' | 'FLAGGED' | 'ESCALATED';
  officer_notes?: string | null;
  officer_decision_at: string;
  reviewed_by_officer_id?: string | null;
  reviewed_by_officer_username?: string | null;
}

export interface DemoSample {
  id: string;
  title: string;
  category: 'genuine' | 'tampered' | 'mrz_invalid' | 'face_mismatch';
  description: string;
  document_filename: string;
  selfie_filename?: string | null;
  expected_outcome: string;
}
