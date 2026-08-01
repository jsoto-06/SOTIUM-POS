import { Router, Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { MaintenanceService } from '../../services/maintenanceService';
import { MaintenanceAIService } from '../../services/maintenanceAIService';
import { logger } from '../../services/loggerService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export function createMaintenanceRouter(io?: SocketIOServer): Router {
  const router = Router();

  // ==========================================
  // ACTIVOS (ASSETS)
  // ==========================================
  router.get('/maintenance/assets', (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;
      if (q) {
        const assets = MaintenanceService.searchAssets(q);
        return res.json({ success: true, data: assets });
      }
      const assets = MaintenanceService.getAssets();
      return res.json({ success: true, data: assets });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error fetching assets:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/assets', (req: AuthenticatedRequest, res: Response) => {
    try {
      const newAsset = MaintenanceService.createAsset(req.body, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:asset_created', newAsset);
      return res.status(201).json({ success: true, data: newAsset });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error creating asset:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.put('/maintenance/assets/:id', (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = MaintenanceService.updateAsset(req.params.id, req.body, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:asset_updated', updated);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error updating asset:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.delete('/maintenance/assets/:id', (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = MaintenanceService.deleteAsset(req.params.id, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:asset_deleted', { id: req.params.id });
      return res.json({ success: true, data: deleted });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error deleting asset:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // PLANES PREVENTIVOS
  // ==========================================
  router.get('/maintenance/preventive-plans', (req: Request, res: Response) => {
    try {
      const plans = MaintenanceService.getPreventivePlans();
      return res.json({ success: true, data: plans });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error fetching preventive plans:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/preventive-plans', (req: AuthenticatedRequest, res: Response) => {
    try {
      const plan = MaintenanceService.createPreventivePlan(req.body, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:plan_created', plan);
      return res.status(201).json({ success: true, data: plan });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error creating preventive plan:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/preventive-plans/:id/execute', (req: AuthenticatedRequest, res: Response) => {
    try {
      const { executionDate, notes } = req.body;
      const workOrder = MaintenanceService.executePreventivePlan(
        req.params.id,
        executionDate || new Date().toISOString().split('T')[0],
        notes,
        req.user?.name || 'Operador API'
      );
      if (io) io.emit('maintenance:workorder_created', workOrder);
      return res.json({ success: true, data: workOrder });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error executing preventive plan:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // INCIDENCIAS & AVERÍAS CORRECTIVAS
  // ==========================================
  router.get('/maintenance/incidents', (req: Request, res: Response) => {
    try {
      const incidents = MaintenanceService.getIncidents();
      return res.json({ success: true, data: incidents });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error fetching incidents:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/incidents', (req: AuthenticatedRequest, res: Response) => {
    try {
      const incident = MaintenanceService.createIncident(req.body, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:incident_created', incident);
      return res.status(201).json({ success: true, data: incident });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error creating incident:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/incidents/:id/close', (req: AuthenticatedRequest, res: Response) => {
    try {
      const { notes } = req.body;
      const closed = MaintenanceService.closeIncident(req.params.id, notes, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:incident_closed', closed);
      return res.json({ success: true, data: closed });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error closing incident:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // ÓRDENES DE TRABAJO (OT)
  // ==========================================
  router.get('/maintenance/work-orders', (req: Request, res: Response) => {
    try {
      const workOrders = MaintenanceService.getWorkOrders();
      return res.json({ success: true, data: workOrders });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error fetching work orders:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/work-orders', (req: AuthenticatedRequest, res: Response) => {
    try {
      const wo = MaintenanceService.createWorkOrder(req.body, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:workorder_created', wo);
      return res.status(201).json({ success: true, data: wo });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error creating work order:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.put('/maintenance/work-orders/:id/status', (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      const updated = MaintenanceService.updateWorkOrderStatus(req.params.id, status, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:workorder_updated', updated);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error updating work order status:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // SAT & SERVICIO TÉCNICO OFICIAL
  // ==========================================
  router.get('/maintenance/sat-interventions', (req: Request, res: Response) => {
    try {
      const sats = MaintenanceService.getSATInterventions();
      return res.json({ success: true, data: sats });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error fetching SAT interventions:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/sat-interventions', (req: AuthenticatedRequest, res: Response) => {
    try {
      const sat = MaintenanceService.createSATIntervention(req.body, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:sat_created', sat);
      return res.status(201).json({ success: true, data: sat });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error creating SAT intervention:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // ALMACÉN DE REPUESTOS
  // ==========================================
  router.get('/maintenance/spare-parts', (req: Request, res: Response) => {
    try {
      const parts = MaintenanceService.getSpareParts();
      return res.json({ success: true, data: parts });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error fetching spare parts:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/spare-parts', (req: AuthenticatedRequest, res: Response) => {
    try {
      const part = MaintenanceService.createSparePart(req.body, req.user?.name || 'Operador API');
      if (io) io.emit('maintenance:sparepart_created', part);
      return res.status(201).json({ success: true, data: part });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error creating spare part:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  router.post('/maintenance/spare-parts/:id/consume', (req: AuthenticatedRequest, res: Response) => {
    try {
      const { quantity, reason } = req.body;
      const part = MaintenanceService.consumeSparePart(
        req.params.id,
        quantity || 1,
        reason || 'Consumo directo',
        req.user?.name || 'Operador API'
      );
      if (io) io.emit('maintenance:sparepart_updated', part);
      return res.json({ success: true, data: part });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error consuming spare part:', err?.message);
      return res.status(400).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // IA GEMINI PREDICTIVA
  // ==========================================
  router.get('/maintenance/ai-insights', async (req: Request, res: Response) => {
    try {
      const assets = MaintenanceService.getAssets();
      const incidents = MaintenanceService.getIncidents();
      const workOrders = MaintenanceService.getWorkOrders();
      const insights = await MaintenanceAIService.analyzeAssetMaintenance(assets, incidents, workOrders);
      return res.json({ success: true, data: insights });
    } catch (err: any) {
      logger.error('[MaintenanceAPI] Error generating AI insights:', err?.message);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  return router;
}
