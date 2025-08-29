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

# Supabase getPrediction payload shape
class MetricRow(BaseModel):
    metric_date: str | None = None
    Age: float | None = None
    Sodium: float | None = None
    Creatinine: float | None = None
    Urea: float | None = None
    # allow extra keys without validation errors
    class Config:
        extra = "allow"

class SupabasePredictPayload(BaseModel):
    patient_id: str
    metrics: list[MetricRow] = []

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
def predict(payload: dict):
    # Accept either direct PatientData or SupabasePredictPayload
    features: list[float]
    patient_id: str | None = None
    try:
        # Try PatientData
        pd = PatientData(**payload)
        features = [pd.Age, pd.Sodium, pd.Creatinine, pd.Urea]
    except Exception:
        # Try Supabase payload
        sb = SupabasePredictPayload(**payload)
        patient_id = sb.patient_id
        # pick the latest metric row (request sorted desc, but fallback to first)
        latest = sb.metrics[0] if sb.metrics else MetricRow()
        # fallback: compute simple means if fields missing
        def val(name: str) -> float:
            v = getattr(latest, name, None)
            if v is None:
                # Search in other metric rows for first non-null
                for m in sb.metrics:
                    mv = getattr(m, name, None)
                    if mv is not None:
                        return float(mv)
                return 0.0
            return float(v)
        features = [val("Age"), val("Sodium"), val("Creatinine"), val("Urea")]

    # Readmission Prediction
    read_pred = pipe_read.predict([features])[0]
    read_proba = pipe_read.predict_proba([features])[0].tolist()
    read_expl, _ = get_shap_explanation(pipe_read, features, "Readmission")

    # Severity Prediction
    sev_pred = pipe_sev.predict([features])[0]
    sev_proba = pipe_sev.predict_proba([features])[0].tolist()
    sev_expl, _ = get_shap_explanation(pipe_sev, features, "Severity")

    # ML service compatible fields for Supabase function
    # risk_score: use probability of positive readmission class (assume class 1)
    try:
        # If classes not [0,1], map by index of class '1'
        classes = getattr(pipe_read.named_steps["clf"], "classes_", [0,1])
        idx1 = list(classes).index(1) if 1 in list(classes) else int(np.argmax(read_proba))
        risk_score = float(read_proba[idx1])
    except Exception:
        risk_score = float(read_proba[-1])

    explanation = {
        "readmission": {
            "prediction": int(read_pred),
            "probabilities": read_proba,
            "top_features": read_expl,
        },
        "severity": {
            "prediction": str(sev_pred),
            "probabilities": sev_proba,
            "top_features": sev_expl,
        },
        "features_used": {
            "Age": features[0],
            "Sodium": features[1],
            "Creatinine": features[2],
            "Urea": features[3],
        },
        **({"patient_id": patient_id} if patient_id else {}),
    }

    # Simple conditions list based on top drivers signs
    high_risk_conditions = [
        feat.split(" ")[0] for feat in read_expl if "increases" in feat
    ][:2]

    return {
        "risk_score": risk_score,
        "high_risk_conditions": high_risk_conditions,
        "explanation": explanation,
        # keep original detailed blocks for UI usage
        "Readmission": {
            "Prediction": int(read_pred),
            "Probabilities": read_proba,
            "Top_Features": read_expl,
        },
        "Severity": {
            "Prediction": str(sev_pred),
            "Probabilities": sev_proba,
            "Top_Features": sev_expl,
        },
    }

@app.get("/")
def read_root():
    return {"message": "Health AI API is running! Go to /docs for testing."}

@app.get("/health")
def health():
    return {"ok": True}