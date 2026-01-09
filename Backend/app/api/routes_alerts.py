# app/api/routes_alerts.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import Alert
from app.models.enums import AlertStatus
from app.schemas.core import AlertRead, AlertUpdateStatus

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertRead])
def list_alerts(
    status_filter: Optional[AlertStatus] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Alert)
    if status_filter is not None:
        query = query.filter(Alert.status == status_filter)
    return query.all()


@router.patch("/{alert_id}/status", response_model=AlertRead)
def update_alert_status(
    alert_id: int,
    payload: AlertUpdateStatus,
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    alert.status = payload.status
    if payload.resolved_at is not None:
        alert.resolved_at = payload.resolved_at
    if payload.resolved_by is not None:
        alert.resolved_by = payload.resolved_by

    db.commit()
    db.refresh(alert)
    return alert
