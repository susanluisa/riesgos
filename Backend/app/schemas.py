# app/schemas.py
from datetime import datetime
from pydantic import BaseModel, EmailStr


# --------- USUARIOS ---------


class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: str
    department: str | None = "Seguridad Industrial"
    is_emergency_contact: bool = False


class UserCreate(UserBase):
    password: str


class UserRead(UserBase): # lo que se devuelve al cliente
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True  # antes orm_mode=True


# --------- AUTH / TOKENS ---------


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str | None = None  # en /refresh puede ser None


class RefreshRequest(BaseModel):
    refresh: str
