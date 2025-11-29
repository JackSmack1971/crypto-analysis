import pytest
from datetime import datetime

def test_health_check(client):
    """
    Test the /health endpoint returns 200 OK and correct structure.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    
    # Verify timestamp format (ISO 8601)
    # This will raise ValueError if format is invalid
    datetime.fromisoformat(data["timestamp"])
