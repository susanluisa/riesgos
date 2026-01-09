# app/models/project.py
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SAEnum

from app.database import Base
from app.models.enums import ProjectStatus


def utcnow():
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(200))
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(SAEnum(ProjectStatus), nullable=False, default=ProjectStatus.activo)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    workers = relationship("Worker", back_populates="project")
    work_conditions = relationship("WorkCondition", back_populates="project")
    accidents = relationship("Accident", back_populates="project")
    predictions = relationship("RiskPrediction", back_populates="project")
    recommendations = relationship("Recommendation", back_populates="project")
    documents = relationship("Document", back_populates="project")
    scenarios = relationship("RiskScenario", back_populates="project")


class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(20), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    job_role = Column(String(100))
    experience_years = Column(Integer)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="workers")
    work_conditions = relationship("WorkCondition", back_populates="worker")
    accidents = relationship("Accident", back_populates="worker")
    predictions = relationship("RiskPrediction", back_populates="worker")


class WorkCondition(Base):
    __tablename__ = "work_conditions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)

    area = Column(String(100), nullable=False)
    temperature = Column(Float)
    humidity = Column(Float)
    noise_level = Column(Float)
    hours_worked = Column(Float)
    height_level = Column(Float)
    protective_equipment = Column(Boolean, default=False)
    equipment_status = Column(String(50), default="normal")
    recorded_at = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    project = relationship("Project", back_populates="work_conditions")
    worker = relationship("Worker", back_populates="work_conditions")
