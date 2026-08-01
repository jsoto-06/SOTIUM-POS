import { Router, Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { biService } from '../../services/biService';
import { biAIService } from '../../services/biAIService';
import { AuditService } from '../../services/auditService';
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_INGREDIENTS,
  INITIAL_DELIVERY_ORDERS,
  INITIAL_RESERVATIONS,
} from '../../data/initialData';

export function createBIRouter(io?: SocketIOServer): Router {
  const router = Router();

  // Middleware to log BI API accesses to audit trail
  const auditBIAccess = (action: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const user = (req as any).user?.name || 'ADMIN_USER';
      AuditService.log({
        username: user,
        action,
        resource: 'BI_ANALYTICS',
        details: JSON.stringify({ path: req.path, query: req.query }),
      });
      next();
    };
  };

  /**
   * GET /api/v1/bi/executive
   */
  router.get('/v1/bi/executive', auditBIAccess('VIEW_EXECUTIVE_DASHBOARD'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query as any;
      const metrics = biService.getExecutiveMetrics(
        INITIAL_ORDERS,
        INITIAL_PRODUCTS,
        INITIAL_CUSTOMERS,
        INITIAL_RESERVATIONS,
        INITIAL_DELIVERY_ORDERS,
        filters
      );
      res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/bi/sales
   */
  router.get('/v1/bi/sales', auditBIAccess('VIEW_SALES_ANALYSIS'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query as any;
      const breakdown = biService.getSalesBreakdown(INITIAL_ORDERS, filters);
      res.json({ success: true, data: breakdown, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/bi/products
   */
  router.get('/v1/bi/products', auditBIAccess('VIEW_PRODUCT_ANALYTICS'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query as any;
      const metrics = biService.getProductMetrics(INITIAL_ORDERS, INITIAL_PRODUCTS, filters);
      res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/bi/customers
   */
  router.get('/v1/bi/customers', auditBIAccess('VIEW_CUSTOMER_ANALYTICS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = biService.getCustomerMetrics(INITIAL_CUSTOMERS, INITIAL_ORDERS);
      res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/bi/waiters
   */
  router.get('/v1/bi/waiters', auditBIAccess('VIEW_WAITER_PERFORMANCE'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = biService.getWaiterMetrics(INITIAL_EMPLOYEES, INITIAL_ORDERS);
      res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/bi/kitchen
   */
  router.get('/v1/bi/kitchen', auditBIAccess('VIEW_KITCHEN_PERFORMANCE'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = biService.getKitchenMetrics(INITIAL_ORDERS);
      res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/bi/inventory
   */
  router.get('/v1/bi/inventory', auditBIAccess('VIEW_INVENTORY_ANALYTICS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = biService.getInventoryMetrics(INITIAL_INGREDIENTS);
      res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/bi/delivery
   */
  router.get('/v1/bi/delivery', auditBIAccess('VIEW_DELIVERY_ANALYTICS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = biService.getDeliveryMetrics(INITIAL_DELIVERY_ORDERS);
      res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/bi/ai/predict
   */
  router.post('/v1/bi/ai/predict', auditBIAccess('RUN_GEMINI_PREDICTIONS'), async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const predictions = await biAIService.generateBIPredictions(
        INITIAL_ORDERS,
        INITIAL_PRODUCTS,
        INITIAL_INGREDIENTS,
        INITIAL_EMPLOYEES
      );

      if (io) {
        io.emit('bi:predictions-updated', { count: predictions.length, timestamp: new Date().toISOString() });
      }

      res.json({ success: true, data: predictions, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/v1/bi/export
   */
  router.post('/v1/bi/export', auditBIAccess('EXPORT_BI_REPORT'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportType, format, data } = req.body;
      const csv = biService.exportToCSV(data || []);

      res.json({
        success: true,
        reportType: reportType || 'GENERAL_BI',
        format: format || 'CSV',
        csvContent: csv,
        downloadFilename: `SotiumPOS_BI_${reportType || 'Report'}_${new Date().toISOString().split('T')[0]}.${format === 'EXCEL' ? 'csv' : 'csv'}`,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
