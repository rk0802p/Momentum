// -------------------------------------------------------------
// MOMENTUM Timezone & Calendar Boundary Engine
// Section 5.1 & 5.7 of Technical Specification
// -------------------------------------------------------------

/**
 * Gets parts of a date in a specific IANA timezone using Intl.DateTimeFormat.
 */
export function getTimezoneParts(date: Date, timezone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23'
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== 'literal') {
      map[p.type] = parseInt(p.value, 10);
    }
  }

  return {
    year: map.year ?? 1970,
    month: map.month ?? 1,
    day: map.day ?? 1,
    hour: map.hour ?? 0,
    minute: map.minute ?? 0,
    second: map.second ?? 0
  };
}

/**
 * Formats an instant or date into local ISO string (YYYY-MM-DDTHH:mm:ss) in the target timezone.
 */
export function formatLocalIso(date: Date | number, timezone: string): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const p = getTimezoneParts(d, timezone);
  const yr = String(p.year).padStart(4, '0');
  const mo = String(p.month).padStart(2, '0');
  const da = String(p.day).padStart(2, '0');
  const ho = String(p.hour).padStart(2, '0');
  const mi = String(p.minute).padStart(2, '0');
  const se = String(p.second).padStart(2, '0');
  return `${yr}-${mo}-${da}T${ho}:${mi}:${se}`;
}

/**
 * Given a local date (YYYY-MM-DD) and a timezone, returns the UTC instant
 * corresponding to local midnight (start of day) and the start of the following day.
 * Respects DST transitions (e.g., 23-hour or 25-hour days).
 */
export function getDayBoundaries(dateStr: string, timezone: string): {
  startInstant: number;
  endInstant: number;
  durationMinutes: number;
} {
  // Approximate UTC start around dateStr
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Search for the exact instant where local time transitions to this date
  const startInstant = findInstantForLocalTime(year, month, day, 0, 0, 0, timezone);

  // Compute next day
  const nextDayDate = new Date(Date.UTC(year, month - 1, day + 1));
  const nextYear = nextDayDate.getUTCFullYear();
  const nextMonth = nextDayDate.getUTCMonth() + 1;
  const nextDay = nextDayDate.getUTCDate();

  const endInstant = findInstantForLocalTime(nextYear, nextMonth, nextDay, 0, 0, 0, timezone);
  const durationMinutes = Math.round((endInstant - startInstant) / (1000 * 60));

  return {
    startInstant,
    endInstant,
    durationMinutes
  };
}

/**
 * Binary search / iterative solver to find UTC instant matching local year, month, day, hour, minute, second
 * in the requested timezone. Handles standard offsets, daylight saving time, and half-hour/quarter-hour zones.
 */
export function findInstantForLocalTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timezone: string
): number {
  // Guess initial UTC timestamp assuming UTC+0
  let guess = Date.UTC(year, month - 1, day, hour, minute, second);

  // Iteratively adjust using timezone offset difference
  for (let i = 0; i < 5; i++) {
    const parts = getTimezoneParts(new Date(guess), timezone);
    const targetUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    const gotUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const diff = targetUtc - gotUtc;
    if (diff === 0) {
      return guess;
    }
    guess += diff;
  }
  return guess;
}
