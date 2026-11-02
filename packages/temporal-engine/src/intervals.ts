// -------------------------------------------------------------
// MOMENTUM Intervals & Collision Engine
// Section 5.1, 5.2, 5.5 of Technical Specification
// -------------------------------------------------------------

import type {
  CalendarEvent,
  NormalizedEvent,
  TemporalInterval,
  OverlapResult,
  CollisionGroup
} from '@momentum/shared-types';
import { formatLocalIso, getDayBoundaries, getTimezoneParts } from './timezone';

/**
 * Normalizes an event into UTC instants and local timestamps.
 */
export function normalizeEvent(event: CalendarEvent): NormalizedEvent {
  const startInstant = Date.parse(event.startAt);
  const endInstant = Date.parse(event.endAt);
  const durationMinutes = Math.max(0, Math.round((endInstant - startInstant) / (1000 * 60)));

  return {
    id: event.id,
    startInstant,
    endInstant,
    timezone: event.timezone,
    startLocal: formatLocalIso(startInstant, event.timezone),
    endLocal: formatLocalIso(endInstant, event.timezone),
    durationMinutes,
    originalEvent: event
  };
}

/**
 * Calculates duration in minutes for a temporal interval.
 */
export function calculateDuration(interval: TemporalInterval): number {
  const start = Date.parse(interval.start);
  const end = Date.parse(interval.end);
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
}

/**
 * Checks if two half-open intervals [start, end) overlap.
 * Adjacent intervals (A.end === B.start) do NOT overlap.
 */
export function intervalsOverlap(a: TemporalInterval, b: TemporalInterval): boolean {
  const aStart = Date.parse(a.start);
  const aEnd = Date.parse(a.end);
  const bStart = Date.parse(b.start);
  const bEnd = Date.parse(b.end);

  return aStart < bEnd && bStart < aEnd;
}

/**
 * Sweep-line collision detection for event collections.
 * Half-open interval convention: end boundaries processed before start boundaries at equal timestamps.
 * Returns all overlapping pairs.
 */
export function detectOverlaps(events: NormalizedEvent[]): OverlapResult[] {
  type PointType = 'start' | 'end';
  interface SweepPoint {
    instant: number;
    type: PointType;
    event: NormalizedEvent;
  }

  const points: SweepPoint[] = [];
  for (const ev of events) {
    if (ev.endInstant > ev.startInstant) {
      points.push({ instant: ev.startInstant, type: 'start', event: ev });
      points.push({ instant: ev.endInstant, type: 'end', event: ev });
    }
  }

  // Sort: earlier timestamp first. If timestamps are equal, 'end' comes before 'start'
  points.sort((a, b) => {
    if (a.instant !== b.instant) {
      return a.instant - b.instant;
    }
    if (a.type === b.type) return 0;
    return a.type === 'end' ? -1 : 1;
  });

  const activeEvents = new Map<string, NormalizedEvent>();
  const overlapMap = new Map<string, OverlapResult>();

  for (const pt of points) {
    if (pt.type === 'start') {
      // It overlaps with all currently active events
      for (const [activeId, activeEv] of activeEvents) {
        const key = activeId < pt.event.id ? `${activeId}::${pt.event.id}` : `${pt.event.id}::${activeId}`;
        const overlapStart = Math.max(activeEv.startInstant, pt.event.startInstant);
        const overlapEnd = Math.min(activeEv.endInstant, pt.event.endInstant);
        
        if (overlapStart < overlapEnd && !overlapMap.has(key)) {
          overlapMap.set(key, {
            eventAId: activeId < pt.event.id ? activeId : pt.event.id,
            eventBId: activeId < pt.event.id ? pt.event.id : activeId,
            overlapStartInstant: overlapStart,
            overlapEndInstant: overlapEnd,
            durationMinutes: Math.round((overlapEnd - overlapStart) / (1000 * 60))
          });
        }
      }
      activeEvents.set(pt.event.id, pt.event);
    } else {
      activeEvents.delete(pt.event.id);
    }
  }

  return Array.from(overlapMap.values());
}

/**
 * Groups colliding events into cluster groups for visualization.
 */
