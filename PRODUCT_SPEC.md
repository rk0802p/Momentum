# MOMENTUM — Complete Product Specification
Version 1.0 · November 2026

## 0. Executive Overview
MOMENTUM is an experimental spatial calendar and personal time visualization system that transforms the conventional tabular calendar into a navigable visual environment. Time is represented through geometry, spatial relationships, movement, and visual traces.

### The Five Core Principles
1. **Spatial over tabular**: Represent time through physical and geometric relationships rather than traditional rows, columns, and grids.
2. **Direct manipulation**: Users interact with events as objects—dragging along circles, resizing boundary intervals, and inspecting collisions directly.
3. **Continuity**: Moving between time scales (from the 24-hour radial day to the 7-day 3D landscape) preserves spatial and temporal context.
4. **Temporal honesty**: Planned activities and actual executions remain strictly distinct. Missing activity records are never fabricated.
5. **Visual meaning**: Every visual effect (bloom, beacons, weather, particles) communicates semantic state.

---

## 1. Six Core Environments
- **NOW**: Explore, schedule, and manipulate the current day via high-precision 24-hour radial dial or accessible linear timeline.
- **FLOW**: 3D spatial temporal landscape of connected weekly regions with floating event pillars and camera navigation.
- **MEMORY**: Deterministic historical reconstruction with append-only revision scrubber ($1\times$–$10\times$) and planned vs. actual comparison traces.
- **PATTERNS**: Behavioral intelligence displaying category distribution (strictly without double-counting overlaps) and $24 \times 7$ weekly commitment density heatmap.
- **ORBIT**: Alternate timeline simulator (Baseline vs. Scenario Alpha vs. Beta) with differential comparison and atomic migration, plus project Goals & Milestones.
- **FOCUS**: Timestamp-derived stopwatch execution mode without tab-suspension drift, recording discrete interval segments.

---

## 2. Temporal Invariants
- Every scheduled event is a half-open interval: $[start, end)$.
- Start instant is inclusive; end instant is exclusive.
- Adjacent intervals (e.g., `09:00–10:00` and `10:00–11:00`) do not overlap.
- Midnight ($00:00$) maps to $-\frac{\pi}{2}$ (top of circle).
- Noon ($12:00$) maps to $\frac{\pi}{2}$ (bottom of circle).
- Sweepline algorithm reports collisions in $O(n \log n + k)$ time.
- All stored timestamps are timezone-aware UTC instants paired with the user's IANA timezone.
