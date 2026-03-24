"""
Unit tests for services/etl_sessions.py

Tests: parse_iso_datetime + compute_code_activity_in_window
Total: 18 test cases
"""

import pytest
from datetime import datetime, timezone, timedelta



from services.etl_sessions import parse_iso_datetime, compute_code_activity_in_window


# ─────────────────────────────────────────────
# parse_iso_datetime
# ─────────────────────────────────────────────

class TestParseIsoDatetime:

    def test_none_returns_none(self):
        assert parse_iso_datetime(None) is None

    def test_empty_string_returns_none(self):
        assert parse_iso_datetime("") is None

    def test_whitespace_string_returns_none(self):
        assert parse_iso_datetime("   ") is None

    def test_non_string_non_datetime_returns_none(self):
        assert parse_iso_datetime(12345) is None

    def test_valid_z_suffix_string(self):
        result = parse_iso_datetime("2024-06-15T10:30:00Z")
        assert isinstance(result, datetime)
        assert result.tzinfo is not None
        assert result.year == 2024
        assert result.hour == 10

    def test_valid_offset_string(self):
        result = parse_iso_datetime("2024-06-15T10:30:00+05:30")
        assert isinstance(result, datetime)
        assert result.tzinfo is not None

    def test_naive_datetime_gets_utc(self):
        result = parse_iso_datetime("2024-01-01T00:00:00")
        assert result.tzinfo == timezone.utc

    def test_datetime_passthrough(self):
        dt = datetime(2024, 1, 1, tzinfo=timezone.utc)
        assert parse_iso_datetime(dt) is dt

    def test_invalid_string_returns_none(self):
        assert parse_iso_datetime("not-a-date") is None

    def test_malformed_iso_returns_none(self):
        assert parse_iso_datetime("2024-13-45") is None


# ─────────────────────────────────────────────
# compute_code_activity_in_window
# ─────────────────────────────────────────────

class TestComputeCodeActivityInWindow:

    def _make_commit(self, offset_minutes: int, additions: int = 10, deletions: int = 5):
        base = datetime(2024, 6, 15, 10, 0, 0, tzinfo=timezone.utc)
        return {
            "committed_at": (base + timedelta(minutes=offset_minutes)).isoformat(),
            "additions": additions,
            "deletions": deletions,
        }

    @property
    def _session_start(self):
        return datetime(2024, 6, 15, 10, 0, 0, tzinfo=timezone.utc)

    @property
    def _session_end(self):
        return datetime(2024, 6, 15, 12, 0, 0, tzinfo=timezone.utc)

    def test_empty_commits_returns_zeros(self):
        result = compute_code_activity_in_window(
            commits=[],
            session_start=self._session_start,
            session_end=self._session_end,
        )
        assert result == {"commitCount": 0, "additions": 0, "deletions": 0}

    def test_none_start_returns_zeros(self):
        result = compute_code_activity_in_window(
            commits=[self._make_commit(30)],
            session_start=None,
            session_end=self._session_end,
        )
        assert result["commitCount"] == 0

    def test_none_end_returns_zeros(self):
        result = compute_code_activity_in_window(
            commits=[self._make_commit(30)],
            session_start=self._session_start,
            session_end=None,
        )
        assert result["commitCount"] == 0

    def test_commit_inside_window_counted(self):
        result = compute_code_activity_in_window(
            commits=[self._make_commit(30)],
            session_start=self._session_start,
            session_end=self._session_end,
        )
        assert result["commitCount"] == 1
        assert result["additions"] == 10
        assert result["deletions"] == 5

    def test_commit_outside_window_not_counted(self):
        result = compute_code_activity_in_window(
            commits=[self._make_commit(180)],   # 3 hours into session (end = 2h)
            session_start=self._session_start,
            session_end=self._session_end,
        )
        assert result["commitCount"] == 0

    def test_commit_exactly_at_boundary_counted(self):
        result = compute_code_activity_in_window(
            commits=[self._make_commit(0), self._make_commit(120)],  # start & end
            session_start=self._session_start,
            session_end=self._session_end,
        )
        assert result["commitCount"] == 2

    def test_multiple_commits_accumulated(self):
        commits = [self._make_commit(i * 10) for i in range(6)]   # 0,10,20,30,40,50 min
        result = compute_code_activity_in_window(
            commits=commits,
            session_start=self._session_start,
            session_end=self._session_end,
        )
        assert result["commitCount"] == 6
        assert result["additions"] == 60
        assert result["deletions"] == 30

    def test_swapped_session_timestamps_auto_corrected(self):
        """If start > end, the function should swap them gracefully."""
        result = compute_code_activity_in_window(
            commits=[self._make_commit(30)],
            session_start=self._session_end,     # swapped intentionally
            session_end=self._session_start,
        )
        assert result["commitCount"] == 1
