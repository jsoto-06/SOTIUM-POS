import { Router, Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { ProductionService } from '../../services/productionService';
import { ProductionAIService } from '../../services/productionAIService';
import { AuditService } from '../../services/auditService';
import {
  INITIAL_RECIPES,
  INITIAL_PRODUCTION_ORDERS,
  INITIAL_PRODUCTION_BATCHES,
  INITIAL_PRODUCTION_WASTE,
  INITIAL_PRODUCTION_PLANS,
} from '../../data/productionData';

export function createProductionRouter(io: SocketIOServer) {
  const router = Router();

  let recipes = [...INITIAL_RECIPES];
  let orders = [...INITIAL_PRODUCTION_ORDERS];
  let batches = [...INITIAL_PRODUCTION_BATCHES];
  let wasteRecords = [...INITIAL_PRODUCTION_WASTE];
  let plans = [...INITIAL_PRODUCTION_PLANS];

  // GET /api/production/recipes
  router.get('/production/recipes', (req: Request, res: Response) => {
    res.json({ success: true, count: recipes.length, recipes });
  });

  // POST /api/production/recipes
  router.post('/production/recipes', (req: Request, res: Response) => {
    try {
      const created = ProductionService.createRecipe(req.body);
      recipes.unshift(created);
      io.emit('production:recipe:created', created);
      AuditService.log({
        username: (req as any).user?.username || 'JEFE_COCINA',
        action: 'PRODUCTION_RECIPE_CREATE',
        resource: 'Production',
        details: `Receta ${created.code} (${created.name}) creada`,
      });
      res.status(201).json({ success: true, recipe: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/production/orders
  router.get('/production/orders', (req: Request, res: Response) => {
    res.json({ success: true, count: orders.length, orders });
  });

  // POST /api/production/orders
  router.post('/production/orders', (req: Request, res: Response) => {
    try {
      const { recipeId, targetQuantity, targetWarehouseId, targetWarehouseName, operatorName } = req.body;
      const recipe = recipes.find((r) => r.id === recipeId) || recipes[0];
      const newOrder = ProductionService.createProductionOrder(
        recipe,
        targetQuantity || 10,
        targetWarehouseId || 'wh-001',
        targetWarehouseName || 'Almacén Principal',
        operatorName || 'Operario Cocina'
      );
      orders.unshift(newOrder);
      io.emit('production:order:created', newOrder);
      res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // POST /api/production/orders/:id/finalize
  router.post('/production/orders/:id/finalize', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { actualObtainedQuantity, operatorName } = req.body;
      const order = orders.find((o) => o.id === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden de producción no encontrada' });
      }

      const recipe = recipes.find((r) => r.id === order.recipeId) || recipes[0];
      const { updatedOrder, newBatch } = ProductionService.finalizeProductionOrder(
        order,
        recipe,
        actualObtainedQuantity || order.targetQuantity,
        operatorName || order.operatorName
      );

      orders = orders.map((o) => (o.id === id ? updatedOrder : o));
      batches.unshift(newBatch);

      io.emit('production:order:finalized', { order: updatedOrder, batch: newBatch });
      res.json({ success: true, order: updatedOrder, batch: newBatch });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/production/batches
  router.get('/production/batches', (req: Request, res: Response) => {
    res.json({ success: true, count: batches.length, batches });
  });

  // GET /api/production/waste
  router.get('/production/waste', (req: Request, res: Response) => {
    res.json({ success: true, count: wasteRecords.length, wasteRecords });
  });

  // POST /api/production/waste
  router.post('/production/waste', (req: Request, res: Response) => {
    try {
      const newWaste = ProductionService.registerWaste(req.body);
      wasteRecords.unshift(newWaste);
      io.emit('production:waste:registered', newWaste);
      res.status(201).json({ success: true, waste: newWaste });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // GET /api/production/ai-insights
  router.get('/production/ai-insights', async (req: Request, res: Response) => {
    try {
      const insights = await ProductionAIService.generateProductionInsights(recipes, orders, batches, wasteRecords);
      res.json({ success: true, count: insights.length, insights });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
