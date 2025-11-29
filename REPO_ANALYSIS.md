# Repository Analysis & State Extrapolation

## Project Snapshot
*   **Repo**: `/crypto-analysis`
*   **Branch**: `main`
*   **Commit**: `ae207ed` (latest observed)
*   **Languages**: Python (Backend), TypeScript (Frontend)
*   **Key Artifacts Present**: Docs (`GEMINI.md`, `README.md`) | Packaging (`requirements.txt`, `package.json`) | Runtime (`api/main.py`, `vite.config.ts`)

## Evidence-Backed Signals

### Docs (Score: 4/5)
*   **Evidence**: `GEMINI.md` provides comprehensive context, architecture, and developer guides [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L1-L800]]. `README.md` exists with quickstart [[EVID: c:\workspaces\crypto-analysis\README.md:L1-L50]].
*   **Gap**: Missing API reference (Swagger/OpenAPI is auto-generated but not explicitly linked/hosted static docs).

### Build (Score: 3/5)
*   **Evidence**: Standard `pip` requirements [[EVID: c:\workspaces\crypto-analysis\requirements.txt:L1-L10]] and `npm` package.json [[EVID: c:\workspaces\crypto-analysis\crypto-frontend\package.json:L1-L47]].
*   **Gap**: No `Dockerfile` or `docker-compose.yml` for containerized build/run.

### Tests (Score: 0/5)
*   **Evidence**: No test files found in source directories. `GEMINI.md` explicitly states "Project currently has no automated test suite detected" [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L395-L395]].

### CI/CD (Score: 0/5)
*   **Evidence**: No `.github/workflows` or other CI configuration found. `GEMINI.md` confirms "No CI/CD pipeline detected" [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L298-L298]].

### Security (Score: 2/5)
*   **Evidence**: `GEMINI.md` warns about CORS `allow_origins=["*"]` [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L678-L678]] and lack of authentication [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L680-L680]].
*   **Positive**: `GEMINI.md` advises against hardcoded secrets [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L658-L658]].

### Observability (Score: 1/5)
*   **Evidence**: Basic logging implied by `api/main.py` (FastAPI default), but no structured logging or metrics configuration found.

### Operations (Score: 1/5)
*   **Evidence**: No deployment manifests (K8s, Terraform) or Procfiles found.

### Product Spec Clarity (Score: 4/5)
*   **Evidence**: `GEMINI.md` clearly defines goals, features, and architecture [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L11-L23]].

## Project State (Extrapolation)

*   **[Inference] Phase: MVP-building** (Confidence: 0.9)
    *   **Rationale**: The core functionality (API, Frontend, Indicators) is implemented and documented, but critical production pillars (Tests, CI/CD, Docker, Auth) are missing. The presence of "verify_setup.py" suggests a manual verification workflow typical of early development.

### Workstreams & Status
*   **Backend Core**: `stabilizing` - Services implemented, API defined [[EVID: c:\workspaces\crypto-analysis\api\main.py]].
*   **Frontend UI**: `in-progress` - Components exist, but active development on "OnboardingWizard" suggests ongoing UI work [[EVID: c:\workspaces\crypto-analysis\crypto-frontend\src\components\onboarding\OnboardingWizard.tsx]].
*   **Testing**: `blocked` - No infrastructure or tests exist [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L395]].
*   **DevOps**: `blocked` - No CI/CD or containerization [[EVID: c:\workspaces\crypto-analysis\GEMINI.md:L298]].

### Top Risks
1.  **R-001: Regression Risk** (High Likelihood x High Impact) - Lack of automated tests means any change can break existing features without warning.
2.  **R-002: Security Vulnerability** (Med Likelihood x High Impact) - Open CORS and lack of auth makes the API vulnerable if exposed.
3.  **R-003: Deployment Friction** (High Likelihood x Med Impact) - Lack of Docker/CI means manual, error-prone deployments.

## High-ROI Actions (1–3d)

*   **A-001: Initialize Test Suite** (Effort: S, Lift: Tests +2)
    *   Install `pytest` and `vitest`. Create one smoke test for Backend (health check) and Frontend (render App).
    *   Touch: `tests/test_api.py`, `crypto-frontend/src/App.test.tsx`.

*   **A-002: Containerize Application** (Effort: M, Lift: Ops +2)
    *   Add `Dockerfile` for API and Frontend. Add `docker-compose.yml` to run them together.
    *   Touch: `Dockerfile`, `docker-compose.yml`.

*   **A-003: Setup Basic CI** (Effort: S, Lift: CI/CD +2)
    *   Add GitHub Action to run linting and (newly created) tests on push.
    *   Touch: `.github/workflows/ci.yml`.

## Coverage & Gaps
*   **Deployment**: Cannot verify actual deployment target or URL (no config found).
*   **External Services**: Cannot verify valid connectivity to crypto exchanges (requires runtime secrets).
