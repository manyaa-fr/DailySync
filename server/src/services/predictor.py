from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from statistics import mean
from typing import Optional


def _clamp_int(value: float, *, lo: int, hi: int) -> int:
    if value < lo:
        return lo
    if value > hi:
        return hi
    return int(round(value))


@dataclass(frozen=True)
class DayFeatures:
    day: str  # YYYY-MM-DD
    deepwork_minutes: int
    deepwork_sessions: int
    commit_count: int


def predict_tomorrow_numbers(
    history_days: list[DayFeatures],
) -> dict[str, int]:
    """
    Lightweight, explainable predictor:
    - Deep-work minutes = weighted moving average + short-term trend.
    - Deep-work sessions = moving average.
    - Commit count = moving average.
    """
    if not history_days:
        return {"predDeepworkMinutes": 0, "predDeepworkSessions": 0, "predCommitCount": 0}

    deep_mins = [d.deepwork_minutes for d in history_days]
    deep_sessions = [d.deepwork_sessions for d in history_days]
    commits = [d.commit_count for d in history_days]

    def avg_last(values: list[int], n: int) -> float:
        return mean(values[-n:]) if values else 0.0

    deep_avg7 = avg_last(deep_mins, 7)
    sess_avg7 = avg_last(deep_sessions, 7)
    commits_avg7 = avg_last(commits, 7)

    # Trend: last-3 mean - previous-3 mean.
    if len(deep_mins) >= 6:
        deep_trend = avg_last(deep_mins, 3) - avg_last(deep_mins[:-3], 3)
        sess_trend = avg_last(deep_sessions, 3) - avg_last(deep_sessions[:-3], 3)
        commit_trend = avg_last(commits, 3) - avg_last(commits[:-3], 3)
    else:
        deep_trend = 0.0
        sess_trend = 0.0
        commit_trend = 0.0

    pred_deep_mins = deep_avg7 + 0.5 * deep_trend
    pred_sessions = sess_avg7 + 0.25 * sess_trend
    pred_commits = commits_avg7 + 0.2 * commit_trend

    return {
        "predDeepworkMinutes": _clamp_int(pred_deep_mins, lo=0, hi=600),
        "predDeepworkSessions": _clamp_int(pred_sessions, lo=0, hi=20),
        "predCommitCount": _clamp_int(pred_commits, lo=0, hi=200),
    }


def build_predictive_ai_insight(
    *,
    history_days: list[DayFeatures],
    prediction: dict[str, int],
    peak_focus_hour_label: Optional[str] = None,
) -> dict[str, str]:
    """
    Convert numeric predictions into a short, user-facing coaching summary.
    """
    if not history_days:
        return {"title": None, "summary": None}

    deep_mins_last7 = [d.deepwork_minutes for d in history_days[-7:]]
    sess_last7 = [d.deepwork_sessions for d in history_days[-7:]]

    avg_deep_mins = int(round(mean(deep_mins_last7))) if deep_mins_last7 else 0
    avg_sessions = int(round(mean(sess_last7))) if sess_last7 else 0

    pred_mins = prediction.get("predDeepworkMinutes", 0)
    pred_sessions = prediction.get("predDeepworkSessions", 0)
    pred_commits = prediction.get("predCommitCount", 0)

    if pred_mins >= 90:
        title = "Your next day looks deep-work ready"
        rec = "Protect that momentum with one scheduled deep-work block before context switching."
    elif pred_mins >= 45:
        title = "Steady pace forecast for tomorrow"
        rec = "Aim for one high-quality focus session; keep meetings clustered after the first block."
    else:
        title = "Low focus forecast — consider a focus reset"
        rec = "Try a short, distraction-free setup: define the smallest next task and start with 25 minutes."

    peak_hint = (
        f" Your best focus window recently is around {peak_focus_hour_label}."
        if peak_focus_hour_label
        else ""
    )

    summary = (
        f"Last 7 days averaged ~{avg_sessions} deep-work sessions/day and ~{avg_deep_mins} deep-work minutes/day. "
        f"Forecast for tomorrow: ~{pred_sessions} sessions and ~{pred_mins} deep-work minutes, "
        f"with ~{pred_commits} commits in the background. {rec}{peak_hint}"
    )

    return {"title": title, "summary": summary}

