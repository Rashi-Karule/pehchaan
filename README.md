# PEHCHAAN (पहचान) — Automated Border Document Screening & Forensics

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pehchaan--ruby.vercel.app-black?style=for-the-badge&logo=vercel)](https://pehchaan-ruby.vercel.app/login)
[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ICAO 9303](https://img.shields.io/badge/Standard-ICAO%209303%20MRZ-green.svg)](https://www.icao.int/publications/pages/publication.aspx?docnum=9303)
[![License](https://img.shields.io/badge/License-MIT-gray.svg)](LICENSE)

> 🚀 **Live Production Deployment**: [https://pehchaan-ruby.vercel.app/login](https://pehchaan-ruby.vercel.app/login)  
> **Demo Officer Credentials**: Username: `officer_chen` | Keycode: `Checkpoint2026!` *(Autofill button available on login)*

**PEHCHAAN** is a specialized border-checkpoint identity document screening and forensic verification system designed for immigration officers and border enforcement personnel. It automates 4-module document forensics on international travel credentials (ICAO 9303 TD1/TD2/TD3 passports and national ID cards) with sub-second analysis, digital forgery detection, live biometric facial matching, and tamper-proof officer audit logging.

---

## 🏛️ System Architecture & 4-Module Forensic Pipeline

```
                              [ Traveler Document + Live Selfie ]
                                              │
                                              ▼
                           [ Ingestion & Size/Format Validation ]
                                              │
         ┌───────────────────┬────────────────┴───────────────────┬───────────────────┐
         ▼                   ▼                                    ▼                   ▼
 ┌───────────────┐   ┌───────────────┐                    ┌───────────────┐   ┌───────────────┐
 │   Module 1    │   │   Module 2    │                    │   Module 3    │   │   Module 4    │
 │ Optical Char  │   │ ICAO 9303 MRZ │                    │   Tampering   │   │ Biometric Face│
 │  Recognition  │   │  Validation   │                    │ Forensic Map  │   │ Verification  │
 ├───────────────┤   ├───────────────┤                    ├───────────────┤   ├───────────────┤
 │ • Visual Zone │   │ • 7-3-1 Weight│                    │ • Error Level │   │ • YuNet Face  │
 │   OCR Parsing │   │   Calculation │                    │   Analysis    │   │   Detection   │
 │ • Name, DOB,  │   │ • Cross-Check │                    │ • Copy-Move   │   │ • SFace Deep  │
 │   Doc Number  │   │   VIZ vs MRZ  │                    │   Cloning     │   │   Embeddings  │
 └───────┬───────┘   └───────┬───────┘                    └───────┬───────┘   └───────┬───────┘
         │                   │                                    │                   │
         └───────────────────┴────────────────┬───────────────────┴───────────────────┘
                                              ▼
                                 ┌─────────────────────────┐
                                 │   Risk Engine Matrix    │
                                 │  Composite Risk Score   │
                                 │  [ CLEAR / INVESTIGATE ]│
                                 └────────────┬────────────┘
                                              ▼
                                 ┌─────────────────────────┐
                                 │ Officer Review & Ledger │
                                 │  Full Audit Attribution │
                                 └─────────────────────────┘
```

### Module 1: Optical Character Recognition (OCR Field Extraction)
- Preprocesses document visuals with adaptive thresholding, bilateral noise filtering, and orientation normalization.
- Extracts standard visual inspection zone (VIZ) fields: Surname, Given Names, Document Number, Date of Birth, Expiration Date, Issuing Authority, and Nationality.

### Module 2: ICAO 9303 Machine Readable Zone (MRZ) Checksum Engine
- Parses TD1 (3-line ID), TD2 (2-line ID), and TD3 (2-line Passport) standard MRZ configurations.
- Executes strict **ICAO 9303 7-3-1 weighting checksum verification** across Document Number, Date of Birth, Expiry Date, Optional Data, and the Composite Checksum.
- Cross-validates parsed VIZ text against encoded MRZ characters to flag synthetic alterations.

### Module 3: Digital Tampering Detection & Forensic Heatmap
- **Error Level Analysis (ELA)**: Detects differential JPEG compression rates across image regions to identify digitally spliced text or inserted graphic layers.
- **Copy-Move Forgery Detection**: Fast feature point clustering (ORB/SIFT/k-d trees) identifies duplicated security stamps, cloned seals, and duplicated numbers.
- Generates interactive, layer-blended forensic heatmaps directly on the document canvas.

### Module 4: Biometric Neural Facial Verification
- Uses ONNX-accelerated deep neural networks (**YuNet Face Detection** + **SFace Face Recognition**).
- Extracts passport photo portrait and compares cosine similarity with live traveler selfie crops (threshold calibrated for high confidence verification).

---

## 🔒 Security, Data Protection & Audit Trail

Designed specifically for shared border checkpoint workstations:

- **Restricted Access**: Travelers never log in or interact with the system. Only authorized immigration officers can access screening dossiers.
- **Protected Document Storage**: Static file serving (`/uploads`) is **permanently disabled**. Document images, heatmaps, and face crops are accessible solely via authenticated streaming routes (`GET /api/documents/{id}/image`, etc.).
- **In-Memory Session Management**: JWT session tokens are stored in React memory only—never on disk via `localStorage` or `sessionStorage`—ensuring physical terminal safety when tabs are closed.
- **8-Hour Shift Expiration**: Tokens expire after 8 hours (one officer shift).
- **Officer Audit Ledger**: Every ingested case and adjudication records the screening officer ID, reviewing officer ID, timestamp, and official remarks.
- **File Upload Validation**: Images are strictly verified through Pillow (`PIL.Image.verify()`) and capped at 10MB to prevent arbitrary payload ingestion.

---

## 🎨 Checkpoint Workstation Design System

The visual layer reflects official immigration border hardware:
- **Cool Paper Canvas**: `#EAEBE3`
- **Ink Navy Primary Text**: `#1B2430`
- **Ink-Stamp Red**: `#A23B2E` (Deep: `#7A2A20`) — Reserved for CTAs, critical alerts, and escalation actions.
- **Clearance Green**: `#3F4A2C` (Deep: `#2A3320`) — Applied across verified statuses, pass badges, and cleared documents.
- **Dark Mode Palette**: Ink Black `#14161C`, Dark Surface `#1B2430`, Paper Text `#EAEBE3`, Enhanced Green `#6B7D46`, Enhanced Red `#C24B3B`.
- **Typography Contrast**: Monospaced type (`IBM Plex Mono` / `JetBrains Mono`) for all document data, checksums, and MRZ strings; Clean Grotesk (`Inter`) for labels and body copy.
- **Signature MRZ Structural Divider**: Decorative ICAO 9303 machine-readable separator strips.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **Tesseract OCR Engine** (optional for OCR text extraction):
  - macOS: `brew install tesseract`
  - Ubuntu/Debian: `sudo apt-get install -y tesseract-ocr`
  - Windows: [UB-Mannheim Tesseract Installer](https://github.com/UB-Mannheim/tesseract/wiki)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Rashi-Karule/pehchaan.git
cd pehchaan
```

---

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at: `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)

---

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend Web App will be live at: `http://127.0.0.1:5173`

---

## 🔑 Default Officer Credentials (Demo Account)

| Role | Username | Workstation Keycode | Shift Duration |
| :--- | :--- | :--- | :--- |
| **Checkpoint Officer** | `officer_chen` | `Checkpoint2026!` | 8 Hours |

*(Autofill button is available on the `/login` screen for rapid demonstration).*

---

## 🌐 Production Deployment Guide

### Option A: Full-Stack Docker Deployment (Recommended)

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - JWT_SECRET=change_this_to_a_random_32_byte_string_for_production
      - JWT_ALGORITHM=HS256
      - JWT_EXPIRATION_HOURS=8
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      - backend
    restart: unless-stopped
```

Run with:
```bash
docker compose up --build -d
```

---

### Option B: Cloud Hosting (Render / Railway / Vercel)

#### 1. Backend on Render / Railway
1. **Service Type**: Web Service
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   - `JWT_SECRET`: Generate a secure random string (`openssl rand -hex 32`)
   - `JWT_ALGORITHM`: `HS256`
   - `JWT_EXPIRATION_HOURS`: `8`

#### 2. Frontend on Vercel / Netlify
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Rewrites / Proxy Configuration**: Configure `/api/*` rewrites to your deployed backend URL.

---

## 📡 API Reference Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Officer login (returns 8h JWT) |
| `GET` | `/api/auth/me` | Protected | Returns authenticated officer profile |
| `POST` | `/api/documents/upload` | Protected | Ingests travel document and selfie |
| `POST` | `/api/documents/analyze` | Protected | Executes 4-module screening pipeline |
| `GET` | `/api/documents/{id}` | Protected | Fetches screening dossier & audit trail |
| `POST` | `/api/review/{caseId}` | Protected | Records officer decision & notes |
| `GET` | `/api/demo/samples` | Protected | Lists pre-seeded test scenarios |
| `POST` | `/api/demo/load/{id}` | Protected | Loads reference scenario |
| `GET` | `/api/documents/{id}/image` | Protected | Authenticated document image stream |
| `GET` | `/api/documents/{id}/heatmap`| Protected | Authenticated tampering overlay stream |
| `GET` | `/api/documents/{id}/selfie` | Protected | Authenticated live selfie stream |

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