export function groupCollisions(events: NormalizedEvent[], overlaps: OverlapResult[]): CollisionGroup[] {
  if (overlaps.length === 0) return [];

  // Disjoint set / union-find
  const parent = new Map<string, string>();
  function find(id: string): string {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)!));
    }
    return parent.get(id)!;
  }
  function union(a: string, b: string) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootB, rootA);
  }

  for (const o of overlaps) {
    union(o.eventAId, o.eventBId);
  }

  const clusters = new Map<string, string[]>();
  for (const o of overlaps) {
    const rootA = find(o.eventAId);
    if (!clusters.has(rootA)) clusters.set(rootA, []);
    if (!clusters.get(rootA)!.includes(o.eventAId)) clusters.get(rootA)!.push(o.eventAId);
    if (!clusters.get(rootA)!.includes(o.eventBId)) clusters.get(rootA)!.push(o.eventBId);
  }

  const eventMap = new Map(events.map(e => [e.id, e]));
  const groups: CollisionGroup[] = [];

  for (const [groupId, eventIds] of clusters.entries()) {
    let minStart = Infinity;
    let maxEnd = -Infinity;
    for (const id of eventIds) {
      const ev = eventMap.get(id);
      if (ev) {
        minStart = Math.min(minStart, ev.startInstant);
        maxEnd = Math.max(maxEnd, ev.endInstant);
      }
    }
    groups.push({
      groupId,
      eventIds,
      startInstant: minStart,
      endInstant: maxEnd
    });
  }

  return groups;
}

/**
 * Returns the 24-hour (or DST-adjusted) TemporalInterval for a given local date string (YYYY-MM-DD)
 * and timezone.
 */
export function getDayInterval(dateStr: string, timezone: string): TemporalInterval {
  const boundaries = getDayBoundaries(dateStr, timezone);
  return {
    start: new Date(boundaries.startInstant).toISOString(),
    end: new Date(boundaries.endInstant).toISOString(),
    timezone
  };
}

/**
 * Returns the TemporalInterval for the week containing the given date.
 * weekStartsOn: 0 (Sunday) or 1 (Monday). Default 1.
 */
export function getWeekInterval(dateStr: string, timezone: string, weekStartsOn: 0 | 1 = 1): TemporalInterval {
  const [yrStr, moStr, daStr] = dateStr.split('-');
  const baseDate = new Date(Date.UTC(parseInt(yrStr, 10), parseInt(moStr, 10) - 1, parseInt(daStr, 10)));
  const dayOfWeek = baseDate.getUTCDay(); // 0 is Sun, 1 is Mon...
  
  let diffDays = dayOfWeek - weekStartsOn;
  if (diffDays < 0) diffDays += 7;
  
  const mondayUtc = new Date(baseDate.getTime() - diffDays * 24 * 60 * 60 * 1000);
  const startY = mondayUtc.getUTCFullYear();
  const startM = String(mondayUtc.getUTCMonth() + 1).padStart(2, '0');
  const startD = String(mondayUtc.getUTCDate()).padStart(2, '0');
  const startDateStr = `${startY}-${startM}-${startD}`;

  const endUtc = new Date(mondayUtc.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endY = endUtc.getUTCFullYear();
  const endM = String(endUtc.getUTCMonth() + 1).padStart(2, '0');
  const endD = String(endUtc.getUTCDate()).padStart(2, '0');
  const endDateStr = `${endY}-${endM}-${endD}`;

  const startBoundaries = getDayBoundaries(startDateStr, timezone);
  const endBoundaries = getDayBoundaries(endDateStr, timezone);

  return {
    start: new Date(startBoundaries.startInstant).toISOString(),
    end: new Date(endBoundaries.startInstant).toISOString(),
    timezone
  };
}

/**
 * Splits an interval across local midnight boundaries in the specified timezone.
 * Edge case TE-10: An event ending exactly at midnight does NOT produce an extra zero-duration segment!
 */
export function splitAcrossDays(interval: TemporalInterval, timezone: string): TemporalInterval[] {
  const startInstant = Date.parse(interval.start);
  const endInstant = Date.parse(interval.end);

  if (startInstant >= endInstant) {
    return [];
  }

  const segments: TemporalInterval[] = [];
  let currentInstant = startInstant;

  while (currentInstant < endInstant) {
    // Determine the local date of currentInstant in timezone
    const parts = getTimezoneParts(new Date(currentInstant), timezone);
    const dateStr = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    const dayBoundary = getDayBoundaries(dateStr, timezone);

    // Segment end is either the end of this day or the event's end instant, whichever is earlier
    const segmentEndInstant = Math.min(endInstant, dayBoundary.endInstant);

    if (segmentEndInstant > currentInstant) {
      segments.push({
        start: new Date(currentInstant).toISOString(),
        end: new Date(segmentEndInstant).toISOString(),
        timezone
      });
    }

    currentInstant = segmentEndInstant;
  }

  return segments;
}
