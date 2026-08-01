import { describe, it, expect } from 'vitest';
import { SyncService } from '../services/syncService';
import { VeriFactuService } from '../services/verifactuService';

describe('Offline Synchronization & DB Queue Engine', () => {
  it('should process offline sync items and generate success response', () => {
    const offlineItem = {
      id: 'OFFLINE-001',
      entityName: 'Order',
      entityId: 'ORD-999',
      action: 'CREATE' as const,
      payload: {
        orderNumber: 'T2026/0099',
        total: 45.50,
        items: [{ productName: 'Caña de Cerveza', quantity: 2, unitPrice: 2.50 }],
      },
      version: 1,
      createdAt: new Date().toISOString(),
    };

    const response = SyncService.processSyncQueue([offlineItem]);

    expect(response.status).toBe('SUCCESS');
    expect(response.syncedCount).toBe(1);
    expect(response.conflicts).toHaveLength(0);
    expect(response.serverTimestamp).toBeDefined();
  });

  it('should queue offline changes cleanly', () => {
    const queued = SyncService.queueOfflineChange({
      entityName: 'Table',
      entityId: 'tbl-terraza-1',
      action: 'UPDATE',
      payload: { status: 'OCCUPIED' },
      version: 1,
    });

    expect(queued.id).toContain('SYNC-');
    expect(queued.action).toBe('UPDATE');

    const status = SyncService.getQueueStatus();
    expect(status.pendingCount).toBeGreaterThan(0);
  });
});
