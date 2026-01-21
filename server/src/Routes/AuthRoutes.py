import os
import secrets
from jose import JWTError
import jwt
import bcrypt
import httpx

from datetime import datetime, timedelta, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse

from config.db import db as MongoDB
from schemas.auth import LoginRequest
from schemas.auth import RegisterRequest

# -------------------- CONFIG --------------------

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
BACKEND_CALLBACK_URL = os.getenv("GITHUB_REDIRECT_URI", "")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
access_token_expire_minutes = 60 * 24 * 7  # 7 days

# Fallback for production if env var is missing or incorrect
if not BACKEND_CALLBACK_URL or "vercel.app" in BACKEND_CALLBACK_URL:
    BACKEND_CALLBACK_URL = "https://dailysync-9wf2.onrender.com/api/v1/github/callback"

if not all([JWT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, BACKEND_CALLBACK_URL]):
    raise RuntimeError("Missing required environment variables")

# -------------------- DB COLLECTIONS --------------------

users = MongoDB["user"]
oauth_states = MongoDB["oauth_states"]

# -------------------- ROUTERS --------------------

auth_router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
github_router = APIRouter(prefix="/api/v1/github", tags=["github"])

# -------------------- AUTH --------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

def create_access_token(data: dict, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        **data,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

def set_auth_cookie(response: JSONResponse, token: str, maxage: int) -> str:
    # Determine if we are in production (implied by secure/samesite needs)
    is_production = "localhost" not in FRONTEND_BASE_URL

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_production,  # True in prod (Render/Vercel), False in dev
        samesite="none" if is_production else "lax", # None is required for cross-site (Render -> Vercel)
        max_age=maxage,
    )
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,  # frontend must read this
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=maxage,
    )
    return csrf_token

# -------------------------REGISTER-------------------------

@auth_router.post("/register")
async def register(payload: RegisterRequest):
    email = payload.email.lower()

    if await users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    if len(payload.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long",
        )

    password_hash = bcrypt.hashpw(
        payload.password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    user = {
        "fullName": payload.fullName.strip(),
        "email": email,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }