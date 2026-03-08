"""
MeeChain Backend – main.py
FastAPI application entrypoint.
"""

from __future__ import annotations

import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from auth import get_current_user, require_scopes
from config import Settings, get_settings
from dashboard.routes import router as dashboard_router
from logger import activity_logger
from models import HealthResponse, RPCRequest
from rpc import proxy_rpc

APP_VERSION = "1.0.0"


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    activity_logger.log(event="app_startup", detail={"version": APP_VERSION})
    yield
    activity_logger.log(event="app_shutdown")


# ── App factory ───────────────────────────────────────────────────────────────

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

    # ── CORS ─────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )

    # ── Request timing middleware ─────────────────────────────────────────────
    @app.middleware("http")
    async def add_timing_header(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = (time.perf_counter() - start) * 1000
        response.headers["X-Process-Time-Ms"] = f"{elapsed:.2f}"
        return response

    # ── Root redirect ─────────────────────────────────────────────────────────
    @app.get("/", include_in_schema=False)
    async def root_redirect():
        """Redirects the root path to the API documentation."""
        return RedirectResponse(url="/docs")

    # ── Health ────────────────────────────────────────────────────────────────
    @app.get(
        "/health",
        response_model=HealthResponse,
        tags=["System"],
        summary="Public health check",
    )
    async def health(s: Settings = Depends(get_settings)):
        return HealthResponse(
            status="ok",
            version=APP_VERSION,
            auth0_domain=s.auth0_domain,
            rpc_url=s.nodereal_rpc_url,
        )

    # ── Identity ──────────────────────────────────────────────────────────────
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

    # ── RPC proxy ─────────────────────────────────────────────────────────────
    @app.post("/rpc", tags=["RPC"], summary="Proxy RPC call to NodeReal BSC")
    async def rpc_proxy(
        rpc_req: RPCRequest,
        payload: dict = Depends(get_current_user),
        s: Settings = Depends(get_settings),
    ):
        user_id: str = payload["sub"]
        return await proxy_rpc(rpc_req, user_id, s)

    # ── Badges convenience endpoint ───────────────────────────────────────────
    @app.get("/badges", tags=["Badges"], summary="Get personal badges")
    async def list_badges(payload: dict = Depends(get_current_user)):
        from badges import get_badge_list

        user_id: str = payload["sub"]
        activity_logger.log(event="badges_listed", user_id=user_id)
        return {"badges": get_badge_list(user_id)}

    # ── Admin audit logs ──────────────────────────────────────────────────────
    # This endpoint is now provided by the dashboard router at /dashboard/admin/logs
    # and is more feature-rich. Removing this duplicate to avoid confusion.

    # ── Dashboard router ──────────────────────────────────────────────────────
    app.include_router(dashboard_router)

    return app


app = create_app()
