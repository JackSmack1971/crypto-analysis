# ARCHITECTURE.md: Health Endpoint Implementation

## 1. Analysis
The API currently lacks a dedicated health check endpoint. This is essential for monitoring, load balancers, and container orchestration (e.g., Kubernetes liveness probes).

**Requirements:**
- **Endpoint:** `GET /health`
- **Response:** JSON `{"status": "ok", "timestamp": <iso_timestamp>}`
- **Status Code:** 200 OK
- **Logic:** Minimal logic to confirm the API server is up and running.

**Constraints:**
- Must be added to `api/main.py`.
- Must be covered by automated tests.

## 2. Structure & File Plan

### Modified Files
- `api/main.py`: Add the `/health` route handler.

### New Files
- `tests/test_api_health.py`: Unit test for the new endpoint.

### Directory Layout
```
/crypto-analysis
├── api/
│   └── main.py         # [MOD] Add /health
└── tests/
    └── test_api_health.py # [NEW] Test case
```

## 3. Data Flow
1.  **Request:** `GET /health`
2.  **Handler:** `health_check()` function in `api/main.py`
3.  **Response:** `{"status": "ok", "timestamp": "..."}`

## 4. Verification Strategy
1.  **Automated Test:** Run `pytest tests/test_api_health.py`.
    - Expect: 1 passed test.
    - Assertions: Status code 200, JSON body contains "status": "ok".
2.  **Manual Verification (Optional):** `curl http://localhost:8000/health` (if server running).
