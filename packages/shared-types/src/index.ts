// -------------------------------------------------------------
// MOMENTUM Shared Domain Types
// Section 5 & 6 of Technical Specification
// -------------------------------------------------------------

export type EnvironmentType = 'now' | 'flow' | 'memory' | 'patterns' | 'orbit' | 'focus';
export type SpatialMode = 'radial' | 'linear' | 'spatial';
export type SnapInterval = 5 | 10 | 15 | 30;

export type EventStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
export type ActivityStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type RevisionAction = 'created' | 'updated' | 'rescheduled' | 'resized' | 'completed' | 'cancelled' | 'deleted';
export type TraceStyle = 'solid' | 'particles' | 'nodes' | 'flow';
export type ScenarioStatus = 'draft' | 'applied' | 'archived';
export type GoalStatus = 'active' | 'completed' | 'archived';

// Core Temporal Engine Types
export interface TemporalInterval {
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
  timezone: string; // IANA timezone e.g. "Asia/Kolkata", "America/New_York"
}

export interface NormalizedEvent {
  id: string;
  startInstant: number; // UTC Epoch Milliseconds
  endInstant: number;   // UTC Epoch Milliseconds
  timezone: string;
  startLocal: string;   // Formatted local string e.g. "2026-11-02T09:00:00"
  endLocal: string;     // Formatted local string e.g. "2026-11-02T11:00:00"
  durationMinutes: number;
  originalEvent?: CalendarEvent;
}

export interface OverlapResult {
  eventAId: string;
  eventBId: string;
  overlapStartInstant: number;
  overlapEndInstant: number;
  durationMinutes: number;
}

export interface CollisionGroup {
  groupId: string;
  eventIds: string[];
  startInstant: number;
  endInstant: number;
}

export interface UserPreferences {
  weekStartsOn: 0 | 1;
  defaultEnvironment: EnvironmentType;
  defaultCalendarMode: 'radial' | 'linear';
  snapInterval: SnapInterval;
  reducedMotion: boolean;
  ambientEffects: boolean;
  defaultEventDuration: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  traceStyle: TraceStyle;
  sortOrder: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  categoryId: string;
  startAt: string; // ISO-8601 UTC / with offset
  endAt: string;   // ISO-8601 UTC / with offset
  timezone: string;
  allDay: boolean;
  status: EventStatus;
  recurrenceId: string | null;
  parentEventId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ActivitySegment {
  id: string;
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
}

export interface ActivitySession {
  id: string;
  eventId: string;
  userId: string;
  status: ActivityStatus;
  startedAt: string;
  endedAt: string | null;
  segments: ActivitySegment[];
  createdAt: string;
}

export interface EventRevision {
  id: string;
  eventId: string;
  userId: string;
  revisionNumber: number;
  action: RevisionAction;
  previousState: Partial<CalendarEvent> | null;
  newState: Partial<CalendarEvent>;
  recordedAt: string;
}

export interface RecurrenceRule {
  id: string;
  eventId: string;
  rrule: string;
  localStartTime: string;
  timezone: string;
  durationMinutes: number;
  until: string | null;
  occurrenceLimit: number | null;
  createdAt: string;
}

export interface EventException {
  id: string;
  recurrenceId: string;
  originalOccurrenceAt: string;
  action: 'cancelled' | 'modified';
  modifiedEventId: string | null;
}

export interface Scenario {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  baseStartAt: string;
  baseEndAt: string;
  status: ScenarioStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioEvent {
  id: string;
  scenarioId: string;
  baseEventId: string | null;
  title: string;
  startAt: string;
  endAt: string;
  action: 'override' | 'add' | 'remove';
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetStartAt: string | null;
  targetEndAt: string | null;
  status: GoalStatus;
  createdAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
  sortOrder: number;
}

export interface DailySnapshot {
  id: string;
  userId: string;
  localDate: string; // YYYY-MM-DD
  timezone: string;
  revisionCursor: number;
  eventState: CalendarEvent[];
  createdAt: string;
}

export interface PlaybackState {
  timestamp: number;
  revisionIndex: number;
  events: NormalizedEvent[];
  speed: 1 | 2 | 5 | 10;
  playing: boolean;
}

export interface TraceParameters {
  eventId: string;
  categoryId: string;
  durationMinutes: number;
  intensity: number;
  visualType: TraceStyle;
  seed: number;
}
