from fastapi import APIRouter

router = APIRouter(prefix="api/v1/auth", tags=["auth"])

@router.post("/register")
async def register_user():
    return {"message": "User registered successfully"}