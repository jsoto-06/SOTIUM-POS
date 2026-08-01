export * from './inventory';
export * from './reservation';
export * from './bi';
export * from './hr';
export * from './finance';
export * from './multicompany';
export * from './production';
export * from './maintenance';
export * from './qualityHaccp';
export * from './integration';
export * from './mobile';
export type {
  LogLevel,
  SystemLogCategory,
  BackupType,
  BackupStatus,
  SyncStatusType,
  LicenseType,
  CompanyConfig as BackofficeCompanyConfig,
  PrinterDevice,
  CashDrawerDevice,
  DisplayDevice,
  TPVHardwareConfig,
  TaxRate,
  FamilyCategory,
  PaymentMethod as BackofficePaymentMethod,
  BankAccount as BackofficeBankAccount,
  CurrencyRate,
  GeneralSettings,
  AdminRole,
  AdminUser,
  SecurityPolicy,
  AuditLogEntry,
  SystemLogEntry,
  BackupRecord,
  BackupScheduleConfig,
  SyncDiagnosisItem,
  SyncOverview,
  LicenseInfo,
  NotificationRule,
  AIAdvisorRecommendation,
  AIAdvisorAuditResult,
  GlobalSearchItem,
} from './backoffice';

export type ActiveTab =
  | 'tpv'
  | 'mesas'
  | 'comandas'
  | 'delivery'
  | 'clientes'
  | 'productos'
  | 'produccion'
  | 'almacen'
  | 'compras'
  | 'caja'
  | 'informes'
  | 'dashboard'
  | 'ia'
  | 'reservas'
  | 'cumplimiento'
  | 'arquitectura'
  | 'rrhh'
  | 'finanzas'
  | 'multicompany'
  | 'mantenimiento'
  | 'calidad'
  | 'backoffice'
  | 'integraciones'
  | 'mobile';

export type TableStatus =
  | 'FREE'
  | 'RESERVED'
  | 'OCCUPIED'
  | 'PENDING_ORDER'
  | 'IN_KITCHEN'
  | 'SERVING'
  | 'WAITING_DESSERT'
  | 'BILL_REQUESTED'
  | 'PAYING'
  | 'CLEANING'
  | 'OUT_OF_SERVICE';

export type TableShape = 'square' | 'round' | 'rectangle' | 'oval';

export type SalonType =
  | 'COMEDOR'
  | 'BARRA'
  | 'TERRAZA'
  | 'RESERVADOS'
  | 'EVENTOS'
  | 'PLANTA_SUPERIOR'
  | 'CUSTOM';

export interface Table {
  id: string;
  salonId: string;
  number?: string;
  name: string;
  seats: number;
  pax?: number;
  x: number; // position in px or grid
  y: number;
  width: number;
  height: number;
  shape: TableShape;
  status: TableStatus;
  color?: string; // custom hex color override
  rotation?: number; // 0, 45, 90, 180, 270 deg
  isLocked?: boolean; // locked position in visual designer
  currentOrderId?: string;
  accumulatedTotal?: number;
  occupiedSince?: string;
  lastOrderAt?: string;
  serverId?: string;
  serverName?: string;
  joinedWithTableIds?: string[]; // IDs of secondary tables joined to this main table
  joinedToTableId?: string; // ID of main table if this table is secondary joined
  reservationId?: string;
  reservationInfo?: {
    customerName: string;
    phone: string;
    time: string;
    pax: number;
  };
}

export interface Salon {
  id: string;
  name: string;
  type?: SalonType;
  tables: Table[];
  width?: number; // canvas bounds width in px
  height?: number; // canvas bounds height in px
  gridSize?: number; // snap grid size in px, e.g. 20
  notes?: string;
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'ud';
  costPerUnit: number;
  minStock: number;
  supplier: string;
}

