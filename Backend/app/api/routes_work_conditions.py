# app/api/routes_work_conditions.py
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import WorkCondition
from app.schemas.core import WorkConditionCreate, WorkConditionRead

router = APIRouter(prefix="/work-conditions", tags=["work_conditions"])


@router.post("", response_model=WorkConditionRead)
def create_work_condition(payload: WorkConditionCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_none=True)
    wc = WorkCondition(**data)
    db.add(wc)
    db.commit()
    db.refresh(wc)
    return wc


@router.get("", response_model=List[WorkConditionRead])
def list_work_conditions(
    project_id: Optional[int] = Query(None),
    worker_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(WorkCondition)
    if project_id is not None:
        query = query.filter(WorkCondition.project_id == project_id)
    if worker_id is not None:
        query = query.filter(WorkCondition.worker_id == worker_id)
    return query.all()
