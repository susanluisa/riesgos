# train_model.py
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris  # <- solo ejemplo, luego lo reemplazas con tus datos reales

# 1. Cargar un dataset (aquí solo usamos iris para probar que todo funcione)
data = load_iris()

X = data.data        # Features
y = data.target      # Etiquetas (clases)

# 2. Separar datos en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. Crear modelo Random Forest
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# 4. Entrenar el modelo
model.fit(X_train, y_train)

# 5. Guardar el modelo entrenado
joblib.dump(model, "random_forest_model.pkl")

print("✅ Modelo entrenado y guardado como random_forest_model.pkl")

