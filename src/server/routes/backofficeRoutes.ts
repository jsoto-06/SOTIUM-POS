import { Router, Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { backofficeService } from '../../services/backofficeService';
import { adminAIService } from '../../services/adminAIService';
import { logger } from '../../services/loggerService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export function createBackofficeRouter(io?: SocketIOServer): Router {
  const router = Router();

  const getUserName = (req: AuthenticatedRequest) => req.user?.name || req.body?.activeUser || 'Carlos Mendoza';

  // ==========================================
  // EMPRESA & CONFIGURACIÓN GLOBAL
  // ==========================================
  router.get('/admin/company', (req: Request, res: Response) => {
    try {
      const config = backofficeService.getCompanyConfig();
      return res.json({ success: true, data: config });
    } catch (err: any) {
      logger.error('[AdminAPI] Error reading company config:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.put('/admin/company', (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = backofficeService.updateCompanyConfig(req.body, getUserName(req));
      if (io) io.emit('admin:company_updated', updated);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      logger.error('[AdminAPI] Error updating company config:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // TPV HARDWARE & DISPOSITIVOS
  // ==========================================
  router.get('/admin/hardware', (req: Request, res: Response) => {
    try {
      const hw = backofficeService.getTPVHardwareConfig();
      return res.json({ success: true, data: hw });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.put('/admin/hardware', (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = backofficeService.updateTPVHardwareConfig(req.body, getUserName(req));
      if (io) io.emit('admin:hardware_updated', updated);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/hardware/printer/test', (req: Request, res: Response) => {
    try {
      const { printerId } = req.body;
      const result = backofficeService.testPrinterDevice(printerId);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // CONFIGURACIÓN GENERAL (IMPUESTOS, PAGOS)
  // ==========================================
  router.get('/admin/general', (req: Request, res: Response) => {
    try {
      const gen = backofficeService.getGeneralSettings();
      return res.json({ success: true, data: gen });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.put('/admin/general', (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = backofficeService.updateGeneralSettings(req.body, getUserName(req));
      if (io) io.emit('admin:general_updated', updated);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // USUARIOS & SEGURIDAD GRANULAR
  // ==========================================
  router.get('/admin/users', (req: Request, res: Response) => {
    try {
      const users = backofficeService.getAdminUsers();
      return res.json({ success: true, data: users });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/users', (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = backofficeService.createAdminUser(req.body, getUserName(req));
      if (io) io.emit('admin:user_created', user);
      return res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.put('/admin/users/:id', (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = backofficeService.updateAdminUser(req.params.id, req.body, getUserName(req));
      if (io) io.emit('admin:user_updated', updated);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.put('/admin/users/:id/toggle-lock', (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = backofficeService.toggleUserLock(req.params.id, getUserName(req));
      if (io) io.emit('admin:user_updated', updated);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.get('/admin/roles', (req: Request, res: Response) => {
    try {
      const roles = backofficeService.getAdminRoles();
      return res.json({ success: true, data: roles });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/roles', (req: AuthenticatedRequest, res: Response) => {
    try {
      const role = backofficeService.createAdminRole(req.body, getUserName(req));
      return res.status(201).json({ success: true, data: role });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // AUDITORÍA ENTERPRISE & LOGS
  // ==========================================
  router.get('/admin/audit-logs', (req: Request, res: Response) => {
    try {
      const { module: mod, action, search } = req.query;
      const logs = backofficeService.getAuditLogs({
        module: mod as string,
        action: action as string,
        search: search as string,
      });
      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.get('/admin/system-logs', (req: Request, res: Response) => {
    try {
      const { level, category, search } = req.query;
      const logs = backofficeService.getSystemLogs({
        level: level as any,
        category: category as any,
        search: search as string,
      });
      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // BACKUPS & DISASTER RECOVERY
  // ==========================================
  router.get('/admin/backups', (req: Request, res: Response) => {
    try {
      const backups = backofficeService.getBackups();
      const schedule = backofficeService.getBackupScheduleConfig();
      return res.json({ success: true, data: { backups, schedule } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/backups', (req: AuthenticatedRequest, res: Response) => {
    try {
      const backup = backofficeService.createBackup(req.body.type || 'MANUAL', getUserName(req));
      if (io) io.emit('admin:backup_created', backup);
      return res.status(201).json({ success: true, data: backup });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/backups/:id/restore', (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = backofficeService.restoreBackup(req.params.id, getUserName(req));
      if (io) io.emit('admin:backup_restored', result);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // SINCRONIZACIÓN & DIAGNÓSTICO
  // ==========================================
  router.get('/admin/sync', (req: Request, res: Response) => {
    try {
      const overview = backofficeService.getSyncOverview();
      return res.json({ success: true, data: overview });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/sync/trigger', (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = backofficeService.forceSyncTrigger(getUserName(req));
      if (io) io.emit('admin:sync_completed', result);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // LICENCIAS
  // ==========================================
  router.get('/admin/license', (req: Request, res: Response) => {
    try {
      const lic = backofficeService.getLicenseInfo();
      return res.json({ success: true, data: lic });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/license/activate', (req: AuthenticatedRequest, res: Response) => {
    try {
      const { licenseKey } = req.body;
      const result = backofficeService.activateLicense(licenseKey, getUserName(req));
      if (io) io.emit('admin:license_updated', result.license);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // IA GEMINI CONFIG ADVISOR
  // ==========================================
  router.post('/admin/ai-advisor/audit', async (req: Request, res: Response) => {
    try {
      const auditResult = await adminAIService.auditConfiguration();
      return res.json({ success: true, data: auditResult });
    } catch (err: any) {
      logger.error('[AdminAPI] Error running AI Audit:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // EXPORT / IMPORT
  // ==========================================
  router.get('/admin/export', (req: Request, res: Response) => {
    try {
      const content = backofficeService.exportAllSettings();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="SotiumPOS_Global_Settings.json"');
      return res.send(content);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/admin/import', (req: AuthenticatedRequest, res: Response) => {
    try {
      const { jsonContent } = req.body;
      const result = backofficeService.importAllSettings(jsonContent, getUserName(req));
      if (io) io.emit('admin:settings_imported', result);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  return router;
}
