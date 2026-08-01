import {
  Asset,
  PreventivePlan,
  Incident,
  WorkOrder,
  SATIntervention,
  MaintenanceSparePart,
  AssetWarranty,
  AssetStatus,
  WorkOrderStatus,
  IncidentStatus,
} from '../types/maintenance';
import {
  INITIAL_ASSETS,
  INITIAL_PREVENTIVE_PLANS,
  INITIAL_INCIDENTS,
  INITIAL_WORK_ORDERS,
  INITIAL_SAT_INTERVENTIONS,
  INITIAL_SPARE_PARTS,
  INITIAL_WARRANTIES,
} from '../data/maintenanceData';
import { AuditService } from './auditService';

export class MaintenanceService {
  private static assets: Asset[] = [...INITIAL_ASSETS];
  private static preventivePlans: PreventivePlan[] = [...INITIAL_PREVENTIVE_PLANS];
  private static incidents: Incident[] = [...INITIAL_INCIDENTS];
  private static workOrders: WorkOrder[] = [...INITIAL_WORK_ORDERS];
  private static satInterventions: SATIntervention[] = [...INITIAL_SAT_INTERVENTIONS];
  private static spareParts: MaintenanceSparePart[] = [...INITIAL_SPARE_PARTS];
  private static warranties: AssetWarranty[] = [...INITIAL_WARRANTIES];

  // ==========================================
  // ACTIVOS (ASSET MANAGEMENT)
  // ==========================================
  static getAssets(): Asset[] {
    return [...this.assets];
  }

