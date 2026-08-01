import {
  CompanyConfig,
  TPVHardwareConfig,
  GeneralSettings,
  AdminUser,
  AdminRole,
  SecurityPolicy,
  AuditLogEntry,
  SystemLogEntry,
  BackupRecord,
  BackupType,
  BackupScheduleConfig,
  SyncOverview,
  LicenseInfo,
  NotificationRule,
  PrinterDevice,
  CashDrawerDevice,
  DisplayDevice,
  LogLevel,
  SystemLogCategory,
} from '../types/backoffice';

class BackofficeService {
  private STORAGE_KEY_COMPANY = 'erp_company_config_v1';
  private STORAGE_KEY_HARDWARE = 'erp_hardware_config_v1';
  private STORAGE_KEY_GENERAL = 'erp_general_settings_v1';
  private STORAGE_KEY_USERS = 'erp_admin_users_v1';
  private STORAGE_KEY_ROLES = 'erp_admin_roles_v1';
  private STORAGE_KEY_POLICIES = 'erp_security_policies_v1';
  private STORAGE_KEY_AUDIT = 'erp_audit_logs_v1';
  private STORAGE_KEY_LOGS = 'erp_system_logs_v1';
  private STORAGE_KEY_BACKUPS = 'erp_backups_v1';
  private STORAGE_KEY_BACKUP_SCHEDULE = 'erp_backup_schedule_v1';
  private STORAGE_KEY_SYNC = 'erp_sync_overview_v1';
  private STORAGE_KEY_LICENSE = 'erp_license_info_v1';
  private STORAGE_KEY_NOTIFICATIONS = 'erp_notification_rules_v1';

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

