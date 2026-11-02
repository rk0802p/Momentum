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
