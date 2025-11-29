import pytest
from fastapi.testclient import TestClient
from api.main import app

@pytest.fixture
def client():
    """
    Fixture for FastAPI TestClient.
    """
    return TestClient(app)
