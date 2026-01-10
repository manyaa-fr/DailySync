import httpx
from fastapi import APIRouter
from config.config import settings

router = APIRouter(prefix="/api/v1/github", tags=["github"])

@router.get("/callback")
async def github_callback(code: str):
    params={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            }
    headers={
            "Accept": "application/json"
            }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url="https://github.com/login/oauth/access_token",
            headers=headers,
            params=params,
        )

    response_json = response.json()
    access_token = response_json["access_token"]
    async with httpx.AsyncClient() as client:
        headers.update({
            'Authorization': f'Bearer {access_token}'
        })
        response = await client.get(
            url="https://api.github.com/user",
            headers=headers,
        )
    return response.json()