  private initDefaultData() {
    if (!this.getItem(this.STORAGE_KEY_COMPANY)) {
      const defaultCompany: CompanyConfig = {
        id: 'comp-001',
        name: 'Sotium POS Group España S.L.',
        legalName: 'SOTIUM POS ENTERPRISE ESPAÑA SOCIEDAD LIMITADA',
        nif: 'B87654321',
        email: 'contacto@sotiumpos.es',
        phone: '+34 912 345 678',
        website: 'https://sotiumpos.es',
        address: 'Paseo de la Castellana 120, Planta 4',
        city: 'Madrid',
        postalCode: '28046',
        province: 'Madrid',
        country: 'España',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
        currency: 'EUR',
        currencySymbol: '€',
        timezone: 'Europe/Madrid',
        language: 'es-ES',
        branchesCount: 4,
        digitalCertificateStatus: 'VALID',
        digitalCertificateExpiresAt: '2028-12-31T23:59:59Z',
        verifactuEnabled: true,
        ticketFooter: '¡Gracias por su visita! Conservar ticket para cualquier cambio o reclamación. IVA Incluido.',
        invoicePrefix: 'FAC-2026-',
      };
      this.setItem(this.STORAGE_KEY_COMPANY, JSON.stringify(defaultCompany));
    }

    if (!this.getItem(this.STORAGE_KEY_HARDWARE)) {
      const defaultHardware: TPVHardwareConfig = {
        ticketSeries: 'T2026-MAD-',
        invoiceSeries: 'F2026-MAD-',
        creditNoteSeries: 'R2026-MAD-',
        pdaCount: 6,
        networkSubnet: '192.168.1.0/24',
        offlineReceiptBufferLimit: 500,
        kdsRefreshIntervalSec: 5,
        printers: [
          {
            id: 'prn-01',
            name: 'Impresora Bar Principal',
            type: 'ESC_POS',
            ipAddress: '192.168.1.101',
            port: 9100,
            assignedZone: 'BAR',
            paperWidth: '80mm',
            status: 'ONLINE',
            autoCut: true,
            openDrawer: true,
          },
          {
            id: 'prn-02',
            name: 'Impresora Cocina Caliente',
            type: 'NETWORK',
            ipAddress: '192.168.1.102',
            port: 9100,
            assignedZone: 'COCINA_1',
            paperWidth: '80mm',
            status: 'ONLINE',
            autoCut: true,
            openDrawer: false,
          },
          {
            id: 'prn-03',
            name: 'Impresora Postres y Frío',
            type: 'NETWORK',
            ipAddress: '192.168.1.103',
            port: 9100,
            assignedZone: 'POSTRES',
            paperWidth: '80mm',
            status: 'ONLINE',
            autoCut: true,
            openDrawer: false,
          },
        ],
        cashDrawers: [
          {
            id: 'cdr-01',
            name: 'Cajón Principal TPV 1',
            connectedPrinterId: 'prn-01',
            connectionType: 'RJ11',
            autoOpenOnCashSale: true,
            requirePinToOpen: true,
            status: 'READY',
          },
        ],
        displays: [
          {
            id: 'dsp-01',
            name: 'Pantalla Visor Cliente TPV 1',
            type: 'CUSTOMER_DISPLAY',
            ipAddress: '192.168.1.150',
            assignedZone: 'BARRA',
            resolution: '480x272 VFD',
            status: 'CONNECTED',
          },
          {
            id: 'dsp-02',
            name: 'Monitor KDS Pantalla Cocina 1',
            type: 'KDS_MONITOR',
            ipAddress: '192.168.1.160',
            assignedZone: 'COCINA_1',
            resolution: '1920x1080 Full HD',
            status: 'CONNECTED',
          },
        ],
      };
      this.setItem(this.STORAGE_KEY_HARDWARE, JSON.stringify(defaultHardware));
    }

    if (!this.getItem(this.STORAGE_KEY_GENERAL)) {
      const defaultGeneral: GeneralSettings = {
        taxes: [
          { id: 'tax-10', name: 'IVA Reducido Hostelería (10%)', rate: 10, isDefault: true, code: 'IVA10' },
          { id: 'tax-21', name: 'IVA General Bebidas/Alcohol (21%)', rate: 21, isDefault: false, code: 'IVA21' },
          { id: 'tax-4', name: 'IVA Superreducido Pan/Básicos (4%)', rate: 4, isDefault: false, code: 'IVA4' },
          { id: 'tax-0', name: 'Exento IVA (0%)', rate: 0, isDefault: false, code: 'IVA0' },
        ],
        families: [
          { id: 'fam-1', code: 'BEB', name: 'Bebidas y Cafetería', color: '#3b82f6', printerZone: 'BAR', subcategories: ['Cafés', 'Refrescos', 'Cervezas', 'Vinos'], active: true },
          { id: 'fam-2', code: 'ENT', name: 'Entrantes y Tapas', color: '#f59e0b', printerZone: 'COCINA_1', subcategories: ['Raciones', 'Ensaladas', 'Embutidos'], active: true },
          { id: 'fam-3', code: 'PRI', name: 'Platos Principales', color: '#ef4444', printerZone: 'COCINA_1', subcategories: ['Carnes', 'Pescados', 'Arroces'], active: true },
          { id: 'fam-4', code: 'POS', name: 'Postres Caseros', color: '#ec4899', printerZone: 'POSTRES', subcategories: ['Tartas', 'Helados', 'Fruta'], active: true },
        ],
        paymentMethods: [
          { id: 'pm-1', code: 'CASH', name: 'Efectivo Cash', type: 'CASH', opensDrawer: true, requiresCustomer: false, iconName: 'Banknote', active: true },
          { id: 'pm-2', code: 'CARD', name: 'Tarjeta TPV Datáfono', type: 'CARD', opensDrawer: false, requiresCustomer: false, iconName: 'CreditCard', active: true },
          { id: 'pm-3', code: 'BIZUM', name: 'Bizum Empresa', type: 'BIZUM', opensDrawer: false, requiresCustomer: false, iconName: 'Smartphone', active: true },
          { id: 'pm-4', code: 'ROOM', name: 'Cargo a Habitación / Cuenta', type: 'ROOM_CHARGE', opensDrawer: false, requiresCustomer: true, iconName: 'Hotel', active: true },
        ],
        bankAccounts: [
          { id: 'bank-1', bankName: 'Banco Santander Corporate', iban: 'ES91 0049 1500 0512 3456 7890', swift: 'BSCHESMMXXX', currency: 'EUR', balance: 142500.50, isPrimary: true },
          { id: 'bank-2', bankName: 'BBVA Empresas', iban: 'ES12 0182 2300 1198 7654 3210', swift: 'BBVAESMMXXX', currency: 'EUR', balance: 48900.00, isPrimary: false },
        ],
        currencies: [
          { code: 'EUR', name: 'Euro', symbol: '€', rateToEUR: 1.0, lastUpdated: new Date().toISOString() },
          { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', rateToEUR: 1.08, lastUpdated: new Date().toISOString() },
          { code: 'GBP', name: 'Libra Esterlina', symbol: '£', rateToEUR: 0.85, lastUpdated: new Date().toISOString() },
        ],
      };
      this.setItem(this.STORAGE_KEY_GENERAL, JSON.stringify(defaultGeneral));
    }

    if (!this.getItem(this.STORAGE_KEY_USERS)) {
      const defaultUsers: AdminUser[] = [
        {
          id: 'usr-001',
          username: 'admin.super',
          fullName: 'Carlos Mendoza (Director TI)',
          email: 'carlos.mendoza@hostelerp.es',
          roleId: 'role-superadmin',
          roleName: 'SuperAdmin ERP',
          active: true,
          lastLogin: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          ipAddress: '192.168.1.45',
          twoFactorEnabled: true,
          failedLoginAttempts: 0,
          isLocked: false,
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'usr-002',
          username: 'manager.madrid',
          fullName: 'Elena Gómez (Gerente Sala)',
          email: 'elena.gomez@hostelerp.es',
          roleId: 'role-manager',
          roleName: 'Gerente Restaurante',
          active: true,
          lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          ipAddress: '192.168.1.48',
          twoFactorEnabled: false,
          failedLoginAttempts: 0,
          isLocked: false,
          createdAt: '2025-02-15T00:00:00Z',
        },
        {
          id: 'usr-003',
          username: 'auditor.fiscal',
          fullName: 'Javier Roca (Auditor Externo)',
          email: 'jroca@auditores.es',
          roleId: 'role-auditor',
          roleName: 'Auditor Fiscal',
          active: true,
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          ipAddress: '88.12.94.102',
          twoFactorEnabled: true,
          failedLoginAttempts: 0,
          isLocked: false,
          createdAt: '2025-04-10T00:00:00Z',
        },
      ];
      this.setItem(this.STORAGE_KEY_USERS, JSON.stringify(defaultUsers));
    }

    if (!this.getItem(this.STORAGE_KEY_ROLES)) {
      const defaultRoles: AdminRole[] = [
        {
          id: 'role-superadmin',
          code: 'SUPERADMIN',
          name: 'SuperAdmin ERP',
          description: 'Acceso ilimitado a toda la configuración, usuarios, licencias, backups y auditoría.',
          permissions: ['*'],
          isSystemRole: true,
        },
        {
          id: 'role-manager',
          code: 'MANAGER',
          name: 'Gerente Restaurante',
          description: 'Gestión de turnos, arqueos, cancelaciones, cambios de precios y stock.',
          permissions: ['tpv.*', 'caja.*', 'productos.*', 'almacen.*', 'rrhh.view', 'informes.*'],
          isSystemRole: true,
        },
        {
          id: 'role-auditor',
          code: 'AUDITOR',
          name: 'Auditor Fiscal / VeriFactu',
          description: 'Acceso de solo lectura a registros de auditoría, facturas electrónicas y huella digital.',
          permissions: ['audit.read', 'cumplimiento.read', 'informes.read', 'logs.read'],
          isSystemRole: true,
        },
      ];
      this.setItem(this.STORAGE_KEY_ROLES, JSON.stringify(defaultRoles));
    }

    if (!this.getItem(this.STORAGE_KEY_POLICIES)) {
      const defaultPolicy: SecurityPolicy = {
        minPasswordLength: 10,
        requireNumbers: true,
        requireSymbols: true,
        passwordExpirationDays: 90,
        maxFailedAttemptsBeforeLock: 5,
        sessionTimeoutMinutes: 30,
        allowMultipleSessionsPerUser: false,
      };
      this.setItem(this.STORAGE_KEY_POLICIES, JSON.stringify(defaultPolicy));
    }

    if (!this.getItem(this.STORAGE_KEY_AUDIT)) {
      const defaultAudit: AuditLogEntry[] = [
        {
          id: 'aud-001',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          userId: 'usr-001',
          userName: 'Carlos Mendoza',
          action: 'UPDATE_COMPANY_TAX_ID',
          module: 'ADMINISTRACION',
          entity: 'CompanyConfig',
          entityId: 'comp-001',
          changesBefore: { nif: 'B87654320' },
          changesAfter: { nif: 'B87654321' },
          ipAddress: '192.168.1.45',
          device: 'Chrome / Windows 11 Enterprise',
          integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        },
        {
          id: 'aud-002',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          userId: 'usr-001',
          userName: 'Carlos Mendoza',
          action: 'ENABLE_VERIFACTU_SIGNING',
          module: 'CUMPLIMIENTO',
          entity: 'VeriFactuConfig',
          entityId: 'comp-001',
          changesBefore: { verifactuEnabled: false },
          changesAfter: { verifactuEnabled: true },
          ipAddress: '192.168.1.45',
          device: 'Chrome / Windows 11 Enterprise',
          integrityHash: 'a89c938166d1f99c80521743a4e9ef9739c3a3ef808b261b0c000574880b4e54',
        },
      ];
      this.setItem(this.STORAGE_KEY_AUDIT, JSON.stringify(defaultAudit));
    }

    if (!this.getItem(this.STORAGE_KEY_LOGS)) {
      const defaultLogs: SystemLogEntry[] = [
        {
          id: 'log-001',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          level: 'INFO',
          category: 'POSTGRES',
          message: 'Conexión a base de datos PostgreSQL principal restablecida correctamente.',
          source: 'PostgresPoolWorker',
        },
        {
          id: 'log-002',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          level: 'WARNING',
          category: 'SQLITE',
          message: 'Sincronización diferida: 3 tickets en cola por latencia temporal de red.',
          source: 'SQLiteSyncDaemon',
          code: 'SYNC_RETRY_QUEUED',
        },
        {
          id: 'log-003',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          level: 'INFO',
          category: 'IA',
          message: 'Asistente Gemini 3.6 Flash generó recomendación de optimización fiscal.',
          source: 'GeminiConfigAdvisor',
        },
      ];
      this.setItem(this.STORAGE_KEY_LOGS, JSON.stringify(defaultLogs));
    }

    if (!this.getItem(this.STORAGE_KEY_BACKUPS)) {
      const defaultBackups: BackupRecord[] = [
        {
          id: 'bak-2026-07-31-01',
          fileName: 'SotiumPOS_Full_Backup_20260731_0300.enc',
          fileSizeMb: 142.8,
          type: 'AUTOMATIC',
          status: 'VERIFIED',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          checksumMd5: '9b7038783e21e9ba6e8898e945120d9f',
          storageLocation: 'HYBRID',
          encrypted: true,
        },
        {
          id: 'bak-2026-07-30-01',
          fileName: 'SotiumPOS_Full_Backup_20260730_0300.enc',
          fileSizeMb: 141.2,
          type: 'AUTOMATIC',
          status: 'VERIFIED',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          checksumMd5: '3a41b2c45e89d12a9876543210fedcba',
          storageLocation: 'HYBRID',
          encrypted: true,
        },
      ];
      this.setItem(this.STORAGE_KEY_BACKUPS, JSON.stringify(defaultBackups));
    }

    if (!this.getItem(this.STORAGE_KEY_BACKUP_SCHEDULE)) {
      const defaultSchedule: BackupScheduleConfig = {
        autoBackupEnabled: true,
        frequency: 'DAILY',
        retentionDays: 30,
        timeOfDay: '03:00',
        destination: 'LOCAL_AND_CLOUD',
        encryptBackups: true,
      };
      this.setItem(this.STORAGE_KEY_BACKUP_SCHEDULE, JSON.stringify(defaultSchedule));
    }

    if (!this.getItem(this.STORAGE_KEY_SYNC)) {
      const defaultSync: SyncOverview = {
        overallStatus: 'ONLINE_SYNCED',
        pendingQueueCount: 0,
        lastSuccessfulSyncAt: new Date().toISOString(),
        latencyMs: 14,
        sqliteRecordCount: 48920,
        postgresRecordCount: 48920,
        items: [
          {
            id: 'sync-item-01',
            table: 'orders',
            recordId: 'ord-8891',
            operation: 'INSERT',
            status: 'SYNCED',
            retryCount: 0,
            lastAttemptAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: 'sync-item-02',
            table: 'cash_closures',
            recordId: 'close-20260730',
            operation: 'INSERT',
            status: 'SYNCED',
            retryCount: 0,
            lastAttemptAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
          },
        ],
      };
      this.setItem(this.STORAGE_KEY_SYNC, JSON.stringify(defaultSync));
    }

    if (!this.getItem(this.STORAGE_KEY_LICENSE)) {
      const defaultLicense: LicenseInfo = {
        licenseKey: 'ERP-ENT-2026-99A4-BF82-9901-X7',
        type: 'ENTERPRISE_ULTIMATE',
        companyHolder: 'Sotium POS Group España S.L.',
        activationDate: '2025-01-01T00:00:00Z',
        expirationDate: '2027-12-31T23:59:59Z',
        daysRemaining: 518,
        maxPOSLicenses: 25,
        usedPOSLicenses: 8,
        features: {
          multiCompany: true,
          verifactu: true,
          aiAdvisor: true,
          maintenanceSAT: true,
          haccpQuality: true,
          deliveryHub: true,
          productionLots: true,
          kdsKitchen: true,
          advancedAnalytics: true,
        },
      };
      this.setItem(this.STORAGE_KEY_LICENSE, JSON.stringify(defaultLicense));
    }

    if (!this.getItem(this.STORAGE_KEY_NOTIFICATIONS)) {
      const defaultNotifications: NotificationRule[] = [
        {
          id: 'rule-01',
          code: 'SYNC_FAILURE',
          title: 'Error de Sincronización SQLite ↔ PostgreSQL',
          level: 'CRITICAL',
          enabled: true,
          notifyByEmail: true,
          notifyInApp: true,
          notifySMS: true,
          recipientRoles: ['SUPERADMIN'],
          description: 'Notifica si la cola de sincronización supera los 50 elementos sin respuesta.',
        },
        {
          id: 'rule-02',
          code: 'UNAUTHORIZED_VOID',
          title: 'Intento de Anulación de Ticket sin Permiso',
          level: 'WARNING',
          enabled: true,
          notifyByEmail: true,
          notifyInApp: true,
          notifySMS: false,
          recipientRoles: ['SUPERADMIN', 'MANAGER'],
          description: 'Notifica cuando un operario intenta anular un ticket cerrado sin PIN de encargado.',
        },
        {
          id: 'rule-03',
          code: 'PRINTER_OFFLINE',
          title: 'Impresora de Cocina o Bar Fuera de Línea',
          level: 'ERROR',
          enabled: true,
          notifyByEmail: false,
          notifyInApp: true,
          notifySMS: false,
          recipientRoles: ['SUPERADMIN', 'MANAGER'],
          description: 'Alerta sonora en TPV cuando falla el corte de papel o la conexión IP de comanda.',
        },
      ];
      this.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(defaultNotifications));
    }
  }

