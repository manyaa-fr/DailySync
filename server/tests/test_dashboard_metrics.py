"""
Unit tests for services/dashboard_metrics.py

Tests: compute_weekly_activity, compute_streak, compute_coding_time, compute_code_churn
Total: 14 test cases
"""

import pytest
from datetime import datetime, timedelta, timezone, date


from services.dashboard_metrics import (
    compute_weekly_activity,
    compute_streak,
    compute_coding_time,
    compute_code_churn,
)


def _make_commit(dt: datetime, additions: int = 10, deletions: int = 3) -> dict:
    return {"date": dt, "additions": additions, "deletions": deletions}


# ─────────────────────────────────────────────
# compute_weekly_activity
# ─────────────────────────────────────────────

class TestComputeWeeklyActivity:

    def test_empty_commits_all_zeros(self):
        result = compute_weekly_activity([])
        assert len(result) == 7
        assert all(r["commits"] == 0 for r in result)

    def test_single_monday_commit(self):
        monday = datetime(2024, 6, 17, 10, 0, tzinfo=timezone.utc)  # known Monday
        result = compute_weekly_activity([_make_commit(monday)])
        monday_row = next(r for r in result if r["name"] == "Monday")
        assert monday_row["commits"] == 1

    def test_all_seven_days_represented(self):
        result = compute_weekly_activity([])
        names = [r["name"] for r in result]
        assert names == ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    def test_multiple_commits_same_day_accumulated(self):
        monday = datetime(2024, 6, 17, 10, 0, tzinfo=timezone.utc)
        commits = [_make_commit(monday)] * 3
        result = compute_weekly_activity(commits)
        monday_row = next(r for r in result if r["name"] == "Monday")
        assert monday_row["commits"] == 3


# ─────────────────────────────────────────────
# compute_streak
# ─────────────────────────────────────────────

class TestComputeStreak:

    def test_empty_dates_zero_streak(self):
        assert compute_streak([]) == 0

    def test_single_today_streak_one(self):
        today = datetime.utcnow()
        assert compute_streak([today]) == 1

    def test_consecutive_days_count(self):
        today = datetime.utcnow()
        dates = [today - timedelta(days=i) for i in range(4)]
        assert compute_streak(dates) == 4

    def test_gap_breaks_streak(self):
        today = datetime.utcnow()
        # today + 3 days ago (skip 1 and 2 days ago)
        dates = [today, today - timedelta(days=3)]
        streak = compute_streak(dates)
        assert streak == 1  # only today counts; gap breaks it


# ─────────────────────────────────────────────
# compute_coding_time
# ─────────────────────────────────────────────

class TestComputeCodingTime:

    def test_empty_commits_returns_none_peak(self):
        result = compute_coding_time([])
        assert result["mostProductiveTime"] is None
        assert result["dailyAverageMinutes"] == 0
        assert len(result["hourly"]) == 24

    def test_all_24_hours_in_hourly(self):
        result = compute_coding_time([])
        assert len(result["hourly"]) == 24

    def test_peak_hour_detected(self):
        # 3 commits at hour 9, 1 commit at hour 14
        commits = [
            _make_commit(datetime(2024, 6, 17, 9, i, tzinfo=timezone.utc))
            for i in range(3)
        ] + [_make_commit(datetime(2024, 6, 17, 14, 0, tzinfo=timezone.utc))]
        result = compute_coding_time(commits)
        assert result["mostProductiveTime"] == "09:00"


# ─────────────────────────────────────────────
# compute_code_churn
# ─────────────────────────────────────────────

class TestComputeCodeChurn:

    def test_zero_days_returns_empty(self):
        assert compute_code_churn([], days=0) == []

    def test_empty_commits_all_zeros(self):
        result = compute_code_churn([], days=7)
        assert len(result) == 7
        assert all(r["additions"] == 0 for r in result)

    def test_commit_today_counted(self):
        today_dt = datetime.utcnow().replace(hour=12, minute=0, second=0, microsecond=0)
        result = compute_code_churn([_make_commit(today_dt, additions=20, deletions=5)], days=7)
        today_row = result[-1]
        assert today_row["additions"] == 20
        assert today_row["deletions"] == 5

    def test_commit_outside_window_not_counted(self):
        old_dt = datetime.utcnow() - timedelta(days=30)
        result = compute_code_churn([_make_commit(old_dt, additions=100)], days=7)
        assert all(r["additions"] == 0 for r in result)
