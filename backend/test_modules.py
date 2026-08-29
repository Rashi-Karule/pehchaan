import unittest
import os
import cv2
import numpy as np

from modules.mrz_validator import calculate_check_digit, parse_mrz, parse_td3
from modules.ocr_extractor import extract_ocr_fields
from modules.tampering_detector import compute_ela, compute_copy_move, generate_tampering_heatmap
from modules.face_verifier import face_engine
from modules.risk_engine import evaluate_risk
from models import MRZValidationResult, OCRExtractionResult, TamperingDetectionResult, FaceVerificationResult, ConsistencyCheck

class TestPehchaanBackend(unittest.TestCase):
    def test_icao_check_digit(self):
        # ICAO 9303 7-3-1 weighting test:
        # Example document number 'L898902C3'
        # L(21)*7 + 8*3 + 9*1 + 8*7 + 9*3 + 0*1 + 2*7 + C(12)*3 + 3*1
        # = 147 + 24 + 9 + 56 + 27 + 0 + 14 + 36 + 3 = 316 -> 316 % 10 = 6
        cd = calculate_check_digit("L898902C3")
        self.assertEqual(cd, "6")

        # DOB 880614 -> 8*7 + 8*3 + 0*1 + 6*7 + 1*3 + 4*1 = 56 + 24 + 0 + 42 + 3 + 4 = 129 -> 9
        cd_dob = calculate_check_digit("880614")
        self.assertEqual(cd_dob, "9")

    def test_td3_mrz_parsing(self):
        line1 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<"
        line2 = "L898902C36UTO8806149F3111204<<<<<<<<<<<<<<02"
        res = parse_td3(line1, line2)
        self.assertTrue(res.has_mrz)
        self.assertEqual(res.document_number, "L898902C3")
        self.assertEqual(res.surname, "ERIKSSON")
        self.assertEqual(res.given_names, "ANNA MARIA")
        self.assertEqual(res.country_code, "UTO")
        self.assertEqual(res.sex, "F")
        self.assertTrue(res.check_digits[0].valid) # doc num cd
        self.assertTrue(res.check_digits[1].valid) # dob cd

    def test_tampering_differentiation(self):
        # Generate genuine vs manipulated image
        h, w = 300, 400
        genuine = np.full((h, w, 3), 200, dtype=np.uint8)
        cv2.circle(genuine, (100, 100), 40, (50, 100, 150), -1)
        cv2.imwrite("test_genuine.jpg", genuine, [cv2.IMWRITE_JPEG_QUALITY, 90])

        manipulated = genuine.copy()
        # Paste a cloned stamp and uncompressed patch
        stamp = manipulated[60:140, 60:140].copy()
        manipulated[160:240, 260:340] = stamp
        cv2.putText(manipulated, "FAKE", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.imwrite("test_manipulated.jpg", manipulated)

        # Run ELA and Copy-Move
        res_gen = generate_tampering_heatmap("test_genuine.jpg", "test_gen_heatmap.png")
        res_man = generate_tampering_heatmap("test_manipulated.jpg", "test_man_heatmap.png")

        print(f"\nGenuine Tampering Score: {res_gen.tampering_score}")
        print(f"Manipulated Tampering Score: {res_man.tampering_score}")
        
        # Verify manipulated has higher tampering score than genuine
        self.assertGreater(res_man.tampering_score, res_gen.tampering_score)

        # Clean up
        for f in ["test_genuine.jpg", "test_manipulated.jpg", "test_gen_heatmap.png", "test_man_heatmap.png"]:
            if os.path.exists(f): os.remove(f)

if __name__ == '__main__':
    unittest.main()
