import pytest
from fastapi.testclient import TestClient

def test_register_success(client):
    """
    Test Case 1: Successful registration with valid data.
    """
    response = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Test User",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "Registration successful" in response.json()["message"]

def test_register_duplicate_email(client):
    """
    Test Case 2: Registration fails if email already exists.
    """
    # First registration
    client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Test User",
            "email": "duplicate@example.com",
            "password": "password123"
        }
    )
    # Second registration with same email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Another User",
            "email": "duplicate@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 400
    assert "Email already exists" in response.json()["detail"]

def test_register_invalid_password(client):
    """
    Test Case 3: Registration fails if password is too short.
    """
    response = client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Test User",
            "email": "short@example.com",
            "password": "123"
        }
    )
    assert response.status_code == 400
    assert "at least 8 characters" in response.json()["detail"]

def test_login_success(client):
    """
    Test Case 4: Successful login returns access token cookie.
    """
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Login User",
            "email": "login@example.com",
            "password": "password123"
        }
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies
    assert response.json()["user"]["email"] == "login@example.com"

def test_login_wrong_password(client):
    """
    Test Case 5: Login fails with incorrect password.
    """
    client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "Wrong Pass",
            "email": "wrongpass@example.com",
            "password": "password123"
        }
    )
    
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "incorrectpassword"
        }
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]