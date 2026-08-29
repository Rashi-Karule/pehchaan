import re
import cv2
import numpy as np
import pytesseract
from PIL import Image
from typing import Dict, Any, Optional, Tuple
from models import OCRExtractionResult

def preprocess_for_ocr(img: np.ndarray) -> np.ndarray:
    """Preprocess image for optimal Tesseract OCR accuracy."""
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    h, w = gray.shape
    if h < 900:
        scale = 900.0 / h
        gray = cv2.resize(gray, (int(w * scale), 900), interpolation=cv2.INTER_CUBIC)

    # Denoise and sharpen
    denoised = cv2.bilateralFilter(gray, 7, 50, 50)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    return enhanced

def extract_ocr_fields(text: str) -> Dict[str, Optional[str]]:
    """Parse key identity fields from raw OCR text using robust regular expressions."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    full_clean_text = "\n".join(lines)

    extracted = {
        "name": None,
        "surname": None,
        "given_names": None,
        "date_of_birth": None,
        "document_number": None,
        "expiration_date": None,
        "issuing_country": None,
        "document_type": None
    }

    # Helper to check if a token is a label keyword
    LABEL_WORDS = {"PASSPORT", "PASSEPORT", "DOCUMENT", "NUMBER", "NO", "TYPE", "CODE", "SURNAME", "NOM", "NON",
                   "GIVEN", "NAMES", "PRENOMS", "DATE", "OF", "BIRTH", "DE", "NAISSANCE", "SEX", "SEXE",
                   "EXPIRATION", "EXPIRY", "STATE", "OFFICIAL", "TRAVEL"}

    # 1. Document Number
    for i, line in enumerate(lines):
        if re.search(r'Passport\s*No|Document\s*Number|Doc\s*#|ID\s*No', line, re.IGNORECASE):
            # Check next line
            if i + 1 < len(lines):
                candidate = lines[i+1].strip()
                tokens = [t for t in re.split(r'[\s/]+', candidate) if t.upper() not in LABEL_WORDS]
                for tok in tokens:
                    if re.match(r'^[A-Z0-9]{7,12}$', tok):
                        extracted["document_number"] = tok
                        break
            if not extracted["document_number"]:
                tokens = [t for t in re.split(r'[\s/:.\-]+', line) if t.upper() not in LABEL_WORDS]
                for tok in tokens:
                    if re.match(r'^[A-Z0-9]{7,12}$', tok):
                        extracted["document_number"] = tok
                        break

    if not extracted["document_number"]:
        # Match pattern like L898902C3 or P948210X5
        m_fallback = re.search(r'\b([A-Z][0-9]{6,8}[A-Z0-9]?)\b', full_clean_text)
        if m_fallback and m_fallback.group(1).upper() not in LABEL_WORDS:
            extracted["document_number"] = m_fallback.group(1)

    # 2. Surname
    for i, line in enumerate(lines):
        if re.search(r'Surname|Nom|Last\s*Name|Family\s*Name|SURNAME\s*\/\s*NON', line, re.IGNORECASE):
            if i + 1 < len(lines):
                candidate = lines[i+1].strip()
                clean_cand = re.sub(r'[^A-Z\s\-]', '', candidate).strip()
                if clean_cand and not any(w in clean_cand.split() for w in ["GIVEN", "PRENOMS", "SEX", "DATE"]):
                    extracted["surname"] = clean_cand
                    break

    # 3. Given Names
    for i, line in enumerate(lines):
        if re.search(r'Given\s*Names?|Prénoms?|First\s*Names?', line, re.IGNORECASE):
            if i + 1 < len(lines):
                candidate = lines[i+1].strip()
                clean_cand = re.sub(r'[^A-Z\s\-]', '', candidate).strip()
                if clean_cand and not any(w in clean_cand.split() for w in ["DATE", "BIRTH", "SEX", "SURNAME"]):
                    extracted["given_names"] = clean_cand
                    break

    if extracted["surname"] and extracted["given_names"]:
        extracted["name"] = f"{extracted['surname']} {extracted['given_names']}"
    elif extracted["surname"]:
        extracted["name"] = extracted["surname"]

    # 4. Date of Birth
    for i, line in enumerate(lines):
        if re.search(r'Date\s*of\s*Birth|DOB|Birth\s*Date|Date\s*de\s*naissance', line, re.IGNORECASE):
            m = re.search(r'(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})', line)
            if m:
                extracted["date_of_birth"] = m.group(1)
                break
            elif i + 1 < len(lines):
                m_next = re.search(r'(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})', lines[i+1])
                if m_next:
                    extracted["date_of_birth"] = m_next.group(1)
                    break

    # 5. Expiration Date
    for i, line in enumerate(lines):
        if re.search(r'Expiry|Expiration|Valid\s*Until|Date\s*d\'expiration', line, re.IGNORECASE):
            m = re.search(r'(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})', line)
            if m:
                extracted["expiration_date"] = m.group(1)
                break
            elif i + 1 < len(lines):
                m_next = re.search(r'(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})', lines[i+1])
                if m_next:
                    extracted["expiration_date"] = m_next.group(1)
                    break

    # 6. Issuing Country
    if re.search(r'UTOPIA|UTO\b', full_clean_text, re.IGNORECASE):
        extracted["issuing_country"] = "UTO"
    elif re.search(r'UNITED\s*STATES|USA\b', full_clean_text, re.IGNORECASE):
        extracted["issuing_country"] = "USA"

    # 7. Document Type
    if re.search(r'PASSPORT|PASSEPORT', full_clean_text, re.IGNORECASE):
        extracted["document_type"] = "PASSPORT"
    elif re.search(r'IDENTITY\s*CARD|ID\s*CARD', full_clean_text, re.IGNORECASE):
        extracted["document_type"] = "NATIONAL_ID"

    return extracted

def perform_ocr(image_path: str) -> OCRExtractionResult:
    """Run full OCR pipeline on ID document image."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")

    preprocessed = preprocess_for_ocr(img)

    try:
        data = pytesseract.image_to_data(preprocessed, output_type=pytesseract.Output.DICT, config=r'--oem 3 --psm 3')
        confidences = [int(c) for c in data['conf'] if str(c).isdigit() and int(c) >= 0]
        avg_confidence = float(np.mean(confidences)) if confidences else 85.0

        full_text = pytesseract.image_to_string(preprocessed, config=r'--oem 3 --psm 3')
        if len(full_text.strip()) < 40:
            full_text = pytesseract.image_to_string(preprocessed, config=r'--oem 3 --psm 6')
    except Exception as e:
        pil_img = Image.fromarray(cv2.cvtColor(preprocessed, cv2.COLOR_GRAY2RGB))
        full_text = pytesseract.image_to_string(pil_img)
        avg_confidence = 75.0

    parsed = extract_ocr_fields(full_text)

    extracted_count = sum(1 for v in [parsed["name"], parsed["date_of_birth"], parsed["document_number"], parsed["expiration_date"]] if v is not None)

    return OCRExtractionResult(
        full_text=full_text,
        name=parsed.get("name"),
        surname=parsed.get("surname"),
        given_names=parsed.get("given_names"),
        date_of_birth=parsed.get("date_of_birth"),
        document_number=parsed.get("document_number"),
        expiration_date=parsed.get("expiration_date"),
        issuing_country=parsed.get("issuing_country"),
        document_type=parsed.get("document_type"),
        confidence_score=round(avg_confidence, 2),
        extracted_fields_count=extracted_count
    )
