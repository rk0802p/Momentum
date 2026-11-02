import { create } from 'zustand';
import type { CalendarEvent, Category, NormalizedEvent, OverlapResult, CollisionGroup } from '@momentum/shared-types';
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
  undoStack: ActionHistoryItem[];
  redoStack: ActionHistoryItem[];

  // Derived computed accessors
  getNormalizedEvents: () => NormalizedEvent[];
  getOverlaps: () => OverlapResult[];
  getCollisionGroups: () => CollisionGroup[];

  // Mutations
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> & { id?: string }) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  rescheduleEvent: (id: string, startAt: string, endAt: string) => void;
  deleteEvent: (id: string) => void;
  undo: () => void;
  redo: () => void;
  resetToFixtures: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: FIXTURE_EVENTS,
  categories: INITIAL_CATEGORIES,
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

    set((state) => ({
      events: [...state.events, newEvent],
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

    const updated: CalendarEvent = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      events: state.events.map(e => e.id === id ? updated : e),
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

    const updated: CalendarEvent = {
      ...existing,
      startAt,
      endAt,
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      events: state.events.map(e => e.id === id ? updated : e),
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

    set((state) => ({
      events: state.events.filter(e => e.id !== id),
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

  resetToFixtures: () => {
    set({
      events: FIXTURE_EVENTS,
      undoStack: [],
      redoStack: []
    });
  }
}));
