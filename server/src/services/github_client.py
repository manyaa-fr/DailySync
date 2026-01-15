import httpx
from datetime import datetime, timedelta

GITHUB_API = "https://api.github.com"

HEADERS_BASE = {
    "Accept": "application/vnd.github+json"
}


async def github_get(token: str, url: str, params: dict | None = None):
    headers = {
        **HEADERS_BASE,
        "Authorization": f"Bearer {token}",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url, headers=headers, params=params)
        r.raise_for_status()
        return r.json()


async def fetch_user_repos(token: str):
    return await github_get(
        token,
        f"{GITHUB_API}/user/repos",
        params={"per_page": 100, "sort": "updated"},
    )


async def fetch_repo_commits(token: str, owner: str, repo: str, since: datetime):
    return await github_get(
        token,
        f"{GITHUB_API}/repos/{owner}/{repo}/commits",
        params={"since": since.isoformat(), "per_page": 100},
    )