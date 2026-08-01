import { Router } from 'express';
import { checkDatabaseConnection } from '../../db/prisma';
import { isRedisActive } from '../../services/redisService';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const dbConnected = await checkDatabaseConnection();
  const redisConnected = isRedisActive();

  res.json({
    status: 'ok',
    system: 'Sotium POS Enterprise Backend (Node.js/Express + PostgreSQL + SQLite Offline Engine)',
    version: '12.4.0',
    database: {
      postgresMaster: dbConnected ? 'CONNECTED' : 'STANDBY_LOCAL_MODE',
      sqliteOffline: 'ACTIVE_WAL_MODE',
      redisCache: redisConnected ? 'ACTIVE' : 'INACTIVE',
    },
    authProvider: 'Proprietary JWT Token Auth Engine (Bcrypt + JWT, No Firebase)',
    compliance: ['VeriFactu Ley 11/2021', 'RD 1007/2023', 'Facturae 3.2.2', 'TicketBAI'],
    timestamp: new Date().toISOString(),
  });
});
