import type { Category } from '@momentum/shared-types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-work',
    userId: 'default-user',
    name: 'Deep Work',
    color: '#829AB9', // future / cool steel
    traceStyle: 'flow',
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-learning',
    userId: 'default-user',
    name: 'Learning & Theory',
    color: '#D6A66D', // accent / gold luminous
    traceStyle: 'particles',
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-creative',
    userId: 'default-user',
    name: 'Creative & Visual',
    color: '#E5C07B', // amber ochre
    traceStyle: 'flow',
    sortOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-exercise',
    userId: 'default-user',
    name: 'Physical & Health',
    color: '#729D89', // completed / sage
    traceStyle: 'solid',
    sortOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-personal',
    userId: 'default-user',
    name: 'Personal Routine',
    color: '#A388EE', // soft violet
    traceStyle: 'nodes',
    sortOrder: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-rest',
    userId: 'default-user',
    name: 'Rest & Unwind',
    color: '#5C6479', // slate neutral
    traceStyle: 'solid',
    sortOrder: 6,
    createdAt: new Date().toISOString()
  }
];

export const CATEGORY_MAP = new Map(INITIAL_CATEGORIES.map(c => [c.id, c]));
