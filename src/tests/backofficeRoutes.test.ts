import { describe, it, expect } from 'vitest';
import { backofficeService } from '../services/backofficeService';

describe('FASE 23 - Integración de Lógica y Servicios de BackOffice Enterprise', () => {
  it('1. Debe responder correctamente a las operaciones de configuración de empresa', () => {
    const data = backofficeService.getCompanyConfig();
    expect(data.nif).toBeDefined();
    expect(data.verifactuEnabled).toBe(true);

    const updated = backofficeService.updateCompanyConfig({ email: 'info@sotiumpos.es' });
    expect(updated.email).toBe('info@sotiumpos.es');
  });

  it('2. Debe retornar la topología de hardware TPV e impresoras', () => {
    const hw = backofficeService.getTPVHardwareConfig();
    expect(hw.printers).toBeDefined();
    expect(hw.cashDrawers).toBeDefined();
    expect(hw.displays).toBeDefined();
  });

  it('3. Debe retornar usuarios y registros de auditoría', () => {
    const users = backofficeService.getAdminUsers();
    expect(users.length).toBeGreaterThan(0);

    const audit = backofficeService.getAuditLogs();
    expect(audit).toBeDefined();
  });

  it('4. Debe permitir la generación de backups y notificaciones', () => {
    const bak = backofficeService.createBackup('MANUAL');
    expect(bak.fileName).toContain('SotiumPOS');

    const rules = backofficeService.getNotificationRules();
    expect(rules.length).toBeGreaterThan(0);
  });
});
