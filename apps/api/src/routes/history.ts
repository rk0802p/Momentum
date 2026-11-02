import { Router as ExpressRouter, Request, Response } from 'express';

export const historyRouter: ExpressRouter = ExpressRouter();

historyRouter.get('/days/:date', (req: Request, res: Response): void => {
  const { date } = req.params;

  res.json({
    data: {
      localDate: date,
      revisionCursor: 4,
      reconstructedState: [
        {
          id: 'evt-1',
          title: 'Morning Routine & Meditation',
          startAt: `${date}T06:30:00+05:30`,
          endAt: `${date}T07:30:00+05:30`,
          status: 'completed'
        },
        {
          id: 'evt-2',
          title: 'Spatial Calendar Engine: Radial Architecture',
          startAt: `${date}T08:30:00+05:30`,
          endAt: `${date}T11:00:00+05:30`,
          status: 'in_progress'
        }
      ]
    },
    meta: { requestId: (req as any).requestId }
  });
});
