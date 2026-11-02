import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

export const app: Express = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('x-request-id', reqId);
  (req as any).requestId = reqId;
  next();
});

// Health check endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    data: {
      status: 'healthy',
      service: 'momentum-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    meta: {
      requestId: (_req as any).requestId
    }
  });
});

// Error handling middleware
app.use(errorHandler);
