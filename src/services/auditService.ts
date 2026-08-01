export interface AuditEntry {
  id: string;
  userId?: string;
  username: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

const auditMemoryStore: AuditEntry[] = [];

export class AuditService {
  static log(entry: Omit<AuditEntry, 'id' | 'createdAt'>): AuditEntry {
    const fullEntry: AuditEntry = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    auditMemoryStore.unshift(fullEntry);
    if (auditMemoryStore.length > 500) {
      auditMemoryStore.pop();
    }
    console.log(`[AUDIT LOG] [${fullEntry.action}] User: ${fullEntry.username} | Resource: ${fullEntry.resource} | ${fullEntry.details}`);
    return fullEntry;
  }

  static getLogs(limit: number = 50): AuditEntry[] {
    return auditMemoryStore.slice(0, limit);
  }
}

export function logAuditEvent(action: string, resource: string, details: string, username: string = 'SISTEMA'): AuditEntry {
  return AuditService.log({ action, resource, details, username });
}
