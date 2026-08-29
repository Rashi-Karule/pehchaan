import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from modules.mrz_validator import calculate_check_digit

def get_font(size: int, bold: bool = False, mono: bool = False):
    font_paths = [
        "/System/Library/Fonts/Supplemental/Courier New.ttf" if mono else None,
        "/System/Library/Fonts/Menlo.ttc" if mono else None,
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else None,
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc"
    ]
    for p in font_paths:
        if p and os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_sample_face(is_primary: bool = True, seed: int = 42) -> np.ndarray:
    """Generate a clean synthetic portrait face for biometric testing."""
    np.random.seed(seed)
    h, w = 320, 260
    img = np.full((h, w, 3), (240, 240, 245), dtype=np.uint8)

    # Background gradient
    for y in range(h):
        img[y, :] = (235 - int(y * 0.1), 240 - int(y * 0.05), 248)

    # Head oval
    skin_color = (195, 215, 240) if is_primary else (180, 205, 235)
    cv2.ellipse(img, (130, 160), (70, 95), 0, 0, 360, skin_color, -1)
    
    # Neck & Shoulders
    cv2.rectangle(img, (100, 240), (160, 320), skin_color, -1)
    cv2.ellipse(img, (130, 320), (110, 60), 0, 0, 360, (60, 70, 90) if is_primary else (100, 50, 40), -1)

    # Hair
    hair_color = (30, 40, 55) if is_primary else (40, 65, 95)
    cv2.ellipse(img, (130, 105), (75, 45), 0, 0, 360, hair_color, -1)
    cv2.rectangle(img, (55, 105), (205, 160), hair_color, -1)
    cv2.ellipse(img, (130, 150), (68, 85), 0, 0, 360, skin_color, -1)

    # Eyes
    eye_y = 150
    cv2.circle(img, (100, eye_y), 9, (255, 255, 255), -1)
    cv2.circle(img, (160, eye_y), 9, (255, 255, 255), -1)
    cv2.circle(img, (100, eye_y), 4, (60, 40, 20), -1)
    cv2.circle(img, (160, eye_y), 4, (60, 40, 20), -1)

    # Eyebrows
    cv2.line(img, (88, eye_y - 12), (112, eye_y - 12), hair_color, 3)
    cv2.line(img, (148, eye_y - 12), (172, eye_y - 12), hair_color, 3)

    # Nose
    cv2.line(img, (130, eye_y), (130, 185), (160, 180, 205), 2)
    cv2.line(img, (122, 185), (138, 185), (160, 180, 205), 2)

    # Mouth
    cv2.ellipse(img, (130, 210), (22, 7), 0, 0, 180, (90, 100, 190), -1)

    return img