  // COMPANY
  public getCompanyConfig(): CompanyConfig {
    const raw = this.getItem(this.STORAGE_KEY_COMPANY);
    return raw ? JSON.parse(raw) : ({} as CompanyConfig);
  }

  public updateCompanyConfig(updated: Partial<CompanyConfig>, activeUser = 'Carlos Mendoza'): CompanyConfig {
    const current = this.getCompanyConfig();
    const before = { ...current };
    const next = { ...current, ...updated };
    this.setItem(this.STORAGE_KEY_COMPANY, JSON.stringify(next));
    this.recordAuditLog('UPDATE_COMPANY_CONFIG', 'ADMINISTRACION', 'CompanyConfig', next.id, before, next, activeUser);
    return next;
  }

  // TPV HARDWARE
  public getTPVHardwareConfig(): TPVHardwareConfig {
    const raw = this.getItem(this.STORAGE_KEY_HARDWARE);
    return raw ? JSON.parse(raw) : ({} as TPVHardwareConfig);
  }

  public updateTPVHardwareConfig(updated: Partial<TPVHardwareConfig>, activeUser = 'Carlos Mendoza'): TPVHardwareConfig {
    const current = this.getTPVHardwareConfig();
    const before = { ...current };
    const next = { ...current, ...updated };
    this.setItem(this.STORAGE_KEY_HARDWARE, JSON.stringify(next));
    this.recordAuditLog('UPDATE_TPV_HARDWARE', 'TPV_CONFIG', 'TPVHardwareConfig', 'hw-01', before, next, activeUser);
    return next;
  }

