# main.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from routers import datasets, notifications, predict, train, assitant


app = FastAPI(
    title="API Random Forest con FastAPI",
    description="Ejemplo básico usando un modelo Random Forest entrenado con scikit-learn",
    version="1.0.0",
)

# rutas de las apis
app.include_router(datasets.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")


# Cargar el modelo entrenado
model = joblib.load("random_forest_model.pkl")


# Esquema de los datos de entrada (features)
# Como usamos el dataset Iris, tiene 4 features:
# - sepal length
# - sepal width
# - petal length
# - petal width
class IrisFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float


@app.get("/")
def read_root():
    return {"message": "API de Random Forest funcionando"}


@app.post("/predict")
def predict_iris(features: IrisFeatures):
    # Convertir los datos de entrada a un array de numpy con la forma correcta
    X = np.array(
        [
            [
                features.sepal_length,
                features.sepal_width,
                features.petal_length,
                features.petal_width,
            ]
        ]
    )

    # Hacer la predicción
    prediction = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0].tolist()

    return {"prediction": int(prediction), "probabilities": probabilities}
