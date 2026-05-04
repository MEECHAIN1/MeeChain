"""
MeeChain Backend – models.py
Pydantic schemas for request/response bodies.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


# ── RPC ──────────────────────────────────────────────────────────────────────

class RPCRequest(BaseModel):
    jsonrpc: str = "2.0"
    method: str
    params: list[Any] = []
    id: int | str = 1


class RPCResponse(BaseModel):
    jsonrpc: str
    result: Any = None
    error: Optional[dict] = None
    id: int | str


# ── Contributor ───────────────────────────────────────────────────────────────

class ContributorStats(BaseModel):
    user_id: str
    rpc_call_count: int = 0
    avg_latency_ms: float = 0.0
    badges: list[str] = []
    first_login: bool = False
    onboarding_complete: bool = False


class ContributorProfile(BaseModel):
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    roles: list[str] = []
    permissions: list[str] = []
    stats: ContributorStats


# ── Quota ─────────────────────────────────────────────────────────────────────

class QuotaInfo(BaseModel):
    user_id: str
    used_today: int
    daily_limit: int
    remaining: int
    used_this_minute: int
    per_minute_limit: int
    reset_at_utc: str


# ── Badge ─────────────────────────────────────────────────────────────────────

class BadgeInfo(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    awarded: bool = False


# ── Log ───────────────────────────────────────────────────────────────────────

class LogEntry(BaseModel):
    timestamp: str
    event: str
    user_id: Optional[str] = None
    detail: Optional[dict] = None
    level: str = "INFO"


# ── Health ────────────────────────────────────────────────────────────────────


class UpstreamHealthSummary(BaseModel):
    status: str
    active_provider: str
    failover_count: int
    last_switch_time: Optional[str] = None
    endpoints: list[dict[str, str | int | None]] = []


class HealthResponse(BaseModel):
    status: str
    version: str
    auth0_domain: str
    rpc_url: str
    provider_mode: str
    upstream: UpstreamHealthSummary
