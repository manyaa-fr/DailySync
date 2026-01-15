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
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  
        samesite="lax",
        max_age=maxage,
    )
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,  # frontend must read this
        secure=False,
        samesite="lax",
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

    res = await users.insert_one(user)

    token = create_access_token(
        {"sub": str(res.inserted_id), "email": email}, 
        expires_delta=timedelta(minutes=access_token_expire_minutes)
    )

    response = JSONResponse(
        content={
            "success": True,
        }
    )

    set_auth_cookie(
        response,
        token,
        access_token_expire_minutes * 60,
    )

    return response


# ---------------------------LOGIN----------------------------

@auth_router.post("/login")
async def login(payload: LoginRequest):
    email = payload.email.lower()

    # Check duplicate email
    existing_user = await users.find_one({"email": email})
    if not existing_user or not verify_password(
    payload.password, 
    existing_user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )
    
    token = create_access_token(
        {"sub": str(existing_user["_id"]), "email": email},
        expires_delta=timedelta(minutes=access_token_expire_minutes)
    )

    response = JSONResponse(
        content={
            "success": True,
        }
    )

    set_auth_cookie(
        response,
        token,
        access_token_expire_minutes * 60,
    )

    return response


# -------------------- GET CURRENT USER --------------------

@auth_router.get("/me")
async def me(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = await users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "fullName": user.get("fullName"),
    }

# -------------------- GITHUB OAUTH START --------------------

@github_router.get("/login")
async def github_login():
    state = secrets.token_urlsafe(32)

    await oauth_states.insert_one({
        "state": state,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
    })

    github_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={BACKEND_CALLBACK_URL}"
        f"&scope=read:user public_repo"
        f"&state={state}"
    )

    return RedirectResponse(github_url, status_code=302)

# -------------------- GITHUB CALLBACK --------------------

@github_router.get("/callback")
async def github_callback(code: str, state: str):

    # ---------------------VALIDATE STATE----------------------
    state_doc = await oauth_states.find_one({"state": state})
    if not state_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")
    expires_at = state_doc["expires_at"]
    # Normalize MongoDB datetime to UTC-aware
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await oauth_states.delete_one({"_id": state_doc["_id"]})
        raise HTTPException(status_code=400, detail="OAuth state expired")
    
    # State is single use, delete it
    await oauth_states.delete_one({"_id": state_doc["_id"]})

    # ---------------------EXCHANGE CODE FOR TOKEN----------------------
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
        )

        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="GitHub OAuth failed")
        
        # ---------------------FETCH GITHUB USER----------------------
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        gh_user = user_res.json()

        email_res = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        emails = email_res.json()
        primary_email = None

        if isinstance(emails, list):
            if emails and isinstance(emails[0], dict):
                # Normal GitHub response
                primary_email = next(
                    (
                        e["email"]
                        for e in emails
                        if e.get("primary") and e.get("verified")
                    ),
                    None,
                )
            elif emails and isinstance(emails[0], str):
                # GitHub returned a list of strings
                primary_email = emails[0]

    github_id = gh_user["id"]
    github_username = gh_user["login"]
    avatar_url = gh_user.get("avatar_url")

    # ---------------------Map GitHub identity to DailySync user----------------------

    # Case 1: Existing user with this GitHub ID
    user = await users.find_one({"github.github_id": github_id})

    # Case 2: Existing user with this email
    if not user and primary_email:
        user = await users.find_one({"email": primary_email.lower()})
        if user:
            # Link GitHub account
            await users.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "github": {
                        "github_id": github_id,
                        "username": github_username,
                        "avatar_url": avatar_url,
                        "connected_at": datetime.now(timezone.utc),
                    },
                    "updated_at": datetime.now(timezone.utc),
                }},
            )
    
    # Case 3: New user
    if not user:
        user_doc = {
            "fullName": gh_user.get("name") or github_username,
            "email": primary_email or f"{github_id}@users.noreply.github.com",
            "password_hash": None,
            "github": {
                "github_id": github_id,
                "username": github_username,
                "avatar_url": avatar_url,
                "connected_at": datetime.now(timezone.utc),
            },
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        insert_res = await users.insert_one(user_doc)
        user = {**user_doc, "_id": insert_res.inserted_id}

    # ---------------------CREATE SESSION----------------------
    token = create_access_token(
        {"sub": str(user["_id"]), "email": user["email"]},
        expires_delta=timedelta(minutes=access_token_expire_minutes)
    )

    response = RedirectResponse(
        url=f"{FRONTEND_BASE_URL}/app/dashboard",
        status_code=302,
    )

    set_auth_cookie(
        response,
        token,
        access_token_expire_minutes * 60,
    )

    return response