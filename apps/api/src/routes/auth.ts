import { Router as ExpressRouter, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { User } from '@momentum/shared-types';

export const authRouter: ExpressRouter = ExpressRouter();

const JWT_SECRET = process.env.JWT_SECRET || 'momentum-spatial-temporal-secret-key-2026';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required'),
  timezone: z.string().default('Asia/Kolkata')
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const PreferencesSchema = z.object({
  weekStartsOn: z.union([z.literal(0), z.literal(1)]).optional(),
  defaultEnvironment: z.enum(['now', 'flow', 'memory', 'patterns', 'orbit', 'focus']).optional(),
  defaultCalendarMode: z.enum(['radial', 'linear']).optional(),
  snapInterval: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(30)]).optional(),
  reducedMotion: z.boolean().optional(),
  ambientEffects: z.boolean().optional(),
  defaultEventDuration: z.number().positive().optional()
});

// Default Mock User Store
const mockUsers: (User & { passwordHash: string })[] = [
  {
    id: 'default-user',
    email: 'creator@momentum.app',
    displayName: 'Momentum Creator',
    passwordHash: bcrypt.hashSync('Momentum2026!', 10),
    timezone: 'Asia/Kolkata',
    preferences: {
      weekStartsOn: 1,
      defaultEnvironment: 'now',
      defaultCalendarMode: 'radial',
      snapInterval: 15,
      reducedMotion: false,
      ambientEffects: true,
      defaultEventDuration: 60
    },
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
  }
];

// POST /api/v1/auth/register
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const validated = RegisterSchema.parse(req.body);

  const existing = mockUsers.find(u => u.email.toLowerCase() === validated.email.toLowerCase());
  if (existing) {
    res.status(409).json({
      error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists.' }
    });
    return;
  }

  const passwordHash = await bcrypt.hash(validated.password, 10);
  const now = new Date().toISOString();

  const newUser: User & { passwordHash: string } = {
    id: `usr-${Date.now()}`,
    email: validated.email.toLowerCase(),
    displayName: validated.displayName,
    passwordHash,
    timezone: validated.timezone,
    preferences: {
      weekStartsOn: 1,
      defaultEnvironment: 'now',
      defaultCalendarMode: 'radial',
      snapInterval: 15,
      reducedMotion: false,
      ambientEffects: true,
      defaultEventDuration: 60
    },
    createdAt: now,
    updatedAt: now
  };

  mockUsers.push(newUser);

  // Generate session token
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, displayName: newUser.displayName, timezone: newUser.timezone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('momentum_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({
    data: { user: safeUser, token },
    meta: { requestId: (req as any).requestId }
  });
});

// POST /api/v1/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const validated = LoginSchema.parse(req.body);

  const user = mockUsers.find(u => u.email.toLowerCase() === validated.email.toLowerCase());
  if (!user) {
    res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
    });
    return;
  }

  const validPassword = await bcrypt.compare(validated.password, user.passwordHash);
  if (!validPassword) {
    res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
    });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, displayName: user.displayName, timezone: user.timezone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('momentum_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    data: { user: safeUser, token },
    meta: { requestId: (req as any).requestId }
  });
});

// POST /api/v1/auth/logout
authRouter.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('momentum_session');
  res.json({
    data: { success: true },
    meta: { requestId: (req as any).requestId }
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', (req: Request, res: Response): void => {
  const currentUserId = (req as any).user?.id || 'default-user';
  const user = mockUsers.find(u => u.id === currentUserId) || mockUsers[0];

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    data: safeUser,
    meta: { requestId: (req as any).requestId }
  });
});

// PATCH /api/v1/auth/preferences
authRouter.patch('/preferences', (req: Request, res: Response): void => {
  const validated = PreferencesSchema.parse(req.body);
  const currentUserId = (req as any).user?.id || 'default-user';
  const idx = mockUsers.findIndex(u => u.id === currentUserId);

  if (idx !== -1) {
    mockUsers[idx].preferences = {
      ...mockUsers[idx].preferences,
      ...validated
    };
    mockUsers[idx].updatedAt = new Date().toISOString();
  }

  res.json({
    data: mockUsers[idx]?.preferences || {},
    meta: { requestId: (req as any).requestId }
  });
});
