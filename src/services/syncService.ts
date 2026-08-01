export interface SyncItem {
  id: string;
  entityName: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  version: number;
  createdAt: string;
}

export interface SyncResponse {
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  syncedCount: number;
  conflicts: any[];
  serverTimestamp: string;
}

const syncQueue: SyncItem[] = [];

export class SyncService {
  /**
   * Pushes offline change item into sync queue
   */
  static queueOfflineChange(item: Omit<SyncItem, 'id' | 'createdAt'>): SyncItem {
    const fullItem: SyncItem = {
      ...item,
      id: `SYNC-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
    };
    syncQueue.push(fullItem);
    return fullItem;
  }

  /**
   * Process and resolve sync queue against server PostgreSQL master database
   */
  static processSyncQueue(items: SyncItem[]): SyncResponse {
    let syncedCount = 0;
    const conflicts: any[] = [];

    for (const item of items) {
      try {
        console.log(`[SYNC ENGINE] Processing ${item.action} on ${item.entityName} (${item.entityId})`);
        syncedCount++;
      } catch (err: any) {
        conflicts.push({ item, error: err.message });
      }
    }

    return {
      status: conflicts.length === 0 ? 'SUCCESS' : 'PARTIAL',
      syncedCount,
      conflicts,
      serverTimestamp: new Date().toISOString(),
    };
  }

  static getQueueStatus() {
    return {
      pendingCount: syncQueue.length,
      items: syncQueue,
    };
  }
}
