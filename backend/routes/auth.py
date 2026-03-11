import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from db.models import db, User

# Initialize the Blueprint correctly
auth_bp = Blueprint("auth", __name__)

# REPLACE with your actual Client ID from Google Cloud Console
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com"

@auth_bp.route("/social-login", methods=["POST"])
def social_login():
    data = request.json
    provider = data.get("provider")
    token = data.get("token")
    user_info = None

    # --- VERIFY GOOGLE ---
    if provider == "google":
        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            user_info = {
                "email": idinfo['email'],
                "full_name": idinfo.get('name', 'Google User'),
                "google_id": idinfo['sub'],
                "verified": idinfo.get('email_verified', False)
            }
        except Exception as e:
            return jsonify({"message": f"Invalid Google Token: {str(e)}"}), 400

    # --- VERIFY FACEBOOK ---
    elif provider == "facebook":
        fb_url = f"https://graph.facebook.com/me?fields=id,name,email&access_token={token}"
        fb_res = requests.get(fb_url).json()
        if "error" in fb_res:
            return jsonify({"message": "Invalid Facebook Token"}), 400
        user_info = {
            "email": fb_res.get("email"),
            "full_name": fb_res.get("name"),
            "facebook_id": fb_res.get("id"),
            "verified": True 
        }

    if not user_info or not user_info["email"]:
        return jsonify({"message": "Could not retrieve user info"}), 400

    # --- FIND OR CREATE USER ---
    user = User.query.filter_by(email=user_info["email"]).first()

    if not user:
        user = User(
            full_name=user_info["full_name"],
            email=user_info["email"],
            password=None, # Set to None as discussed for social users
            role="USER",
            email_verified=user_info["verified"],
            google_id=user_info.get("google_id"),
            facebook_id=user_info.get("facebook_id")
        )
        db.session.add(user)
        db.session.commit()

    # --- GENERATE JWT ---
    access_token = create_access_token(
        identity=str(user.id),
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