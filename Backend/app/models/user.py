# app/models/user.py
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Enum as SAEnum,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database import Base

from .enums import UserRole


def utcnow():
    # Reemplaza datetime.utcnow() (deprecado) por un datetime con zona horaria en UTC
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Autenticación básica
    username = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Datos del miembro
    full_name = Column(String(100), nullable=False)  # Nombres
    email = Column(String(150), unique=True, index=True, nullable=False)  # Email
    phone = Column(String(30), nullable=True)  # Teléfono (+código país)

    # Rol y organización
    role = Column(
        SAEnum(UserRole, name="user_role_enum"), nullable=False, default=UserRole.admin
    )  # Rol (admin, supervisor, etc.)
    department = Column(String(150), nullable=True, default="Seguridad Industrial")

    # Flags
    is_emergency_contact = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relaciones hacia tablas de configuración / equipo
    notification_preferences = relationship(
        "NotificationPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    security_team_membership = relationship(
        "SecurityTeamMember",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    @staticmethod
    def _split_full_name(value: str) -> tuple[str, str]:
        first, *rest = value.split()
        return first, " ".join(rest)

    @property
    def full_name(self) -> str:
        # Keep backward compatibility with existing name/lastname columns
        parts = [self.name or "", self.lastname or ""]
        return " ".join(part for part in parts if part).strip()

    @full_name.setter
    def full_name(self, value: str) -> None:
        first, last = self._split_full_name(value)
        self.name = first
        # If there is no last name provided, duplicate the first to satisfy not-null
        self.lastname = last or first


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    security_alerts = Column(Boolean, default=True)
    model_updates = Column(Boolean, default=False)
    only_critical = Column(Boolean, default=False)
    desktop_enabled = Column(Boolean, default=False)
    sound_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="notification_preferences")


class SecurityTeamMember(Base):
    __tablename__ = "security_team_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    notification_channel = Column(String(50), default="email")
    last_activity_at = Column(DateTime)

    user = relationship("User", back_populates="security_team_membership")
