import { describe, it, expect, beforeEach } from 'vitest';
import { backofficeService } from '../services/backofficeService';
import { adminAIService } from '../services/adminAIService';

describe('FASE 23 - Administración, Configuración Global y BackOffice Enterprise', () => {
  beforeEach(() => {
    // Reset/re-init default data
  });

  it('1. Debe obtener y actualizar la configuración fiscal y de empresa global', () => {
    const config = backofficeService.getCompanyConfig();
    expect(config.nif).toBeDefined();
    expect(config.verifactuEnabled).toBe(true);

    const updated = backofficeService.updateCompanyConfig({ phone: '+34 900 111 222' }, 'TestAdmin');
    expect(updated.phone).toBe('+34 900 111 222');

    // Verify audit log entry was created
    const logs = backofficeService.getAuditLogs({ module: 'ADMINISTRACION' });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe('UPDATE_COMPANY_CONFIG');
  });

  it('2. Debe gestionar la red de hardware TPV e impresoras térmicas ESC/POS', () => {
    const hw = backofficeService.getTPVHardwareConfig();
    expect(hw.printers.length).toBeGreaterThanOrEqual(1);

    const testRes = backofficeService.testPrinterDevice(hw.printers[0].id);
    expect(testRes.success).toBe(true);
    expect(testRes.latencyMs).toBeGreaterThan(0);

    const newPrinter = backofficeService.addPrinterDevice({
      name: 'Impresora Test Terraza',
      type: 'ESC_POS',
      ipAddress: '192.168.1.199',
      port: 9100,
      assignedZone: 'BAR',
      paperWidth: '80mm',
      status: 'ONLINE',
      autoCut: true,
      openDrawer: false,
    });
    expect(newPrinter.id).toBeDefined();
    expect(backofficeService.getTPVHardwareConfig().printers.length).toBe(hw.printers.length + 1);
  });

  it('3. Debe administrar usuarios, roles RBAC y toggle de bloqueos por seguridad', () => {
    const users = backofficeService.getAdminUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);

    const targetUser = users[0];
    const toggled = backofficeService.toggleUserLock(targetUser.id, 'TestAdmin');
    expect(toggled.isLocked).toBe(!targetUser.isLocked);

    // Toggle back
    const restored = backofficeService.toggleUserLock(targetUser.id, 'TestAdmin');
    expect(restored.isLocked).toBe(targetUser.isLocked);
  });

  it('4. Debe crear y restaurar copias de seguridad cifradas (Disaster Recovery)', () => {
    const initialCount = backofficeService.getBackups().length;
    const newBackup = backofficeService.createBackup('MANUAL', 'TestAdmin');

    expect(newBackup.fileName).toContain('.enc');
    expect(newBackup.checksumMd5).toBeDefined();
    expect(backofficeService.getBackups().length).toBe(initialCount + 1);

    const restoreRes = backofficeService.restoreBackup(newBackup.id, 'TestAdmin');
    expect(restoreRes.success).toBe(true);
    expect(restoreRes.message).toContain('verificada');
  });

  it('5. Debe simular la sincronización forzada SQLite <-> PostgreSQL', () => {
    const overview = backofficeService.forceSyncTrigger('TestAdmin');
    expect(overview.overallStatus).toBe('ONLINE_SYNCED');
    expect(overview.pendingQueueCount).toBe(0);
  });

  it('6. Debe validar y activar licencias de producto Enterprise', () => {
    const invalidRes = backofficeService.activateLicense('123', 'TestAdmin');
    expect(invalidRes.success).toBe(false);

    const validRes = backofficeService.activateLicense('ERP-ENT-2026-9999-XXXX-YYYY', 'TestAdmin');
    expect(validRes.success).toBe(true);
    expect(validRes.license.daysRemaining).toBe(730);
  });

  it('7. Debe exportar e importar la configuración global en formato JSON', () => {
    const exportedStr = backofficeService.exportAllSettings();
    expect(exportedStr).toContain('Sotium POS Enterprise');

    const importRes = backofficeService.importAllSettings(exportedStr, 'TestAdmin');
    expect(importRes.success).toBe(true);
  });

  it('8. Debe ejecutar la auditoría inteligente IA con Gemini 3.6 Flash Advisor', async () => {
    const auditRes = await adminAIService.auditConfiguration();
    expect(auditRes.healthScore).toBeGreaterThanOrEqual(0);
    expect(auditRes.healthScore).toBeLessThanOrEqual(100);
    expect(auditRes.recommendations).toBeDefined();
  });
});
