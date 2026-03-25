import pytest

def test_get_dashboard_unauthorized(client):
    """
    Test Case 11: Dashboard route returns 401 if no cookie is present.
    """
    response = client.get("/api/v1/dashboard/metrics")
    # Note: Depending on your AuthMiddleware implementation, 
    # it might return 401 or the route might handle it.
    assert response.status_code == 401

def test_public_route_health(client):
    """
    Test Case 12: Public health check always returns 200.
    """
    response = client.get("/")
    assert response.status_code == 200