  public addPrinterDevice(printer: Omit<PrinterDevice, 'id'>, activeUser = 'Carlos Mendoza'): PrinterDevice {
    const config = this.getTPVHardwareConfig();
    const newPrinter: PrinterDevice = {
      ...printer,
      id: `prn-${Date.now()}`,
    };
    config.printers.push(newPrinter);
    this.updateTPVHardwareConfig({ printers: config.printers }, activeUser);
    return newPrinter;
  }

  public testPrinterDevice(printerId: string): { success: boolean; message: string; latencyMs: number } {
    const config = this.getTPVHardwareConfig();
    const printer = config.printers.find((p) => p.id === printerId);
    if (!printer) return { success: false, message: 'Impresora no encontrada', latencyMs: 0 };
    return {
      success: printer.status === 'ONLINE',
      message: printer.status === 'ONLINE' ? `Test de impresión ESC/POS OK en IP ${printer.ipAddress}` : `Fallo al conectar con ${printer.name}`,
      latencyMs: Math.floor(Math.random() * 25) + 10,
    };
  }

  // GENERAL SETTINGS
  public getGeneralSettings(): GeneralSettings {
    const raw = this.getItem(this.STORAGE_KEY_GENERAL);
    return raw ? JSON.parse(raw) : ({} as GeneralSettings);
  }

