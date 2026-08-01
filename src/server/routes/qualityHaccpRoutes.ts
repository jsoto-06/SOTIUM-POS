import { Router, Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { QualityHaccpAIService } from '../../services/qualityHaccpAIService';

export function createQualityHaccpRouter(io?: SocketIOServer): Router {
  const router = Router();

  // ==========================================
  // APPCC / HACCP PLANS & PCCS
  // ==========================================
  router.get('/quality/haccp', (_req: Request, res: Response) => {
    try {
      const plans = QualityHaccpService.getHACCPPlans();
      res.json({ success: true, data: plans });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/haccp', (req: Request, res: Response) => {
    try {
      const plan = QualityHaccpService.createHACCPPlan(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:haccp_update', plan);
      res.status(201).json({ success: true, data: plan });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/haccp/:planId/pcc', (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const plan = QualityHaccpService.addPCCtoPlan(planId, req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:haccp_update', plan);
      res.json({ success: true, data: plan });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // CONTROL DE TEMPERATURAS
  // ==========================================
  router.get('/quality/temperatures/equipment', (_req: Request, res: Response) => {
    try {
      const equipment = QualityHaccpService.getTemperatureEquipment();
      res.json({ success: true, data: equipment });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/temperatures/equipment', (req: Request, res: Response) => {
    try {
      const eq = QualityHaccpService.createTemperatureEquipment(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:equipment_update', eq);
      res.status(201).json({ success: true, data: eq });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.get('/quality/temperatures/logs', (_req: Request, res: Response) => {
    try {
      const logs = QualityHaccpService.getTemperatureLogs();
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/temperatures/logs', (req: Request, res: Response) => {
    try {
      const { equipmentId, temperature, operatorName, notes, photoUrl, digitalSignature, user } = req.body;
      const result = QualityHaccpService.logTemperature(
        equipmentId,
        temperature,
        operatorName,
        notes,
        photoUrl,
        digitalSignature,
        user
      );

      if (io) {
        io.emit('quality:temperature_log', result.log);
        if (result.alertTriggered) {
          io.emit('quality:temp_alert', { log: result.log, message: '¡Temperatura fuera de límites de seguridad!' });
        }
      }

      res.status(201).json({ success: true, data: result.log, alertTriggered: result.alertTriggered });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // LIMPIEZA Y DESINFECCIÓN
  // ==========================================
  router.get('/quality/cleaning/plans', (_req: Request, res: Response) => {
    try {
      const plans = QualityHaccpService.getCleaningPlans();
      res.json({ success: true, data: plans });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/cleaning/plans', (req: Request, res: Response) => {
    try {
      const plan = QualityHaccpService.createCleaningPlan(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:cleaning_plan_update', plan);
      res.status(201).json({ success: true, data: plan });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.get('/quality/cleaning/logs', (_req: Request, res: Response) => {
    try {
      const logs = QualityHaccpService.getCleaningLogs();
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/cleaning/logs', (req: Request, res: Response) => {
    try {
      const { planId, operatorName, checklistCompleted, notes, photoUrl, digitalSignature, user } = req.body;
      const log = QualityHaccpService.recordCleaningExecution(
        planId,
        operatorName,
        checklistCompleted,
        notes,
        photoUrl,
        digitalSignature,
        user
      );

      if (io) io.emit('quality:cleaning_log', log);
      res.status(201).json({ success: true, data: log });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // CHECKLISTS SANITARIOS
  // ==========================================
  router.get('/quality/checklists/templates', (_req: Request, res: Response) => {
    try {
      const templates = QualityHaccpService.getChecklistTemplates();
      res.json({ success: true, data: templates });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/quality/checklists/executions', (_req: Request, res: Response) => {
    try {
      const executions = QualityHaccpService.getChecklistExecutions();
      res.json({ success: true, data: executions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/checklists/execute', (req: Request, res: Response) => {
    try {
      const { templateId, operatorName, answers, user } = req.body;
      const execution = QualityHaccpService.executeChecklist(templateId, operatorName, answers, user);
      if (io) io.emit('quality:checklist_execution', execution);
      res.status(201).json({ success: true, data: execution });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // TRAZABILIDAD ALIMENTARIA (LOTES & FEFO)
  // ==========================================
  router.get('/quality/traceability/lots', (_req: Request, res: Response) => {
    try {
      const lots = QualityHaccpService.getFoodLots();
      res.json({ success: true, data: lots });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/traceability/lots', (req: Request, res: Response) => {
    try {
      const lot = QualityHaccpService.createFoodLot(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:lot_created', lot);
      res.status(201).json({ success: true, data: lot });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.get('/quality/traceability/fefo', (_req: Request, res: Response) => {
    try {
      const fefo = QualityHaccpService.getFEFORecommendations();
      res.json({ success: true, data: fefo });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/traceability/recall', (req: Request, res: Response) => {
    try {
      const { lotId, reason, user } = req.body;
      const lot = QualityHaccpService.triggerLotRecall(lotId, reason, user);
      if (io) io.emit('quality:sanitary_recall_alert', { lot, reason });
      res.json({ success: true, data: lot });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // ALÉRGENOS 14 EU
  // ==========================================
  router.get('/quality/allergens', (_req: Request, res: Response) => {
    try {
      const dishAllergens = QualityHaccpService.getDishAllergens();
      res.json({ success: true, data: dishAllergens });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/allergens', (req: Request, res: Response) => {
    try {
      const dishInfo = QualityHaccpService.updateDishAllergens(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:allergens_update', dishInfo);
      res.json({ success: true, data: dishInfo });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // AUDITORÍAS E INSPECCIONES
  // ==========================================
  router.get('/quality/audits', (_req: Request, res: Response) => {
    try {
      const audits = QualityHaccpService.getSanitaryAudits();
      res.json({ success: true, data: audits });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/audits', (req: Request, res: Response) => {
    try {
      const audit = QualityHaccpService.createSanitaryAudit(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:audit_update', audit);
      res.status(201).json({ success: true, data: audit });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/audits/:auditId/non-conformity', (req: Request, res: Response) => {
    try {
      const { auditId } = req.params;
      const audit = QualityHaccpService.addNonConformity(auditId, req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:audit_update', audit);
      res.json({ success: true, data: audit });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/audits/:auditId/resolve-nc', (req: Request, res: Response) => {
    try {
      const { auditId } = req.params;
      const { ncId, user } = req.body;
      const audit = QualityHaccpService.resolveNonConformity(auditId, ncId, user);
      if (io) io.emit('quality:audit_update', audit);
      res.json({ success: true, data: audit });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // CERTIFICADOS SANITARIOS DE PROVEEDORES
  // ==========================================
  router.get('/quality/suppliers/certs', (_req: Request, res: Response) => {
    try {
      const certs = QualityHaccpService.getSupplierCerts();
      res.json({ success: true, data: certs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/suppliers/certs', (req: Request, res: Response) => {
    try {
      const cert = QualityHaccpService.createSupplierCert(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:supplier_cert_update', cert);
      res.status(201).json({ success: true, data: cert });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // DOCUMENTACIÓN Y PROCEDIMIENTOS
  // ==========================================
  router.get('/quality/documents', (_req: Request, res: Response) => {
    try {
      const docs = QualityHaccpService.getQualityDocs();
      res.json({ success: true, data: docs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/quality/documents', (req: Request, res: Response) => {
    try {
      const doc = QualityHaccpService.createQualityDoc(req.body, req.body.user || 'API_User');
      if (io) io.emit('quality:doc_update', doc);
      res.status(201).json({ success: true, data: doc });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // IA & EXPORT
  // ==========================================
  router.get('/quality/ai-analyze', async (_req: Request, res: Response) => {
    try {
      const result = await QualityHaccpAIService.analyzeFoodSafetyStatus();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/quality/export/temp-csv', (_req: Request, res: Response) => {
    try {
      const csv = QualityHaccpService.exportTemperatureLogsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="control_temperaturas.csv"');
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/quality/export/lots-csv', (_req: Request, res: Response) => {
    try {
      const csv = QualityHaccpService.exportFoodLotsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="trazabilidad_lotes.csv"');
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
