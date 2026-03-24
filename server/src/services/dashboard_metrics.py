from datetime import datetime, timedelta, timezone
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
    if not commit_dates:
        return 0

    unique_days = sorted({d.date() for d in commit_dates}, reverse=True)

    streak = 0
    today = datetime.now(timezone.utc).date()
    
    # If the user hasn't committed today or yesterday, the streak is broken
    if unique_days[0] < today - timedelta(days=1):
        return 0

    # Start checking from the last day they committed
    current_check = unique_days[0]
    
    for d in unique_days:
        if d == current_check:
            streak += 1
            current_check -= timedelta(days=1)
        else:
            # Gap in commits
            break

    return streak


def compute_coding_time(commits):
    hourly = defaultdict(int)

    for c in commits:
        hour = c["date"].hour
        hourly[hour] += 1

    # Compute peak BEFORE building hourly_data (building it would auto-create
    # keys 0-23 in the defaultdict, making max() return 0 even for empty commits)
    peak = max(hourly, key=lambda h: hourly[h], default=None) if hourly else None

    hourly_data = [
        {"name": f"{h:02d}", "value": hourly.get(h, 0) * 30}
        for h in range(24)
    ]

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
