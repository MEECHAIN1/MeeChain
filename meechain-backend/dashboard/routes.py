"""
MeeChain Backend – dashboard/routes.py
Dashboard endpoints: contributor overview, admin stats, audit logs.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
import redis.asyncio as redis

from auth import get_current_user, require_scopes
from badges import check_and_award_badges, get_badge_list, get_user_badges
from badges import check_and_award_badges, get_badge_list
from config import Settings, get_settings
from logger import activity_logger
from database import get_redis_client
from logger import ActivityLogger, get_activity_logger
from models import ContributorStats
from rpc import get_global_rpc_stats, get_quota_info, get_rpc_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ── Contributor self-service ──────────────────────────────────────────────────

@router.get("/me/stats")
async def my_stats(
    payload: dict = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
    redis_client: redis.Redis = Depends(get_redis_client),
    activity_logger: ActivityLogger = Depends(get_activity_logger),
):
    """Return the caller's own RPC stats, quota, and badges."""
    user_id: str = payload["sub"]
    rpc = get_rpc_stats(user_id)
    quota = get_quota_info(user_id, settings)
    badges = get_badge_list(user_id)
    logs = activity_logger.get_by_user(user_id, limit=20)
    rpc = await get_rpc_stats(user_id, redis_client)
    quota = await get_quota_info(user_id, settings, redis_client)
    badges = await get_badge_list(user_id, redis_client)
    logs = await activity_logger.get_by_user(user_id, limit=20)

    return {
        "user_id": user_id,
        "rpc_stats": rpc,
        "quota": quota,
        "badges": badges,
        "recent_activity": logs,
    }


@router.get("/me/badges")
async def my_badges(payload: dict = Depends(get_current_user)):
async def my_badges(
    payload: dict = Depends(get_current_user),
    redis_client: redis.Redis = Depends(get_redis_client),
):
    user_id: str = payload["sub"]
    return {"user_id": user_id, "badges": get_badge_list(user_id)}
    return {"user_id": user_id, "badges": await get_badge_list(user_id, redis_client)}


@router.post("/me/badges/check")
async def check_my_badges(
    stats: ContributorStats,
    payload: dict = Depends(get_current_user),
):
    """
    Submit stats and receive newly awarded badges.
    The client should call this after significant milestones.
    """
    user_id: str = payload["sub"]
    stats.user_id = user_id
    newly_awarded = check_and_award_badges(user_id, stats)
    # This endpoint requires a redis client to be passed to the badge logic
    redis_client: redis.Redis = await get_redis_client(Depends(get_redis_pool))
    newly_awarded = await check_and_award_badges(user_id, stats, redis_client)
    return {
        "user_id": user_id,
        "newly_awarded": [b.value for b in newly_awarded],
        "all_badges": get_badge_list(user_id),
        "all_badges": await get_badge_list(user_id, redis_client),
    }


@router.get("/me/quota")
async def my_quota(
    payload: dict = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
    redis_client: redis.Redis = Depends(get_redis_client),
):
    user_id: str = payload["sub"]
    return get_quota_info(user_id, settings)
    return await get_quota_info(user_id, settings, redis_client)


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get("/admin/stats", dependencies=[Depends(require_scopes("read:users"))])
async def admin_stats():
async def admin_stats(redis_client: redis.Redis = Depends(get_redis_client)):
    """Global RPC statistics. Requires read:users permission."""
    return get_global_rpc_stats()
    return await get_global_rpc_stats(redis_client)


@router.get("/admin/logs", dependencies=[Depends(require_scopes("read:users"))])
async def admin_logs(
    limit: int = Query(100, ge=1, le=1000),
    level: str = Query(None),
    activity_logger: ActivityLogger = Depends(get_activity_logger),
):
    """Audit log. Requires read:users permission."""
    if level:
        entries = activity_logger.get_by_level(level.upper(), limit=limit)
        entries = await activity_logger.get_by_level(level.upper(), limit=limit)
    else:
        entries = activity_logger.get_all(limit=limit)
    summary = activity_logger.summary()
        entries = await activity_logger.get_all(limit=limit)
    summary = await activity_logger.summary()
    return {"summary": summary, "entries": entries}


@router.get("/admin/badges/all", dependencies=[Depends(require_scopes("read:users"))])
async def admin_all_badges():
async def admin_all_badges(redis_client: redis.Redis = Depends(get_redis_client)):
    """List all badge definitions (no user context)."""
    return {"badges": get_badge_list()}
    return {"badges": await get_badge_list(redis_client=redis_client)}
