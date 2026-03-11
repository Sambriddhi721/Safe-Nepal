import os

# Absolute path to backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =========================
# DATABASE
# =========================
SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(
    BASE_DIR, "instance", "safe_nepal.db"
)
SQLALCHEMY_TRACK_MODIFICATIONS = False

# =========================
# SECURITY
# =========================
JWT_SECRET_KEY = "dev-jwt-secret-456"
SECRET_KEY = "safe-nepal-app-key-2026"

# =========================
# EMAIL CONFIGURATION
# =========================
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = os.environ.get("MAIL_USERNAME") or "your-email@gmail.com"
MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD") or "your-app-password"

# =========================
# ML MODEL PATHS (IMPORTANT)
# =========================
MODEL_PATH = os.path.join(BASE_DIR, "ml", "national_flood_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "ml", "national_scaler.pkl")
