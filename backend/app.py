# =========================
# Safe Nepal Backend - app.py
# =========================

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import decode_token
from flask_socketio import join_room
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
import os
import pickle
import numpy as np
import requests

# =========================
# LOCAL IMPORTS
# =========================
from db.models import db, User
from config import (
    SQLALCHEMY_DATABASE_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS,
    JWT_SECRET_KEY,
    MAIL_SERVER,
    MAIL_PORT,
    MAIL_USE_TLS,
    MAIL_USERNAME,
    MAIL_PASSWORD
)
from extensions import jwt, socketio, mail, serializer as ext_serializer
from routes.auth import auth_bp
from routes.sos import sos_bp

# =========================
# APP INIT
# =========================
app = Flask(__name__)
CORS(app)

# =========================
# CONFIG
# =========================
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY

# Email
app.config["MAIL_SERVER"] = MAIL_SERVER
app.config["MAIL_PORT"] = MAIL_PORT
app.config["MAIL_USE_TLS"] = MAIL_USE_TLS
app.config["MAIL_USERNAME"] = MAIL_USERNAME
app.config["MAIL_PASSWORD"] = MAIL_PASSWORD

# =========================
# INIT EXTENSIONS
# =========================
db.init_app(app)
jwt.init_app(app)
mail.init_app(app)
socketio.init_app(app, cors_allowed_origins="*")

# Serializer (shared with auth routes)
ext_serializer = URLSafeTimedSerializer(app.config["JWT_SECRET_KEY"])

# =========================
# LOAD ML MODELS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "ml", "national_flood_model.pkl"), "rb") as f:
    flood_model = pickle.load(f)

with open(os.path.join(BASE_DIR, "ml", "national_scaler.pkl"), "rb") as f:
    flood_scaler = pickle.load(f)

print("✅ ML models loaded")

# =========================
# ROOT ROUTE
# =========================
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Safe Nepal Backend Running 🚀",
        "endpoints": {
            "auth": "/api/auth",
            "sos": "/api/sos",
            "analytics": "/analytics"
        }
    })

# =========================
# BLUEPRINTS
# =========================
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(sos_bp, url_prefix="/api/sos")

# =========================
# EMAIL VERIFICATION
# =========================
@app.route("/api/auth/verify/<token>", methods=["GET"])
def verify_email(token):
    try:
        email = ext_serializer.loads(
            token,
            salt="email-confirm",
            max_age=86400
        )
    except SignatureExpired:
        return "Verification link expired", 400
    except Exception:
        return "Invalid verification link", 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return "User not found", 404

    user.email_verified = True
    db.session.commit()
    return "Email verified successfully ✅", 200

# =========================
# ANALYTICS (ML + WEATHER)
# =========================
WEATHER_API_KEY = "3b2556b5414e1a2fb4f739c28ae3bc1b"
CITY = "Kathmandu"

@app.route("/analytics", methods=["POST"])
def analytics():
    weather_url = (
        f"http://api.openweathermap.org/data/2.5/weather"
        f"?q={CITY}&appid={WEATHER_API_KEY}&units=metric"
    )

    weather = requests.get(weather_url).json()

    rainfall = weather.get("rain", {}).get("1h", 0)
    temp = weather["main"]["temp"]
    humidity = weather["main"]["humidity"]
    water_level = 3.2  # demo sensor value

    features = np.array([[rainfall, water_level, temp, humidity]])
    scaled = flood_scaler.transform(features)
    prob = flood_model.predict_proba(scaled)[0][1]

    risk = (
        "High Risk" if prob > 0.7
        else "Medium Risk" if prob > 0.4
        else "Low Risk"
    )

    return jsonify({
        "city": CITY,
        "risk_level": risk,
        "probability": round(prob * 100, 2)
    })

# =========================
# SOCKET.IO AUTH
# =========================
@socketio.on("connect")
def socket_connect(auth):
    if not auth or "token" not in auth:
        return False

    try:
        decoded = decode_token(auth["token"])
        role = decoded.get("role")

        if role in ["HELPER", "POLICE"]:
            join_room(role.lower())
    except Exception:
        return False

@socketio.on("user-location")
def user_location(data):
    socketio.emit("live-location", data, to="helper")
    socketio.emit("live-location", data, to="police")

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    print("🚀 Safe Nepal Backend Started")
    print("🌐 PC: http://localhost:5000")
    print("📱 Mobile: http://192.168.111.72:5000")

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True
    )
