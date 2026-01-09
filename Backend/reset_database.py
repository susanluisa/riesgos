from app.database import Base, engine

from app.models import user
from app.models import core

print("────────────────────────────────────────")
print("Reseteando esquema de base de datos...")
print("Dropping all tables / eliminando todas las tablas...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables / creando todas las tablas...")
Base.metadata.create_all(bind=engine)

print("Listo / esquema creado con los nuevos modelos.")
print("────────────────────────────────────────")
