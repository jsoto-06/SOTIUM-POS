import { logger } from '../services/loggerService';

let prismaInstance: any = null;

export function getPrismaClient(): any {
  if (!prismaInstance) {
    try {
      const { PrismaClient } = require('@prisma/client');
      prismaInstance = new PrismaClient({
        log: ['error', 'warn'],
      });
    } catch {
      prismaInstance = {};
    }
  }
  return prismaInstance;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err: any) {
    logger.warn('[POSTGRES PRISMA] PostgreSQL master connection offline or unreachable. Operating in local mode.', err.message);
    return false;
  }
}
