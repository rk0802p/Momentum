import { create } from 'zustand';
import type {
  CalendarEvent,
  Category,
  NormalizedEvent,
  OverlapResult,
  CollisionGroup,
  ActivitySession,
  ActivitySegment,
  EventRevision,
  Goal,
  Milestone,
  Scenario
} from '@momentum/shared-types';
import { FIXTURE_EVENTS } from '../features/events/fixtures';
import { INITIAL_CATEGORIES } from '../features/categories/categories';
import { normalizeEvent, detectOverlaps, groupCollisions } from '@momentum/temporal-engine';

interface ActionHistoryItem {
  id: string;
  type: 'create' | 'update' | 'reschedule' | 'delete';
  previousState: CalendarEvent | null;
  newState: CalendarEvent | null;
  timestamp: number;
}

interface EventState {
  events: CalendarEvent[];
  categories: Category[];
  activitySessions: ActivitySession[];
  revisions: EventRevision[];
  goals: Goal[];
  milestones: Milestone[];
  undoStack: ActionHistoryItem[];
  redoStack: ActionHistoryItem[];

  // Computed accessors
  getNormalizedEvents: () => NormalizedEvent[];
  getOverlaps: () => OverlapResult[];
  getCollisionGroups: () => CollisionGroup[];

  // Event Mutations
  addEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> & { id?: string }) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  rescheduleEvent: (id: string, startAt: string, endAt: string) => void;
  deleteEvent: (id: string) => void;
  undo: () => void;
  redo: () => void;
  resetToFixtures: () => void;

  // Activity & Session Tracking (Section 4.7 & 6.5)
  recordActivitySession: (session: ActivitySession) => void;

  // Goals & Milestones (Section 6.10)
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Goal;
  toggleMilestone: (milestoneId: string) => void;
}

// Initial fixture revisions to demonstrate deterministic historical reconstruction
const INITIAL_REVISIONS: EventRevision[] = [
  {
    id: 'rev-1',
    eventId: 'evt-2',
    userId: 'default-user',
    revisionNumber: 1,
    action: 'created',
    previousState: null,
    newState: {
      title: 'Spatial Calendar Engine: Radial Architecture',
      startAt: '2026-11-02T08:00:00+05:30',
      endAt: '2026-11-02T10:00:00+05:30',
      status: 'planned'
    },
    recordedAt: '2026-11-02T07:45:00+05:30'
  },
  {
    id: 'rev-2',
    eventId: 'evt-2',
    userId: 'default-user',
    revisionNumber: 2,
    action: 'rescheduled',
    previousState: {
      startAt: '2026-11-02T08:00:00+05:30',
      endAt: '2026-11-02T10:00:00+05:30'
    },
    newState: {
      startAt: '2026-11-02T08:30:00+05:30',
      endAt: '2026-11-02T10:30:00+05:30'
    },
    recordedAt: '2026-11-02T08:15:00+05:30'
  },
  {
    id: 'rev-3',
    eventId: 'evt-2',
    userId: 'default-user',
    revisionNumber: 3,
    action: 'resized',
    previousState: {
      endAt: '2026-11-02T10:30:00+05:30'
    },
    newState: {
      endAt: '2026-11-02T11:00:00+05:30'
    },
    recordedAt: '2026-11-02T10:20:00+05:30'
  },
  {
    id: 'rev-4',
    eventId: 'evt-1',
    userId: 'default-user',
    revisionNumber: 1,
    action: 'completed',
    previousState: { status: 'in_progress' },
    newState: { status: 'completed' },
    recordedAt: '2026-11-02T07:30:00+05:30'
  }
];

