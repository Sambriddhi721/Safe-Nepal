from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from db.models import db, SOSRequest
from extensions import socketio  # ✅ no circular import

sos_bp = Blueprint("sos", __name__)

# =========================
# SEND SOS (USER)
# =========================
@sos_bp.route("/send", methods=["POST"])
@jwt_required()
def send_sos():
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "USER" or not claims.get("email_verified"):
        return jsonify({"message": "Not allowed"}), 403

    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid request"}), 400

    sos = SOSRequest(
        user_id=user_id,
        message=data.get("message", "Emergency"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        status="ACTIVE"
    )

    db.session.add(sos)
    db.session.commit()

    # 🔴 REAL-TIME BROADCAST TO HELPERS
    socketio.emit(
        "sos-update",
        {
            "sosId": sos.id,
            "status": "ACTIVE",
            "lat": sos.latitude,
            "lng": sos.longitude,
            "message": sos.message
        },
        to="helper"
    )

    return jsonify({
        "message": "SOS sent",
        "sosId": sos.id
    }), 201


# =========================
# GET ALL ACTIVE SOS (HELPER)
# =========================
@sos_bp.route("/all", methods=["GET"])
@jwt_required()
def all_sos():
    claims = get_jwt()

    if claims.get("role") != "HELPER":
        return jsonify({"message": "Forbidden"}), 403

    sos_list = SOSRequest.query.filter_by(status="ACTIVE").all()

    return jsonify([
        {
            "id": s.id,
            "message": s.message,
            "lat": s.latitude,
            "lng": s.longitude,
            "status": s.status
        }
        for s in sos_list
    ]), 200


# =========================
# ACCEPT SOS (HELPER)
# =========================
@sos_bp.route("/<int:sos_id>/accept", methods=["PATCH"])
@jwt_required()
def accept_sos(sos_id):
    claims = get_jwt()

    if claims.get("role") != "HELPER":
        return jsonify({"message": "Forbidden"}), 403

    sos = SOSRequest.query.get_or_404(sos_id)
    sos.status = "ACCEPTED"
    db.session.commit()

    socketio.emit(
        "sos-update",
        {
            "sosId": sos.id,
            "status": "ACCEPTED"
        },
        to="helper"
    )

    return jsonify({"message": "SOS accepted"}), 200


# =========================
# RESOLVE SOS (HELPER)
# =========================
@sos_bp.route("/<int:sos_id>/resolve", methods=["PATCH"])
@jwt_required()
def resolve_sos(sos_id):
    claims = get_jwt()

    if claims.get("role") != "HELPER":
        return jsonify({"message": "Forbidden"}), 403

    sos = SOSRequest.query.get_or_404(sos_id)
    sos.status = "RESOLVED"
    db.session.commit()

    socketio.emit(
        "sos-update",
        {
            "sosId": sos.id,
            "status": "RESOLVED"
        },
        to="helper"
    )

    return jsonify({"message": "SOS resolved"}), 200
