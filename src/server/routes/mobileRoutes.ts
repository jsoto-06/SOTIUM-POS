import { Router } from 'express';
import { z } from 'zod';
import { Server as SocketIOServer } from 'socket.io';
import { AuthService } from '../../services/authService';
import { MobileService } from '../../services/mobileService';
import { MobileAIService } from '../../services/mobileAIService';
import { AuditService } from '../../services/auditService';
import { logger } from '../../services/loggerService';

export function createMobileRouter(io?: SocketIOServer) {
  const router = Router();

  // POST /api/mobile/auth/login - Mobile JWT Login
  router.post('/mobile/auth/login', async (req, res) => {
    try {
      const schema = z.object({
        username: z.string().min(1),
        password: z.string().optional(),
        pin: z.string().optional(),
      });
      const parsed = schema.parse(req.body);

      // Verify token payload mock/authentic
      const token = AuthService.generateToken({
        userId: `USR-${Date.now()}`,
        username: parsed.username,
        role: parsed.username.toLowerCase().includes('camarero')
          ? 'WAITER'
          : parsed.username.toLowerCase().includes('cocina')
          ? 'KITCHEN'
          : parsed.username.toLowerCase().includes('repartidor')
          ? 'DELIVERY'
          : 'EXECUTIVE',
        name: parsed.username,
      });

      AuditService.log({
        action: 'MOBILE_JWT_LOGIN',
        username: parsed.username,
        resource: 'MobileAuth',
        details: 'Inicio de sesión JWT exitoso en dispositivo móvil',
      });

      res.json({
        success: true,
        token,
        user: {
          username: parsed.username,
          role: parsed.username.toLowerCase().includes('camarero') ? 'WAITER' : 'EXECUTIVE',
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/mobile/auth/change-shift - Change shift
  router.post('/mobile/auth/change-shift', (req, res) => {
    try {
      const schema = z.object({
        shiftName: z.string(),
        employeeName: z.string(),
      });
      const parsed = schema.parse(req.body);

      AuditService.log({
        action: 'MOBILE_SHIFT_CHANGE',
        username: parsed.employeeName,
        resource: 'MobileAuth',
        details: `Cambio de turno realizado a: ${parsed.shiftName}`,
      });

      if (io) {
        io.emit('mobile:shift_changed', parsed);
      }

      res.json({ success: true, message: `Turno cambiado a ${parsed.shiftName}` });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/mobile/notifications - List push notifications
  router.get('/mobile/notifications', (req, res) => {
    try {
      const notifs = MobileService.getPushNotifications();
      res.json({ success: true, count: notifs.length, data: notifs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/mobile/notifications - Send push notification
  router.post('/mobile/notifications', (req, res) => {
    try {
      const schema = z.object({
        type: z.enum([
          'RESERVATION',
          'ORDER',
          'INCIDENT',
          'STOCK_CRITICAL',
          'HIGH_SALE',
          'VIP_CUSTOMER',
          'TECH_INCIDENT',
        ]),
        title: z.string().min(2),
        message: z.string().min(2),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
        payload: z.record(z.string(), z.any()).optional(),
      });
      const parsed = schema.parse(req.body);
      const notif = MobileService.sendPushNotification(
        parsed.type,
        parsed.title,
        parsed.message,
        parsed.priority || 'MEDIUM',
        parsed.payload
      );

      if (io) {
        io.emit('mobile:push_notification', notif);
      }

      res.status(201).json({ success: true, data: notif });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // PATCH /api/mobile/notifications/:id/read - Mark notification as read
  router.patch('/mobile/notifications/:id/read', (req, res) => {
    try {
      MobileService.markNotificationRead(req.params.id);
      res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/mobile/notifications - Clear notifications
  router.delete('/mobile/notifications', (req, res) => {
    try {
      MobileService.clearNotifications();
      res.json({ success: true, message: 'Notificaciones limpiadas' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/mobile/delivery/tasks - List delivery driver tasks
  router.get('/mobile/delivery/tasks', (req, res) => {
    try {
      const tasks = MobileService.getDeliveryTasks();
      res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH /api/mobile/delivery/tasks/:id/status - Update delivery status
  router.patch('/mobile/delivery/tasks/:id/status', (req, res) => {
    try {
      const schema = z.object({
        status: z.enum(['IN_TRANSIT', 'DELIVERED', 'INCIDENT']),
        signature: z.string().optional(),
        photoUrl: z.string().optional(),
        incidentReason: z.string().optional(),
      });
      const parsed = schema.parse(req.body);
      const updated = MobileService.updateDeliveryStatus(req.params.id, parsed.status, {
        signature: parsed.signature,
        photoUrl: parsed.photoUrl,
        incidentReason: parsed.incidentReason,
      });

      if (io) {
        io.emit('mobile:delivery_status_updated', updated);
      }

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/mobile/executive/kpis - Get executive KPIs
  router.get('/mobile/executive/kpis', (req, res) => {
    try {
      const kpis = MobileService.getExecutiveKPIs();
      res.json({ success: true, data: kpis });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/mobile/executive/ai-insights - AI recommendations
  router.get('/mobile/executive/ai-insights', async (req, res) => {
    try {
      const insights = await MobileAIService.getExecutiveAIInsights();
      res.json({ success: true, data: insights });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/mobile/executive/ai-query - Query AI Assistant
  router.post('/mobile/executive/ai-query', async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(2),
      });
      const parsed = schema.parse(req.body);
      const answer = await MobileAIService.answerExecutiveQuery(parsed.prompt);
      res.json({ success: true, data: answer });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/mobile/search - Global search
  router.get('/mobile/search', (req, res) => {
    try {
      const { q } = req.query;
      const results = MobileService.searchGlobal((q as string) || '');
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/mobile/export - Export mobile data
  router.get('/mobile/export', (req, res) => {
    try {
      const jsonStr = MobileService.exportMobileReport();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=mobile_enterprise_export.json');
      res.send(jsonStr);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/mobile/import - Import mobile data
  router.post('/mobile/import', (req, res) => {
    try {
      const { jsonContent } = req.body;
      if (!jsonContent) {
        return res.status(400).json({ success: false, error: 'jsonContent es requerido' });
      }
      const result = MobileService.importMobileConfig(
        typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent)
      );
      if (io && result.success) {
        io.emit('mobile:config_imported', result);
      }
      res.json({ success: result.success, message: result.message });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
