# ARCHITECTURE.md: Test Infrastructure Setup

## 1. Analysis
The project currently lacks an automated testing framework. To ensure reliability and enable future CI/CD integration, we need to establish a robust testing foundation using `pytest`.

**Requirements:**
- **Framework:** `pytest` (Standard for Python)
- **Async Support:** `pytest-asyncio` (Required for FastAPI/async functions)
- **Coverage:** `pytest-cov` (For code coverage metrics)
- **HTTP Client:** `httpx` (Already in requirements, used for `TestClient`)

**Constraints:**
- Must not disrupt existing `api/` or `services/` code.
- Configuration should be centralized in `pytest.ini`.

## 2. Structure & File Plan

### Modified Files
- `requirements.txt`: Add test dependencies.

### New Files
- `pytest.ini`: Configuration for test discovery and async mode.
- `tests/`: Root directory for all tests.
- `tests/__init__.py`: Package marker.
- `tests/conftest.py`: Global fixtures (e.g., `test_app`, `client`).
- `tests/test_smoke.py`: Verification test to ensure infrastructure works.

### Directory Layout
```
/crypto-analysis
├── pytest.ini          # [NEW] Configuration
├── requirements.txt    # [MOD] Add dependencies
└── tests/              # [NEW]
    ├── __init__.py
    ├── conftest.py     # Fixtures
    └── test_smoke.py   # Verification
```

## 3. Data Flow (Test Execution)
1.  **Discovery:** `pytest` reads `pytest.ini` -> scans `tests/`.
2.  **Setup:** `conftest.py` initializes `FastAPI` app instance (overriding dependencies if needed in future).
3.  **Execution:** `TestClient` sends requests to `app`.
4.  **Teardown:** Cleanup fixtures.

## 4. Verification Strategy
1.  **Dependency Install:** `pip install -r requirements.txt` -> Expect success.
2.  **Collection:** `pytest --collect-only` -> Expect listing of `test_smoke.py`.
3.  **Execution:** `pytest` -> Expect 1 passed test (exit code 0).