  public updateGeneralSettings(updated: Partial<GeneralSettings>, activeUser = 'Carlos Mendoza'): GeneralSettings {
    const current = this.getGeneralSettings();
    const before = { ...current };
    const next = { ...current, ...updated };
    this.setItem(this.STORAGE_KEY_GENERAL, JSON.stringify(next));
    this.recordAuditLog('UPDATE_GENERAL_SETTINGS', 'CONFIGURACION', 'GeneralSettings', 'gen-01', before, next, activeUser);
    return next;
  }

  // USERS & ROLES
  public getAdminUsers(): AdminUser[] {
    const raw = this.getItem(this.STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [];
  }

  public createAdminUser(user: Omit<AdminUser, 'id' | 'createdAt' | 'failedLoginAttempts' | 'isLocked'>, activeUser = 'Carlos Mendoza'): AdminUser {
    const users = this.getAdminUsers();
    const newUser: AdminUser = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      isLocked: false,
    };
    users.push(newUser);
    this.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
    this.recordAuditLog('CREATE_USER', 'SEGURIDAD', 'AdminUser', newUser.id, undefined, newUser, activeUser);
    return newUser;
  }

  public updateAdminUser(userId: string, data: Partial<AdminUser>, activeUser = 'Carlos Mendoza'): AdminUser {
    const users = this.getAdminUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Usuario no encontrado');
    const before = { ...users[idx] };
    const next = { ...users[idx], ...data };
    users[idx] = next;
    this.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
    this.recordAuditLog('UPDATE_USER', 'SEGURIDAD', 'AdminUser', userId, before, next, activeUser);
    return next;
  }

