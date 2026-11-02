import { describe, it, expect } from 'vitest';
import {
  timeToAngle,
  polarToCartesian,
  pointerToMinutes,
  intervalsOverlap,
  detectOverlaps,
  calculateDuration,
  splitAcrossDays,
  getDayBoundaries,
  formatLocalIso,
  normalizeEvent
} from '../src';
import { expandRecurrence, parseRrule } from '../src/recurrence';
import type { CalendarEvent, TemporalInterval } from '@momentum/shared-types';

describe('MOMENTUM Temporal Engine Acceptance Tests (TE-01 to TE-15)', () => {
  // TE-01
  it('TE-01: Convert midnight to angle -> Top of circle', () => {
    const angle = timeToAngle(0, 0, 0);
    expect(angle).toBeCloseTo(-Math.PI / 2, 5);
  });

  // TE-02
  it('TE-02: Convert noon to angle -> Bottom of circle', () => {
    const angle = timeToAngle(12, 0, 0);
    expect(angle).toBeCloseTo(Math.PI / 2, 5);
  });

  // TE-03
  it('TE-03: Convert 06:00 to angle -> Right side', () => {
    const angle = timeToAngle(6, 0, 0);
    expect(angle).toBeCloseTo(0, 5);
  });

  // TE-04
  it('TE-04: Convert 18:00 to angle -> Left side', () => {
    const angle = timeToAngle(18, 0, 0);
    expect(angle).toBeCloseTo(Math.PI, 5);
  });

  // TE-05
  it('TE-05: Calculate event duration -> Correct elapsed minutes', () => {
    const interval: TemporalInterval = {
      start: '2026-11-02T09:00:00Z',
      end: '2026-11-02T11:30:00Z',
      timezone: 'UTC'
    };
    const duration = calculateDuration(interval);
    expect(duration).toBe(150);
  });

  // TE-06
  it('TE-06: Adjacent intervals -> No collision', () => {
    const intervalA: TemporalInterval = {
      start: '2026-11-02T09:00:00Z',
      end: '2026-11-02T10:00:00Z',
      timezone: 'UTC'
    };
    const intervalB: TemporalInterval = {
      start: '2026-11-02T10:00:00Z',
      end: '2026-11-02T11:00:00Z',
      timezone: 'UTC'
    };

    expect(intervalsOverlap(intervalA, intervalB)).toBe(false);

    const evA = normalizeEvent({
      id: 'a',
      userId: 'u1',
      title: 'A',
      description: null,
      categoryId: 'c1',
      startAt: intervalA.start,
      endAt: intervalA.end,
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    });
    const evB = normalizeEvent({
      id: 'b',
      userId: 'u1',
      title: 'B',
      description: null,
      categoryId: 'c1',
      startAt: intervalB.start,
      endAt: intervalB.end,
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    });

    const collisions = detectOverlaps([evA, evB]);
    expect(collisions).toHaveLength(0);
  });

  // TE-07
  it('TE-07: Partially overlapping intervals -> Collision detected', () => {
    const intervalA: TemporalInterval = {
      start: '2026-11-02T09:00:00Z',
      end: '2026-11-02T10:30:00Z',
      timezone: 'UTC'
    };
    const intervalB: TemporalInterval = {
      start: '2026-11-02T10:00:00Z',
      end: '2026-11-02T11:30:00Z',
      timezone: 'UTC'
    };

    expect(intervalsOverlap(intervalA, intervalB)).toBe(true);

    const evA = normalizeEvent({
      id: 'evA',
      userId: 'u1',
      title: 'A',
      description: null,
      categoryId: 'c1',
      startAt: intervalA.start,
      endAt: intervalA.end,
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    });
    const evB = normalizeEvent({
      id: 'evB',
      userId: 'u1',
      title: 'B',
      description: null,
      categoryId: 'c1',
      startAt: intervalB.start,
      endAt: intervalB.end,
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    });

    const overlaps = detectOverlaps([evA, evB]);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].durationMinutes).toBe(30);
  });

  // TE-08
  it('TE-08: Nested intervals -> Correct overlap', () => {
    const evOuter = normalizeEvent({
      id: 'outer',
      userId: 'u1',
      title: 'Outer Block',
      description: null,
      categoryId: 'c1',
      startAt: '2026-11-02T09:00:00Z',
      endAt: '2026-11-02T12:00:00Z',
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    });

    const evInner = normalizeEvent({
      id: 'inner',
      userId: 'u1',
      title: 'Inner Meeting',
      description: null,
      categoryId: 'c2',
      startAt: '2026-11-02T10:00:00Z',
      endAt: '2026-11-02T11:00:00Z',
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    });

    const overlaps = detectOverlaps([evOuter, evInner]);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].durationMinutes).toBe(60);
  });

  // TE-09
  it('TE-09: Cross-midnight event -> Correct daily segments', () => {
    const crossMidnight: TemporalInterval = {
      start: '2026-11-02T23:00:00.000Z',
      end: '2026-11-03T01:00:00.000Z',
      timezone: 'UTC'
    };

    const segments = splitAcrossDays(crossMidnight, 'UTC');
    expect(segments).toHaveLength(2);
    expect(segments[0].start).toBe('2026-11-02T23:00:00.000Z');
    expect(segments[0].end).toBe('2026-11-03T00:00:00.000Z');
    expect(segments[1].start).toBe('2026-11-03T00:00:00.000Z');
    expect(segments[1].end).toBe('2026-11-03T01:00:00.000Z');
  });

  // TE-10
  it('TE-10: Event ending at midnight -> No extra zero-duration segment', () => {
    const endingAtMidnight: TemporalInterval = {
      start: '2026-11-02T22:00:00.000Z',
      end: '2026-11-03T00:00:00.000Z',
      timezone: 'UTC'
    };

    const segments = splitAcrossDays(endingAtMidnight, 'UTC');
    expect(segments).toHaveLength(1);
    expect(segments[0].start).toBe('2026-11-02T22:00:00.000Z');
    expect(segments[0].end).toBe('2026-11-03T00:00:00.000Z');
  });

  // TE-11
  it('TE-11: Five-minute snapping -> Correct rounded value', () => {
    const cx = 200;
    const cy = 200;
    const radius = 150;
    
    // 09:03 corresponds to 9.05 hours -> angle:
    const angle903 = timeToAngle(9, 3);
    const pt = polarToCartesian(cx, cy, radius, angle903);

    // Snap to 5 minutes: 09:03 is 543 minutes, should snap to 545 minutes (09:05)
    const minutes = pointerToMinutes(pt.x, pt.y, cx, cy, 5);
    expect(minutes).toBe(545);
  });

  // TE-12
  it('TE-12: DST transition -> Correct elapsed duration', () => {
    // US Eastern Time Spring Forward: 2026-03-08 (starts at 02:00 -> becomes 03:00) -> 23 hours
    const springForward = getDayBoundaries('2026-03-08', 'America/New_York');
    expect(springForward.durationMinutes).toBe(23 * 60);

    // Fall Back: 2026-11-01 -> 25 hours
    const fallBack = getDayBoundaries('2026-11-01', 'America/New_York');
    expect(fallBack.durationMinutes).toBe(25 * 60);
  });

  // TE-13
  it('TE-13: Leap-year recurrence -> Correct occurrence', () => {
    const leapBaseEvent: CalendarEvent = {
      id: 'leap_ev',
      userId: 'u1',
      title: 'Leap Day Review',
      description: null,
      categoryId: 'c1',
      startAt: '2024-02-29T10:00:00.000Z',
      endAt: '2024-02-29T11:00:00.000Z',
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    };

    // Yearly recurrence with skip policy on non-leap years
    const skipRule = parseRrule('FREQ=YEARLY;INTERVAL=1;LEAPYEARPOLICY=SKIP');
    const range: TemporalInterval = {
      start: '2024-01-01T00:00:00.000Z',
      end: '2029-01-01T00:00:00.000Z',
      timezone: 'UTC'
    };

    const instances = expandRecurrence(leapBaseEvent, skipRule, range);
    // Should include 2024 and 2028 only
    const dates = instances.map(i => i.startAt.substring(0, 10));
    expect(dates).toContain('2024-02-29');
    expect(dates).toContain('2028-02-29');
    expect(dates).not.toContain('2025-02-28');
  });

  // TE-14
  it('TE-14: Month-end recurrence -> Correct policy', () => {
    const monthEndEvent: CalendarEvent = {
      id: 'month_end_ev',
      userId: 'u1',
      title: 'Month-End Summary',
      description: null,
      categoryId: 'c1',
      startAt: '2026-01-31T17:00:00.000Z',
      endAt: '2026-01-31T18:00:00.000Z',
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    };

    // Monthly recurrence with clamp policy
    const clampRule = parseRrule('FREQ=MONTHLY;INTERVAL=1;MONTHDAYPOLICY=CLAMP');
    const range: TemporalInterval = {
      start: '2026-01-01T00:00:00.000Z',
      end: '2026-05-01T00:00:00.000Z',
      timezone: 'UTC'
    };

    const instances = expandRecurrence(monthEndEvent, clampRule, range);
    const dates = instances.map(i => i.startAt.substring(0, 10));
    expect(dates).toEqual([
      '2026-01-31',
      '2026-02-28', // February clamped to 28
      '2026-03-31', // March has 31
      '2026-04-30'  // April clamped to 30
    ]);
  });

  // TE-15
  it('TE-15: Different user timezones -> Correct local display', () => {
    const utcInstant = Date.parse('2026-11-02T03:30:00.000Z');

    // In India (UTC+5:30), this is 09:00:00 on Nov 2, 2026
    const kolkataStr = formatLocalIso(utcInstant, 'Asia/Kolkata');
    expect(kolkataStr).toBe('2026-11-02T09:00:00');

    // In New York (EST UTC-5:00 on Nov 2 after fall-back), this is 22:30:00 on Nov 1, 2026
    const nyStr = formatLocalIso(utcInstant, 'America/New_York');
    expect(nyStr).toBe('2026-11-01T22:30:00');
  });
});
