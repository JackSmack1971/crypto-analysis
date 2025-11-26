# GEMINI.md: AI Collaboration Guide

This document provides essential context for AI models interacting with the **Crypto Analysis Platform** project. Adhering to these guidelines will ensure consistency, maintain code quality, and optimize agent performance across both backend (Python/FastAPI) and frontend (TypeScript/React) components.

**Current Date Context:** It is Tuesday, November 25, 2025. This guide is optimized for clarity, efficiency, and maximum utility for modern AI coding agents compatible with the Model Context Protocol (MCP) including OpenAI's Codex, GitHub Copilot Workspace, Claude, and Google Gemini.

**File Hierarchy Note:** This file is located at the project root. More deeply-nested GEMINI.md files in subdirectories will take precedence for specific sub-areas of the codebase. Direct user prompts will always override instructions in this file.

---

## 1. Project Overview & Purpose

*   **Primary Goal:** The Crypto Analysis Platform is a comprehensive cryptocurrency analysis and algorithmic trading research system. It provides real-time market data ingestion, technical indicator calculation, multi-timeframe analysis, backtesting capabilities for trading strategies, and interactive visualization dashboards. The system is designed for quantitative researchers, algorithmic traders, and cryptocurrency analysts who need robust tools for strategy development and validation.

*   **Business Domain:** Financial Technology (FinTech), Cryptocurrency Trading, Quantitative Finance, Algorithmic Trading Systems, Market Data Analysis.

*   **Key Features:**
    1. **Real-Time Data Fetching:** Integration with cryptocurrency exchanges (via CCXT library) to fetch OHLCV (Open, High, Low, Close, Volume) data across multiple symbols and timeframes.
    2. **Technical Indicator Engine:** Comprehensive calculation of technical indicators including RSI, MACD, Bollinger Bands, ATR, and Ichimoku Cloud for market analysis.
    3. **Backtesting Framework:** Historical strategy simulation with position sizing, trade execution logic, PnL tracking, and performance metrics calculation.
    4. **Multi-Timeframe Analysis:** Cross-timeframe trend analysis with confluence scoring and alignment detection across 1h, 4h, and 1d timeframes.
    5. **Interactive Dashboards:** Dual UI options (Streamlit for rapid prototyping, React SPA for production-grade visualization) with real-time charting via Lightweight Charts library.

---

## 2. Core Technologies & Stack

### Backend Stack
*   **Languages:** Python 3.8+ (inferred from async/await usage and modern library dependencies)
*   **Primary Framework:** FastAPI 0.x (REST API server with OpenAPI documentation)
*   **ASGI Server:** Uvicorn (production-grade async server)
*   **Database:** SQLite (embedded relational database for market data persistence via `data/crypto.db`)
*   **Key Libraries/Dependencies:**
    *   `ccxt` - Cryptocurrency exchange integration (unified API for Binance, etc.)
    *   `pandas` - Time-series data manipulation and analysis
    *   `numpy` - Numerical computing for indicator calculations
    *   `pyyaml` - Configuration file parsing (YAML-based configs)
    *   `plotly` - Backend charting and visualization
    *   `sqlalchemy` - ORM and database abstraction layer
    *   `httpx` - Modern async HTTP client
    *   `streamlit` - Alternative rapid prototyping UI framework
*   **Package Manager:** `pip` (standard Python package manager, no `pyproject.toml` or `uv` detected)

