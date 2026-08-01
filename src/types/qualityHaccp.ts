export type CriticalControlPointLevel = 'PCC' | 'PC' | 'PRPO' | 'OPRP';

export type HazardType = 'BIOLOGICO' | 'QUIMICO' | 'FISICO' | 'ALERGENOS';

export type HaccpFrequencyType = 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' | 'POR_LOTE' | 'POR_RECEPCION';

export interface HACCPHazard {
  id: string;
  stage: string; // e.g., "Recepción de pescado fresco"
  hazardType: HazardType;
  description: string;
  cause: string;
  probability: 'BAJA' | 'MEDIA' | 'ALTA';
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  riskScore: number; // 1 to 9
  isPCC: boolean;
  pccCode?: string; // e.g. "PCC-1"
  preventiveMeasure: string;
}

export interface CriticalControlPoint {
  id: string;
  code: string; // e.g., "PCC-1"
  name: string; // e.g., "Control de Temperatura en Cámaras"
  level: CriticalControlPointLevel;
  targetStage: string;
  criticalLimitMin?: number;
  criticalLimitMax?: number;
  unit?: string; // e.g. "ºC", "pH", "min"
  monitoringMethod: string;
  monitoringFrequency: HaccpFrequencyType;
  responsibleRole: string;
  correctiveAction: string;
  verificationProcedure: string;
  recordsRequired: string;
}

export interface HACCPPlan {
  id: string;
  title: string;
  code: string;
  version: string;
  status: 'ACTIVO' | 'REVISION' | 'HISTORICO';
  author: string;
  approvedBy: string;
  approvalDate: string;
  nextReviewDate: string;
  hazards: HACCPHazard[];
  pccs: CriticalControlPoint[];
  companyId: string;
  venueId: string;
}

// ==========================================
// CONTROL DE TEMPERATURAS
// ==========================================
export type EquipmentType =
  | 'CAMARA_FRIGORIFICA'
  | 'CONGELADOR'
  | 'ABATIDOR'
  | 'VITRINA_EXPOSITORA'
  | 'HORNO'
  | 'FREIDORA'
  | 'LAVAVAJILLAS'
  | 'ALMACEN_SECO'
  | 'VEHICULO_REFRIGERADO';

export interface TemperatureEquipment {
  id: string;
  code: string;
  name: string;
  type: EquipmentType;
  location: string;
  minTemp: number; // e.g. 1.0 ºC
  maxTemp: number; // e.g. 4.0 ºC
  targetTemp: number; // e.g. 2.5 ºC
  isActive: boolean;
  lastReadingTemp?: number;
  lastReadingDate?: string;
  isAlerting?: boolean;
}

export interface TemperatureLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  temperature: number;
  minAllowed: number;
  maxAllowed: number;
  timestamp: string;
  date: string;
  time: string;
  operatorName: string;
  isWithinLimits: boolean;
  correctiveActionTaken?: string;
  photoUrl?: string;
  digitalSignature?: string;
  notes?: string;
}

// ==========================================
// LIMPIEZA Y DESINFECCIÓN (L+D)
// ==========================================
export interface CleaningPlan {
  id: string;
  code: string;
  zone: string; // e.g., "Cocina Principal", "Cámara Frigorífica Carne"
  element: string; // e.g., "Plancha de cromo", "Campana extractora"
  frequency: HaccpFrequencyType;
  chemicalProduct: string; // e.g., "Detergente Clorado Sanifood 100"
  concentration: string; // e.g., "2% en agua a 50ºC"
  contactTimeMinutes: number; // e.g., 15
  protectiveEquipment: string[]; // e.g., ["Guantes de nitrilo", "Gafas de protección"]
  responsibleRole: string;
  instructions: string;
  checklistItems: string[];
}

export interface CleaningLog {
  id: string;
  planId: string;
  zone: string;
  element: string;
  completedDate: string;
  completedTime: string;
  operatorName: string;
  verifiedBy?: string;
  chemicalProductUsed: string;
  concentrationUsed: string;
  status: 'CONFORME' | 'NO_CONFORME' | 'CORREGIDO';
  checklistCompleted: boolean[];
  photoUrl?: string;
  digitalSignature?: string;
  notes?: string;
}

// ==========================================
// CHECKLISTS SANITARIOS (APERTURA, CIERRE, HIGIENE)
// ==========================================
export type ChecklistCategory =
  | 'APERTURA'
  | 'CIERRE'
  | 'COCINA'
  | 'BARRA'
  | 'SALA'
  | 'TERRAZA'
  | 'ALMACEN'
  | 'LIMPIEZA'
  | 'SEGURIDAD';

export interface ChecklistQuestion {
  id: string;
  text: string;
  category: ChecklistCategory;
  isCritical: boolean;
}

export interface ChecklistTemplate {
  id: string;
  code: string;
  title: string;
  category: ChecklistCategory;
  frequency: HaccpFrequencyType;
  questions: ChecklistQuestion[];
}

