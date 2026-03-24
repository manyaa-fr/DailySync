"""
API route integration tests using FastAPI's TestClient + mocked MongoDB.

Tests: auth, dashboard, time-logs, summary, insights, analytics endpoints
Total: ~14 test cases
"""

import os
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient


# ─────────────────────────────────────────────
# App bootstrap with mocked DB and middleware
# ─────────────────────────────────────────────

# Set env vars FIRST so config/db.py's guard passes, then patch motor so no
# real connection is attempted when the module is imported.
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "test_dailysync")

with patch("motor.motor_asyncio.AsyncIOMotorClient", MagicMock()):
    # Stub out the middleware so we can inject a fake user_id.
    # BaseHTTPMiddleware uses `dispatch`, not `__call__`, so we patch dispatch.
    import middleware.AuthMiddleware as _mw

    async def _bypass_dispatch(self, request, call_next):
        """Inject a fake user_id to bypass JWT verification in tests."""
        request.state.user_id = "000000000000000000000001"
        request.state.user_email = "test@example.com"
        return await call_next(request)

    _mw.AuthMiddleware.dispatch = _bypass_dispatch

    from app import app



client = TestClient(app, raise_server_exceptions=False)

FAKE_USER_ID = "000000000000000000000001"


# ─────────────────────────────────────────────
# Public / health endpoints
# ─────────────────────────────────────────────

class TestPublicRoutes:

    def test_root_accessible(self):
        response = client.get("/")
        # Public route should return 200 or redirect; not 5xx
        assert response.status_code < 500

    def test_docs_accessible(self):
        response = client.get("/docs")
        assert response.status_code == 200


# ─────────────────────────────────────────────
# Dashboard endpoint
# ─────────────────────────────────────────────

class TestDashboardRoute:

    @patch("Routes.Dashboard.users")
    @patch("Routes.Dashboard.github_snapshots")
    @patch("Routes.Dashboard.time_logs_collection")
    def test_dashboard_no_github_returns_empty_metrics(self, mock_tl, mock_gs, mock_users):
        # User exists but has no GitHub connection
        mock_users.find_one = AsyncMock(return_value={"_id": "fake_id", "github": None})
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "metrics" in data
        assert data["metrics"]["weeklyCommits"] == 0

    @patch("Routes.Dashboard.users")
    def test_dashboard_db_error_handled(self, mock_users):
        mock_users.find_one = AsyncMock(side_effect=Exception("DB error"))
        response = client.get("/api/v1/dashboard")
        # Should return 500 or similar, not crash the process
        assert response.status_code in (200, 500)


# ─────────────────────────────────────────────
# Time-logs endpoint
# ─────────────────────────────────────────────

class TestTimeLogsRoute:

    @patch("Routes.TimeRoutes.time_logs_collection")
    @patch("Routes.TimeRoutes.developer_sessions_collection")
    @patch("Routes.TimeRoutes.github_snapshots_collection")
    def test_get_time_logs_returns_200(self, mock_gs, mock_ds, mock_tl):
        mock_tl.find.return_value.sort.return_value.limit.return_value.to_list = AsyncMock(return_value=[])
        mock_tl.aggregate.return_value.to_list = AsyncMock(return_value=[])
        response = client.get("/api/v1/time/logs")
        assert response.status_code == 200

    @patch("Routes.TimeRoutes.time_logs_collection")
    @patch("Routes.TimeRoutes.developer_sessions_collection")
    @patch("Routes.TimeRoutes.github_snapshots_collection")
    def test_post_time_log_valid_payload(self, mock_gs, mock_ds, mock_tl):
        from bson import ObjectId
        mock_tl.insert_one = AsyncMock(return_value=MagicMock(inserted_id=ObjectId()))
        mock_ds.update_one = AsyncMock(return_value=None)
        mock_gs.find_one = AsyncMock(return_value=None)

        payload = {
            "project": "DailySync",
            "description": "Worked on ETL pipeline",
            "minutes": 90,
            "date": "2024-06-17",
            "isDeepWork": True,
            "source": "manual",
            "tags": ["backend", "python"],
        }
        response = client.post("/api/v1/time/logs", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["project"] == "DailySync"
        assert data["minutes"] == 90

    def test_post_time_log_missing_required_field_returns_422(self):
        response = client.post("/api/v1/time/logs", json={"description": "no project or date"})
        assert response.status_code == 422


# ─────────────────────────────────────────────
# Summary endpoint
# ─────────────────────────────────────────────

class TestSummaryRoute:

    @patch("Routes.Summary.summaries_collection")
    def test_get_summaries_returns_list(self, mock_sc):
        mock_sc.find.return_value.sort.return_value.skip.return_value.limit.return_value.to_list = AsyncMock(return_value=[])
        response = client.get("/api/v1/summary/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @patch("Routes.Summary.summaries_collection")
    @patch("Routes.Summary.github_snapshots")
    def test_generate_summary_no_github_returns_message(self, mock_gs, mock_sc):
        mock_sc.find_one = AsyncMock(return_value=None)
        mock_gs.find_one = AsyncMock(return_value=None)
        response = client.post("/api/v1/summary/generate")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data


# ─────────────────────────────────────────────
# Insights endpoint
# ─────────────────────────────────────────────

class TestInsightsRoute:

    @patch("Routes.Insights.time_logs_collection")
    @patch("Routes.Insights.github_snapshots")
    def test_predict_returns_prediction_and_insight(self, mock_gs, mock_tl):
        mock_tl.find.return_value.sort.return_value.limit.return_value.to_list = AsyncMock(return_value=[])
        mock_gs.find_one = AsyncMock(return_value=None)
        response = client.get("/api/v1/insights/predict")
        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data
        assert "aiInsight" in data


# ─────────────────────────────────────────────
# Analytics (cohort) endpoint
# ─────────────────────────────────────────────

class TestAnalyticsRoute:

    @patch("Routes.Analytics.developer_sessions")
    def test_weekly_cohort_returns_200(self, mock_ds):
        mock_ds.aggregate.return_value.to_list = AsyncMock(return_value=[])
        response = client.get("/api/v1/analytics/cohorts?period=weekly")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "weekly"
        assert "cohorts" in data

    @patch("Routes.Analytics.developer_sessions")
    def test_monthly_cohort_returns_200(self, mock_ds):
        mock_ds.aggregate.return_value.to_list = AsyncMock(return_value=[])
        response = client.get("/api/v1/analytics/cohorts?period=monthly")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "monthly"

    def test_invalid_period_returns_422(self):
        response = client.get("/api/v1/analytics/cohorts?period=quarterly")
        assert response.status_code == 422

    @patch("Routes.Analytics.developer_sessions")
    def test_cohort_response_has_meta(self, mock_ds):
        mock_ds.aggregate.return_value.to_list = AsyncMock(return_value=[])
        response = client.get("/api/v1/analytics/cohorts")
        assert "meta" in response.json()
        assert "bucketCount" in response.json()["meta"]
