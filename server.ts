import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';

import { logger } from './src/services/loggerService';
import { getRedisClient } from './src/services/redisService';
import { getBetterSqliteDB } from './src/db/better-sqlite-engine';
import { errorHandler } from './src/middleware/errorHandler';

import { setupSocketIO } from './src/server/sockets/socketHandler';
import { healthRouter } from './src/server/routes/healthRoutes';
import { authRouter } from './src/server/routes/authRoutes';
import { verifactuRouter } from './src/server/routes/verifactuRoutes';
import { ticketbaiRouter } from './src/server/routes/ticketbaiRoutes';
import { syncRouter } from './src/server/routes/syncRoutes';
import { printerRouter } from './src/server/routes/printerRoutes';
import { auditRouter } from './src/server/routes/auditRoutes';
import { createInventoryRouter } from './src/server/routes/inventoryRoutes';
import { createPurchasesRouter } from './src/server/routes/purchasesRoutes';
import { aiRouter } from './src/server/routes/aiRoutes';
import { facturaeRouter } from './src/server/routes/facturaeRoutes';
import { createReservationRouter } from './src/server/routes/reservationRoutes';
import { uploadRouter } from './src/server/routes/uploadRoutes';
import { createBIRouter } from './src/server/routes/biRoutes';
import { createHRRouter } from './src/server/routes/hrRoutes';
import { createFinanceRouter } from './src/server/routes/financeRoutes';
import { createMultiCompanyRouter } from './src/server/routes/multiCompanyRoutes';
import { createProductionRouter } from './src/server/routes/productionRoutes';
import { createMaintenanceRouter } from './src/server/routes/maintenanceRoutes';
import { createQualityHaccpRouter } from './src/server/routes/qualityHaccpRoutes';
import { createBackofficeRouter } from './src/server/routes/backofficeRoutes';
import { createIntegrationRouter } from './src/server/routes/integrationRoutes';
import { createMobileRouter } from './src/server/routes/mobileRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  // Realtime WebSockets
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  setupSocketIO(io);

  // Middlewares
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'TOO_MANY_REQUESTS', message: 'Límite de peticiones alcanzado. Por favor, reintente en unos minutos.' },
  });
  app.use('/api/', generalLimiter);

  // Background Cache and SQLite Initialization
  getRedisClient().catch((err) => logger.warn('[REDIS] Init fallback:', err?.message));
  try {
    getBetterSqliteDB();
  } catch (err: any) {
    logger.warn('[SQLite] DB Init error, fallback active:', err?.message);
  }

  // Register Express Routers
  app.use('/api', healthRouter);
  app.use('/api', authRouter);
  app.use('/api', verifactuRouter);
  app.use('/api', ticketbaiRouter);
  app.use('/api', syncRouter);
  app.use('/api', printerRouter);
  app.use('/api', auditRouter);
  app.use('/api', createInventoryRouter(io));
  app.use('/api', createPurchasesRouter(io));
  app.use('/api', aiRouter);
  app.use('/api', facturaeRouter);
  app.use('/api', createReservationRouter(io));
  app.use('/api', uploadRouter);
  app.use('/api', createBIRouter(io));
  app.use('/api', createHRRouter(io));
  app.use('/api/finance', createFinanceRouter(io));
  app.use('/api/multicompany', createMultiCompanyRouter(io));
  app.use('/api', createProductionRouter(io));
  app.use('/api', createMaintenanceRouter(io));
  app.use('/api', createQualityHaccpRouter(io));
  app.use('/api', createBackofficeRouter(io));
  app.use('/api', createIntegrationRouter(io));
  app.use('/api', createMobileRouter(io));

  // Centralized Error Handler
  app.use(errorHandler);

  // Vite integration for SPA rendering
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`[HostelERP Enterprise Server] Active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
