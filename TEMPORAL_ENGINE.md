# MOMENTUM — Temporal Engine (`@momentum/temporal-engine`)

The temporal domain engine is the pure computational core of MOMENTUM. It converts real-world time into normalized intervals, spatial coordinates, collision groups, and historical states without depending on React, SVG, Canvas, or Three.js.

---

## 1. Half-Open Interval Representation
Every temporal interval is represented as a half-open set:
$$[start, end)$$

- **Start instant**: Included.
- **End instant**: Excluded.
- **Adjacency**: Two intervals meeting at their boundary (e.g., `09:00–10:00` and `10:00–11:00`) do **not** collide.

---

## 2. Radial Coordinate Conversion
The 24-hour radial calendar maps local time to radians with midnight ($00:00$) aligned to the top of the circle ($-\frac{\pi}{2}$):

$$t = h + \frac{m}{60} + \frac{s}{3600}$$
$$\theta = 2\pi\frac{t}{24} - \frac{\pi}{2}$$

For center $(c_x, c_y)$ and radius $r$:
$$x = c_x + r \cos(\theta)$$
$$y = c_y + r \sin(\theta)$$

### Angle Invariants
| Local Time | Radian Value | Visual Location | Test Verification |
|:---|:---|:---|:---|
| `00:00` (Midnight) | $-\frac{\pi}{2}$ | Top | **TE-01** |
| `12:00` (Noon) | $\frac{\pi}{2}$ | Bottom | **TE-02** |
| `06:00` | $0$ | Right | **TE-03** |
| `18:00` | $\pi$ | Left | **TE-04** |

---

## 3. Pointer-to-Time Snapping
When dragging an event or resizing an arc edge:
$$\theta = \operatorname{atan2}(y - c_y, x - c_x)$$
$$\theta_n = (\theta + \frac{\pi}{2} + 2\pi) \pmod{2\pi}$$
$$\text{rawMinutes} = \frac{\theta_n}{2\pi} \times 1440$$
$$\text{snappedMinutes} = \operatorname{round}\left(\frac{\text{rawMinutes}}{\text{snap}}\right) \times \text{snap} \pmod{1440}$$

---

## 4. Collision Detection (Sweep-Line Algorithm)
Instead of $O(n^2)$ pair comparisons, the engine uses a sweep-line algorithm with $O(n \log n + k)$ complexity:
1. Deconstructs intervals into start and end boundary points.
2. Sorts points by timestamp. For equal timestamps, `end` points are processed before `start` points to enforce half-open interval semantics.
3. Maintains an active set of concurrent events and reports intersecting pairs.
4. Uses union-find to group intersecting events into visual collision clusters.

---

## 5. Automated Acceptance Test Suite (Vitest)
All 15 domain tests specified in Section 13.1 are verified:

- **TE-01**: Convert midnight to angle $\to$ Top of circle ($-\frac{\pi}{2}$).
- **TE-02**: Convert noon to angle $\to$ Bottom of circle ($\frac{\pi}{2}$).
- **TE-03**: Convert 06:00 to angle $\to$ Right side ($0$).
- **TE-04**: Convert 18:00 to angle $\to$ Left side ($\pi$).
- **TE-05**: Event duration $\to$ Correct elapsed minutes.
- **TE-06**: Adjacent intervals $\to$ No collision reported.
- **TE-07**: Partially overlapping intervals $\to$ Collision detected with exact overlap duration.
- **TE-08**: Nested intervals $\to$ Correct overlap duration.
- **TE-09**: Cross-midnight events $\to$ Correctly split at local midnight boundary.
- **TE-10**: Event ending at midnight $\to$ No extra zero-duration segment generated.
- **TE-11**: 5-minute / 15-minute snapping $\to$ Correct rounded value.
- **TE-12**: Daylight saving time (DST) transition $\to$ Correct elapsed duration (23h spring forward, 25h fall back).
- **TE-13**: Leap-year recurrence $\to$ Correct occurrence on Feb 29.
- **TE-14**: Month-end recurrence $\to$ Correct clamp policy (Jan 31 $\to$ Feb 28/29 $\to$ Mar 31).
- **TE-15**: Multi-timezone consistency $\to$ Deterministic local time representation.
