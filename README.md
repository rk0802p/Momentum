# MOMENTUM

> *"Time is not a list. It's a space you move through."*
> Spatial calendar & personal time visualization system.

---

## Overview

MOMENTUM is an experimental spatial calendar and personal time visualization system that transforms the conventional calendar into a navigable visual environment. It combines two complementary rendering experiences operating on a unified temporal data engine:

- **Radial 2D**: A precise, interactive 24-hour circular canvas for daily scheduling, direct pointer manipulation, and conflict detection.
- **Navigable Spatial Environments**: Six core perspectives (**NOW**, **FLOW**, **MEMORY**, **PATTERNS**, **ORBIT**, **FOCUS**).

---

## Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Installation
```bash
# Install all workspace dependencies
pnpm install
```

### Running Tests
```bash
# Run Vitest test suite covering TE-01 to TE-15
pnpm test:temporal
```

### Development
```bash
# Start Web UI (Vite dev server)
pnpm dev

# Start Backend API
pnpm dev:api
```

---

## Keyboard Shortcuts
- `1` – `6`: Switch environments (NOW, FLOW, MEMORY, PATTERNS, ORBIT, FOCUS)
- `Ctrl + K` / `Cmd + K`: Command Palette
- `N`: Create new commitment
- `Home`: Return to Today
- `Ctrl + Z`: Undo last action
- `Ctrl + Y`: Redo action

---

## Documentation

Comprehensive product and technical documentation is available in the [`docs/`](file:///d:/New%20folder%20(2)/Momentum/docs) directory:

- [Product Specification](file:///d:/New%20folder%20(2)/Momentum/docs/PRODUCT_SPEC.md) — Complete vision, 5 core principles, and feature specs
- [System Architecture](file:///d:/New%20folder%20(2)/Momentum/docs/ARCHITECTURE.md) — Monorepo layers, state flow, and data pipelines
- [Temporal Domain Engine](file:///d:/New%20folder%20(2)/Momentum/docs/TEMPORAL_ENGINE.md) — Half-open interval math and sweep-line collision algorithms
- [Rendering Engine](file:///d:/New%20folder%20(2)/Momentum/docs/RENDERING_ENGINE.md) — SVG radial dials, Three.js 3D weekly landscape, and generative artwork
- [API Reference](file:///d:/New%20folder%20(2)/Momentum/docs/API_REFERENCE.md) — REST endpoints, authentication, and error envelopes
- [Database Schema](file:///d:/New%20folder%20(2)/Momentum/docs/DATABASE_SCHEMA.md) — PostgreSQL Prisma entities and relationships
- [Interaction Design](file:///d:/New%20folder%20(2)/Momentum/docs/INTERACTION_DESIGN.md) — Direct pointer dragging, polar snapping, and motion curves
- [Testing Guide](file:///d:/New%20folder%20(2)/Momentum/docs/TESTING.md) — Test suites, invariants TE-01 through TE-15, and coverage
- [Contributing Guidelines](file:///d:/New%20folder%20(2)/Momentum/docs/CONTRIBUTING.md) — Architectural invariants and pull request workflow

---

## Deploy to Vercel

MOMENTUM is pre-configured for zero-friction Vercel deployment with progressive chunk splitting, SPA rewrite rules, and serverless API integration.

### Method 1: Vercel Git Integration (Recommended)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), select **Add New Project** and import the repository.
3. The root [`vercel.json`](file:///d:/New%20folder%20(2)/Momentum/vercel.json) automatically configures the project:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `apps/web/dist`
4. Click **Deploy**. Both the Web App and Serverless API are immediately live with zero configuration.

### Method 2: Vercel CLI
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy directly from repository root
vercel
```
