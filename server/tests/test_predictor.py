"""
Unit tests for services/predictor.py

Tests: predict_tomorrow_numbers + build_predictive_ai_insight
Total: 16 test cases
"""

import pytest
from datetime import date, timedelta



from services.predictor import DayFeatures, predict_tomorrow_numbers, build_predictive_ai_insight


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _make_days(n: int, deep_mins: int = 60, sessions: int = 2, commits: int = 5) -> list[DayFeatures]:
    today = date.today()
    return [
        DayFeatures(
            day=(today - timedelta(days=n - 1 - i)).isoformat(),
            deepwork_minutes=deep_mins,
            deepwork_sessions=sessions,
            commit_count=commits,
        )
        for i in range(n)
    ]


# ─────────────────────────────────────────────
# predict_tomorrow_numbers
# ─────────────────────────────────────────────

class TestPredictTomorrowNumbers:

    def test_empty_history_returns_zeros(self):
        result = predict_tomorrow_numbers([])
        assert result == {
            "predDeepworkMinutes": 0,
            "predDeepworkSessions": 0,
            "predCommitCount": 0,
        }

    def test_single_day_history(self):
        days = _make_days(1, deep_mins=90, sessions=3, commits=8)
        result = predict_tomorrow_numbers(days)
        assert result["predDeepworkMinutes"] == 90
        assert result["predDeepworkSessions"] == 3
        assert result["predCommitCount"] == 8

    def test_steady_7_day_history(self):
        """All equal values → prediction equals the average."""
        days = _make_days(7, deep_mins=60, sessions=2, commits=4)
        result = predict_tomorrow_numbers(days)
        assert result["predDeepworkMinutes"] == 60
        assert result["predDeepworkSessions"] == 2
        assert result["predCommitCount"] == 4

    def test_14_day_history_rising_trend(self):
        """Rising trend: later values larger, so prediction > simple average."""
        today = date.today()
        days = [
            DayFeatures(
                day=(today - timedelta(days=13 - i)).isoformat(),
                deepwork_minutes=i * 10,      # 0 → 130
                deepwork_sessions=max(1, i),
                commit_count=i,
            )
            for i in range(14)
        ]
        result = predict_tomorrow_numbers(days)
        # With upward trend the prediction should be above the flat average (65 min)
        assert result["predDeepworkMinutes"] > 65

    def test_clamping_lower_bound(self):
        """Predict zero when all sessions are zero."""
        days = _make_days(7, deep_mins=0, sessions=0, commits=0)
        result = predict_tomorrow_numbers(days)
        assert result["predDeepworkMinutes"] == 0
        assert result["predDeepworkSessions"] == 0
        assert result["predCommitCount"] == 0

    def test_clamping_upper_bound_minutes(self):
        """Extremely large values get clamped to 600."""
        today = date.today()
        days = [
            DayFeatures(
                day=(today - timedelta(days=i)).isoformat(),
                deepwork_minutes=1000,
                deepwork_sessions=50,
                commit_count=500,
            )
            for i in range(7)
        ]
        result = predict_tomorrow_numbers(days)
        assert result["predDeepworkMinutes"] <= 600
        assert result["predDeepworkSessions"] <= 20
        assert result["predCommitCount"] <= 200

    def test_all_keys_present(self):
        days = _make_days(3)
        result = predict_tomorrow_numbers(days)
        assert {"predDeepworkMinutes", "predDeepworkSessions", "predCommitCount"} == set(result.keys())

    def test_returns_integers(self):
        days = _make_days(7, deep_mins=55, sessions=3, commits=7)
        result = predict_tomorrow_numbers(days)
        for v in result.values():
            assert isinstance(v, int)


# ─────────────────────────────────────────────
# build_predictive_ai_insight
# ─────────────────────────────────────────────

class TestBuildPredictiveAiInsight:

    def test_empty_history_returns_none_values(self):
        result = build_predictive_ai_insight(history_days=[], prediction={})
        assert result["title"] is None
        assert result["summary"] is None

    def test_high_forecast_title(self):
        days = _make_days(7, deep_mins=120, sessions=4, commits=10)
        prediction = {"predDeepworkMinutes": 120, "predDeepworkSessions": 4, "predCommitCount": 10}
        result = build_predictive_ai_insight(history_days=days, prediction=prediction)
        assert "deep-work ready" in result["title"]

    def test_mid_forecast_title(self):
        days = _make_days(7, deep_mins=60, sessions=2, commits=5)
        prediction = {"predDeepworkMinutes": 60, "predDeepworkSessions": 2, "predCommitCount": 5}
        result = build_predictive_ai_insight(history_days=days, prediction=prediction)
        assert "Steady" in result["title"]

    def test_low_forecast_title(self):
        days = _make_days(7, deep_mins=20, sessions=1, commits=1)
        prediction = {"predDeepworkMinutes": 20, "predDeepworkSessions": 1, "predCommitCount": 1}
        result = build_predictive_ai_insight(history_days=days, prediction=prediction)
        assert "Low focus" in result["title"]

    def test_peak_hour_included_in_summary(self):
        days = _make_days(7, deep_mins=90)
        prediction = {"predDeepworkMinutes": 90, "predDeepworkSessions": 3, "predCommitCount": 6}
        result = build_predictive_ai_insight(
            history_days=days, prediction=prediction, peak_focus_hour_label="09:00"
        )
        assert "09:00" in result["summary"]

    def test_no_peak_hour_no_hint(self):
        days = _make_days(7, deep_mins=90)
        prediction = {"predDeepworkMinutes": 90, "predDeepworkSessions": 3, "predCommitCount": 6}
        result = build_predictive_ai_insight(
            history_days=days, prediction=prediction, peak_focus_hour_label=None
        )
        assert "Your best focus window" not in result["summary"]

    def test_summary_contains_commit_count(self):
        days = _make_days(7, deep_mins=60, sessions=2, commits=8)
        prediction = {"predDeepworkMinutes": 60, "predDeepworkSessions": 2, "predCommitCount": 8}
        result = build_predictive_ai_insight(history_days=days, prediction=prediction)
        assert "8" in result["summary"]

    def test_result_keys_always_present(self):
        result = build_predictive_ai_insight(history_days=_make_days(1), prediction={"predDeepworkMinutes": 30, "predDeepworkSessions": 1, "predCommitCount": 2})
        assert "title" in result and "summary" in result
