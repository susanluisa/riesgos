# app/models/risk.py
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    DateTime,
    Text,
    Float,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SAEnum

from app.database import Base
from app.models.enums import (
    AccidentSeverity,
    RiskLevel,
    AlertLevel,
    AlertStatus,
    RecommendationStatus,
)


def utcnow():
    return datetime.now(timezone.utc)


class RiskScenario(Base):
    __tablename__ = "risk_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(100))
    description = Column(Text)
    base_risk_level = Column(SAEnum(RiskLevel), nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="scenarios")
    accidents = relationship("Accident", back_populates="scenario")
    predictions = relationship("RiskPrediction", back_populates="scenario")
    recommendations = relationship("Recommendation", back_populates="scenario")


class Accident(Base):
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"), nullable=True)

    type = Column(String(100), nullable=False)
    severity = Column(SAEnum(AccidentSeverity), nullable=False)
    date_accident = Column(Date, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    worker = relationship("Worker", back_populates="accidents")
    project = relationship("Project", back_populates="accidents")
    scenario = relationship("RiskScenario", back_populates="accidents")
    recommendations = relationship("Recommendation", back_populates="accident")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"), nullable=False)

    area = Column(String(100), nullable=False)
    prediction_date = Column(DateTime(timezone=True), default=utcnow)
    risk_probability = Column(Float, nullable=False)
    risk_level = Column(SAEnum(RiskLevel), nullable=False)
    model_version = Column(String(50))

    project = relationship("Project", back_populates="predictions")
    worker = relationship("Worker", back_populates="predictions")
    scenario = relationship("RiskScenario", back_populates="predictions")
    alerts = relationship("Alert", back_populates="prediction")
    recommendations = relationship("Recommendation", back_populates="prediction")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("risk_predictions.id"), nullable=False)
    alert_level = Column(SAEnum(AlertLevel), nullable=False)
    message = Column(String(255), nullable=False)
    status = Column(SAEnum(AlertStatus), nullable=False, default=AlertStatus.pendiente)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    resolved_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    prediction = relationship("RiskPrediction", back_populates="alerts")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"), nullable=True)
    accident_id = Column(Integer, ForeignKey("accidents.id"), nullable=True)
    prediction_id = Column(Integer, ForeignKey("risk_predictions.id"), nullable=True)

    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(
        SAEnum(RecommendationStatus),
        nullable=False,
        default=RecommendationStatus.pendiente,
    )
    due_date = Column(Date)
    responsible_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="recommendations")
    scenario = relationship("RiskScenario", back_populates="recommendations")
    accident = relationship("Accident", back_populates="recommendations")
    prediction = relationship("RiskPrediction", back_populates="recommendations")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
