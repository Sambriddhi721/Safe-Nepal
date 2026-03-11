from flask import Blueprint, request, jsonify
from models import db, Incident
from flask_jwt_extended import jwt_required, get_jwt_identity

incident_bp = Blueprint('incident', __name__)

@incident_bp.route('/', methods=['POST'])
@jwt_required()
def create_incident():
    data = request.get_json()
    user_id = get_jwt_identity()

    incident = Incident(
        user_id=user_id,
        title=data['title'],
        description=data.get('description'),
        location=data['location'],
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        incident_type=data.get('type'),
        status='pending'
    )
    db.session.add(incident)
    db.session.commit()

    return jsonify({"message": "Incident reported!"}), 201

@incident_bp.route('/', methods=['GET'])
def get_incidents():
    incidents = Incident.query.all()
    return jsonify([i.to_dict() for i in incidents])