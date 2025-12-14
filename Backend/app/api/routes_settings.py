# app/api/routes_settings.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.app_setting import AppSetting
from app.schemas.core import (
    AppSettingCreate,
    AppSettingRead,
    AppSettingUpdate,
)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.post("", response_model=AppSettingRead)
def create_setting(payload: AppSettingCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_none=True)
    setting = AppSetting(**data)
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


@router.get("", response_model=List[AppSettingRead])
def list_settings(db: Session = Depends(get_db)):
    return db.query(AppSetting).all()


@router.get("/{setting_id}", response_model=AppSettingRead)
def get_setting(setting_id: int, db: Session = Depends(get_db)):
    setting = db.query(AppSetting).filter(AppSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Configuracion no encontrada")
    return setting


@router.patch("/{setting_id}", response_model=AppSettingRead)
def update_setting(
    setting_id: int,
    payload: AppSettingUpdate,
    db: Session = Depends(get_db),
):
    setting = db.query(AppSetting).filter(AppSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Configuracion no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(setting, field, value)

    db.commit()
    db.refresh(setting)
    return setting
