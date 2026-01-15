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
        {"name": f"{h}:00", "value": hourly[h] * 30}
        for h in range(24)
    ]

    peak = max(hourly, key=lambda h: hourly[h], default=None)

    return {
        "hourly": hourly_data,
        "dailyAverageMinutes": int(sum(hourly.values()) * 30 / 7),
        "mostProductiveTime": f"{peak}:00" if peak is not None else None,
        "peakHourLabel": f"{peak}:00" if peak is not None else None,
    }