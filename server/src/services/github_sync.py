from datetime import datetime, timedelta, timezone
from bson import ObjectId
import httpx

from config.db import db
from models.github_snapshots import (
    GitHubRepoSnapshot,
    GitHubCommitSnapshot,
)

GITHUB_API_BASE = "https://api.github.com"
SYNC_LOOKBACK_DAYS = 90
MAX_REPOS = 100          # safety cap
MAX_COMMITS_PER_REPO = 100  # safety cap
users = db["user"]
github_snapshots = db["github_snapshots"]


async def sync_github_snapshot(user_id: ObjectId) -> None:
    """
    Fetches GitHub data for a user and writes a fresh GitHubSnapshot.
    Safe to call multiple times.
    """

    # 1. Load user + validate GitHub connection
    user = await users.find_one({"_id": user_id})
    if not user or not user.get("github"):
        # No GitHub linked → nothing to sync
        return

    # NOTE:
    # In real systems, you'd retrieve a stored OAuth token
    # or refresh it here. For MVP, assume token access is handled.
    access_token = user["github"].get("access_token")
    if not access_token:
        raise RuntimeError("GitHub access token missing for linked user")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }

    since = (datetime.now(timezone.utc) - timedelta(days=SYNC_LOOKBACK_DAYS)).isoformat()

    repos: list[GitHubRepoSnapshot] = []
    commits: list[GitHubCommitSnapshot] = []
    languages_totals: dict[str, int] = {}

    # --------------------------------------------------
    # 2. Fetch repositories
    # --------------------------------------------------
    
    async with httpx.AsyncClient(timeout=30) as client:
        repo_res = await client.get(
            f"{GITHUB_API_BASE}/user/repos",
            headers=headers,
            params={
                "per_page": MAX_REPOS,
                "sort": "pushed",
                "direction": "desc",
                "type": "all"
            },
        )
        if repo_res.status_code == 401:
            # Token revoked or expired
            await users.update_one(
                {"_id": user_id},
                {"$unset": {"github": ""}}
            )
            return

        repo_res.raise_for_status()
        gh_repos = repo_res.json()

        for repo in gh_repos:
            repos.append(
                GitHubRepoSnapshot(
                    repo_id=repo["id"],
                    name=repo["name"],
                    full_name=repo["full_name"],
                    is_private=repo["private"],
                )
            )

        for repo in gh_repos:
            full_name = repo["full_name"]

            languages_res = await client.get(
                f"{GITHUB_API_BASE}/repos/{full_name}/languages",
                headers=headers,
            )
            if languages_res.status_code == 200:
                repo_languages = languages_res.json()
                for language, lines in repo_languages.items():
                    try:
                        value = int(lines)
                    except (TypeError, ValueError):
                        continue
                    languages_totals[language] = languages_totals.get(language, 0) + value

        for repo in gh_repos:
            full_name = repo["full_name"]

            commits_res = await client.get(
                f"{GITHUB_API_BASE}/repos/{full_name}/commits",
                headers=headers,
                params={
                    "since": since,
                    "per_page": MAX_COMMITS_PER_REPO,
                },
            )

            if commits_res.status_code != 200:
                continue
            
            commits_data = commits_res.json()
            if not commits_data:
                continue
                

            for c in commits_data:
                gh_author = c.get("author")
                commit_data = c.get("commit", {})
                commit_author = commit_data.get("author")

                if not commit_author or not commit_author.get("date"):
                    continue

                app_email = user.get("email")
                author_email = commit_author.get("email")

                matches_login = (
                    gh_author is not None
                    and gh_author.get("login") == user["github"]["username"]
                )
                matches_email = (
                    author_email is not None
                    and app_email is not None
                    and author_email.lower() == app_email.lower()
                )

                if not (matches_login or matches_email):
                    # print(f"    Skipping commit {c['sha'][:7]} (Login: {gh_author.get('login') if gh_author else 'None'}, Email: {author_email})")
                    continue

                sha = c["sha"]

                additions = None
                deletions = None

                try:
                    commit_detail_res = await client.get(
                        f"{GITHUB_API_BASE}/repos/{full_name}/commits/{sha}",
                        headers=headers,
                    )
                    if commit_detail_res.status_code == 200:
                        detail_json = commit_detail_res.json()
                        stats = detail_json.get("stats") or {}
                        raw_additions = stats.get("additions")
                        raw_deletions = stats.get("deletions")
                        try:
                            if raw_additions is not None:
                                additions = int(raw_additions)
                        except (TypeError, ValueError):
                            additions = None
                        try:
                            if raw_deletions is not None:
                                deletions = int(raw_deletions)
                        except (TypeError, ValueError):
                            deletions = None
                except Exception:
                    additions = None
                    deletions = None

                commits.append(
                    GitHubCommitSnapshot(
                        repo_id=repo["id"],
                        repo_name=repo["name"],
                        sha=sha,
                        message=commit_data.get("message", ""),
                        committed_at=datetime.fromisoformat(
                            commit_author["date"].replace("Z", "+00:00")
                        ),
                        additions=additions,
                        deletions=deletions,
                    )
                )

        # --------------------------------------------------
        # 3. Fetch recent events (to catch branch commits & org repos)
        # --------------------------------------------------
        events_res = await client.get(
            f"{GITHUB_API_BASE}/users/{user['github']['username']}/events",
            headers=headers,
            params={"per_page": 100}
        )
        
        if events_res.status_code == 200:
            events = events_res.json()
            existing_shas = {c.sha for c in commits}
            
            for event in events:
                if event["type"] == "PushEvent":
                    repo_name = event["repo"]["name"]  # e.g. "user/repo"
                    repo_id = event["repo"]["id"]
                    created_at = datetime.fromisoformat(event["created_at"].replace("Z", "+00:00"))
                    
                    # Check if this repo is already in our repos list
                    # If not, we might want to add it (or just track the commit)
                    # For now, just track the commit
                    
                    for payload_commit in event["payload"].get("commits", []):
                        sha = payload_commit["sha"]
                        if sha in existing_shas:
                            continue
                            
                        # Fetch stats for this commit
                        additions = None
                        deletions = None
                        try:
                            detail_res = await client.get(
                                f"{GITHUB_API_BASE}/repos/{repo_name}/commits/{sha}",
                                headers=headers
                            )
                            if detail_res.status_code == 200:
                                d = detail_res.json()
                                stats = d.get("stats", {})
                                additions = stats.get("additions")
                                deletions = stats.get("deletions")
                                
                                # Also get the correct date from the commit detail
                                # The event date is the push time, commit date might be different
                                if d.get("commit") and d["commit"].get("author"):
                                    c_date = d["commit"]["author"]["date"]
                                    created_at = datetime.fromisoformat(c_date.replace("Z", "+00:00"))
                        except Exception:
                            pass
                            
                        commits.append(
                            GitHubCommitSnapshot(
                                repo_id=repo_id,
                                repo_name=repo_name.split("/")[-1], # store just the name part to match others? 
                                                                   # Wait, existing logic uses repo["name"] which is just "DailySync"? 
                                                                   # No, GitHub API "name" is "DailySync", "full_name" is "manyaa-fr/DailySync"
                                                                   # event["repo"]["name"] is "manyaa-fr/DailySync" (full name)
                                sha=sha,
                                message=payload_commit["message"],
                                committed_at=created_at,
                                additions=additions,
                                deletions=deletions
                            )
                        )
                        existing_shas.add(sha)

    # --------------------------------------------------
    # 4. Upsert snapshot (atomic replace)
    # --------------------------------------------------
    now = datetime.now(timezone.utc)

    await github_snapshots.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "repos": [r.dict() for r in repos],
                "commits": [c.dict() for c in commits],
                "languages": languages_totals,
                "last_synced_at": now,
                "updated_at": now,
            },
            "$setOnInsert": {
                "user_id": user_id,
                "created_at": now,
            },
        },
        upsert=True,
    )
