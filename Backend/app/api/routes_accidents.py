# app/api/routes_accidents.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import Accident
from app.schemas.core import AccidentCreate, AccidentRead

router = APIRouter(prefix="/accidents", tags=["accidents"])


@router.post("", response_model=AccidentRead)
def create_accident(payload: AccidentCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_none=True)
    acc = Accident(**data)
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


@router.get("", response_model=List[AccidentRead])
def list_accidents(
    project_id: Optional[int] = Query(None),
    worker_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Accident)
    if project_id is not None:
        query = query.filter(Accident.project_id == project_id)
    if worker_id is not None:
        query = query.filter(Accident.worker_id == worker_id)
    return query.all()


@router.get("/{accident_id}", response_model=AccidentRead)
def get_accident(accident_id: int, db: Session = Depends(get_db)):
    acc = db.query(Accident).filter(Accident.id == accident_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Accidente no encontrado")
    return acc
