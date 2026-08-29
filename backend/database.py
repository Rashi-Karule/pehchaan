import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "pehchaan.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DocumentCase(Base):
    __tablename__ = "document_cases"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    document_filename = Column(String, nullable=False)
    selfie_filename = Column(String, nullable=True)
    preview_url = Column(String, nullable=False)
    selfie_url = Column(String, nullable=True)
    analysis_json = Column(Text, nullable=True)
    review_status = Column(String, default="PENDING")  # PENDING, CONFIRMED, FLAGGED, ESCALATED
    officer_notes = Column(Text, nullable=True)
    officer_decision_at = Column(DateTime, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
