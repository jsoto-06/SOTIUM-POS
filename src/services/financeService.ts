import {
  PGCAccount,
  AccountingJournalEntry,
  AccountingEntryLine,
  ProfitAndLossStatement,
  BalanceSheetItem,
  BankAccount,
  TreasuryMovement,
  BankReconciliationItem,
  FinancialInvoice,
  FinancialDueDateItem,
  FacturaeXMLPayload,
  SIIRecord,
  SEPARemittance,
  SEPAItem,
  TaxModel303,
  TaxModel390,
  TaxModel347Item,
  TaxModel349Item,
  RetentionSummary,
  FinancialKPIs,
  FinanceAIPrediction,
} from '../types/finance';
import {
  INITIAL_PGC_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_TREASURY_MOVEMENTS,
  INITIAL_FINANCIAL_INVOICES,
  INITIAL_DUE_DATES,
  INITIAL_FINANCIAL_KPIS,
  INITIAL_AI_FINANCE_PREDICTION,
  INITIAL_TAX_MODEL_303,
  INITIAL_RETENTION_SUMMARY,
} from '../data/financeData';
import { AuditService } from './auditService';
import { logger } from './loggerService';
import { queueOfflineSyncAction } from '../db/sqlite-sync-engine';

export class FinanceService {
  private static instance: FinanceService;

  private pgcAccounts: PGCAccount[] = [...INITIAL_PGC_ACCOUNTS];
  private journalEntries: AccountingJournalEntry[] = [...INITIAL_JOURNAL_ENTRIES];
  private bankAccounts: BankAccount[] = [...INITIAL_BANK_ACCOUNTS];
  private treasuryMovements: TreasuryMovement[] = [...INITIAL_TREASURY_MOVEMENTS];
  private invoices: FinancialInvoice[] = [...INITIAL_FINANCIAL_INVOICES];
  private dueDates: FinancialDueDateItem[] = [...INITIAL_DUE_DATES];
  private reconciliations: BankReconciliationItem[] = [];
  private sepaRemittances: SEPARemittance[] = [];

  private constructor() {}

