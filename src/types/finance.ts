// Types for FASE 17 - Contabilidad, Tesorería y Finanzas Enterprise España

export type PGCGroup = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PGCAccount {
  code: string; // e.g., '400', '572', '700'
  group: PGCGroup;
  title: string;
  description?: string;
  isSubaccount: boolean;
  parentCode?: string;
  debitBalance: number;
  creditBalance: number;
  currentBalance: number;
}

export interface AccountingEntryLine {
  id: string;
  subaccountCode: string; // e.g. '57200001', '70000001', '47700021'
  subaccountName: string;
  concept: string;
  debit: number;  // Debe (€)
  credit: number; // Haber (€)
  documentRef?: string;
  taxRate?: number; // % IVA / IRPF opcional
  counterpartCode?: string;
}

export interface AccountingJournalEntry {
  id: string;
  entryNumber: number; // Número correlativo de asiento
  fiscalYear: number;  // e.g. 2026
  periodMonth: number; // 1 - 12
  date: string;        // YYYY-MM-DD
  concept: string;     // e.g., 'Ventas diarias TPV', 'Factura proveedor F-2026-99'
  documentType: 'FACTURA_VENTA' | 'FACTURA_COMPRA' | 'COBRO_TPV' | 'PAGO_PROVEEDOR' | 'NOMINA' | 'MANUAL' | 'CIERRE_REGULARIZACION';
  documentRef?: string;
  isAutomatic: boolean;
  lines: AccountingEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'BORRADOR' | 'ASENTADO' | 'ANULADO';
  createdBy: string;
  createdAt: string;
}

export interface LedgerExtractItem {
  entryId: string;
  entryNumber: number;
  date: string;
  concept: string;
  documentRef?: string;
  debit: number;
  credit: number;
  cumulativeBalance: number;
}

export interface BalanceSheetItem {
  code: string;
  name: string;
  amount: number;
  category: 'ACTIVO_NO_CORRIENTE' | 'ACTIVO_CORRIENTE' | 'PATRIMONIO_NETO' | 'PASIVO_NO_CORRIENTE' | 'PASIVO_CORRIENTE';
}

export interface ProfitAndLossStatement {
  fiscalYear: number;
  period: string;
  netTurnover: number;             // Grupo 7 (Ventas)
  rawMaterialsCost: number;        // Grupo 60 (Aprovisionamientos)
  grossMargin: number;             // Margen Bruto
  personnelExpenses: number;       // Grupo 64 (Sueldos y Cargas Social)
  otherOperatingExpenses: number;  // Grupo 62/63 (Alquileres, suministros)
  ebitda: number;                  // EBITDA
  depreciationAmortization: number;// Grupo 68
  ebit: number;                    // Resultado Explotación
  financialResult: number;         // Grupo 66 / 76
  profitBeforeTax: number;         // EBT
  corporateTax: number;            // Impuesto sobre Sociedades
  netProfit: number;               // Resultado Neto
}

export interface BankAccount {
  id: string;
  bankName: string;      // e.g., 'BBVA', 'CaixaBank', 'Banco Santander'
  accountName: string;   // e.g., 'Cuenta Operativa Restaurante'
  iban: string;
  bicSwift: string;
  currency: 'EUR';
  currentBalance: number;
  accountingSubaccount: string; // e.g., '57200001'
  isDefault: boolean;
  lastReconciledAt?: string;
}

export interface TreasuryMovement {
  id: string;
  bankAccountId?: string;
  accountName: string;
  date: string; // YYYY-MM-DD
  type: 'INGRESO' | 'GASTO' | 'TRASPASO_INTERNO' | 'PAGO_PROVEEDOR' | 'COBRO_CLIENTE';
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'BIZUM' | 'TRANSFERENCIA' | 'CHEQUE' | 'VALE' | 'GIFT_CARD' | 'MONEDERO' | 'PAGO_MIXTO';
  concept: string;
  amount: number;
  documentRef?: string;
  entityName?: string; // Proveedor o Cliente
  isReconciled: boolean;
  reconciliationId?: string;
  createdAt: string;
}

export interface BankReconciliationItem {
  id: string;
  bankAccountId: string;
  date: string;
  bankConcept: string;
  bankAmount: number;
  matchedMovementId?: string;
  matchedInvoiceId?: string;
  status: 'PENDIENTE' | 'CONCILIADO' | 'DISCREPANCIA';
  matchedAt?: string;
  notes?: string;
}

export type SEPARemittanceType = 'ADEUDO_CORE' | 'ADEUDO_B2B' | 'TRANSFERENCIA';

export interface SEPAItem {
  id: string;
  debtorCreditorName: string;
  iban: string;
  bic: string;
  amount: number;
  concept: string;
  mandateReference?: string;
  mandateDate?: string;
  dueDate: string;
  status: 'PENDIENTE' | 'ENVIADO' | 'DEVUELTO' | 'RECHAZADO';
}

export interface SEPARemittance {
  id: string;
  reference: string; // e.g., 'REM-SEPA-2026-001'
  creationDate: string;
  executionDate: string;
  type: SEPARemittanceType;
  bankAccountId: string;
  totalAmount: number;
  itemsCount: number;
  items: SEPAItem[];
  status: 'BORRADOR' | 'GENERADO_XML' | 'PROCESADO_BANCO';
  xmlContent?: string;
}

