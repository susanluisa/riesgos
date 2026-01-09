# app/models/enums.py
import enum


class ProjectStatus(str, enum.Enum):
    activo = "activo"
    detenido = "detenido"
    finalizado = "finalizado"


class AccidentSeverity(str, enum.Enum):
    leve = "leve"
    moderada = "moderada"
    grave = "grave"


class RiskLevel(str, enum.Enum):
    bajo = "bajo"
    medio = "medio"
    alto = "alto"


class AlertLevel(str, enum.Enum):
    medio = "medio"
    alto = "alto"


class AlertStatus(str, enum.Enum):
    pendiente = "pendiente"
    atendida = "atendida"


class RecommendationStatus(str, enum.Enum):
    pendiente = "pendiente"
    en_progreso = "en_progreso"
    implementada = "implementada"
    descartada = "descartada"


class DocumentStatus(str, enum.Enum):
    borrador = "borrador"
    vigente = "vigente"
    vencido = "vencido"


class UserRole(str, enum.Enum):
    admin = "admin"
    supervisor = "supervisor"
    seguridad = "seguridad"
