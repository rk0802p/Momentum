import { Router as ExpressRouter, Request, Response } from 'express';
import { CreateEventSchema, UpdateEventSchema, RescheduleEventSchema } from '@momentum/validation';
import type { CalendarEvent } from '@momentum/shared-types';

export const eventsRouter: ExpressRouter = ExpressRouter();

let mockEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    userId: 'default-user',
    title: 'Morning Routine & Meditation',
    description: 'Grounding session, physical stretching, and breathing exercise.',
    categoryId: 'cat-personal',
    startAt: '2026-11-02T06:30:00+05:30',
    endAt: '2026-11-02T07:30:00+05:30',
    timezone: 'Asia/Kolkata',
    allDay: false,
    status: 'completed',
    recurrenceId: null,
    parentEventId: null,
    createdAt: '2026-11-01T20:00:00Z',
    updatedAt: '2026-11-01T20:00:00Z',
    deletedAt: null
  },
  {
    id: 'evt-2',
    userId: 'default-user',
    title: 'Spatial Calendar Engine: Radial Architecture',
    description: 'Develop the core radial SVG canvas and direct pointer manipulation routines.',
    categoryId: 'cat-work',
    startAt: '2026-11-02T08:30:00+05:30',
    endAt: '2026-11-02T11:00:00+05:30',
    timezone: 'Asia/Kolkata',
    allDay: false,
    status: 'in_progress',
    recurrenceId: null,
    parentEventId: null,
    createdAt: '2026-11-01T20:00:00Z',
    updatedAt: '2026-11-01T20:00:00Z',
    deletedAt: null
  }
];

eventsRouter.get('/', (req: Request, res: Response): void => {
  const { from, to } = req.query;
  let result = mockEvents.filter(e => !e.deletedAt);

  if (from && to) {
    const fromTime = new Date(from as string).getTime();
    const toTime = new Date(to as string).getTime();
    result = result.filter(e => {
      const s = new Date(e.startAt).getTime();
      const end = new Date(e.endAt).getTime();
      return s < toTime && end > fromTime;
    });
  }

  res.json({
    data: result,
    meta: {
      requestId: (req as any).requestId,
      count: result.length
    }
  });
});

eventsRouter.get('/:id', (req: Request, res: Response): void => {
  const ev = mockEvents.find(e => e.id === req.params.id && !e.deletedAt);
  if (!ev) {
    res.status(404).json({
      error: { code: 'EVENT_NOT_FOUND', message: `Event ${req.params.id} does not exist.` }
    });
    return;
  }
  res.json({ data: ev, meta: { requestId: (req as any).requestId } });
});

eventsRouter.post('/', (req: Request, res: Response): void => {
  const validated = CreateEventSchema.parse(req.body);
  const now = new Date().toISOString();

  const newEvent: CalendarEvent = {
    id: `evt-${Date.now()}`,
    userId: 'default-user',
    title: validated.title,
    description: validated.description ?? null,
    categoryId: validated.categoryId,
    startAt: validated.startAt,
    endAt: validated.endAt,
    timezone: validated.timezone,
    allDay: validated.allDay,
    status: validated.status,
    recurrenceId: null,
    parentEventId: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };

  mockEvents.push(newEvent);
  res.status(201).json({ data: newEvent, meta: { requestId: (req as any).requestId } });
});

eventsRouter.patch('/:id', (req: Request, res: Response): void => {
  const validated = UpdateEventSchema.parse(req.body);
  const idx = mockEvents.findIndex(e => e.id === req.params.id && !e.deletedAt);
  if (idx === -1) {
    res.status(404).json({
      error: { code: 'EVENT_NOT_FOUND', message: 'Event not found' }
    });
    return;
  }

  mockEvents[idx] = {
    ...mockEvents[idx],
    ...validated,
    updatedAt: new Date().toISOString()
  };

  res.json({ data: mockEvents[idx], meta: { requestId: (req as any).requestId } });
});

eventsRouter.delete('/:id', (req: Request, res: Response): void => {
  const idx = mockEvents.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({
      error: { code: 'EVENT_NOT_FOUND', message: 'Event not found' }
    });
    return;
  }

  mockEvents[idx].deletedAt = new Date().toISOString();
  res.json({ data: { success: true }, meta: { requestId: (req as any).requestId } });
});

eventsRouter.post('/:id/reschedule', (req: Request, res: Response): void => {
  const validated = RescheduleEventSchema.parse(req.body);
  const idx = mockEvents.findIndex(e => e.id === req.params.id && !e.deletedAt);
  if (idx === -1) {
    res.status(404).json({
      error: { code: 'EVENT_NOT_FOUND', message: 'Event not found' }
    });
    return;
  }

  mockEvents[idx].startAt = validated.startAt;
  mockEvents[idx].endAt = validated.endAt;
  mockEvents[idx].updatedAt = new Date().toISOString();

  res.json({ data: mockEvents[idx], meta: { requestId: (req as any).requestId } });
});
