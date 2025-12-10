# app/main.py
from fastapi import FastAPI
from app.api import routes_users, routes_auth
from fastapi.middleware.cors import CORSMiddleware


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
