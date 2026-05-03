from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Literal

from config import Settings
from logger import activity_logger

Severity = Literal["info", "warn", "critical"]
Status = Literal["active", "acknowledged", "snoozed", "resolved"]


@dataclass
class AlertEvent:
    id: str
    created_at: str
    metric: str
    value: float
    threshold: float
    severity: Severity
    message: str
    status: Status = "active"
    acked_by: str | None = None
    acked_at: str | None = None
    snoozed_until: str | None = None


_alert_events: list[AlertEvent] = []
_next_id = 1


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _is_snoozed(alert: AlertEvent) -> bool:
    if alert.status != "snoozed" or not alert.snoozed_until:
        return False
    return datetime.fromisoformat(alert.snoozed_until) > datetime.now(timezone.utc)


def evaluate_thresholds(snapshot: dict, settings: Settings) -> list[dict]:
    global _next_id
    created: list[dict] = []

    checks = [
        ("error_rate", float(snapshot.get("error_rate", 0)), settings.alert_error_rate_threshold, "warn", "critical"),
        ("p95_latency_ms", float(snapshot.get("p95_latency_ms", 0)), settings.alert_p95_latency_threshold_ms, "warn", "critical"),
        ("quota_remaining", float(snapshot.get("quota_remaining", 0)), settings.alert_quota_remaining_threshold, "warn", "critical"),
    ]

    for metric, value, threshold, warn_level, crit_level in checks:
        breached = value >= threshold if metric != "quota_remaining" else value <= threshold
        if not breached:
            continue
        severity: Severity = crit_level if metric != "quota_remaining" and value >= threshold * 1.5 else warn_level
        if metric == "quota_remaining" and value <= max(0, threshold * 0.5):
            severity = "critical"
        alert = AlertEvent(
            id=str(_next_id),
            created_at=_now_iso(),
            metric=metric,
            value=value,
            threshold=threshold,
            severity=severity,
            message=f"{metric} breached threshold ({value} vs {threshold})",
        )
        _next_id += 1
        _alert_events.append(alert)
        created.append(asdict(alert))
        activity_logger.log("alert_created", detail=asdict(alert), level="WARNING" if severity == "warn" else "ERROR")

    return created


def run_alert_check(snapshot: dict, settings: Settings) -> dict:
    created = evaluate_thresholds(snapshot, settings)
    event = {
        "checked_at": _now_iso(),
        "snapshot": snapshot,
        "alerts_created": len(created),
    }
    activity_logger.log("alert_check_executed", detail=event)
    return {"event": event, "alerts": created}


def get_active_alerts() -> list[dict]:
    return [asdict(a) for a in _alert_events if a.status == "active" or (not _is_snoozed(a) and a.status == "snoozed")]


def ack_alert(alert_id: str, admin_user_id: str) -> dict | None:
    for alert in _alert_events:
        if alert.id == alert_id:
            alert.status = "acknowledged"
            alert.acked_by = admin_user_id
            alert.acked_at = _now_iso()
            activity_logger.log("alert_acknowledged", user_id=admin_user_id, detail={"alert_id": alert_id})
            return asdict(alert)
    return None


def snooze_alert(alert_id: str, minutes: int, admin_user_id: str) -> dict | None:
    from datetime import timedelta

    for alert in _alert_events:
        if alert.id == alert_id:
            until = datetime.now(timezone.utc) + timedelta(minutes=minutes)
            alert.status = "snoozed"
            alert.snoozed_until = until.isoformat()
            activity_logger.log(
                "alert_snoozed",
                user_id=admin_user_id,
                detail={"alert_id": alert_id, "minutes": minutes, "until": alert.snoozed_until},
            )
            return asdict(alert)
    return None
