import sqlite3
from pathlib import Path
from typing import Any, Dict


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "storage" / "analytics.db"


class AnalyticsService:
    def __init__(self) -> None:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._conn() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS events (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  event_name TEXT NOT NULL,
                  event_payload TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS errors (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  message TEXT NOT NULL,
                  stack TEXT,
                  context TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS subscriptions (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  email TEXT NOT NULL UNIQUE,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

    def track(self, event_name: str, payload: Dict[str, Any]) -> None:
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO events (event_name, event_payload) VALUES (?, ?)",
                (event_name, str(payload)),
            )

    def track_error(self, message: str, stack: str, context: Dict[str, Any]) -> None:
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO errors (message, stack, context) VALUES (?, ?, ?)",
                (message, stack, str(context)),
            )

    def save_subscription(self, email: str) -> None:
        with self._conn() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO subscriptions (email) VALUES (?)",
                (email.lower().strip(),),
            )
