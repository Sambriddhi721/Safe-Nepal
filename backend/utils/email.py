from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from flask import current_app

mail = Mail()
serializer = URLSafeTimedSerializer("email-secret-key")

def send_verification_email(user):
    token = serializer.dumps(user.email)
    verify_url = f"http://localhost:5000/api/auth/verify-email/{token}"

    msg = Message(
        subject="Verify your Safe Nepal account",
        recipients=[user.email],
        body=f"""
Hello {user.full_name},

Please verify your email by clicking the link below:

{verify_url}

If you did not request this, you can safely ignore this email.

– Safe Nepal Team
"""
    )

    mail.send(msg)
