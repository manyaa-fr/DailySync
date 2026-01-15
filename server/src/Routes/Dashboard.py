from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timedelta

from services.github_client import fetch_user_repos, fetch_repo_commits
from services.dashboard_metrics import (
    compute_weekly_activity,
    compute_streak,
    compute_coding_time,
)

from config.db import db
from Routes.AuthRoutes import get_current_user

router = APIRouter()
users = db["users"]


@router.get("/dashboard")
async def get_dashboard(user=Depends(get_current_user)):
    if "github" not in user or "access_token" not in user["github"]:
        return {
            "metrics": None,
            "weeklyActivity": [],
            "github": {
                "mostActiveDay": None,
                "reposTouched": 0,
                "recentCommits": [],
            },
            "codingTime": {
                "hourly": [],
                "dailyAverageMinutes": 0,
                "mostProductiveTime": None,
                "peakHourLabel": None,
            },
            "aiInsight": None,
            "meta": {
                "source": "github",
                "lastUpdated": None,
                "warnings": ["GitHub not connected yet"],
            },
        }

    token = user["github"]["access_token"]
    since = datetime.utcnow() - timedelta(days=7)

    repos = await fetch_user_repos(token)

    all_commits = []
    recent_commits = []

    for repo in repos[:5]:  # limit repos for rate-limit safety
        owner = repo["owner"]["login"]
        name = repo["name"]

        commits = await fetch_repo_commits(token, owner, name, since)

        for c in commits:
            commit_data = {
                "id": c["sha"],
                "message": c["commit"]["message"],
                "repo": name,
                "timestamp": c["commit"]["author"]["date"],
                "date": datetime.fromisoformat(
                    c["commit"]["author"]["date"].replace("Z", "")
                ),
            }
            all_commits.append(commit_data)
            recent_commits.append(commit_data)

    weekly_activity = compute_weekly_activity(all_commits)
    streak = compute_streak([c["date"] for c in all_commits])
    coding_time = compute_coding_time(all_commits)

    return {
        "metrics": {
            "weeklyCommits": len(all_commits),
            "codingMinutes": sum(d["minutes"] for d in weekly_activity),
            "streakDays": streak,
            "aiScore": min(100, len(all_commits) * 5),
        },
        "weeklyActivity": weekly_activity,
        "github": {
            "mostActiveDay": max(
                weekly_activity, key=lambda d: d["commits"]
            )["name"]
            if weekly_activity
            else None,
            "reposTouched": len({c["repo"] for c in all_commits}),
            "recentCommits": recent_commits[:5],
        },
        "codingTime": coding_time,
        "aiInsight": None,
        "meta": {
            "source": "github",
            "lastUpdated": datetime.utcnow().isoformat(),
            "warnings": [],
        },
    }