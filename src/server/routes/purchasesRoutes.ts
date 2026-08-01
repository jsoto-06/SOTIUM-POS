import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { AuditService } from '../../services/auditService';

export function createPurchasesRouter(io: SocketIOServer): Router {
  const router = Router();

  router.get('/purchases/suppliers', (_req, res) => {
    res.json({ success: true, count: 4, message: 'Catálogo de Proveedores Enterprise' });
  });

  router.post('/purchases/suppliers', (req, res) => {
    const supplier = req.body;
    AuditService.log({
      username: 'SYSTEM_PURCHASES',
      action: 'SUPPLIER_CREATE',
      resource: 'Purchases',
      details: `Proveedor ${supplier.socialName} (${supplier.cifNif}) registrado`,
      ipAddress: req.ip,
    });
    res.json({ success: true, supplier });
  });

  router.get('/purchases/orders', (_req, res) => {
    res.json({ success: true, count: 3, message: 'Pedidos de compra registrados' });
  });

  router.post('/purchases/orders', (req, res) => {
    const order = req.body;
    io.emit('purchases:order', order);
    AuditService.log({
      username: order.createdBy || 'SYSTEM_PURCHASES',
      action: 'ORDER_CREATE',
      resource: 'Purchases',
      details: `Pedido de compra ${order.orderNumber} creado para proveedor ${order.supplierName}`,
      ipAddress: req.ip,
    });
    res.json({ success: true, order });
  });

  router.post('/purchases/reception', (req, res) => {
    const { orderId, receivedLines } = req.body;
    io.emit('purchases:reception', { orderId, receivedLines });
    AuditService.log({
      username: 'SYSTEM_PURCHASES',
      action: 'ORDER_RECEPTION',
      resource: 'Purchases',
      details: `Mercancía recepcionada para pedido ${orderId}`,
      ipAddress: req.ip,
    });
    res.json({ success: true, orderId });
  });

  router.get('/purchases/invoices', (_req, res) => {
    res.json({ success: true, count: 2, message: 'Facturas de proveedores' });
  });

  router.get('/purchases/requests', (_req, res) => {
    res.json({ success: true, count: 1, message: 'Solicitudes de compra registradas' });
  });

  router.post('/purchases/requests', (req, res) => {
    const request = req.body;
    io.emit('purchases:request', request);
    AuditService.log({
      username: request.requestorName || 'SYSTEM_PURCHASES',
      action: 'PURCHASE_REQUEST_CREATE',
      resource: 'Purchases',
      details: `Solicitud de compra ${request.requestCode} creada por departamento ${request.department}`,
      ipAddress: req.ip,
    });
    res.json({ success: true, request });
  });

  router.post('/purchases/reconciliation/three-way', (req, res) => {
    const { order, deliveryNote, invoice } = req.body;
    AuditService.log({
      username: 'SYSTEM_PURCHASES',
      action: 'THREE_WAY_RECONCILIATION',
      resource: 'Purchases',
      details: `Conciliación tripartita procesada para pedido ${order?.orderNumber}`,
      ipAddress: req.ip,
    });
    res.json({ success: true, message: 'Conciliación realizada' });
  });

  router.get('/purchases/ai/anomalies', (_req, res) => {
    res.json({
      success: true,
      anomalies: [
        {
          id: 'anom-1',
          type: 'SOBRECOSTE_PRECIO',
          articleName: 'Solomillo de Vaca Madurada D.O. Guadarrama',
          supplierName: 'Distribuciones Cárnicas Sierra Guadarrama S.L.',
          expectedPrice: 20.0,
          actualPrice: 22.5,
          variancePercent: 12.5,
          recommendation: 'Sobrecoste del 12.5% respecto al precio de tarifa. Revisar rappels acumulados.',
        },
      ],
    });
  });

  router.get('/purchases/expirations', (_req, res) => {
    res.json({ success: true, count: 2, message: 'Vencimientos de pago pendientes' });
  });


  return router;
}