  public static getInstance(): FinanceService {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  // ==========================================
  // CONTABILIDAD - PGC, ASIENTOS, DIARIO, MAYOR
  // ==========================================

  public getPGCAccounts(): PGCAccount[] {
    return [...this.pgcAccounts];
  }

  public getJournalEntries(filter?: { fiscalYear?: number; periodMonth?: number; startDate?: string; endDate?: string }): AccountingJournalEntry[] {
    let list = [...this.journalEntries];
    if (filter?.fiscalYear) {
      list = list.filter((e) => e.fiscalYear === filter.fiscalYear);
    }
    if (filter?.periodMonth) {
      list = list.filter((e) => e.periodMonth === filter.periodMonth);
    }
    if (filter?.startDate) {
      list = list.filter((e) => e.date >= filter.startDate!);
    }
    if (filter?.endDate) {
      list = list.filter((e) => e.date <= filter.endDate!);
    }
    return list.sort((a, b) => b.entryNumber - a.entryNumber);
  }

  public createJournalEntry(params: {
    concept: string;
    date: string;
    documentType: AccountingJournalEntry['documentType'];
    documentRef?: string;
    isAutomatic?: boolean;
    lines: { subaccountCode: string; concept: string; debit: number; credit: number; taxRate?: number }[];
    user?: string;
  }): AccountingJournalEntry {
    const totalDebit = params.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = params.lines.reduce((sum, l) => sum + (l.credit || 0), 0);

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    if (!isBalanced) {
      throw new Error(`Asiento no cuadrado: Debe (${totalDebit.toFixed(2)}€) != Haber (${totalCredit.toFixed(2)}€)`);
    }

    const nextNumber = this.journalEntries.length > 0 ? Math.max(...this.journalEntries.map((e) => e.entryNumber)) + 1 : 1;
    const dateObj = new Date(params.date);

    const formattedLines: AccountingEntryLine[] = params.lines.map((l, index) => {
      const subacc = this.pgcAccounts.find((a) => a.code === l.subaccountCode);
      return {
        id: `line-${Date.now()}-${index}`,
        subaccountCode: l.subaccountCode,
        subaccountName: subacc ? subacc.title : 'Subcuenta Contable',
        concept: l.concept || params.concept,
        debit: Number(l.debit.toFixed(2)),
        credit: Number(l.credit.toFixed(2)),
        taxRate: l.taxRate,
        documentRef: params.documentRef,
      };
    });

    const newEntry: AccountingJournalEntry = {
      id: `entry-${Date.now()}`,
      entryNumber: nextNumber,
      fiscalYear: dateObj.getFullYear() || 2026,
      periodMonth: dateObj.getMonth() + 1 || 7,
      date: params.date,
      concept: params.concept,
      documentType: params.documentType,
      documentRef: params.documentRef,
      isAutomatic: !!params.isAutomatic,
      lines: formattedLines,
      totalDebit: Number(totalDebit.toFixed(2)),
      totalCredit: Number(totalCredit.toFixed(2)),
      isBalanced: true,
      status: 'ASENTADO',
      createdBy: params.user || 'SISTEMA_FINANCIERO',
      createdAt: new Date().toISOString(),
    };

    this.journalEntries.push(newEntry);

    // Actualizar saldos de subcuentas PGC
    formattedLines.forEach((l) => {
      const accIdx = this.pgcAccounts.findIndex((a) => a.code === l.subaccountCode);
      if (accIdx >= 0) {
        this.pgcAccounts[accIdx].debitBalance += l.debit;
        this.pgcAccounts[accIdx].creditBalance += l.credit;
        this.pgcAccounts[accIdx].currentBalance = this.pgcAccounts[accIdx].debitBalance - this.pgcAccounts[accIdx].creditBalance;
      }
    });

    AuditService.log({
      username: params.user || 'SISTEMA_FINANCIERO',
      action: 'CREAR_ASIENTO',
      details: `Asiento #${newEntry.entryNumber} creado (${params.concept}) por importe ${totalDebit.toFixed(2)}€`,
      resource: 'CONTABILIDAD',
    });
    logger.info(`[FinanceService] Journal entry #${newEntry.entryNumber} created`);

    queueOfflineSyncAction('CREATE_JOURNAL_ENTRY', newEntry).catch(() => {});

    return newEntry;
  }

  public getLedgerExtract(subaccountCode: string): { subaccount: PGCAccount | undefined; extract: AccountingEntryLine[] } {
    const subacc = this.pgcAccounts.find((a) => a.code === subaccountCode);
    const lines: AccountingEntryLine[] = [];

    this.journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.subaccountCode === subaccountCode) {
          lines.push({
            ...line,
            concept: `${entry.concept} - ${line.concept}`,
            documentRef: entry.documentRef || line.documentRef,
          });
        }
      });
    });

    return { subaccount: subacc, extract: lines };
  }

  public getProfitAndLossStatement(year: number = 2026): ProfitAndLossStatement {
    let sales = 0;
    let purchases = 0;
    let personnel = 0;
    let supplies = 0;

    this.journalEntries
      .filter((e) => e.fiscalYear === year && e.status === 'ASENTADO')
      .forEach((e) => {
        e.lines.forEach((l) => {
          if (l.subaccountCode.startsWith('700')) sales += l.credit - l.debit;
          if (l.subaccountCode.startsWith('600')) purchases += l.debit - l.credit;
          if (l.subaccountCode.startsWith('640') || l.subaccountCode.startsWith('642')) personnel += l.debit - l.credit;
          if (l.subaccountCode.startsWith('621') || l.subaccountCode.startsWith('628')) supplies += l.debit - l.credit;
        });
      });

    const netTurnover = sales + 78500;
    const rawMaterialsCost = purchases + 18400;
    const grossMargin = netTurnover - rawMaterialsCost;
    const personnelExpenses = personnel + 22000;
    const otherOperatingExpenses = supplies + 7000;
    const ebitda = grossMargin - personnelExpenses - otherOperatingExpenses;
    const depreciationAmortization = 2800;
    const ebit = ebitda - depreciationAmortization;
    const financialResult = -450;
    const profitBeforeTax = ebit + financialResult;
    const corporateTax = profitBeforeTax > 0 ? profitBeforeTax * 0.25 : 0;
    const netProfit = profitBeforeTax - corporateTax;

    return {
      fiscalYear: year,
      period: `Enero - Diciembre ${year}`,
      netTurnover,
      rawMaterialsCost,
      grossMargin,
      personnelExpenses,
      otherOperatingExpenses,
      ebitda,
      depreciationAmortization,
      ebit,
      financialResult,
      profitBeforeTax,
      corporateTax,
      netProfit,
    };
  }

  public getBalanceSheet(year: number = 2026): BalanceSheetItem[] {
    return [
      { code: '213', name: 'Inmovilizado Material (Maquinaria)', amount: 45000, category: 'ACTIVO_NO_CORRIENTE' },
      { code: '300', name: 'Existencias e Inventario', amount: 12500, category: 'ACTIVO_CORRIENTE' },
      { code: '430', name: 'Clientes y Deudores', amount: 6200, category: 'ACTIVO_CORRIENTE' },
      { code: '570', name: 'Caja TPV', amount: 3850, category: 'ACTIVO_CORRIENTE' },
      { code: '572', name: 'Bancos e Instituciones de Crédito', amount: 34200, category: 'ACTIVO_CORRIENTE' },
      { code: '100', name: 'Capital Social', amount: 60000, category: 'PATRIMONIO_NETO' },
      { code: '129', name: 'Resultado del Ejercicio', amount: 25162.5, category: 'PATRIMONIO_NETO' },
      { code: '400', name: 'Proveedores y Acreedores', amount: 8400, category: 'PASIVO_CORRIENTE' },
      { code: '475', name: 'Hacienda Pública Acreedora', amount: 8187.5, category: 'PASIVO_CORRIENTE' },
    ];
  }

  // ==========================================
  // TESORERÍA, BANCOS Y CONCILIACIÓN
  // ==========================================

  public getBankAccounts(): BankAccount[] {
    return [...this.bankAccounts];
  }

  public getTreasuryMovements(): TreasuryMovement[] {
    return [...this.treasuryMovements].sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  public addTreasuryMovement(movement: Omit<TreasuryMovement, 'id' | 'createdAt' | 'isReconciled'>): TreasuryMovement {
    const newMov: TreasuryMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      isReconciled: false,
      createdAt: new Date().toISOString(),
    };
    this.treasuryMovements.push(newMov);

    // Actualizar saldo de banco si aplica
    if (movement.bankAccountId) {
      const bIdx = this.bankAccounts.findIndex((b) => b.id === movement.bankAccountId);
      if (bIdx >= 0) {
        this.bankAccounts[bIdx].currentBalance += movement.amount;
      }
    }

    AuditService.log({
      username: 'SISTEMA_TESORERIA',
      action: 'MOVIMIENTO_TESORERIA',
      details: `Movimiento de ${movement.amount}€ (${movement.concept}) registrado`,
      resource: 'TESORERIA',
    });

    return newMov;
  }

  public reconcileMovement(movementId: string, notes?: string): TreasuryMovement {
    const idx = this.treasuryMovements.findIndex((m) => m.id === movementId);
    if (idx < 0) throw new Error('Movimiento no encontrado');

    this.treasuryMovements[idx].isReconciled = true;
    this.treasuryMovements[idx].reconciliationId = `rec-${Date.now()}`;

    AuditService.log({
      username: 'SISTEMA_TESORERIA',
      action: 'CONCILIACION_BANCARIA',
      details: `Movimiento ${movementId} conciliado con éxito`,
      resource: 'TESORERIA',
    });

    return this.treasuryMovements[idx];
  }

  // ==========================================
  // FACTURACIÓN & VENCIMIENTOS
  // ==========================================

  public getInvoices(type?: FinancialInvoice['type']): FinancialInvoice[] {
    if (type) return this.invoices.filter((i) => i.type === type);
    return [...this.invoices];
  }

  public createInvoice(params: {
    type: FinancialInvoice['type'];
    series: string;
    issuerName: string;
    issuerDniCif: string;
    recipientName: string;
    recipientDniCif: string;
    items: { description: string; quantity: number; unitPrice: number; vatRate: number }[];
    paymentMethod: FinancialInvoice['paymentMethod'];
    dueDate?: string;
    notes?: string;
  }): FinancialInvoice {
    const countSeries = this.invoices.filter((i) => i.series === params.series).length + 1;
    const number = `${params.series}-${String(countSeries).padStart(5, '0')}`;
    const issueDate = new Date().toISOString().substring(0, 10);
    const dueDate = params.dueDate || issueDate;

    let taxableBase = 0;
    let vatTotal = 0;

    const formattedItems = params.items.map((item) => {
      const lineBase = item.quantity * item.unitPrice;
      const lineVat = lineBase * (item.vatRate / 100);
      taxableBase += lineBase;
      vatTotal += lineVat;
      return {
        ...item,
        total: Number((lineBase + lineVat).toFixed(2)),
      };
    });

    const grandTotal = Number((taxableBase + vatTotal).toFixed(2));

    const newInvoice: FinancialInvoice = {
      id: `inv-${Date.now()}`,
      type: params.type,
      series: params.series,
      number,
      issueDate,
      dueDate,
      issuerName: params.issuerName,
      issuerDniCif: params.issuerDniCif,
      recipientName: params.recipientName,
      recipientDniCif: params.recipientDniCif,
      items: formattedItems,
      taxableBase: Number(taxableBase.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      irpfTotal: 0,
      grandTotal,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'PENDIENTE',
      paidAmount: 0,
      pendingAmount: grandTotal,
      facturaeExported: false,
      siiExported: false,
      notes: params.notes,
    };

    this.invoices.push(newInvoice);

    // Crear vencimiento automático
    const newDueDate: FinancialDueDateItem = {
      id: `due-${Date.now()}`,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.number,
      entityName: params.recipientName,
      type: params.type === 'EMITIDA' ? 'COBRO_CLIENTE' : 'PAGO_PROVEEDOR',
      dueDate,
      amount: grandTotal,
      paidAmount: 0,
      status: 'PENDIENTE',
      daysOverdue: 0,
    };
    this.dueDates.push(newDueDate);

    // Generar asiento automático de contabilidad
    this.createJournalEntry({
      concept: `Factura ${newInvoice.type} ${newInvoice.number} - ${params.recipientName}`,
      date: issueDate,
      documentType: params.type === 'EMITIDA' ? 'FACTURA_VENTA' : 'FACTURA_COMPRA',
      documentRef: newInvoice.number,
      isAutomatic: true,
      lines:
        params.type === 'EMITIDA'
          ? [
              { subaccountCode: '43000001', concept: params.recipientName, debit: grandTotal, credit: 0 },
              { subaccountCode: '47700021', concept: 'IVA Repercutido', debit: 0, credit: Number(vatTotal.toFixed(2)) },
              { subaccountCode: '70000001', concept: 'Ingreso Ventas', debit: 0, credit: Number(taxableBase.toFixed(2)) },
            ]
          : [
              { subaccountCode: '60000001', concept: 'Gasto / Compra', debit: Number(taxableBase.toFixed(2)), credit: 0 },
              { subaccountCode: '47200021', concept: 'IVA Soportado', debit: Number(vatTotal.toFixed(2)), credit: 0 },
              { subaccountCode: '40000001', concept: params.recipientName, debit: 0, credit: grandTotal },
            ],
    });

    AuditService.log({
      username: 'SISTEMA_FACTURACION',
      action: 'CREAR_FACTURA',
      details: `Factura ${newInvoice.number} emitida por importe ${grandTotal.toFixed(2)}€`,
      resource: 'FACTURACION',
    });

    return newInvoice;
  }

  public getDueDates(): FinancialDueDateItem[] {
    const today = new Date().toISOString().substring(0, 10);
    return this.dueDates.map((d) => {
      const isOverdue = d.dueDate < today && d.status === 'PENDIENTE';
      const daysOverdue = isOverdue
        ? Math.floor((new Date(today).getTime() - new Date(d.dueDate).getTime()) / (1000 * 3600 * 24))
        : 0;
      return {
        ...d,
        status: isOverdue ? 'VENCIDO' : d.status,
        daysOverdue,
      };
    });
  }

  // ==========================================
  // FACTURAE 3.2.2 & SII AEAT & SEPA XML
  // ==========================================

  public generateFacturaeXML(invoiceId: string): FacturaeXMLPayload {
    const inv = this.invoices.find((i) => i.id === invoiceId) || this.invoices[0];

    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:fe="http://www.facturae.es/Facturae/2009/v3.2.2/Facturae">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <Batch>
      <BatchIdentifier>${inv.number}</BatchIdentifier>
      <InvoicesCount>1</InvoicesCount>
      <TotalInvoicesAmount><TotalAmount>${inv.grandTotal.toFixed(2)}</TotalAmount></TotalInvoicesAmount>
      <TotalOutstandingAmount><TotalAmount>${inv.pendingAmount.toFixed(2)}</TotalAmount></TotalOutstandingAmount>
      <TotalExecutableAmount><TotalAmount>${inv.grandTotal.toFixed(2)}</TotalExecutableAmount></TotalExecutableAmount>
      <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
    </Batch>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification><PersonTypeCode>J</PersonTypeCode><ResidenceTypeCode>R</ResidenceTypeCode><TaxIdentificationNumber>${inv.issuerDniCif}</TaxIdentificationNumber></TaxIdentification>
      <LegalEntity><CorporateName>${inv.issuerName}</CorporateName></LegalEntity>
    </SellerParty>
    <BuyerParty>
      <TaxIdentification><PersonTypeCode>J</PersonTypeCode><ResidenceTypeCode>R</ResidenceTypeCode><TaxIdentificationNumber>${inv.recipientDniCif}</TaxIdentificationNumber></TaxIdentification>
      <LegalEntity><CorporateName>${inv.recipientName}</CorporateName></LegalEntity>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${inv.number}</InvoiceNumber>
        <InvoiceSeriesCode>${inv.series}</InvoiceSeriesCode>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <InvoiceClass>OO</InvoiceClass>
        <IssueDate>${inv.issueDate}</IssueDate>
      </InvoiceHeader>
      <InvoiceTotals>
        <TotalGrossAmount>${inv.taxableBase.toFixed(2)}</TotalGrossAmount>
        <TotalGeneralDiscounts>0.00</TotalGeneralDiscounts>
        <TotalGeneralSurcharges>0.00</TotalGeneralSurcharges>
        <TotalGrossAmountBeforeTaxes>${inv.taxableBase.toFixed(2)}</TotalGrossAmountBeforeTaxes>
        <TotalTaxOutputs>${inv.vatTotal.toFixed(2)}</TotalTaxOutputs>
        <TotalTaxesWithheld>0.00</TotalTaxesWithheld>
        <InvoiceTotal>${inv.grandTotal.toFixed(2)}</InvoiceTotal>
      </InvoiceTotals>
    </Invoice>
  </Invoices>
</fe:Facturae>`;

    inv.facturaeExported = true;

    return {
      invoiceNumber: inv.number,
      issueDate: inv.issueDate,
      sellerDniCif: inv.issuerDniCif,
      sellerName: inv.issuerName,
      buyerDniCif: inv.recipientDniCif,
      buyerName: inv.recipientName,
      taxableBase: inv.taxableBase,
      vatAmount: inv.vatTotal,
      totalAmount: inv.grandTotal,
      xmlSchemaVersion: '3.2.2',
      isSigned: true,
      signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
      xmlString,
    };
  }

  public exportSIIRecords(): SIIRecord[] {
    return this.invoices.map((inv) => ({
      id: `sii-${inv.id}`,
      invoiceNumber: inv.number,
      expeditionDate: inv.issueDate,
      operationDate: inv.issueDate,
      invoiceType: 'F1',
      counterpartyDniCif: inv.recipientDniCif,
      counterpartyName: inv.recipientName,
      taxableBase: inv.taxableBase,
      vatRate: 10,
      vatAmount: inv.vatTotal,
      aeatStatus: 'ACEPTADO',
      aeatCsvCode: `CSV-AEAT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      submittedAt: new Date().toISOString(),
    }));
  }

  public generateSEPARemittance(items: Omit<SEPAItem, 'id' | 'status'>[]): SEPARemittance {
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    const remittanceId = `rem-${Date.now()}`;
    const reference = `SEPA-PAIN-008-${Date.now().toString().substring(6)}`;

    const formattedItems: SEPAItem[] = items.map((i, index) => ({
      ...i,
      id: `sepa-item-${index}`,
      status: 'PENDIENTE',
    }));

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${reference}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>${items.length}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
    </GrpHdr>
  </CstmrDrctDbtInitn>
</Document>`;

    const remittance: SEPARemittance = {
      id: remittanceId,
      reference,
      creationDate: new Date().toISOString().substring(0, 10),
      executionDate: new Date().toISOString().substring(0, 10),
      type: 'ADEUDO_CORE',
      bankAccountId: 'bank-001',
      totalAmount: Number(totalAmount.toFixed(2)),
      itemsCount: items.length,
      items: formattedItems,
      status: 'GENERADO_XML',
      xmlContent,
    };

    this.sepaRemittances.push(remittance);
    return remittance;
  }

  // ==========================================
  // IMPUESTOS MODELOS 303, 390, 347, 349, 111
  // ==========================================

  public getTaxModel303(): TaxModel303 {
    return { ...INITIAL_TAX_MODEL_303 };
  }

  public getTaxModel390(year: number = 2026): TaxModel390 {
    return {
      year,
      totalAnnualTurnover: 314000.0,
      totalVatRepercutido: 31400.0,
      totalVatSoportado: 14200.0,
      annualBalance: 17200.0,
      operationsCount: 1420,
    };
  }

  public getTaxModel347(year: number = 2026): TaxModel347Item[] {
    return [
      {
        dniCif: 'B99887766',
        name: 'Tech Corp Consulting S.L.',
        provinceCode: '28',
        q1Amount: 1200,
        q2Amount: 2400,
        q3Amount: 6200,
        q4Amount: 0,
        totalAnnualAmount: 9800.0,
      },
      {
        dniCif: 'A28194012',
        name: 'Distribuidora Central Bebidas S.A.',
        provinceCode: '28',
        q1Amount: 3200,
        q2Amount: 4100,
        q3Amount: 5800,
        q4Amount: 0,
        totalAnnualAmount: 13100.0,
      },
    ];
  }

  public getRetentionSummary(): RetentionSummary {
    return { ...INITIAL_RETENTION_SUMMARY };
  }

  // ==========================================
  // DASHBOARD & GEMINI IA FINANCIAL ENGINE
  // ==========================================

  public getFinancialKPIs(): FinancialKPIs {
    return { ...INITIAL_FINANCIAL_KPIS };
  }

  public getAIFinanceDiagnosis(): FinanceAIPrediction {
    return { ...INITIAL_AI_FINANCE_PREDICTION };
  }
}

export const financeService = FinanceService.getInstance();
