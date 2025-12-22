import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =========================
# DATABASE
# =========================
SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(
    BASE_DIR, "instance", "/safe_nepal.db"
)

# SECRET_KEY="dev-secret-key-123"

# =========================
# SECURITY
# =========================
JWT_SECRET_KEY = "dev-jwt-secret-456"

# =========================
# ML MODEL PATHS
# =========================
MODEL_PATH = os.path.join(
    BASE_DIR, "national_flood_model.pkl"
)

SCALER_PATH = os.path.join(
    BASE_DIR, "national_scaler.pkl"
)
