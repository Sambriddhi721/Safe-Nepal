from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from db.models import db, User

auth_bp = Blueprint("auth", __name__)

# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    if not full_name or not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already registered"}), 409

    # Default role = USER
    user = User(
        full_name=full_name,
        email=email,
        password=generate_password_hash(password),
        role="USER",
        email_verified=False
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registered successfully"}), 201


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    # 🔴 CORRECT JWT STRUCTURE
    access_token = create_access_token(
        identity=user.id,
        additional_claims={
            "role": user.role,
            "email_verified": user.email_verified
        }
    )

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "role": user.role,
            "email_verified": user.email_verified
        }
    }), 200
