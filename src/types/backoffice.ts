export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'DEBUG';
export type SystemLogCategory = 'SYSTEM' | 'API' | 'SQLITE' | 'POSTGRES' | 'SOCKET_IO' | 'IA' | 'INTEGRATION' | 'SECURITY';
export type BackupType = 'MANUAL' | 'AUTOMATIC' | 'SCHEDULED';
export type BackupStatus = 'SUCCESS' | 'IN_PROGRESS' | 'FAILED' | 'VERIFIED';
export type SyncStatusType = 'SYNCED' | 'PENDING' | 'ERROR' | 'SYNCING';
export type LicenseType = 'ENTERPRISE_ULTIMATE' | 'ENTERPRISE_PRO' | 'DEMO' | 'TRIAL';

export interface CompanyConfig {
  id: string;
  name: string;
  legalName: string;
  nif: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  logoUrl: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
  branchesCount: number;
  digitalCertificateStatus: 'VALID' | 'EXPIRED' | 'NOT_CONFIGURED';
  digitalCertificateExpiresAt?: string;
  verifactuEnabled: boolean;
  ticketFooter: string;
  invoicePrefix: string;
}

export interface PrinterDevice {
  id: string;
  name: string;
  type: 'ESC_POS' | 'NETWORK' | 'USB' | 'VIRTUAL';
  ipAddress?: string;
  port?: number;
  assignedZone: 'BAR' | 'COCINA_1' | 'COCINA_2' | 'POSTRES' | 'CAJA_PRINCIPAL';
  paperWidth: '58mm' | '80mm';
  status: 'ONLINE' | 'OFFLINE' | 'PAPER_OUT' | 'ERROR';
  autoCut: boolean;
  openDrawer: boolean;
}

export interface CashDrawerDevice {
  id: string;
  name: string;
  connectedPrinterId: string;
  connectionType: 'RJ11' | 'USB' | 'SERIAL' | 'NETWORK';
  autoOpenOnCashSale: boolean;
  requirePinToOpen: boolean;
  status: 'READY' | 'OPEN' | 'DISCONNECTED';
}

export interface DisplayDevice {
  id: string;
  name: string;
  type: 'CUSTOMER_DISPLAY' | 'KDS_MONITOR' | 'PDA_COMMANDER' | 'SELF_ORDER_KIOSK';
  ipAddress: string;
  assignedZone: string;
  resolution: string;
  status: 'CONNECTED' | 'DISCONNECTED';
}

export interface TPVHardwareConfig {
  ticketSeries: string;
  invoiceSeries: string;
  creditNoteSeries: string;
  printers: PrinterDevice[];
  cashDrawers: CashDrawerDevice[];
  displays: DisplayDevice[];
  pdaCount: number;
  networkSubnet: string;
  offlineReceiptBufferLimit: number;
  kdsRefreshIntervalSec: number;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  surchargeRate?: number; // Recargo equivalencia
  isDefault: boolean;
  code: string;
}

export interface FamilyCategory {
  id: string;
  code: string;
  name: string;
  color: string;
  printerZone: string;
  subcategories: string[];
  active: boolean;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  type: 'CASH' | 'CARD' | 'BIZUM' | 'ROOM_CHARGE' | 'VOUCHER' | 'BANK_TRANSFER';
  opensDrawer: boolean;
  requiresCustomer: boolean;
  iconName: string;
  active: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  iban: string;
  swift: string;
  currency: string;
  balance: number;
  isPrimary: boolean;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToEUR: number;
  lastUpdated: string;
}

export interface GeneralSettings {
  taxes: TaxRate[];
  families: FamilyCategory[];
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
  currencies: CurrencyRate[];
}

export interface AdminRole {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: string[];
  inheritedFrom?: string;
  isSystemRole: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  active: boolean;
  lastLogin?: string;
  ipAddress?: string;
  twoFactorEnabled: boolean;
  failedLoginAttempts: number;
  isLocked: boolean;
  createdAt: string;
}

export interface SecurityPolicy {
  minPasswordLength: number;
  requireNumbers: boolean;
  requireSymbols: boolean;
  passwordExpirationDays: number;
  maxFailedAttemptsBeforeLock: number;
  sessionTimeoutMinutes: number;
  allowMultipleSessionsPerUser: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entity: string;
  entityId: string;
  changesBefore?: Record<string, any>;
  changesAfter?: Record<string, any>;
  ipAddress: string;
  device: string;
  integrityHash: string;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: SystemLogCategory;
  message: string;
  details?: string;
  source: string;
  code?: string;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  fileSizeMb: number;
  type: BackupType;
  status: BackupStatus;
  createdAt: string;
  checksumMd5: string;
  storageLocation: 'LOCAL_SQLITE' | 'POSTGRES_CLOUD' | 'AWS_S3' | 'HYBRID';
  encrypted: boolean;
}

export interface BackupScheduleConfig {
  autoBackupEnabled: boolean;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  retentionDays: number;
  timeOfDay: string;
  destination: 'LOCAL_AND_CLOUD' | 'LOCAL_ONLY' | 'CLOUD_ONLY';
  encryptBackups: boolean;
}

export interface SyncDiagnosisItem {
  id: string;
  table: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  status: SyncStatusType;
  retryCount: number;
  lastAttemptAt: string;
  errorMessage?: string;
}

export interface SyncOverview {
  overallStatus: 'ONLINE_SYNCED' | 'OFFLINE_QUEUED' | 'SYNC_ERROR' | 'DEGRADED';
  pendingQueueCount: number;
  lastSuccessfulSyncAt: string;
  latencyMs: number;
  sqliteRecordCount: number;
  postgresRecordCount: number;
  items: SyncDiagnosisItem[];
}

export interface LicenseInfo {
  licenseKey: string;
  type: LicenseType;
  companyHolder: string;
  activationDate: string;
  expirationDate: string;
  daysRemaining: number;
  maxPOSLicenses: number;
  usedPOSLicenses: number;
  features: {
    multiCompany: boolean;
    verifactu: boolean;
    aiAdvisor: boolean;
    maintenanceSAT: boolean;
    haccpQuality: boolean;
    deliveryHub: boolean;
    productionLots: boolean;
    kdsKitchen: boolean;
    advancedAnalytics: boolean;
  };
}

export interface NotificationRule {
  id: string;
  code: string;
  title: string;
  level: LogLevel;
  enabled: boolean;
  notifyByEmail: boolean;
  notifyInApp: boolean;
  notifySMS: boolean;
  recipientRoles: string[];
  description: string;
}

export interface AIAdvisorRecommendation {
  id: string;
  category: 'SEGURIDAD' | 'HARDWARE' | 'FISCAL' | 'RENDIMIENTO' | 'ESTRUCTURA';
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  explanation: string;
  suggestedAction: string;
  actionCode?: string;
  autoFixAvailable: boolean;
}

export interface AIAdvisorAuditResult {
  timestamp: string;
  healthScore: number; // 0 - 100
  summary: string;
  recommendations: AIAdvisorRecommendation[];
  securityStatus: 'OPTIMAL' | 'RISKS_FOUND' | 'CRITICAL_VULNERABILITY';
  taxStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
}

export interface GlobalSearchItem {
  id: string;
  title: string;
  description: string;
  tabId: string;
  path: string;
  keywords: string[];
}
