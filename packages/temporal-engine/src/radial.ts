// -------------------------------------------------------------
// MOMENTUM Radial Coordinate Engine
// Section 5.3 & 5.4 of Technical Specification
// -------------------------------------------------------------

/**
 * Converts a 24-hour time to an angle in radians.
 * Aligns midnight (00:00) with the top of the circle (-π/2).
 * Noon (12:00) is at bottom (π/2).
 * 06:00 is at right (0).
 * 18:00 is at left (π or -π).
 */
export function timeToAngle(hour: number, minute = 0, second = 0): number {
  const totalHours = hour + minute / 60 + second / 3600;
  return (totalHours / 24) * Math.PI * 2 - Math.PI / 2;
}

/**
 * Converts polar coordinates (radius, angle) to 2D Cartesian (x, y) relative to center.
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

/**
 * Converts pointer coordinates relative to center (cx, cy) into snapped minutes of the day (0..1439).
 * Snaps to interval (default 5 min).
 */
export function pointerToMinutes(
  x: number,
  y: number,
  cx: number,
  cy: number,
  snapMinutes = 5
): number {
  const angle = Math.atan2(y - cy, x - cx);
  // Normalize angle so that top (-π/2) corresponds to 0, increasing clockwise
  const normalized = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const rawMinutes = (normalized / (Math.PI * 2)) * 1440;
  
  if (snapMinutes <= 1) {
    return Math.floor(rawMinutes) % 1440;
  }
  const snapped = Math.round(rawMinutes / snapMinutes) * snapMinutes;
  return (snapped % 1440 + 1440) % 1440;
}

/**
 * Helper to turn total minutes from midnight into { hour, minute }.
 */
export function minutesToTime(totalMinutes: number): { hour: number; minute: number } {
  const normalized = (Math.floor(totalMinutes) % 1440 + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return { hour, minute };
}

/**
 * Format minutes as HH:mm 24-hour string.
 */
export function formatMinutes(totalMinutes: number): string {
  const { hour, minute } = minutesToTime(totalMinutes);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Generates an SVG path data string for a donut arc segment between startAngle and endAngle.
 * Angle in radians. Correctly handles large arc flags and seamless rendering.
 */
export function describeArc(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  // Normalize delta angle
  let diff = endAngle - startAngle;
  while (diff < 0) diff += Math.PI * 2;
  
  // Guard against full 360 loop SVG arc bug (SVG arc command cannot do full 360 circle in one arc)
  if (diff >= Math.PI * 2 - 1e-5) {
    diff = Math.PI * 2 - 1e-4;
  }
  const adjustedEnd = startAngle + diff;
  const largeArcFlag = diff > Math.PI ? 1 : 0;

  const p1 = polarToCartesian(cx, cy, outerRadius, startAngle);
  const p2 = polarToCartesian(cx, cy, outerRadius, adjustedEnd);
  const p3 = polarToCartesian(cx, cy, innerRadius, adjustedEnd);
  const p4 = polarToCartesian(cx, cy, innerRadius, startAngle);

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
    'Z'
  ].join(' ');
}
