from fastapi import APIRouter, HTTPException, status
from schemas.auth import RegisterRequest
from schemas.auth import LoginRequest
from config.db import db as MongoDB
from datetime import datetime
import bcrypt
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

secret_key = os.getenv("JWT_SECRET_KEY", "")

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
authCollection = MongoDB["user"]

@router.post("/register")
async def register_user(payload: RegisterRequest):
    data = payload.dict()
    email = data["email"].lower()

    # Check duplicate email
    existing_user = await authCollection.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    password_hash = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt(12)
    ).decode("utf-8")

    user_doc = {
        "full_name": data["fullName"],
        "email": email,
        "password_hash": password_hash,
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await authCollection.insert_one(user_doc)

    # Token
    token = jwt.encode(
        {"user_id": str(result.inserted_id), "email": email},
        secret_key,
        algorithm="HS256"
    )

    return {
        "message": "User registered successfully",
        "user": {
            "id": str(result.inserted_id),
            "full_name": user_doc["full_name"],
            "email": user_doc["email"],
        },
        "token": token
    }

@router.post("/login")
async def login_user(payload: LoginRequest):
    data = payload.dict()
    email = data["email"].lower()

    # Check duplicate email
    existing_user = await authCollection.find_one({"email": email})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not registered",
        )

    match_password = bcrypt.checkpw(
        data["password"].encode("utf-8"),
        existing_user["password_hash"].encode("utf-8")
    )
    del existing_user["password_hash"]

    # Token
    token = jwt.encode(
        {"user_id": str(existing_user["_id"]), "email": email},
        secret_key,
        algorithm="HS256"
    )

    if not match_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials",
        )
    
    existing_user['_id'] = str(existing_user['_id'])

    return {
        "message": "User logged in successfully",
        "token": token
    }