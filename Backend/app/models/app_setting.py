# app/models/app_setting.py
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class AppSetting(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    timezone = Column(String(100), nullable=False)  # "America/Lima"
    language = Column(String(20), nullable=False, default="es")
    theme = Column(String(20), nullable=False, default="light")
    autosave = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
