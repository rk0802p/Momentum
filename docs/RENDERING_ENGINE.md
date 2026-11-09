# MOMENTUM — Rendering Architecture & Spatial Engine

MOMENTUM employs a multi-tiered rendering pipeline tailored to precision, scale, and immersion.

---

## 1. Multi-Tiered Rendering Strategy

| Technology | Purpose | Key Responsibilities |
|:---|:---|:---|
| **SVG** | Geometric Precision | 24-hour radial timeline, event donut arcs, hour/minute tick marks, current time beacon, direct drag previews |
| **Canvas** | High-Density Scale & Generative Art | Generative activity artwork engine (Harmonics, Orbitals, Crystallography), particle fields |
| **Three.js WebGL**| Depth & Spatial Continuity | FLOW 7-day spatial landscape, floating event pillars, laser beacons, camera perspectives, raycasting |

---

## 2. Radial 2D Coordinate Transformation
The radial calendar converts 24-hour time to radians:
$$\theta = 2\pi\frac{t}{24} - \frac{\pi}{2}$$
Where $t = h + \frac{m}{60} + \frac{s}{3600}$.
Midnight aligns with top of the dial ($-\frac{\pi}{2}$).

Donut arcs are computed via `describeArc(cx, cy, innerRadius, outerRadius, startAngle, endAngle)` generating clean SVG `<path>` data with exact large-arc flags and outer/inner edge segments.

---

## 3. FLOW 3D Coordinate Mapping
The spatial landscape uses deterministic mathematical projection:
$$\begin{aligned}
x(d) &= d \cdot S_d \\
y(t) &= \left(\frac{t}{24} - 0.5\right) \cdot S_t \\
z(\text{layer}) &= \text{layer} \cdot 1.5
\end{aligned}$$

Where:
- $d$: Day offset relative to the focused date ($-3$ to $+3$).
- $t$: Fractional hour of day ($0.0$ to $24.0$).
- $S_d = 14.0$: Horizontal day spacing.
- $S_t = 26.0$: Vertical temporal scale.

---

## 4. Performance Optimizations
- **Geometry Instancing & Shared Materials**: Standardized box geometries and materials shared across identical category nodes.
- **Raycasting**: Mouse coordinates mapped to normalized device coordinates (NDC) for sub-millisecond picking of 3D events.
- **Clean Lifecycle & Resource Disposal**: Explicit `.dispose()` calls on geometries, materials, and textures when unmounting scenes.
- **Graceful Degradation**: Built-in 2D accessible fallback screen if WebGL context creation fails.
