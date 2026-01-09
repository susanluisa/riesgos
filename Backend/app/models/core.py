# app/models/core.py
# Backwards-compatible imports for legacy references
from app.models.app_setting import AppSetting
from app.models.user import User, NotificationPreference, SecurityTeamMember
from app.models.project import Project, Worker, WorkCondition
from app.models.risk import (
    RiskScenario,
    Accident,
    RiskPrediction,
    Alert,
    Recommendation,
)
from app.models.document import DocumentCategory, Document

__all__ = [
    "AppSetting",
    "User",
    "NotificationPreference",
    "SecurityTeamMember",
    "Project",
    "Worker",
    "WorkCondition",
    "RiskScenario",
    "Accident",
    "RiskPrediction",
    "Alert",
    "Recommendation",
    "DocumentCategory",
    "Document",
]
