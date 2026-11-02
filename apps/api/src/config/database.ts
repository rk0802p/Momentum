import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  var prisma: PrismaClient | undefined;
}

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

export const prisma = isDatabaseConfigured
  ? (global.prisma || new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    }))
  : null;

if (isDatabaseConfigured && env.NODE_ENV !== 'production' && prisma) {
  global.prisma = prisma;
}

/**
 * Health check verification for PostgreSQL connection.
 * Returns true if connection succeeds, false otherwise.
 */
export async function verifyDatabaseConnection(): Promise<boolean> {
  if (!prisma) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}
