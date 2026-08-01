import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createIntegrationRouter } from '../server/routes/integrationRoutes';

describe('FASE 24 - Integration Express Routes HTTP API Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/api', createIntegrationRouter());

  it('1. GET /api/integrations debe retornar listado de conectores', async () => {
    const res = await request(app).get('/api/integrations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('2. GET /api/integrations?category=DELIVERY debe filtrar correctamente', async () => {
    const res = await request(app).get('/api/integrations?category=DELIVERY');
    expect(res.status).toBe(200);
    expect(res.body.data.every((c: any) => c.category === 'DELIVERY')).toBe(true);
  });

  it('3. POST /api/integrations/:id/test debe responder con latencia y status', async () => {
    const res = await request(app).post('/api/integrations/int-glovo/test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.latencyMs).toBeGreaterThan(0);
  });

  it('4. GET y POST /api/integrations/webhooks debe listar y crear webhooks', async () => {
    const listRes = await request(app).get('/api/integrations/webhooks');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const createRes = await request(app).post('/api/integrations/webhooks').send({
      integrationId: 'int-stripe',
      name: 'Stripe Payment Webhook',
      targetUrl: 'https://api.empresa.es/webhooks/stripe',
      events: ['PAYMENT_INTENT_SUCCEEDED'],
      secretKey: 'whsec_stripe_key_123',
      signatureAlgorithm: 'HMAC-SHA256',
      status: 'ACTIVE',
      maxRetries: 3,
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Stripe Payment Webhook');
  });

  it('5. GET /api/integrations/dlq debe listar eventos atascados', async () => {
    const res = await request(app).get('/api/integrations/dlq');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('6. POST /api/integrations/ai-diagnose debe ejecutar diagnóstico Gemini', async () => {
    const res = await request(app).post('/api/integrations/ai-diagnose');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.healthScore).toBeGreaterThanOrEqual(0);
  });

  it('7. GET /api/integrations/search debe buscar términos globales', async () => {
    const res = await request(app).get('/api/integrations/search?q=Glovo');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('8. GET /api/integrations/export debe retornar archivo JSON descargable', async () => {
    const res = await request(app).get('/api/integrations/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.text).toContain('connectors');
  });
});
