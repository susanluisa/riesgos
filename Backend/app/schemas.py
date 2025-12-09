# app/schemas.py
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    pass  # por ahora igual a UserBase


class UserRead(UserBase):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True  # antes era orm_mode = True
