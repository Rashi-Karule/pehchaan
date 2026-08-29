from typing import List
from models import (
    RiskAssessment,
    MRZValidationResult,
    OCRExtractionResult,
    ConsistencyCheck,
    TamperingDetectionResult,
    FaceVerificationResult
)

def evaluate_risk(
    ocr: OCRExtractionResult,
    mrz: MRZValidationResult,
    consistency: List[ConsistencyCheck],
    tampering: TamperingDetectionResult,
    face: FaceVerificationResult
) -> RiskAssessment:
    risk_score = 0.0
    risk_factors: List[str] = []
    explanation_parts: List[str] = []

    # 1. MRZ Checksum Evaluation
    if mrz.has_mrz:
        invalid_checks = [c for c in mrz.check_digits if not c.valid]
        if invalid_checks:
            failed_names = ", ".join([c.field_name.replace('_', ' ').title() for c in invalid_checks])
            risk_score += 45.0
            risk_factors.append(f"ICAO 9303 MRZ Checksum Failure on: {failed_names}")
            explanation_parts.append(f"The document failed ICAO 9303 checksum validation on {len(invalid_checks)} field(s) ({failed_names}), indicating likely document tampering or synthetic generation.")
        else:
            explanation_parts.append("All ICAO 9303 MRZ check digits passed validation (7-3-1 weighting matched).")
    else:
        # Document without MRZ
        risk_score += 5.0
        risk_factors.append("No Machine Readable Zone (MRZ) detected on document.")

    # 2. VIZ vs MRZ Cross-Consistency
    mismatches = [c for c in consistency if c.status == "MISMATCH"]
    if mismatches:
        mismatch_fields = ", ".join([c.field_name.replace('_', ' ').title() for c in mismatches])
        risk_score += min(40.0, len(mismatches) * 20.0)
        risk_factors.append(f"Data Mismatch between Visual Text and MRZ: {mismatch_fields}")
        explanation_parts.append(f"Inconsistencies detected between printed visual text (VIZ) and encoded MRZ data for {mismatch_fields}.")
    elif mrz.has_mrz:
        explanation_parts.append("Printed document text matches encoded MRZ data across all verifiable fields.")

    # 3. Tampering Analysis (ELA + Copy-Move)
    if tampering.is_tampered or tampering.tampering_score > 35.0:
        tamper_points = min(45.0, tampering.tampering_score * 0.5)
        risk_score += tamper_points
        if tampering.ela_anomaly_detected:
            risk_factors.append(f"Error Level Analysis anomaly detected (Score: {tampering.ela_score}/100)")
        if tampering.copy_move_detected:
            risk_factors.append(f"Copy-Move forgery detected ({tampering.cloned_regions_count} cloned cluster(s))")
        explanation_parts.append(f"Image forensics identified potential digital manipulation (Tampering Score: {tampering.tampering_score}/100), with localized compression anomalies or cloned regions.")
    else:
        explanation_parts.append(f"Forensic analysis shows uniform compression baseline (ELA: {tampering.ela_score}/100) and no copy-move cloning.")

    # 4. Biometric Face Verification
    if face.selfie_provided:
        if face.is_match is False:
            risk_score += 45.0
            risk_factors.append(f"Biometric Facial Mismatch (Score: {face.match_score or 0.0}%)")
            explanation_parts.append(f"Biometric verification failed: traveler selfie does not match the document photograph ({face.match_score or 0.0}% confidence).")
        elif face.is_match is True:
            # Reward successful face match
            risk_score = max(0.0, risk_score - 10.0)
            explanation_parts.append(f"Biometric verification confirmed: selfie matches document photo ({face.match_score}% confidence).")
        else:
            risk_score += 15.0
            risk_factors.append("Biometric verification inconclusive (face detection failed).")
            explanation_parts.append("Could not reliably detect or isolate facial features from the provided inputs.")

    # Bound risk score between 0 and 100
    final_score = round(float(min(100.0, max(0.0, risk_score))), 1)

    # Determine risk level & recommendation
    if final_score < 25.0:
        risk_level = "LOW"
        recommendation = "CLEAR"
    elif final_score < 55.0:
        risk_level = "MEDIUM"
        recommendation = "INVESTIGATE"
    elif final_score < 80.0:
        risk_level = "HIGH"
        recommendation = "INVESTIGATE"
    else:
        risk_level = "CRITICAL"
        recommendation = "REJECT"

    if not risk_factors:
        risk_factors.append("Document passed all cryptographic, forensic, and visual integrity screenings.")

    plain_english = " ".join(explanation_parts)

    return RiskAssessment(
        overall_score=final_score,
        risk_level=risk_level,
        recommendation=recommendation,
        plain_english_explanation=plain_english,
        risk_factors=risk_factors
    )
