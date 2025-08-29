import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score, confusion_matrix
import joblib
import shap

# ---------------- Load Data ----------------
df = pd.read_csv("patients_dataset.csv")

# ---------------- Train Readmission Model ----------------
Xr = df[["Age", "Sodium", "Creatinine", "Urea"]]
yr = df["Readmission"]

Xr_train, Xr_test, yr_train, yr_test = train_test_split(
    Xr, yr, test_size=0.2, random_state=42, stratify=yr if len(np.unique(yr)) > 1 else None
)

pipe_read = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced"))
])

print("\nTraining Readmission ...")
pipe_read.fit(Xr_train, yr_train)
yr_pred = pipe_read.predict(Xr_test)

print("Readmission Accuracy on test set:", accuracy_score(yr_test, yr_pred))
try:
    proba = pipe_read.predict_proba(Xr_test)[:, 1]
    auc = roc_auc_score(yr_test, proba)
    print("Readmission ROC-AUC:", round(auc, 3))
except Exception:
    pass
print("Readmission Confusion Matrix:\n", confusion_matrix(yr_test, yr_pred))
print(classification_report(yr_test, yr_pred))

joblib.dump(pipe_read, "readmission_pipeline.joblib")
print("Saved pipeline to readmission_pipeline.joblib")

# ---------------- Train Severity Model ----------------
Xs = df[["Age", "Sodium", "Creatinine", "Urea"]]
ys = df["Severity"]

Xs_train, Xs_test, ys_train, ys_test = train_test_split(
    Xs, ys, test_size=0.2, random_state=42, stratify=ys if len(np.unique(ys)) > 1 else None
)

pipe_sev = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(n_estimators=200, random_state=42))
])

print("\nTraining Severity ...")
pipe_sev.fit(Xs_train, ys_train)
ys_pred = pipe_sev.predict(Xs_test)

print("Severity Accuracy on test set:", accuracy_score(ys_test, ys_pred))
print("Severity Confusion Matrix:\n", confusion_matrix(ys_test, ys_pred, labels=sorted(ys.unique())))
print(classification_report(ys_test, ys_pred))

joblib.dump(pipe_sev, "severity_pipeline.joblib")
print("Saved pipeline to severity_pipeline.joblib")

# ---------------- SHAP Explanation Function ----------------
def explain_with_shap(pipe, X_train, X_test, sample_idx=0, problem="binary"):
    model = pipe.named_steps["clf"]
    scaler = pipe.named_steps["scaler"]

    X_test_scaled = scaler.transform(X_test)

    print(f"\n🔍 SHAP Explanation for {problem} model (sample {sample_idx}):")

    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test_scaled, check_additivity=False)
    except Exception:
        print("TreeExplainer failed, using generic Explainer...")
        explainer = shap.Explainer(model.predict, X_test_scaled)
        shap_values = explainer(X_test_scaled, check_additivity=False).values

    # --- pick correct SHAP output ---
    if isinstance(shap_values, list):
        # Choose SHAP for the predicted class of this sample (handles binary and multiclass)
        try:
            cls_idx = int(np.argmax(model.predict_proba(X_test_scaled)[sample_idx]))
        except Exception:
            cls_idx = 1 if len(shap_values) > 1 else 0
        shap_sample = shap_values[cls_idx][sample_idx]
    else:
        # For multiclass or regression
        shap_sample = shap_values[sample_idx]

    # --- flatten if needed ---
    shap_sample = np.array(shap_sample).flatten()

    feature_names = X_test.columns

    # Rank features by absolute SHAP value
    feature_importance = sorted(
        zip(feature_names, shap_sample),
        key=lambda x: abs(x[1]),
        reverse=True
    )

    # Print top 3 reasons
    for feat, val in feature_importance[:3]:
        direction = "↑ increases risk" if val > 0 else "↓ decreases risk"
        print(f"Feature '{feat}' ({val:.3f}) → {direction}")

    # Show probability prediction
    probas = model.predict_proba(X_test_scaled)[sample_idx]
    print("\n📊 Prediction Probabilities:", probas)
    print("👉 Model Prediction:", model.classes_[np.argmax(probas)])

# ---------------- Run Explanations ----------------
explain_with_shap(pipe_read, Xr_train, Xr_test, sample_idx=0, problem="Readmission")
explain_with_shap(pipe_sev, Xs_train, Xs_test, sample_idx=0, problem="Severity")