import {
  IntegrationConnector,
  WebhookEndpoint,
  WebhookLog,
  OAuthTokenConnection,
  DLQItem,
  SyncEngineItem,
  GlobalIntegrationSearchItem,
  IntegrationCategory,
} from '../types/integration';
import { AuditService } from './auditService';
import { logger } from './loggerService';

export class IntegrationService {
  private static instance: IntegrationService;

  private STORAGE_KEY_CONNECTORS = 'erp_integrations_connectors_v1';
  private STORAGE_KEY_WEBHOOKS = 'erp_integrations_webhooks_v1';
  private STORAGE_KEY_WEBHOOK_LOGS = 'erp_integrations_webhook_logs_v1';
  private STORAGE_KEY_OAUTH = 'erp_integrations_oauth_v1';
  private STORAGE_KEY_DLQ = 'erp_integrations_dlq_v1';
  private STORAGE_KEY_SYNC = 'erp_integrations_sync_v1';

  private memoryStore = new Map<string, string>();

  private getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch {
      // fallback
    }
    return this.memoryStore.get(key) || null;
  }

  private setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // fallback
    }
    this.memoryStore.set(key, value);
  }

  constructor() {
    this.initDefaultData();
  }

  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  private initDefaultData() {
    if (!this.getItem(this.STORAGE_KEY_CONNECTORS)) {
      const defaultConnectors: IntegrationConnector[] = [
        // DELIVERY
        {
          id: 'int-glovo',
          code: 'GLOVO',
          name: 'Glovo On-Demand',
          category: 'DELIVERY',
          description: 'Sincronización bidireccional de pedidos, cartas y disponibilidad de productos con Glovo España.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v3.4',
          isCustom: false,
          enabled: true,
          healthScore: 98,
          totalRequestsCount: 12450,
          successRatePercentage: 99.4,
          lastSyncAt: new Date(Date.now() - 5 * 60000).toISOString(),
          config: { apiKey: 'glv_live_9983748291', storeId: 'ES-MAD-001', autoAcceptOrders: true },
          supportedFeatures: ['Sync Pedidos', 'Sync Carta', 'Disable Items', 'Repartidor Tracking'],
          rateLimitPerMinute: 300,
          currentRateCount: 42,
        },
        {
          id: 'int-ubereats',
          code: 'UBEREATS',
          name: 'Uber Eats Orders API',
          category: 'DELIVERY',
          description: 'Inyección directa de pedidos de Uber Eats en el sistema KDS y arqueo de caja centralizado.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v2.0',
          isCustom: false,
          enabled: true,
          healthScore: 95,
          totalRequestsCount: 8900,
          successRatePercentage: 98.7,
          lastSyncAt: new Date(Date.now() - 12 * 60000).toISOString(),
          config: { storeUuid: 'uber-mad-9921', webhookUrl: 'https://api.hostelerp.es/api/integrations/webhooks/ubereats' },
          supportedFeatures: ['Order Ingestion', 'Menu Publishing', 'Status Updates'],
          rateLimitPerMinute: 200,
          currentRateCount: 18,
        },
        {
          id: 'int-justeat',
          code: 'JUSTEAT',
          name: 'Just Eat Takeaway Engine',
          category: 'DELIVERY',
          description: 'Conector homologado Just Eat para recepción instantánea de pedidos y control de repartidores propios.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v4.1',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 6420,
          successRatePercentage: 99.9,
          lastSyncAt: new Date(Date.now() - 2 * 60000).toISOString(),
          config: { restaurantId: 'JE-883921', apiKey: 'je_secret_883719' },
          supportedFeatures: ['Sync Pedidos', 'Estimación Tiempos Cocina'],
          rateLimitPerMinute: 250,
          currentRateCount: 15,
        },
        {
          id: 'int-deliveroo',
          code: 'DELIVEROO',
          name: 'Deliveroo Enterprise (Legacy/Global)',
          category: 'DELIVERY',
          description: 'Integración de pedidos internacionales Deliveroo Hub para franquicias y sedes fuera de España.',
          status: 'DISCONNECTED',
          authType: 'OAUTH2',
          version: 'v1.8',
          isCustom: false,
          enabled: false,
          healthScore: 0,
          totalRequestsCount: 0,
          successRatePercentage: 0,
          config: {},
          supportedFeatures: ['Order Sync', 'Menu Sync'],
          rateLimitPerMinute: 100,
          currentRateCount: 0,
        },
        {
          id: 'int-deliverect',
          code: 'DELIVERECT',
          name: 'Deliverect Middleware Hub',
          category: 'DELIVERY',
          description: 'Hub omnicanal para unificar Glovo, Uber Eats, Just Eat y marcas virtuales en una sola tubería.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v5.0',
          isCustom: false,
          enabled: true,
          healthScore: 99,
          totalRequestsCount: 34100,
          successRatePercentage: 99.8,
          lastSyncAt: new Date(Date.now() - 1 * 60000).toISOString(),
          config: { accountId: 'dlr_acc_7712', locationId: 'loc_madrid_centro' },
          supportedFeatures: ['Aggregation', 'Stock Auto-pause', 'Unified KDS'],
          rateLimitPerMinute: 500,
          currentRateCount: 88,
        },
        {
          id: 'int-pedidosweb',
          code: 'PEDIDOSWEB',
          name: 'Pedidos Web Directos (E-Commerce TPV)',
          category: 'DELIVERY',
          description: 'Motor de venta propio en web corporativa sin comisiones a terceros con integración TPV instantánea.',
          status: 'CONNECTED',
          authType: 'JWT',
          version: 'v1.0',
          isCustom: true,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 18200,
          successRatePercentage: 100.0,
          lastSyncAt: new Date().toISOString(),
          config: { domain: 'pedidos.hostelerp-group.es', paymentGateway: 'Redsys/Stripe' },
          supportedFeatures: ['Pago en Web', 'Notificación WhatsApp', 'Asignación Repartidor'],
          rateLimitPerMinute: 600,
          currentRateCount: 30,
        },
        {
          id: 'int-clickcollect',
          code: 'CLICKCOLLECT',
          name: 'Click & Collect Express QR',
          category: 'DELIVERY',
          description: 'Módulo de recogida en local con aviso SMS/Push al cliente cuando la comanda está lista.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v2.2',
          isCustom: false,
          enabled: true,
          healthScore: 97,
          totalRequestsCount: 5400,
          successRatePercentage: 99.1,
          lastSyncAt: new Date(Date.now() - 25 * 60000).toISOString(),
          config: { pickupTimeSlotMinutes: 15, autoPrintKitchen: true },
          supportedFeatures: ['QR Pick-up', 'Time Slots', 'SMS Alert'],
          rateLimitPerMinute: 200,
          currentRateCount: 8,
        },
        {
          id: 'int-takeaway',
          code: 'TAKEAWAY',
          name: 'Take Away Mostrador TPV',
          category: 'DELIVERY',
          description: 'Gestión prioritaria de empaquetado y cobro rápido para pedidos para llevar.',
          status: 'CONNECTED',
          authType: 'BASIC',
          version: 'v1.0',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 22100,
          successRatePercentage: 100.0,
          lastSyncAt: new Date().toISOString(),
          config: { defaultPackagingFee: 0.5 },
          supportedFeatures: ['Packaging Fee', 'Fast Checkout', 'KDS Tagging'],
          rateLimitPerMinute: 1000,
          currentRateCount: 120,
        },

        // PAGOS
        {
          id: 'int-redsys',
          code: 'REDSYS',
          name: 'Redsys TPV Virtual & Pinpad',
          category: 'PAGOS',
          description: 'Pasarela oficial de pagos bancarios en España (Servired/4B/Euro6000) con Bizum integrado y SHA256.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'SIS 3.5',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 45000,
          successRatePercentage: 99.95,
          lastSyncAt: new Date(Date.now() - 3 * 60000).toISOString(),
          config: { merchantCode: '348829102', terminal: '001', secretKey: 'sq74829*****' },
          supportedFeatures: ['3D Secure 2.2', 'Bizum Direct', 'Preautorizaciones', 'Devolución Automática'],
          rateLimitPerMinute: 500,
          currentRateCount: 75,
        },
        {
          id: 'int-stripe',
          code: 'STRIPE',
          name: 'Stripe Terminal & Billing',
          category: 'PAGOS',
          description: 'Cobro omnichannel con lectores físicos Stripe Reader S700 y pagos online Apple Pay / Google Pay.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: '2026-03-01',
          isCustom: false,
          enabled: true,
          healthScore: 99,
          totalRequestsCount: 28900,
          successRatePercentage: 99.8,
          lastSyncAt: new Date(Date.now() - 8 * 60000).toISOString(),
          config: { publishableKey: 'pk_live_883921***', webhookSecret: 'whsec_99182***' },
          supportedFeatures: ['Apple Pay', 'Google Pay', 'Subscripciones ERP', 'Refunds API'],
          rateLimitPerMinute: 1000,
          currentRateCount: 110,
        },
        {
          id: 'int-bizum',
          code: 'BIZUM',
          name: 'Bizum Empresas Instant Payments',
          category: 'PAGOS',
          description: 'Cobros QR en mesa y TPV mediante transferencia inmediata de fondos Bizum Hostelería.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v2.1',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 15400,
          successRatePercentage: 99.9,
          lastSyncAt: new Date(Date.now() - 10 * 60000).toISOString(),
          config: { merchantPhone: '+34600123456', autoConfirmMs: 3000 },
          supportedFeatures: ['QR Dinámico', 'Push a Móvil Cliente', 'Confirmación Realtime'],
          rateLimitPerMinute: 300,
          currentRateCount: 24,
        },
        {
          id: 'int-paypal',
          code: 'PAYPAL',
          name: 'PayPal Commerce Platform',
          category: 'PAGOS',
          description: 'Aceptación de pagos internacionales con PayPal y Pay in 3 (cuotas) para catering y reservas.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v2.0',
          isCustom: false,
          enabled: true,
          healthScore: 96,
          totalRequestsCount: 3100,
          successRatePercentage: 98.2,
          lastSyncAt: new Date(Date.now() - 45 * 60000).toISOString(),
          config: { clientId: 'PAYPAL_CLIENT_883', mode: 'live' },
          supportedFeatures: ['PayPal Credit', 'Catering Pre-payments'],
          rateLimitPerMinute: 200,
          currentRateCount: 5,
        },
        {
          id: 'int-sumup',
          code: 'SUMUP',
          name: 'SumUp Air & Solo Pinpads',
          category: 'PAGOS',
          description: 'Datáfonos móviles bluetooth SumUp sincronizados con comanderos Android / iOS.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v1.4',
          isCustom: false,
          enabled: true,
          healthScore: 98,
          totalRequestsCount: 7800,
          successRatePercentage: 99.3,
          lastSyncAt: new Date(Date.now() - 15 * 60000).toISOString(),
          config: { affiliateKey: 'sumup_aff_9921', autoCloseBatch: true },
          supportedFeatures: ['Bluetooth Pairing', 'Tip Collection', 'Digital Receipt'],
          rateLimitPerMinute: 150,
          currentRateCount: 12,
        },
        {
          id: 'int-adyen',
          code: 'ADYEN',
          name: 'Adyen Unified Commerce',
          category: 'PAGOS',
          description: 'Procesamiento de pagos enterprise multinacional para grandes cadenas de restauración.',
          status: 'DISCONNECTED',
          authType: 'API_KEY',
          version: 'v68',
          isCustom: false,
          enabled: false,
          healthScore: 0,
          totalRequestsCount: 0,
          successRatePercentage: 0,
          config: {},
          supportedFeatures: ['Omnichannel Tokenization', 'Multi-currency settlement'],
          rateLimitPerMinute: 500,
          currentRateCount: 0,
        },
        {
          id: 'int-worldline',
          code: 'WORLDLINE',
          name: 'Worldline / Ingenico Terminal Engine',
          category: 'PAGOS',
          description: 'Conector de datáfonos fijos Ethernet Ingenico con protocolo CECA / Host-to-Host.',
          status: 'CONNECTED',
          authType: 'BASIC',
          version: 'v3.0',
          isCustom: false,
          enabled: true,
          healthScore: 99,
          totalRequestsCount: 19200,
          successRatePercentage: 99.7,
          lastSyncAt: new Date(Date.now() - 20 * 60000).toISOString(),
          config: { terminalIp: '192.168.1.150', port: 8500 },
          supportedFeatures: ['Ethernet POS', 'Fast Auth', 'Auto-Settlement'],
          rateLimitPerMinute: 400,
          currentRateCount: 30,
        },

        // FACTURACIÓN
        {
          id: 'int-verifactu',
          code: 'VERIFACTU',
          name: 'AEAT Veri*Factu Realtime System',
          category: 'FACTURACION',
          description: 'Envío de registros de facturación con encadenamiento inalterable Hash SHA-256 a la Agencia Tributaria.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v1.0-2026',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 68900,
          successRatePercentage: 100.0,
          lastSyncAt: new Date(Date.now() - 1 * 60000).toISOString(),
          config: { certificateThumbprint: 'AEAT-CERT-2026-99A', mode: 'PRODUCTION_VERIFACTU' },
          supportedFeatures: ['Encadenamiento Registro', 'Código QR Verifactu', 'Envío Inmediato AEAT'],
          rateLimitPerMinute: 1200,
          currentRateCount: 140,
        },
        {
          id: 'int-ticketbai',
          code: 'TICKETBAI',
          name: 'TicketBAI País Vasco (Gipuzkoa, Bizkaia, Álava)',
          category: 'FACTURACION',
          description: 'Cumplimiento normativo foral de firma digital de tickets y generación de fichero ZUZENEAN / TBAI.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v1.4',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 14200,
          successRatePercentage: 100.0,
          lastSyncAt: new Date(Date.now() - 4 * 60000).toISOString(),
          config: { foralTerritory: 'BIZKAIA', licenseTBAI: 'TBAI-883910-EUS' },
          supportedFeatures: ['Firma XAdES', 'QR TBAI', 'LOTE Batzar'],
          rateLimitPerMinute: 600,
          currentRateCount: 22,
        },
        {
          id: 'int-facturae',
          code: 'FACTURAE',
          name: 'Facturae 3.2.2 B2B & B2G Standard',
          category: 'FACTURACION',
          description: 'Generación y envío de facturas electrónicas XML estructuradas con firma digital a administraciones públicas.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v3.2.2',
          isCustom: false,
          enabled: true,
          healthScore: 98,
          totalRequestsCount: 2100,
          successRatePercentage: 99.0,
          lastSyncAt: new Date(Date.now() - 60 * 60000).toISOString(),
          config: { defaultRoleType: 'EMISOR', autoValidateXml: true },
          supportedFeatures: ['XML Signing', 'FACe Upload', 'FACeB2B'],
          rateLimitPerMinute: 100,
          currentRateCount: 2,
        },
        {
          id: 'int-face',
          code: 'FACE',
          name: 'FACe Punto General de Entrada de Facturas',
          category: 'FACTURACION',
          description: 'Envío automatizado de facturas a ayuntamientos, ministerios y entes públicos estatales.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v2.0',
          isCustom: false,
          enabled: true,
          healthScore: 96,
          totalRequestsCount: 850,
          successRatePercentage: 98.5,
          lastSyncAt: new Date(Date.now() - 120 * 60000).toISOString(),
          config: { faceEnvironment: 'PRODUCTION' },
          supportedFeatures: ['Estado Tramitación', 'Anulación Directa'],
          rateLimitPerMinute: 50,
          currentRateCount: 1,
        },
        {
          id: 'int-sii',
          code: 'SII',
          name: 'SII AEAT (Suministro Inmediato de Información)',
          category: 'FACTURACION',
          description: 'Llevanza de libros registro de IVA a través de la Sede Electrónica de la AEAT para grandes empresas.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v1.1',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 9400,
          successRatePercentage: 99.8,
          lastSyncAt: new Date(Date.now() - 30 * 60000).toISOString(),
          config: { autoSendPeriod: 'DAILY_2359', includeInvoicesIssued: true, includeInvoicesReceived: true },
          supportedFeatures: ['Libro Facturas Emitidas', 'Libro Facturas Recibidas', 'Cuadre Tributario'],
          rateLimitPerMinute: 300,
          currentRateCount: 10,
        },

        // CONTABILIDAD
        {
          id: 'int-sage',
          code: 'SAGE',
          name: 'Sage 50 / Sage 200 Enterprise Sync',
          category: 'CONTABILIDAD',
          description: 'Exportación e importación automática de asientos contables del PGC, cierres Z y facturas recibidas.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v2026.1',
          isCustom: false,
          enabled: true,
          healthScore: 97,
          totalRequestsCount: 11200,
          successRatePercentage: 99.2,
          lastSyncAt: new Date(Date.now() - 40 * 60000).toISOString(),
          config: { sageCompanyId: 'SAGE_MAD_001', mappingPgc: 'PGC_2007_STANDAR' },
          supportedFeatures: ['Diario Contable', 'Subcuentas PGC', 'Desglose IVA'],
          rateLimitPerMinute: 200,
          currentRateCount: 14,
        },
        {
          id: 'int-holded',
          code: 'HOLDED',
          name: 'Holded Cloud ERP Connect',
          category: 'CONTABILIDAD',
          description: 'Sincronización en tiempo real de facturación, contactos, inventario y tesorería bancaria con Holded.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v1.0',
          isCustom: false,
          enabled: true,
          healthScore: 99,
          totalRequestsCount: 18400,
          successRatePercentage: 99.6,
          lastSyncAt: new Date(Date.now() - 15 * 60000).toISOString(),
          config: { apiKey: 'hld_api_991823901', syncInventory: true },
          supportedFeatures: ['Facturas Venta', 'Facturas Compra', 'Contactos CRM', 'Tesorería'],
          rateLimitPerMinute: 400,
          currentRateCount: 38,
        },
        {
          id: 'int-a3',
          code: 'A3',
          name: 'A3innuva / A3con Asesorías',
          category: 'CONTABILIDAD',
          description: 'Envío directo de ficheros de contabilización a asesorías y despachos profesionales fiscal/contable.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v3.8',
          isCustom: false,
          enabled: true,
          healthScore: 98,
          totalRequestsCount: 7100,
          successRatePercentage: 99.0,
          lastSyncAt: new Date(Date.now() - 90 * 60000).toISOString(),
          config: { officeCode: 'A3-MAD-391', format: 'SUIP_ASCII' },
          supportedFeatures: ['Asientos Export', 'Nóminas Import', 'Modelos Fiscales'],
          rateLimitPerMinute: 150,
          currentRateCount: 5,
        },
        {
          id: 'int-contasol',
          code: 'CONTASOL',
          name: 'Contasol / Software DELSOL',
          category: 'CONTABILIDAD',
          description: 'Integración mediante ficheros de intercambio y API directa con el ecosistema de Software DELSOL.',
          status: 'CONNECTED',
          authType: 'BASIC',
          version: 'v2026',
          isCustom: false,
          enabled: true,
          healthScore: 95,
          totalRequestsCount: 3900,
          successRatePercentage: 98.4,
          lastSyncAt: new Date(Date.now() - 180 * 60000).toISOString(),
          config: { exportPath: '/exports/contasol/', fileType: 'TEXT_FIXED' },
          supportedFeatures: ['Diario', 'Facturas', 'Cobros'],
          rateLimitPerMinute: 100,
          currentRateCount: 2,
        },
        {
          id: 'int-sap',
          code: 'SAP',
          name: 'SAP Business One / S/4HANA Connector',
          category: 'CONTABILIDAD',
          description: 'Conector Enterprise SAP Service Layer para consolidación financiera multinacional y control presupuestario.',
          status: 'DISCONNECTED',
          authType: 'OAUTH2',
          version: 'v10.0',
          isCustom: false,
          enabled: false,
          healthScore: 0,
          totalRequestsCount: 0,
          successRatePercentage: 0,
          config: {},
          supportedFeatures: ['Service Layer OData', 'B1if Integration', 'Cost Centers'],
          rateLimitPerMinute: 500,
          currentRateCount: 0,
        },
        {
          id: 'int-businesscentral',
          code: 'BUSINESSCENTRAL',
          name: 'Microsoft Dynamics 365 Business Central',
          category: 'CONTABILIDAD',
          description: 'Integración completa con Microsoft ERP para gestión de compras corporativas, almacenes y ledger.',
          status: 'DISCONNECTED',
          authType: 'OAUTH2',
          version: 'v2.0',
          isCustom: false,
          enabled: false,
          healthScore: 0,
          totalRequestsCount: 0,
          successRatePercentage: 0,
          config: {},
          supportedFeatures: ['Dynamics Web API', 'General Journal Entries'],
          rateLimitPerMinute: 300,
          currentRateCount: 0,
        },

        // MARKETING
        {
          id: 'int-mailchimp',
          code: 'MAILCHIMP',
          name: 'Mailchimp Loyalty & Campaigns',
          category: 'MARKETING',
          description: 'Sincronización de segmentos de clientes CRM, cumpleaños y campañas de fidelización activas.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v3.0',
          isCustom: false,
          enabled: true,
          healthScore: 98,
          totalRequestsCount: 4100,
          successRatePercentage: 99.1,
          lastSyncAt: new Date(Date.now() - 60 * 60000).toISOString(),
          config: { listId: 'mc_list_991823', apiKey: 'mc-us12-98391823901' },
          supportedFeatures: ['Audience Sync', 'Tags Automáticos', 'Automations'],
          rateLimitPerMinute: 200,
          currentRateCount: 11,
        },
        {
          id: 'int-brevo',
          code: 'BREVO',
          name: 'Brevo (Sendinblue) Transactional SMS & Email',
          category: 'MARKETING',
          description: 'Envío masivo y transaccional de confirmaciones de reserva, facturas PDF y cupones de descuento.',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v3',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 15900,
          successRatePercentage: 99.8,
          lastSyncAt: new Date(Date.now() - 5 * 60000).toISOString(),
          config: { senderEmail: 'no-reply@sotiumpos.es', senderName: 'Sotium POS Madrid' },
          supportedFeatures: ['Transactional Email', 'SMS Marketing', 'WhatsApp Templates'],
          rateLimitPerMinute: 500,
          currentRateCount: 45,
        },
        {
          id: 'int-whatsapp',
          code: 'WHATSAPP',
          name: 'WhatsApp Business Cloud API (Meta)',
          category: 'MARKETING',
          description: 'Notificaciones interactivas por WhatsApp: confirmación de reserva, ticket digital y estado de reparto.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v18.0',
          isCustom: false,
          enabled: true,
          healthScore: 99,
          totalRequestsCount: 22400,
          successRatePercentage: 99.7,
          lastSyncAt: new Date(Date.now() - 2 * 60000).toISOString(),
          config: { phoneNumberId: '1092839102', wabaId: '8839201920' },
          supportedFeatures: ['Template Messages', 'Interactive Buttons', 'Delivery Status'],
          rateLimitPerMinute: 600,
          currentRateCount: 52,
        },
        {
          id: 'int-telegram',
          code: 'TELEGRAM',
          name: 'Telegram Bot Alert Channel',
          category: 'MARKETING',
          description: 'Canal privado de alertas urgentes para gerencia (cuadres Z, roturas de stock, incidencias TPV).',
          status: 'CONNECTED',
          authType: 'API_KEY',
          version: 'v6.0',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 8900,
          successRatePercentage: 100.0,
          lastSyncAt: new Date(Date.now() - 15 * 60000).toISOString(),
          config: { botToken: '771239102:AAH991823901***', chatId: '-1009839102' },
          supportedFeatures: ['Manager Bot', 'Instant Alerts', 'Daily Summary'],
          rateLimitPerMinute: 300,
          currentRateCount: 8,
        },
        {
          id: 'int-firebase',
          code: 'FIREBASE',
          name: 'Firebase Cloud Messaging (FCM)',
          category: 'MARKETING',
          description: 'Notificaciones Push a la app móvil de camareros, comanderos y clientes de venta directa.',
          status: 'CONNECTED',
          authType: 'JWT',
          version: 'v1',
          isCustom: false,
          enabled: true,
          healthScore: 99,
          totalRequestsCount: 31200,
          successRatePercentage: 99.9,
          lastSyncAt: new Date(Date.now() - 1 * 60000).toISOString(),
          config: { projectId: 'hostelerp-prod-2026' },
          supportedFeatures: ['Push Notifications', 'Topic Messaging', 'Silent Data Push'],
          rateLimitPerMinute: 1000,
          currentRateCount: 95,
        },

        // CALENDARIOS
        {
          id: 'int-gcalendar',
          code: 'GCALENDAR',
          name: 'Google Workspace Calendar API',
          category: 'CALENDARIOS',
          description: 'Sincronización en tiempo real de reservas de comedor, eventos VIP y cuadrante de turnos del personal.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v3',
          isCustom: false,
          enabled: true,
          healthScore: 99,
          totalRequestsCount: 6200,
          successRatePercentage: 99.4,
          lastSyncAt: new Date(Date.now() - 20 * 60000).toISOString(),
          config: { calendarId: 'reservas@hostelerp.es', autoSyncEvents: true },
          supportedFeatures: ['Two-way Sync', 'Reminders', 'Staff Rosters'],
          rateLimitPerMinute: 300,
          currentRateCount: 16,
        },
        {
          id: 'int-outlook',
          code: 'OUTLOOK',
          name: 'Microsoft Outlook & Teams Calendar',
          category: 'CALENDARIOS',
          description: 'Integración con Microsoft Graph API para eventos corporativos, catering y reuniones de gerencia.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v1.0',
          isCustom: false,
          enabled: true,
          healthScore: 97,
          totalRequestsCount: 2800,
          successRatePercentage: 98.9,
          lastSyncAt: new Date(Date.now() - 50 * 60000).toISOString(),
          config: { tenantId: 'ms-tenant-99218', userPrincipal: 'catering@hostelerp.es' },
          supportedFeatures: ['Graph API', 'Outlook Events', 'Teams Invites'],
          rateLimitPerMinute: 200,
          currentRateCount: 4,
        },
        {
          id: 'int-m365',
          code: 'M365',
          name: 'Microsoft 365 Enterprise Suite',
          category: 'CALENDARIOS',
          description: 'Conexión con SharePoint, Excel Online y OneDrive para volcado de informes y analíticas de negocio.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: 'v1.0',
          isCustom: false,
          enabled: true,
          healthScore: 98,
          totalRequestsCount: 4500,
          successRatePercentage: 99.2,
          lastSyncAt: new Date(Date.now() - 35 * 60000).toISOString(),
          config: { driveId: 'b!991823901823', targetFolder: '/Informes_SotiumPOS/' },
          supportedFeatures: ['Excel Sync', 'OneDrive Backup', 'SharePoint Lists'],
          rateLimitPerMinute: 250,
          currentRateCount: 9,
        },

        // AUTENTICACION
        {
          id: 'int-oauth2',
          code: 'OAUTH2',
          name: 'OAuth2 Single Sign-On (SSO / OIDC)',
          category: 'AUTENTICACION',
          description: 'Proveedor de identidad OpenID Connect (Google, Microsoft, Okta, Keycloak) para login unificado de empleados.',
          status: 'CONNECTED',
          authType: 'OAUTH2',
          version: '2.0',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 29800,
          successRatePercentage: 100.0,
          lastSyncAt: new Date().toISOString(),
          config: { issuer: 'https://auth.hostelerp.es', enforceMfa: true },
          supportedFeatures: ['SSO', 'MFA / 2FA', 'PKCE Code Flow', 'Token Refresh'],
          rateLimitPerMinute: 1200,
          currentRateCount: 65,
        },
        {
          id: 'int-jwt',
          code: 'JWT',
          name: 'JWT Security Tokens & API Keys Gateway',
          category: 'AUTENTICACION',
          description: 'Gestor de claves de API de socios, tokens Bearer de comanderos móviles y rotación de secretos.',
          status: 'CONNECTED',
          authType: 'JWT',
          version: 'v1.0',
          isCustom: false,
          enabled: true,
          healthScore: 100,
          totalRequestsCount: 88500,
          successRatePercentage: 99.98,
          lastSyncAt: new Date().toISOString(),
          config: { tokenExpiryHours: 24, algorithm: 'RS256' },
          supportedFeatures: ['Bearer Tokens', 'Rate Limit Enforcement', 'Ip Whitelisting'],
          rateLimitPerMinute: 5000,
          currentRateCount: 310,
        },
      ];
      this.setItem(this.STORAGE_KEY_CONNECTORS, JSON.stringify(defaultConnectors));
    }

    if (!this.getItem(this.STORAGE_KEY_WEBHOOKS)) {
      const defaultWebhooks: WebhookEndpoint[] = [
        {
          id: 'wh-glovo-01',
          integrationId: 'int-glovo',
          name: 'Glovo Incoming Orders Hook',
          targetUrl: 'https://api.hostelerp.es/api/integrations/webhooks/glovo/orders',
          events: ['ORDER_CREATED', 'ORDER_CANCELLED', 'DELIVERY_STATUS'],
          secretKey: 'whsec_glv_99837498217398',
          signatureAlgorithm: 'HMAC-SHA256',
          status: 'ACTIVE',
          maxRetries: 5,
          createdAt: '2025-01-10T00:00:00Z',
          lastTriggeredAt: new Date(Date.now() - 5 * 60000).toISOString(),
          totalDispatches: 1245,
          failedDispatches: 2,
        },
        {
          id: 'wh-redsys-01',
          integrationId: 'int-redsys',
          name: 'Redsys Payment Confirmation Notification',
          targetUrl: 'https://api.hostelerp.es/api/integrations/webhooks/redsys/confirm',
          events: ['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'BIZUM_SETTLED'],
          secretKey: 'whsec_redsys_39812903810',
          signatureAlgorithm: 'HMAC-SHA256',
          status: 'ACTIVE',
          maxRetries: 3,
          createdAt: '2025-02-01T00:00:00Z',
          lastTriggeredAt: new Date(Date.now() - 3 * 60000).toISOString(),
          totalDispatches: 4520,
          failedDispatches: 0,
        },
        {
          id: 'wh-holded-01',
          integrationId: 'int-holded',
          name: 'Holded Invoice Sync Listener',
          targetUrl: 'https://api.hostelerp.es/api/integrations/webhooks/holded/invoices',
          events: ['INVOICE_CREATED', 'CONTACT_UPDATED'],
          secretKey: 'whsec_hld_9921839102',
          signatureAlgorithm: 'HMAC-SHA256',
          status: 'ACTIVE',
          maxRetries: 3,
          createdAt: '2025-03-15T00:00:00Z',
          lastTriggeredAt: new Date(Date.now() - 25 * 60000).toISOString(),
          totalDispatches: 890,
          failedDispatches: 1,
        },
      ];
      this.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(defaultWebhooks));
    }

    if (!this.getItem(this.STORAGE_KEY_WEBHOOK_LOGS)) {
      const defaultLogs: WebhookLog[] = [
        {
          id: 'log-wh-101',
          webhookId: 'wh-glovo-01',
          integrationId: 'int-glovo',
          provider: 'Glovo',
          event: 'ORDER_CREATED',
          payload: { orderId: 'GLV-2026-9918', itemsCount: 3, total: 34.5, customer: 'María G.' },
          responseStatus: 200,
          responseBody: '{"success":true,"message":"Order processed into KDS"}',
          durationMs: 45,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          level: 'SUCCESS',
          signatureValid: true,
          retryCount: 0,
        },
        {
          id: 'log-wh-102',
          webhookId: 'wh-redsys-01',
          integrationId: 'int-redsys',
          provider: 'Redsys',
          event: 'PAYMENT_SUCCESS',
          payload: { orderId: 'ORD-2026-778', amount: 55.0, bizum: true, authCode: '992813' },
          responseStatus: 200,
          responseBody: '{"status":"OK","ticketPrinted":true}',
          durationMs: 32,
          timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
          level: 'SUCCESS',
          signatureValid: true,
          retryCount: 0,
        },
        {
          id: 'log-wh-103',
          webhookId: 'wh-holded-01',
          integrationId: 'int-holded',
          provider: 'Holded',
          event: 'INVOICE_CREATED',
          payload: { docId: 'INV-2026-0099', total: 120.0 },
          responseStatus: 504,
          responseBody: '{"error":"Gateway Timeout during Sage mapping"}',
          durationMs: 5000,
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          level: 'ERROR',
          signatureValid: true,
          retryCount: 2,
          errorMessage: '504 Gateway Timeout: servidor externo tardó más de 5000ms',
        },
      ];
      this.setItem(this.STORAGE_KEY_WEBHOOK_LOGS, JSON.stringify(defaultLogs));
    }

    if (!this.getItem(this.STORAGE_KEY_OAUTH)) {
      const defaultOAuth: OAuthTokenConnection[] = [
        {
          id: 'oauth-ubereats-01',
          integrationId: 'int-ubereats',
          provider: 'Uber Eats',
          accountEmail: 'pedidos@hostelerp.es',
          clientId: 'uber_client_madrid_central',
          tokenType: 'Bearer',
          accessToken: 'ub.a.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'ub.ref.892301928301923',
          expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
          scopes: ['eats.store', 'eats.order', 'eats.menu'],
          status: 'ACTIVE',
          lastRefreshedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'oauth-gcalendar-01',
          integrationId: 'int-gcalendar',
          provider: 'Google Workspace',
          accountEmail: 'reservas@hostelerp-group.es',
          clientId: '771239102-apps.googleusercontent.com',
          tokenType: 'Bearer',
          accessToken: 'ya29.a0ARW5m...google_oauth_token',
          refreshToken: '1//09839182390182390',
          expiresAt: new Date(Date.now() + 3600000 * 2).toISOString(),
          scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
          status: 'ACTIVE',
          lastRefreshedAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'oauth-sage-01',
          integrationId: 'int-sage',
          provider: 'Sage 50 Enterprise',
          accountEmail: 'contabilidad@hostelerp-group.es',
          clientId: 'sage_ent_clientId_9921',
          tokenType: 'Bearer',
          accessToken: 'sage.tok.992183901283',
          refreshToken: 'sage.ref.1102930192',
          expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
          scopes: ['accounting.read', 'accounting.write', 'journals.write'],
          status: 'ACTIVE',
          lastRefreshedAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      this.setItem(this.STORAGE_KEY_OAUTH, JSON.stringify(defaultOAuth));
    }

    if (!this.getItem(this.STORAGE_KEY_DLQ)) {
      const defaultDLQ: DLQItem[] = [
        {
          id: 'dlq-item-01',
          integrationId: 'int-holded',
          connectorName: 'Holded Cloud ERP Connect',
          eventType: 'INVOICE_SYNC_FAIL',
          payload: { invoiceId: 'FAC-2026-0044', amount: 450.0, reason: 'Holded API Rate Limit Exceeded' },
          errorMessage: '429 Too Many Requests - 5 retries exhausted',
          attemptCount: 5,
          maxAttempts: 5,
          firstFailedAt: new Date(Date.now() - 7200000).toISOString(),
          lastAttemptAt: new Date(Date.now() - 1800000).toISOString(),
          nextRetryAt: new Date(Date.now() + 3600000).toISOString(),
          status: 'PENDING',
          aiDiagnosis: 'Diagnóstico IA Gemini: La API de Holded devolvió un límite de velocidad (Rate Limit 429). Se recomienda aplicar backoff exponencial de 15 minutos.',
        },
        {
          id: 'dlq-item-02',
          integrationId: 'int-glovo',
          connectorName: 'Glovo On-Demand',
          eventType: 'MENU_SYNC_PRICE_MISMATCH',
          payload: { sku: 'ART-901', priceTPV: 12.5, priceGlovo: 11.0 },
          errorMessage: 'Validation Error: El precio en Glovo difiere del escandallo oficial TPV',
          attemptCount: 3,
          maxAttempts: 5,
          firstFailedAt: new Date(Date.now() - 14400000).toISOString(),
          lastAttemptAt: new Date(Date.now() - 3600000).toISOString(),
          nextRetryAt: new Date(Date.now() + 1800000).toISOString(),
          status: 'PENDING',
          aiDiagnosis: 'Diagnóstico IA Gemini: Discrepancia de precios detectada. Ajustar parámetro autoUpdatePrices en la configuración del conector Glovo.',
        },
      ];
      this.setItem(this.STORAGE_KEY_DLQ, JSON.stringify(defaultDLQ));
    }

    if (!this.getItem(this.STORAGE_KEY_SYNC)) {
      const defaultSync: SyncEngineItem[] = [
        {
          id: 'sync-sq-01',
          integrationId: 'int-verifactu',
          entity: 'VeriFactuInvoice',
          action: 'CREATE',
          recordId: 'FAC-2026-00102',
          sqliteStatus: 'PROCESSED',
          postgresStatus: 'SYNCED',
          payload: { hash: 'a89c938166d1f9...', qrUrl: 'https://www.agenciatributaria.gob.es/...' },
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
        {
          id: 'sync-sq-02',
          integrationId: 'int-redsys',
          entity: 'PaymentTransaction',
          action: 'CREATE',
          recordId: 'PAY-2026-8812',
          sqliteStatus: 'PROCESSED',
          postgresStatus: 'SYNCED',
          payload: { amount: 89.5, method: 'BIZUM' },
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
      ];
      this.setItem(this.STORAGE_KEY_SYNC, JSON.stringify(defaultSync));
    }
  }

  // --- CONNECTORS REGISTRY ---
  public getConnectors(filter?: { category?: IntegrationCategory; status?: string; search?: string }): IntegrationConnector[] {
    const raw = this.getItem(this.STORAGE_KEY_CONNECTORS);
    let connectors: IntegrationConnector[] = raw ? JSON.parse(raw) : [];

    if (!filter) return connectors;

    if (filter.category) {
      connectors = connectors.filter((c) => c.category === filter.category);
    }
    if (filter.status) {
      connectors = connectors.filter((c) => c.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      connectors = connectors.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.supportedFeatures.some((f) => f.toLowerCase().includes(q))
      );
    }
    return connectors;
  }

  public getConnectorById(id: string): IntegrationConnector | undefined {
    return this.getConnectors().find((c) => c.id === id || c.code === id);
  }

  public toggleConnector(id: string, activeUser = 'Administrador Enterprise'): IntegrationConnector {
    const connectors = this.getConnectors();
    const idx = connectors.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Conector no encontrado');

    const current = connectors[idx];
    const updated = {
      ...current,
      enabled: !current.enabled,
      status: (!current.enabled ? 'CONNECTED' : 'DISCONNECTED') as any,
    };
    connectors[idx] = updated;
    this.setItem(this.STORAGE_KEY_CONNECTORS, JSON.stringify(connectors));

    AuditService.log({
      action: 'INTEGRATION_TOGGLE',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: `Conector ${updated.name} ${updated.enabled ? 'activado' : 'desactivado'}`,
    });
    return updated;
  }

  public updateConnectorConfig(
    id: string,
    config: Record<string, any>,
    activeUser = 'Administrador Enterprise'
  ): IntegrationConnector {
    const connectors = this.getConnectors();
    const idx = connectors.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Conector no encontrado');

    const updated = {
      ...connectors[idx],
      config: { ...connectors[idx].config, ...config },
      status: 'CONNECTED' as const,
      healthScore: 100,
      lastSyncAt: new Date().toISOString(),
    };
    connectors[idx] = updated;
    this.setItem(this.STORAGE_KEY_CONNECTORS, JSON.stringify(connectors));

    AuditService.log({
      action: 'INTEGRATION_UPDATE_CONFIG',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: `Configuración actualizada para ${updated.name}`,
    });
    return updated;
  }

  public testConnectorConnection(id: string): { success: boolean; latencyMs: number; message: string } {
    const connector = this.getConnectorById(id);
    if (!connector) return { success: false, latencyMs: 0, message: 'Conector no encontrado' };

    const latencyMs = Math.floor(Math.random() * 45) + 12;
    if (!connector.enabled) {
      return { success: false, latencyMs, message: `Conector ${connector.name} está desactivado.` };
    }

    return {
      success: true,
      latencyMs,
      message: `Conexión con ${connector.name} (versión ${connector.version}) verificada con éxito. Latencia: ${latencyMs}ms.`,
    };
  }

  // --- WEBHOOK MANAGER ---
  public getWebhooks(): WebhookEndpoint[] {
    const raw = this.getItem(this.STORAGE_KEY_WEBHOOKS);
    return raw ? JSON.parse(raw) : [];
  }

  public createWebhook(
    data: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'totalDispatches' | 'failedDispatches'>,
    activeUser = 'Administrador Enterprise'
  ): WebhookEndpoint {
    const webhooks = this.getWebhooks();
    const newWh: WebhookEndpoint = {
      ...data,
      id: `wh-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalDispatches: 0,
      failedDispatches: 0,
    };
    webhooks.push(newWh);
    this.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(webhooks));

    AuditService.log({
      action: 'WEBHOOK_CREATE',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: `Webhook registrado: ${newWh.name} -> ${newWh.targetUrl}`,
    });
    return newWh;
  }

  public getWebhookLogs(): WebhookLog[] {
    const raw = this.getItem(this.STORAGE_KEY_WEBHOOK_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public dispatchWebhookTest(webhookId: string, eventName: string, payload: Record<string, any>): WebhookLog {
    const webhooks = this.getWebhooks();
    const wh = webhooks.find((w) => w.id === webhookId);

    const log: WebhookLog = {
      id: `log-wh-${Date.now()}`,
      webhookId: webhookId,
      integrationId: wh ? wh.integrationId : 'int-custom',
      provider: wh ? wh.name : 'Test Endpoint',
      event: eventName,
      payload,
      responseStatus: 200,
      responseBody: JSON.stringify({ success: true, timestamp: new Date().toISOString(), echo: payload }),
      durationMs: Math.floor(Math.random() * 35) + 15,
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      signatureValid: true,
      retryCount: 0,
    };

    const logs = this.getWebhookLogs();
    logs.unshift(log);
    this.setItem(this.STORAGE_KEY_WEBHOOK_LOGS, JSON.stringify(logs.slice(0, 500)));

    if (wh) {
      wh.totalDispatches += 1;
      wh.lastTriggeredAt = new Date().toISOString();
      this.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(webhooks));
    }

    return log;
  }

  // --- OAUTH MANAGER ---
  public getOAuthConnections(): OAuthTokenConnection[] {
    const raw = this.getItem(this.STORAGE_KEY_OAUTH);
    return raw ? JSON.parse(raw) : [];
  }

  public refreshOAuthToken(id: string, activeUser = 'Administrador Enterprise'): OAuthTokenConnection {
    const connections = this.getOAuthConnections();
    const idx = connections.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Conexión OAuth no encontrada');

    const updated: OAuthTokenConnection = {
      ...connections[idx],
      accessToken: `refreshed_access_${Math.random().toString(36).substring(2)}`,
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      status: 'ACTIVE',
      lastRefreshedAt: new Date().toISOString(),
    };
    connections[idx] = updated;
    this.setItem(this.STORAGE_KEY_OAUTH, JSON.stringify(connections));

    AuditService.log({
      action: 'OAUTH_TOKEN_REFRESH',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: `Token OAuth renovado para ${updated.provider} (${updated.accountEmail})`,
    });
    return updated;
  }

  public revokeOAuthToken(id: string, activeUser = 'Administrador Enterprise'): OAuthTokenConnection {
    const connections = this.getOAuthConnections();
    const idx = connections.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Conexión OAuth no encontrada');

    const updated: OAuthTokenConnection = {
      ...connections[idx],
      status: 'REVOKED',
    };
    connections[idx] = updated;
    this.setItem(this.STORAGE_KEY_OAUTH, JSON.stringify(connections));

    AuditService.log({
      action: 'OAUTH_TOKEN_REVOKE',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: `Acceso OAuth revocado para ${updated.provider}`,
    });
    return updated;
  }

  // --- DEAD LETTER QUEUE (DLQ) & RETRY ENGINE ---
  public getDLQItems(): DLQItem[] {
    const raw = this.getItem(this.STORAGE_KEY_DLQ);
    return raw ? JSON.parse(raw) : [];
  }

  public retryDLQItem(id: string, activeUser = 'Administrador Enterprise'): DLQItem {
    const items = this.getDLQItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Elemento DLQ no encontrado');

    const current = items[idx];
    const updated: DLQItem = {
      ...current,
      attemptCount: current.attemptCount + 1,
      lastAttemptAt: new Date().toISOString(),
      status: 'RESOLVED',
    };
    items[idx] = updated;
    this.setItem(this.STORAGE_KEY_DLQ, JSON.stringify(items));

    AuditService.log({
      action: 'DLQ_ITEM_RETRY_SUCCESS',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: `Reintento manual exitoso de evento DLQ #${id} (${updated.connectorName})`,
    });
    return updated;
  }

  public purgeDLQItem(id: string, activeUser = 'Administrador Enterprise'): void {
    const items = this.getDLQItems();
    const filtered = items.filter((i) => i.id !== id);
    this.setItem(this.STORAGE_KEY_DLQ, JSON.stringify(filtered));

    AuditService.log({
      action: 'DLQ_ITEM_PURGE',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: `Elemento descartado de Dead Letter Queue #${id}`,
    });
  }

  // --- SYNC ENGINE ---
  public getSyncEngineItems(): SyncEngineItem[] {
    const raw = this.getItem(this.STORAGE_KEY_SYNC);
    return raw ? JSON.parse(raw) : [];
  }

  public triggerSyncAll(activeUser = 'Administrador Enterprise'): { processedCount: number; status: string } {
    const connectors = this.getConnectors();
    connectors.forEach((c) => {
      if (c.enabled) {
        c.lastSyncAt = new Date().toISOString();
        c.healthScore = Math.min(100, c.healthScore + 2);
      }
    });
    this.setItem(this.STORAGE_KEY_CONNECTORS, JSON.stringify(connectors));

    AuditService.log({
      action: 'INTEGRATION_SYNC_ALL',
      username: activeUser,
      resource: 'IntegrationPlatform',
      details: 'Sincronización global ejecutada para todos los conectores activos',
    });

    return { processedCount: connectors.filter((c) => c.enabled).length, status: 'OK' };
  }

  // --- GLOBAL SEARCH ---
  public searchIntegrations(query: string): GlobalIntegrationSearchItem[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase();
    const results: GlobalIntegrationSearchItem[] = [];

    // Connectors
    this.getConnectors().forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        results.push({
          id: c.id,
          title: c.name,
          type: 'CONNECTOR',
          description: `[Conector ${c.category}] ${c.description}`,
          category: c.category,
          status: c.status,
        });
      }
    });

    // Webhooks
    this.getWebhooks().forEach((w) => {
      if (w.name.toLowerCase().includes(q) || w.targetUrl.toLowerCase().includes(q)) {
        results.push({
          id: w.id,
          title: w.name,
          type: 'WEBHOOK',
          description: `[Webhook] Eventos: ${w.events.join(', ')} -> ${w.targetUrl}`,
          status: w.status,
        });
      }
    });

    // DLQ
    this.getDLQItems().forEach((d) => {
      if (d.connectorName.toLowerCase().includes(q) || d.errorMessage.toLowerCase().includes(q) || d.eventType.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          title: `DLQ: ${d.connectorName} - ${d.eventType}`,
          type: 'DLQ',
          description: `Error: ${d.errorMessage}`,
          status: d.status,
        });
      }
    });

    // OAuth
    this.getOAuthConnections().forEach((o) => {
      if (o.provider.toLowerCase().includes(q) || o.accountEmail.toLowerCase().includes(q)) {
        results.push({
          id: o.id,
          title: `OAuth: ${o.provider} (${o.accountEmail})`,
          type: 'TOKEN',
          description: `Scopes: ${o.scopes.join(', ')}`,
          status: o.status,
        });
      }
    });

    return results;
  }

  // --- EXPORT & IMPORT ---
  public exportIntegrationsConfig(): string {
    const data = {
      connectors: this.getConnectors(),
      webhooks: this.getWebhooks(),
      oauth: this.getOAuthConnections(),
      dlq: this.getDLQItems(),
      exportedAt: new Date().toISOString(),
      platformVersion: 'Sotium POS Enterprise v12.4',
    };
    return JSON.stringify(data, null, 2);
  }

  public importIntegrationsConfig(jsonContent: string, activeUser = 'Administrador Enterprise'): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.connectors) this.setItem(this.STORAGE_KEY_CONNECTORS, JSON.stringify(parsed.connectors));
      if (parsed.webhooks) this.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(parsed.webhooks));
      if (parsed.oauth) this.setItem(this.STORAGE_KEY_OAUTH, JSON.stringify(parsed.oauth));
      if (parsed.dlq) this.setItem(this.STORAGE_KEY_DLQ, JSON.stringify(parsed.dlq));

      AuditService.log({
        action: 'INTEGRATIONS_IMPORT_BULK',
        username: activeUser,
        resource: 'IntegrationPlatform',
        details: 'Configuración global de integraciones importada con éxito',
      });
      return { success: true, message: 'Configuraciones de integraciones importadas con éxito.' };
    } catch (err: any) {
      logger.error('[IntegrationsImport] Error importando JSON:', err);
      return { success: false, message: `Error parseando archivo JSON: ${err.message}` };
    }
  }
}

export const integrationService = IntegrationService.getInstance();
