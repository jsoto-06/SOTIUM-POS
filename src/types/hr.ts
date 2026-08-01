export type HRRole =
  | 'ADMINISTRADOR'
  | 'GERENTE'
  | 'ENCARGADO'
  | 'SUPERVISOR'
  | 'CAMARERO'
  | 'COCINERO'
  | 'BARRA'
  | 'REPARTIDOR'
  | 'CAJA'
  | 'COMPRAS'
  | 'ALMACEN'
  | 'RRHH'
  | 'CONTABILIDAD'
  | 'CUSTOM';

export type EmployeeStatus = 'ACTIVO' | 'EXCEDENCIA' | 'BAJA_MEDICA' | 'INACTIVO';

export type ContractType =
  | 'INDEFINIDO'
  | 'TEMPORAL'
  | 'DISCONTINUO'
  | 'PRACTICAS'
  | 'FORMACION'
  | 'FRACTURA';

export type HRModuleType =
  | 'TPV'
  | 'MESAS'
  | 'COMANDAS'
  | 'DELIVERY'
  | 'CLIENTES'
  | 'PRODUCTOS'
  | 'ALMACEN'
  | 'COMPRAS'
  | 'CAJA'
  | 'INFORMES'
  | 'DASHBOARD'
  | 'IA'
  | 'RESERVAS'
  | 'CUMPLIMIENTO'
  | 'RRHH'
  | 'CONFIGURACION'
  | 'AUDITORIA';

export type HRActionType =
  | 'VER'
  | 'CREAR'
  | 'EDITAR'
  | 'ELIMINAR'
  | 'APROBAR'
  | 'EXPORTAR'
  | 'CONFIGURAR'
  | 'ANULAR';

export interface HRPermission {
  id: string; // e.g., "rrhh:employees:edit"
  module: HRModuleType;
  submodule?: string;
  action: HRActionType;
  name: string;
  description: string;
}

export interface RolePermissionMatrix {
  role: HRRole;
  allowedPermissions: string[]; // permission IDs
}

export interface HRDocument {
  id: string;
  employeeId: string;
  title: string;
  type: 'CONTRATO' | 'NOMINA' | 'DNI' | 'TITULACION' | 'MUTUA' | 'FIRMA' | 'OTRO';
  fileUrl: string;
  uploadedAt: string;
  isSigned: boolean;
  signedAt?: string;
}

export interface HREmployee {
  id: string;
  uuid: string;
  internalCode: string;
  pin: string;
  name: string;
  surname: string;
  photoUrl: string;
  dniNie: string;
  nss: string; // Número de Seguridad Social
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  hireDate: string;
  terminationDate?: string;
  category: string; // e.g. "Grupo 1 - Sala"
  department: 'SALA' | 'COCINA' | 'BARRA' | 'REPARTOS' | 'ADMIN' | 'RRHH' | 'ALMACEN';
  position: string; // e.g. "Jefe de Sala", "Camarero", "Cocinero"
  workCenter: string; // Centro de Trabajo
  status: EmployeeStatus;
  contractType: ContractType;
  contractHours: number; // Horas semanales
  agreement: string; // Convenio laboral
  salary: number; // Salario bruto anual/mensual (€)
  iban: string;
  notes?: string;
  documents?: HRDocument[];
  role: HRRole;
  customPermissions?: string[];
  isClockedIn?: boolean;
  lastClockIn?: string;
}

export type TimeLogType =
  | 'ENTRADA'
  | 'SALIDA'
  | 'PAUSA_INICIO'
  | 'PAUSA_FIN'
  | 'DESCANSO'
  | 'CAMBIO_TURNO';

export interface TimeLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  type: TimeLogType;
  timestamp: string; // ISO 8601
  ordinaryHours: number;
  overtimeHours: number;
  nightHours: number; // 22:00 - 06:00
  geolocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  device: string;
  ip: string;
  verified: boolean;
  notes?: string;
}

export type ShiftType =
  | 'MANANA'
  | 'TARDE'
  | 'NOCHE'
  | 'PARTIDO'
  | 'LIBRE'
  | 'VACACIONES'
  | 'BAJA'
  | 'FESTIVO';

export interface WorkShift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  plannedHours: number;
  actualHours?: number;
  estimatedLaborCost: number; // Coste en euros
  notes?: string;
  swapRequestedWith?: string; // employeeId for permuta
  swapStatus?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
}

export type VacationStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  status: VacationStatus;
  requestedAt: string;
  approvedBy?: string;
  rejectionReason?: string;
  year: number;
}

export type AbsenceType =
  | 'ENFERMEDAD'
  | 'PERMISO'
  | 'ACCIDENTE'
  | 'MATERNIDAD'
  | 'PATERNIDAD'
  | 'FORMACION'
  | 'OTROS';

export interface AbsenceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  daysCount: number;
  medicalJustificationUrl?: string;
  notes: string;
}

export interface PayrollReceipt {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // YYYY-MM
  baseSalary: number;
  overtimeHoursCount: number;
  overtimeAmount: number;
  nightBonus: number;
  comissionBonus: number;
  otherComplements: number;
  grossTotal: number;
  irpfDeduction: number;
  socialSecurityDeduction: number;
  netTotal: number;
  status: 'BORRADOR' | 'PROCESADA' | 'PAGADA';
  pdfUrl?: string;
  createdAt: string;
}

export type HRAICategory =
  | 'WORKLOAD_BURNOUT'
  | 'UNDERSTAFFING'
  | 'TURNOVER_RISK'
  | 'ABSENTEEISM'
  | 'LABOR_COST'
  | 'PRODUCTIVITY'
  | 'ROSTER_FORECAST';

export interface HRAIPrediction {
  id: string;
  category: HRAICategory;
  title: string;
  summary: string;
  detailedExplanation: string;
  confidencePercent: number;
  impactScore: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actionableRecommendation: string;
  createdAt: string;
}

export interface HRDashboardKPIs {
  totalLaborCost: number;
  laborCostPercentOfSales: number;
  totalHoursWorked: number;
  overtimeHoursTotal: number;
  nightHoursTotal: number;
  absenteeismRatePercent: number;
  turnoverRatePercent: number;
  activeEmployeesCount: number;
  vacationsEnjoyedDays: number;
  avgProductivityPerHour: number; // € sales / hour
}

export interface ShiftRosterSummary {
  date: string;
  department: string;
  minCoverageRequired: number;
  scheduledStaffCount: number;
  isCovered: boolean;
  totalPlannedHours: number;
  totalCost: number;
}
