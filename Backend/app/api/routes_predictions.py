# app/api/routes_predictions.py
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import RiskPrediction
from app.schemas.core import RiskPredictionCreate, RiskPredictionRead

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("", response_model=RiskPredictionRead)
def create_prediction(payload: RiskPredictionCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_none=True)
    pred = RiskPrediction(**data)
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred


@router.get("", response_model=List[RiskPredictionRead])
def list_predictions(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(RiskPrediction)
    if project_id is not None:
        query = query.filter(RiskPrediction.project_id == project_id)
    return query.all()
