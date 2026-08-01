import {
  HACCPPlan,
  CriticalControlPoint,
  TemperatureEquipment,
  TemperatureLog,
  CleaningPlan,
  CleaningLog,
  ChecklistTemplate,
  ChecklistExecution,
  FoodLot,
  TraceabilityMovement,
  DishAllergenInfo,
  SanitaryAudit,
  SupplierSanitaryCert,
  QualityDocument,
  NonConformity,
} from '../types/qualityHaccp';
import {
  INITIAL_HACCP_PLANS,
  INITIAL_TEMPERATURE_EQUIPMENT,
  INITIAL_TEMPERATURE_LOGS,
  INITIAL_CLEANING_PLANS,
  INITIAL_CLEANING_LOGS,
  INITIAL_CHECKLIST_TEMPLATES,
  INITIAL_CHECKLIST_EXECUTIONS,
  INITIAL_FOOD_LOTS,
  INITIAL_DISH_ALLERGENS,
  INITIAL_SANITARY_AUDITS,
  INITIAL_SUPPLIER_CERTS,
  INITIAL_QUALITY_DOCS,
} from '../data/qualityHaccpData';
import { AuditService } from './auditService';

export class QualityHaccpService {
  private static haccpPlans: HACCPPlan[] = [...INITIAL_HACCP_PLANS];
  private static temperatureEquipment: TemperatureEquipment[] = [...INITIAL_TEMPERATURE_EQUIPMENT];
  private static temperatureLogs: TemperatureLog[] = [...INITIAL_TEMPERATURE_LOGS];
  private static cleaningPlans: CleaningPlan[] = [...INITIAL_CLEANING_PLANS];
  private static cleaningLogs: CleaningLog[] = [...INITIAL_CLEANING_LOGS];
  private static checklistTemplates: ChecklistTemplate[] = [...INITIAL_CHECKLIST_TEMPLATES];
  private static checklistExecutions: ChecklistExecution[] = [...INITIAL_CHECKLIST_EXECUTIONS];
  private static foodLots: FoodLot[] = [...INITIAL_FOOD_LOTS];
  private static traceabilityMovements: TraceabilityMovement[] = [];
  private static dishAllergens: DishAllergenInfo[] = [...INITIAL_DISH_ALLERGENS];
  private static sanitaryAudits: SanitaryAudit[] = [...INITIAL_SANITARY_AUDITS];
  private static supplierCerts: SupplierSanitaryCert[] = [...INITIAL_SUPPLIER_CERTS];
  private static qualityDocs: QualityDocument[] = [...INITIAL_QUALITY_DOCS];

  // ==========================================
  // APPCC / HACCP PLANS & PCCS
  // ==========================================
  static getHACCPPlans(): HACCPPlan[] {
    return [...this.haccpPlans];
  }

  static getHACCPPlanById(id: string): HACCPPlan | undefined {
    return this.haccpPlans.find((p) => p.id === id);
  }

  static createHACCPPlan(data: Omit<HACCPPlan, 'id' | 'code'>, user = 'Sistema'): HACCPPlan {
    const id = `haccp-${Date.now()}`;
    const code = `APPCC-2026-${Math.floor(10 + Math.random() * 90)}`;
    const newPlan: HACCPPlan = {
      ...data,
      id,
      code,
    };
    this.haccpPlans.push(newPlan);

    AuditService.log({
      action: 'CALIDAD_APPCC_PLAN_CREAR',
      username: user,
      details: `Plan APPCC ${newPlan.code} (${newPlan.title}) creado con ${newPlan.pccs.length} PCCs.`,
      resource: `HACCPPlan:${id}`,
    });

    return newPlan;
  }

  static addPCCtoPlan(planId: string, pccData: Omit<CriticalControlPoint, 'id'>, user = 'Sistema'): HACCPPlan {
    const plan = this.haccpPlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan APPCC no encontrado');

    const pcc: CriticalControlPoint = {
      ...pccData,
      id: `pcc-${Date.now()}`,
    };
    plan.pccs.push(pcc);

    AuditService.log({
      action: 'CALIDAD_APPCC_PCC_AGREGAR',
      username: user,
      details: `PCC ${pcc.code} (${pcc.name}) agregado al plan ${plan.code}.`,
      resource: `HACCPPlan:${planId}`,
    });

    return plan;
  }

  // ==========================================
  // CONTROL DE TEMPERATURAS
  // ==========================================
  static getTemperatureEquipment(): TemperatureEquipment[] {
    return [...this.temperatureEquipment];
  }

