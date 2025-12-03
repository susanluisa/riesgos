# routers/predict.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List
from pathlib import Path
import json
import joblib
import numpy as np

router = APIRouter(prefix="/predict", tags=["predict"])

MODELS_DIR = Path("models")

# --- Cargar spec y modelo al iniciar el servidor ---

with open(MODELS_DIR / "rf_feature_spec.json", "r", encoding="utf-8") as f:
    SPEC: Dict[str, Any] = json.load(f)

TARGET_CLASSES: List[str] = SPEC.get("targetClasses", [])

# *********************************************
RF_MODEL = joblib.load(MODELS_DIR / "rf_latest.pkl")


# --- Versión Python de transformWithSpec (simplificada) ---


def transform_with_spec(rows: List[Dict[str, Any]], spec: Dict[str, Any]):
    """
    Versión simplificada:
    - Toma el orden de columnas desde spec["featureNames"] (o el nombre que uses)
    - Construye la matriz X respetando ese orden.
    """
    feature_names: List[str] = spec.get("featureNames", [])
    if not feature_names:
        raise ValueError("Spec no contiene 'featureNames'.")

    X = []
    for row in rows:
        # Para cada fila, armamos un vector en el mismo orden de feature_names
        X.append([row.get(name) for name in feature_names])

    X_array = np.array(X, dtype=float)
    return X_array


# --- Esquema del body que llega en la petición ---


class PredictBody(BaseModel):
    rows: List[Dict[str, Any]]


# --- Endpoint POST /api/predict (equivalente al de Next) ---


@router.post("")
async def predict(body: PredictBody):
    rows = body.rows
    if not isinstance(rows, list) or len(rows) == 0:
        raise HTTPException(
            status_code=400, detail="Envía 'rows' con datos para predecir."
        )

    try:
        # 1) Transformar datos
        X = transform_with_spec(rows, SPEC)

        # 2) Predicción de índices
        y_idx = RF_MODEL.predict(X)

        # 3) Probabilidades (si el modelo las soporta)
        proba = None
        if hasattr(RF_MODEL, "predict_proba"):
            proba = RF_MODEL.predict_proba(X).tolist()

        # 4) Mapear índices a nombres de clase
        classes = TARGET_CLASSES
        y_pred = [classes[i] if 0 <= i < len(classes) else str(i) for i in y_idx]

        return {
            "success": True,
            "yPred": y_pred,
            "proba": proba,
            "classes": classes,
        }

    except Exception as e:
        # Similar al catch de NextResponse
        raise HTTPException(
            status_code=400,
            detail=str(e) or "Error desconocido",
        )
