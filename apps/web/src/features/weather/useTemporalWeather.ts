import { useMemo } from 'react';
import type { CalendarEvent, OverlapResult } from '@momentum/shared-types';

export type WeatherCondition = 'clear' | 'calm' | 'cloudy' | 'stormy' | 'turbulent';

export interface TemporalWeather {
  condition: WeatherCondition;
  title: string;
  description: string;
  color: string;
  particleDensity: number;
  particleSpeed: number;
  committedHours: number;
  freeHours: number;
  overlapCount: number;
  contextSwitches: number;
}

export function calculateTemporalWeather(
  events: CalendarEvent[],
  overlaps: OverlapResult[],
  dateStr: string
): TemporalWeather {
  const dayEvents = events.filter(e => {
    if (e.deletedAt) return false;
    return e.startAt.substring(0, 10) === dateStr || e.endAt.substring(0, 10) === dateStr;
  }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  let totalMinutes = 0;
  for (const ev of dayEvents) {
    const s = new Date(ev.startAt).getTime();
    const e = new Date(ev.endAt).getTime();
    totalMinutes += Math.max(0, Math.round((e - s) / 60000));
  }

  const committedHours = Number((totalMinutes / 60).toFixed(1));
  const freeHours = Number((Math.max(0, 1440 - totalMinutes) / 60).toFixed(1));
  const overlapCount = overlaps.length;

  // Context switches
  let contextSwitches = 0;
  for (let i = 1; i < dayEvents.length; i++) {
    if (dayEvents[i].categoryId !== dayEvents[i - 1].categoryId) {
      contextSwitches++;
    }
  }

  // Derive condition based on Section 11.1
  let condition: WeatherCondition = 'calm';
  let title = 'Calm';
  let description = 'Moderate, well-paced commitments with ample breathing room.';
  let color = '#829AB9';
  let particleDensity = 25;
  let particleSpeed = 0.5;

  if (overlapCount > 0) {
    condition = 'stormy';
    title = 'Stormy Overlap';
    description = `Detected ${overlapCount} overlapping commitments requiring spatial resolution.`;
    color = '#D88B75';
    particleDensity = 60;
    particleSpeed = 1.4;
  } else if (contextSwitches >= 5) {
    condition = 'turbulent';
    title = 'Turbulent Switching';
    description = `High cognitive fragmentation with ${contextSwitches} category transitions.`;
    color = '#E5C07B';
    particleDensity = 50;
    particleSpeed = 1.2;
  } else if (committedHours >= 8) {
    condition = 'cloudy';
    title = 'Dense Cloud';
    description = `${committedHours} hours committed. Limited unstructured cognitive space.`;
    color = '#777E8B';
    particleDensity = 40;
    particleSpeed = 0.7;
  } else if (committedHours < 3) {
    condition = 'clear';
    title = 'Clear Sky';
    description = 'Expansive unallocated temporal space. Prime time for deep contemplation.';
    color = '#D6A66D';
    particleDensity = 15;
    particleSpeed = 0.3;
  }

  return {
    condition,
    title,
    description,
    color,
    particleDensity,
    particleSpeed,
    committedHours,
    freeHours,
    overlapCount,
    contextSwitches
  };
}
