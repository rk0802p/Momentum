import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { env } from './config/env';
import { verifyDatabaseConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authenticate';
import { authRouter } from './routes/auth';
import { eventsRouter } from './routes/events';
import { categoriesRouter } from './routes/categories';
import { historyRouter } from './routes/history';
import { scenariosRouter } from './routes/scenarios';
import { analyticsRouter } from './routes/analytics';

export const app: Express = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      env.CORS_ORIGIN === '*' ||
      origin === env.CORS_ORIGIN ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('x-request-id', reqId);
  (req as any).requestId = reqId;
  next();
});

// Health check endpoint
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  const dbConnected = await verifyDatabaseConnection();
  res.json({
    data: {
      status: 'healthy',
      service: 'momentum-api',
      database: dbConnected ? 'connected' : 'in-memory-fallback',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    meta: {
      requestId: (_req as any).requestId
    }
  });
});

// Authentication routes
app.use('/api/v1/auth', authRouter);

// Domain routes (with user authentication context)
app.use('/api/v1/events', authenticate, eventsRouter);
app.use('/api/v1/categories', authenticate, categoriesRouter);
app.use('/api/v1/history', authenticate, historyRouter);
app.use('/api/v1/scenarios', authenticate, scenariosRouter);
app.use('/api/v1/analytics', authenticate, analyticsRouter);

// Error handling middleware
app.use(errorHandler);