  static createTemperatureEquipment(data: Omit<TemperatureEquipment, 'id'>, user = 'Sistema'): TemperatureEquipment {
    const id = `eq-${Date.now()}`;
    const eq: TemperatureEquipment = {
      ...data,
      id,
    };
    this.temperatureEquipment.push(eq);

    AuditService.log({
      action: 'CALIDAD_TEMP_EQUIPO_CREAR',
      username: user,
      details: `Equipo de frío/calor ${eq.code} - ${eq.name} registrado.`,
      resource: `TemperatureEquipment:${id}`,
    });

    return eq;
  }

  static getTemperatureLogs(): TemperatureLog[] {
    return [...this.temperatureLogs];
  }

  static logTemperature(
    equipmentId: string,
    temperature: number,
    operatorName: string,
    notes?: string,
    photoUrl?: string,
    digitalSignature?: string,
    user = 'Sistema'
  ): { log: TemperatureLog; alertTriggered: boolean } {
    const eq = this.temperatureEquipment.find((e) => e.id === equipmentId);
    if (!eq) throw new Error('Equipo de temperatura no encontrado');

    const now = new Date();
    const isWithin = temperature >= eq.minTemp && temperature <= eq.maxTemp;
    let alertTriggered = false;

    if (!isWithin) {
      alertTriggered = true;
      eq.isAlerting = true;
    } else {
      eq.isAlerting = false;
    }

    eq.lastReadingTemp = temperature;
    eq.lastReadingDate = now.toISOString().replace('T', ' ').substring(0, 16);

    const log: TemperatureLog = {
      id: `tpl-${Date.now()}`,
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentType: eq.type,
      temperature,
      minAllowed: eq.minTemp,
      maxAllowed: eq.maxTemp,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      date: now.toISOString().split('T')[0],
      time: now.toISOString().substring(11, 16),
      operatorName,
      isWithinLimits: isWithin,
      notes,
      photoUrl,
      digitalSignature,
    };

    this.temperatureLogs.unshift(log);

    AuditService.log({
      action: isWithin ? 'CALIDAD_TEMP_LECTURA_OK' : 'CALIDAD_TEMP_ALERTA_CRITICA',
      username: user,
      details: `Lectura de temp ${temperature}ºC en ${eq.name} (${eq.code}). Rango: [${eq.minTemp}ºC a ${eq.maxTemp}ºC]. ${
        !isWithin ? '¡ALERTA DE SEGURIDAD ALIMENTARIA!' : 'OK'
      }`,
      resource: `TemperatureLog:${log.id}`,
    });

    return { log, alertTriggered };
  }

  // ==========================================
  // LIMPIEZA Y DESINFECCIÓN (L+D)
  // ==========================================
  static getCleaningPlans(): CleaningPlan[] {
    return [...this.cleaningPlans];
  }

  static createCleaningPlan(data: Omit<CleaningPlan, 'id' | 'code'>, user = 'Sistema'): CleaningPlan {
    const id = `cp-${Date.now()}`;
    const code = `PLD-${Math.floor(10 + Math.random() * 90)}`;
    const plan: CleaningPlan = {
      ...data,
      id,
      code,
    };
    this.cleaningPlans.push(plan);

    AuditService.log({
      action: 'CALIDAD_LIMPIEZA_PLAN_CREAR',
      username: user,
      details: `Plan de Limpieza y Desinfección ${plan.code} (${plan.zone} - ${plan.element}) registrado.`,
      resource: `CleaningPlan:${id}`,
    });

    return plan;
  }

  static getCleaningLogs(): CleaningLog[] {
    return [...this.cleaningLogs];
  }

  static recordCleaningExecution(
    planId: string,
    operatorName: string,
    checklistCompleted: boolean[],
    notes?: string,
    photoUrl?: string,
    digitalSignature?: string,
    user = 'Sistema'
  ): CleaningLog {
    const plan = this.cleaningPlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan de limpieza no encontrado');

    const now = new Date();
    const allPassed = checklistCompleted.every((c) => c === true);

    const log: CleaningLog = {
      id: `clg-${Date.now()}`,
      planId: plan.id,
      zone: plan.zone,
      element: plan.element,
      completedDate: now.toISOString().split('T')[0],
      completedTime: now.toISOString().substring(11, 16),
      operatorName,
      chemicalProductUsed: plan.chemicalProduct,
      concentrationUsed: plan.concentration,
      status: allPassed ? 'CONFORME' : 'NO_CONFORME',
      checklistCompleted,
      notes,
      photoUrl,
      digitalSignature,
    };

    this.cleaningLogs.unshift(log);

    AuditService.log({
      action: 'CALIDAD_LIMPIEZA_EJECUTAR',
      username: user,
      details: `Ejecutada limpieza L+D ${plan.code} en ${plan.zone}. Estado: ${log.status}`,
      resource: `CleaningLog:${log.id}`,
    });

    return log;
  }

