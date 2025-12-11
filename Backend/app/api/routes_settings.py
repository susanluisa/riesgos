# app/api/routes_settings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.setttings import Settings
from app.models.user import User
from app.schemas.settings import (
    SettingsRead,
    SettingsUpdate,
    TeamMemberRead,
    NotificationPreferences,
)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsRead)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    users = db.query(User).all()

    team = [
        TeamMemberRead(
            id=user.id,
            name=user.full_name,
            email=user.email,
            phone=user.phone,
            role=user.role,
            department=user.department,
            isActive=user.is_active,
            emergencyContact=user.is_emergency_contact,
            lastActive=user.last_active,
            notificationPreferences=NotificationPreferences(
                **(user.notification_preferences or {})
            ),
        )
        for user in users
    ]

    return SettingsRead(
        id=settings.id,
        general=settings.general,
        notifications=settings.notifications,
        security=settings.security,
        ai=settings.ai,
        team=team,
    )
