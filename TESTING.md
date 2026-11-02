# MOMENTUM — Testing Guide & Verification Suite

MOMENTUM adheres to automated domain and integration testing across all temporal invariants and API contracts.

---

## 1. Running Automated Tests

```bash
# Run all tests across the monorepo
pnpm test

# Run temporal domain tests specifically
pnpm test:temporal

# Run API & Auth integration tests
pnpm --filter @momentum/api test
```

---

## 2. Test Coverage Matrix

### Temporal Engine Acceptance (`packages/temporal-engine/tests/temporal.test.ts`)
- **TE-01**: Midnight converts to $-\frac{\pi}{2}$ (top of dial).
- **TE-02**: Noon converts to $\frac{\pi}{2}$ (bottom of dial).
- **TE-03**: 06:00 converts to $0$ (right of dial).
- **TE-04**: 18:00 converts to $\pi$ (left of dial).
- **TE-05**: Correct elapsed duration computation for temporal intervals.
- **TE-06**: Adjacent intervals $[A.start, A.end)$ and $[A.end, B.end)$ report zero collisions.
- **TE-07**: Overlapping intervals report collisions with exact overlap durations.
- **TE-08**: Nested intervals calculate overlap without errors.
- **TE-09**: Cross-midnight events split cleanly into local daily segments.
- **TE-10**: Events ending precisely at midnight produce no zero-duration trailing segments.
- **TE-11**: Snapping to 5/15-minute grids calculates accurate rounded values.
- **TE-12**: Daylight saving transitions accurately report 23-hour and 25-hour days.
- **TE-13**: Leap-year recurrence on Feb 29 handles leap and non-leap years.
- **TE-14**: Month-end recurrence applies correct clamp policies (Jan 31 $\to$ Feb 28).
- **TE-15**: Multi-timezone consistency resolves local representation without browser bias.

### Extended Domain Acceptance (`packages/temporal-engine/tests/acceptance_extended.test.ts`)
- **MM-01 & MM-02**: Append-only revision sequence reconstruction.
- **MM-07**: Missing actual execution records remain missing (temporal honesty).
- **PA-01 & PA-05**: Category distribution calculation with overlap exclusion.
- **OR-01 & OR-05**: Isolated scenario simulation and transactional migration.

### Backend API & Security (`apps/api/tests/api.test.ts`)
- Service health check with `x-request-id` header inspection.
- User registration, duplicate email rejection (409).
- Credential verification, invalid login rejection (401).
- Preference persistence.
- Scoped event queries, event creation validation.
- Scenario application.
