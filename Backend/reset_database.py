from app.database import Base, engine
from app.models.user import User

print("deleting database / eliminando")
User.__table__.drop(engine, checkfirst=True)

print("creating database / creando")
Base.metadata.create_all(bind=engine)

print("done / base de datos creada")
