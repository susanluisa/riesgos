# app/api/routes_users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.auth import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserRead)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Crea un usuario nuevo con los campos del formulario:
    - username
    - password
    - full_name
    - email
    - phone
    - role
    - department
    - is_emergency_contact
    """

    # validar username/email únicos
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Nombre de usuario ya existe")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        department=payload.department,
        is_emergency_contact=payload.is_emergency_contact,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    """
    Lista todos los usuarios registrados.
    """
    users = db.query(User).all()
    return users