export interface ChecklistExecution {
  id: string;
  templateId: string;
  templateTitle: string;
  category: ChecklistCategory;
  date: string;
  time: string;
  operatorName: string;
  answers: { questionId: string; questionText: string; isPassed: boolean; notes?: string }[];
  totalQuestions: number;
  passedQuestions: number;
  compliancePercentage: number;
  status: 'APROBADO' | 'RECHAZADO' | 'CON_OBSERVACIONES';
  supervisorSignature?: string;
}

// ==========================================
// TRAZABILIDAD ALIMENTARIA (LOTES, FEFO, FIFO)
// ==========================================
export type TraceabilityMovementType =
  | 'RECEPCION'
  | 'PRODUCCION_INTERNA'
  | 'CONSUMO_COCINA'
  | 'VENTA_TPV'
  | 'DESTRUCCION'
  | 'RETIRADA_SANITARIA';

export interface FoodLot {
  id: string;
  lotNumber: string;
  productName: string;
  category: string; // e.g. "Carne Vacuno", "Pescado", "Lácteos"
  supplierName: string;
  supplierSanitaryRegister?: string; // RGSEAA
  mfgDate: string;
  receptionDate: string;
  expiryDate: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string; // "kg", "l", "ud"
  storageLocation: string; // e.g. "Cámara Frigorífica 1"
  refrigerationRequired: boolean;
  targetMinTemp?: number;
  targetMaxTemp?: number;
  status: 'ACTIVO' | 'AGOTADO' | 'CADUCADO' | 'BLOQUEADO_RETIRADO';
  allergensPresent: string[];
}

export interface TraceabilityMovement {
  id: string;
  lotId: string;
  lotNumber: string;
  productName: string;
  movementType: TraceabilityMovementType;
  quantity: number;
  unit: string;
  timestamp: string;
  referenceDoc?: string; // e.g. "Albarán ALB-884", "Comanda #402", "Retirada Alerta 2026-04"
  operatorName: string;
  notes?: string;
}

// ==========================================
// ALÉRGENOS 14 EU REGULATION (UE 1169/2011)
// ==========================================
export type EUAllergenCode =
  | 'GLUTEN'
  | 'CRUSTACEOS'
  | 'HUEVOS'
  | 'PESCADO'
  | 'CACAHUETES'
  | 'SOJA'
  | 'LECHE'
  | 'FRUTOS_SECOS'
  | 'APIO'
  | 'MOSTAZA'
  | 'SESAMO'
  | 'SULFITOS'
  | 'ALTRAMUCES'
  | 'MOLUSCOS';

export interface EUAllergenDefinition {
  code: EUAllergenCode;
  name: string;
  icon: string;
  description: string;
}

export interface DishAllergenInfo {
  productId: string;
  productName: string;
  categoryName: string;
  allergensDirect: EUAllergenCode[]; // Contiene
  allergensTraces: EUAllergenCode[]; // Trazas / Puede contener
  isGlutenFree: boolean;
  isLactoseFree: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  lastUpdated: string;
}

// ==========================================
// AUDITORÍAS E INSPECCIONES SANITARIAS
// ==========================================
export type AuditType = 'INTERNA' | 'EXTERNA' | 'INSPECCION_OFICIAL' | 'CERTIFICACION_ISO';

export interface NonConformity {
  id: string;
  code: string;
  description: string;
  severity: 'LEVE' | 'GRAVE' | 'MUY_GRAVE';
  detectedDate: string;
  responsible: string;
  correctiveActionPlan: string;
  deadlineDate: string;
  resolvedDate?: string;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA' | 'VERIFICADA';
}

export interface SanitaryAudit {
  id: string;
  code: string;
  title: string;
  type: AuditType;
  auditDate: string;
  auditorName: string;
  auditorOrganization?: string;
  scorePercentage: number; // e.g., 94.5%
  resultStatus: 'EXCELENTE' | 'FAVORABLE' | 'FAVORABLE_CON_DEFICIENCIAS' | 'DESFAVORABLE';
  summary: string;
  nonConformities: NonConformity[];
  nextAuditDate?: string;
  documentUrl?: string;
}

// ==========================================
// HOMOLOGACIÓN Y CERTIFICADOS DE PROVEEDORES
// ==========================================
export interface SupplierSanitaryCert {
  id: string;
  supplierId: string;
  supplierName: string;
  rgseaaNumber: string; // Registro General Sanitario de Empresas Alimentarias
  certType: string; // e.g., "Certificado de Calidad IFS Food", "HACCP Certified"
  issueDate: string;
  expiryDate: string;
  isApproved: boolean;
  ratingScore: number; // 1 to 5 stars
  documentUrl?: string;
  lastEvaluationDate: string;
  notes?: string;
}

// ==========================================
// DOCUMENTACIÓN Y PROCEDIMIENTOS
// ==========================================
export interface QualityDocument {
  id: string;
  code: string;
  title: string;
  category: 'MANUAL_APPCC' | 'PROCEDIMIENTO' | 'GUIA_BUENAS_PRACTICAS' | 'FICHA_TECNICA' | 'NORMATIVA';
  version: string;
  uploadDate: string;
  author: string;
  fileFormat: 'PDF' | 'DOCX' | 'JPG' | 'PNG';
  fileSizeMb: number;
  tags: string[];
}
