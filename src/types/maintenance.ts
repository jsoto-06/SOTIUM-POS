export type AssetType =
  | 'TPV'
  | 'TABLET'
  | 'IMPRESORA'
  | 'COMANDERA'
  | 'KDS'
  | 'HORNO'
  | 'FREIDORA'
  | 'CAMARA_FRIGORIFICA'
  | 'CONGELADOR'
  | 'LAVAVAJILLAS'
  | 'AIRE_ACONDICIONADO'
  | 'CAMPANA'
  | 'VEHICULO'
  | 'EQUIPO_INFORMATICO'
  | 'MOBILIARIO'
  | 'INSTALACION'
  | 'MAQUINARIA';

export type AssetStatus =
  | 'OPERATIVO'
  | 'EN_REVISION'
  | 'EN_REPARACION'
  | 'INACTIVO'
  | 'BAJA'
  | 'RESERVA';

export interface Asset {
  id: string; // UUID
  internalCode: string;
  barcode: string;
  qrCode: string;
  nfcCode?: string;
  name: string;
  description: string;
  type: AssetType;
  brand: string;
  model: string;
  serialNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  invoiceNumber: string;
  warrantyExpirationDate: string;
  purchaseValue: number;
  currentValue: number;
  costCenter: string;
  companyId: string;
  venueId: string;
  department: string;
  location: string;
  responsiblePerson: string;
  status: AssetStatus;
  notes: string;
  photos: string[];
  documents: { name: string; url: string; date: string }[];
  operatingHours?: number;
  kilometers?: number;
  productionCount?: number;
}

export type FrequencyType =
  | 'DIARIA'
  | 'SEMANAL'
  | 'MENSUAL'
  | 'TRIMESTRAL'
  | 'SEMESTRAL'
  | 'ANUAL'
  | 'HORAS_USO'
  | 'KILOMETROS'
  | 'PRODUCCION';

export interface PreventiveChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
}

export interface PreventivePlan {
  id: string;
  code: string;
  assetId: string;
  assetName: string;
  title: string;
  description: string;
  frequency: FrequencyType;
  frequencyValue: number; // e.g., every 1 month, or 500 hours
  checklist: PreventiveChecklistItem[];
  lastExecutionDate?: string;
  nextExecutionDate: string;
  estimatedMinutes: number;
  assignedTechnician?: string;
  active: boolean;
}

export type IncidentPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type IncidentStatus =
  | 'ABIERTA'
  | 'EN_DIAGNOSTICO'
  | 'REPARANDO'
  | 'PENDIENTE_REPUESTO'
  | 'RESUELTA'
  | 'CANCELADA';

export interface Incident {
  id: string;
  code: string;
  assetId: string;
  assetName: string;
  title: string;
  priority: IncidentPriority;
  description: string;
  photos: string[];
  videos: string[];
  documents: string[];
  responsiblePerson: string;
  assignedTechnician?: string;
  openDate: string;
  closeDate?: string;
  timeSpentMinutes: number;
  usedMaterials: { sparePartId: string; name: string; quantity: number; unitCost: number }[];
  laborCost: number;
  materialCost: number;
  totalCost: number;
  status: IncidentStatus;
}

export type WorkOrderType =
  | 'PREVENTIVO'
  | 'CORRECTIVO'
  | 'INSTALACION'
  | 'INSPECCION'
  | 'SAT';

export type WorkOrderStatus =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'ASIGNADA'
  | 'EN_CURSO'
  | 'PAUSADA'
  | 'FINALIZADA'
  | 'CANCELADA';

export interface WorkOrderSparePart {
  sparePartId: string;
  code: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface WorkOrder {
  id: string;
  code: string;
  assetId: string;
  assetName: string;
  type: WorkOrderType;
  priority: IncidentPriority;
  status: WorkOrderStatus;
  technicianId?: string;
  technicianName?: string;
  scheduledDate: string;
  scheduledTime: string;
  startDate?: string;
  endDate?: string;
  spareParts: WorkOrderSparePart[];
  laborHours: number;
  laborRate: number;
  totalLaborCost: number;
  totalCost: number;
  checklist: PreventiveChecklistItem[];
  observations: string;
  digitalSignature?: string;
  photos: string[];
  companyId: string;
  venueId: string;
}

export type SATInterventionType =
  | 'INSTALACION'
  | 'GARANTIA'
  | 'CONTRATO_MANTENIMIENTO'
  | 'VISITA_TECNICA'
  | 'URGENCIA';

export interface SATIntervention {
  id: string;
  code: string;
  assetId: string;
  assetName: string;
  clientOrVenue: string;
  providerSAT: string;
  type: SATInterventionType;
  scheduledDate: string;
  status: 'PROGRAMADA' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  technician: string;
  reportSummary: string;
  contractId?: string;
  totalCost: number;
  warrantyCovered: boolean;
}

export interface MaintenanceSparePart {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description: string;
  family: string;
  supplierId: string;
  supplierName: string;
  stock: number;
  minStock: number;
  cost: number;
  location: string;
  batchNumber?: string;
  expirationDate?: string;
  unit: string;
}

export type WarrantyStatus =
  | 'VIGENTE'
  | 'PROXIMA_VENCER'
  | 'VENCIDA'
  | 'EN_RECLAMACION';

export interface AssetWarranty {
  id: string;
  assetId: string;
  assetName: string;
  provider: string;
  manufacturer: string;
  startDate: string;
  endDate: string;
  coverageDetails: string;
  alertDaysBefore: number;
  status: WarrantyStatus;
  contactPhone?: string;
  policyNumber?: string;
}

export interface AIMaintenanceInsight {
  assetId: string;
  assetName: string;
  anomalyScore: number; // 0 - 100
  predictiveBreakdownDate?: string;
  problematicScore: number; // 0 - 100
  futureCostEstimate: number;
  excessiveMaintenanceFlag: boolean;
  recommendedReplacement: boolean;
  predictedUsefulLifeMonths: number;
  explanation: string;
  recommendations: string[];
}
