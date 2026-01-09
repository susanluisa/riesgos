# app/schemas/auth.py
from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str | None = None


class RefreshRequest(BaseModel):
    refresh: str


class LoginRequest(BaseModel):
    username: str
    password: str = Field(min_length=8, max_length=72)
