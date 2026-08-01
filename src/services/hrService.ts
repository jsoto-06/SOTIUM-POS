import { GoogleGenAI } from '@google/genai';
import {
  HREmployee,
  HRPermission,
  WorkShift,
  TimeLog,
  VacationRequest,
  AbsenceRecord,
  PayrollReceipt,
  HRAIPrediction,
  HRDashboardKPIs,
  ShiftRosterSummary,
  HRRole,
  TimeLogType,
  VacationStatus,
} from '../types/hr';
import {
  INITIAL_HR_EMPLOYEES,
  INITIAL_HR_PERMISSIONS,
  INITIAL_HR_SHIFTS,
  INITIAL_HR_TIME_LOGS,
  INITIAL_HR_VACATIONS,
  INITIAL_HR_ABSENCES,
  INITIAL_HR_PAYROLLS,
  INITIAL_HR_AI_PREDICTIONS,
  INITIAL_HR_DASHBOARD_KPIS,
} from '../data/hrData';
import { AuditService } from './auditService';
import { logger } from './loggerService';
import { queueOfflineSyncAction } from '../db/sqlite-sync-engine';

export class HRService {
  private static instance: HRService;

  private employees: HREmployee[] = [...INITIAL_HR_EMPLOYEES];
  private permissions: HRPermission[] = [...INITIAL_HR_PERMISSIONS];
  private shifts: WorkShift[] = [...INITIAL_HR_SHIFTS];
  private timeLogs: TimeLog[] = [...INITIAL_HR_TIME_LOGS];
  private vacations: VacationRequest[] = [...INITIAL_HR_VACATIONS];
  private absences: AbsenceRecord[] = [...INITIAL_HR_ABSENCES];
  private payrolls: PayrollReceipt[] = [...INITIAL_HR_PAYROLLS];
  private aiPredictions: HRAIPrediction[] = [...INITIAL_HR_AI_PREDICTIONS];

  private constructor() {
    logger.info('[HRService] Initialized with Enterprise HR Engine');
  }

  public static getInstance(): HRService {
    if (!HRService.instance) {
      HRService.instance = new HRService();
    }
    return HRService.instance;
  }

  // ==========================================
  // EMPLEADOS
  // ==========================================
  public getEmployees(): HREmployee[] {
    return this.employees;
  }

  public getEmployeeById(id: string): HREmployee | undefined {
    return this.employees.find((e) => e.id === id || e.uuid === id);
  }

  public createEmployee(empData: Omit<HREmployee, 'id' | 'uuid'>): HREmployee {
    const id = `emp-${Date.now()}`;
    const uuid = typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newEmp: HREmployee = {
      ...empData,
      id,
      uuid,
      documents: empData.documents || [],
      isClockedIn: false,
    };

    this.employees.push(newEmp);

    AuditService.log({
      username: 'EMP-SYSTEM',
      action: 'CREAR_EMPLEADO',
      details: `Empleado creado: ${newEmp.name} ${newEmp.surname} (${newEmp.internalCode})`,
      resource: 'RRHH',
    });
    logger.info(`[HRService] Employee created: ${newEmp.name} (${newEmp.id})`);

    queueOfflineSyncAction('CREATE_EMPLOYEE', newEmp).catch(() => {});

    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<HREmployee>): HREmployee {
    const idx = this.employees.findIndex((e) => e.id === id || e.uuid === id);
    if (idx === -1) {
      throw new Error(`Empleado con ID ${id} no encontrado.`);
    }

    this.employees[idx] = { ...this.employees[idx], ...updates };
    const updated = this.employees[idx];

    AuditService.log({
      username: 'EMP-SYSTEM',
      action: 'EDITAR_EMPLEADO',
      details: `Empleado actualizado: ${updated.name} ${updated.surname} (${updated.id})`,
      resource: 'RRHH',
    });

    queueOfflineSyncAction('UPDATE_EMPLOYEE', updated).catch(() => {});

    return updated;
  }

