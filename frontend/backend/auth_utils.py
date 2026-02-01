"""Simple JWT and password hashing for PathPilot auth. Uses bcrypt directly (no passlib) to avoid version clashes."""
import os
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt

# From backend/.env (loaded in main.py before imports that use these)
SECRET_KEY = os.getenv("SECRET_KEY", "pathpilot-secret-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # default 7 days

# Bcrypt supports max 72 bytes; truncate to avoid ValueError
def _truncate_password(password: str) -> bytes:
    return password.encode("utf-8")[:72]


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_truncate_password(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_truncate_password(plain), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
