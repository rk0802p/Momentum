# MOMENTUM — System Architecture

## 1. Monorepo Structure

```
momentum/
├── apps/
│   ├── web/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   └── api/                     # Node.js + Express + Prisma backend
├── packages/
│   ├── temporal-engine/         # Pure TS engine for intervals, radial coordinates, sweep-line collisions
│   ├── spatial-engine/          # Deterministic 3D mapping engine for FLOW
│   ├── shared-types/            # Canonical domain models (User, Event, Category, Interval)
│   ├── validation/              # Runtime Zod validation schemas
│   ├── api-client/              # Standardized API client with x-request-id support
│   └── design-tokens/           # Color palette, typographic scale, motion curves
├── prisma/
│   └── schema.prisma            # PostgreSQL schema with audit-ready append-only revisions
├── pnpm-workspace.yaml          # Monorepo package declaration
└── package.json                 # Monorepo root scripts
```

## 2. Core Architectural Invariant
> **"Every renderer consumes the same normalized temporal data."**
> Never independently calculate event positions, durations, or overlaps in the radial and 3D components.

## 3. Visual System Tokens
- **Background**: `#0B0C0F` (Cinematic darkness)
- **Surface**: `#121419` (Panels)
- **Surface Raised**: `#1A1D23` (Controls)
- **Dividers**: `#292D35` (Subtle boundary lines)
- **Accent**: `#D6A66D` (Active time / amber-gold luminous)
- **Completed**: `#729D89` (Soft sage green)
- **Future**: `#829AB9` (Steel blue)
- **Warning**: `#D88B75` (Terracotta conflict highlight)
- **Neutral**: `#777E8B` (Unallocated time)
