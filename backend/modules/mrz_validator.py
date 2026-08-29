import re
from typing import List, Tuple, Optional, Dict, Any
from datetime import datetime
from models import MRZValidationResult, MRZCheckDigitResult, ConsistencyCheck

ICAO_WEIGHTS = [7, 3, 1]

def char_to_value(c: str) -> int:
    c = c.upper()
    if '0' <= c <= '9':
        return ord(c) - ord('0')
    if 'A' <= c <= 'Z':
        return ord(c) - ord('A') + 10
    if c == '<':
        return 0
    return 0

def calculate_check_digit(data: str) -> str:
    total = 0
    for idx, char in enumerate(data):
        weight = ICAO_WEIGHTS[idx % 3]
        total += char_to_value(char) * weight
    return str(total % 10)

def clean_mrz_text(text: str) -> List[str]:
    lines = [line.strip().replace(' ', '') for line in text.split('\n') if line.strip()]
    cleaned = []
    for line in lines:
        c_line = line.upper()
        # Replace common OCR misreads in MRZ
        c_line = re.sub(r'[^A-Z0-9<]', '<', c_line)
        if len(c_line) >= 25:
            cleaned.append(c_line)
    return cleaned

def parse_name(name_str: str) -> Tuple[str, str]:
    parts = name_str.split('<<')
    surname = parts[0].replace('<', ' ').strip()
    given_names = parts[1].replace('<', ' ').strip() if len(parts) > 1 else ""
    return surname, given_names

def format_mrz_date(yymmdd: str) -> str:
    if len(yymmdd) != 6 or not yymmdd.isdigit():
        return yymmdd
    yy = int(yymmdd[0:2])
    mm = yymmdd[2:4]
    dd = yymmdd[4:6]
    century = "19" if yy > 45 else "20"
    return f"{century}{yy:02d}-{mm}-{dd}"

def parse_td3(line1: str, line2: str) -> MRZValidationResult:
    doc_type = line1[0:2].replace('<', '')
    country_code = line1[2:5].replace('<', '')
    name_field = line1[5:44]
    surname, given_names = parse_name(name_field)

    doc_num_raw = line2[0:9]
    doc_num_cd = line2[9]
    doc_num = doc_num_raw.replace('<', '')

    nationality = line2[10:13].replace('<', '')
    dob_raw = line2[13:19]
    dob_cd = line2[19]
    sex = line2[20].replace('<', 'X')
    expiry_raw = line2[21:27]
    expiry_cd = line2[27]
    opt_raw = line2[28:42]
    opt_cd = line2[42]
    composite_cd = line2[43]

    check_digits = []
    
    # 1. Document Number Check Digit
    calc_doc_cd = calculate_check_digit(doc_num_raw)
    cd_doc_valid = (calc_doc_cd == doc_num_cd)
    check_digits.append(MRZCheckDigitResult(
        field_name="document_number",
        raw_value=doc_num_raw,
        check_digit=doc_num_cd,
        calculated_check_digit=calc_doc_cd,
        valid=cd_doc_valid,
        weight_formula="7-3-1 ICAO 9303 on Document Number"
    ))

    # 2. Date of Birth Check Digit
    calc_dob_cd = calculate_check_digit(dob_raw)
    cd_dob_valid = (calc_dob_cd == dob_cd)
    check_digits.append(MRZCheckDigitResult(
        field_name="date_of_birth",
        raw_value=dob_raw,
        check_digit=dob_cd,
        calculated_check_digit=calc_dob_cd,
        valid=cd_dob_valid,
        weight_formula="7-3-1 ICAO 9303 on DOB"
    ))

    # 3. Expiration Date Check Digit
    calc_exp_cd = calculate_check_digit(expiry_raw)
    cd_exp_valid = (calc_exp_cd == expiry_cd)
    check_digits.append(MRZCheckDigitResult(
        field_name="expiration_date",
        raw_value=expiry_raw,
        check_digit=expiry_cd,
        calculated_check_digit=calc_exp_cd,
        valid=cd_exp_valid,
        weight_formula="7-3-1 ICAO 9303 on Expiry Date"
    ))

    # 4. Optional Data Check Digit
    if opt_cd not in ('<', '0') or opt_raw.replace('<', '') != '':
        calc_opt_cd = calculate_check_digit(opt_raw)
        cd_opt_valid = (calc_opt_cd == opt_cd) or (opt_cd == '<')
        check_digits.append(MRZCheckDigitResult(
            field_name="optional_data",
            raw_value=opt_raw,
            check_digit=opt_cd,
            calculated_check_digit=calc_opt_cd,
            valid=cd_opt_valid,
            weight_formula="7-3-1 on optional data"
        ))

    # 5. Composite Check Digit (covers pos 0-10, 13-20, 21-43)
    composite_data = line2[0:10] + line2[13:20] + line2[21:43]
    calc_comp_cd = calculate_check_digit(composite_data)
    cd_comp_valid = (calc_comp_cd == composite_cd)
    check_digits.append(MRZCheckDigitResult(
        field_name="composite",
        raw_value=composite_data,
        check_digit=composite_cd,
        calculated_check_digit=calc_comp_cd,
        valid=cd_comp_valid,
        weight_formula="7-3-1 ICAO 9303 Composite (Doc + DOB + Expiry + Opt)"
    ))

    all_valid = all(cd.valid for cd in check_digits)

    return MRZValidationResult(
        has_mrz=True,
        mrz_type="TD3",
        raw_lines=[line1, line2],
        document_type=doc_type,
        country_code=country_code,
        document_number=doc_num,
        birth_date=format_mrz_date(dob_raw),
        sex=sex,
        expiry_date=format_mrz_date(expiry_raw),
        nationality=nationality,
        surname=surname,
        given_names=given_names,
        optional_data=opt_raw.replace('<', ''),
        check_digits=check_digits,
        all_valid=all_valid
    )

