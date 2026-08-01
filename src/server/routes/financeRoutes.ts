import { Router, Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { financeService } from '../../services/financeService';
import { AuditService } from '../../services/auditService';

export function createFinanceRouter(io?: SocketIOServer): Router {
  const router = Router();

  const auditFinanceAccess = (action: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const user = (req as any).user?.name || 'ADMIN_USER';
      AuditService.log({ username: user, action, details: `Acceso a endpoint finanzas: ${req.originalUrl}`, resource: 'FINANZAS' });
      next();
    };
  };

  // PGC Accounts
  router.get('/pgc', auditFinanceAccess('CONSULTA_PGC'), (_req: Request, res: Response) => {
    try {
      const accounts = financeService.getPGCAccounts();
      res.json(accounts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Journal Entries (Diario)
  router.get('/journal', auditFinanceAccess('CONSULTA_DIARIO'), (req: Request, res: Response) => {
    try {
      const { fiscalYear, periodMonth, startDate, endDate } = req.query;
      const filter = {
        fiscalYear: fiscalYear ? Number(fiscalYear) : undefined,
        periodMonth: periodMonth ? Number(periodMonth) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
      };
      const entries = financeService.getJournalEntries(filter);
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/journal', auditFinanceAccess('CREAR_ASIENTO'), (req: Request, res: Response) => {
    try {
      const { concept, date, documentType, documentRef, lines } = req.body;
      const user = (req as any).user?.name || 'CONTABLE';
      const newEntry = financeService.createJournalEntry({
        concept,
        date,
        documentType,
        documentRef,
        lines,
        user,
      });

      if (io) {
        io.emit('finance:journal_updated', newEntry);
      }

      res.status(201).json(newEntry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Ledger Extract (Mayor)
  router.get('/ledger/:code', auditFinanceAccess('CONSULTA_MAYOR'), (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const extract = financeService.getLedgerExtract(code);
      res.json(extract);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // P&L & Balance Sheet
  router.get('/p-and-l', auditFinanceAccess('CONSULTA_PYG'), (req: Request, res: Response) => {
    try {
      const year = req.query.year ? Number(req.query.year) : 2026;
      const statement = financeService.getProfitAndLossStatement(year);
      res.json(statement);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/balance-sheet', auditFinanceAccess('CONSULTA_BALANCE_SITUACION'), (req: Request, res: Response) => {
    try {
      const year = req.query.year ? Number(req.query.year) : 2026;
      const sheet = financeService.getBalanceSheet(year);
      res.json(sheet);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Bank Accounts & Treasury
  router.get('/bank-accounts', auditFinanceAccess('CONSULTA_BANCOS'), (_req: Request, res: Response) => {
    try {
      const accounts = financeService.getBankAccounts();
      res.json(accounts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/treasury/movements', auditFinanceAccess('CONSULTA_TESORERIA'), (_req: Request, res: Response) => {
    try {
      const movements = financeService.getTreasuryMovements();
      res.json(movements);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/treasury/movements', auditFinanceAccess('CREAR_MOVIMIENTO_TESORERIA'), (req: Request, res: Response) => {
    try {
      const movement = financeService.addTreasuryMovement(req.body);
      if (io) io.emit('finance:treasury_updated', movement);
      res.status(201).json(movement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/treasury/reconcile', auditFinanceAccess('CONCILIACION_BANCARIA'), (req: Request, res: Response) => {
    try {
      const { movementId, notes } = req.body;
      const reconciled = financeService.reconcileMovement(movementId, notes);
      if (io) io.emit('finance:treasury_reconciled', reconciled);
      res.json(reconciled);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Invoices & Due Dates
  router.get('/invoices', auditFinanceAccess('CONSULTA_FACTURAS'), (req: Request, res: Response) => {
    try {
      const type = req.query.type as any;
      const invoices = financeService.getInvoices(type);
      res.json(invoices);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/invoices', auditFinanceAccess('CREAR_FACTURA'), (req: Request, res: Response) => {
    try {
      const newInvoice = financeService.createInvoice(req.body);
      if (io) io.emit('finance:invoice_created', newInvoice);
      res.status(201).json(newInvoice);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/due-dates', auditFinanceAccess('CONSULTA_VENCIMIENTOS'), (_req: Request, res: Response) => {
    try {
      const dueDates = financeService.getDueDates();
      res.json(dueDates);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Facturae & SII & SEPA
  router.post('/facturae/xml', auditFinanceAccess('GENERAR_FACTURAE_XML'), (req: Request, res: Response) => {
    try {
      const { invoiceId } = req.body;
      const payload = financeService.generateFacturaeXML(invoiceId);
      res.json(payload);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/sii/export', auditFinanceAccess('EXPORTAR_SII_AEAT'), (_req: Request, res: Response) => {
    try {
      const records = financeService.exportSIIRecords();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/sepa/remittance', auditFinanceAccess('GENERAR_REMASA_SEPA'), (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      const remittance = financeService.generateSEPARemittance(items);
      res.json(remittance);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Taxes
  router.get('/tax/303', auditFinanceAccess('CONSULTA_MODELO_303'), (_req: Request, res: Response) => {
    try {
      const model = financeService.getTaxModel303();
      res.json(model);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/tax/390', auditFinanceAccess('CONSULTA_MODELO_390'), (req: Request, res: Response) => {
    try {
      const year = req.query.year ? Number(req.query.year) : 2026;
      const model = financeService.getTaxModel390(year);
      res.json(model);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/tax/347', auditFinanceAccess('CONSULTA_MODELO_347'), (req: Request, res: Response) => {
    try {
      const year = req.query.year ? Number(req.query.year) : 2026;
      const items = financeService.getTaxModel347(year);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // KPIs & AI Gemini
  router.get('/kpis', auditFinanceAccess('CONSULTA_KPIS_FINANCIEROS'), (_req: Request, res: Response) => {
    try {
      const kpis = financeService.getFinancialKPIs();
      res.json(kpis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/ai/diagnosis', auditFinanceAccess('CONSULTA_DIAGNOSTICO_IA_FINANZAS'), (_req: Request, res: Response) => {
    try {
      const diagnosis = financeService.getAIFinanceDiagnosis();
      res.json(diagnosis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
