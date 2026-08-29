import os
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

def test_demo_samples_and_flow():
    # 1. Get demo samples
    res = client.get("/api/demo/samples")
    assert res.status_code == 200
    samples = res.json()
    assert len(samples) >= 4

    # 2. Load Genuine Sample
    res_load = client.post("/api/demo/load/sample_genuine")
    assert res_load.status_code == 200
    load_data = res_load.json()
    doc_id = load_data["documentId"]
    assert "previewUrl" in load_data

    # 3. Analyze Genuine Document
    res_analyze = client.post("/api/documents/analyze", json={"documentId": doc_id})
    assert res_analyze.status_code == 200
    analysis = res_analyze.json()

    print("\n--- ANALYSIS RESULT FOR GENUINE CASE ---")
    print(f"Case ID: {analysis['case_id']}")
    print(f"OCR Extracted Name: {analysis['ocr']['name']}")
    print(f"OCR Extracted Doc #: {analysis['ocr']['document_number']}")
    print(f"MRZ Valid: {analysis['mrz']['all_valid']}, Type: {analysis['mrz']['mrz_type']}")
    print(f"MRZ Surname: {analysis['mrz']['surname']}, Given: {analysis['mrz']['given_names']}")
    print(f"Tampering Score: {analysis['tampering']['tampering_score']}")
    print(f"Face Match: {analysis['face_verification']['match_score']}% (Is Match: {analysis['face_verification']['is_match']})")
    print(f"Risk Score: {analysis['risk']['overall_score']} - Level: {analysis['risk']['risk_level']}")
    print(f"Risk Explanation: {analysis['risk']['plain_english_explanation']}")

    assert analysis["case_id"] == doc_id
    assert analysis["ocr"]["name"] is not None or analysis["mrz"]["surname"] is not None
    assert analysis["risk"]["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    # 4. Officer Review
    res_review = client.post(f"/api/review/{doc_id}", json={
        "decision": "CONFIRMED",
        "notes": "Verified at Border Terminal A-3. Identity authentic."
    })
    assert res_review.status_code == 200
    review_data = res_review.json()
    assert review_data["review_status"] == "CONFIRMED"

    # 5. Fetch updated analysis
    res_get = client.get(f"/api/documents/{doc_id}")
    assert res_get.status_code == 200
    updated_analysis = res_get.json()
    assert updated_analysis["review_status"] == "CONFIRMED"
    assert updated_analysis["officer_notes"] == "Verified at Border Terminal A-3. Identity authentic."

def test_tampered_document_flow():
    res_load = client.post("/api/demo/load/sample_tampered")
    assert res_load.status_code == 200
    doc_id = res_load.json()["documentId"]

    res_analyze = client.post("/api/documents/analyze", json={"documentId": doc_id})
    assert res_analyze.status_code == 200
    analysis = res_analyze.json()
    print("\n--- ANALYSIS RESULT FOR TAMPERED CASE ---")
    print(f"Tampering Score: {analysis['tampering']['tampering_score']}")
    print(f"Risk Score: {analysis['risk']['overall_score']} - Level: {analysis['risk']['risk_level']}")
    print(f"Cloned Regions: {analysis['tampering']['cloned_regions_count']}")
    print(f"Heatmap URL: {analysis['tampering']['heatmap_url']}")
