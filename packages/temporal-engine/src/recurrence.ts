// -------------------------------------------------------------
// MOMENTUM Recurrence Engine
// Section 5.6 & Acceptance Tests TE-13, TE-14
// -------------------------------------------------------------

import type { CalendarEvent, TemporalInterval } from '@momentum/shared-types';
import { findInstantForLocalTime, getTimezoneParts } from './timezone';

export interface RecurrenceOptions {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number; // e.g. every 2 weeks
  count?: number;
  until?: string; // ISO timestamp
  byWeekday?: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  monthDayPolicy?: 'clamp' | 'skip'; // For month-end handling (TE-14)
  leapYearPolicy?: 'clamp' | 'skip'; // For Feb 29 handling (TE-13)
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Parses simple RRULE strings or options.
 * e.g. "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR"
 */
export function parseRrule(rruleStr: string): RecurrenceOptions {
  const parts = rruleStr.split(';');
  const options: RecurrenceOptions = {
    frequency: 'DAILY',
    interval: 1,
    monthDayPolicy: 'clamp',
    leapYearPolicy: 'clamp'
  };

  const dayMap: Record<string, number> = {
    SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
  };

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (!key || !value) continue;
    switch (key.toUpperCase()) {
      case 'FREQ':
        options.frequency = value.toUpperCase() as RecurrenceOptions['frequency'];
        break;
      case 'INTERVAL':
        options.interval = parseInt(value, 10);
        break;
      case 'COUNT':
        options.count = parseInt(value, 10);
        break;
      case 'UNTIL':
        options.until = value;
        break;
      case 'BYDAY':
        options.byWeekday = value.split(',').map(d => dayMap[d.trim().toUpperCase()]).filter(d => d !== undefined);
        break;
      case 'MONTHDAYPOLICY':
        options.monthDayPolicy = value.toLowerCase() as 'clamp' | 'skip';
        break;
      case 'LEAPYEARPOLICY':
        options.leapYearPolicy = value.toLowerCase() as 'clamp' | 'skip';
        break;
    }
  }

  return options;
}

/**
 * Expands recurring event instances across a requested target interval.
 */
export function expandRecurrence(
  baseEvent: CalendarEvent,
  rule: RecurrenceOptions,
  range: TemporalInterval
): CalendarEvent[] {
  const rangeStart = Date.parse(range.start);
  const rangeEnd = Date.parse(range.end);
  const baseStart = Date.parse(baseEvent.startAt);
  const baseEnd = Date.parse(baseEvent.endAt);
  const durationMs = baseEnd - baseStart;
  const timezone = baseEvent.timezone;

  const baseParts = getTimezoneParts(new Date(baseStart), timezone);
  const targetDayOfMonth = baseParts.day;
  const targetMonth = baseParts.month;

  const instances: CalendarEvent[] = [];
  let generatedCount = 0;
  const intervalStep = rule.interval ?? 1;

  // Track current pointer starting at baseEvent start
  let curYear = baseParts.year;
  let curMonth = baseParts.month;
  let curDay = baseParts.day;

  // Hard safety limit to avoid infinite loops
  const MAX_ITERATIONS = 2000;
  let iterations = 0;

  while (iterations++ < MAX_ITERATIONS) {
    if (rule.count !== undefined && generatedCount >= rule.count) break;

    // Determine actual day to use considering month-end / leap year policy
    let effectiveDay = curDay;
    let shouldSkip = false;

    if (rule.frequency === 'MONTHLY') {
      const maxDays = daysInMonth(curYear, curMonth);
      if (targetDayOfMonth > maxDays) {
        if (rule.monthDayPolicy === 'skip') {
          shouldSkip = true;
        } else {
          // 'clamp' policy: use last day of month (e.g. Feb 28 on non-leap, Feb 29 on leap, Apr 30)
          effectiveDay = maxDays;
        }
      } else {
        effectiveDay = targetDayOfMonth;
      }
    } else if (rule.frequency === 'YEARLY') {
      if (targetMonth === 2 && targetDayOfMonth === 29 && !isLeapYear(curYear)) {
        if (rule.leapYearPolicy === 'skip') {
          shouldSkip = true;
        } else {
          effectiveDay = 28; // clamped to Feb 28
        }
      } else {
        effectiveDay = targetDayOfMonth;
      }
    }

    if (!shouldSkip) {
      const instStart = findInstantForLocalTime(
        curYear,
        curMonth,
        effectiveDay,
        baseParts.hour,
        baseParts.minute,
        baseParts.second,
        timezone
      );
      const instEnd = instStart + durationMs;

      if (rule.until && instStart > Date.parse(rule.until)) {
        break;
      }

      // Check weekday filtering if specified
      const currentDow = new Date(instStart).getUTCDay();
      const weekdayMatches = !rule.byWeekday || rule.byWeekday.includes(currentDow);

      if (weekdayMatches && instStart >= baseStart) {
        generatedCount++;
        // If within range
        if (instStart < rangeEnd && instEnd > rangeStart) {
          instances.push({
            ...baseEvent,
            id: `${baseEvent.id}_rec_${instStart}`,
            recurrenceId: baseEvent.id,
            startAt: new Date(instStart).toISOString(),
            endAt: new Date(instEnd).toISOString(),
            status: baseEvent.status
          });
        }
      }

      // If we passed beyond rangeEnd and generated at least one after range, we can stop for monotonic freqs
      if (instStart > rangeEnd && (!rule.byWeekday || rule.byWeekday.length <= 1)) {
        break;
      }
    }

    // Advance to next period
    if (rule.frequency === 'DAILY') {
      const d = new Date(Date.UTC(curYear, curMonth - 1, curDay + intervalStep));
      curYear = d.getUTCFullYear();
      curMonth = d.getUTCMonth() + 1;
      curDay = d.getUTCDate();
    } else if (rule.frequency === 'WEEKLY') {
      const d = new Date(Date.UTC(curYear, curMonth - 1, curDay + (rule.byWeekday ? 1 : 7 * intervalStep)));
      curYear = d.getUTCFullYear();
      curMonth = d.getUTCMonth() + 1;
      curDay = d.getUTCDate();
    } else if (rule.frequency === 'MONTHLY') {
      curMonth += intervalStep;
      while (curMonth > 12) {
        curYear += 1;
        curMonth -= 12;
      }
      curDay = 1; // start from first of month, targetDayOfMonth will be clamped/used
    } else if (rule.frequency === 'YEARLY') {
      curYear += intervalStep;
    }
  }

  return instances;
}