def create_id_document(
    filename: str,
    surname: str,
    given_names: str,
    doc_num: str,
    dob_yymmdd: str,
    exp_yymmdd: str,
    sex: str = "F",
    country: str = "UTO",
    tamper_type: str = "none" # "none", "copy_move_and_ela", "mrz_corrupt"
) -> str:
    """Generate an official border ID document image with visual text, security guilloche, portrait, and ICAO 9303 MRZ."""
    width, height = 960, 640
    doc = np.full((height, width, 3), 255, dtype=np.uint8)

    # Security guilloche background
    for y in range(height):
        r = int(244 + 6 * np.sin(y / 18.0))
        g = int(247 + 5 * np.cos(y / 14.0))
        b = int(252 + 3 * np.sin(y / 25.0))
        doc[y, :] = (b, g, r)

    # Outer decorative frame
    cv2.rectangle(doc, (15, 15), (width - 15, height - 15), (180, 190, 205), 2)
    cv2.rectangle(doc, (20, 20), (width - 20, height - 20), (140, 160, 180), 1)

    # Header Bar
    cv2.rectangle(doc, (25, 25), (width - 25, 90), (35, 55, 100), -1)
    
    # Portrait Photo
    portrait = create_sample_face(is_primary=(tamper_type != "face_mismatch"), seed=42)
    target_pw, target_ph = 210, 260
    portrait_resized = cv2.resize(portrait, (target_pw, target_ph))
    doc[125:125+target_ph, 45:45+target_pw] = portrait_resized
    cv2.rectangle(doc, (45, 125), (45+target_pw, 125+target_ph), (80, 100, 130), 2)

    # Security Stamp / Seal on portrait
    stamp_center = (45 + target_pw - 20, 125 + target_ph - 30)
    cv2.circle(doc, stamp_center, 38, (160, 80, 40), 3)
    cv2.putText(doc, "BORDER", (stamp_center[0] - 28, stamp_center[1] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (160, 80, 40), 1)
    cv2.putText(doc, "AUTH", (stamp_center[0] - 22, stamp_center[1] + 12), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (160, 80, 40), 1)

    # Convert to PIL for crisp typography
    pil_img = Image.fromarray(cv2.cvtColor(doc, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    f_title = get_font(24, bold=True)
    f_sub = get_font(13, bold=False)
    f_label = get_font(12, bold=False)
    f_val = get_font(18, bold=True)
    f_mrz = get_font(21, mono=True, bold=True)

    # Header text
    draw.text((45, 38), f"STATE OF {country} — OFFICIAL PASSPORT", fill=(255, 255, 255), font=f_title)
    draw.text((width - 320, 45), "PASSEPORT / TRAVEL DOCUMENT", fill=(210, 225, 255), font=f_sub)

    # Formatted Dates
    yy_b = int(dob_yymmdd[0:2])
    cent_b = "19" if yy_b > 45 else "20"
    dob_formatted = f"{dob_yymmdd[4:6]}/{dob_yymmdd[2:4]}/{cent_b}{yy_b:02d}"

    yy_e = int(exp_yymmdd[0:2])
    cent_e = "19" if yy_e > 45 else "20"
    exp_formatted = f"{exp_yymmdd[4:6]}/{exp_yymmdd[2:4]}/{cent_e}{yy_e:02d}"

    # Visual Inspection Zone (VIZ) Fields
    fields_x = 295
    start_y = 125
    gap = 46

    def draw_viz_field(label: str, value: str, y: int):
        draw.text((fields_x, y), label.upper(), fill=(100, 110, 130), font=f_label)
        draw.text((fields_x, y + 17), value.upper(), fill=(15, 20, 35), font=f_val)

    draw_viz_field("Type / Code", f"P / {country}", start_y)
    draw_viz_field("Passport No / Document Number", doc_num, start_y + gap)
    draw_viz_field("Surname / Nom", surname, start_y + gap * 2)
    draw_viz_field("Given Names / Prenoms", given_names, start_y + gap * 3)
    draw_viz_field("Date of Birth / Date de naissance", dob_formatted, start_y + gap * 4)
    draw_viz_field("Sex / Sexe", sex, start_y + gap * 5)
    draw_viz_field("Expiration Date / Date d'expiration", exp_formatted, start_y + gap * 6)

    # Calculate exact ICAO 9303 TD3 Check Digits
    name_combined = f"{surname.upper()}<<{given_names.upper()}".replace(' ', '<')
    mrz_line1 = f"P<{country}{name_combined}".ljust(44, '<')[:44]

    doc_cd = calculate_check_digit(doc_num)
    dob_cd = calculate_check_digit(dob_yymmdd)
    exp_cd = calculate_check_digit(exp_yymmdd)
    opt_raw = "<<<<<<<<<<<<<<"
    opt_cd = "<"

    if tamper_type == "mrz_corrupt":
        doc_cd = "9" if doc_cd != "9" else "8"
        dob_cd = "5" if dob_cd != "5" else "4"

    # Line 2: doc_num(9) + doc_cd(1) + country(3) + dob(6) + dob_cd(1) + sex(1) + exp(6) + exp_cd(1) + opt(14) + opt_cd(1) + comp_cd(1) = 44 chars
    line2_prefix = f"{doc_num.ljust(9, '<')[:9]}{doc_cd}{country}{dob_yymmdd}{dob_cd}{sex}{exp_yymmdd}{exp_cd}{opt_raw}{opt_cd}"
    # Composite check covers pos 0-10, 13-20, 21-43
    comp_data = line2_prefix[0:10] + line2_prefix[13:20] + line2_prefix[21:43]
    comp_cd = calculate_check_digit(comp_data)
    mrz_line2 = line2_prefix + comp_cd

    # Draw MRZ Box
    mrz_bg_y = height - 125
    draw.rectangle([(25, mrz_bg_y), (width - 25, height - 25)], fill=(238, 241, 248), outline=(180, 190, 205), width=1)
    draw.text((40, mrz_bg_y + 22), mrz_line1, fill=(20, 20, 30), font=f_mrz)
    draw.text((40, mrz_bg_y + 64), mrz_line2, fill=(20, 20, 30), font=f_mrz)

    # Convert back to OpenCV
    doc = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    # Apply Tampering if requested
    if tamper_type == "copy_move_and_ela":
        # 1. Copy-Move Forgery: Clone the security stamp from the portrait to the right side of the document
        stamp_patch = doc[125+target_ph-75:125+target_ph+15, 45+target_pw-65:45+target_pw+25].copy()
        sh, sw = stamp_patch.shape[:2]
        dest_y, dest_x = 240, 700
        doc[dest_y:dest_y+sh, dest_x:dest_x+sw] = stamp_patch

        # Also clone a number patch
        num_patch = doc[start_y+gap:start_y+gap+35, fields_x:fields_x+110].copy()
        nh, nw = num_patch.shape[:2]
        doc[360:360+nh, 680:680+nw] = num_patch

        # 2. ELA Anomaly: Paste an uncompressed synthetic patch
        spliced_box = np.full((55, 190, 3), (225, 240, 255), dtype=np.uint8)
        cv2.putText(spliced_box, "VIP CLEARANCE", (12, 36), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (180, 20, 20), 2)
        doc[420:475, 680:870] = spliced_box

    # Save final image
    cv2.imwrite(filename, doc)
    return filename

def seed_sample_data(uploads_dir: str):
    """Seed sample test documents and traveler selfies."""
    os.makedirs(uploads_dir, exist_ok=True)

    # 1. Genuine Case
    p1 = os.path.join(uploads_dir, "sample_genuine_passport.jpg")
    create_id_document(
        filename=p1,
        surname="ERIKSSON",
        given_names="ANNA MARIA",
        doc_num="L898902C3",
        dob_yymmdd="880614",
        exp_yymmdd="311120",
        sex="F",
        country="UTO",
        tamper_type="none"
    )

    # Matching Selfie for Anna
    s1 = os.path.join(uploads_dir, "sample_selfie_anna.jpg")
    selfie_anna = create_sample_face(is_primary=True, seed=42)
    selfie_anna = cv2.GaussianBlur(selfie_anna, (3, 3), 0)
    cv2.imwrite(s1, selfie_anna)

    # 2. Tampered Document Case (Copy-Move Stamp & Spliced text)
    p2 = os.path.join(uploads_dir, "sample_tampered_passport.jpg")
    create_id_document(
        filename=p2,
        surname="KOWALSKI",
        given_names="JAN PIOTR",
        doc_num="P948210X5",
        dob_yymmdd="820419",
        exp_yymmdd="300815",
        sex="M",
        country="UTO",
        tamper_type="copy_move_and_ela"
    )

    # 3. Corrupted MRZ Checksum Failure Case
    p3 = os.path.join(uploads_dir, "sample_invalid_mrz_passport.jpg")
    create_id_document(
        filename=p3,
        surname="VANCE",
        given_names="ROBERT",
        doc_num="N12345678",
        dob_yymmdd="900101",
        exp_yymmdd="280512",
        sex="M",
        country="UTO",
        tamper_type="mrz_corrupt"
    )

    # 4. Mismatching Selfie (Traveler is someone else)
    s2 = os.path.join(uploads_dir, "sample_selfie_mismatch.jpg")
    selfie_other = create_sample_face(is_primary=False, seed=99)
    cv2.imwrite(s2, selfie_other)

    print(f"[Seed] Successfully generated realistic test cases in {uploads_dir}")
