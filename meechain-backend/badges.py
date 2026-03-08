"""
MeeChain Backend – badges.py
Badge definitions and awarding logic for gamified contributor engagement.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from models import ContributorStats


# ── Badge definitions ─────────────────────────────────────────────────────────

class BadgeType(str, Enum):
    FIRST_LOGIN = "first_login"
    JWT_VERIFIED = "jwt_verified"
    RPC_CALLER_10 = "rpc_caller_10"
    RPC_CALLER_100 = "rpc_caller_100"
    RPC_CALLER_500 = "rpc_caller_500"
    SPEED_DAEMON = "speed_daemon"
    ONBOARDING_COMPLETE = "onboarding_complete"
    POWER_USER = "power_user"
    CONTRIBUTOR = "contributor"


BADGE_DEFINITIONS: dict[BadgeType, dict] = {
    BadgeType.FIRST_LOGIN: {
        "name": "First Login",
        "description": "Logged in for the first time via Auth0",
        "icon": "🚀",
    },
    BadgeType.JWT_VERIFIED: {
        "name": "JWT Verified",
        "description": "Successfully authenticated with a valid JWT",
        "icon": "🔐",
    },
    BadgeType.RPC_CALLER_10: {
        "name": "RPC Starter",
        "description": "Made 10 successful RPC calls",
        "icon": "📡",
    },
    BadgeType.RPC_CALLER_100: {
        "name": "RPC Pro",
        "description": "Made 100 successful RPC calls",
        "icon": "⚡",
    },
    BadgeType.RPC_CALLER_500: {
        "name": "RPC Master",
        "description": "Made 500 successful RPC calls",
        "icon": "🏆",
    },
    BadgeType.SPEED_DAEMON: {
        "name": "Speed Daemon",
        "description": "Average RPC latency below 100 ms",
        "icon": "🔥",
    },
    BadgeType.ONBOARDING_COMPLETE: {
        "name": "Onboarding Complete",
        "description": "Completed the full onboarding flow",
        "icon": "✅",
    },
    BadgeType.POWER_USER: {
        "name": "Power User",
        "description": "Holds RPC Pro badge and Speed Daemon badge",
        "icon": "💎",
    },
    BadgeType.CONTRIBUTOR: {
        "name": "Contributor",
        "description": "Active contributor with 100+ calls and onboarding done",
        "icon": "🌟",
    },
}


# ── Badge store (in-memory – replace with DB in production) ───────────────────

_user_badges: dict[str, set[BadgeType]] = {}


def get_user_badges(user_id: str) -> list[BadgeType]:
    return list(_user_badges.get(user_id, set()))


def award_badge(user_id: str, badge: BadgeType) -> bool:
    """Award badge. Returns True if newly awarded, False if already had it."""
    if badge not in _user_badges.get(user_id, set()):
        _user_badges.setdefault(user_id, set()).add(badge)
        return True
    return False


def check_and_award_badges(
    user_id: str,
    stats: ContributorStats,
) -> list[BadgeType]:
    """
    Evaluate stats and award any newly earned badges.
    Returns list of newly awarded badge types.
    """
    newly_awarded: list[BadgeType] = []

    def _award(b: BadgeType):
        if award_badge(user_id, b):
            newly_awarded.append(b)

    if stats.first_login:
        _award(BadgeType.FIRST_LOGIN)

    _award(BadgeType.JWT_VERIFIED)

    if stats.rpc_call_count >= 10:
        _award(BadgeType.RPC_CALLER_10)
    if stats.rpc_call_count >= 100:
        _award(BadgeType.RPC_CALLER_100)
    if stats.rpc_call_count >= 500:
        _award(BadgeType.RPC_CALLER_500)

    if stats.avg_latency_ms > 0 and stats.avg_latency_ms < 100:
        _award(BadgeType.SPEED_DAEMON)

    if stats.onboarding_complete:
        _award(BadgeType.ONBOARDING_COMPLETE)

    # Composite badges
    current = _user_badges.get(user_id, set())
    if BadgeType.RPC_CALLER_100 in current and BadgeType.SPEED_DAEMON in current:
        _award(BadgeType.POWER_USER)
    if BadgeType.RPC_CALLER_100 in current and BadgeType.ONBOARDING_COMPLETE in current:
        _award(BadgeType.CONTRIBUTOR)

    return newly_awarded


def get_badge_list(user_id: Optional[str] = None) -> list[dict]:
    """Return all badge definitions with awarded status for a user."""
    owned = _user_badges.get(user_id, set()) if user_id else set()
    return [
        {
            "id": badge_type.value,
            "name": defn["name"],
            "description": defn["description"],
            "icon": defn["icon"],
            "awarded": badge_type in owned,
        }
        for badge_type, defn in BADGE_DEFINITIONS.items()
    ]
