# backend/models/database.py
from typing import Optional, Dict, Any
import os
from datetime import datetime

# Firestore (optional)
DB_IS_READY = False
_db = None

def _init_firestore():
    """
    Initialize Firestore if env/config is present.
    Returns (client, is_ready_bool)
    """
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if not firebase_admin._apps:
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    "databaseURL": os.getenv("FIREBASE_DATABASE_URL")
                })
            else:
                # Allow local dev without credentials
                firebase_admin.initialize_app()
        client = firestore.client()
        return client, True
    except Exception:
        return None, False


class InMemoryDB:
    """Tiny in-memory store for local dev/test."""
    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}  # keyed by email

    # --- Users ---
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self.users.get(email)

    def create_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.users[data["email"]] = data
        return data


class FirestoreDB:
    """Thin Firestore wrapper."""
    def __init__(self, client):
        self.client = client
        self.users_col = self.client.collection("users")

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        snap = self.users_col.where("email", "==", email).limit(1).get()
        if snap:
            doc = snap[0]
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    def create_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        ref = self.users_col.document()
        data = {**data, "created_at": data.get("created_at") or datetime.utcnow().isoformat()}
        ref.set(data)
        data["id"] = ref.id
        return data


# Singleton-like accessor
_DB_INSTANCE = None

def get_db():
    global _DB_INSTANCE, DB_IS_READY, _db
    if _DB_INSTANCE is not None:
        return _DB_INSTANCE

    client, ok = _init_firestore()
    if ok and client:
        _DB_INSTANCE = FirestoreDB(client)
        DB_IS_READY = True
    else:
        _DB_INSTANCE = InMemoryDB()
        DB_IS_READY = False
    return _DB_INSTANCE
