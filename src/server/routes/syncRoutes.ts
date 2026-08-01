import { Router } from 'express';
import { SyncService } from '../../services/syncService';
import { AuditService } from '../../services/auditService';

export const syncRouter = Router();

syncRouter.post('/v1/sync/push', (req, res, next) => {
  try {
    const { items } = req.body;
    const syncResult = SyncService.processSyncQueue(items || []);

    AuditService.log({
      username: 'SYNC_ENGINE',
      action: 'SYNC_PUSH',
      resource: 'Sync',
      details: `Sincronización procesada: ${syncResult.syncedCount} elementos aplicados en PostgreSQL Master`,
      ipAddress: req.ip,
    });

    res.json(syncResult);
  } catch (err) {
    next(err);
  }
});

syncRouter.get('/v1/sync/pull', (_req, res) => {
  res.json({
    lastServerSyncTime: new Date().toISOString(),
    salons: [],
    products: [],
    pendingOrders: [],
  });
});
