from fastapi import APIRouter, Request, HTTPException, status
from bson import ObjectId

from services.github_sync import sync_github_snapshot
from config.db import db

router = APIRouter(prefix="/api/v1/github", tags=["github"])
users = db["user"]

@router.post("/sync")
async def manual_github_sync(request: Request):
    user_id = request.state.user_id
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user = await users.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get("github"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub not connected",
        )

    # Trigger sync (blocking for MVP)
    await sync_github_snapshot(ObjectId(user_id))

    return {
        "success": True,
        "message": "GitHub data refreshed",
    }