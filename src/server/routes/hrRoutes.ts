import { Router, Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { hrService } from '../../services/hrService';
import { AuditService } from '../../services/auditService';

export function createHRRouter(io?: SocketIOServer): Router {
  const router = Router();

  // Middleware for audit logging
  const auditHRAccess = (action: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const user = (req as any).user?.name || 'ADMIN_USER';
      AuditService.log({ action, resource: 'RRHH', details: `Acceso a endpoint RRHH: ${req.originalUrl}`, username: user });
      next();
    };
  };

  // ----------------------------------------
  // EMPLEADOS
  // ----------------------------------------
  router.get('/hr/employees', auditHRAccess('VER_EMPLEADOS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const employees = hrService.getEmployees();
      res.json({ success: true, count: employees.length, data: employees });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/employees', auditHRAccess('CREAR_EMPLEADO'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const newEmp = hrService.createEmployee(req.body);
      io?.emit('hr:employee_created', newEmp);
      res.status(201).json({ success: true, data: newEmp });
    } catch (err) {
      next(err);
    }
  });

  router.put('/hr/employees/:id', auditHRAccess('EDITAR_EMPLEADO'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = hrService.updateEmployee(req.params.id, req.body);
      io?.emit('hr:employee_updated', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/hr/employees/:id', auditHRAccess('ELIMINAR_EMPLEADO'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = hrService.deleteEmployee(req.params.id);
      if (success) {
        io?.emit('hr:employee_deleted', { id: req.params.id });
        res.json({ success: true, message: 'Empleado eliminado con éxito.' });
      } else {
        res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
      }
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------
  // PERMISOS & ROLES
  // ----------------------------------------
  router.get('/hr/permissions', auditHRAccess('VER_PERMISOS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = hrService.getAllPermissions();
      res.json({ success: true, count: permissions.length, data: permissions });
    } catch (err) {
      next(err);
    }
  });

  router.get('/hr/roles/:role/permissions', auditHRAccess('VER_PERMISOS_ROL'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = hrService.getPermissionsByRole(req.params.role as any);
      res.json({ success: true, role: req.params.role, data: permissions });
    } catch (err) {
      next(err);
    }
  });

  router.put('/hr/employees/:id/permissions', auditHRAccess('EDITAR_PERMISOS_EMPLEADO'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = hrService.updateEmployeeCustomPermissions(req.params.id, req.body.permissions);
      io?.emit('hr:employee_permissions_updated', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------
  // FICHAJES & CONTROL HORARIO
  // ----------------------------------------
  router.post('/hr/clock-in', auditHRAccess('REGISTRAR_ENTRADA'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = hrService.registerTimeLog({
        employeeId: req.body.employeeId,
        type: 'ENTRADA',
        geolocation: req.body.geolocation,
        device: req.body.device,
        ip: req.ip || '192.168.1.1',
        notes: req.body.notes,
      });
      io?.emit('hr:time_log_updated', log);
      res.json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/clock-out', auditHRAccess('REGISTRAR_SALIDA'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = hrService.registerTimeLog({
        employeeId: req.body.employeeId,
        type: req.body.type || 'SALIDA',
        geolocation: req.body.geolocation,
        device: req.body.device,
        ip: req.ip || '192.168.1.1',
        notes: req.body.notes,
      });
      io?.emit('hr:time_log_updated', log);
      res.json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  });

  router.get('/hr/time-logs', auditHRAccess('VER_FICHAJES'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = {
        employeeId: req.query.employeeId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const logs = hrService.getTimeLogs(filter);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      next(err);
    }
  });

  router.get('/hr/export-labor-records', auditHRAccess('EXPORTAR_REGISTRO_LABORAL'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const startDate = (req.query.startDate as string) || '2026-07-01';
      const endDate = (req.query.endDate as string) || '2026-07-31';
      const csv = hrService.generateSpanishLaborExport(startDate, endDate);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="registro_laboral_${startDate}_${endDate}.csv"`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------
  // TURNOS & PLANIFICADOR
  // ----------------------------------------
  router.get('/hr/shifts', auditHRAccess('VER_TURNOS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const shifts = hrService.getShifts();
      res.json({ success: true, count: shifts.length, data: shifts });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/shifts', auditHRAccess('CREAR_TURNO'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const shift = hrService.createShift(req.body);
      io?.emit('hr:shift_changed', shift);
      res.status(201).json({ success: true, data: shift });
    } catch (err) {
      next(err);
    }
  });

  router.put('/hr/shifts/:id', auditHRAccess('EDITAR_TURNO'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = hrService.updateShift(req.params.id, req.body);
      io?.emit('hr:shift_changed', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/shifts/:id/swap-request', auditHRAccess('SOLICITAR_PERMUTA'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = hrService.requestShiftSwap(req.params.id, req.body.targetEmployeeId);
      io?.emit('hr:shift_swap_requested', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/shifts/:id/swap-approve', auditHRAccess('APROBAR_PERMUTA'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = hrService.approveShiftSwap(req.params.id, req.body.approve);
      io?.emit('hr:shift_changed', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  });

  router.get('/hr/roster-summary', auditHRAccess('VER_RESUMEN_CUADRANTE'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().substring(0, 10);
      const summary = hrService.getRosterSummary(date);
      res.json({ success: true, date, data: summary });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------
  // VACACIONES & AUSENCIAS
  // ----------------------------------------
  router.get('/hr/vacations', auditHRAccess('VER_VACACIONES'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const vacations = hrService.getVacations();
      res.json({ success: true, count: vacations.length, data: vacations });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/vacations/request', auditHRAccess('SOLICITAR_VACACIONES'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const vac = hrService.requestVacation(req.body);
      io?.emit('hr:vacation_updated', vac);
      res.status(201).json({ success: true, data: vac });
    } catch (err) {
      next(err);
    }
  });

  router.put('/hr/vacations/:id/resolve', auditHRAccess('RESOLVER_VACACIONES'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const vac = hrService.resolveVacation(req.params.id, req.body.status, req.body.approverName || 'Gerencia', req.body.rejectionReason);
      io?.emit('hr:vacation_updated', vac);
      res.json({ success: true, data: vac });
    } catch (err) {
      next(err);
    }
  });

  router.get('/hr/vacations/balance/:employeeId', auditHRAccess('VER_SALDO_VACACIONES'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : 2026;
      const balance = hrService.getEmployeeVacationBalance(req.params.employeeId, year);
      res.json({ success: true, employeeId: req.params.employeeId, year, data: balance });
    } catch (err) {
      next(err);
    }
  });

  router.get('/hr/absences', auditHRAccess('VER_AUSENCIAS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const absences = hrService.getAbsences();
      res.json({ success: true, count: absences.length, data: absences });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/absences', auditHRAccess('REGISTRAR_AUSENCIA'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const abs = hrService.registerAbsence(req.body);
      io?.emit('hr:absence_registered', abs);
      res.status(201).json({ success: true, data: abs });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------
  // NÓMINAS & DOCUMENTOS
  // ----------------------------------------
  router.get('/hr/payrolls', auditHRAccess('VER_NOMINAS'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const payrolls = hrService.getPayrolls();
      res.json({ success: true, count: payrolls.length, data: payrolls });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/payrolls/generate', auditHRAccess('GENERAR_NOMINA'), (req: Request, res: Response, next: NextFunction) => {
    try {
      const receipt = hrService.generatePayroll(req.body);
      res.status(201).json({ success: true, data: receipt });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------
  // IA GEMINI & DASHBOARD
  // ----------------------------------------
  router.get('/hr/ai-predictions', auditHRAccess('VER_PREDICCIONES_IA'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const predictions = hrService.getAIPredictions();
      res.json({ success: true, data: predictions });
    } catch (err) {
      next(err);
    }
  });

  router.post('/hr/ai-predictions/analyze', auditHRAccess('ANALIZAR_RRHH_IA'), async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const predictions = await hrService.analyzeHRWithGemini();
      io?.emit('hr:ai_analysis_completed', predictions);
      res.json({ success: true, data: predictions });
    } catch (err) {
      next(err);
    }
  });

  router.get('/hr/dashboard', auditHRAccess('VER_DASHBOARD_RRHH'), (_req: Request, res: Response, next: NextFunction) => {
    try {
      const kpis = hrService.getDashboardKPIs();
      res.json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
