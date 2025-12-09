from app.database import Base, engine
from app.models import user 

print("Creando tablas en la base de datos...")
Base.metadata.create_all(bind=engine)
print("Tablas creadas.")
