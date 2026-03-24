from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId
from datetime import datetime, timedelta, timezone

from config.db import db
from services.etl_sessions import parse_iso_datetime
from services.predictor import (
    DayFeatures,
    build_predictive_ai_insight,
    predict_tomorrow_numbers,
)

router = APIRouter(prefix="/api/v1/insights", tags=["insights"])

time_logs_collection = db["time_logs"]
github_snapshots = db["github_snapshots"]


@router.get("/predict")
async def predict_productivity(request: Request):
    user_id = request.state.user_id
    if not user_id:
        raise HTTPException(status_code=401)

    now_utc = datetime.now(timezone.utc)
    history_start_day = (now_utc.date() - timedelta(days=13)).isoformat()
    history_days = [
        (now_utc.date() - timedelta(days=13 - i)).isoformat()
        for i in range(14)
    ]

    # Focus-time history (sessions) from `time_logs`.
    cursor = (
        time_logs_collection.find(
            {"user_id": ObjectId(user_id), "date": {"$gte": history_start_day}}
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

    # Code-activity history from latest `github_snapshots` (commit timestamps).
    snapshot = await github_snapshots.find_one({"user_id": ObjectId(user_id)})
    raw_commits = snapshot.get("commits", []) if snapshot else []

    commit_counts = {d: 0 for d in history_days}
    for c in raw_commits:
        committed_at = c.get("committed_at") or c.get("date")
        if not committed_at:
            continue
        if isinstance(committed_at, str):
            dt = parse_iso_datetime(committed_at)
        else:
            dt = committed_at
        if not isinstance(dt, datetime):
            continue
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

    prediction = predict_tomorrow_numbers(features)
    ai_insight = build_predictive_ai_insight(
        history_days=features,
        prediction=prediction,
        peak_focus_hour_label=peak_hour_label,
    )

    return {"prediction": prediction, "aiInsight": ai_insight}