  public toggleUserLock(userId: string, activeUser = 'Carlos Mendoza'): AdminUser {
    const users = this.getAdminUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('Usuario no encontrado');
    return this.updateAdminUser(userId, { isLocked: !user.isLocked, failedLoginAttempts: 0 }, activeUser);
  }

  public getAdminRoles(): AdminRole[] {
    const raw = this.getItem(this.STORAGE_KEY_ROLES);
    return raw ? JSON.parse(raw) : [];
  }

  public createAdminRole(role: Omit<AdminRole, 'id'>, activeUser = 'Carlos Mendoza'): AdminRole {
    const roles = this.getAdminRoles();
    const newRole: AdminRole = {
      ...role,
      id: `role-${Date.now()}`,
    };
    roles.push(newRole);
    this.setItem(this.STORAGE_KEY_ROLES, JSON.stringify(roles));
    this.recordAuditLog('CREATE_ROLE', 'SEGURIDAD', 'AdminRole', newRole.id, undefined, newRole, activeUser);
    return newRole;
  }

  public getSecurityPolicy(): SecurityPolicy {
    const raw = this.getItem(this.STORAGE_KEY_POLICIES);
    return raw ? JSON.parse(raw) : ({} as SecurityPolicy);
  }

  public updateSecurityPolicy(updated: Partial<SecurityPolicy>, activeUser = 'Carlos Mendoza'): SecurityPolicy {
    const current = this.getSecurityPolicy();
    const before = { ...current };
    const next = { ...current, ...updated };
    this.setItem(this.STORAGE_KEY_POLICIES, JSON.stringify(next));
    this.recordAuditLog('UPDATE_SECURITY_POLICY', 'SEGURIDAD', 'SecurityPolicy', 'pol-01', before, next, activeUser);
    return next;
  }

