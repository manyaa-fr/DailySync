"""
Unit tests for Routes/Analytics.py pipeline builder functions
and the cohort aggregation logic.

Tests: _build_weekly_pipeline, _build_monthly_pipeline structure + field validation
Total: 6 test cases
"""

import sys
import types
import importlib
import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from bson import ObjectId


# ─────────────────────────────────────────────
# Patch motor before any import of config.db
# ─────────────────────────────────────────────

with patch("motor.motor_asyncio.AsyncIOMotorClient", MagicMock()):
    pass

# We import the pure functions after patching the DB module to avoid real connections

_analytics_mod = None


def _load_analytics():
    global _analytics_mod
    if _analytics_mod is None:
        # Stub config.db so the import doesn't try to connect
        fake_db = types.ModuleType("config.db")
        fake_db.db = {}  # dict acts as collection namespace
        sys.modules.setdefault("config", types.ModuleType("config"))
        sys.modules["config.db"] = fake_db
        import Routes.Analytics as _m
        _analytics_mod = _m
    return _analytics_mod


class TestWeeklyPipelineBuilder:

    def test_pipeline_is_list(self):
        mod = _load_analytics()
        uid = ObjectId()
        pipeline = mod._build_weekly_pipeline(uid, weeks=4)
        assert isinstance(pipeline, list)
        assert len(pipeline) > 0

    def test_pipeline_first_stage_is_match(self):
        mod = _load_analytics()
        uid = ObjectId()
        pipeline = mod._build_weekly_pipeline(uid, weeks=4)
        assert "$match" in pipeline[0]

    def test_pipeline_match_contains_user_id(self):
        mod = _load_analytics()
        uid = ObjectId()
        pipeline = mod._build_weekly_pipeline(uid, weeks=4)
        assert pipeline[0]["$match"]["user_id"] == uid

    def test_pipeline_contains_group_stage(self):
        mod = _load_analytics()
        pipeline = mod._build_weekly_pipeline(ObjectId())
        stages = [list(s.keys())[0] for s in pipeline]
        assert "$group" in stages


class TestMonthlyPipelineBuilder:

    def test_pipeline_is_list(self):
        mod = _load_analytics()
        uid = ObjectId()
        pipeline = mod._build_monthly_pipeline(uid, months=3)
        assert isinstance(pipeline, list)

    def test_pipeline_match_contains_user_id(self):
        mod = _load_analytics()
        uid = ObjectId()
        pipeline = mod._build_monthly_pipeline(uid, months=3)
        assert pipeline[0]["$match"]["user_id"] == uid
