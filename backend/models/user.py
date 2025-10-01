# backend/models/user.py
from dataclasses import dataclass, asdict
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

@dataclass
class User:
    email: str
    password_hash: str
    display_name: str | None = None
    id: str | None = None
    created_at: str | None = None

    @staticmethod
    def from_signup(email: str, password: str, display_name: str | None = None) -> "User":
        return User(
            email=email.lower(),
            password_hash=generate_password_hash(password),
            display_name=display_name,
            created_at=datetime.utcnow().isoformat()
        )

    def to_public(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "created_at": self.created_at
        }

    def to_dict(self) -> dict:
        d = asdict(self)
        return d

    def verify_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)
