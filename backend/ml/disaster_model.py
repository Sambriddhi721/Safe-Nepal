import pickle
import numpy as np
from config import MODEL_PATH, SCALER_PATH

# =========================
# LOAD MODEL ONCE
# =========================
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)


def predict_disaster(data: dict) -> str:
    """
    data: dict with weather values
    returns: "Normal" | "Flood" | "Landslide"
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

        scaled = scaler.transform(features)
        prediction = model.predict(scaled)[0]

        if prediction == 1:
            return "Flood"
        elif prediction == 2:
            return "Landslide"
        return "Normal"

    except KeyError as e:
        return f"Missing input field: {e}"

    except Exception as e:
        return f"Prediction error: {str(e)}"
