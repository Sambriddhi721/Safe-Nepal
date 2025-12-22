from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import decode_token
from flask_socketio import join_room

from db.models import db
from ml.disaster_model import predict_disaster
from config import SQLALCHEMY_DATABASE_URI, JWT_SECRET_KEY
from extensions import socketio, jwt

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
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY

# =========================
# EXTENSIONS
# =========================

db.init_app(app)
jwt.init_app(app)
socketio.init_app(app)

# =========================
# ROUTES
# =========================

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(sos_bp, url_prefix="/api/sos")

# =========================
# ROOT
# =========================

@app.route("/")
def root():
    return jsonify({"status": "Safe Nepal Backend is running"})

# =========================
# ML PREDICTION
# =========================

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    if not data:
        return jsonify({"error": "No input data"}), 400

    try:
        result = predict_disaster(data)
        return jsonify({"prediction": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# SOCKET EVENTS
# =========================

@socketio.on("connect")
def handle_connect(auth=None):
    try:
        if not auth or "token" not in auth:
            print("Socket connection rejected: no token")
            return False

        decoded = decode_token(auth["token"])
        role = decoded.get("role")

        if role in ["HELPER", "POLICE"]:
            join_room(role.lower())

        print("Socket connected:", decoded.get("sub"))

    except Exception as e:
        print("Socket auth failed:", e)
        return False


@socketio.on("user-location")
def handle_user_location(data):
    socketio.emit("live-location", data, to="helper")
    socketio.emit("live-location", data, to="police")


@socketio.on("sos-update")
def handle_sos_update(data):
    socketio.emit("sos-update", data, to="helper")
    socketio.emit("sos-update", data, to="police")

# =========================
# RUN
# =========================

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
