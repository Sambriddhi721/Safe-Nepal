import os
import pickle
import numpy as np
from config import MODEL_PATH, SCALER_PATH

# =========================
# LOAD MODEL & SCALER ONCE
# =========================
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

if not os.path.exists(SCALER_PATH):
    raise FileNotFoundError(f"Scaler file not found: {SCALER_PATH}")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)


def predict_disaster(data: dict) -> str:
    """
    Input: weather data dictionary
    Output: "Normal" | "Flood" | "Landslide"
    """

    try:
        features = np.array([[  
            data["Damak_temp"],
            data["Dhangadhi_temp"],
            data["Bharatpur_temp"],
            data["Pokhara_temp"],
            data["Kathmandu_temp"],

            data["Damak_rf"],
            data["Dhangadhi_rf"],
            data["Bharatpur_rf"],
            data["Pokhara_rf"],
            data["Kathmandu_rf"],

            data["Damak_rh"],
            data["Dhangadhi_rh"],
            data["Bharatpur_rh"],
            data["Pokhara_rh"],
            data["Kathmandu_rh"],
        ]])

        scaled_features = scaler.transform(features)
        prediction = model.predict(scaled_features)[0]

        if prediction == 1:
            return "Flood"
        elif prediction == 2:
            return "Landslide"
        else:
            return "Normal"

    except KeyError as e:
        return f"Missing input field: {e}"

    except Exception as e:
        return f"Prediction error: {str(e)}"
