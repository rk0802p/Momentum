import { Router as ExpressRouter, Request, Response } from 'express';

export const scenariosRouter: ExpressRouter = ExpressRouter();

const mockScenarios = [
  {
    id: 'baseline',
    name: 'Baseline Reality',
    description: 'Current real commitments',
    status: 'baseline',
    baseStartAt: '2026-11-02T00:00:00Z',
    baseEndAt: '2026-11-09T00:00:00Z'
  },
  {
    id: 'scenario-a',
    name: 'Scenario Alpha: 4-Hour Deep Work Blocks',
    description: 'Consolidated focus blocks',
    status: 'ready',
    baseStartAt: '2026-11-02T00:00:00Z',
    baseEndAt: '2026-11-09T00:00:00Z'
  }
];

scenariosRouter.get('/', (req: Request, res: Response): void => {
  res.json({ data: mockScenarios, meta: { requestId: (req as any).requestId } });
});

scenariosRouter.post('/:id/apply', (req: Request, res: Response): void => {
  res.json({
    data: { success: true, appliedScenarioId: req.params.id, message: 'Scenario applied transactionally' },
    meta: { requestId: (req as any).requestId }
  });
});