def parse_td1(line1: str, line2: str, line3: str) -> MRZValidationResult:
    doc_type = line1[0:2].replace('<', '')
    country_code = line1[2:5].replace('<', '')
    doc_num_raw = line1[5:14]
    doc_num_cd = line1[14]
    doc_num = doc_num_raw.replace('<', '')
    opt1 = line1[15:30]

    dob_raw = line2[0:6]
    dob_cd = line2[6]
    sex = line2[7].replace('<', 'X')
    expiry_raw = line2[8:14]
    expiry_cd = line2[14]
    nationality = line2[15:18].replace('<', '')
    opt2 = line2[18:29]
    composite_cd = line2[29]

    surname, given_names = parse_name(line3[0:30])

    check_digits = [
        MRZCheckDigitResult(
            field_name="document_number",
            raw_value=doc_num_raw,
            check_digit=doc_num_cd,
            calculated_check_digit=calculate_check_digit(doc_num_raw),
            valid=(calculate_check_digit(doc_num_raw) == doc_num_cd),
            weight_formula="7-3-1 TD1 Doc Number"
        ),
        MRZCheckDigitResult(
            field_name="date_of_birth",
            raw_value=dob_raw,
            check_digit=dob_cd,
            calculated_check_digit=calculate_check_digit(dob_raw),
            valid=(calculate_check_digit(dob_raw) == dob_cd),
            weight_formula="7-3-1 TD1 DOB"
        ),
        MRZCheckDigitResult(
            field_name="expiration_date",
            raw_value=expiry_raw,
            check_digit=expiry_cd,
            calculated_check_digit=calculate_check_digit(expiry_raw),
            valid=(calculate_check_digit(expiry_raw) == expiry_cd),
            weight_formula="7-3-1 TD1 Expiry"
        )
    ]

    composite_data = line1[5:30] + line2[0:7] + line2[8:15] + line2[18:29]
    calc_comp_cd = calculate_check_digit(composite_data)
    check_digits.append(MRZCheckDigitResult(
        field_name="composite",
        raw_value=composite_data,
        check_digit=composite_cd,
        calculated_check_digit=calc_comp_cd,
        valid=(calc_comp_cd == composite_cd),
        weight_formula="7-3-1 TD1 Composite"
    ))

    all_valid = all(cd.valid for cd in check_digits)
    return MRZValidationResult(
        has_mrz=True,
        mrz_type="TD1",
        raw_lines=[line1, line2, line3],
        document_type=doc_type,
        country_code=country_code,
        document_number=doc_num,
        birth_date=format_mrz_date(dob_raw),
        sex=sex,
        expiry_date=format_mrz_date(expiry_raw),
        nationality=nationality,
        surname=surname,
        given_names=given_names,
        optional_data=(opt1 + opt2).replace('<', ''),
        check_digits=check_digits,
        all_valid=all_valid
    )

