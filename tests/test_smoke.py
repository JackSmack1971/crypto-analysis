import pytest

def test_health_check(client):
    """
    Smoke test to verify the API is reachable.
    Note: Since we don't have a dedicated /health endpoint yet, 
    we'll check 404 on root or a known endpoint to ensure app is up.
    Ideally, we should add a /health endpoint.
    For now, let's check /api/v1/symbols which should return 200 or 404 depending on data.
    Actually, let's just check that the app handles a request.
    """
    response = client.get("/docs")
    assert response.status_code == 200

def test_pytest_setup():
    """
    Basic test to verify pytest is working.
    """
    assert True