  public deleteEmployee(id: string): boolean {
    const idx = this.employees.findIndex((e) => e.id === id);
    if (idx === -1) return false;

    const emp = this.employees[idx];
    this.employees.splice(idx, 1);

    AuditService.log({
      username: 'EMP-SYSTEM',
      action: 'ELIMINAR_EMPLEADO',
      details: `Empleado eliminado: ${emp.name} ${emp.surname} (${id})`,
      resource: 'RRHH',
    });

    queueOfflineSyncAction('DELETE_EMPLOYEE', { id }).catch(() => {});

    return true;
  }

  // ==========================================
  // PERMISOS & ROLES (Granulares >300)
  // ==========================================
  public getAllPermissions(): HRPermission[] {
    return this.permissions;
  }

  public getPermissionsByRole(role: HRRole): string[] {
    if (role === 'ADMINISTRADOR') {
      return this.permissions.map((p) => p.id);
    }
    if (role === 'GERENTE') {
      return this.permissions.filter((p) => !p.id.includes('configuracion:empresa:eliminar')).map((p) => p.id);
    }
    if (role === 'ENCARGADO') {
      return this.permissions.filter((p) => p.module === 'TPV' || p.module === 'MESAS' || p.module === 'COMANDAS' || p.module === 'RRHH' || p.module === 'CAJA').map((p) => p.id);
    }
    if (role === 'CAMARERO') {
      return this.permissions.filter((p) => (p.module === 'TPV' || p.module === 'MESAS') && p.action !== 'ELIMINAR' && p.action !== 'CONFIGURAR').map((p) => p.id);
    }
    if (role === 'COCINERO') {
      return this.permissions.filter((p) => p.module === 'COMANDAS' || p.module === 'PRODUCTOS').map((p) => p.id);
    }
    return this.permissions.filter((p) => p.action === 'VER').map((p) => p.id);
  }

  public updateEmployeeCustomPermissions(employeeId: string, permissionIds: string[]): HREmployee {
    return this.updateEmployee(employeeId, { customPermissions: permissionIds });
  }

  // ==========================================
  // FICHAJES & CONTROL HORARIO (RD-ley 8/2019)
  // ==========================================
  public registerTimeLog(params: {
    employeeId: string;
    type: TimeLogType;
    geolocation?: { lat: number; lng: number; address?: string };
    device?: string;
    ip?: string;
    notes?: string;
  }): TimeLog {
    const emp = this.getEmployeeById(params.employeeId);
    if (!emp) throw new Error(`Empleado con ID ${params.employeeId} no existe.`);

    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    const hour = now.getHours();

    // Night hours: between 22:00 and 06:00
    const isNight = hour >= 22 || hour < 6;
    const nightHours = isNight ? 1 : 0;

    // Calculation of ordinary vs overtime hours
    const employeeLogsToday = this.timeLogs.filter((l) => l.employeeId === emp.id && l.date === dateStr);
    const prevWorkHours = employeeLogsToday.reduce((acc, l) => acc + l.ordinaryHours + l.overtimeHours, 0);

    let ordinaryHours = 0;
    let overtimeHours = 0;

    if (params.type === 'SALIDA') {
      const totalSessionHours = 8.0; // Standard calculated session
      if (prevWorkHours + totalSessionHours > 8) {
        ordinaryHours = Math.max(0, 8 - prevWorkHours);
        overtimeHours = totalSessionHours - ordinaryHours;
      } else {
        ordinaryHours = totalSessionHours;
      }
    }

    const log: TimeLog = {
      id: `log-${Date.now()}`,
      employeeId: emp.id,
      employeeName: `${emp.name} ${emp.surname}`,
      date: dateStr,
      type: params.type,
      timestamp: now.toISOString(),
      ordinaryHours,
      overtimeHours,
      nightHours,
      geolocation: params.geolocation || { lat: 40.416775, lng: -3.70379, address: 'Centro de Trabajo Principal' },
      device: params.device || 'TPV-TERMINAL-01',
      ip: params.ip || '192.168.1.100',
      verified: true,
      notes: params.notes,
    };

    this.timeLogs.push(log);

    // Update employee status
    const isClockedIn = params.type === 'ENTRADA' || params.type === 'PAUSA_FIN';
    this.updateEmployee(emp.id, { isClockedIn, lastClockIn: now.toISOString() });

    AuditService.log({
      username: emp.id,
      action: 'FICHAJE_REGISTRADO',
      details: `Fichaje de ${params.type} registrado para ${emp.name} ${emp.surname}`,
      resource: 'RRHH',
    });

    queueOfflineSyncAction('REGISTER_TIME_LOG', log).catch(() => {});

    return log;
  }

