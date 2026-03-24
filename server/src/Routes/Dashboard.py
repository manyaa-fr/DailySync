from fastapi import APIRouter, Request, HTTPException
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from typing import Optional

from config.db import db
from services.github_sync import sync_github_snapshot
from services.dashboard_metrics import (
    compute_weekly_activity,
    compute_streak,
    compute_coding_time,
    compute_code_churn,
)
from services.etl_sessions import parse_iso_datetime
from services.predictor import (
    DayFeatures,
    build_predictive_ai_insight,
    predict_tomorrow_numbers,
)

router = APIRouter(prefix="/api/v1", tags=["dashboard"])
STALE_AFTER = timedelta(hours=6)
users = db["user"]
github_snapshots = db["github_snapshots"]
time_logs_collection = db["time_logs"]


def format_last_active(dt: Optional[datetime]) -> str:
    if dt is None:
        return "Unknown"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    delta = now - dt
    if delta < timedelta(minutes=1):
        return "Just now"
    if delta < timedelta(hours=1):
        minutes = int(delta.total_seconds() // 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    if delta < timedelta(days=1):
        hours = int(delta.total_seconds() // 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    if delta < timedelta(days=7):
        days = delta.days
        return f"{days} day{'s' if days != 1 else ''} ago"
    return dt.strftime("%Y-%m-%d")


def language_color(name: str) -> str:
    colors = {
        "JavaScript": "#f7df1e",
        "TypeScript": "#3178c6",
        "Python": "#3572a5",
        "HTML": "#e34c26",
        "CSS": "#563d7c",
        "Go": "#00ADD8",
        "Java": "#b07219",
        "C#": "#178600",
        "C++": "#f34b7d",
        "Rust": "#dea584",
    }
    return colors.get(name, "#A27D5C")

@router.get("/dashboard")
async def get_dashboard(request: Request):
    user_id = request.state.user_id

    if not user_id:
        raise HTTPException(status_code=401)

    user = await users.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get("github"):
        return {
            "metrics": {
                "weeklyCommits": 0,
                "codingMinutes": 0,
                "streakDays": 0,
                "aiScore": 0,
            },
            "weeklyActivity": [],
            "codeChurn": [],
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
                "source": "demo",
                "lastUpdated": None,
                "warnings": ["GitHub not connected yet"],
            },
        }

    snapshot = await github_snapshots.find_one(
        {"user_id": ObjectId(user_id)}
    )

    now = datetime.now(timezone.utc)

    last_synced_at = None
    if snapshot:
        raw_last = snapshot.get("last_synced_at")
        if isinstance(raw_last, str):
            try:
                last_synced_at = datetime.fromisoformat(raw_last)
            except ValueError:
                last_synced_at = None
        else:
            last_synced_at = raw_last

        if isinstance(last_synced_at, datetime) and last_synced_at.tzinfo is None:
            last_synced_at = last_synced_at.replace(tzinfo=timezone.utc)

    if (
        not snapshot
        or not last_synced_at
        or last_synced_at < now - STALE_AFTER
    ):
        await sync_github_snapshot(ObjectId(user_id))
        snapshot = await github_snapshots.find_one(
            {"user_id": ObjectId(user_id)}
        )

    if not snapshot:
        return {
            "metrics": {
                "weeklyCommits": 0,
                "codingMinutes": 0,
                "streakDays": 0,
                "aiScore": 0,
            },
            "weeklyActivity": [],
            "codeChurn": [],
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
                "warnings": ["No GitHub activity found yet"],
            },
        }

    raw_commits = snapshot.get("commits", [])

    normalized_commits = []
    for c in raw_commits:
        committed_at = c.get("committed_at") or c.get("date")
        if not committed_at:
            continue

        if isinstance(committed_at, str):
            dt = datetime.fromisoformat(committed_at)
        else:
            dt = committed_at

        normalized_commits.append(
            {
                **c,
                "date": dt,
            }
        )

    weekly_activity = compute_weekly_activity(normalized_commits)
    streak = compute_streak([c["date"] for c in normalized_commits])
    coding_time = compute_coding_time(normalized_commits)
    code_churn = compute_code_churn(normalized_commits)

    recent_commits = sorted(
        normalized_commits,
        key=lambda c: c["date"],
        reverse=True,
    )[:5]

    # -------------------------
    # Predictive productivity
    # -------------------------
    ai_insight = None
    try:
        now_utc = datetime.now(timezone.utc)
        history_start_day = (now_utc.date() - timedelta(days=13)).isoformat()
        history_days = [
            (now_utc.date() - timedelta(days=13 - i)).isoformat()
            for i in range(14)
        ]

        # Focus-time history (from normalized `time_logs` records).
        cursor = (
            time_logs_collection.find(
                {
                    "user_id": ObjectId(user_id),
                    "date": {"$gte": history_start_day},
                }
            )
            .sort("date", -1)
            .limit(500)
        )
        recent_time_logs_docs = await cursor.to_list(length=500)

        daily_focus = {
            d: {"deepwork_minutes": 0, "deepwork_sessions": 0} for d in history_days
        }
        peak_hour_counts: dict[int, int] = {}

        for log in recent_time_logs_docs:
            day = log.get("date")
            if day not in daily_focus:
                continue

            minutes = int(log.get("minutes") or 0)
            is_deep = bool(log.get("isDeepWork", False))

            if is_deep:
                daily_focus[day]["deepwork_minutes"] += minutes
                daily_focus[day]["deepwork_sessions"] += 1

                session_start = parse_iso_datetime(log.get("startTime"))
                if session_start:
                    peak_hour_counts[session_start.hour] = (
                        peak_hour_counts.get(session_start.hour, 0) + 1
                    )

        peak_hour = (
            max(peak_hour_counts, key=lambda h: peak_hour_counts[h])
            if peak_hour_counts
            else None
        )
        peak_hour_label = f"{peak_hour:02d}:00" if peak_hour is not None else None

        # Code-activity history (from normalized GitHub commit timestamps).
        commit_counts = {d: 0 for d in history_days}
        for c in normalized_commits:
            dt = c["date"]
            day = dt.date().isoformat()
            if day in commit_counts:
                commit_counts[day] += 1

        features = [
            DayFeatures(
                day=d,
                deepwork_minutes=daily_focus[d]["deepwork_minutes"],
                deepwork_sessions=daily_focus[d]["deepwork_sessions"],
                commit_count=commit_counts[d],
            )
            for d in history_days
        ]

        deepwork_minutes_last7 = sum(f.deepwork_minutes for f in features[-7:])
        deepwork_sessions_last7 = sum(f.deepwork_sessions for f in features[-7:])

        # Only show predictions once we have enough focus sessions.
        if deepwork_sessions_last7 >= 4 or deepwork_minutes_last7 >= 120:
            prediction = predict_tomorrow_numbers(features)
            ai_insight = build_predictive_ai_insight(
                history_days=features,
                prediction=prediction,
                peak_focus_hour_label=peak_hour_label,
            )
    except Exception:
        # Prediction should never break the core dashboard experience.
        ai_insight = None

    language_totals = snapshot.get("languages") or {}
    language_items = list(language_totals.items()) if isinstance(language_totals, dict) else []
    total_lines = sum(int(v) for _, v in language_items) or 0

    languages = []
    primary_language = None

    if total_lines > 0:
        language_items.sort(key=lambda item: item[1], reverse=True)
        primary_language = language_items[0][0]
        for name, lines in language_items:
            percentage = int(round((int(lines) / total_lines) * 100))
            languages.append(
                {
                    "name": name,
                    "percentage": percentage,
                    "color": language_color(name),
                }
            )

    repo_stats: dict[str, dict[str, object]] = {}
    for commit in normalized_commits:
        repo_name = commit.get("repo_name")
        if not repo_name:
            continue
        dt = commit["date"]
        if repo_name not in repo_stats:
            repo_stats[repo_name] = {
                "count": 0,
                "last": dt,
            }
        repo_stats[repo_name]["count"] = int(repo_stats[repo_name]["count"]) + 1
        if dt > repo_stats[repo_name]["last"]:
            repo_stats[repo_name]["last"] = dt

    repos = [
        {
            "name": name,
            "commitCount": stats["count"],
            "lastActive": format_last_active(stats["last"]),
        }
        for name, stats in sorted(
            repo_stats.items(),
            key=lambda item: (item[1]["last"]),
            reverse=True,
        )
    ]

    return {
        "metrics": {
            "weeklyCommits": sum(d["commits"] for d in weekly_activity),
            "codingMinutes": sum(d["minutes"] for d in weekly_activity),
            "streakDays": streak,
            "aiScore": min(100, len(normalized_commits) * 2),
        },
        "weeklyActivity": weekly_activity,
        "codeChurn": code_churn,
        "github": {
            "mostActiveDay": max(
                weekly_activity, key=lambda d: d["commits"]
            )["name"]
            if weekly_activity
            else None,
            "reposTouched": len({c["repo_name"] for c in normalized_commits}),
            "recentCommits": [
                {
                    "id": c["sha"],
                    "repo": c["repo_name"],
                    "message": c.get("message", ""),
                    "timestamp": c["date"].isoformat(),
                }
                for c in recent_commits
            ],
        },
        "codingTime": coding_time,
        "aiInsight": ai_insight,
        "languages": languages,
        "primaryLanguage": primary_language,
        "repos": repos,
        "meta": {
            "source": "github",
            "lastUpdated": snapshot["last_synced_at"].isoformat()
            if snapshot.get("last_synced_at")
            else None,
            "warnings": [],
        },
    }
