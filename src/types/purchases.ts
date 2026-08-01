export type PaymentMethod = 'CONTADO' | 'TRANSFERENCIA' | 'DOMICILIACION' | 'PAGARE' | 'CONFIRMING';

export type SupplierStatus = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

export type SupplierCategory =
  | 'Alimentos'
  | 'Bebidas'
  | 'Limpieza'
  | 'Consumibles'
  | 'Servicios'
  | 'Mantenimiento'
  | 'Tecnología'
  | 'Marketing'
  | 'Otros';

export interface SupplierAddress {
  id: string;
  type: 'FISCAL' | 'ENVIO' | 'FACTURACION';
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  isPrimary: boolean;
}

export interface SupplierDocument {
  id: string;
  name: string;
  url: string;
  date: string;
}

export interface SupplierHistoryLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
}

export interface Supplier {
  id: string; // UUID
  internalCode: string;
  socialName: string;
  tradeName: string;
  cifNif: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  iban: string;
  swift: string;
  paymentMethod: PaymentMethod;
  paymentTermsDays: number; // 0, 30, 60, 90
  standardDiscount?: number; // Descuento habitual %
  equivalenceSurcharge?: number; // Recargo de equivalencia %
  tariff?: string; // Tarifa aplicada
  currency?: string; // Moneda e.g. EUR
  vatRate?: number; // IVA % por defecto
  irpfRate?: number; // Retención IRPF %
  fiscalAddress: string;
  shippingAddress: string;
  province: string;
  country: string;
  postalCode: string;
  multipleAddresses?: SupplierAddress[];
  deliveryDays: string[]; // e.g., ['LUNES', 'MIERCOLES', 'VIERNES']
  deliverySchedule: string; // e.g., '08:00 - 12:00'
  category: SupplierCategory;
  suppliedFamilies: string[];
  associatedProducts: string[]; // Article/Product IDs
  status: SupplierStatus;
  isApproved: boolean; // Proveedor homologado
  isBlocked: boolean; // Proveedor bloqueado
  tags?: string[];
  notes?: string;
  attachedDocs: SupplierDocument[];
  historyLog: SupplierHistoryLog[];
}

export type PurchaseRequestState =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'CONVERTIDA_EN_PEDIDO';

export interface PurchaseRequestLine {
  id: string;
  articleId: string;
  articleName: string;
  unit: string;
  requestedQuantity: number;
  estimatedUnitPrice: number;
  total: number;
  notes?: string;
}

export interface PurchaseRequest {
  id: string;
  requestCode: string; // e.g. SOL-2026-001
  requestorName: string;
  department: string;
  supplierId?: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName: string;
  urgency: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: PurchaseRequestState;
  lines: PurchaseRequestLine[];
  estimatedTotal: number;
  notes?: string;
  createdAt: string;
}

export type PurchaseOrderState =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'ENVIADO'
  | 'CONFIRMADO'
  | 'PREPARANDO'
  | 'EN_TRANSITO'
  | 'RECEPCIONADO_PARCIAL'
  | 'RECEPCIONADO'
  | 'CANCELADO';

export interface PurchaseOrderLine {
  id: string;
  articleId: string;
  articleName: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  returnedQuantity: number;
  unitPrice: number;
  vatRate: number; // e.g., 21, 10, 4
  discountPercent: number; // e.g., 5%
  subtotal: number;
  total: number;
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string; // UUID
  orderNumber: string; // e.g. PED-2026-001
  requestId?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  priority?: 'ALTA' | 'MEDIA' | 'BAJA';
  status: PurchaseOrderState;
  lines: PurchaseOrderLine[];
  taxBase: number;
  vatTotal: number;
  grandTotal: number;
  notes?: string;
  createdBy: string;
}

export interface SupplierDeliveryNote {
  id: string;
  deliveryNumber: string; // e.g., ALB-PROV-8821
  purchaseOrderId?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  lines: PurchaseOrderLine[];
  taxBase: number;
  vatTotal: number;
  grandTotal: number;
  temperature?: number; // Control de temperatura en grados C
  qualityStatus?: 'APTO' | 'CON_INCIDENCIA';
  incidenceNotes?: string;
  photoUrls?: string[];
  signatureUrl?: string; // Firma digital del receptor
  status: 'PENDIENTE_FACTURAR' | 'FACTURADO';
  invoiceId?: string;
}

export type InvoiceStatus = 'PENDIENTE_PAGO' | 'PAGADA' | 'PARCIAL' | 'VENCIDA' | 'CANCELADA' | 'ABONADA' | 'RECTIFICATIVA';

export interface PaymentExpiration {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  paymentMethod: string;
  notes?: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string; // Factura de proveedor
  supplierId: string;
  supplierName: string;
  supplierCif: string;
  orderIds: string[];
  deliveryNoteIds: string[];
  issueDate: string;
  dueDate: string;
  taxBase: number;
  vatTotal: number;
  grandTotal: number;
  status: InvoiceStatus;
  expirations: PaymentExpiration[];
  notes?: string;
}

export interface ThreeWayReconciliation {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveryNoteId?: string;
  deliveryNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  supplierName: string;
  orderedTotal: number;
  receivedTotal: number;
  invoicedTotal: number;
  isMatched: boolean;
  priceDiscrepancy: number;
  quantityDiscrepancy: number;
  discrepanciesDetails: string[];
  status: 'CONCILIADO' | 'DESVIACION_DETECTADA' | 'PENDIENTE_REVISION';
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string; // e.g., DEV-2026-001
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  reason: string;
  lines: {
    articleId: string;
    articleName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    batchNumber?: string;
  }[];
  grandTotal: number;
  status: 'REGISTRADO' | 'ACEPTADO_PROVEEDOR' | 'ABONADO';
}

export interface PriceHistoryEntry {
  date: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  orderNumber?: string;
}

export interface ArticlePriceComparison {
  articleId: string;
  articleName: string;
  unit: string;
  currentCost: number;
  lowestPrice: number;
  highestPrice: number;
  priceVariancePercent: number; // Variance between lowest & current or highest
  history: PriceHistoryEntry[];
}

export interface AIPurchaseRecommendation {
  articleId: string;
  articleName: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  suggestedQuantity: number;
  recommendedSupplierId: string;
  recommendedSupplierName: string;
  estimatedCost: number;
  stockoutRiskDays: number;
  reason: string;
  explanationText?: string;
}

export interface AICostAnomaly {
  id: string;
  type: 'SOBRECOSTE_PRECIO' | 'DESVIACION_ALBARAN' | 'PROVEEDOR_NO_HOMOLOGADO';
  articleName: string;
  supplierName: string;
  expectedPrice: number;
  actualPrice: number;
  variancePercent: number;
  recommendation: string;
}

export interface PurchasesAnalytics {
  totalPurchasesValuation: number;
  totalOrdersCount: number;
  purchasesBySupplier: { supplierName: string; totalAmount: number; percentage: number }[];
  purchasesByFamily: { familyName: string; totalAmount: number; percentage: number }[];
  purchasesByPeriod: { period: string; amount: number }[];
  totalSavings: number;
  rotationRate: number;
  averageProfitabilityMargin: number;
}

