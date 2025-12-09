# app/schemas/user.py
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: str
    department: str | None = "Seguridad Industrial"
    is_emergency_contact: bool = False


class UserCreate(UserBase):
    # Datos extra necesarios para login/registro
    username: str
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="Contraseña entre 8 y 72 caracteres.",
    )


class UserRead(UserBase):
    id: int
    username: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class UserUpdate(UserBase):
    pass
