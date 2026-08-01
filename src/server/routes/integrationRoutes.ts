import { Router } from 'express';
import { z } from 'zod';
import { integrationService } from '../../services/integrationService';
import { integrationAIService } from '../../services/integrationAIService';
import { logger } from '../../services/loggerService';
import { Server as SocketIOServer } from 'socket.io';

export function createIntegrationRouter(io?: SocketIOServer) {
  const router = Router();

  // GET /api/integrations - List connectors
  router.get('/integrations', (req, res) => {
    try {
      const { category, status, search } = req.query;
      const connectors = integrationService.getConnectors({
        category: category as any,
        status: status as string,
        search: search as string,
      });
      res.json({ success: true, count: connectors.length, data: connectors });
    } catch (err: any) {
      logger.error('[IntegrationRouter] Error fetching connectors:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/integrations/webhooks - List webhooks
  router.get('/integrations/webhooks', (req, res) => {
    try {
      const webhooks = integrationService.getWebhooks();
      res.json({ success: true, count: webhooks.length, data: webhooks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/webhooks - Create webhook
  router.post('/integrations/webhooks', (req, res) => {
    try {
      const schema = z.object({
        integrationId: z.string(),
        name: z.string().min(2),
        targetUrl: z.string().url(),
        events: z.array(z.string()),
        secretKey: z.string(),
        signatureAlgorithm: z.enum(['HMAC-SHA256', 'HMAC-SHA512']),
        status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR', 'PAUSED']),
        maxRetries: z.number().default(3),
      });
      const parsed = schema.parse(req.body);
      const created = integrationService.createWebhook(parsed);
      if (io) {
        io.emit('integration:webhook_created', created);
      }
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/integrations/webhooks/logs - List webhook logs
  router.get('/integrations/webhooks/logs', (req, res) => {
    try {
      const logs = integrationService.getWebhookLogs();
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/webhooks/test - Test dispatch
  router.post('/integrations/webhooks/test', (req, res) => {
    try {
      const schema = z.object({
        webhookId: z.string(),
        eventName: z.string(),
        payload: z.record(z.string(), z.any()),
      });
      const parsed = schema.parse(req.body);
      const log = integrationService.dispatchWebhookTest(parsed.webhookId, parsed.eventName, parsed.payload);
      if (io) {
        io.emit('integration:webhook_dispatched', log);
      }
      res.json({ success: true, data: log });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/integrations/oauth - List OAuth connections
  router.get('/integrations/oauth', (req, res) => {
    try {
      const connections = integrationService.getOAuthConnections();
      res.json({ success: true, count: connections.length, data: connections });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/integrations/dlq - List DLQ items
  router.get('/integrations/dlq', (req, res) => {
    try {
      const items = integrationService.getDLQItems();
      res.json({ success: true, count: items.length, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/sync/all - Trigger sync all
  router.post('/integrations/sync/all', (req, res) => {
    try {
      const resSync = integrationService.triggerSyncAll();
      if (io) {
        io.emit('integration:sync_completed', resSync);
      }
      res.json({ success: true, data: resSync });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/ai-diagnose - Gemini AI audit
  router.post('/integrations/ai-diagnose', async (req, res) => {
    try {
      const auditRes = await integrationAIService.auditIntegrationsWithAI();
      res.json({ success: true, data: auditRes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/integrations/search - Global search
  router.get('/integrations/search', (req, res) => {
    try {
      const { q } = req.query;
      const results = integrationService.searchIntegrations((q as string) || '');
      res.json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/integrations/export - Export JSON
  router.get('/integrations/export', (req, res) => {
    try {
      const jsonStr = integrationService.exportIntegrationsConfig();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=integrations_config.json');
      res.send(jsonStr);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/import - Import JSON
  router.post('/integrations/import', (req, res) => {
    try {
      const { jsonContent } = req.body;
      if (!jsonContent) {
        return res.status(400).json({ success: false, error: 'jsonContent es requerido' });
      }
      const result = integrationService.importIntegrationsConfig(
        typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent)
      );
      if (io && result.success) {
        io.emit('integration:config_imported', result);
      }
      res.json({ success: result.success, message: result.message });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/integrations/:id - Get connector details
  router.get('/integrations/:id', (req, res) => {
    try {
      const connector = integrationService.getConnectorById(req.params.id);
      if (!connector) {
        return res.status(404).json({ success: false, error: 'Conector no encontrado' });
      }
      res.json({ success: true, data: connector });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH /api/integrations/:id/toggle - Toggle active status
  router.patch('/integrations/:id/toggle', (req, res) => {
    try {
      const updated = integrationService.toggleConnector(req.params.id);
      if (io) {
        io.emit('integration:connector_updated', updated);
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // PUT /api/integrations/:id/config - Update config
  router.put('/integrations/:id/config', (req, res) => {
    try {
      const schema = z.object({
        config: z.record(z.string(), z.any()),
      });
      const parsed = schema.parse(req.body);
      const updated = integrationService.updateConnectorConfig(req.params.id, parsed.config);
      if (io) {
        io.emit('integration:connector_updated', updated);
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/:id/test - Test connection
  router.post('/integrations/:id/test', (req, res) => {
    try {
      const result = integrationService.testConnectorConnection(req.params.id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/oauth/:id/refresh - Refresh token
  router.post('/integrations/oauth/:id/refresh', (req, res) => {
    try {
      const updated = integrationService.refreshOAuthToken(req.params.id);
      if (io) {
        io.emit('integration:oauth_refreshed', updated);
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/oauth/:id/revoke - Revoke token
  router.post('/integrations/oauth/:id/revoke', (req, res) => {
    try {
      const updated = integrationService.revokeOAuthToken(req.params.id);
      if (io) {
        io.emit('integration:oauth_revoked', updated);
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/integrations/dlq/:id/retry - Retry DLQ item
  router.post('/integrations/dlq/:id/retry', (req, res) => {
    try {
      const item = integrationService.retryDLQItem(req.params.id);
      if (io) {
        io.emit('integration:dlq_retried', item);
      }
      res.json({ success: true, data: item });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/integrations/dlq/:id - Purge DLQ item
  router.delete('/integrations/dlq/:id', (req, res) => {
    try {
      integrationService.purgeDLQItem(req.params.id);
      if (io) {
        io.emit('integration:dlq_purged', { id: req.params.id });
      }
      res.json({ success: true, message: 'Elemento purgado' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  return router;
}
