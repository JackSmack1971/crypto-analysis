# ARCHITECTURE.md: Frontend Test Infrastructure Setup

## 1. Analysis
The frontend currently lacks an automated testing framework. To ensure UI reliability and enable future CI/CD integration, we need to establish a robust testing foundation using `Vitest` and `React Testing Library`.

**Requirements:**
- **Framework:** `Vitest` (Fast, Vite-native)
- **Environment:** `jsdom` (Browser simulation)
- **Utilities:** `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- **Integration:** Must work with existing `vite.config.ts` and path aliases (`@/`).

**Constraints:**
- Configuration should be in `vitest.config.ts` (or extend `vite.config.ts`).
- Setup file required for global test environment configuration (e.g., `jest-dom` matchers).

## 2. Structure & File Plan

### Modified Files
- `crypto-frontend/package.json`: Add test dependencies and `test` script.

### New Files
- `crypto-frontend/vitest.config.ts`: Configuration for Vitest.
- `crypto-frontend/src/test/setup.ts`: Global test setup (imports `jest-dom`).
- `crypto-frontend/src/App.test.tsx`: Smoke test for the App component.

### Directory Layout
```
/crypto-analysis/crypto-frontend
├── package.json        # [MOD] Add dependencies
├── vitest.config.ts    # [NEW] Config
└── src/
    ├── test/
    │   └── setup.ts    # [NEW] Global setup
    └── App.test.tsx    # [NEW] Smoke test
```

## 3. Data Flow (Test Execution)
1.  **Discovery:** `npm test` -> `vitest` reads config -> scans `src/**/*.test.tsx`.
2.  **Setup:** `src/test/setup.ts` initializes `jsdom` environment and matchers.
3.  **Execution:** `render(<App />)` mounts component in virtual DOM.
4.  **Assertion:** Check for element presence (e.g., "Crypto Analysis Platform").

## 4. Verification Strategy
1.  **Dependency Install:** `npm install` (simulated via `package.json` update) -> Expect success.
2.  **Execution:** `npm test -- --run` -> Expect 1 passed test (exit code 0).
