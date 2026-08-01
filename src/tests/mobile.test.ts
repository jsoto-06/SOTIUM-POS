import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { MobileService } from '../services/mobileService';
import { MobileAIService } from '../services/mobileAIService';
import { createMobileRouter } from '../server/routes/mobileRoutes';

describe('FASE 25 & 26: Ecosistema Móvil y Hardening Tests', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    MobileService.clearMemoryStore();
  });

  describe('MobileService Unit Tests', () => {
    it('debe obtener las notificaciones push por defecto', () => {
      const notifs = MobileService.getPushNotifications();
      expect(Array.isArray(notifs)).toBe(true);
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs[0]).toHaveProperty('title');
      expect(notifs[0]).toHaveProperty('type');
    });

    it('debe enviar una nueva notificación push y persistirla', () => {
      const notif = MobileService.sendPushNotification(
        'STOCK_CRITICAL',
        'Sin Existencias Jamón',
        'Queda 1 kg de Jamón Ibérico',
        'CRITICAL',
        { itemId: 'ITEM-99' },
        'TEST_USER'
      );
      expect(notif.id).toContain('NOTIF-');
      expect(notif.priority).toBe('CRITICAL');

      const notifs = MobileService.getPushNotifications();
      expect(notifs[0].id).toBe(notif.id);
      expect(notifs[0].title).toBe('Sin Existencias Jamón');
    });

    it('debe marcar una notificación como leída y permitir limpiar todas', () => {
      const notif = MobileService.sendPushNotification('INCIDENT', 'Test Incident', 'Msg Test');
      MobileService.markNotificationRead(notif.id);

      const notifs = MobileService.getPushNotifications();
      const target = notifs.find((n) => n.id === notif.id);
      expect(target?.read).toBe(true);

      MobileService.clearNotifications();
      expect(MobileService.getPushNotifications().length).toBe(0);
    });

    it('debe gestionar las tareas de reparto de repartidores', () => {
      const tasks = MobileService.getDeliveryTasks();
      expect(tasks.length).toBeGreaterThan(0);
      const taskId = tasks[0].id;

      const updated = MobileService.updateDeliveryStatus(taskId, 'DELIVERED', {
        signature: 'Firma Cliente Test',
      });
      expect(updated.status).toBe('DELIVERED');
      expect(updated.signature).toBe('Firma Cliente Test');
      expect(updated.deliveredAt).toBeDefined();
    });

    it('debe realizar búsquedas globales en el ecosistema móvil', () => {
      const results = MobileService.searchGlobal('Mesa');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('TABLE');

      const emptyResults = MobileService.searchGlobal('xzy_non_existent_term');
      expect(emptyResults.length).toBe(0);
    });

    it('debe exportar e importar datos JSON del ecosistema móvil', () => {
      const jsonStr = MobileService.exportMobileReport();
      expect(jsonStr).toContain('Sotium POS Enterprise Mobile Suite');

      const importRes = MobileService.importMobileConfig(jsonStr);
      expect(importRes.success).toBe(true);
    });
  });

  describe('MobileAIService Unit Tests', () => {
    it('debe obtener recomendaciones ejecutivas de la IA Gemini', async () => {
      const insights = await MobileAIService.getExecutiveAIInsights();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('recommendation');
      expect(insights[0]).toHaveProperty('explanation');
    });

    it('debe responder consultas ejecutivas con contexto de KPIs', async () => {
      const res = await MobileAIService.answerExecutiveQuery('¿Cómo reducir mermas en cocina?');
      expect(res.answer).toBeDefined();
      expect(res.explanation).toBeDefined();
      expect(Array.isArray(res.kpisTriggered)).toBe(true);
    });
  });

  describe('Mobile HTTP Routes Integration Tests', () => {
    const app = express();
    app.use(express.json());
    app.use('/api', createMobileRouter());

    it('POST /api/mobile/auth/login - Debe autenticar a un usuario móvil y retornar JWT', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/login')
        .send({ username: 'camarero_mario', pin: '1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('WAITER');
    });

    it('POST /api/mobile/auth/change-shift - Debe registrar cambio de turno', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/change-shift')
        .send({ shiftName: 'Turno Noche', employeeName: 'Carlos Camarero' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/mobile/notifications - Debe listar notificaciones push', async () => {
      const res = await request(app).get('/api/mobile/notifications');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/mobile/notifications - Debe crear notificación push', async () => {
      const res = await request(app)
        .post('/api/mobile/notifications')
        .send({
          type: 'INCIDENT',
          title: 'Aviso Alérgenos',
          message: 'Mesa 4 solicita plato celíaco',
          priority: 'HIGH',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Aviso Alérgenos');
    });

    it('GET /api/mobile/delivery/tasks - Debe obtener lista de entregas', async () => {
      const res = await request(app).get('/api/mobile/delivery/tasks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/mobile/executive/kpis - Debe retornar KPIs de gerencia', async () => {
      const res = await request(app).get('/api/mobile/executive/kpis');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/mobile/search - Debe realizar búsqueda global por query', async () => {
      const res = await request(app).get('/api/mobile/search?q=Vino');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
