# app/main.py
from fastapi import FastAPI
from app.api import routes_users, routes_auth

app = FastAPI(title="API Riesgos Ocupacionales")


@app.get("/")
def read_root():
    return {"message": "API funcionando con PostgreSQL + SQLAlchemy"}


app.include_router(routes_users.router)
app.include_router(routes_auth.router)