  // ==========================================
  // CHECKLISTS SANITARIOS
  // ==========================================
  static getChecklistTemplates(): ChecklistTemplate[] {
    return [...this.checklistTemplates];
  }

  static getChecklistExecutions(): ChecklistExecution[] {
    return [...this.checklistExecutions];
  }

  static executeChecklist(
    templateId: string,
    operatorName: string,
    answers: { questionId: string; questionText: string; isPassed: boolean; notes?: string }[],
    user = 'Sistema'
  ): ChecklistExecution {
    const template = this.checklistTemplates.find((t) => t.id === templateId);
    if (!template) throw new Error('Plantilla de checklist no encontrada');

    const now = new Date();
    const totalQuestions = answers.length;
    const passedQuestions = answers.filter((a) => a.isPassed).length;
    const compliancePercentage = Math.round((passedQuestions / totalQuestions) * 100);

    const status = compliancePercentage === 100 ? 'APROBADO' : compliancePercentage >= 80 ? 'CON_OBSERVACIONES' : 'RECHAZADO';

    const execution: ChecklistExecution = {
      id: `cke-${Date.now()}`,
      templateId: template.id,
      templateTitle: template.title,
      category: template.category,
      date: now.toISOString().split('T')[0],
      time: now.toISOString().substring(11, 16),
      operatorName,
      answers,
      totalQuestions,
      passedQuestions,
      compliancePercentage,
      status,
    };

    this.checklistExecutions.unshift(execution);

    AuditService.log({
      action: 'CALIDAD_CHECKLIST_EJECUTAR',
      username: user,
      details: `Ejecutado Checklist ${template.title}. Cumplimiento: ${compliancePercentage}%. Estado: ${status}`,
      resource: `ChecklistExecution:${execution.id}`,
    });

    return execution;
  }

  // ==========================================
  // TRAZABILIDAD ALIMENTARIA (LOTES & FEFO/FIFO)
  // ==========================================
  static getFoodLots(): FoodLot[] {
    return [...this.foodLots];
  }

  static createFoodLot(data: Omit<FoodLot, 'id' | 'lotNumber' | 'status'>, user = 'Sistema'): FoodLot {
    const id = `lot-${Date.now()}`;
    const lotNumber = `LOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const lot: FoodLot = {
      ...data,
      id,
      lotNumber,
      status: 'ACTIVO',
    };

    this.foodLots.push(lot);

    this.recordTraceabilityMovement({
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      productName: lot.productName,
      movementType: 'RECEPCION',
      quantity: lot.initialQuantity,
      unit: lot.unit,
      referenceDoc: `Recepción Proveedor ${lot.supplierName}`,
      operatorName: user,
    });

    AuditService.log({
      action: 'CALIDAD_TRAZABILIDAD_LOTE_CREAR',
      username: user,
      details: `Registrado Lote ${lot.lotNumber} (${lot.productName}) de ${lot.supplierName}. Caducidad: ${lot.expiryDate}`,
      resource: `FoodLot:${id}`,
    });

    return lot;
  }

  static recordTraceabilityMovement(data: Omit<TraceabilityMovement, 'id' | 'timestamp'>): TraceabilityMovement {
    const movement: TraceabilityMovement = {
      ...data,
      id: `trm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.traceabilityMovements.unshift(movement);

    // Adjust lot balance
    const lot = this.foodLots.find((l) => l.id === data.lotId);
    if (lot) {
      if (data.movementType === 'CONSUMO_COCINA' || data.movementType === 'VENTA_TPV' || data.movementType === 'DESTRUCCION') {
        lot.currentQuantity = Math.max(0, lot.currentQuantity - data.quantity);
        if (lot.currentQuantity === 0) {
          lot.status = 'AGOTADO';
        }
      } else if (data.movementType === 'RETIRADA_SANITARIA') {
        lot.status = 'BLOQUEADO_RETIRADO';
      }
    }

    return movement;
  }

  static getTraceabilityMovements(): TraceabilityMovement[] {
    return [...this.traceabilityMovements];
  }

