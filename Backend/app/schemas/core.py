# app/schemas/core.py
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.enums import (
    ProjectStatus,
    AccidentSeverity,
    RiskLevel,
    AlertLevel,
    AlertStatus,
    RecommendationStatus,
    DocumentStatus,
)


# ---------- APP SETTINGS ----------

class AppSettingBase(BaseModel):
    company_name: str
    timezone: str
    language: str = "es"
    theme: str = "light"
    autosave: bool = True


class AppSettingCreate(AppSettingBase):
    pass


class AppSettingUpdate(BaseModel):
    company_name: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    autosave: Optional[bool] = None


class AppSettingRead(AppSettingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- PROJECTS ----------

class ProjectBase(BaseModel):
    name: str
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: ProjectStatus = ProjectStatus.activo


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[ProjectStatus] = None


class ProjectRead(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- WORKERS ----------

class WorkerBase(BaseModel):
    dni: str
    full_name: str
    job_role: Optional[str] = None
    experience_years: Optional[int] = None
    project_id: int


class WorkerCreate(WorkerBase):
    pass


class WorkerUpdate(BaseModel):
    full_name: Optional[str] = None
    job_role: Optional[str] = None
    experience_years: Optional[int] = None
    project_id: Optional[int] = None


class WorkerRead(WorkerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- WORK CONDITIONS ----------

class WorkConditionBase(BaseModel):
    project_id: int
    worker_id: Optional[int] = None
    area: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    noise_level: Optional[float] = None
    hours_worked: Optional[float] = None
    height_level: Optional[float] = None
    protective_equipment: bool = False
    equipment_status: Optional[str] = "normal"


class WorkConditionCreate(WorkConditionBase):
    recorded_at: Optional[datetime] = None


class WorkConditionRead(WorkConditionBase):
    id: int
    recorded_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- RISK SCENARIOS ----------

class RiskScenarioBase(BaseModel):
    project_id: int
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    base_risk_level: RiskLevel
    is_active: bool = True


class RiskScenarioCreate(RiskScenarioBase):
    pass


class RiskScenarioUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    base_risk_level: Optional[RiskLevel] = None
    is_active: Optional[bool] = None


class RiskScenarioRead(RiskScenarioBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- ACCIDENTS ----------

class AccidentBase(BaseModel):
    worker_id: int
    project_id: int
    scenario_id: Optional[int] = None
    type: str
    severity: AccidentSeverity
    date_accident: date
    description: Optional[str] = None


class AccidentCreate(AccidentBase):
    pass


class AccidentRead(AccidentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- RISK PREDICTIONS ----------

class RiskPredictionBase(BaseModel):
    project_id: int
    worker_id: Optional[int] = None
    scenario_id: int
    area: str
    risk_probability: float
    risk_level: RiskLevel
    model_version: Optional[str] = None


class RiskPredictionCreate(RiskPredictionBase):
    prediction_date: Optional[datetime] = None


class RiskPredictionRead(RiskPredictionBase):
    id: int
    prediction_date: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- ALERTS ----------

class AlertBase(BaseModel):
    prediction_id: int
    alert_level: AlertLevel
    message: str
    status: AlertStatus = AlertStatus.pendiente


class AlertCreate(AlertBase):
    pass


class AlertUpdateStatus(BaseModel):
    status: AlertStatus
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None


class AlertRead(AlertBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- RECOMMENDATIONS ----------

class RecommendationBase(BaseModel):
    project_id: int
    scenario_id: Optional[int] = None
    accident_id: Optional[int] = None
    prediction_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: RecommendationStatus = RecommendationStatus.pendiente
    due_date: Optional[date] = None
    responsible_id: Optional[int] = None
    created_by: Optional[int] = None


class RecommendationCreate(RecommendationBase):
    pass


class RecommendationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[RecommendationStatus] = None
    due_date: Optional[date] = None
    responsible_id: Optional[int] = None


class RecommendationUpdateStatus(BaseModel):
    status: RecommendationStatus


class RecommendationRead(RecommendationBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- DOCUMENTS ----------

class DocumentBase(BaseModel):
    project_id: Optional[int] = None
    category_id: int
    title: str
    description: Optional[str] = None
    file_path: str
    status: DocumentStatus = DocumentStatus.vigente
    uploaded_by: int


class DocumentCreate(DocumentBase):
    pass


class DocumentRead(DocumentBase):
    id: int
    uploaded_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
