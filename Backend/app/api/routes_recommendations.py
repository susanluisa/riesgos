# app/api/routes_recommendations.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import Recommendation
from app.models.enums import RecommendationStatus
from app.schemas.core import (
    RecommendationCreate,
    RecommendationRead,
    RecommendationUpdate,
    RecommendationUpdateStatus,
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationRead)
def create_recommendation(
    payload: RecommendationCreate,
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_none=True)
    rec = Recommendation(**data)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.get("", response_model=List[RecommendationRead])
def list_recommendations(
    project_id: Optional[int] = Query(None),
    status_filter: Optional[RecommendationStatus] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Recommendation)
    if project_id is not None:
        query = query.filter(Recommendation.project_id == project_id)
    if status_filter is not None:
        query = query.filter(Recommendation.status == status_filter)
    return query.all()


@router.get("/{recommendation_id}", response_model=RecommendationRead)
def get_recommendation(recommendation_id: int, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendacion no encontrada")
    return rec


@router.patch("/{recommendation_id}", response_model=RecommendationRead)
def update_recommendation(
    recommendation_id: int,
    payload: RecommendationUpdate,
    db: Session = Depends(get_db),
):
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendacion no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(rec, field, value)

    db.commit()
    db.refresh(rec)
    return rec


@router.patch("/{recommendation_id}/status", response_model=RecommendationRead)
def update_recommendation_status(
    recommendation_id: int,
    payload: RecommendationUpdateStatus,
    db: Session = Depends(get_db),
):
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendacion no encontrada")

    rec.status = payload.status
    db.commit()
    db.refresh(rec)
    return rec
