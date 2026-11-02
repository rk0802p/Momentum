import { z } from 'zod';

export const EventStatusSchema = z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'missed']);
export const ActivityStatusSchema = z.enum(['active', 'paused', 'completed', 'abandoned']);
export const TraceStyleSchema = z.enum(['solid', 'particles', 'nodes', 'flow']);

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().nullable().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  startAt: z.string().datetime({ offset: true }),
  endAt: z.string().datetime({ offset: true }),
  timezone: z.string().min(1, 'Timezone is required'),
  allDay: z.boolean().default(false),
  status: EventStatusSchema.default('planned')
}).refine((data) => new Date(data.startAt).getTime() < new Date(data.endAt).getTime(), {
  message: 'Event start must precede event end',
  path: ['endAt']
});

export const UpdateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  startAt: z.string().datetime({ offset: true }).optional(),
  endAt: z.string().datetime({ offset: true }).optional(),
  timezone: z.string().optional(),
  allDay: z.boolean().optional(),
  status: EventStatusSchema.optional(),
  expectedUpdatedAt: z.string().optional()
});

export const RescheduleEventSchema = z.object({
  startAt: z.string().datetime({ offset: true }),
  endAt: z.string().datetime({ offset: true }),
  expectedUpdatedAt: z.string().optional()
}).refine((data) => new Date(data.startAt).getTime() < new Date(data.endAt).getTime(), {
  message: 'Event start must precede event end',
  path: ['endAt']
});

export const UserPreferencesSchema = z.object({
  weekStartsOn: z.union([z.literal(0), z.literal(1)]).default(1),
  defaultEnvironment: z.enum(['now', 'flow', 'memory']).default('now'),
  defaultCalendarMode: z.enum(['radial', 'linear']).default('radial'),
  snapInterval: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(30)]).default(15),
  reducedMotion: z.boolean().default(false),
  ambientEffects: z.boolean().default(true),
  defaultEventDuration: z.number().positive().default(60)
});
