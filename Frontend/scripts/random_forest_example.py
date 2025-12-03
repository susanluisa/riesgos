"""
Random Forest para Predicción de Riesgos Ocupacionales
Implementación completa con scikit-learn y manejo de variables dummy
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import matplotlib.pyplot as plt
import seaborn as sns

# Configuración
np.random.seed(42)

def generar_datos_simulados(n_samples=1000):
    """
    Genera datos simulados de riesgos ocupacionales
    """
    np.random.seed(42)
    
    # Variables numéricas
    edad = np.random.normal(35, 10, n_samples)
    experiencia_años = np.random.exponential(5, n_samples)
    horas_trabajo_semanal = np.random.normal(42, 8, n_samples)
    
    # Variables categóricas
    departamentos = np.random.choice(['produccion', 'mantenimiento', 'oficina', 'almacen'], n_samples, 
                                   p=[0.4, 0.3, 0.2, 0.1])
    turnos = np.random.choice(['mañana', 'tarde', 'noche'], n_samples, p=[0.4, 0.35, 0.25])
    tipo_trabajo = np.random.choice(['fisico', 'mental', 'mixto'], n_samples, p=[0.5, 0.3, 0.2])
    
    # Variable objetivo (riesgo alto/bajo)
    # Lógica: más riesgo en producción, turno noche, trabajo físico, más horas
    riesgo_prob = (
        (departamentos == 'produccion') * 0.3 +
        (turnos == 'noche') * 0.2 +
        (tipo_trabajo == 'fisico') * 0.2 +
        (horas_trabajo_semanal > 45) * 0.15 +
        (edad > 50) * 0.1 +
        (experiencia_años < 2) * 0.15
    )
    
    riesgo_alto = np.random.binomial(1, np.clip(riesgo_prob, 0, 1), n_samples)
    
    # Crear DataFrame
    df = pd.DataFrame({
        'edad': edad,
        'experiencia_años': experiencia_años,
        'horas_trabajo_semanal': horas_trabajo_semanal,
        'departamento': departamentos,
        'turno': turnos,
        'tipo_trabajo': tipo_trabajo,
        'riesgo_alto': riesgo_alto
    })
    
    return df

def preparar_variables_dummy(df):
    """
    Convierte variables categóricas en variables dummy
    """
    df_processed = df.copy()
    
    # Variables categóricas a convertir
    categorical_features = ['departamento', 'turno', 'tipo_trabajo']
    
    # Crear variables dummy
    for feature in categorical_features:
        # Crear dummies con prefijo
        dummies = pd.get_dummies(df_processed[feature], prefix=feature, drop_first=False)
        
        # Agregar al DataFrame
        df_processed = pd.concat([df_processed, dummies], axis=1)
        
        # Eliminar variable original
        df_processed.drop(feature, axis=1, inplace=True)
    
    return df_processed

def entrenar_random_forest(X_train, y_train, optimizar_hiperparametros=True):
    """
    Entrena modelo Random Forest con optimización opcional de hiperparámetros
    """
    if optimizar_hiperparametros:
        # Definir grid de hiperparámetros
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, 15, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        # Grid Search con validación cruzada
        rf = RandomForestClassifier(random_state=42, oob_score=True)
        grid_search = GridSearchCV(
            rf, param_grid, cv=5, scoring='f1', n_jobs=-1, verbose=1
        )
        
        print("Optimizando hiperparámetros...")
        grid_search.fit(X_train, y_train)
        
        print(f"Mejores parámetros: {grid_search.best_params_}")
        print(f"Mejor F1 Score: {grid_search.best_score_:.3f}")
        
        return grid_search.best_estimator_
    
    else:
        # Configuración estándar
        rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            oob_score=True
        )
        
        rf.fit(X_train, y_train)
        return rf

def analizar_importancia_caracteristicas(modelo, feature_names):
    """
    Analiza y visualiza la importancia de las características
    """
    # Obtener importancias
    importances = modelo.feature_importances_
    
    # Crear DataFrame para análisis
    feature_importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances,
        'is_dummy': [('_' in name and name not in ['experiencia_años', 'horas_trabajo_semanal']) 
                    for name in feature_names]
    }).sort_values('importance', ascending=False)
    
    print("\n=== IMPORTANCIA DE CARACTERÍSTICAS ===")
    print(feature_importance_df.head(10))
    
    # Separar variables dummy y numéricas
    dummy_features = feature_importance_df[feature_importance_df['is_dummy']]
    numerical_features = feature_importance_df[~feature_importance_df['is_dummy']]
    
    print(f"\n=== TOP 5 VARIABLES DUMMY ===")
    print(dummy_features.head())
    
    print(f"\n=== TOP 5 VARIABLES NUMÉRICAS ===")
    print(numerical_features.head())
    
    return feature_importance_df

def evaluar_modelo(modelo, X_test, y_test):
    """
    Evalúa el rendimiento del modelo
    """
    # Predicciones
    y_pred = modelo.predict(X_test)
    y_pred_proba = modelo.predict_proba(X_test)[:, 1]
    
    # Métricas
    print("\n=== EVALUACIÓN DEL MODELO ===")
    print(f"OOB Score: {modelo.oob_score_:.3f}")
    print(f"AUC-ROC: {roc_auc_score(y_test, y_pred_proba):.3f}")
    
    print("\nReporte de Clasificación:")
    print(classification_report(y_test, y_pred))
    
    print("\nMatriz de Confusión:")
    print(confusion_matrix(y_test, y_pred))
    
    return {
        'oob_score': modelo.oob_score_,
        'auc_roc': roc_auc_score(y_test, y_pred_proba),
        'predictions': y_pred,
        'probabilities': y_pred_proba
    }

def comparar_con_otros_modelos(X_train, y_train, X_test, y_test):
    """
    Compara Random Forest con otros modelos
    """
    from sklearn.linear_model import LogisticRegression
    from sklearn.svm import SVC
    from sklearn.ensemble import GradientBoostingClassifier
    
    modelos = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'SVM': SVC(random_state=42, probability=True),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42)
    }
    
    resultados = {}
    
    print("\n=== COMPARACIÓN DE MODELOS ===")
    for nombre, modelo in modelos.items():
        # Entrenar
        modelo.fit(X_train, y_train)
        
        # Evaluar
        y_pred_proba = modelo.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, y_pred_proba)
        
        # Validación cruzada
        cv_scores = cross_val_score(modelo, X_train, y_train, cv=5, scoring='f1')
        
        resultados[nombre] = {
            'AUC': auc,
            'F1_CV_mean': cv_scores.mean(),
            'F1_CV_std': cv_scores.std()
        }
        
        print(f"{nombre}:")
        print(f"  AUC: {auc:.3f}")
        print(f"  F1 CV: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    return resultados

def main():
    """
    Función principal que ejecuta todo el pipeline
    """
    print("=== RANDOM FOREST PARA RIESGOS OCUPACIONALES ===\n")
    
    # 1. Generar datos
    print("1. Generando datos simulados...")
    df = generar_datos_simulados(1000)
    print(f"Dataset generado: {df.shape}")
    print(f"Distribución de riesgo: {df['riesgo_alto'].value_counts()}")
    
    # 2. Preparar variables dummy
    print("\n2. Preparando variables dummy...")
    df_processed = preparar_variables_dummy(df)
    print(f"Características después de dummies: {df_processed.shape[1] - 1}")
    print(f"Variables dummy creadas: {[col for col in df_processed.columns if '_' in col and col != 'experiencia_años' and col != 'horas_trabajo_semanal']}")
    
    # 3. Dividir datos
    X = df_processed.drop('riesgo_alto', axis=1)
    y = df_processed['riesgo_alto']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nDatos de entrenamiento: {X_train.shape}")
    print(f"Datos de prueba: {X_test.shape}")
    
    # 4. Entrenar Random Forest
    print("\n3. Entrenando Random Forest...")
    rf_model = entrenar_random_forest(X_train, y_train, optimizar_hiperparametros=False)
    
    # 5. Analizar importancia
    print("\n4. Analizando importancia de características...")
    feature_importance_df = analizar_importancia_caracteristicas(rf_model, X.columns.tolist())
    
    # 6. Evaluar modelo
    print("\n5. Evaluando modelo...")
    resultados = evaluar_modelo(rf_model, X_test, y_test)
    
    # 7. Comparar con otros modelos
    print("\n6. Comparando con otros modelos...")
    comparacion = comparar_con_otros_modelos(X_train, y_train, X_test, y_test)
    
    # 8. Resumen final
    print("\n=== RESUMEN FINAL ===")
    print(f"Random Forest - OOB Score: {rf_model.oob_score_:.3f}")
    print(f"Random Forest - AUC: {resultados['auc_roc']:.3f}")
    print(f"Número de árboles: {rf_model.n_estimators}")
    print(f"Profundidad máxima: {rf_model.max_depth}")
    
    print("\nTop 5 características más importantes:")
    for idx, row in feature_importance_df.head().iterrows():
        tipo = "Dummy" if row['is_dummy'] else "Numérica"
        print(f"  {row['feature']} ({tipo}): {row['importance']:.3f}")
    
    return rf_model, feature_importance_df, resultados

if __name__ == "__main__":
    modelo, importancias, resultados = main()
