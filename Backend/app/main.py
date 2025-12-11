# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_auth
from app.api import (
    routes_users,
    routes_projects,
    routes_workers,
    routes_work_conditions,
    routes_risk_scenarios,
    routes_accidents,
    routes_predictions,
    routes_alerts,
    routes_recommendations,
    routes_documents,
    routes_settings,
)


app = FastAPI(title="API Severidad accidentes Ocupacionales")

origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "API funcionando con PostgreSQL + SQLAlchemy"}


app.include_router(routes_users.router)
app.include_router(routes_auth.router)
app.include_router(routes_projects.router)
app.include_router(routes_workers.router)
app.include_router(routes_work_conditions.router)
app.include_router(routes_risk_scenarios.router)
app.include_router(routes_accidents.router)
app.include_router(routes_predictions.router)
app.include_router(routes_alerts.router)
app.include_router(routes_recommendations.router)
app.include_router(routes_documents.router)
app.include_router(routes_settings.router)