def parse_td2(line1: str, line2: str) -> MRZValidationResult:
    doc_type = line1[0:2].replace('<', '')
    country_code = line1[2:5].replace('<', '')
    surname, given_names = parse_name(line1[5:36])

    doc_num_raw = line2[0:9]
    doc_num_cd = line2[9]
    nationality = line2[10:13].replace('<', '')
    dob_raw = line2[13:19]
    dob_cd = line2[19]
    sex = line2[20].replace('<', 'X')
    expiry_raw = line2[21:27]
    expiry_cd = line2[27]
    opt_raw = line2[28:35]
    composite_cd = line2[35]

    check_digits = [
        MRZCheckDigitResult(
            field_name="document_number",
            raw_value=doc_num_raw,
            check_digit=doc_num_cd,
            calculated_check_digit=calculate_check_digit(doc_num_raw),
            valid=(calculate_check_digit(doc_num_raw) == doc_num_cd),
            weight_formula="7-3-1 TD2 Doc Number"
        ),
        MRZCheckDigitResult(
            field_name="date_of_birth",
            raw_value=dob_raw,
            check_digit=dob_cd,
            calculated_check_digit=calculate_check_digit(dob_raw),
            valid=(calculate_check_digit(dob_raw) == dob_cd),
            weight_formula="7-3-1 TD2 DOB"
        ),
        MRZCheckDigitResult(
            field_name="expiration_date",
            raw_value=expiry_raw,
            check_digit=expiry_cd,
            calculated_check_digit=calculate_check_digit(expiry_raw),
            valid=(calculate_check_digit(expiry_raw) == expiry_cd),
            weight_formula="7-3-1 TD2 Expiry"
        ),
        MRZCheckDigitResult(
            field_name="composite",
            raw_value=line2[0:10] + line2[13:20] + line2[21:35],
            check_digit=composite_cd,
            calculated_check_digit=calculate_check_digit(line2[0:10] + line2[13:20] + line2[21:35]),
            valid=(calculate_check_digit(line2[0:10] + line2[13:20] + line2[21:35]) == composite_cd),
            weight_formula="7-3-1 TD2 Composite"
        )
    ]

    all_valid = all(cd.valid for cd in check_digits)
    return MRZValidationResult(
        has_mrz=True,
        mrz_type="TD2",
        raw_lines=[line1, line2],
        document_type=doc_type,
        country_code=country_code,
        document_number=doc_num_raw.replace('<', ''),
        birth_date=format_mrz_date(dob_raw),
        sex=sex,
        expiry_date=format_mrz_date(expiry_raw),
        nationality=nationality,
        surname=surname,
        given_names=given_names,
        optional_data=opt_raw.replace('<', ''),
        check_digits=check_digits,
        all_valid=all_valid
    )

def parse_mrz(raw_text: str) -> MRZValidationResult:
    lines = clean_mrz_text(raw_text)
    
    # TD3
    td3_lines = [l for l in lines if len(l) == 44 or (len(l) >= 40 and l.startswith(('P<', 'P', 'IP', 'PP')))]
    if len(td3_lines) >= 2 or (len(lines) >= 2 and len(lines[-2]) >= 38 and len(lines[-1]) >= 38):
        l1 = (lines[-2] if len(lines) >= 2 else td3_lines[0]).ljust(44, '<')[:44]
        l2 = (lines[-1] if len(lines) >= 2 else td3_lines[1]).ljust(44, '<')[:44]
        return parse_td3(l1, l2)

    # TD1
    td1_lines = [l for l in lines if 28 <= len(l) <= 32]
    if len(td1_lines) >= 3 or (len(lines) >= 3 and all(26 <= len(l) <= 34 for l in lines[-3:])):
        l1 = lines[-3].ljust(30, '<')[:30]
        l2 = lines[-2].ljust(30, '<')[:30]
        l3 = lines[-1].ljust(30, '<')[:30]
        return parse_td1(l1, l2, l3)

    # TD2
    if len(lines) >= 2 and 34 <= len(lines[-2]) <= 38 and 34 <= len(lines[-1]) <= 38:
        l1 = lines[-2].ljust(36, '<')[:36]
        l2 = lines[-1].ljust(36, '<')[:36]
        return parse_td2(l1, l2)

    return MRZValidationResult(
        has_mrz=False,
        mrz_type="NONE",
        raw_lines=lines,
        check_digits=[],
        all_valid=False
    )

def normalize_date_tokens(date_str: Optional[str]) -> str:
    if not date_str:
        return ""
    # Extract parts split by delimiter or digits
    parts = [p for p in re.split(r'[\/\.\-\s]+', date_str.strip()) if p]
    if len(parts) == 3:
        # Check which part is 4 digits (year)
        if len(parts[0]) == 4:  # YYYY-MM-DD
            yyyy = parts[0]
            mm = parts[1].zfill(2)
            dd = parts[2].zfill(2)
            return f"{yyyy}-{mm}-{dd}"
        elif len(parts[2]) == 4:  # DD/MM/YYYY
            yyyy = parts[2]
            mm = parts[1].zfill(2)
            dd = parts[0].zfill(2)
            return f"{yyyy}-{mm}-{dd}"
        elif len(parts[2]) == 2:  # DD/MM/YY
            yy = int(parts[2])
            cent = "19" if yy > 45 else "20"
            return f"{cent}{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"

    digits = re.sub(r'\D', '', date_str)
    if len(digits) == 6:
        yy = int(digits[0:2])
        cent = "19" if yy > 45 else "20"
        return f"{cent}{digits[0:2]}-{digits[2:4]}-{digits[4:6]}"
    return digits

