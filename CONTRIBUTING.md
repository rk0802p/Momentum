# Contributing to MOMENTUM

Thank you for contributing to MOMENTUM. Please follow these guidelines to preserve architectural integrity.

---

## 1. Golden Architectural Invariants
1. **Single Source of Truth**: All renderers (Radial SVG, 3D FLOW, Linear, MEMORY) **must** consume normalized temporal data from `@momentum/temporal-engine`. Never independently compute positions, angles, or durations inside rendering components.
2. **Temporal Honesty**: Never manufacture actual activity records from planned events.
3. **Deterministic Revisions**: Event revisions are strictly append-only. Never overwrite historical records.

---

## 2. Commit Conventions
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features or capabilities.
- `fix:` Bug fixes or temporal edge case resolutions.
- `test:` Adding or updating automated tests.
- `docs:` Documentation improvements.
- `refactor:` Code improvements with no semantic change.

---

## 3. Development Workflow
1. Fork or branch from `master` (`feature/<feature-name>`).
2. Run test suites locally before submitting: `pnpm test`.
3. Verify that production builds succeed without errors: `pnpm build`.
4. Open a pull request against `master`.
