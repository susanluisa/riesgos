from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database import Base 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Autenticación básica
    username = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # nuevo miembro
    full_name = Column(String(150), nullable=False)  # Nombre Completo
    email = Column(String(150), unique=True, index=True, nullable=False)  # Email
    phone = Column(String(30), nullable=True)  # Teléfono (+código país)
    role = Column(String(100), nullable=False)  # Rol
    department = Column(String(150), nullable=True, default="Seguridad Industrial")
    is_emergency_contact = Column(
        Boolean, default=False
    )

    created_at = Column(DateTime, default=datetime.utcnow)
