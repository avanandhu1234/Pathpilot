"""Re-export from db.py for backward compatibility. Use app.db for new code."""
from app.db import engine, SessionLocal, Base, get_db

__all__ = ["engine", "SessionLocal", "Base", "get_db"]
