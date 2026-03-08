"""
MeeChain Backend – rpc.py
Secure proxy to NodeReal BSC RPC with quota & rate limiting.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import datetime, timezone

import httpx
from fastapi import Depends, HTTPException, status

from config import Settings, get_settings
from logger import activity_logger
from models import RPCRequest

# ── In-memory stores (replace with Redis in production) ───────────────────────

# per user: deque of timestamps (last 60 s)
_rate_window: dict[str, deque] = defaultdict(lambda: deque())

# per user per day: {"2024-01-01": count}
_daily_quota: dict[str, dict[str, int]] = defaultdict(dict)

# global stats
_rpc_stats: dict[str, list[float]] = defaultdict(list)  # user_id -> [latency_ms, ...]


def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ── Quota helpers ──────────────────────────────────────────────────────────────

def check_rate_limit(user_id: str, settings: Settings) -> None:
    now = time.time()
    window = _rate_window[user_id]
    # Remove entries older than 60 s
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= settings.rpc_rate_limit_per_minute:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {settings.rpc_rate_limit_per_minute} requests/minute",
        )
    window.append(now)


def check_daily_quota(user_id: str, settings: Settings) -> None:
    today = _today_utc()
    used = _daily_quota[user_id].get(today, 0)
    if used >= settings.rpc_quota_per_day:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily quota exceeded: {settings.rpc_quota_per_day} requests/day",
        )
    _daily_quota[user_id][today] = used + 1


def get_quota_info(user_id: str, settings: Settings) -> dict:
    now = time.time()
    window = _rate_window[user_id]
    # Clean up
    while window and now - window[0] > 60:
        window.popleft()

    today = _today_utc()
    used_today = _daily_quota[user_id].get(today, 0)
    remaining = max(0, settings.rpc_quota_per_day - used_today)

    # next midnight UTC
    from datetime import timedelta
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    return {
        "user_id": user_id,
        "used_today": used_today,
        "daily_limit": settings.rpc_quota_per_day,
        "remaining": remaining,
        "used_this_minute": len(window),
        "per_minute_limit": settings.rpc_rate_limit_per_minute,
        "reset_at_utc": tomorrow.isoformat(),
    }


# ── RPC proxy ─────────────────────────────────────────────────────────────────

ALLOWED_METHODS = {
    # Read-only BSC methods
    "eth_blockNumber",
    "eth_getBalance",
    "eth_getTransactionByHash",
    "eth_getTransactionReceipt",
    "eth_call",
    "eth_estimateGas",
    "eth_getBlockByNumber",
    "eth_getBlockByHash",
    "eth_getLogs",
    "eth_getCode",
    "eth_gasPrice",
    "eth_chainId",
    "net_version",
    "web3_clientVersion",
    "eth_getTransactionCount",
    # BSC-specific
    "bsc_getTransactionFee",
}


async def proxy_rpc(
    rpc_req: RPCRequest,
    user_id: str,
    settings: Settings = Depends(get_settings),
) -> dict:
    """
    Forward a JSON-RPC request to NodeReal BSC endpoint.
    Enforces method whitelist, rate limit, and daily quota.
    """

    # Method whitelist
    if rpc_req.method not in ALLOWED_METHODS:
        activity_logger.log(
            event="rpc_method_blocked",
            user_id=user_id,
            detail={"method": rpc_req.method},
            level="WARNING",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"RPC method '{rpc_req.method}' is not permitted",
        )

    # Rate + quota
    check_rate_limit(user_id, settings)
    check_daily_quota(user_id, settings)

    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                settings.nodereal_full_url,
                json={
                    "jsonrpc": rpc_req.jsonrpc,
                    "method": rpc_req.method,
                    "params": rpc_req.params,
                    "id": rpc_req.id,
                },
                headers={"Content-Type": "application/json"},
            )
    except httpx.TimeoutException:
        activity_logger.log(
            event="rpc_timeout",
            user_id=user_id,
            detail={"method": rpc_req.method},
            level="ERROR",
        )
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="NodeReal RPC request timed out",
        )

    latency_ms = (time.perf_counter() - start) * 1000
    _rpc_stats[user_id].append(latency_ms)
    # Keep last 500 entries per user
    if len(_rpc_stats[user_id]) > 500:
        _rpc_stats[user_id] = _rpc_stats[user_id][-500:]

    if resp.status_code != 200:
        activity_logger.log(
            event="rpc_error",
            user_id=user_id,
            detail={"status": resp.status_code, "method": rpc_req.method},
            level="ERROR",
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"NodeReal returned HTTP {resp.status_code}",
        )

    activity_logger.log(
        event="rpc_success",
        user_id=user_id,
        detail={
            "method": rpc_req.method,
            "latency_ms": round(latency_ms, 2),
        },
    )
    return resp.json()


# ── Stats helpers ──────────────────────────────────────────────────────────────

def get_rpc_stats(user_id: str) -> dict:
    latencies = _rpc_stats.get(user_id, [])
    if not latencies:
        return {"user_id": user_id, "total_calls": 0, "avg_latency_ms": 0, "p95_latency_ms": 0}
    sorted_l = sorted(latencies)
    p95_idx = max(0, int(len(sorted_l) * 0.95) - 1)
    return {
        "user_id": user_id,
        "total_calls": len(latencies),
        "avg_latency_ms": round(sum(latencies) / len(latencies), 2),
        "p95_latency_ms": round(sorted_l[p95_idx], 2),
    }


def get_global_rpc_stats() -> dict:
    total_calls = sum(len(v) for v in _rpc_stats.values())
    all_latencies = [l for lats in _rpc_stats.values() for l in lats]
    if not all_latencies:
        return {"total_calls": 0, "active_contributors": 0, "avg_latency_ms": 0}
    return {
        "total_calls": total_calls,
        "active_contributors": len(_rpc_stats),
        "avg_latency_ms": round(sum(all_latencies) / len(all_latencies), 2),
    }
