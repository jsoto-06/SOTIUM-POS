import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { AuditService } from '../../services/auditService';

export function createInventoryRouter(io: SocketIOServer): Router {
  const router = Router();

  router.get('/inventory/articles', (_req, res) => {
    res.json({ success: true, count: 10, message: 'Inventario Enterprise listo en tiempo real' });
  });

  router.post('/inventory/articles', (req, res) => {
    const article = req.body;
    AuditService.log({
      username: 'SYSTEM_INVENTORY',
      action: 'ARTICLE_CREATE',
      resource: 'Inventory',
      details: `Artículo ${article.name || 'Nuevo'} registrado en catálogo Enterprise`,
      ipAddress: req.ip,
    });
    res.json({ success: true, article });
  });

  router.get('/inventory/warehouses', (_req, res) => {
    res.json({ success: true, warehousesCount: 7 });
  });

  router.post('/inventory/movements', (req, res) => {
    const movement = req.body;
    io.emit('inventory:movement', movement);
    AuditService.log({
      username: movement.user || 'SYSTEM_INVENTORY',
      action: 'STOCK_MOVEMENT',
      resource: 'Inventory',
      details: `Movimiento ${movement.type}: ${movement.quantity} ${movement.articleName}`,
      ipAddress: req.ip,
    });
    res.json({ success: true, movement });
  });

  router.post('/inventory/transfers', (req, res) => {
    const transfer = req.body;
    io.emit('inventory:transfer', transfer);
    AuditService.log({
      username: transfer.requestedBy || 'SYSTEM_INVENTORY',
      action: 'WAREHOUSE_TRANSFER',
      resource: 'Inventory',
      details: `Traspaso ${transfer.transferNumber} de ${transfer.sourceWarehouseName} a ${transfer.targetWarehouseName}`,
      ipAddress: req.ip,
    });
    res.json({ success: true, transfer });
  });

  return router;
}
