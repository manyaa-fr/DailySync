"""
Cohort analytics endpoint — weekly and monthly time-series aggregations.

GET /api/v1/analytics/cohorts?period=weekly   → 12-week rolling window
GET /api/v1/analytics/cohorts?period=monthly  → 6-month rolling window

Each bucket contains aggregated focus-time and code-activity signals from
the `developer_sessions` collection (the normalized ETL output), enabling
time-series analysis of developer performance trends.
"""

from fastapi import APIRouter, HTTPException, Query, Request
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from typing import Literal

from config.db import db

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

developer_sessions = db["developer_sessions"]


def _build_weekly_pipeline(user_id: ObjectId, weeks: int = 12) -> list[dict]:
    """Aggregate developer_sessions by ISO week for the last `weeks` weeks."""
    cutoff = datetime.now(timezone.utc) - timedelta(weeks=weeks)
    cutoff_date = cutoff.date().isoformat()

    return [
        {
            "$match": {
                "user_id": user_id,
                "date": {"$gte": cutoff_date},
            }
        },
        {
            "$addFields": {
                # Parse 'date' string → date object for week arithmetic.
                "parsedDate": {
                    "$dateFromString": {
                        "dateString": "$date",
                        "format": "%Y-%m-%d",
                        "onError": None,
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$isoWeekYear": "$parsedDate"},
                    "week": {"$isoWeek": "$parsedDate"},
                },
                "totalMinutes": {"$sum": "$minutes"},
                "deepWorkMinutes": {
                    "$sum": {
                        "$cond": [{"$eq": ["$isDeepWork", True]}, "$minutes", 0]
                    }
                },
                "totalSessions": {"$sum": 1},
                "deepWorkSessions": {
                    "$sum": {"$cond": [{"$eq": ["$isDeepWork", True]}, 1, 0]}
                },
                "commitCount": {"$sum": "$codeActivity.commitCount"},
                "linesAdded": {"$sum": "$codeActivity.additions"},
                "linesDeleted": {"$sum": "$codeActivity.deletions"},
            }
        },
        {"$sort": {"_id.year": 1, "_id.week": 1}},
        {
            "$project": {
                "_id": 0,
                "period": {
                    "$concat": [
                        {"$toString": "$_id.year"},
                        "-W",
                        {
                            "$cond": {
                                "if": {"$lt": ["$_id.week", 10]},
                                "then": {
                                    "$concat": [
                                        "0",
                                        {"$toString": "$_id.week"},
                                    ]
                                },
                                "else": {"$toString": "$_id.week"},
                            }
                        },
                    ]
                },
                "totalMinutes": 1,
                "deepWorkMinutes": 1,
                "totalSessions": 1,
                "deepWorkSessions": 1,
                "commitCount": 1,
                "linesAdded": 1,
                "linesDeleted": 1,
            }
        },
    ]


def _build_monthly_pipeline(user_id: ObjectId, months: int = 6) -> list[dict]:
    """Aggregate developer_sessions by calendar month for the last `months` months."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=months * 30)
    cutoff_date = cutoff.date().isoformat()

    return [
        {
            "$match": {
                "user_id": user_id,
                "date": {"$gte": cutoff_date},
            }
        },
        {
            "$addFields": {
                "parsedDate": {
                    "$dateFromString": {
                        "dateString": "$date",
                        "format": "%Y-%m-%d",
                        "onError": None,
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$parsedDate"},
                    "month": {"$month": "$parsedDate"},
                },
                "totalMinutes": {"$sum": "$minutes"},
                "deepWorkMinutes": {
                    "$sum": {
                        "$cond": [{"$eq": ["$isDeepWork", True]}, "$minutes", 0]
                    }
                },
                "totalSessions": {"$sum": 1},
                "deepWorkSessions": {
                    "$sum": {"$cond": [{"$eq": ["$isDeepWork", True]}, 1, 0]}
                },
                "commitCount": {"$sum": "$codeActivity.commitCount"},
                "linesAdded": {"$sum": "$codeActivity.additions"},
                "linesDeleted": {"$sum": "$codeActivity.deletions"},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {
            "$project": {
                "_id": 0,
                "period": {
                    "$concat": [
                        {"$toString": "$_id.year"},
                        "-",
                        {
                            "$cond": {
                                "if": {"$lt": ["$_id.month", 10]},
                                "then": {
                                    "$concat": [
                                        "0",
                                        {"$toString": "$_id.month"},
                                    ]
                                },
                                "else": {"$toString": "$_id.month"},
                            }
                        },
                    ]
                },
                "totalMinutes": 1,
                "deepWorkMinutes": 1,
                "totalSessions": 1,
                "deepWorkSessions": 1,
                "commitCount": 1,
                "linesAdded": 1,
                "linesDeleted": 1,
            }
        },
    ]


@router.get("/cohorts")
async def get_cohort_analytics(
    request: Request,
    period: Literal["weekly", "monthly"] = Query(
        default="weekly",
        description="Cohort granularity: 'weekly' (12-week window) or 'monthly' (6-month window).",
    ),
):
    """
    Return time-series developer performance cohorts from the normalized
    `developer_sessions` collection.

    - **weekly**: last 12 ISO weeks, one bucket per week (YYYY-Www)
    - **monthly**: last 6 calendar months, one bucket per month (YYYY-MM)

    Each bucket exposes:
    - `totalMinutes` / `deepWorkMinutes` — focus-time signals
    - `totalSessions` / `deepWorkSessions` — session counts
    - `commitCount`, `linesAdded`, `linesDeleted` — code-activity signals
    """
    user_id = request.state.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    uid = ObjectId(user_id)

    if period == "weekly":
        pipeline = _build_weekly_pipeline(uid)
        window_label = "12-week"
    else:
        pipeline = _build_monthly_pipeline(uid)
        window_label = "6-month"

    results = await developer_sessions.aggregate(pipeline).to_list(length=None)

    return {
        "period": period,
        "window": window_label,
        "cohorts": results,
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "bucketCount": len(results),
        },
    }
