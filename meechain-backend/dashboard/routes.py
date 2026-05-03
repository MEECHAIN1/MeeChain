from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from alerts import ack_alert, get_active_alerts, run_alert_check, snooze_alert
from auth import get_current_user, require_scopes
from badges import check_and_award_badges, get_badge_list
from config import Settings, get_settings
from logger import activity_logger
from models import ContributorStats
from rpc import get_global_rpc_stats, get_quota_info, get_rpc_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/me/stats")
async def my_stats(payload: dict = Depends(get_current_user), settings: Settings = Depends(get_settings)):
    user_id = payload["sub"]
    return {
        "user_id": user_id,
        "rpc_stats": get_rpc_stats(user_id),
        "quota": get_quota_info(user_id, settings),
        "badges": get_badge_list(user_id),
        "recent_activity": activity_logger.get_by_user(user_id, limit=20),
    }


@router.get("/active-alerts", dependencies=[Depends(require_scopes("read:users"))])
async def active_alerts():
    return {"alerts": get_active_alerts()}


@router.post("/admin/alerts/run-check", dependencies=[Depends(require_scopes("read:users"))])
async def run_check(settings: Settings = Depends(get_settings)):
    snapshot = {
        "error_rate": 0.07,
        "p95_latency_ms": 1800,
        "quota_remaining": 80,
    }
    return run_alert_check(snapshot=snapshot, settings=settings)


@router.post("/admin/alerts/{alert_id}/ack", dependencies=[Depends(require_scopes("write:users"))])
async def acknowledge_alert(alert_id: str, payload: dict = Depends(get_current_user)):
    updated = ack_alert(alert_id, payload["sub"])
    if not updated:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"alert": updated}


@router.post("/admin/alerts/{alert_id}/snooze", dependencies=[Depends(require_scopes("write:users"))])
async def snooze_alert_endpoint(
    alert_id: str,
    minutes: int = Query(30, ge=1, le=1440),
    payload: dict = Depends(get_current_user),
):
    updated = snooze_alert(alert_id, minutes, payload["sub"])
    if not updated:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"alert": updated}


@router.get("/admin/stats", dependencies=[Depends(require_scopes("read:users"))])
async def admin_stats():
    return get_global_rpc_stats()


@router.get("/admin/logs", dependencies=[Depends(require_scopes("read:users"))])
async def admin_logs(limit: int = Query(100, ge=1, le=1000), level: str | None = Query(None)):
    entries = activity_logger.get_by_level(level.upper(), limit=limit) if level else activity_logger.get_all(limit=limit)
    return {"summary": activity_logger.summary(), "entries": entries}


@router.get("/admin/badges/all", dependencies=[Depends(require_scopes("read:users"))])
async def admin_all_badges():
    return {"badges": get_badge_list()}


@router.post("/me/badges/check")
async def check_my_badges(stats: ContributorStats, payload: dict = Depends(get_current_user)):
    user_id = payload["sub"]
    stats.user_id = user_id
    newly_awarded = check_and_award_badges(user_id, stats)
    return {
        "user_id": user_id,
        "newly_awarded": [b.value for b in newly_awarded],
        "all_badges": get_badge_list(user_id),
    }
