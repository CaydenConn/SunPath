# backend/routes/users.py
from flask import Blueprint, jsonify, request, current_app
from datetime import datetime, timedelta, timezone
import jwt

from models.database import get_db
from models.user import User

users_bp = Blueprint("users", __name__, url_prefix="/api")

def _issue_token(email: str):
    secret = current_app.config.get("JWT_SECRET_KEY", "jwt-secret-string")
    exp_seconds = int(current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    payload = {
        "sub": email,
        "iat": datetime.now(tz=timezone.utc),
        "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=exp_seconds),
    }
    return jwt.encode(payload, secret, algorithm="HS256")

@users_bp.post("/auth/signup")
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    display_name = (data.get("display_name") or "").strip() or None
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    db = get_db()
    existing = db.get_user_by_email(email)
    if existing:
        return jsonify({"error": "email already in use"}), 409

    user = User.from_signup(email=email, password=password, display_name=display_name)
    saved = db.create_user(user.to_dict())
    user.id = saved.get("id")
    token = _issue_token(user.email)
    return jsonify({"user": user.to_public(), "token": token})

@users_bp.post("/auth/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    db = get_db()
    record = db.get_user_by_email(email)
    if not record:
        return jsonify({"error": "invalid credentials"}), 401

    user = User(**record)
    if not user.verify_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    token = _issue_token(user.email)
    return jsonify({"user": user.to_public(), "token": token})

@users_bp.get("/me")
def me():
    """Very small auth check using Authorization: Bearer <token>"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "missing token"}), 401
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, current_app.config.get("JWT_SECRET_KEY", "jwt-secret-string"), algorithms=["HS256"])
        email = payload.get("sub")
        db = get_db()
        record = db.get_user_by_email(email)
        if not record:
            return jsonify({"error": "user not found"}), 404
        return jsonify({"user": User(**record).to_public()})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "token expired"}), 401
    except Exception:
        return jsonify({"error": "invalid token"}), 401