export interface EscandalloLine {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number; // PVP con IVA
  vatRate: 21 | 10 | 4 | 0; // IVA Español
  recargoEquivalencia?: number; // RE
  costPrice: number; // Calculado o manual
  barcode: string;
  qrCode?: string;
  photoUrl: string;
  isFavorite: boolean;
  stock: number;
  minStock: number;
  printerTarget: 'COCINA_CALIENTE' | 'COCINA_FRIA' | 'BARRA' | 'POSTRES';
  ingredients: string[];
  escandallo: EscandalloLine[];
  extras?: ExtraOption[];
  allergens?: string[];
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export type CourseType = 'ENTRANTE' | 'PRIMERO' | 'SEGUNDO' | 'POSTRE' | 'BEBIDA';
export type ItemKDSStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'PLATING'
  | 'READY'
  | 'SERVED'
  | 'DELIVERED'
  | 'CANCELLED';

export type KDSPriority = 'NORMAL' | 'URGENTE' | 'VIP' | 'DELIVERY' | 'TAKE_AWAY';

export type KDSGroupMode = 'TABLE' | 'ORDER' | 'DELIVERY' | 'CUSTOMER';

export interface KDSStation {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string; // Lucide icon identifier or emoji
  active: boolean;
  targetPreparationMinutes: number;
  printerTarget?: string;
  description?: string;
}

export interface KDSStateColorConfig {
  PENDING: string;
  ACCEPTED: string;
  PREPARING: string;
  PLATING: string;
  READY: string;
  SERVED: string;
  DELIVERED?: string;
  CANCELLED: string;
}

export interface KDSFilterOptions {
  stationId: string;
  priority: KDSPriority | 'ALL';
  status: ItemKDSStatus | 'ALL';
  serverId: string;
  tableId: string;
  searchTerm: string;
  sortBy: 'TIME_ASC' | 'TIME_DESC' | 'PRIORITY';
}

export interface KDSMetrics {
  avgPrepTimeMinutes: number;
  totalOrders: number;
  pendingOrdersCount: number;
  delayedOrdersCount: number;
  deliveredCount: number;
  productivityPercent: number;
  timePerStation: Record<string, number>;
  timePerCook: { cookName: string; avgMinutes: number; totalCompleted: number }[];
  timePerDish: { productName: string; avgMinutes: number; totalCount: number }[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  vatRate: number;
  quantity: number;
  notes?: string;
  selectedExtras?: ExtraOption[];
  excludedIngredients?: string[];
  course: CourseType;
  kdsStatus: ItemKDSStatus;
  kdsUpdatedAt?: string;
  acceptedAt?: string;
  preparingAt?: string;
  platedAt?: string;
  readyAt?: string;
  servedAt?: string;
  cancelledAt?: string;
  stationIds?: string[];
  priority?: KDSPriority;
  targetMinutes?: number;
  cookName?: string;
  isInvitation?: boolean;
  discountPercent?: number;
  printerTarget: string;
}

export type PaymentMethod =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'BIZUM'
  | 'TRANSFERENCIA'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'TICKET_RESTAURANT'
  | 'VALE'
  | 'GIFT_CARD'
  | 'MIXTO';

export type OrderType = 'DIRECTA' | 'MESA' | 'TERRAZA' | 'BARRA' | 'TAKE_AWAY' | 'DELIVERY' | 'CLICK_COLLECT';

export interface ProductVariant {
  id: string;
  name: string; // Ej: "Caña", "Jarra", "Entera", "Media Ración"
  price: number;
}

export interface ParkedOrder {
  id: string;
  parkedAt: string;
  parkedBy: string;
  referenceName: string; // Ej: "Mesa 4" o "Cliente Barra Juan"
  order: Order;
}

export interface CashMovement {
  id: string;
  registerId: string;
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
  timestamp: string;
  performedBy: string;
}

export interface CashRegister {
  id: string;
  name: string;
  location: string;
  currentBalance: number;
  isOpened: boolean;
  openedAt?: string;
  openedBy?: string;
}

export interface ShiftLog {
  id: string;
  employeeId: string;
  employeeName: string;
  clockInTime: string;
  clockOutTime?: string;
  totalSales: number;
  ticketCount: number;
  registerId: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Ej: T2026-00482
  series: string; // Ej: T2026, F2026, R2026
  type: OrderType;
  tableId?: string;
  tableName?: string;
  salonName?: string;
  serverId: string;
  serverName: string;
  customerId?: string;
  customerName?: string;
  customerNif?: string;
  items: OrderItem[];
  subtotal: number; // Base imponible
  vatAmount: number;
  discountTotal: number;
  surchargeTotal?: number;
  tipAmount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod?: PaymentMethod;
  mixedPayments?: { method: PaymentMethod; amount: number }[];
  isClosed: boolean;
  isParked?: boolean;
  createdAt: string;
  closedAt?: string;
  voidReason?: string;
  voidedBy?: string;
  // Cumplimiento España VeriFactu
  verifactuSigned: boolean;
  verifactuHash?: string;
  previousVerifactuHash?: string;
  verifactuQrUrl?: string;
  aeatStatus?: string;
  documentType: 'TICKET' | 'FACTURA' | 'ALBARAN' | 'PROFORMA' | 'REGALO';
}

export interface Customer {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  points: number;
  totalSpent: number;
  discountPercent: number;
  balance: number;
  birthday?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'CAMARERO' | 'COCINERO';
  pin: string;
  photoUrl: string;
  isClockedIn: boolean;
  clockInTime?: string;
  hourlyRate: number;
  totalCommissions: number;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA' | 'MERMA' | 'AJUSTE';
  quantity: number;
  cost: number;
  date: string;
  user: string;
  reason: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: 'BORRADOR' | 'ENVIADO' | 'RECIBIDO' | 'FACTURADO';
  total: number;
  items: { ingredientName: string; qty: number; unitPrice: number; total: number }[];
}

export interface CashClosing {
  id: string;
  closingNumber: string; // Ej: Z-2026-0142
  openedAt: string;
  closedAt: string;
  openedBy: string;
  closedBy: string;
  initialCash: number;
  countedCash: number;
  expectedCash: number;
  cashDifference: number;
  salesCash: number;
  salesCard: number;
  salesBizum: number;
  salesOther: number;
  totalSales: number;
  totalVat: number;
  ticketCount: number;
  verifactuChainOK: boolean;
}

export interface DeliveryOrder {
  id: string;
  platform: 'GLOVO' | 'UBER_EATS' | 'JUST_EAT' | 'WEB_PROPIA';
  platformOrderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: 'PENDIENTE' | 'ACEPTADO' | 'EN_COCINA' | 'LISTO' | 'EN_CAMINO' | 'ENTREGADO';
  items: { productName: string; qty: number; price: number }[];
  total: number;
  driverName?: string;
  etaMinutes: number;
  createdAt: string;
}



export interface VeriFactuLog {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  total: number;
  vat: number;
  hashPrevious: string;
  hashCurrent: string;
  aeatResponseCode: string;
  chainedSignature: string;
}
