"""
MeeChain Backend – config.py
Loads all settings from environment variables (or .env file).
Never hard-code secrets – populate .env locally, or set env vars on the hosting platform.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Auth0 ────────────────────────────────────────────────────────────
    auth0_domain: str = "meechain.au.auth0.com"
    auth0_client_id: str
    auth0_client_secret: str
    auth0_audience: str = "https://meechain.au.auth0.com/api/v2/"
    auth0_mgmt_audience: str = "https://meechain.au.auth0.com/api/v2/"
    auth0_grant_id: str = ""

    # ── NodeReal RPC ─────────────────────────────────────────────────────
    nodereal_api_key: str
    nodereal_rpc_url: str = "https://bsc-mainnet.nodereal.io/v1/"

    # ── App ──────────────────────────────────────────────────────────────
    app_secret_key: str
    debug: bool = False
    cors_origins: list[str] = ["https://meechain.io", "http://localhost:3000"]

    # ── Rate Limiting ────────────────────────────────────────────────────
    rpc_rate_limit_per_minute: int = 60
    rpc_quota_per_day: int = 1000

    # ── Logging ──────────────────────────────────────────────────────────
    max_log_entries: int = 1000

    # ── Alerting thresholds ───────────────────────────────────────────────
    alert_error_rate_threshold: float = 0.05
    alert_p95_latency_threshold_ms: float = 1000
    alert_quota_remaining_threshold: int = 100
    alert_check_interval_seconds: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def auth0_issuer(self) -> str:
        return f"https://{self.auth0_domain}/"

    @property
    def auth0_jwks_url(self) -> str:
        return f"https://{self.auth0_domain}/.well-known/jwks.json"

    @property
    def nodereal_full_url(self) -> str:
        return f"{self.nodereal_rpc_url}{self.nodereal_api_key}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