  // AUDIT LOGS
  public getAuditLogs(filter?: { module?: string; action?: string; search?: string }): AuditLogEntry[] {
    const raw = this.getItem(this.STORAGE_KEY_AUDIT);
    let logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    if (!filter) return logs;
    if (filter.module) logs = logs.filter((l) => l.module === filter.module);
    if (filter.action) logs = logs.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    if (filter.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter((l) => l.userName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q));
    }
    return logs;
  }

  public recordAuditLog(action: string, module: string, entity: string, entityId: string, changesBefore?: any, changesAfter?: any, activeUser = 'Carlos Mendoza'): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-001',
      userName: activeUser,
      action,
      module,
      entity,
      entityId,
      changesBefore,
      changesAfter,
      ipAddress: '192.168.1.45',
      device: 'Chrome / Windows 11 Enterprise',
      integrityHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    };
    logs.unshift(newEntry);
    this.setItem(this.STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 500)));
    return newEntry;
  }

  // SYSTEM LOGS
  public getSystemLogs(filter?: { level?: LogLevel; category?: SystemLogCategory; search?: string }): SystemLogEntry[] {
    const raw = this.getItem(this.STORAGE_KEY_LOGS);
    let logs: SystemLogEntry[] = raw ? JSON.parse(raw) : [];
    if (!filter) return logs;
    if (filter.level) logs = logs.filter((l) => l.level === filter.level);
    if (filter.category) logs = logs.filter((l) => l.category === filter.category);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter((l) => l.message.toLowerCase().includes(q) || l.source.toLowerCase().includes(q));
    }
    return logs;
  }

  public logSystemEvent(level: LogLevel, category: SystemLogCategory, message: string, details?: string, source = 'BackofficeService'): SystemLogEntry {
    const logs = this.getSystemLogs();
    const newLog: SystemLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      source,
    };
    logs.unshift(newLog);
    this.setItem(this.STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 500)));
    return newLog;
  }

  // BACKUPS
  public getBackups(): BackupRecord[] {
    const raw = this.getItem(this.STORAGE_KEY_BACKUPS);
    return raw ? JSON.parse(raw) : [];
  }

  public createBackup(type: BackupType = 'MANUAL', activeUser = 'Carlos Mendoza'): BackupRecord {
    const backups = this.getBackups();
    const dateStr = new Date().toISOString().replace(/[-:]/g, '').substring(0, 15);
    const newBackup: BackupRecord = {
      id: `bak-${Date.now()}`,
      fileName: `SotiumPOS_${type}_Backup_${dateStr}.enc`,
      fileSizeMb: Number((140 + Math.random() * 15).toFixed(1)),
      type,
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
      checksumMd5: Math.random().toString(16).substring(2, 34),
      storageLocation: 'HYBRID',
      encrypted: true,
    };
    backups.unshift(newBackup);
    this.setItem(this.STORAGE_KEY_BACKUPS, JSON.stringify(backups));
    this.recordAuditLog('CREATE_BACKUP', 'SISTEMA', 'BackupRecord', newBackup.id, undefined, newBackup, activeUser);
    this.logSystemEvent('INFO', 'SYSTEM', `Copia de seguridad ${type} creada correctamente (${newBackup.fileName})`);
    return newBackup;
  }

  public restoreBackup(backupId: string, activeUser = 'Carlos Mendoza'): { success: boolean; message: string } {
    const backups = this.getBackups();
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) return { success: false, message: 'Copia no encontrada' };
    this.recordAuditLog('RESTORE_BACKUP', 'SISTEMA', 'BackupRecord', backupId, undefined, { restoredFrom: backup.fileName }, activeUser);
    this.logSystemEvent('WARNING', 'SYSTEM', `Restauración de base de datos efectuada desde ${backup.fileName}`);
    return { success: true, message: `Restauración verificada con éxito desde ${backup.fileName}` };
  }

  public getBackupScheduleConfig(): BackupScheduleConfig {
    const raw = this.getItem(this.STORAGE_KEY_BACKUP_SCHEDULE);
    return raw ? JSON.parse(raw) : ({} as BackupScheduleConfig);
  }

  public updateBackupScheduleConfig(updated: Partial<BackupScheduleConfig>, activeUser = 'Carlos Mendoza'): BackupScheduleConfig {
    const current = this.getBackupScheduleConfig();
    const next = { ...current, ...updated };
    this.setItem(this.STORAGE_KEY_BACKUP_SCHEDULE, JSON.stringify(next));
    this.recordAuditLog('UPDATE_BACKUP_SCHEDULE', 'SISTEMA', 'BackupScheduleConfig', 'sched-01', current, next, activeUser);
    return next;
  }

  // SYNC
  public getSyncOverview(): SyncOverview {
    const raw = this.getItem(this.STORAGE_KEY_SYNC);
    return raw ? JSON.parse(raw) : ({} as SyncOverview);
  }

  public forceSyncTrigger(activeUser = 'Carlos Mendoza'): SyncOverview {
    const overview = this.getSyncOverview();
    overview.overallStatus = 'ONLINE_SYNCED';
    overview.pendingQueueCount = 0;
    overview.lastSuccessfulSyncAt = new Date().toISOString();
    overview.latencyMs = Math.floor(Math.random() * 15) + 8;
    overview.items.forEach((item) => {
      item.status = 'SYNCED';
    });
    this.setItem(this.STORAGE_KEY_SYNC, JSON.stringify(overview));
    this.recordAuditLog('FORCE_SYNC_TRIGGER', 'SINCRONIZACION', 'SyncOverview', 'sync-01', undefined, { status: 'OK' }, activeUser);
    this.logSystemEvent('INFO', 'POSTGRES', 'Sincronización forzada completada sin discrepancias');
    return overview;
  }

  // LICENSE
  public getLicenseInfo(): LicenseInfo {
    const raw = this.getItem(this.STORAGE_KEY_LICENSE);
    return raw ? JSON.parse(raw) : ({} as LicenseInfo);
  }

  public activateLicense(licenseKey: string, activeUser = 'Carlos Mendoza'): { success: boolean; license: LicenseInfo; message: string } {
    const current = this.getLicenseInfo();
    if (licenseKey.trim().length < 15) {
      return { success: false, license: current, message: 'Formato de clave de licencia no válido (requiere XXX-XXX...)' };
    }
    const updated: LicenseInfo = {
      ...current,
      licenseKey: licenseKey.trim().toUpperCase(),
      activationDate: new Date().toISOString(),
      daysRemaining: 730,
      type: 'ENTERPRISE_ULTIMATE',
    };
    this.setItem(this.STORAGE_KEY_LICENSE, JSON.stringify(updated));
    this.recordAuditLog('ACTIVATE_LICENSE', 'LICENCIAMIENTO', 'LicenseInfo', 'lic-01', current, updated, activeUser);
    return { success: true, license: updated, message: 'Licencia Enterprise Ultimate activada correctamente por 2 años.' };
  }

  // NOTIFICATION RULES
  public getNotificationRules(): NotificationRule[] {
    const raw = this.getItem(this.STORAGE_KEY_NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public updateNotificationRule(ruleId: string, data: Partial<NotificationRule>, activeUser = 'Carlos Mendoza'): NotificationRule {
    const rules = this.getNotificationRules();
    const idx = rules.findIndex((r) => r.id === ruleId);
    if (idx === -1) throw new Error('Regla no encontrada');
    const before = { ...rules[idx] };
    const next = { ...rules[idx], ...data };
    rules[idx] = next;
    localStorage.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(rules));
    this.recordAuditLog('UPDATE_NOTIFICATION_RULE', 'ALERTAS', 'NotificationRule', ruleId, before, next, activeUser);
    return next;
  }

  // EXPORT / IMPORT
  public exportAllSettings(): string {
    const exportData = {
      company: this.getCompanyConfig(),
      hardware: this.getTPVHardwareConfig(),
      general: this.getGeneralSettings(),
      users: this.getAdminUsers(),
      roles: this.getAdminRoles(),
      policies: this.getSecurityPolicy(),
      backupSchedule: this.getBackupScheduleConfig(),
      license: this.getLicenseInfo(),
      notificationRules: this.getNotificationRules(),
      exportedAt: new Date().toISOString(),
      systemVersion: 'Sotium POS Enterprise v12.4',
    };
    return JSON.stringify(exportData, null, 2);
  }

  public importAllSettings(jsonContent: string, activeUser = 'Carlos Mendoza'): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonContent);
      if (data.company) this.setItem(this.STORAGE_KEY_COMPANY, JSON.stringify(data.company));
      if (data.hardware) this.setItem(this.STORAGE_KEY_HARDWARE, JSON.stringify(data.hardware));
      if (data.general) this.setItem(this.STORAGE_KEY_GENERAL, JSON.stringify(data.general));
      if (data.users) this.setItem(this.STORAGE_KEY_USERS, JSON.stringify(data.users));
      if (data.roles) this.setItem(this.STORAGE_KEY_ROLES, JSON.stringify(data.roles));
      if (data.policies) this.setItem(this.STORAGE_KEY_POLICIES, JSON.stringify(data.policies));
      if (data.notificationRules) this.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(data.notificationRules));
      this.recordAuditLog('IMPORT_SETTINGS_BULK', 'ADMINISTRACION', 'SystemConfig', 'bulk-01', undefined, { keys: Object.keys(data) }, activeUser);
      return { success: true, message: 'Configuraciones globales importadas con éxito.' };
    } catch (err: any) {
      return { success: false, message: `Error importando archivo JSON: ${err.message}` };
    }
  }
}

export const backofficeService = new BackofficeService();