export interface FacturaeXMLPayload {
  invoiceNumber: string;
  issueDate: string;
  sellerDniCif: string;
  sellerName: string;
  buyerDniCif: string;
  buyerName: string;
  buyerFaceCode?: string; // Código DIR3 para AAPP (Oficina Contable, Órgano Gestor, Unidad Tramitadora)
  taxableBase: number;
  vatAmount: number;
  totalAmount: number;
  xmlSchemaVersion: '3.2.2';
  isSigned: boolean;
  signatureAlgorithm?: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
  xmlString: string;
}

export interface SIIRecord {
  id: string;
  invoiceNumber: string;
  expeditionDate: string;
  operationDate: string;
  invoiceType: 'F1' | 'F2' | 'R1' | 'R2'; // Factura completa, simplificada, rectificativas
  counterpartyDniCif: string;
  counterpartyName: string;
  taxableBase: number;
  vatRate: number;
  vatAmount: number;
  retentionAmount?: number;
  aeatStatus: 'ACEPTADO' | 'ACEPTADO_CON_ERRORES' | 'RECHAZADO' | 'PENDIENTE';
  aeatCsvCode?: string;
  submittedAt?: string;
  errorMessage?: string;
}

export interface TaxModel303 {
  period: string; // e.g., '2026-1T', '2026-2T'
  year: number;
  quarter: 1 | 2 | 3 | 4;
  taxableBaseGeneral: number; // 21%
  vatGeneral: number;
  taxableBaseReduced: number; // 10%
  vatReduced: number;
  taxableBaseSuperReduced: number; // 4%
  vatSuperReduced: number;
  totalVatRepercutido: number;
  taxableBaseDeductible: number;
  totalVatSoportado: number;
  resultToPayOrReturn: number; // >0 Ingresar, <0 Devolver/Compensar
  status: 'CALCULADO' | 'PRESENTADO';
}

export interface TaxModel390 {
  year: number;
  totalAnnualTurnover: number;
  totalVatRepercutido: number;
  totalVatSoportado: number;
  annualBalance: number;
  operationsCount: number;
}

export interface TaxModel347Item {
  dniCif: string;
  name: string;
  provinceCode: string;
  q1Amount: number;
  q2Amount: number;
  q3Amount: number;
  q4Amount: number;
  totalAnnualAmount: number; // Must be > 3005.06 €
}

export interface TaxModel349Item {
  vatNumber: string;
  countryCode: string;
  name: string;
  operationKey: 'A' | 'E' | 'T' | 'S'; // Adquisiciones, Entregas, Prestaciones
  amount: number;
}

export interface RetentionSummary {
  period: string; // e.g., '2026-1T'
  model111: {
    professionalsCount: number;
    baseAmount: number;
    retentionRate: number; // 15% o 7%
    retentionTotal: number;
  };
  model115: {
    rentalsCount: number;
    baseAmount: number;
    retentionRate: number; // 19%
    retentionTotal: number;
  };
}

export interface FinancialInvoice {
  id: string;
  type: 'EMITIDA' | 'RECIBIDA' | 'RECTIFICATIVA' | 'PRESUPUESTO' | 'ALBARAN' | 'PROFORMA';
  series: string; // e.g., 'F2026', 'R2026', 'ALB2026'
  number: string; // e.g., 'F2026-00042'
  issueDate: string;
  dueDate: string;
  issuerName: string;
  issuerDniCif: string;
  recipientName: string;
  recipientDniCif: string;
  recipientIban?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    total: number;
  }[];
  taxableBase: number;
  vatTotal: number;
  irpfTotal: number;
  grandTotal: number;
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'BIZUM' | 'TRANSFERENCIA' | 'CHEQUE' | 'VALE' | 'GIFT_CARD' | 'MONEDERO' | 'PAGO_MIXTO';
  paymentStatus: 'PENDIENTE' | 'PAGADA' | 'PARCIAL' | 'VENCIDA';
  paidAmount: number;
  pendingAmount: number;
  facturaeExported: boolean;
  siiExported: boolean;
  notes?: string;
}

export interface FinancialDueDateItem {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  entityName: string; // Cliente o Proveedor
  type: 'COBRO_CLIENTE' | 'PAGO_PROVEEDOR';
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'PENDIENTE' | 'VENCIDO' | 'COBRADO' | 'PAGADO';
  daysOverdue: number;
}

export interface FinanceAIPrediction {
  timestamp: string;
  liquidityScore: number; // 0-100
  runwayMonths: number;
  cashflowForecast30Days: number;
  cashflowForecast60Days: number;
  cashflowForecast90Days: number;
  breakEvenDailySales: number;
  predictedMonthlyEbitda: number;
  fraudAnomalyAlerts: {
    id: string;
    severity: 'ALTA' | 'MEDIA' | 'BAJA';
    category: 'ASIENTO_DESCUADRADO' | 'FACTURA_DUPLICADA' | 'MOVIMIENTO_SOSPECHOSO' | 'DESVIACION_IVA';
    title: string;
    description: string;
    suggestedAction: string;
  }[];
  strategicRecommendations: string[];
}

export interface FinancialKPIs {
  totalRevenueMonth: number;
  totalExpensesMonth: number;
  netProfitMonth: number;
  ebitdaMonth: number;
  currentLiquidity: number;
  totalPendingCollect: number;
  totalPendingPay: number;
  grossMarginPercentage: number;
  breakEvenSalesMonth: number;
  operatingCashFlow: number;
}
