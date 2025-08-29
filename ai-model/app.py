from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import shap

# ---------------- Load Models ----------------
try:
    pipe_read = joblib.load("readmission_pipeline.joblib")
    pipe_sev = joblib.load("severity_pipeline.joblib")
except Exception as e:
    raise RuntimeError(f"Failed to load models: {e}")

app = FastAPI(title="Health AI Demo", description="Predict Readmission & Severity with Explanation", version="1.0")

# CORS (allow local dev and any origin override via env)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Input Schema ----------------
class PatientData(BaseModel):
    Age: float
    Sodium: float
    Creatinine: float
    Urea: float

# ---------------- Helper: Explain with SHAP ----------------
def get_shap_explanation(pipe, features, problem="Readmission"):
    model = pipe.named_steps["clf"]
    scaler = pipe.named_steps["scaler"]

    X_scaled = scaler.transform([features])

    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_scaled, check_additivity=False)
    except Exception:
        explainer = shap.Explainer(model.predict, X_scaled)
        shap_values = explainer(X_scaled, check_additivity=False).values

    # Handle binary/multiclass outputs
    if isinstance(shap_values, list):
        try:
            cls_idx = int(np.argmax(model.predict_proba(X_scaled)[0]))
        except Exception:
            cls_idx = 1 if len(shap_values) > 1 else 0
        shap_sample = shap_values[cls_idx][0]
    else:
        shap_sample = shap_values[0]

    shap_sample = np.array(shap_sample).flatten()
    feature_names = ["Age", "Sodium", "Creatinine", "Urea"]

    # Rank top 2 features
    feature_importance = sorted(
        zip(feature_names, shap_sample),
        key=lambda x: abs(x[1]),
        reverse=True
    )

    top_features = []
    for feat, val in feature_importance[:2]:
        direction = "↑ increases risk" if val > 0 else "↓ decreases risk"
        top_features.append(f"{feat} ({val:.3f}) → {direction}")

    return top_features, X_scaled

# ---------------- Routes ----------------
@app.post("/predict")
def predict(patient: PatientData):
    features = [patient.Age, patient.Sodium, patient.Creatinine, patient.Urea]

    # Readmission Prediction
    read_pred = pipe_read.predict([features])[0]
    read_proba = pipe_read.predict_proba([features])[0].tolist()
    read_expl, _ = get_shap_explanation(pipe_read, features, "Readmission")

    # Severity Prediction
    sev_pred = pipe_sev.predict([features])[0]
    sev_proba = pipe_sev.predict_proba([features])[0].tolist()
    sev_expl, _ = get_shap_explanation(pipe_sev, features, "Severity")

    return {
        "Readmission": {
            "Prediction": int(read_pred),
            "Probabilities": read_proba,
            "Top_Features": read_expl
        },
        "Severity": {
            "Prediction": sev_pred,
            "Probabilities": sev_proba,
            "Top_Features": sev_expl
        }
    }
@app.get("/")
def read_root():
    return {"message": "Health AI API is running! Go to /docs for testing."}