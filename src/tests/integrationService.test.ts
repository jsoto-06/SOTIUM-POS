import { describe, it, expect, beforeEach } from 'vitest';
import { integrationService } from '../services/integrationService';
import { integrationAIService } from '../services/integrationAIService';

describe('FASE 24 - Plataforma Enterprise de Integraciones Tests', () => {
  beforeEach(() => {
    // Reset defaults if needed
  });

  it('1. Debe listar y filtrar conectores por categoría (Delivery, Pagos, Facturación, etc.)', () => {
    const delivery = integrationService.getConnectors({ category: 'DELIVERY' });
    expect(delivery.length).toBeGreaterThanOrEqual(8);
    expect(delivery.some((c) => c.code === 'GLOVO')).toBe(true);
    expect(delivery.some((c) => c.code === 'UBEREATS')).toBe(true);

    const pagos = integrationService.getConnectors({ category: 'PAGOS' });
    expect(pagos.some((c) => c.code === 'RESDYS' || c.code === 'REDSYS')).toBe(true);
    expect(pagos.some((c) => c.code === 'STRIPE')).toBe(true);
  });

  it('2. Debe permitir activar/desactivar y actualizar la configuración de un conector', () => {
    const glovo = integrationService.getConnectorById('int-glovo');
    expect(glovo).toBeDefined();

    const toggled = integrationService.toggleConnector('int-glovo');
    expect(toggled.enabled).toBe(false);

    const reToggled = integrationService.toggleConnector('int-glovo');
    expect(reToggled.enabled).toBe(true);

    const updated = integrationService.updateConnectorConfig('int-glovo', { autoAcceptOrders: false, apiKey: 'new_key_123' });
    expect(updated.config.autoAcceptOrders).toBe(false);
    expect(updated.config.apiKey).toBe('new_key_123');
  });

  it('3. Debe ejecutar pruebas de latencia/ping en conectores activos', () => {
    const res = integrationService.testConnectorConnection('int-redsys');
    expect(res.success).toBe(true);
    expect(res.latencyMs).toBeGreaterThan(0);
    expect(res.message).toContain('verificada con éxito');
  });

  it('4. Debe administrar el ciclo de vida de Webhooks Endpoints y disparar tests', () => {
    const newWh = integrationService.createWebhook({
      integrationId: 'int-glovo',
      name: 'Webhook Test Delivery',
      targetUrl: 'https://api.test.es/webhooks',
      events: ['ORDER_NEW'],
      secretKey: 'whsec_secret_123',
      signatureAlgorithm: 'HMAC-SHA256',
      status: 'ACTIVE',
      maxRetries: 3,
    });
    expect(newWh.id).toBeDefined();

    const log = integrationService.dispatchWebhookTest(newWh.id, 'ORDER_NEW', { orderId: 'ORD-999' });
    expect(log.responseStatus).toBe(200);
    expect(log.signatureValid).toBe(true);
    expect(log.event).toBe('ORDER_NEW');
  });

  it('5. Debe administrar conexiones y tokens OAuth2 (renovación y revocación)', () => {
    const oauthList = integrationService.getOAuthConnections();
    expect(oauthList.length).toBeGreaterThan(0);

    const target = oauthList[0];
    const refreshed = integrationService.refreshOAuthToken(target.id);
    expect(refreshed.status).toBe('ACTIVE');

    const revoked = integrationService.revokeOAuthToken(target.id);
    expect(revoked.status).toBe('REVOKED');
  });

  it('6. Debe procesar reintentos y purgas en Dead Letter Queue (DLQ)', () => {
    const items = integrationService.getDLQItems();
    expect(items.length).toBeGreaterThan(0);

    const first = items[0];
    const retried = integrationService.retryDLQItem(first.id);
    expect(retried.status).toBe('RESOLVED');

    const prevLength = items.length;
    integrationService.purgeDLQItem(first.id);
    expect(integrationService.getDLQItems().length).toBe(prevLength - 1);
  });

  it('7. Debe ejecutar la auditoría inteligente IA con Gemini 3.6 Flash para la plataforma', async () => {
    const diagnosis = await integrationAIService.auditIntegrationsWithAI();
    expect(diagnosis.healthScore).toBeGreaterThanOrEqual(0);
    expect(diagnosis.summary).toBeDefined();
    expect(Array.isArray(diagnosis.optimizationTips)).toBe(true);
  });

  it('8. Debe permitir la búsqueda global de integraciones y exportación/importación JSON', () => {
    const searchRes = integrationService.searchIntegrations('Glovo');
    expect(searchRes.length).toBeGreaterThan(0);

    const jsonExport = integrationService.exportIntegrationsConfig();
    expect(jsonExport).toContain('connectors');

    const importRes = integrationService.importIntegrationsConfig(jsonExport);
    expect(importRes.success).toBe(true);
  });
});
