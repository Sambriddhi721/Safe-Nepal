from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db.models import db, User
from flask_mail import Message
from extensions import mail, serializer

auth_bp = Blueprint("auth", __name__)

# =========================
# SEND VERIFICATION EMAIL
# =========================
def send_verification_email(email):
    token = serializer.dumps(email, salt="email-confirm")

    verify_url = f"http://192.168.111.72:5000/api/auth/verify/{token}"

    msg = Message(
        subject="Verify Your Safe Nepal Account",
        sender="noreply@safenepal.com",
        recipients=[email]
    )

    msg.body = f"""
Welcome to Safe Nepal!

Click the link below to verify your email:
{verify_url}

If you didn’t create this account, ignore this email.
"""

    mail.send(msg)

# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    user = User(
        full_name=data["full_name"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role="USER",
        email_verified=False
    )

    db.session.add(user)
    db.session.commit()

    send_verification_email(user.email)

    return jsonify({"message": "Registered. Please verify your email."}), 201

# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(
        identity=user.id,
        additional_claims={
            "role": user.role,
            "email_verified": user.email_verified
        }
    )

    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "role": user.role,
            "email_verified": user.email_verified
        }
    }), 200

# =========================
# CURRENT USER
# =========================
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = User.query.get(get_jwt_identity())
    return jsonify({
        "email": user.email,
        "role": user.role,
        "email_verified": user.email_verified
    })
