# MOMENTUM — Interaction Design Specification

MOMENTUM is designed around physical coherence, direct manipulation, and predictable spatial semantics.

---

## 1. Radial Direct Manipulation State Machine
Event movement around the 24-hour radial calendar uses HTML5 Pointer Events (`setPointerCapture`) and a discrete state machine:

```
[IDLE]
  │
  ├─► pointerdown on arc
  │      │
  │      ▼
  │   [DRAG_START] (Threshold check)
  │      │
  │      ▼
  │   [DRAGGING] (Calculate angle via atan2, convert to minutes, snap to 5/15/30m)
  │      │
  │      ▼
  │   [PREVIEW_UPDATE] (Render ghost arc + real-time collision detection)
  │      │
  │      ▼
  │   pointerup
  │      │
  │      ▼
  │   [COMMITTING] (Update Zustand store, record undo action, append revision)
  │      │
  │      ▼
  └─► [IDLE]
```

---

## 2. Event Resizing
- Each selected event arc displays two resize handles: **Start Edge** and **End Edge**.
- Dragging adjusts start or end time respectively while keeping the opposite anchor fixed.
- Enforces a minimum duration constraint of 15 minutes.
- Handles midnight boundaries seamlessly without circular inversion bugs.

---

## 3. Global Keyboard Map
| Key | Function |
|:---|:---|
| `1` – `6` | Switch environments (**NOW**, **FLOW**, **MEMORY**, **PATTERNS**, **ORBIT**, **FOCUS**) |
| `Ctrl + K` / `Cmd + K` | Global Command Palette |
| `N` | Open Event Creation Modal |
| `Home` | Return to Today |
| `Left / Right Arrow` | Navigate to Previous / Next Day |
| `Ctrl + Z` | Undo direct manipulation action |
| `Ctrl + Y` | Redo action |
| `Escape` | Dismiss modal, palette, or inspector |
