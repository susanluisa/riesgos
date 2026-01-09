# app/models/document.py
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SAEnum

from app.database import Base
from app.models.enums import DocumentStatus


def utcnow():
    return datetime.now(timezone.utc)


class DocumentCategory(Base):
    __tablename__ = "document_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    documents = relationship("Document", back_populates="category")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("document_categories.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    file_path = Column(String(300), nullable=False)
    status = Column(
        SAEnum(DocumentStatus), nullable=False, default=DocumentStatus.vigente
    )
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="documents")
    category = relationship("DocumentCategory", back_populates="documents")
