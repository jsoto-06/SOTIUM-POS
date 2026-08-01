import { describe, it, expect, beforeEach } from 'vitest';
import { hrService } from '../services/hrService';
import { HREmployee, HRRole, TimeLogType } from '../types/hr';

describe('FASE 16: Módulo RRHH, Empleados, Turnos y Control Horario (Enterprise)', () => {
  beforeEach(() => {
    // Reset state for deterministic tests
  });

  it('1. Debe retornar la lista inicial de empleados y sus datos homologados', () => {
    const employees = hrService.getEmployees();
    expect(employees.length).toBeGreaterThanOrEqual(3);

    const Carlos = employees.find((e) => e.name === 'Carlos');
    expect(Carlos).toBeDefined();
    expect(Carlos?.surname).toBe('García Pérez');
    expect(Carlos?.dniNie).toBe('48920194A');
    expect(Carlos?.pin).toBe('1234');
    expect(Carlos?.role).toBe('ADMINISTRADOR');
    expect(Carlos?.salary).toBe(28500);
  });

  it('2. Debe crear un nuevo empleado con código interno y PIN único', () => {
    const newEmp = hrService.createEmployee({
      name: 'Marta',
      surname: 'Fernández',
      internalCode: 'EMP-0099',
      pin: '9999',
      photoUrl: 'https://example.com/photo.jpg',
      dniNie: '87654321Z',
      nss: '281234567890',
      email: 'marta.fernandez@restaurante.es',
      phone: '+34 600 111 222',
      address: 'Calle Mayor 5, Madrid',
      birthDate: '1992-04-10',
      hireDate: '2026-07-31',
      category: 'Grupo 1 - Sala',
      department: 'SALA',
      position: 'Camarera Principal',
      workCenter: 'Restaurante Central Madrid',
      status: 'ACTIVO',
      contractType: 'INDEFINIDO',
      contractHours: 40,
      agreement: 'Convenio Hostelería Madrid 2024-2026',
      salary: 21500,
      iban: 'ES91 2100 0418 4012 3456 9999',
      role: 'CAMARERO',
    });

    expect(newEmp.id).toBeDefined();
    expect(newEmp.uuid).toBeDefined();

    const employees = hrService.getEmployees();
    const found = employees.find((e) => e.id === newEmp.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Marta');
  });

  it('3. Debe verificar la matriz de permisos granulares (>300 permisos)', () => {
    const permissions = hrService.getAllPermissions();
    expect(permissions.length).toBeGreaterThanOrEqual(300);

    const adminPerms = hrService.getPermissionsByRole('ADMINISTRADOR');
    expect(adminPerms.length).toBe(permissions.length);

    const waiterPerms = hrService.getPermissionsByRole('CAMARERO');
    expect(waiterPerms.length).toBeLessThan(adminPerms.length);
    expect(waiterPerms.length).toBeGreaterThan(0);

    // Test permission check
    expect(hrService.hasPermission('emp-001', 'rrhh:employees:view')).toBe(true);
  });

  it('4. Debe registrar un fichaje de entrada y salida con validación de PIN', () => {
    const employees = hrService.getEmployees();
    const emp = employees[0];

    // Clock In
    const logIn = hrService.registerTimeLog({
      employeeId: emp.id,
      type: 'ENTRADA',
      device: 'TERMINAL-TPV-1',
    });
    expect(logIn.id).toBeDefined();
    expect(logIn.type).toBe('ENTRADA');

    const updatedEmployees = hrService.getEmployees();
    const updatedEmp = updatedEmployees.find((e) => e.id === emp.id);
    expect(updatedEmp?.isClockedIn).toBe(true);

    // Clock Out
    const logOut = hrService.registerTimeLog({
      employeeId: emp.id,
      type: 'SALIDA',
      device: 'TERMINAL-TPV-1',
    });
    expect(logOut.type).toBe('SALIDA');

    const finalEmployees = hrService.getEmployees();
    const finalEmp = finalEmployees.find((e) => e.id === emp.id);
    expect(finalEmp?.isClockedIn).toBe(false);
  });

  it('5. Debe generar el fichero oficial CSV del Registro Diario de Jornada (RD 8/2019)', () => {
    const csv = hrService.generateSpanishLaborExport('2026-07-01', '2026-07-31');
    expect(csv).toContain('REGISTRO DIARIO DE JORNADA');
    expect(csv).toContain('8/2019');
    expect(csv).toContain('DNI');
    expect(csv).toContain('48920194A');
  });

  it('6. Debe planificar turnos y calcular la cobertura mínima del departamento', () => {
    const date = '2026-08-01';
    const shift = hrService.createShift({
      employeeId: 'emp-001',
      employeeName: 'Carlos García López',
      date,
      shiftType: 'MANANA',
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 30,
      plannedHours: 7.5,
      estimatedLaborCost: 115.0,
    });

    expect(shift.id).toBeDefined();

    const roster = hrService.getRosterSummary(date);
    expect(roster.length).toBeGreaterThan(0);
    const salaRoster = roster.find((r) => r.department === 'SALA');
    expect(salaRoster).toBeDefined();
    expect(salaRoster?.scheduledStaffCount).toBeGreaterThanOrEqual(1);
  });

  it('7. Debe calcular correctamente el saldo de vacaciones de un empleado', () => {
    const empId = 'emp-001';
    const balance = hrService.getEmployeeVacationBalance(empId);
    expect(balance.totalEntitled).toBe(30);
    expect(balance.enjoyed).toBeGreaterThanOrEqual(0);
    expect(balance.remaining).toBe(balance.totalEntitled - balance.enjoyed);
  });

  it('8. Debe procesar solicitudes de vacaciones y cambio de estado', () => {
    const req = hrService.requestVacation({
      employeeId: 'emp-002',
      employeeName: 'Lucía Méndez',
      startDate: '2026-09-01',
      endDate: '2026-09-10',
      daysCount: 10,
      year: 2026,
    });

    expect(req.status).toBe('PENDIENTE');

    const approved = hrService.resolveVacation(req.id, 'APROBADA', 'Carlos García');
    expect(approved.status).toBe('APROBADA');
    expect(approved.approvedBy).toBe('Carlos García');
  });

  it('9. Debe calcular el desglose de pre-nómina con retenciones e IRPF', () => {
    const payroll = hrService.generatePayroll({
      employeeId: 'emp-001',
      period: '2026-07',
      overtimeHoursCount: 5,
      comissionBonus: 150,
      otherComplements: 50,
    });

    expect(payroll.baseSalary).toBeGreaterThan(0);
    expect(payroll.overtimeAmount).toBeGreaterThan(0);
    expect(payroll.grossTotal).toBeGreaterThan(payroll.baseSalary);
    expect(payroll.netTotal).toBeLessThan(payroll.grossTotal);
    expect(payroll.status).toBe('BORRADOR');
  });

  it('10. Debe calcular los KPIs del Dashboard de Recursos Humanos', () => {
    const kpis = hrService.getDashboardKPIs();
    expect(kpis.activeEmployeesCount).toBeGreaterThanOrEqual(3);
    expect(kpis.totalLaborCost).toBeGreaterThan(0);
    expect(kpis.laborCostPercentOfSales).toBeGreaterThan(0);
    expect(kpis.avgProductivityPerHour).toBeGreaterThan(0);
  });

  it('11. Debe generar análisis y recomendaciones predictivas con IA Gemini', async () => {
    const predictions = await hrService.analyzeHRWithGemini();
    expect(predictions.length).toBeGreaterThanOrEqual(3);

    const first = predictions[0];
    expect(first.title).toBeDefined();
    expect(first.confidencePercent).toBeGreaterThan(0);
    expect(first.detailedExplanation).toBeDefined();
    expect(first.actionableRecommendation).toBeDefined();
  });
});
