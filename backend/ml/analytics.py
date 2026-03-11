import pickle
import numpy as np
import os

# Get paths relative to this file
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'national_flood_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'national_scaler.pkl')

# Load model and scaler globally so they stay in memory
try:
    with open(MODEL_PATH, 'rb') as f:
        flood_model = pickle.load(f)
    with open(SCALER_PATH, 'rb') as f:
        flood_scaler = pickle.load(f)
    print("✅ Flood model and scaler loaded successfully.")
except FileNotFoundError:
    print("❌ Error: .pkl files not found in /ml folder.")

def run_flood_prediction(weather_data):
    """
    Takes weather_data: [Rainfall, Water Level, Temp, Humidity]
    Returns a dictionary with risk and trend.
    """
    # 1. Prepare and scale the input
    raw_input = np.array([weather_data])
    scaled_input = flood_scaler.transform(raw_input)

    # 2. Get Probability
    # predict_proba returns [[prob_0, prob_1]] where prob_1 is "flood"
    prob = flood_model.predict_proba(scaled_input)[0][1]

    # 3. Categorize Risk
    risk = "High Risk" if prob > 0.7 else "Medium Risk" if prob > 0.4 else "Low Risk"

    # 4. Generate a mock trend based on current prob for the UI chart
    # (In a real app, you would store historical predictions in a database)
    trend = [round(max(0, prob + np.random.uniform(-0.1, 0.1)) * 100, 1) for _ in range(7)]

    return {
        "risk_level": risk,
        "probability": round(prob * 100, 2),
        "trend": trend,
        "accuracy": 92,
        "model_type": "Random Forest (V1)"
    }