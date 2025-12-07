# app/main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import User
from .schemas import UserCreate, UserRead

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Riesgos Ocupacionales")


@app.get("/")
def read_root():
    return {"message": "API funcionando con PostgreSQL + SQLAlchemy"}


# Crear usuario
@app.post("/users/create", response_model=UserRead)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(name=payload.name, email=payload.email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# Listar usuarios
@app.get("/users", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
