# =========================
# Safe Nepal Backend - app.py
# =========================

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import decode_token, create_access_token
from flask_socketio import join_room
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
import os
import pickle
import numpy as np
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
from extensions import jwt, socketio, mail
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

# Email Config
app.config["MAIL_SERVER"] = MAIL_SERVER
app.config["MAIL_PORT"] = MAIL_PORT
app.config["MAIL_USE_TLS"] = MAIL_USE_TLS
app.config["MAIL_USERNAME"] = MAIL_USERNAME
app.config["MAIL_PASSWORD"] = MAIL_PASSWORD

# Replace this with your actual Web Client ID from Google Cloud Console
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com"

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

try:
    with open(os.path.join(BASE_DIR, "ml", "national_flood_model.pkl"), "rb") as f:
        flood_model = pickle.load(f)

    with open(os.path.join(BASE_DIR, "ml", "national_scaler.pkl"), "rb") as f:
        flood_scaler = pickle.load(f)
    print("✅ ML models loaded")
except FileNotFoundError:
    print("⚠️ ML models not found. Analytics route will fail.")

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
# SOCIAL LOGIN LOGIC
# =========================
@app.route("/api/auth/social-login", methods=["POST"])
def social_login():
    data = request.json
    provider = data.get("provider")
    token = data.get("token")
    user_info = None

    try:
        if provider == "google":
            # Verify Google Token using the installed google-auth library
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            user_info = {
                "email": idinfo['email'],
                "full_name": idinfo.get('name', 'Google User'),
                "verified": idinfo.get('email_verified', False)
            }
        elif provider == "facebook":
            # Verify Facebook Token via Graph API
            fb_url = f"https://graph.facebook.com/me?fields=id,name,email&access_token={token}"
            fb_res = requests.get(fb_url).json()
            if "error" in fb_res:
                return jsonify({"message": "Invalid Facebook Token"}), 400
            user_info = {
                "email": fb_res.get("email"),
                "full_name": fb_res.get("name"),
                "verified": True
            }

        if not user_info or not user_info["email"]:
            return jsonify({"message": "Authentication failed"}), 400

        # Find or Create User logic
        user = User.query.filter_by(email=user_info["email"]).first()
        if not user:
            user = User(
                full_name=user_info["full_name"],
                email=user_info["email"],
                password=None, # Social users have no password
                role="USER",
                email_verified=user_info["verified"]
            )
            db.session.add(user)
            db.session.commit()

        # Generate App JWT
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role, "email_verified": user.email_verified}
        )

        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "role": user.role,
                "email_verified": user.email_verified
            }
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 400

# =========================
# EMAIL VERIFICATION
# =========================
@app.route("/api/auth/verify/<token>", methods=["GET"])
def verify_email(token):
    try:
        email = ext_serializer.loads(token, salt="email-confirm", max_age=86400)
        user = User.query.filter_by(email=email).first()
        if not user:
            return "User not found", 404
        user.email_verified = True
        db.session.commit()
        return "Email verified successfully ✅", 200
    except (SignatureExpired, Exception):
        return "Invalid or expired link", 400

# =========================
# ANALYTICS (ML + WEATHER)
# =========================
@app.route("/analytics", methods=["POST"])
def analytics():
    # Simple analytics endpoint using the loaded flood model
    try:
        data = request.json
        rainfall = data.get("rainfall", 0)
        water_level = data.get("water_level", 0)
        temp = data.get("temp", 20)
        humidity = data.get("humidity", 50)

        features = np.array([[rainfall, water_level, temp, humidity]])
        scaled = flood_scaler.transform(features)
        prob = flood_model.predict_proba(scaled)[0][1]

        risk = "High" if prob > 0.7 else "Medium" if prob > 0.4 else "Low"

        return jsonify({
            "risk_level": risk,
            "probability": round(prob * 100, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# SOCKET.IO LOGIC
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
    except:
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
    # Bind to 0.0.0.0 to allow mobile connections on the same network
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)