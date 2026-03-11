from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from itsdangerous import URLSafeTimedSerializer

socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")
jwt = JWTManager()
mail = Mail()
serializer = None  # initialized in app.py