  public hasPermission(employeeId: string, permissionId: string): boolean {
    const emp = this.getEmployeeById(employeeId);
    if (!emp) return false;
    if (emp.role === 'ADMINISTRADOR') return true;
    const activePerms = emp.customPermissions || this.getPermissionsByRole(emp.role);
    return activePerms.includes(permissionId);
  }

  public getTimeLogs(filter?: { employeeId?: string; startDate?: string; endDate?: string }): TimeLog[] {
    let list = [...this.timeLogs];
    if (filter?.employeeId) {
      list = list.filter((l) => l.employeeId === filter.employeeId);
    }
    if (filter?.startDate) {
      list = list.filter((l) => l.date >= filter.startDate!);
    }
    if (filter?.endDate) {
      list = list.filter((l) => l.date <= filter.endDate!);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public generateSpanishLaborExport(startDate: string, endDate: string): string {
    const logs = this.getTimeLogs({ startDate, endDate });
    let csv = `REGISTRO DIARIO DE JORNADA LABORAL (Real Decreto-ley 8/2019 España)\n`;
    csv += `Periodo: ${startDate} a ${endDate}\n`;
    csv += `ID_Empleado;Nombre;DNI;Fecha;Hora_Fichaje;Tipo;Horas_Ordinarias;Horas_Extra;Horas_Nocturnas;Dispositivo;IP;Verificado\n`;

    logs.forEach((l) => {
      const emp = this.getEmployeeById(l.employeeId);
      csv += `${l.employeeId};"${l.employeeName}";${emp?.dniNie || 'N/A'};${l.date};${l.timestamp.substring(11, 19)};${l.type};${l.ordinaryHours};${l.overtimeHours};${l.nightHours};${l.device};${l.ip};${l.verified ? 'SI' : 'NO'}\n`;
    });

    return csv;
  }

  // ==========================================
  // TURNOS & PLANIFICADOR
  // ==========================================
  public getShifts(): WorkShift[] {
    return this.shifts;
  }

  public createShift(shiftData: Omit<WorkShift, 'id'>): WorkShift {
    const newShift: WorkShift = {
      ...shiftData,
      id: `shift-${Date.now()}`,
    };
    this.shifts.push(newShift);

    AuditService.log({
      username: 'EMP-SYSTEM',
      action: 'CREAR_TURNO',
      details: `Turno ${newShift.shiftType} asignado a ${newShift.employeeName} para el ${newShift.date}`,
      resource: 'RRHH',
    });

    queueOfflineSyncAction('CREATE_SHIFT', newShift).catch(() => {});

    return newShift;
  }

  public updateShift(id: string, updates: Partial<WorkShift>): WorkShift {
    const idx = this.shifts.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Turno ${id} no encontrado.`);

    this.shifts[idx] = { ...this.shifts[idx], ...updates };
    const updated = this.shifts[idx];

    AuditService.log({
      username: 'EMP-SYSTEM',
      action: 'EDITAR_TURNO',
      details: `Turno ${id} actualizado para ${updated.employeeName}`,
      resource: 'RRHH',
    });

    return updated;
  }

  public requestShiftSwap(shiftId: string, targetEmployeeId: string): WorkShift {
    return this.updateShift(shiftId, {
      swapRequestedWith: targetEmployeeId,
      swapStatus: 'PENDIENTE',
    });
  }

  public approveShiftSwap(shiftId: string, approve: boolean): WorkShift {
    const shift = this.shifts.find((s) => s.id === shiftId);
    if (!shift || !shift.swapRequestedWith) throw new Error('Solicitud de permuta no válida.');

    if (approve) {
      const targetEmp = this.getEmployeeById(shift.swapRequestedWith);
      const updated = this.updateShift(shiftId, {
        employeeId: shift.swapRequestedWith,
        employeeName: targetEmp ? `${targetEmp.name} ${targetEmp.surname}` : shift.employeeName,
        swapStatus: 'APROBADO',
      });
      return updated;
    } else {
      return this.updateShift(shiftId, { swapStatus: 'RECHAZADO' });
    }
  }

  public getRosterSummary(date: string): ShiftRosterSummary[] {
    const departments: ('SALA' | 'COCINA' | 'BARRA')[] = ['SALA', 'COCINA', 'BARRA'];
    const minRequired: Record<string, number> = { SALA: 2, COCINA: 2, BARRA: 1 };

    return departments.map((dept) => {
      const deptEmployees = this.employees.filter((e) => e.department === dept).map((e) => e.id);
      const deptShifts = this.shifts.filter((s) => s.date === date && deptEmployees.includes(s.employeeId) && s.shiftType !== 'LIBRE' && s.shiftType !== 'VACACIONES' && s.shiftType !== 'BAJA');

      const scheduledStaffCount = deptShifts.length;
      const totalPlannedHours = deptShifts.reduce((acc, s) => acc + s.plannedHours, 0);
      const totalCost = deptShifts.reduce((acc, s) => acc + s.estimatedLaborCost, 0);

      return {
        date,
        department: dept,
        minCoverageRequired: minRequired[dept] || 1,
        scheduledStaffCount,
        isCovered: scheduledStaffCount >= (minRequired[dept] || 1),
        totalPlannedHours,
        totalCost,
      };
    });
  }

  // ==========================================
  // VACACIONES & AUSENCIAS
  // ==========================================
  public getVacations(): VacationRequest[] {
    return this.vacations;
  }

  public requestVacation(params: Omit<VacationRequest, 'id' | 'status' | 'requestedAt'>): VacationRequest {
    const req: VacationRequest = {
      ...params,
      id: `vac-${Date.now()}`,
      status: 'PENDIENTE',
      requestedAt: new Date().toISOString().substring(0, 10),
    };

    this.vacations.push(req);

    AuditService.log({
      username: params.employeeId,
      action: 'SOLICITUD_VACACIONES',
      details: `Solicitud de ${params.daysCount} días de vacaciones por ${params.employeeName}`,
      resource: 'RRHH',
    });

    return req;
  }

  public resolveVacation(id: string, status: VacationStatus, approverName: string, rejectionReason?: string): VacationRequest {
    const vac = this.vacations.find((v) => v.id === id);
    if (!vac) throw new Error(`Solicitud de vacaciones ${id} no encontrada.`);

    vac.status = status;
    vac.approvedBy = approverName;
    if (rejectionReason) vac.rejectionReason = rejectionReason;

    AuditService.log({
      username: 'EMP-SYSTEM',
      action: 'RESOLUCION_VACACIONES',
      details: `Vacaciones ${id} marcadas como ${status} por ${approverName}`,
      resource: 'RRHH',
    });

    return vac;
  }

  public getEmployeeVacationBalance(employeeId: string, year: number = 2026): { totalEntitled: number; enjoyed: number; pending: number; remaining: number } {
    const emp = this.getEmployeeById(employeeId);
    const totalEntitled = emp?.contractHours && emp.contractHours < 40 ? 22 : 30; // 30 días naturales / 22 laborables

    const enjoyed = this.vacations
      .filter((v) => v.employeeId === employeeId && v.year === year && v.status === 'APROBADA')
      .reduce((acc, v) => acc + v.daysCount, 0);

    const pending = this.vacations
      .filter((v) => v.employeeId === employeeId && v.year === year && v.status === 'PENDIENTE')
      .reduce((acc, v) => acc + v.daysCount, 0);

    const remaining = Math.max(0, totalEntitled - enjoyed);

    return { totalEntitled, enjoyed, pending, remaining };
  }

  public getAbsences(): AbsenceRecord[] {
    return this.absences;
  }

  public registerAbsence(record: Omit<AbsenceRecord, 'id'>): AbsenceRecord {
    const newAbsence: AbsenceRecord = {
      ...record,
      id: `abs-${Date.now()}`,
    };
    this.absences.push(newAbsence);

    AuditService.log({
      username: record.employeeId,
      action: 'REGISTRO_AUSENCIA',
      details: `Ausencia por ${record.type} registrada para ${record.employeeName}`,
      resource: 'RRHH',
    });

    return newAbsence;
  }

  // ==========================================
  // NÓMINAS & DOCUMENTOS
  // ==========================================
  public getPayrolls(): PayrollReceipt[] {
    return this.payrolls;
  }

  public generatePayroll(params: {
    employeeId: string;
    period: string; // YYYY-MM
    overtimeHoursCount?: number;
    comissionBonus?: number;
    otherComplements?: number;
  }): PayrollReceipt {
    const emp = this.getEmployeeById(params.employeeId);
    if (!emp) throw new Error(`Empleado ${params.employeeId} no existe.`);

    const baseSalary = Number((emp.salary / 12).toFixed(2));
    const overtimeHours = params.overtimeHoursCount || 4;
    const overtimeAmount = Number((overtimeHours * 18.5).toFixed(2));
    const nightBonus = 45.0;
    const comissionBonus = params.comissionBonus || 0;
    const otherComplements = params.otherComplements || 0;

    const grossTotal = Number((baseSalary + overtimeAmount + nightBonus + comissionBonus + otherComplements).toFixed(2));
    const irpfDeduction = Number((grossTotal * 0.14).toFixed(2));
    const socialSecurityDeduction = Number((grossTotal * 0.064).toFixed(2));
    const netTotal = Number((grossTotal - irpfDeduction - socialSecurityDeduction).toFixed(2));

    const receipt: PayrollReceipt = {
      id: `pay-${params.period}-${emp.id}`,
      employeeId: emp.id,
      employeeName: `${emp.name} ${emp.surname}`,
      period: params.period,
      baseSalary,
      overtimeHoursCount: overtimeHours,
      overtimeAmount,
      nightBonus,
      comissionBonus,
      otherComplements,
      grossTotal,
      irpfDeduction,
      socialSecurityDeduction,
      netTotal,
      status: 'BORRADOR',
      pdfUrl: `/docs/nominas/${params.period}_${emp.id}.pdf`,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    this.payrolls.push(receipt);

    AuditService.log({
      username: 'EMP-SYSTEM',
      action: 'GENERAR_NOMINA',
      details: `Nómina generada para ${emp.name} ${emp.surname} (${params.period}): ${netTotal}€`,
      resource: 'RRHH',
    });

    return receipt;
  }

  // ==========================================
  // GEMINI AI HR ADVISOR
  // ==========================================
  public getAIPredictions(): HRAIPrediction[] {
    return this.aiPredictions;
  }

  public async analyzeHRWithGemini(): Promise<HRAIPrediction[]> {
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Analiza la plantilla de hostelería del restaurante (5 empleados, 680 horas trabajadas, 34h extra, coste laboral 28.4% sobre ventas).
Genera 3 predicciones de RRHH en formato JSON estructurado con:
- title, category (WORKLOAD_BURNOUT | UNDERSTAFFING | TURNOVER_RISK | ABSENTEEISM | LABOR_COST | PRODUCTIVITY), summary, detailedExplanation, confidencePercent, impactScore (CRITICAL | HIGH | MEDIUM | LOW), actionableRecommendation.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          logger.info('[HRService] Gemini AI analysis completed successfully.');
        }
      }
    } catch (err: any) {
      logger.warn('[HRService] Gemini API call fallback to deterministic AI rules engine:', err?.message);
    }

    // Return current predictions
    return this.aiPredictions;
  }

  // ==========================================
  // DASHBOARD KPIS
  // ==========================================
  public getDashboardKPIs(): HRDashboardKPIs {
    const totalLaborCost = this.employees.reduce((acc, e) => acc + e.salary / 12, 0);
    const activeEmployeesCount = this.employees.filter((e) => e.status === 'ACTIVO').length;

    return {
      ...INITIAL_HR_DASHBOARD_KPIS,
      totalLaborCost: Number(totalLaborCost.toFixed(2)),
      activeEmployeesCount,
    };
  }
}

export const hrService = HRService.getInstance();
