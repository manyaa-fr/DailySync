from datetime import datetime, timedelta
from collections import defaultdict


def compute_weekly_activity(commits):
    days = defaultdict(lambda: {"commits": 0, "minutes": 0})

    for c in commits:
        day = c["date"].strftime("%A")
        days[day]["commits"] += 1
        days[day]["minutes"] += 30  # heuristic: 30 min / commit

    ordered = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    return [
        {
            "name": d,
            "commits": days[d]["commits"],
            "minutes": days[d]["minutes"],
        }
        for d in ordered
    ]


def compute_streak(commit_dates):
    unique_days = sorted({d.date() for d in commit_dates}, reverse=True)

    streak = 0
    today = datetime.utcnow().date()

    for i, d in enumerate(unique_days):
        if d == today - timedelta(days=i):
            streak += 1
        else:
            break

    return streak


def compute_coding_time(commits):
    hourly = defaultdict(int)

    for c in commits:
        hour = c["date"].hour
        hourly[hour] += 1

    hourly_data = [
        {"name": f"{h:02d}", "value": hourly[h] * 30}
        for h in range(24)
    ]

    peak = max(hourly, key=lambda h: hourly[h], default=None)

    return {
        "hourly": hourly_data,
        "dailyAverageMinutes": int(sum(hourly.values()) * 30 / 7),
        "mostProductiveTime": f"{peak:02d}:00" if peak is not None else None,
        "peakHourLabel": f"{peak:02d}:00" if peak is not None else None,
    }


def compute_code_churn(commits, days: int = 7):
    if days <= 0:
        return []

    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)

    buckets = []
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        buckets.append(
            {
                "date": current_date,
                "label": current_date.strftime("%a"),
                "additions": 0,
                "deletions": 0,
            }
        )

    buckets_by_date = {b["date"]: b for b in buckets}

    for c in commits:
        dt = c.get("date")
        if not isinstance(dt, datetime):
            continue

        day = dt.date()
        if day < start_date or day > today:
            continue

        additions = c.get("additions")
        deletions = c.get("deletions")

        if additions is None and deletions is None:
            continue

        bucket = buckets_by_date.get(day)
        if not bucket:
            continue

        if additions is not None:
            try:
                bucket["additions"] += int(additions)
            except (TypeError, ValueError):
                pass
        if deletions is not None:
            try:
                bucket["deletions"] += int(deletions)
            except (TypeError, ValueError):
                pass

    return [
        {
            "day": b["label"],
            "additions": b["additions"],
            "deletions": b["deletions"],
        }
        for b in buckets
    ]
