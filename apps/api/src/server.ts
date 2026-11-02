import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`[MOMENTUM API] Running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});

process.on('SIGTERM', () => {
  console.log('[MOMENTUM API] Graceful shutdown initiated');
  server.close(() => {
    process.exit(0);
  });
});
