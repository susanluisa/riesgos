# app/schemas/user.py
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole


class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = "Seguridad Industrial"
    is_emergency_contact: bool = False
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[UserRole] = None
    is_emergency_contact: Optional[bool] = None
    is_active: Optional[bool] = None


class UserRead(UserBase):
    id: int
    username: str

    class Config:
        from_attributes = True  # o orm_mode = True si usas Pydantic v1
