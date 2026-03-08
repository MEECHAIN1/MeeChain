"""
MeeChain Backend – logger.py
Structured in-memory activity log with JSON entries.
Replace the in-memory store with a DB or log aggregator in production.
"""

from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from typing import Optional

from config import get_settings


class ActivityLogger:
    def __init__(self, max_entries: int = 1000):
        self.max_entries = max_entries
        self._log: deque[dict] = deque(maxlen=max_entries)

    def log(
        self,
        event: str,
        user_id: Optional[str] = None,
        detail: Optional[dict] = None,
        level: str = "INFO",
    ) -> None:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "event": event,
            "user_id": user_id,
            "detail": detail or {},
        }
        self._log.append(entry)

    def get_all(self, limit: int = 100) -> list[dict]:
        entries = list(self._log)
        return entries[-limit:]

    def get_by_user(self, user_id: str, limit: int = 50) -> list[dict]:
        return [e for e in self._log if e.get("user_id") == user_id][-limit:]

    def get_by_level(self, level: str, limit: int = 100) -> list[dict]:
        return [e for e in self._log if e.get("level") == level][-limit:]

    def clear(self) -> None:
        self._log.clear()

    def summary(self) -> dict:
        entries = list(self._log)
        level_counts: dict[str, int] = {}
        for e in entries:
            lvl = e.get("level", "INFO")
            level_counts[lvl] = level_counts.get(lvl, 0) + 1
        return {
            "total_entries": len(entries),
            "level_breakdown": level_counts,
            "oldest_entry": entries[0]["timestamp"] if entries else None,
            "newest_entry": entries[-1]["timestamp"] if entries else None,
        }


# Global singleton
settings = get_settings()
activity_logger = ActivityLogger(max_entries=settings.max_log_entries)