  static getAssetById(id: string): Asset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  static createAsset(newAssetData: Omit<Asset, 'id'>, user = 'Sistema'): Asset {
    const id = `ast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAsset: Asset = {
      ...newAssetData,
      id,
    };
    this.assets.push(newAsset);

    AuditService.log({
      action: 'MANTENIMIENTO_ACTIVO_CREAR',
      username: user,
      details: `Activo ${newAsset.internalCode} - ${newAsset.name} registrado exitosamente.`,
      resource: `Asset:${id}`,
    });

    return newAsset;
  }

  static updateAsset(id: string, updates: Partial<Asset>, user = 'Sistema'): Asset {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new Error(`Activo con ID ${id} no encontrado.`);
    }

    this.assets[idx] = { ...this.assets[idx], ...updates };

    AuditService.log({
      action: 'MANTENIMIENTO_ACTIVO_ACTUALIZAR',
      username: user,
      details: `Activo ${this.assets[idx].internalCode} actualizado.`,
      resource: `Asset:${id}`,
    });

    return this.assets[idx];
  }

  static deleteAsset(id: string, user = 'Sistema'): boolean {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    const removed = this.assets.splice(idx, 1)[0];
    AuditService.log({
      action: 'MANTENIMIENTO_ACTIVO_ELIMINAR',
      username: user,
      details: `Activo ${removed.internalCode} - ${removed.name} eliminado.`,
      resource: `Asset:${id}`,
    });
    return true;
  }

  /**
   * Ultra-fast multi-field search for Assets
   */
  static searchAssets(query: string): Asset[] {
    if (!query.trim()) return this.getAssets();
    const q = query.toLowerCase().trim();
    return this.assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.internalCode.toLowerCase().includes(q) ||
        a.barcode.toLowerCase().includes(q) ||
        a.qrCode.toLowerCase().includes(q) ||
        (a.nfcCode && a.nfcCode.toLowerCase().includes(q)) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.brand.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.responsiblePerson.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }

  // ==========================================
  // MANTENIMIENTO PREVENTIVO
  // ==========================================
  static getPreventivePlans(): PreventivePlan[] {
    return [...this.preventivePlans];
  }

  static createPreventivePlan(planData: Omit<PreventivePlan, 'id' | 'code'>, user = 'Sistema'): PreventivePlan {
    const id = `prev-${Date.now()}`;
    const code = `PLN-${Math.floor(100 + Math.random() * 900)}`;
    const plan: PreventivePlan = {
      ...planData,
      id,
      code,
    };
    this.preventivePlans.push(plan);

    AuditService.log({
      action: 'MANTENIMIENTO_PREVENTIVO_CREAR',
      username: user,
      details: `Plan preventivo ${plan.code} (${plan.title}) creado para activo ${plan.assetName}.`,
      resource: `PreventivePlan:${id}`,
    });

    return plan;
  }

  static executePreventivePlan(planId: string, executionDate: string, notes?: string, user = 'Sistema'): WorkOrder {
    const plan = this.preventivePlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan preventivo no encontrado.');

    plan.lastExecutionDate = executionDate;

    // Calculate next execution date roughly based on frequency
    const d = new Date(executionDate);
    if (plan.frequency === 'DIARIA') d.setDate(d.getDate() + 1);
    else if (plan.frequency === 'SEMANAL') d.setDate(d.getDate() + 7);
    else if (plan.frequency === 'MENSUAL') d.setMonth(d.getMonth() + 1);
    else if (plan.frequency === 'TRIMESTRAL') d.setMonth(d.getMonth() + 3);
    else if (plan.frequency === 'SEMESTRAL') d.setMonth(d.getMonth() + 6);
    else if (plan.frequency === 'ANUAL') d.setFullYear(d.getFullYear() + 1);
    else d.setDate(d.getDate() + 30);

    plan.nextExecutionDate = d.toISOString().split('T')[0];

    // Generate Work Order automatically from preventive plan
    const wo = this.createWorkOrder(
      {
        assetId: plan.assetId,
        assetName: plan.assetName,
        type: 'PREVENTIVO',
        priority: 'MEDIA',
        status: 'EN_CURSO',
        technicianName: plan.assignedTechnician || 'Técnico de Mantenimiento',
        scheduledDate: executionDate,
        scheduledTime: '10:00',
        startDate: executionDate,
        spareParts: [],
        laborHours: plan.estimatedMinutes / 60,
        laborRate: 35,
        totalLaborCost: (plan.estimatedMinutes / 60) * 35,
        totalCost: (plan.estimatedMinutes / 60) * 35,
        checklist: plan.checklist.map((c) => ({ ...c, completed: true })),
        observations: notes || `Ejecución de plan preventivo ${plan.code}`,
        photos: [],
        companyId: 'comp-001',
        venueId: 'sed-001',
      },
      user
    );

    AuditService.log({
      action: 'MANTENIMIENTO_PREVENTIVO_EJECUTAR',
      username: user,
      details: `Ejecutado plan preventivo ${plan.code}. Generada Orden de Trabajo ${wo.code}.`,
      resource: `PreventivePlan:${planId}`,
    });

    return wo;
  }

  // ==========================================
  // INCIDENCIAS Y MANTENIMIENTO CORRECTIVO
  // ==========================================
  static getIncidents(): Incident[] {
    return [...this.incidents];
  }

  static createIncident(data: Omit<Incident, 'id' | 'code' | 'openDate' | 'status'>, user = 'Sistema'): Incident {
    const id = `inc-${Date.now()}`;
    const code = `INC-2026-${Math.floor(10 + Math.random() * 90)}`;
    const incident: Incident = {
      ...data,
      id,
      code,
      openDate: new Date().toISOString().split('T')[0],
      status: 'ABIERTA',
    };
    this.incidents.push(incident);

    // Update asset status to EN_REPARACION if priority is ALTA or CRITICA
    if (incident.priority === 'ALTA' || incident.priority === 'CRITICA') {
      const asset = this.assets.find((a) => a.id === incident.assetId);
      if (asset) asset.status = 'EN_REPARACION';
    }

    AuditService.log({
      action: 'MANTENIMIENTO_INCIDENCIA_CREAR',
      username: user,
      details: `Incidencia ${incident.code} (${incident.title}) abierta para activo ${incident.assetName}.`,
      resource: `Incident:${id}`,
    });

    return incident;
  }

  static closeIncident(id: string, notes?: string, user = 'Sistema'): Incident {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) throw new Error('Incidencia no encontrada.');

    inc.status = 'RESUELTA';
    inc.closeDate = new Date().toISOString().split('T')[0];

    // Restore asset status if no other active critical incidents
    const asset = this.assets.find((a) => a.id === inc.assetId);
    if (asset) {
      const otherActive = this.incidents.some(
        (i) => i.assetId === inc.assetId && i.id !== id && i.status !== 'RESUELTA' && i.status !== 'CANCELADA'
      );
      if (!otherActive) {
        asset.status = 'OPERATIVO';
      }
    }

    AuditService.log({
      action: 'MANTENIMIENTO_INCIDENCIA_CERRAR',
      username: user,
      details: `Incidencia ${inc.code} resuelta y cerrada.`,
      resource: `Incident:${id}`,
    });

    return inc;
  }

  // ==========================================
  // ÓRDENES DE TRABAJO (WORK ORDERS)
  // ==========================================
  static getWorkOrders(): WorkOrder[] {
    return [...this.workOrders];
  }

  static createWorkOrder(data: Omit<WorkOrder, 'id' | 'code'>, user = 'Sistema'): WorkOrder {
    const id = `wo-${Date.now()}`;
    const code = `OT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalSpareCost = data.spareParts.reduce((acc, sp) => acc + sp.totalCost, 0);
    const totalLaborCost = data.laborHours * data.laborRate;
    const totalCost = totalSpareCost + totalLaborCost;

    const workOrder: WorkOrder = {
      ...data,
      id,
      code,
      totalLaborCost,
      totalCost,
    };

    this.workOrders.push(workOrder);

    AuditService.log({
      action: 'MANTENIMIENTO_OT_CREAR',
      username: user,
      details: `Orden de Trabajo ${workOrder.code} creada para activo ${workOrder.assetName}. Importe: ${totalCost.toFixed(2)}€`,
      resource: `WorkOrder:${id}`,
    });

    return workOrder;
  }