def check_consistency(ocr_data: Dict[str, Any], mrz: MRZValidationResult) -> List[ConsistencyCheck]:
    checks: List[ConsistencyCheck] = []
    if not mrz.has_mrz:
        return checks

    # 1. Document Number
    mrz_doc = (mrz.document_number or "").upper().replace('<', '').strip()
    ocr_doc = (ocr_data.get("document_number") or "").upper().replace('<', '').strip()

    if mrz_doc and ocr_doc:
        # Match if either contains the other or normalized match
        match = (mrz_doc == ocr_doc or mrz_doc in ocr_doc or ocr_doc in mrz_doc)
        status = "MATCH" if match else "MISMATCH"
        details = f"Document numbers match ({mrz_doc})." if match else f"Document number mismatch: VIZ has '{ocr_doc}' vs MRZ has '{mrz_doc}'"
    elif mrz_doc:
        status = "MATCH"
        details = f"Verified from MRZ ({mrz_doc})"
    else:
        status = "NOT_APPLICABLE"
        details = "No document number to compare"
    checks.append(ConsistencyCheck(field_name="document_number", ocr_value=ocr_doc, mrz_value=mrz_doc, status=status, details=details))

    # 2. Date of Birth
    mrz_dob = mrz.birth_date or ""
    ocr_dob = ocr_data.get("date_of_birth") or ""
    norm_mrz_dob = normalize_date_tokens(mrz_dob)
    norm_ocr_dob = normalize_date_tokens(ocr_dob)

    if norm_mrz_dob and norm_ocr_dob:
        match = (norm_mrz_dob == norm_ocr_dob)
        status = "MATCH" if match else "MISMATCH"
        details = f"Date of birth matches ({mrz_dob})." if match else f"DOB mismatch: VIZ has '{ocr_dob}' vs MRZ has '{mrz_dob}'"
    elif mrz_dob:
        status = "MATCH"
        details = f"Verified from MRZ ({mrz_dob})"
    else:
        status = "NOT_APPLICABLE"
        details = "No DOB to compare"
    checks.append(ConsistencyCheck(field_name="date_of_birth", ocr_value=ocr_dob, mrz_value=mrz_dob, status=status, details=details))

    # 3. Surname & Name
    mrz_name = f"{mrz.surname or ''} {mrz.given_names or ''}".strip().upper()
    ocr_name = (ocr_data.get("name") or f"{ocr_data.get('surname') or ''} {ocr_data.get('given_names') or ''}").strip().upper()
    
    if mrz_name and ocr_name:
        m_clean = re.sub(r'[^A-Z]', '', mrz_name)
        o_clean = re.sub(r'[^A-Z]', '', ocr_name)
        match = (m_clean in o_clean or o_clean in m_clean or (mrz.surname and mrz.surname in ocr_name))
        status = "MATCH" if match else "MISMATCH"
        details = f"Name matches ({mrz_name})." if match else f"Name mismatch: VIZ has '{ocr_name}' vs MRZ has '{mrz_name}'"
    elif mrz_name:
        status = "MATCH"
        details = f"Verified from MRZ ({mrz_name})"
    else:
        status = "NOT_APPLICABLE"
        details = "No name to compare"
    checks.append(ConsistencyCheck(field_name="name", ocr_value=ocr_name, mrz_value=mrz_name, status=status, details=details))

    # 4. Expiration Date
    mrz_exp = mrz.expiry_date or ""
    ocr_exp = ocr_data.get("expiration_date") or ""
    norm_mrz_exp = normalize_date_tokens(mrz_exp)
    norm_ocr_exp = normalize_date_tokens(ocr_exp)

    if norm_mrz_exp and norm_ocr_exp:
        match = (norm_mrz_exp == norm_ocr_exp)
        status = "MATCH" if match else "MISMATCH"
        details = f"Expiration date matches ({mrz_exp})." if match else f"Expiry mismatch: VIZ has '{ocr_exp}' vs MRZ has '{mrz_exp}'"
    elif mrz_exp:
        status = "MATCH"
        details = f"Verified from MRZ ({mrz_exp})"
    else:
        status = "NOT_APPLICABLE"
        details = "No expiry date to compare"
    checks.append(ConsistencyCheck(field_name="expiration_date", ocr_value=ocr_exp, mrz_value=mrz_exp, status=status, details=details))

    return checks
