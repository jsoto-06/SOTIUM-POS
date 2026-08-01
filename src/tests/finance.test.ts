import { describe, it, expect } from 'vitest';
import { financeService } from '../services/financeService';

describe('FASE 17 - Contabilidad, Tesorería y Finanzas Enterprise Tests', () => {
  it('1. Debe recuperar el Plan General Contable (PGC 2007) homologado', () => {
    const pgc = financeService.getPGCAccounts();
    expect(pgc.length).toBeGreaterThan(10);
    const caja = pgc.find((a) => a.code === '57000001');
    expect(caja).toBeDefined();
    expect(caja?.title).toContain('Caja');
  });

  it('2. Debe crear un asiento contable cuadrado (Debe == Haber) y actualizar saldos PGC', () => {
    const initialEntries = financeService.getJournalEntries().length;

    const newEntry = financeService.createJournalEntry({
      concept: 'Factura Compra Insumos Cocina',
      date: '2026-07-31',
      documentType: 'FACTURA_COMPRA',
      documentRef: 'F-PROV-999',
      lines: [
        { subaccountCode: '60000002', concept: 'Compra carnes', debit: 500, credit: 0 },
        { subaccountCode: '47200021', concept: 'IVA Soportado 10%', debit: 50, credit: 0 },
        { subaccountCode: '40000002', concept: 'Mercamadrid', debit: 0, credit: 550 },
      ],
      user: 'CONTABLE_TEST',
    });

    expect(newEntry.isBalanced).toBe(true);
    expect(newEntry.totalDebit).toBe(550);
    expect(newEntry.totalCredit).toBe(550);
    expect(financeService.getJournalEntries().length).toBe(initialEntries + 1);
  });

  it('3. Debe rechazar la creación de un asiento contable descuadrado', () => {
    expect(() => {
      financeService.createJournalEntry({
        concept: 'Asiento Descuadrado Erróneo',
        date: '2026-07-31',
        documentType: 'MANUAL',
        lines: [
          { subaccountCode: '60000001', concept: 'Gasto', debit: 100, credit: 0 },
          { subaccountCode: '57200001', concept: 'Banco', debit: 0, credit: 80 },
        ],
      });
    }).toThrow(/Asiento no cuadrado/);
  });

  it('4. Debe calcular correctamente la Cuenta de Pérdidas y Ganancias (PyG) y EBITDA', () => {
    const pandl = financeService.getProfitAndLossStatement(2026);
    expect(pandl.netTurnover).toBeGreaterThan(0);
    expect(pandl.grossMargin).toBe(pandl.netTurnover - pandl.rawMaterialsCost);
    expect(pandl.ebitda).toBeGreaterThan(0);
    expect(pandl.netProfit).toBeGreaterThan(0);
  });

  it('5. Debe registrar movimientos de tesorería y actualizar el saldo del banco', () => {
    const banks = financeService.getBankAccounts();
    const bbva = banks.find((b) => b.id === 'bank-001');
    const prevBalance = bbva?.currentBalance || 0;

    const mov = financeService.addTreasuryMovement({
      bankAccountId: 'bank-001',
      accountName: 'BBVA Cuenta Principal',
      date: '2026-07-31',
      type: 'COBRO_CLIENTE',
      paymentMethod: 'TRANSFERENCIA',
      concept: 'Cobro abono evento catering',
      amount: 1200,
      entityName: 'Cliente Eventos S.L.',
    });

    expect(mov.amount).toBe(1200);
    expect(mov.isReconciled).toBe(false);

    const updatedBanks = financeService.getBankAccounts();
    const updatedBbva = updatedBanks.find((b) => b.id === 'bank-001');
    expect(updatedBbva?.currentBalance).toBe(prevBalance + 1200);
  });

  it('6. Debe conciliar un movimiento bancario correctamente', () => {
    const movements = financeService.getTreasuryMovements();
    const pendingMov = movements.find((m) => !m.isReconciled);
    expect(pendingMov).toBeDefined();

    const reconciled = financeService.reconcileMovement(pendingMov!.id);
    expect(reconciled.isReconciled).toBe(true);
    expect(reconciled.reconciliationId).toBeDefined();
  });

  it('7. Debe emitir factura comercial con numeración correlativa y generar vencimiento automático', () => {
    const initialDueDates = financeService.getDueDates().length;

    const invoice = financeService.createInvoice({
      type: 'EMITIDA',
      series: 'F2026',
      issuerName: 'Sotium POS España S.L.',
      issuerDniCif: 'B89201948',
      recipientName: 'Empresa Cliente TEST S.L.',
      recipientDniCif: 'B11223344',
      items: [{ description: 'Servicio de Menú Ejecutivo 20 pax', quantity: 20, unitPrice: 25, vatRate: 10 }],
      paymentMethod: 'TRANSFERENCIA',
      dueDate: '2026-08-30',
    });

    expect(invoice.number).toContain('F2026-');
    expect(invoice.taxableBase).toBe(500);
    expect(invoice.vatTotal).toBe(50);
    expect(invoice.grandTotal).toBe(550);
    expect(financeService.getDueDates().length).toBe(initialDueDates + 1);
  });

  it('8. Debe generar XML de Facturae 3.2.2 válido para administraciones públicas', () => {
    const invoices = financeService.getInvoices();
    const xmlData = financeService.generateFacturaeXML(invoices[0].id);

    expect(xmlData.xmlSchemaVersion).toBe('3.2.2');
    expect(xmlData.xmlString).toContain('<fe:Facturae');
    expect(xmlData.xmlString).toContain('<SchemaVersion>3.2.2</SchemaVersion>');
    expect(xmlData.isSigned).toBe(true);
  });

  it('9. Debe exportar registros del Suministro Inmediato de Información (SII AEAT)', () => {
    const siiRecords = financeService.exportSIIRecords();
    expect(siiRecords.length).toBeGreaterThan(0);
    expect(siiRecords[0].aeatStatus).toBe('ACEPTADO');
    expect(siiRecords[0].aeatCsvCode).toContain('CSV-AEAT-');
  });

  it('10. Debe generar remesa SEPA ISO 20022 XML pain.008 para adeudos directos', () => {
    const remittance = financeService.generateSEPARemittance([
      { debtorCreditorName: 'Cliente A', iban: 'ES9100000000000000000000', bic: 'BBVAESMMXXX', amount: 100, concept: 'Cobro 1', dueDate: '2026-08-01' },
      { debtorCreditorName: 'Cliente B', iban: 'ES4800000000000000000000', bic: 'CAIXESBBXXX', amount: 200, concept: 'Cobro 2', dueDate: '2026-08-01' },
    ]);

    expect(remittance.type).toBe('ADEUDO_CORE');
    expect(remittance.totalAmount).toBe(300);
    expect(remittance.status).toBe('GENERADO_XML');
    expect(remittance.xmlContent).toContain('urn:iso:std:iso:20022:tech:xsd:pain.008.001.02');
  });
});
