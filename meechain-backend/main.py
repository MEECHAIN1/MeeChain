"""
MeeChain Backend – main.py
FastAPI application entrypoint.
"""

from __future__ import annotations

import time
from contextlib import asynccontextmanager

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from auth import get_current_user
from config import Settings, get_settings
from dashboard.routes import router as dashboard_router
from logger import activity_logger
from models import HealthResponse, RPCRequest
from rpc import proxy_rpc

APP_VERSION = "1.0.0"

ALLOWED_CONFIG_KEYS = {
    "auth0_domain",
    "auth0_audience",
    "nodereal_rpc_url",
    "rpc_rate_limit_per_minute",
    "rpc_quota_per_day",
    "cors_origins",
    "debug",
}


class ConfigUpdateRequest(BaseModel):
    updates: dict[str, object] = Field(default_factory=dict)


@asynccontextmanager
async def lifespan(app: FastAPI):
    activity_logger.log(event="app_startup", detail={"version": APP_VERSION})
    yield
    activity_logger.log(event="app_shutdown")


def create_app(settings: Settings | None = None) -> FastAPI:
    if settings is None:
        settings = get_settings()

    app = FastAPI(
        title="MeeChain Backend API",
        description="Backend API for MeeChain contributors, providing Auth0 JWT authentication, a secure RPC Proxy to NodeReal BSC, and a gamified Badge System.",
        version=APP_VERSION,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
        lifespan=lifespan,
    )

    app.state.runtime_config: dict[str, object] = {
        "auth0_domain": settings.auth0_domain,
        "auth0_audience": settings.auth0_audience,
        "nodereal_rpc_url": settings.nodereal_rpc_url,
        "rpc_rate_limit_per_minute": settings.rpc_rate_limit_per_minute,
        "rpc_quota_per_day": settings.rpc_quota_per_day,
        "cors_origins": settings.cors_origins,
        "debug": settings.debug,
    }

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.middleware("http")
    async def add_timing_header(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = (time.perf_counter() - start) * 1000
        response.headers["X-Process-Time-Ms"] = f"{elapsed:.2f}"
        return response

    @app.get("/", include_in_schema=False)
    async def root_redirect():
        return RedirectResponse(url="/docs")

    @app.get("/health", response_model=HealthResponse, tags=["System"], summary="Public health check")
    async def health(s: Settings = Depends(get_settings)):
        return HealthResponse(status="ok", version=APP_VERSION, auth0_domain=s.auth0_domain, rpc_url=s.nodereal_rpc_url)

    @app.get("/me", tags=["Auth"], summary="Get identity from JWT")
    async def me(payload: dict = Depends(get_current_user)):
        user_id: str = payload["sub"]
        activity_logger.log(event="me_accessed", user_id=user_id)
        return {
            "sub": user_id,
            "scope": payload.get("scope", ""),
            "permissions": payload.get("permissions", []),
            "iss": payload.get("iss"),
            "aud": payload.get("aud"),
        }

    @app.get("/dashboard/config", tags=["Admin"], summary="Read non-secret runtime config")
    async def get_config(payload: dict = Depends(get_current_user)):
        scopes = set(payload.get("scope", "").split()) | set(payload.get("permissions", []))
        if "admin:config" not in scopes:
            raise HTTPException(status_code=403, detail="Missing required scope: admin:config")
        cfg = dict(app.state.runtime_config)
        return {
            "environment": "production" if not cfg.get("debug") else "development",
            "version": APP_VERSION,
            "last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "settings": cfg,
        }

    @app.put("/dashboard/config", tags=["Admin"], summary="Update allow-listed runtime config")
    async def update_config(req: ConfigUpdateRequest, payload: dict = Depends(get_current_user)):
        scopes = set(payload.get("scope", "").split()) | set(payload.get("permissions", []))
        if "admin:config" not in scopes:
            raise HTTPException(status_code=403, detail="Missing required scope: admin:config")

        invalid_keys = [k for k in req.updates if k not in ALLOWED_CONFIG_KEYS]
        if invalid_keys:
            raise HTTPException(status_code=400, detail=f"Unsupported config keys: {invalid_keys}")

        for key, value in req.updates.items():
            app.state.runtime_config[key] = value

        user_id = payload.get("sub", "unknown")
        for key in req.updates:
            activity_logger.log(event="config_updated", user_id=user_id, detail={"key": key, "when": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})

        return {"status": "ok", "updated_keys": list(req.updates.keys()), "settings": app.state.runtime_config}

    @app.post("/dashboard/config/test-connection", tags=["Admin"], summary="Test current RPC connection")
    async def test_connection(payload: dict = Depends(get_current_user)):
        scopes = set(payload.get("scope", "").split()) | set(payload.get("permissions", []))
        if "admin:config" not in scopes:
            raise HTTPException(status_code=403, detail="Missing required scope: admin:config")

        rpc_url = str(app.state.runtime_config.get("nodereal_rpc_url", settings.nodereal_rpc_url))
        api_key = settings.nodereal_api_key
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                resp = await client.post(
                    f"{rpc_url}{api_key}",
                    json={"jsonrpc": "2.0", "method": "web3_clientVersion", "params": [], "id": 1},
                )
            return {"ok": resp.status_code == 200, "status_code": resp.status_code, "result": resp.json() if resp.status_code == 200 else None}
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"RPC health check failed: {e}")

    @app.post("/rpc", tags=["RPC"], summary="Proxy RPC call to NodeReal BSC")
    async def rpc_proxy(rpc_req: RPCRequest, payload: dict = Depends(get_current_user), s: Settings = Depends(get_settings)):
        user_id: str = payload["sub"]
        return await proxy_rpc(rpc_req, user_id, s)

    @app.get("/badges", tags=["Badges"], summary="Get personal badges")
    async def list_badges(payload: dict = Depends(get_current_user)):
        from badges import get_badge_list

        user_id: str = payload["sub"]
        activity_logger.log(event="badges_listed", user_id=user_id)
        return {"badges": get_badge_list(user_id)}

    app.include_router(dashboard_router)
    return app


app = create_app()