// Initial Goals & Milestones for ORBIT
const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    userId: 'default-user',
    title: 'MOMENTUM Spatial OS v1.0 Launch',
    description: 'Deliver the full 6-perspective spatial operating system for time visualization.',
    targetStartAt: '2026-11-01T00:00:00Z',
    targetEndAt: '2026-11-30T00:00:00Z',
    status: 'active',
    createdAt: '2026-11-01T00:00:00Z'
  },
  {
    id: 'goal-2',
    userId: 'default-user',
    title: 'Relativistic Time & Spatial Geometry Research',
    description: 'Complete comprehensive study on the physics of gravity, time curvature, and generative visual manifolds.',
    targetStartAt: '2026-11-01T00:00:00Z',
    targetEndAt: '2026-12-15T00:00:00Z',
    status: 'active',
    createdAt: '2026-11-01T00:00:00Z'
  }
];

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    goalId: 'goal-1',
    title: 'Milestone 0: Workspace & Domain Foundation',
    dueAt: '2026-11-02T18:00:00Z',
    completedAt: '2026-11-02T17:15:00Z',
    sortOrder: 1
  },
  {
    id: 'ms-2',
    goalId: 'goal-1',
    title: 'Milestone 1 & 2: Radial 24h Interactive Canvas',
    dueAt: '2026-11-02T20:00:00Z',
    completedAt: '2026-11-02T18:45:00Z',
    sortOrder: 2
  },
  {
    id: 'ms-3',
    goalId: 'goal-1',
    title: 'Milestone 4: FLOW 3D Spatial Temporal Landscape',
    dueAt: '2026-11-02T22:00:00Z',
    completedAt: '2026-11-02T22:50:00Z',
    sortOrder: 3
  },
  {
    id: 'ms-4',
    goalId: 'goal-1',
    title: 'Milestone 5-8: Historical Replay, Analytics & Scenario Engine',
    dueAt: '2026-11-03T00:00:00Z',
    completedAt: null,
    sortOrder: 4
  },
  {
    id: 'ms-5',
    goalId: 'goal-2',
    title: 'Derive Harmonic Waveform Transform for Generative Traces',
    dueAt: '2026-11-05T00:00:00Z',
    completedAt: '2026-11-02T22:53:00Z',
    sortOrder: 1
  }
];

