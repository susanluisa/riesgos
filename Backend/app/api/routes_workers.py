# app/api/routes_workers.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.core import Worker
from app.schemas.core import WorkerCreate, WorkerRead, WorkerUpdate

router = APIRouter(prefix="/workers", tags=["workers"])


@router.post("", response_model=WorkerRead)
def create_worker(payload: WorkerCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_none=True)
    worker = Worker(**data)
    db.add(worker)
    db.commit()
    db.refresh(worker)
    return worker


@router.get("", response_model=List[WorkerRead])
def list_workers(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Worker)
    if project_id is not None:
        query = query.filter(Worker.project_id == project_id)
    return query.all()


@router.get("/{worker_id}", response_model=WorkerRead)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Trabajador no encontrado")
    return worker


@router.patch("/{worker_id}", response_model=WorkerRead)
def update_worker(worker_id: int, payload: WorkerUpdate, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Trabajador no encontrado")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(worker, field, value)

    db.commit()
    db.refresh(worker)
    return worker
