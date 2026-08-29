import os
import json
import sqlite3
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, DateTime, Text, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "pehchaan.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Officer(Base):
    __tablename__ = "officers"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DocumentCase(Base):
    __tablename__ = "document_cases"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    document_filename = Column(String, nullable=False)
    selfie_filename = Column(String, nullable=True)
    preview_url = Column(String, nullable=False)
    selfie_url = Column(String, nullable=True)
    analysis_json = Column(Text, nullable=True)
    review_status = Column(String, default="PENDING")  # PENDING, CONFIRMED, FLAGGED, ESCALATED
    officer_notes = Column(Text, nullable=True)
    officer_decision_at = Column(DateTime, nullable=True)
    
    # Audit Trail: Recording officers
    screened_by_officer_id = Column(String, nullable=True)
    screened_by_officer_username = Column(String, nullable=True)
    reviewed_by_officer_id = Column(String, nullable=True)
    reviewed_by_officer_username = Column(String, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

    # Migrate columns if not present in existing SQLite document_cases table
    with engine.connect() as conn:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('document_cases')]
        
        if 'screened_by_officer_id' not in columns:
            conn.execute(text("ALTER TABLE document_cases ADD COLUMN screened_by_officer_id VARCHAR"))
        if 'screened_by_officer_username' not in columns:
            conn.execute(text("ALTER TABLE document_cases ADD COLUMN screened_by_officer_username VARCHAR"))
        if 'reviewed_by_officer_id' not in columns:
            conn.execute(text("ALTER TABLE document_cases ADD COLUMN reviewed_by_officer_id VARCHAR"))
        if 'reviewed_by_officer_username' not in columns:
            conn.execute(text("ALTER TABLE document_cases ADD COLUMN reviewed_by_officer_username VARCHAR"))
        conn.commit()

    # Seed exactly one officer account if table is empty
    db = SessionLocal()
    try:
        if db.query(Officer).count() == 0:
            import bcrypt
            pwd_bytes = "Checkpoint2026!".encode('utf-8')[:72]
            salt = bcrypt.gensalt()
            pwd_hash = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
            
            seeded_officer = Officer(
                id="off_alpha_chen",
                username="officer_chen",
                password_hash=pwd_hash,
                created_at=datetime.now(timezone.utc)
            )
            db.add(seeded_officer)
            db.commit()
            print("[INFO] Seeded default border checkpoint officer: officer_chen")
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

