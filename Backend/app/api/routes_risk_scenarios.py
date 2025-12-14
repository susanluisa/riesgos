# app/api/routes_risk_scenarios.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import RiskScenario
from app.schemas.core import (
    RiskScenarioCreate,
    RiskScenarioRead,
    RiskScenarioUpdate,
)

router = APIRouter(prefix="/risk-scenarios", tags=["risk_scenarios"])


@router.post("", response_model=RiskScenarioRead)
def create_risk_scenario(payload: RiskScenarioCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_none=True)
    scenario = RiskScenario(**data)
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return scenario


@router.get("", response_model=List[RiskScenarioRead])
def list_risk_scenarios(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(RiskScenario)
    if project_id is not None:
        query = query.filter(RiskScenario.project_id == project_id)
    return query.all()


@router.get("/{scenario_id}", response_model=RiskScenarioRead)
def get_risk_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.query(RiskScenario).filter(RiskScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")
    return scenario


@router.patch("/{scenario_id}", response_model=RiskScenarioRead)
def update_risk_scenario(
    scenario_id: int,
    payload: RiskScenarioUpdate,
    db: Session = Depends(get_db),
):
    scenario = db.query(RiskScenario).filter(RiskScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(scenario, field, value)

    db.commit()
    db.refresh(scenario)
    return scenario
