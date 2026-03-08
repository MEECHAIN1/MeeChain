"""
MeeChain Backend – auth.py
JWT validation via Auth0 JWKS + Management API helpers.
"""

from __future__ import annotations

import time
from functools import lru_cache
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt
from jose.exceptions import JWTClaimsError

from config import Settings, get_settings

security = HTTPBearer()

# ── JWKS client (cached per process) ─────────────────────────────────────────

_jwks_cache: dict = {}
_jwks_fetched_at: float = 0.0
_JWKS_TTL = 3600  # seconds


def _get_jwks(settings: Settings) -> dict:
    global _jwks_cache, _jwks_fetched_at
    if time.time() - _jwks_fetched_at > _JWKS_TTL or not _jwks_cache:
        resp = httpx.get(settings.auth0_jwks_url, timeout=5)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_fetched_at = time.time()
    return _jwks_cache


# ── Token verification ────────────────────────────────────────────────────────

def verify_token(
    token: str,
    settings: Settings,
    required_scopes: list[str] | None = None,
) -> dict:
    """
    Validate a Bearer JWT issued by Auth0.
    Returns the decoded payload or raises HTTPException.
    """
    try:
        jwks = _get_jwks(settings)
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        # Find matching key
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
                break

        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate RSA key",
            )

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=settings.auth0_audience,
            issuer=settings.auth0_issuer,
        )

        # Scope check
        if required_scopes:
            token_scopes = payload.get("scope", "").split()
            permissions = payload.get("permissions", [])
            all_perms = set(token_scopes) | set(permissions)
            missing = set(required_scopes) - all_perms
            if missing:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required scopes/permissions: {missing}",
                )

        return payload

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except JWTClaimsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token claims: {e}",
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
        )


# ── FastAPI dependency factories ──────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    settings: Settings = Depends(get_settings),
) -> dict:
    return verify_token(credentials.credentials, settings)


def require_scopes(*scopes: str):
    """Returns a FastAPI dependency that enforces specific scopes/permissions."""

    def _dep(
        credentials: HTTPAuthorizationCredentials = Security(security),
        settings: Settings = Depends(get_settings),
    ) -> dict:
        return verify_token(credentials.credentials, settings, list(scopes))

    return _dep


# ── Management API helper ─────────────────────────────────────────────────────

_mgmt_token_cache: dict = {}


def get_management_token(settings: Settings) -> str:
    """
    Obtain a Management API token via client credentials grant.
    Cached until expiry.
    """
    now = time.time()
    cached = _mgmt_token_cache.get("token")
    expires_at = _mgmt_token_cache.get("expires_at", 0)

    if cached and now < expires_at - 60:
        return cached

    resp = httpx.post(
        f"https://{settings.auth0_domain}/oauth/token",
        json={
            "grant_type": "client_credentials",
            "client_id": settings.auth0_client_id,
            "client_secret": settings.auth0_client_secret,
            "audience": settings.auth0_mgmt_audience,
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    _mgmt_token_cache["token"] = data["access_token"]
    _mgmt_token_cache["expires_at"] = now + data.get("expires_in", 86400)
    return data["access_token"]


def get_auth0_user(user_id: str, settings: Settings) -> dict:
    """Fetch a user's profile from Auth0 Management API."""
    token = get_management_token(settings)
    resp = httpx.get(
        f"https://{settings.auth0_domain}/api/v2/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def list_auth0_users(settings: Settings, per_page: int = 50, page: int = 0) -> list[dict]:
    """List users from Auth0 Management API (admin only)."""
    token = get_management_token(settings)
    resp = httpx.get(
        f"https://{settings.auth0_domain}/api/v2/users",
        headers={"Authorization": f"Bearer {token}"},
        params={"per_page": per_page, "page": page},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