  static updateWorkOrderStatus(id: string, status: WorkOrderStatus, user = 'Sistema'): WorkOrder {
    const wo = this.workOrders.find((w) => w.id === id);
    if (!wo) throw new Error('Orden de Trabajo no encontrada.');

    wo.status = status;
    if (status === 'EN_CURSO' && !wo.startDate) {
      wo.startDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    if (status === 'FINALIZADA') {
      wo.endDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.finalizeWorkOrderStockDeduction(wo, user);
    }

    AuditService.log({
      action: 'MANTENIMIENTO_OT_ESTADO',
      username: user,
      details: `Orden de Trabajo ${wo.code} cambió a estado ${status}.`,
      resource: `WorkOrder:${id}`,
    });

    return wo;
  }

  /**
   * Automatically deducts spare parts used in a Work Order from maintenance inventory
   */
  private static finalizeWorkOrderStockDeduction(wo: WorkOrder, user: string) {
    wo.spareParts.forEach((spItem) => {
      this.consumeSparePart(spItem.sparePartId, spItem.quantity, `Consumo por OT ${wo.code}`, user);
    });
  }

  // ==========================================
  // SAT & SERVICIO TÉCNICO
  // ==========================================
  static getSATInterventions(): SATIntervention[] {
    return [...this.satInterventions];
  }

  static createSATIntervention(data: Omit<SATIntervention, 'id' | 'code'>, user = 'Sistema'): SATIntervention {
    const id = `sat-${Date.now()}`;
    const code = `SAT-INT-2026-${Math.floor(10 + Math.random() * 90)}`;
    const sat: SATIntervention = {
      ...data,
      id,
      code,
    };
    this.satInterventions.push(sat);

    AuditService.log({
      action: 'MANTENIMIENTO_SAT_CREAR',
      username: user,
      details: `Intervención SAT ${sat.code} registrada con proveedor ${sat.providerSAT}.`,
      resource: `SAT:${id}`,
    });

    return sat;
  }

  // ==========================================
  // REPUESTOS (SPARE PARTS MANAGEMENT)
  // ==========================================
  static getSpareParts(): MaintenanceSparePart[] {
    return [...this.spareParts];
  }

  static createSparePart(data: Omit<MaintenanceSparePart, 'id'>, user = 'Sistema'): MaintenanceSparePart {
    const id = `sp-${Date.now()}`;
    const sparePart: MaintenanceSparePart = {
      ...data,
      id,
    };
    this.spareParts.push(sparePart);

    AuditService.log({
      action: 'MANTENIMIENTO_REPUESTO_CREAR',
      username: user,
      details: `Repuesto ${sparePart.code} - ${sparePart.name} registrado en almacén.`,
      resource: `SparePart:${id}`,
    });

    return sparePart;
  }

  static consumeSparePart(id: string, quantity: number, reason: string, user = 'Sistema'): MaintenanceSparePart {
    const sp = this.spareParts.find((s) => s.id === id);
    if (!sp) throw new Error('Repuesto no encontrado.');

    if (sp.stock < quantity) {
      AuditService.log({
        action: 'MANTENIMIENTO_REPUESTO_ALERTA_STOCK',
        username: user,
        details: `Stock insuficiente de repuesto ${sp.name}. Requerido: ${quantity}, Disponible: ${sp.stock}`,
        resource: `SparePart:${id}`,
      });
    }

    sp.stock = Math.max(0, sp.stock - quantity);

    AuditService.log({
      action: 'MANTENIMIENTO_REPUESTO_CONSUMO',
      username: user,
      details: `Consumo de ${quantity} ${sp.unit} de repuesto ${sp.name}. Motivo: ${reason}. Stock resultante: ${sp.stock}`,
      resource: `SparePart:${id}`,
    });

    return sp;
  }

  // ==========================================
  // GARANTÍAS (WARRANTY MANAGEMENT)
  // ==========================================
  static getWarranties(): AssetWarranty[] {
    return [...this.warranties];
  }

  static createWarranty(data: Omit<AssetWarranty, 'id'>, user = 'Sistema'): AssetWarranty {
    const id = `war-${Date.now()}`;
    const warranty: AssetWarranty = {
      ...data,
      id,
    };
    this.warranties.push(warranty);

    AuditService.log({
      action: 'MANTENIMIENTO_GARANTIA_CREAR',
      username: user,
      details: `Garantía registrada para activo ${warranty.assetName} hasta ${warranty.endDate}.`,
      resource: `Warranty:${id}`,
    });

    return warranty;
  }

  // ==========================================
  // EXPORT / IMPORT HELPERS
  // ==========================================
  static exportAssetsCSV(): string {
    const headers = ['ID', 'Codigo', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Serie', 'Ubicacion', 'Estado', 'ValorCompra'];
    const rows = this.assets.map((a) => [
      a.id,
      a.internalCode,
      `"${a.name.replace(/"/g, '""')}"`,
      a.type,
      a.brand,
      a.model,
      a.serialNumber,
      `"${a.location.replace(/"/g, '""')}"`,
      a.status,
      a.purchaseValue.toFixed(2),
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static exportWorkOrdersCSV(): string {
    const headers = ['Codigo', 'Activo', 'Tipo', 'Prioridad', 'Estado', 'Tecnico', 'Fecha', 'CosteTotal'];
    const rows = this.workOrders.map((w) => [
      w.code,
      `"${w.assetName.replace(/"/g, '""')}"`,
      w.type,
      w.priority,
      w.status,
      `"${(w.technicianName || '').replace(/"/g, '""')}"`,
      w.scheduledDate,
      w.totalCost.toFixed(2),
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