### Frontend Stack
*   **Languages:** TypeScript 5.9.3 (strict type checking)
*   **UI Framework:** React 19.2.0 (latest with Server Components support)
*   **Build Tool:** Vite 7.2.4 (next-generation frontend tooling with SWC compiler)
*   **State Management:** Zustand 5.0.8 (lightweight state management with minimal boilerplate)
*   **Server State:** TanStack Query 5.90.10 (formerly React Query - server state caching and synchronization)
*   **Routing:** React Router DOM 7.9.6 (declarative routing)
*   **Styling:** Tailwind CSS 3.4.18 with Autoprefixer, PostCSS (utility-first CSS framework)
*   **Data Visualization:** Lightweight Charts 5.0.9 (TradingView's financial charting library)
*   **Key Libraries/Dependencies:**
    *   `@tanstack/react-table` 8.21.3 - Headless table utilities for data grids
    *   `@tanstack/react-virtual` 3.13.12 - Virtual scrolling for performance
    *   `axios` 1.13.2 - Promise-based HTTP client
    *   `zod` 4.1.13 - TypeScript-first schema validation
    *   `framer-motion` 12.23.24 - Production-ready animation library
    *   `lucide-react` 0.554.0 - Beautiful & consistent icon set
    *   `sonner` 2.0.7 - Toast notification system
    *   `clsx` 2.1.1 + `tailwind-merge` 3.4.0 - Utility for constructing className strings
*   **Package Manager:** `npm` (standard Node.js package manager, lockfile: `package-lock.json`)
*   **TypeScript Compiler:** SWC (Speedy Web Compiler via `@vitejs/plugin-react-swc`)

### DevOps & Tooling
*   **Linting (Frontend):** ESLint 9.39.1 with TypeScript ESLint 8.46.4, React Hooks plugin 7.0.1, React Refresh plugin 0.4.24
*   **Type Checking:** TypeScript strict mode enabled across frontend codebase
*   **Environment:** Development via `vite dev`, Production build via `vite build`

### Platforms
*   **Target Environment:** Web (modern browsers supporting ES2020+)
*   **Backend Deployment:** Any Python ASGI-compatible server (Uvicorn, Hypercorn, Gunicorn with Uvicorn workers)
*   **Frontend Deployment:** Static file hosting (Vercel, Netlify, AWS S3+CloudFront, etc.)

---

## 3. Architectural Patterns & Structure

### Overall Architecture
**Architecture Type:** Monolithic Backend with Service-Oriented Design + Decoupled SPA Frontend

**Reasoning:** The backend follows a layered service architecture where each service module (`data_fetcher`, `storage`, `indicators`, `backtester`, etc.) handles a specific domain concern. The FastAPI application in `api/main.py` acts as a thin orchestration layer exposing REST endpoints. The frontend is a completely decoupled Single Page Application (SPA) built with React, communicating with the backend exclusively via HTTP REST API. This separation enables independent scaling, deployment, and technology evolution for each layer.

**Data Flow:**
1. User interacts with React frontend UI
2. Frontend dispatches API requests via `axios` (wrapped in `apiService`)
3. FastAPI backend receives requests at `/api/v1/*` endpoints
4. Backend orchestrates service layer (`DataFetcher` → `StorageEngine` → `IndicatorEngine` → `Backtester`)
5. Responses flow back through API layer to frontend state management (Zustand + TanStack Query)

### Directory Structure Philosophy

#### Backend (Root Level)
*   **`/services`**: Core business logic modules implementing domain-specific functionality. Each service is a Python module with clear responsibilities:
    *   `data_fetcher.py` - Exchange API integration and OHLCV data retrieval
    *   `storage.py` - Database abstraction layer (SQLite via SQLAlchemy)
    *   `indicators.py` - Technical indicator calculation engine (RSI, MACD, BB, ATR, Ichimoku)
    *   `backtester.py` - Strategy simulation and historical performance analysis
    *   `multi_timeframe.py` - Cross-timeframe trend analysis and confluence detection
    *   `exporter.py` - Data export utilities (CSV, JSON for backtest results)

*   **`/config`**: YAML-based configuration files for application settings, watchlists, and trading strategies:
    *   `main.yaml` - Primary application configuration (data sources, storage, indicators, alerts, backtesting defaults)
    *   `watchlists.yaml` - User-defined symbol watchlists with metadata (timeframes, indicators per asset)
    *   `strategies/` - Directory containing strategy configuration files (e.g., `rsi_mean_reversion.yaml`)

*   **`/api`**: FastAPI application layer exposing REST endpoints and request/response models:
    *   `main.py` - FastAPI app initialization, middleware, route definitions
    *   `models.py` - Pydantic models for request validation and response serialization

*   **`/data`**: Runtime data directory (excluded from version control via `.gitignore`):
    *   `crypto.db` - SQLite database file storing historical OHLCV data

*   **`/exports`**: Generated export files from backtests and data exports (excluded from version control)

*   **`/logs`**: Application logs (excluded from version control)

*   **Root-level scripts:** Verification and maintenance utilities:
    *   `app.py` - Streamlit-based interactive dashboard (alternative UI)
    *   `verify_setup.py` - Basic system verification (config loading, data fetching, indicator calculation)
    *   `verify_full.py` - Comprehensive verification including backtesting and export functionality
    *   `requirements.txt` - Python dependency manifest

#### Frontend (`/crypto-frontend`)
*   **`/src`**: All TypeScript/React source code
    *   **`/services`**: API client layer and external service integrations
        *   `api.service.ts` - Singleton API service wrapping axios with typed endpoints
    *   **`/types`**: TypeScript type definitions and Zod schemas
        *   `market.types.ts` - Market data types (OHLCV, indicators, backtest results)
    *   **`/pages`**: Page-level components (route targets)
        *   `Dashboard.tsx` - Main dashboard view
    *   **`/app`**: Application-level components and layout
        *   `Layout.tsx` - Root layout component with navigation
    *   **`/components`**: Reusable UI components (inferred, not explicitly listed in search results)
    *   `main.tsx` - Application entry point (React 19 rendering)
    *   `App.tsx` - Root component with routing setup

*   **`/public`**: Static assets served directly (favicon, etc.)

*   **`/dist`**: Production build output (excluded from version control, generated by `npm run build`)

*   **Configuration files:**
    *   `package.json` - NPM dependencies and scripts
    *   `package-lock.json` - Dependency lock file
    *   `tsconfig.json` - TypeScript project references
    *   `tsconfig.app.json` - Application-specific TypeScript config
    *   `tsconfig.node.json` - Node.js tooling TypeScript config
    *   `vite.config.ts` - Vite build configuration with path aliases (`@/` → `./src`)
    *   `eslint.config.js` - ESLint configuration (flat config format)
    *   `tailwind.config.js` - Tailwind CSS configuration
    *   `postcss.config.js` - PostCSS configuration
    *   `index.html` - HTML entry point

### Module Organization

**Backend:** Python modules are organized by domain responsibility. Each service module exports a primary class (e.g., `DataFetcher`, `StorageEngine`, `Backtester`) which is instantiated in `api/main.py` and injected into route handlers. Configuration is loaded once at startup from YAML files using `pyyaml`.

**Frontend:** React application follows a feature-based structure with clear separation:
*   **Services Layer:** API communication abstraction (`apiService` singleton)
*   **Types Layer:** Runtime validation with Zod schemas + TypeScript type inference
*   **Component Layer:** Functional components using React Hooks
*   **State Layer:** Zustand stores for client state, TanStack Query for server state
*   **Routing Layer:** React Router with declarative `<Routes>` configuration

### Common Patterns & Idioms

#### Backend (Python)
*   **Async/Await:** Asynchronous I/O throughout for concurrent data fetching and API handling. All data fetching operations use `async def` and `await`.
*   **Dataclasses:** Extensive use of `@dataclass` decorator for structured data (e.g., `Trade` class in `backtester.py`)
*   **Pandas Operations:** Time-series data manipulated exclusively via `pandas.DataFrame` and `pandas.Series`
*   **YAML Configuration:** All configuration externalized to YAML files, loaded via `yaml.safe_load()`
*   **Type Hints:** Moderate use of type hints (e.g., `Dict`, `List`, `Any`) for API contracts
*   **Error Handling:** Try-except blocks with dictionary-based error responses (e.g., `{'error': 'message'}`)

#### Frontend (TypeScript/React)
*   **Functional Components:** 100% functional components with React Hooks (no class components)
*   **Custom Hooks:** Likely use of custom hooks for reusable stateful logic (pattern inferred from modern React best practices)
*   **Zod Validation:** Runtime type validation at API boundaries using Zod schemas (e.g., `OHLCVSchema`, `MarketDataSchema`)
*   **TypeScript-First:** All types defined explicitly with `.ts` files, schema-driven development (Zod → TypeScript type inference)
*   **Path Aliases:** Import aliasing with `@/` prefix for cleaner imports (configured in `vite.config.ts`)
*   **Composition Over Inheritance:** Component composition pattern throughout UI
*   **Controlled Components:** Form inputs managed via React state with controlled component pattern

---

## 4. Coding Conventions & Style Guide

### Backend (Python)

#### Formatting
*   **Indentation:** 4 spaces (PEP 8 standard)
*   **Line Length:** No strict limit observed, but generally 80-100 characters preferred (inferred from existing code)
*   **String Quotes:** Double quotes preferred (`"string"` over `'string'`) - observed pattern in config loading
*   **Docstrings:** Present but minimal - function-level docstrings for complex logic (e.g., `run_backtest` method)

#### Naming Conventions
*   **Variables/Functions:** `snake_case` (e.g., `data_fetcher`, `calculate_all_indicators`, `run_backtest`)
*   **Classes:** `PascalCase` (e.g., `DataFetcher`, `StorageEngine`, `Backtester`, `IndicatorEngine`)
*   **Constants:** `SCREAMING_SNAKE_CASE` (inferred standard, not explicitly observed)
*   **Private Methods:** Single leading underscore `_method_name` (e.g., `_determine_trend`, `_calculate_strength`)
*   **Module Files:** `snake_case.py` (e.g., `data_fetcher.py`, `multi_timeframe.py`)

#### API Design Principles
*   **Explicit Initialization:** Services require explicit configuration dictionary passed to constructors
*   **Stateful Services:** Service classes maintain internal state (database connections, API clients)
*   **Pandas-Centric:** All data processing functions accept and return `pandas.DataFrame` or `pandas.Series`
*   **Dictionary Return Values:** Complex return types use dictionaries with explicit keys (e.g., `{'trades': [...], 'metrics': {...}, 'final_capital': 10500.0}`)

#### Documentation Style
*   **Minimal Docstrings:** Function docstrings present for complex methods (e.g., `"Execute backtest with proper position sizing"`)
*   **Inline Comments:** Used sparingly for clarification of complex logic
*   **Configuration Documentation:** YAML files include inline comments explaining parameters

#### Error Handling
*   **Dictionary-Based Errors:** Error responses use `{'error': 'message'}` pattern
*   **Try-Except Blocks:** Used in API layer (`api/main.py`) to catch service exceptions
*   **Empty DataFrame Checks:** Explicit checks for `df.empty` before processing
*   **Async Exception Propagation:** Exceptions in async functions propagate to caller

#### Forbidden Patterns
*   **DO NOT** use `from module import *` - explicit imports only
*   **DO NOT** commit database files (`data/*.db`) - excluded in `.gitignore`
*   **DO NOT** commit sensitive API keys - use environment variables (`${COINGECKO_API_KEY}`, `${DISCORD_WEBHOOK_URL}`)
*   **DO NOT** use synchronous I/O operations in async functions - maintain async/await consistency

### Frontend (TypeScript/React)

#### Formatting
*   **Indentation:** 2 spaces (standard for modern React/TypeScript projects)
*   **Line Length:** 100 characters (inferred from ESLint configuration)
*   **String Quotes:** Single quotes (`'string'`) - TypeScript standard
*   **Semicolons:** Present at end of statements (TypeScript standard)
*   **Trailing Commas:** Required in multiline arrays/objects (improves Git diffs)

#### Naming Conventions
*   **Variables/Functions:** `camelCase` (e.g., `apiService`, `getMarketData`, `runBacktest`)
*   **React Components:** `PascalCase` (e.g., `Dashboard`, `Layout`, `App`)
*   **Types/Interfaces:** `PascalCase` (e.g., `OHLCV`, `MarketData`, `BacktestResult`, `APIResponse`)
*   **Type Guards:** `is`-prefix for boolean checks (e.g., `isSuccessResponse`)
*   **Constants:** `SCREAMING_SNAKE_CASE` for true constants, `camelCase` for configuration objects
*   **Private Class Members:** Prefix with `#` (TypeScript private fields) or `_` convention
*   **Files:** `PascalCase.tsx` for components, `camelCase.ts` for utilities, `kebab-case.types.ts` for type definitions

#### API Design Principles
*   **Singleton Services:** API service exported as singleton (`export const apiService = new APIService()`)
*   **Type-Safe API Calls:** All API methods return typed responses wrapped in `APIResponse<T>` union
*   **Zod Validation:** Runtime validation at API boundaries before TypeScript type assertion
*   **Error Boundaries:** API responses use discriminated unions for success/error states

#### Documentation Style
*   **JSDoc Comments:** Required for all public API methods in service classes
*   **Type Annotations:** Explicit type annotations preferred over inference for function parameters and return types
*   **Interface Documentation:** Exported types include inline comments for clarity

#### Error Handling
*   **Try-Catch Blocks:** Wrap all API calls in try-catch for network errors
*   **Error Propagation:** Throw errors from service layer to be caught by React components
*   **TanStack Query Error Handling:** Leverage `isError`, `error` properties from `useQuery`/`useMutation`
*   **User-Facing Messages:** Convert technical errors to user-friendly messages via `sonner` toast notifications

#### Forbidden Patterns
*   **NEVER** use `any` type in TypeScript unless absolutely necessary and explicitly commented
*   **NEVER** use `@ts-expect-error` or `@ts-ignore` to suppress type errors - fix the underlying issue
*   **NEVER** commit `.env` files with secrets - use `.env.local` (excluded in `.gitignore`)
*   **NEVER** commit `node_modules/` or `dist/` directories - excluded in `.gitignore`
*   **NEVER** use inline styles in React components - use Tailwind utility classes
*   **NEVER** mutate Zustand state directly - use immutable update patterns
*   **NEVER** use `localStorage` or `sessionStorage` without error handling (quota exceeded scenarios)

---

## 5. Key Files & Entrypoints

### Backend
*   **Main Application Entrypoint:** `api/main.py` - FastAPI application initialization, CORS middleware, route registration, service instantiation
*   **Alternative UI Entrypoint:** `app.py` - Streamlit dashboard (for rapid development/prototyping)
*   **Configuration Files:**
    *   `config/main.yaml` - Primary application configuration (data sources, storage paths, indicator defaults, backtesting parameters)
    *   `config/watchlists.yaml` - Symbol watchlists with metadata
    *   `config/strategies/*.yaml` - Trading strategy configurations (e.g., `rsi_mean_reversion.yaml`)
*   **Dependency Manifest:** `requirements.txt` - Python package dependencies
*   **Verification Scripts:**
    *   `verify_setup.py` - Basic verification (config load, data fetch, indicator calculation)
    *   `verify_full.py` - Comprehensive verification (backtest execution, data export)

### Frontend
*   **Application Entrypoint:** `crypto-frontend/src/main.tsx` - React 19 rendering with `createRoot()`
*   **Root Component:** `crypto-frontend/src/App.tsx` - React Router setup with `<Routes>` configuration
*   **HTML Entry:** `crypto-frontend/index.html` - HTML shell with `<div id="root"></div>`
*   **Configuration Files:**
    *   `crypto-frontend/package.json` - NPM scripts and dependencies
    *   `crypto-frontend/vite.config.ts` - Build configuration with SWC plugin and path aliases
    *   `crypto-frontend/tsconfig.json` - TypeScript project references
    *   `crypto-frontend/eslint.config.js` - Linting rules (flat config format)
    *   `crypto-frontend/tailwind.config.js` - Tailwind CSS configuration

### CI/CD Pipeline
**Status:** No CI/CD pipeline detected (no `.github/workflows/`, `.gitlab-ci.yml`, or similar files found). This is an area for future enhancement.

---

## 6. Development & Testing Workflow

### Local Development Environment

#### Backend Setup
1.  **Prerequisites:**
    *   Python 3.8+ installed (verify with `python --version` or `python3 --version`)
    *   `pip` package manager available

2.  **Install Dependencies:**
    ```bash
    # From project root
    pip install -r requirements.txt
    ```

3.  **Configure Environment:**
    *   Copy `config/main.yaml` template if needed (default values provided)
    *   Set environment variables for API keys (optional, defaults provided):
        ```bash
        export COINGECKO_API_KEY="your_key_here"
        export DISCORD_WEBHOOK_URL="your_webhook_url"
        export TELEGRAM_BOT_TOKEN="your_token"
        ```

4.  **Verify Setup:**
    ```bash
    python verify_setup.py
    ```
    This script validates:
    *   Configuration file loading
    *   Database initialization
    *   Data fetcher connectivity
    *   Indicator calculation
    *   Storage operations

5.  **Start Backend Server:**
    ```bash
    # FastAPI server (production-ready)
    uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
    
    # Alternative: Streamlit UI (development)
    streamlit run app.py
    ```

#### Frontend Setup
1.  **Prerequisites:**
    *   Node.js 20.x+ installed (verify with `node --version`)
    *   `npm` package manager available

2.  **Install Dependencies:**
    ```bash
    cd crypto-frontend
    npm install
    ```

3.  **Configure API Endpoint:**
    *   Frontend expects backend at `http://localhost:8000` (default)
    *   Modify `src/services/api.service.ts` if backend runs on different port

4.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    Vite dev server starts on `http://localhost:5173` with HMR enabled

### Build Commands

#### Backend
No build step required for Python (interpreted language). However, you may want to:
```bash
# Generate frozen requirements for reproducibility
pip freeze > requirements.lock

# Run full verification suite
python verify_full.py
```

#### Frontend
```bash
cd crypto-frontend

# Development build with HMR
npm run dev

# Production build (outputs to crypto-frontend/dist/)
npm run build

# Preview production build
npm run preview
```

### Testing Workflow

**CRITICAL:** This project currently has **no automated test suite detected**. This is a significant gap and should be addressed as a priority.

#### Testing Standards (To Be Implemented)
*   **All new features MUST include corresponding unit tests**
*   **Test coverage target:** 70-80% for backend services, 60-70% for frontend components
*   **Test Framework Recommendations:**
    *   **Backend:** `pytest` with `pytest-asyncio` for async tests, `pytest-cov` for coverage
    *   **Frontend:** Vitest (Vite-native testing), Testing Library for React components
*   **Mocking Strategy:**
    *   **Backend:** Mock external API calls (CCXT exchange APIs) using `pytest-mock` or `unittest.mock`
    *   **Frontend:** Mock API responses using Mock Service Worker (MSW) or Axios mock adapter
*   **Test File Naming:**
    *   **Backend:** `test_*.py` or `*_test.py` in `tests/` directory
    *   **Frontend:** `*.test.tsx` or `*.spec.tsx` adjacent to source files

#### Running Tests (Once Implemented)
```bash
# Backend tests
pytest tests/ -v --cov=services --cov=api

# Frontend tests
cd crypto-frontend
npm run test          # Watch mode
npm run test:ci       # Single run with coverage
```

### Linting & Formatting

#### Backend
**Current State:** No linter configuration detected (no `pyproject.toml`, `.flake8`, `pylintrc`, etc.)

**Recommended Setup:**
```bash
# Install development dependencies
pip install black isort flake8 mypy

# Format code
black .

# Sort imports
isort .

# Lint code
flake8 services/ api/

# Type check
mypy services/ api/
```

#### Frontend
```bash
cd crypto-frontend

# Run ESLint (checks TypeScript, React rules)
npm run lint

# Auto-fix linting issues (safe fixes only)
npm run lint -- --fix

# Type check without emitting files
npx tsc --noEmit
```

**Pre-Commit Requirement:** All code MUST pass linting checks before committing. ESLint errors will break the build.

### CI/CD Process
**Current State:** No CI/CD pipeline configured.

**Recommended Implementation (GitHub Actions Example):**
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest tests/ --cov
      - run: black --check .
      - run: flake8 services/ api/

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
        working-directory: crypto-frontend
      - run: npm run lint
        working-directory: crypto-frontend
      - run: npm run build
        working-directory: crypto-frontend
      - run: npm run test:ci
        working-directory: crypto-frontend
```

---

## 7. Git Workflow & PR Instructions

### Branching Strategy
*   **Main Branch:** `main` (or `master`) - production-ready code only
*   **Feature Branches:** `feat/<feature-name>` or `feature/<feature-name>` (e.g., `feat/multi-timeframe-ui`)
*   **Bugfix Branches:** `fix/<bug-description>` or `bugfix/<bug-description>` (e.g., `fix/indicator-calculation-error`)
*   **DO NOT** commit directly to `main` branch
*   **DO NOT** create long-lived feature branches - aim for small, frequent merges

### Pre-Commit Checks
**CRITICAL:** Before every commit, you MUST:

1.  **Backend:**
    ```bash
    # Format code
    black .
    isort .
    
    # Verify no linting errors
    flake8 services/ api/
    
    # Run tests (once implemented)
    pytest tests/
    ```

2.  **Frontend:**
    ```bash
    cd crypto-frontend
    
    # Run linter with auto-fix
    npm run lint -- --fix
    
    # Verify TypeScript compilation
    npx tsc --noEmit
    
    # Run tests (once implemented)
    npm run test:ci
    ```

3.  **Verify Clean Working Directory:**
    ```bash
    git status  # Should show only intended changes
    ```

### Commit Message Format
**Follow Conventional Commits specification:** `<type>(<scope>): <subject>`

**Types:**
*   `feat:` - New feature
*   `fix:` - Bug fix
*   `docs:` - Documentation only changes
*   `style:` - Code style changes (formatting, missing semicolons, etc.)
*   `refactor:` - Code change that neither fixes a bug nor adds a feature
*   `perf:` - Performance improvement
*   `test:` - Adding or updating tests
*   `chore:` - Maintenance tasks (dependencies, build config, etc.)

**Scope (optional):** `backend`, `frontend`, `api`, `indicators`, `backtester`, `ui`, `config`

**Examples:**
```
feat(indicators): add Ichimoku Cloud calculation
fix(backtester): correct position sizing logic for fractional shares
docs(readme): update installation instructions for Python 3.11
refactor(api): extract OHLCV validation to separate function
chore(deps): upgrade React to 19.2.0
```

**Commit Body (recommended for complex changes):**
```
feat(multi-timeframe): implement cross-timeframe confluence scoring

- Add _check_alignment() method to MultiTimeframeAnalyzer
- Implement confluence_score calculation based on trend agreement
- Update API endpoint to return alignment status
- Add unit tests for alignment logic

Closes #123
```

### Pull Request Process

1.  **Ensure Feature Branch is Up-to-Date:**
    ```bash
    git checkout main
    git pull origin main
    git checkout feat/my-feature
    git rebase main  # Or git merge main
    ```

2.  **Push Branch:**
    ```bash
    git push origin feat/my-feature
    ```

3.  **Create Pull Request:**
    *   **Title:** Use Conventional Commit format (e.g., `feat(indicators): add Fibonacci retracement`)
    *   **Description Template:**
        ```markdown
        ## Description
        Brief summary of changes and motivation.

        ## Changes Made
        - Change 1
        - Change 2
        - Change 3

        ## Testing Done
        - [ ] Manual testing completed
        - [ ] Unit tests added/updated
        - [ ] Linting passed
        - [ ] No breaking changes

        ## Related Issues
        Closes #123
        Relates to #456
        ```

4.  **Code Review Requirements:**
    *   All linting checks pass (ESLint, TypeScript compiler)
    *   All tests pass (once CI is implemented)
    *   At least one peer review approval
    *   No merge conflicts with `main`

5.  **Merge Strategy:**
    *   **Preferred:** Squash and merge (keeps main history clean)
    *   **Alternative:** Rebase and merge (preserves individual commits)
    *   **Avoid:** Merge commits (creates noisy history)

### Force Push Policy
*   **NEVER** use `git push --force` on `main` branch
*   **Use with caution** `git push --force-with-lease` on feature branches (only if you are the sole contributor to that branch)
*   **Communicate** with team before force-pushing to shared feature branches

### Clean Worktree Requirement
**You MUST leave your worktree in a clean state after completing any task:**
```bash
# Verify clean state
git status  # Should output "nothing to commit, working tree clean"

# If untracked files exist, either:
# 1. Add them to .gitignore if they are build artifacts
# 2. Commit them if they are intentional additions
# 3. Remove them if they are accidental
```

---

## 8. Security Considerations

### General Security Practices
*   **Security-First Mindset:** Assume all external inputs (API responses, user inputs, file uploads) are potentially malicious
*   **Principle of Least Privilege:** Database connections, file system access, and API permissions should use minimal required privileges
*   **Regular Dependency Updates:** Keep dependencies updated to patch known vulnerabilities (use `pip list --outdated` and `npm outdated`)

### Sensitive Data Handling
*   **DO NOT hardcode secrets in source code:** API keys, database credentials, webhook URLs must be externalized
*   **Use Environment Variables:** All secrets should be stored in environment variables (e.g., `COINGECKO_API_KEY`, `DISCORD_WEBHOOK_URL`)
*   **Configuration File Patterns:** YAML files use `${VAR_NAME}` syntax for environment variable substitution (e.g., `coingecko_api_key: "${COINGECKO_API_KEY}"`)
*   **`.gitignore` Enforcement:** Verify `.env`, `.env.local`, `data/`, `logs/`, `exports/` are excluded from version control

### Input Validation
*   **Backend:** Validate all incoming API requests using Pydantic models (`api/models.py`)
*   **Frontend:** Validate all API responses using Zod schemas before TypeScript type assertion
*   **Sanitize Strings:** Escape user-provided strings before rendering in UI (React does this automatically for JSX text content)
*   **SQL Injection Prevention:** Use SQLAlchemy ORM parameterized queries (never string concatenation for SQL)

### Vulnerability Avoidance
**Common CWE Patterns to Avoid:**
*   **CWE-89 (SQL Injection):** Always use SQLAlchemy ORM or parameterized queries
*   **CWE-79 (XSS):** React's JSX escapes by default, but avoid `dangerouslySetInnerHTML` unless absolutely necessary
*   **CWE-22 (Path Traversal):** Validate file paths before file operations (e.g., in `exporter.py`)
*   **CWE-502 (Deserialization):** Use `yaml.safe_load()` instead of `yaml.load()` (already implemented correctly)
*   **CWE-798 (Hardcoded Credentials):** No secrets in source code (enforce via pre-commit hooks in future)

### API Security
*   **CORS Configuration:** Currently set to `allow_origins=["*"]` in `api/main.py` - **CHANGE THIS IN PRODUCTION** to specific frontend origin
*   **Rate Limiting:** Not currently implemented - **RECOMMENDED** to add rate limiting middleware (e.g., `slowapi`)
*   **Authentication:** No authentication detected - **CRITICAL** if exposing to public internet
*   **HTTPS Enforcement:** Use HTTPS in production (TLS termination at reverse proxy or load balancer)

### Dependency Security
*   **Backend:** Regularly run `pip install --upgrade pip setuptools` and `pip list --outdated`
*   **Frontend:** Regularly run `npm audit` and `npm audit fix` to address known vulnerabilities
*   **Automated Scanning:** Consider integrating Dependabot or Snyk for automated vulnerability detection

---

## 9. Specific Agent Instructions & Known Issues

### Tool Usage

#### Python Package Management
*   **Use `pip install <package>`** for adding new backend dependencies
*   **Update `requirements.txt`** manually after installing new packages:
    ```bash
    pip freeze > requirements.txt
    ```
*   **DO NOT** use `uv`, `poetry`, or `pipenv` unless explicitly migrated to those tools

#### NPM Package Management
*   **Use `npm install <package>`** for adding frontend dependencies (updates `package.json` and `package-lock.json`)
*   **Use `npm install <package> --save-dev`** for development dependencies (linters, type definitions, etc.)
*   **Commit `package-lock.json`** to ensure reproducible builds

#### Git & GitHub Operations
*   **Use `git` CLI commands** for version control operations
*   **No GitHub CLI (`gh`) detected** - use web UI or standard git commands for PR creation

### Context Management

#### For Large Code Changes
*   **Guideline:** If a task involves modifying more than 10 files or adding/changing more than 500 lines of code, break it into smaller, self-contained chunks
*   **Strategy:**
    1.  Create a detailed implementation plan in a separate markdown file (e.g., `PLAN_feature_name.md`)
    2.  Submit the plan for human review
    3.  Implement the plan incrementally in multiple pull requests
    4.  Each PR should be independently testable and reviewable

#### For Complex Features
*   **Example:** Adding a new trading strategy engine
    1.  PR 1: Create strategy interface and base classes
    2.  PR 2: Implement strategy loader and validator
    3.  PR 3: Add strategy execution logic
    4.  PR 4: Integrate with backtester
    5.  PR 5: Add UI components for strategy management

### Quality Assurance & Verification

#### Self-Verification Checklist
Before marking any task as complete, you MUST verify:

1.  **Code Compiles/Runs:**
    *   Backend: `python -m py_compile services/*.py api/*.py` (no syntax errors)
    *   Frontend: `npm run build` succeeds (TypeScript compilation passes)

2.  **Linting Passes:**
    *   Backend: `flake8 services/ api/` (no errors)
    *   Frontend: `npm run lint` (no errors)

3.  **Type Checking Passes:**
    *   Frontend: `npx tsc --noEmit` (no type errors)

4.  **Tests Pass (once implemented):**
    *   Backend: `pytest tests/`
    *   Frontend: `npm run test:ci`

5.  **No Unintended Changes:**
    *   `git diff` shows only expected modifications
    *   No commented-out code left behind
    *   No debug print statements remaining

6.  **Documentation Updated:**
    *   If adding new API endpoints, update `api/README.md` (if exists)
    *   If adding new services, document in this GEMINI.md file
    *   If changing configuration schema, update `config/main.yaml` comments

#### Verification Scripts
**Run verification scripts after making changes to core services:**
```bash
# Basic verification
python verify_setup.py

# Full verification (includes backtesting)
python verify_full.py
```

**Expected Output:** Both scripts should complete without errors and print success messages.

### Project-Specific Quirks & Antipatterns

#### Known Issues
1.  **No Test Suite:** Project currently lacks automated tests - this is a critical gap. When adding features, you MUST also create tests.

2.  **No CI/CD Pipeline:** No automated checks on pull requests. Until CI is implemented, rely on manual pre-commit checks.

3.  **CORS Configuration Too Permissive:** `api/main.py` has `allow_origins=["*"]` - this is acceptable for development but MUST be restricted in production.

4.  **Hardcoded Localhost:** Frontend `apiService` may have hardcoded `http://localhost:8000` - this should be environment-variable-driven for different deployment targets.

5.  **SQLite Single Connection:** SQLite may have concurrency limitations under high load - consider PostgreSQL for production.

6.  **No Authentication:** API endpoints are completely open - this is a security risk if exposed to public internet.

#### Historical Decisions
*   **Dual UI Strategy:** Both Streamlit (`app.py`) and React (`crypto-frontend/`) exist. Streamlit is for rapid prototyping; React is the production UI. Do not assume features implemented in one exist in the other.

*   **YAML Over JSON:** Configuration uses YAML for readability and comment support. When adding new config options, maintain YAML format and include inline comments explaining each parameter.

*   **Pandas-Centric Design:** All time-series operations use Pandas DataFrames. Do not attempt to replace with NumPy arrays or Python lists - this would break indicator calculations.

### Troubleshooting & Debugging

#### Backend Debugging
If the FastAPI server crashes or behaves unexpectedly:

1.  **Check Error Logs:** FastAPI/Uvicorn prints stack traces to console
2.  **Verify Configuration:** Ensure `config/main.yaml` is valid YAML (use `yamllint config/main.yaml`)
3.  **Test Individual Services:** Use verification scripts to isolate the failing component
4.  **Common Issues:**
    *   `FileNotFoundError: config/main.yaml` → Run from project root directory
    *   `ModuleNotFoundError: No module named 'ccxt'` → Run `pip install -r requirements.txt`
    *   Database locked errors → Close Streamlit app if running simultaneously

#### Frontend Debugging
If React app fails to compile or run:

1.  **Check Console Errors:** Vite prints detailed TypeScript errors during `npm run dev`
2.  **Verify Dependencies:** Ensure `npm install` completed successfully
3.  **Clear Cache:** Delete `crypto-frontend/node_modules/.vite/` and restart dev server
4.  **Common Issues:**
    *   Type errors → Run `npx tsc --noEmit` for detailed type checking
    *   API connection failures → Verify backend is running on `http://localhost:8000`
    *   CORS errors → Check `api/main.py` CORS middleware configuration

#### Data Fetching Issues
If data fetching fails (`verify_setup.py` shows no data):

1.  **Network Connectivity:** Verify internet connection (CCXT requires external API access)
2.  **Exchange API Status:** Check Binance API status (https://www.binance.com/en/support/announcement)
3.  **Rate Limiting:** Binance has rate limits - excessive requests may result in temporary blocks
4.  **API Key Issues:** If using CoinGecko, verify `COINGECKO_API_KEY` environment variable is set

#### Indicator Calculation Errors
If indicators return `NaN` or unexpected values:

1.  **Insufficient Data:** Many indicators require minimum data points (e.g., RSI needs 14+ periods)
2.  **Data Quality:** Verify OHLCV data is complete (no gaps, no zero values)
3.  **Pandas Version:** Ensure Pandas version is compatible (>=1.3.0 recommended)

### Pass/Fail Criteria for AI Agents

**A task is considered COMPLETE only when ALL of the following are TRUE:**

1.  ✅ Code changes are implemented and committed to feature branch
2.  ✅ All linting checks pass (no ESLint or Flake8 errors)
3.  ✅ TypeScript compilation succeeds (frontend only)
4.  ✅ All tests pass (once test suite is implemented)
5.  ✅ Verification scripts run successfully (backend changes)
6.  ✅ Documentation updated to reflect changes
7.  ✅ Pull request created with descriptive title and body
8.  ✅ No unintended side effects (verified via manual testing)
9.  ✅ Worktree is clean (`git status` shows no uncommitted changes)

**DO NOT** mark a task as complete if any of the above criteria are not met. If blocked by missing infrastructure (e.g., no test suite), explicitly note this in your response and recommend next steps.

---

## 10. Quick Reference

### Essential Commands Cheatsheet

#### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Run Streamlit UI
streamlit run app.py

# Verify setup
python verify_setup.py

# Full verification
python verify_full.py

# Format code (recommended)
black .
isort .

# Lint code (recommended)
flake8 services/ api/
```

#### Frontend
```bash
# Install dependencies
cd crypto-frontend && npm install

# Run development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview

# Lint and fix
npm run lint -- --fix

# Type check
npx tsc --noEmit
```

#### Git Workflow
```bash
# Create feature branch
git checkout -b feat/my-feature

# Stage changes
git add .

# Commit with conventional format
git commit -m "feat(scope): description"

# Push branch
git push origin feat/my-feature

# Update from main
git checkout main && git pull
git checkout feat/my-feature && git rebase main
```

### Configuration File Locations
*   Backend Config: `config/main.yaml`
*   Watchlists: `config/watchlists.yaml`
*   Strategies: `config/strategies/*.yaml`
*   Frontend Config: `crypto-frontend/vite.config.ts`
*   ESLint Config: `crypto-frontend/eslint.config.js`
*   TypeScript Config: `crypto-frontend/tsconfig.json`

### API Endpoints Quick Reference
*   `GET /api/v1/watchlists` - List all watchlists
*   `GET /api/v1/symbols` - Get all symbols or filter by watchlist
*   `GET /api/v1/ohlcv/{symbol}/{timeframe}` - Fetch OHLCV data
*   `GET /api/v1/indicators/{symbol}/{timeframe}` - Calculate indicators
*   `POST /api/v1/backtest` - Run backtest simulation
*   `GET /api/v1/multi-timeframe/{symbol}` - Multi-timeframe analysis

---

## 11. Future Enhancements & Roadmap

This section outlines recommended improvements that are not yet implemented but would significantly enhance the project:

### High Priority
1.  **Automated Testing:**
    *   Backend: Pytest suite with pytest-asyncio, pytest-cov
    *   Frontend: Vitest with Testing Library
    *   Target: 70-80% code coverage

2.  **CI/CD Pipeline:**
    *   GitHub Actions workflow for automated testing, linting, and building
    *   Deployment automation to staging/production environments

3.  **Authentication & Authorization:**
    *   JWT-based authentication for API endpoints
    *   User management system
    *   Rate limiting per user/API key

4.  **Production Database:**
    *   Migrate from SQLite to PostgreSQL for scalability
    *   Connection pooling for concurrent requests
    *   Database migration system (Alembic)

### Medium Priority
5.  **Backend Linting Setup:**
    *   Configure Black, isort, flake8, mypy with `pyproject.toml`
    *   Pre-commit hooks to enforce code quality

6.  **Enhanced Error Handling:**
    *   Structured logging with contextual information
    *   Centralized error handling middleware
    *   User-friendly error messages in API responses

7.  **Real-Time Data Streaming:**
    *   WebSocket support for live price updates
    *   Server-Sent Events (SSE) for backtesting progress

8.  **Advanced Charting:**
    *   Interactive chart annotations (buy/sell signals)
    *   Multi-chart layouts (price + indicator panels)
    *   Chart export functionality (PNG, PDF)

### Low Priority
9.  **Mobile Responsiveness:**
    *   Optimize React UI for mobile devices
    *   Progressive Web App (PWA) support

10. **Strategy Optimization:**
    *   Parameter optimization using grid search or genetic algorithms
    *   Walk-forward analysis for strategy validation
    *   Monte Carlo simulation for risk assessment

11. **Alerting System:**
    *   Price alerts (threshold-based)
    *   Indicator-based alerts (RSI overbought/oversold)
    *   Multi-channel notifications (email, Discord, Telegram)

---

## Appendix A: Technology Stack Justification

### Backend Choices

**Python:** Selected for its rich ecosystem of data analysis libraries (Pandas, NumPy) and financial/trading libraries (CCXT, TA-Lib alternatives). Python's simplicity allows rapid prototyping and strategy development.

**FastAPI:** Modern async framework with automatic OpenAPI documentation, Pydantic validation, and excellent performance. Chosen over Flask/Django for async support and developer experience.

**SQLite:** Lightweight embedded database suitable for development and small-scale deployments. Zero configuration required. For production, migration to PostgreSQL is recommended.

**CCXT:** Unified API for 100+ cryptocurrency exchanges. Abstracts exchange-specific differences, enabling easy switching between exchanges.

**Pandas:** Industry-standard library for time-series data manipulation. Essential for financial data analysis and indicator calculations.

### Frontend Choices

**React 19:** Latest React version with concurrent features, improved performance, and modern server component architecture. Future-proof choice.

**TypeScript:** Provides type safety, better IDE support, and catches errors at compile-time. Essential for large codebases and team collaboration.

**Vite:** Next-generation build tool with instant HMR, native ES modules, and optimized production builds. Significantly faster than Webpack.

**Zustand:** Minimal boilerplate state management with excellent TypeScript support. Lighter alternative to Redux for client state.

**TanStack Query:** De facto standard for server state management. Provides caching, automatic refetching, and optimistic updates out-of-the-box.

**Tailwind CSS:** Utility-first CSS framework enabling rapid UI development with consistent design system. No context switching between HTML and CSS files.

**Lightweight Charts:** TradingView's open-source charting library. Performant, professional-grade financial charts with minimal bundle size.

---

## Appendix B: Glossary of Domain Terms

*   **OHLCV:** Open, High, Low, Close, Volume - standard candlestick data format for financial markets
*   **RSI:** Relative Strength Index - momentum oscillator measuring speed and magnitude of price changes
*   **MACD:** Moving Average Convergence Divergence - trend-following momentum indicator
*   **Bollinger Bands:** Volatility bands plotted above and below a moving average
*   **ATR:** Average True Range - volatility indicator
*   **Ichimoku Cloud:** Comprehensive indicator showing support/resistance, momentum, and trend direction
*   **Backtest:** Simulation of a trading strategy using historical data to evaluate performance
*   **Timeframe:** Time interval for candlestick aggregation (e.g., 1h = 1-hour candles)
*   **Watchlist:** Curated list of cryptocurrency symbols for monitoring
*   **Confluence:** Agreement between multiple technical indicators or timeframes
*   **PnL:** Profit and Loss - financial result of a trade or strategy
*   **Position Sizing:** Determining how much capital to allocate to each trade

---

**End of Document**

*This GEMINI.md file is a living document. As the project evolves, update this file to reflect architectural changes, new conventions, and lessons learned. Treat this as the authoritative source of truth for AI agent collaboration guidelines.*

**Document Version:** 1.0  
**Last Updated:** November 25, 2025  
**Maintainer:** Project Lead / Senior Architect
