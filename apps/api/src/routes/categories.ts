import { Router as ExpressRouter, Request, Response } from 'express';
import type { Category } from '@momentum/shared-types';

export const categoriesRouter: ExpressRouter = ExpressRouter();

const mockCategories: Category[] = [
  { id: 'cat-work', userId: 'default-user', name: 'Deep Work', color: '#829AB9', traceStyle: 'flow', sortOrder: 1, createdAt: '' },
  { id: 'cat-learning', userId: 'default-user', name: 'Learning & Theory', color: '#D6A66D', traceStyle: 'particles', sortOrder: 2, createdAt: '' },
  { id: 'cat-creative', userId: 'default-user', name: 'Creative & Visual', color: '#E5C07B', traceStyle: 'flow', sortOrder: 3, createdAt: '' },
  { id: 'cat-exercise', userId: 'default-user', name: 'Physical & Health', color: '#729D89', traceStyle: 'solid', sortOrder: 4, createdAt: '' },
  { id: 'cat-personal', userId: 'default-user', name: 'Personal Routine', color: '#A388EE', traceStyle: 'nodes', sortOrder: 5, createdAt: '' },
  { id: 'cat-rest', userId: 'default-user', name: 'Rest & Unwind', color: '#5C6479', traceStyle: 'solid', sortOrder: 6, createdAt: '' }
];

categoriesRouter.get('/', (req: Request, res: Response): void => {
  res.json({
    data: mockCategories,
    meta: { requestId: (req as any).requestId }
  });
});
