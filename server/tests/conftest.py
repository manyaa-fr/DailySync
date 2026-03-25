import pytest
import os
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

# Mock environment variables BEFORE importing app
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["GITHUB_CLIENT_ID"] = "test-client-id"
os.environ["GITHUB_CLIENT_SECRET"] = "test-client-secret"
os.environ["GITHUB_REDIRECT_URI"] = "http://localhost:8000/callback"
os.environ["FRONTEND_BASE_URL"] = "http://localhost:3000"
os.environ["DB_NAME"] = "test_db"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017"
os.environ["API_KEY"] = "test-api-key"

from src.app import app
from src.config.db import client as real_client

@pytest.fixture(autouse=True)
async def mock_mongodb(monkeypatch):
    """
    Automatically replace the real MongoDB client with a mock client for every test.
    """
    mock_client = AsyncMongoMockClient()
    mock_db = mock_client["test_db"]
    
    # Patch the db instance used in Routes and Services
    monkeypatch.setattr("src.config.db.db", mock_db)
    monkeypatch.setattr("src.Routes.AuthRoutes.users", mock_db["user"])
    monkeypatch.setattr("src.Routes.AuthRoutes.oauth_states", mock_db["oauth_states"])
    
    yield mock_db

@pytest.fixture
def client():
    """
    Test client for FastAPI app.
    """
    with TestClient(app) as c:
        yield c