  /**
   * Returns active food lots sorted by FEFO (First Expired, First Out)
   */
  static getFEFORecommendations(): FoodLot[] {
    return this.foodLots
      .filter((l) => l.status === 'ACTIVO' && l.currentQuantity > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }

  /**
   * Triggers an emergency Sanitary Recall / Withdrawal for a specific Lot
   */
  static triggerLotRecall(lotId: string, reason: string, user = 'Sistema'): FoodLot {
    const lot = this.foodLots.find((l) => l.id === lotId);
    if (!lot) throw new Error('Lote alimentario no encontrado');

    lot.status = 'BLOQUEADO_RETIRADO';

    this.recordTraceabilityMovement({
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      productName: lot.productName,
      movementType: 'RETIRADA_SANITARIA',
      quantity: lot.currentQuantity,
      unit: lot.unit,
      referenceDoc: `Alerta Sanitaria: ${reason}`,
      operatorName: user,
    });

    AuditService.log({
      action: 'CALIDAD_TRAZABILIDAD_RETIRADA_ALERTA',
      username: user,
      details: `¡ALERTA SANITARIA! Inmovilizado y retirado Lote ${lot.lotNumber} (${lot.productName}). Motivo: ${reason}`,
      resource: `FoodLot:${lotId}`,
    });

    return lot;
  }

  // ==========================================
  // ALÉRGENOS (EU 1169/2011)
  // ==========================================
  static getDishAllergens(): DishAllergenInfo[] {
    return [...this.dishAllergens];
  }

  static updateDishAllergens(dishInfo: DishAllergenInfo, user = 'Sistema'): DishAllergenInfo {
    const idx = this.dishAllergens.findIndex((d) => d.productId === dishInfo.productId);
    dishInfo.lastUpdated = new Date().toISOString().split('T')[0];

    if (idx >= 0) {
      this.dishAllergens[idx] = dishInfo;
    } else {
      this.dishAllergens.push(dishInfo);
    }

    AuditService.log({
      action: 'CALIDAD_ALERGENOS_ACTUALIZAR',
      username: user,
      details: `Ficha de Alérgenos actualizada para el plato "${dishInfo.productName}". Contiene: [${dishInfo.allergensDirect.join(', ')}]`,
      resource: `DishAllergenInfo:${dishInfo.productId}`,
    });

    return dishInfo;
  }

  // ==========================================
  // AUDITORÍAS E INSPECCIONES SANITARIAS
  // ==========================================
  static getSanitaryAudits(): SanitaryAudit[] {
    return [...this.sanitaryAudits];
  }

  static createSanitaryAudit(data: Omit<SanitaryAudit, 'id' | 'code'>, user = 'Sistema'): SanitaryAudit {
    const id = `aud-${Date.now()}`;
    const code = `AUD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const audit: SanitaryAudit = {
      ...data,
      id,
      code,
    };
    this.sanitaryAudits.unshift(audit);

    AuditService.log({
      action: 'CALIDAD_AUDITORIA_CREAR',
      username: user,
      details: `Registrada auditoría ${audit.code} (${audit.title}). Puntuación: ${audit.scorePercentage}% - ${audit.resultStatus}`,
      resource: `SanitaryAudit:${id}`,
    });

    return audit;
  }

  static addNonConformity(auditId: string, ncData: Omit<NonConformity, 'id' | 'code'>, user = 'Sistema'): SanitaryAudit {
    const audit = this.sanitaryAudits.find((a) => a.id === auditId);
    if (!audit) throw new Error('Auditoría no encontrada');

    const nc: NonConformity = {
      ...ncData,
      id: `nc-${Date.now()}`,
      code: `NC-2026-${Math.floor(10 + Math.random() * 90)}`,
    };
    audit.nonConformities.push(nc);

    AuditService.log({
      action: 'CALIDAD_AUDITORIA_NC_AGREGAR',
      username: user,
      details: `No Conformidad ${nc.code} registrada en auditoría ${audit.code}: ${nc.description}`,
      resource: `SanitaryAudit:${auditId}`,
    });

    return audit;
  }

  static resolveNonConformity(auditId: string, ncId: string, user = 'Sistema'): SanitaryAudit {
    const audit = this.sanitaryAudits.find((a) => a.id === auditId);
    if (!audit) throw new Error('Auditoría no encontrada');

    const nc = audit.nonConformities.find((n) => n.id === ncId);
    if (!nc) throw new Error('No conformidad no encontrada');

    nc.status = 'VERIFICADA';
    nc.resolvedDate = new Date().toISOString().split('T')[0];

    AuditService.log({
      action: 'CALIDAD_AUDITORIA_NC_RESOLVER',
      username: user,
      details: `No conformidad ${nc.code} resuelta y verificada exitosamente.`,
      resource: `SanitaryAudit:${auditId}`,
    });

    return audit;
  }

  // ==========================================
  // HOMOLOGACIÓN DE PROVEEDORES
  // ==========================================
  static getSupplierCerts(): SupplierSanitaryCert[] {
    return [...this.supplierCerts];
  }

  static createSupplierCert(data: Omit<SupplierSanitaryCert, 'id'>, user = 'Sistema'): SupplierSanitaryCert {
    const id = `scert-${Date.now()}`;
    const cert: SupplierSanitaryCert = {
      ...data,
      id,
    };
    this.supplierCerts.push(cert);

    AuditService.log({
      action: 'CALIDAD_PROVEEDOR_CERT_CREAR',
      username: user,
      details: `Registrado certificado sanitario de proveedor ${cert.supplierName} (RGSEAA: ${cert.rgseaaNumber}). Caduca: ${cert.expiryDate}`,
      resource: `SupplierSanitaryCert:${id}`,
    });

    return cert;
  }

  // ==========================================
  // DOCUMENTACIÓN DE CALIDAD
  // ==========================================
  static getQualityDocs(): QualityDocument[] {
    return [...this.qualityDocs];
  }

  static createQualityDoc(data: Omit<QualityDocument, 'id'>, user = 'Sistema'): QualityDocument {
    const id = `qdoc-${Date.now()}`;
    const doc: QualityDocument = {
      ...data,
      id,
    };
    this.qualityDocs.push(doc);

    AuditService.log({
      action: 'CALIDAD_DOC_CREAR',
      username: user,
      details: `Documento de Calidad registrado: ${doc.code} - ${doc.title}`,
      resource: `QualityDocument:${id}`,
    });

    return doc;
  }

  // ==========================================
  // SEARCH & EXPORT UTILITIES
  // ==========================================
  static searchQuality(query: string): {
    haccp: HACCPPlan[];
    lots: FoodLot[];
    logs: TemperatureLog[];
    audits: SanitaryAudit[];
  } {
    if (!query.trim()) {
      return {
        haccp: this.getHACCPPlans(),
        lots: this.getFoodLots(),
        logs: this.getTemperatureLogs(),
        audits: this.getSanitaryAudits(),
      };
    }

    const q = query.toLowerCase().trim();

    return {
      haccp: this.haccpPlans.filter(
        (p) => p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.hazards.some((h) => h.description.toLowerCase().includes(q))
      ),
      lots: this.foodLots.filter(
        (l) => l.lotNumber.toLowerCase().includes(q) || l.productName.toLowerCase().includes(q) || l.supplierName.toLowerCase().includes(q)
      ),
      logs: this.temperatureLogs.filter((l) => l.equipmentName.toLowerCase().includes(q) || l.operatorName.toLowerCase().includes(q)),
      audits: this.sanitaryAudits.filter(
        (a) => a.title.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.auditorName.toLowerCase().includes(q)
      ),
    };
  }

  static exportTemperatureLogsCSV(): string {
    const headers = ['ID', 'Equipo', 'Tipo', 'Temperatura', 'Minimo', 'Maximo', 'Fecha', 'Hora', 'Operario', 'DentroDeLimites'];
    const rows = this.temperatureLogs.map((l) => [
      l.id,
      `"${l.equipmentName.replace(/"/g, '""')}"`,
      l.equipmentType,
      l.temperature,
      l.minAllowed,
      l.maxAllowed,
      l.date,
      l.time,
      `"${l.operatorName.replace(/"/g, '""')}"`,
      l.isWithinLimits ? 'SI' : 'NO',
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static exportFoodLotsCSV(): string {
    const headers = ['Lote', 'Producto', 'Categoria', 'Proveedor', 'RGSEAA', 'FechaRecepcion', 'FechaCaducidad', 'CantidadActual', 'Unidad', 'Estado'];
    const rows = this.foodLots.map((l) => [
      l.lotNumber,
      `"${l.productName.replace(/"/g, '""')}"`,
      l.category,
      `"${l.supplierName.replace(/"/g, '""')}"`,
      l.supplierSanitaryRegister || '',
      l.receptionDate,
      l.expiryDate,
      l.currentQuantity,
      l.unit,
      l.status,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
