export type IntegrationCategory =
  | 'DELIVERY'
  | 'PAGOS'
  | 'FACTURACION'
  | 'CONTABILIDAD'
  | 'MARKETING'
  | 'CALENDARIOS'
  | 'AUTENTICACION';

export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'TESTING' | 'MAINTENANCE';

export type AuthType = 'OAUTH2' | 'API_KEY' | 'JWT' | 'BASIC' | 'WEBHOOK_ONLY';

export type WebhookStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'PAUSED';

export type WebhookLogLevel = 'SUCCESS' | 'WARNING' | 'ERROR' | 'RETRY';

export type DLQStatus = 'PENDING' | 'RETRIED' | 'DISCARDED' | 'RESOLVED';

export interface IntegrationConnector {
  id: string;
  code: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logoUrl?: string;
  status: IntegrationStatus;
  authType: AuthType;
  version: string;
  isCustom: boolean;
  enabled: boolean;
  healthScore: number; // 0-100
  totalRequestsCount: number;
  successRatePercentage: number;
  lastSyncAt?: string;
  config: Record<string, any>;
  supportedFeatures: string[];
  rateLimitPerMinute: number;
  currentRateCount: number;
}

export interface WebhookEndpoint {
  id: string;
  integrationId: string;
  name: string;
  targetUrl: string;
  events: string[];
  secretKey: string;
  signatureAlgorithm: 'HMAC-SHA256' | 'HMAC-SHA512';
  status: WebhookStatus;
  maxRetries: number;
  createdAt: string;
  lastTriggeredAt?: string;
  totalDispatches: number;
  failedDispatches: number;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  integrationId: string;
  provider: string;
  event: string;
  payload: Record<string, any>;
  responseStatus: number;
  responseBody: string;
  durationMs: number;
  timestamp: string;
  level: WebhookLogLevel;
  signatureValid: boolean;
  retryCount: number;
  errorMessage?: string;
}

export interface OAuthTokenConnection {
  id: string;
  integrationId: string;
  provider: string;
  accountEmail: string;
  clientId: string;
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scopes: string[];
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  lastRefreshedAt: string;
}

export interface DLQItem {
  id: string;
  integrationId: string;
  connectorName: string;
  eventType: string;
  payload: Record<string, any>;
  errorMessage: string;
  attemptCount: number;
  maxAttempts: number;
  firstFailedAt: string;
  lastAttemptAt: string;
  nextRetryAt?: string;
  status: DLQStatus;
  aiDiagnosis?: string;
}

export interface SyncEngineItem {
  id: string;
  integrationId: string;
  entity: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  recordId: string;
  sqliteStatus: 'QUEUED' | 'PROCESSED' | 'FAILED';
  postgresStatus: 'PENDING' | 'SYNCED' | 'CONFLICT';
  payload: Record<string, any>;
  timestamp: string;
}

export interface IntegrationAIDiagnosis {
  id: string;
  timestamp: string;
  healthScore: number;
  summary: string;
  detectedIssues: {
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    component: string;
    issue: string;
    recommendation: string;
  }[];
  optimizationTips: string[];
}

export interface GlobalIntegrationSearchItem {
  id: string;
  title: string;
  type: 'CONNECTOR' | 'WEBHOOK' | 'LOG' | 'TOKEN' | 'DLQ';
  description: string;
  category?: IntegrationCategory;
  status?: string;
}
