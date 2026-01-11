from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)  # Hashed password
    role = db.Column(db.String(20), default="USER")  # USER | HELPER | POLICE
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    sos_requests = db.relationship('SOSRequest', backref='user', lazy=True)
    email_verifications = db.relationship('EmailVerification', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email} - {self.role}>'

class EmailVerification(db.Model):
    __tablename__ = 'email_verification'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<EmailVerification for User {self.user_id}>'

class SOSRequest(db.Model):
    __tablename__ = 'sos_request'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="PENDING")  # PENDING / ACCEPTED / RESOLVED
    helper_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Who accepted it
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<SOSRequest {self.id} by User {self.user_id} - Status: {self.status}>'