export const useEventStore = create<EventState>((set, get) => ({
  events: FIXTURE_EVENTS,
  categories: INITIAL_CATEGORIES,
  activitySessions: [
    {
      id: 'sess-1',
      eventId: 'evt-1',
      userId: 'default-user',
      status: 'completed',
      startedAt: '2026-11-02T06:35:00+05:30',
      endedAt: '2026-11-02T07:25:00+05:30',
      segments: [
        {
          id: 'seg-1',
          sessionId: 'sess-1',
          startedAt: '2026-11-02T06:35:00+05:30',
          endedAt: '2026-11-02T07:25:00+05:30',
          durationSeconds: 3000
        }
      ],
      createdAt: '2026-11-02T06:35:00+05:30'
    }
  ],
  revisions: INITIAL_REVISIONS,
  goals: INITIAL_GOALS,
  milestones: INITIAL_MILESTONES,
  undoStack: [],
  redoStack: [],

  getNormalizedEvents: () => {
    return get().events.filter(e => !e.deletedAt).map(normalizeEvent);
  },

  getOverlaps: () => {
    const normalized = get().getNormalizedEvents();
    return detectOverlaps(normalized);
  },

  getCollisionGroups: () => {
    const normalized = get().getNormalizedEvents();
    const overlaps = detectOverlaps(normalized);
    return groupCollisions(normalized, overlaps);
  },

  addEvent: (eventData) => {
    const now = new Date().toISOString();
    const newEvent: CalendarEvent = {
      id: eventData.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: eventData.userId || 'default-user',
      title: eventData.title,
      description: eventData.description ?? null,
      categoryId: eventData.categoryId,
      startAt: eventData.startAt,
      endAt: eventData.endAt,
      timezone: eventData.timezone,
      allDay: eventData.allDay ?? false,
      status: eventData.status ?? 'planned',
      recurrenceId: eventData.recurrenceId ?? null,
      parentEventId: eventData.parentEventId ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    // Append revision record
    const newRev: EventRevision = {
      id: `rev-${Date.now()}`,
      eventId: newEvent.id,
      userId: newEvent.userId,
      revisionNumber: 1,
      action: 'created',
      previousState: null,
      newState: newEvent,
      recordedAt: now
    };

    set((state) => ({
      events: [...state.events, newEvent],
      revisions: [...state.revisions, newRev],
      undoStack: [
        ...state.undoStack,
        {
          id: `act-${Date.now()}`,
          type: 'create',
          previousState: null,
          newState: newEvent,
          timestamp: Date.now()
        }
      ],
      redoStack: []
    }));

    return newEvent;
  },

  updateEvent: (id, updates) => {
    const existing = get().events.find(e => e.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const updated: CalendarEvent = {
      ...existing,
      ...updates,
      updatedAt: now
    };

    const prevRevs = get().revisions.filter(r => r.eventId === id);
    const newRev: EventRevision = {
      id: `rev-${Date.now()}`,
      eventId: id,
      userId: existing.userId,
      revisionNumber: prevRevs.length + 1,
      action: updates.status === 'completed' ? 'completed' : 'updated',
      previousState: existing,
      newState: updated,
      recordedAt: now
    };

    set((state) => ({
      events: state.events.map(e => e.id === id ? updated : e),
      revisions: [...state.revisions, newRev],
      undoStack: [
        ...state.undoStack,
        {
          id: `act-${Date.now()}`,
          type: 'update',
          previousState: existing,
          newState: updated,
          timestamp: Date.now()
        }
      ],
      redoStack: []
    }));
  },

  rescheduleEvent: (id, startAt, endAt) => {
    const existing = get().events.find(e => e.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const updated: CalendarEvent = {
      ...existing,
      startAt,
      endAt,
      updatedAt: now
    };

    const prevRevs = get().revisions.filter(r => r.eventId === id);
    const newRev: EventRevision = {
      id: `rev-${Date.now()}`,
      eventId: id,
      userId: existing.userId,
      revisionNumber: prevRevs.length + 1,
      action: 'rescheduled',
      previousState: { startAt: existing.startAt, endAt: existing.endAt },
      newState: { startAt, endAt },
      recordedAt: now
    };

    set((state) => ({
      events: state.events.map(e => e.id === id ? updated : e),
      revisions: [...state.revisions, newRev],
      undoStack: [
        ...state.undoStack,
        {
          id: `act-${Date.now()}`,
          type: 'reschedule',
          previousState: existing,
          newState: updated,
          timestamp: Date.now()
        }
      ],
      redoStack: []
    }));
  },

  deleteEvent: (id) => {
    const existing = get().events.find(e => e.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const prevRevs = get().revisions.filter(r => r.eventId === id);
    const newRev: EventRevision = {
      id: `rev-${Date.now()}`,
      eventId: id,
      userId: existing.userId,
      revisionNumber: prevRevs.length + 1,
      action: 'deleted',
      previousState: existing,
      newState: {},
      recordedAt: now
    };

    set((state) => ({
      events: state.events.filter(e => e.id !== id),
      revisions: [...state.revisions, newRev],
      undoStack: [
        ...state.undoStack,
        {
          id: `act-${Date.now()}`,
          type: 'delete',
          previousState: existing,
          newState: null,
          timestamp: Date.now()
        }
      ],
      redoStack: []
    }));
  },

  undo: () => {
    const { undoStack, events, redoStack } = get();
    if (undoStack.length === 0) return;

    const action = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    if (action.type === 'create' && action.newState) {
      set({
        events: events.filter(e => e.id !== action.newState!.id),
        undoStack: newUndoStack,
        redoStack: [...redoStack, action]
      });
    } else if (action.type === 'delete' && action.previousState) {
      set({
        events: [...events, action.previousState],
        undoStack: newUndoStack,
        redoStack: [...redoStack, action]
      });
    } else if ((action.type === 'update' || action.type === 'reschedule') && action.previousState) {
      set({
        events: events.map(e => e.id === action.previousState!.id ? action.previousState! : e),
        undoStack: newUndoStack,
        redoStack: [...redoStack, action]
      });
    }
  },

  redo: () => {
    const { redoStack, events, undoStack } = get();
    if (redoStack.length === 0) return;

    const action = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    if (action.type === 'create' && action.newState) {
      set({
        events: [...events, action.newState],
        undoStack: [...undoStack, action],
        redoStack: newRedoStack
      });
    } else if (action.type === 'delete' && action.previousState) {
      set({
        events: events.filter(e => e.id !== action.previousState!.id),
        undoStack: [...undoStack, action],
        redoStack: newRedoStack
      });
    } else if ((action.type === 'update' || action.type === 'reschedule') && action.newState) {
      set({
        events: events.map(e => e.id === action.newState!.id ? action.newState! : e),
        undoStack: [...undoStack, action],
        redoStack: newRedoStack
      });
    }
  },

  recordActivitySession: (session) => {
    set((state) => ({
      activitySessions: [...state.activitySessions, session]
    }));
  },

  addGoal: (goalData) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      userId: goalData.userId,
      title: goalData.title,
      description: goalData.description ?? null,
      targetStartAt: goalData.targetStartAt ?? null,
      targetEndAt: goalData.targetEndAt ?? null,
      status: goalData.status || 'active',
      createdAt: new Date().toISOString()
    };
    set((state) => ({ goals: [...state.goals, newGoal] }));
    return newGoal;
  },

  toggleMilestone: (milestoneId) => {
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completedAt: m.completedAt ? null : new Date().toISOString()
            }
          : m
      )
    }));
  },

  resetToFixtures: () => {
    set({
      events: FIXTURE_EVENTS,
      revisions: INITIAL_REVISIONS,
      goals: INITIAL_GOALS,
      milestones: INITIAL_MILESTONES,
      undoStack: [],
      redoStack: []
    });
  }
}));
