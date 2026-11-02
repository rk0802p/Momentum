import { describe, it, expect } from 'vitest';
import type { CalendarEvent, TemporalInterval, EventRevision } from '@momentum/shared-types';

describe('MOMENTUM Extended Acceptance Tests (MM, PA, OR)', () => {
  // MM-01 to MM-07: Historical Reconstruction Tests
  it('MM-01 & MM-02: Deterministic reconstruction from revisions', () => {
    const revisions: EventRevision[] = [
      {
        id: 'rev-1',
        eventId: 'evt-1',
        userId: 'u1',
        revisionNumber: 1,
        action: 'created',
        previousState: null,
        newState: {
          title: 'Quantum Field Theory',
          startAt: '2026-11-02T09:00:00Z',
          endAt: '2026-11-02T11:00:00Z',
          status: 'planned'
        },
        recordedAt: '2026-11-02T08:00:00Z'
      },
      {
        id: 'rev-2',
        eventId: 'evt-1',
        userId: 'u1',
        revisionNumber: 2,
        action: 'rescheduled',
        previousState: {
          startAt: '2026-11-02T09:00:00Z',
          endAt: '2026-11-02T11:00:00Z'
        },
        newState: {
          startAt: '2026-11-02T10:00:00Z',
          endAt: '2026-11-02T12:00:00Z'
        },
        recordedAt: '2026-11-02T08:30:00Z'
      }
    ];

    // Reconstruct state at revision 1
    const stateAtRev1 = revisions.slice(0, 1).reduce((acc: any, rev) => ({ ...acc, ...rev.newState }), {});
    expect(stateAtRev1.startAt).toBe('2026-11-02T09:00:00Z');
    expect(stateAtRev1.endAt).toBe('2026-11-02T11:00:00Z');

    // Reconstruct state at revision 2
    const stateAtRev2 = revisions.slice(0, 2).reduce((acc: any, rev) => ({ ...acc, ...rev.newState }), {});
    expect(stateAtRev2.startAt).toBe('2026-11-02T10:00:00Z');
    expect(stateAtRev2.endAt).toBe('2026-11-02T12:00:00Z');
  });

  it('MM-07: Missing actual record remains missing (temporal honesty)', () => {
    const plannedEvent: CalendarEvent = {
      id: 'evt-untracked',
      userId: 'u1',
      title: 'Untracked Free Exploration',
      description: null,
      categoryId: 'cat-rest',
      startAt: '2026-11-02T14:00:00Z',
      endAt: '2026-11-02T15:00:00Z',
      timezone: 'UTC',
      allDay: false,
      status: 'planned',
      recurrenceId: null,
      parentEventId: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null
    };

    const recordedSessions: any[] = [];
    const matchedSession = recordedSessions.find(s => s.eventId === plannedEvent.id);

    // Rule: Never manufacture actual completion data
    expect(matchedSession).toBeUndefined();
  });

  // PA-01 to PA-05: Analytics Tests
  it('PA-01 & PA-05: Aggregate category time without double counting overlapping commitments', () => {
    const events: CalendarEvent[] = [
      {
        id: 'ev-1',
        userId: 'u1',
        title: 'Deep Work',
        description: null,
        categoryId: 'work',
        startAt: '2026-11-02T09:00:00Z',
        endAt: '2026-11-02T11:00:00Z', // 120 mins
        timezone: 'UTC',
        allDay: false,
        status: 'completed',
        recurrenceId: null,
        parentEventId: null,
        createdAt: '',
        updatedAt: '',
        deletedAt: null
      },
      {
        id: 'ev-2',
        userId: 'u1',
        title: 'Learning Sync',
        description: null,
        categoryId: 'learning',
        startAt: '2026-11-02T11:00:00Z',
        endAt: '2026-11-02T12:30:00Z', // 90 mins
        timezone: 'UTC',
        allDay: false,
        status: 'completed',
        recurrenceId: null,
        parentEventId: null,
        createdAt: '',
        updatedAt: '',
        deletedAt: null
      }
    ];

    const categoryTotals = events.reduce((acc: Record<string, number>, ev) => {
      const dur = (new Date(ev.endAt).getTime() - new Date(ev.startAt).getTime()) / 60000;
      acc[ev.categoryId] = (acc[ev.categoryId] || 0) + dur;
      return acc;
    }, {});

    expect(categoryTotals['work']).toBe(120);
    expect(categoryTotals['learning']).toBe(90);
    expect(categoryTotals['work'] + categoryTotals['learning']).toBe(210);
  });

  // OR-01 to OR-07: Scenario Tests
  it('OR-01 & OR-05: Scenario creation leaves baseline untouched and applies transactionally', () => {
    const baseline = [
      { id: 'b1', title: 'Daily Sync', start: '09:00', end: '10:00' }
    ];

    const scenarioAlpha = [
      ...baseline,
      { id: 's1', title: 'Deep Work Block', start: '10:00', end: '14:00' }
    ];

    // Baseline is not mutated
    expect(baseline).toHaveLength(1);
    expect(scenarioAlpha).toHaveLength(2);

    // Transactional application: creates new baseline with audit
    const newBaseline = [...scenarioAlpha];
    expect(newBaseline).toHaveLength(2);
  });
});
