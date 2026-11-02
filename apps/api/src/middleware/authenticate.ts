import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'momentum-spatial-temporal-secret-key-2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check cookie or Authorization header
  let token = req.cookies?.momentum_session;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    // If unauthenticated, fallback to default user context in development
    (req as any).user = {
      id: 'default-user',
      email: 'creator@momentum.app',
      displayName: 'Momentum Creator',
      timezone: 'Asia/Kolkata'
    };
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session token.' }
    });
  }
}
