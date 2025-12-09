# app/api/routes_auth.py
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import TokenResponse, LoginRequest
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
def register_user(payload: UserCreate, db: Session = Depends(get_db)):

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

    return {"message": "Usuario creado"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == payload.username).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access = create_access_token(sub=user.username)
    refresh = create_refresh_token(sub=user.username)

    response = JSONResponse(content={"accessToken": access})

    # Cookie HttpOnly para el refresh token
    response.set_cookie(
        key="refreshToken",
        value=refresh,
        httponly=True,
        secure=False,  # pon True con HTTPS en producción
        samesite="lax",
        path="/api/auth/refresh/",
    )

    return response


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request):

    refresh_cookie = request.cookies.get("refreshToken")

    if not refresh_cookie:
        raise HTTPException(status_code=401, detail="No hay refresh token en cookies")

    payload = decode_token(refresh_cookie, expected_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Refresh inválido o expirado")

    username = payload.get("sub")
    new_access = create_access_token(sub=username)

    return TokenResponse(accessToken=new_access)


@router.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logout exitoso"})
    response.delete_cookie("refreshToken", path="/api/auth/refresh/")
    return response


@router.get("/protected")
def protected_route(authorization: str = Header(...)):

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Formato de token inválido")

    payload = decode_token(token, expected_type="access")

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    return {"message": f"Hola {payload['sub']}, acceso concedido"}
