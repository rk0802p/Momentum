import { Router as ExpressRouter, Request, Response } from 'express';

export const analyticsRouter: ExpressRouter = ExpressRouter();

analyticsRouter.get('/summary', (req: Request, res: Response): void => {
  res.json({
    data: {
      weeklyCommittedHours: 28.5,
      weeklyFreeHours: 139.5,
      focusConsistencyScore: 94,
      contextSwitchesCount: 6,
      longestUninterruptedMinutes: 150
    },
    meta: { requestId: (req as any).requestId }
  });
});
