import { AuditService } from './auditService';
import { logger } from './loggerService';
import { SyncService } from './syncService';
import {
  PushNotification,
  PushNotificationType,
  DeliveryDriverTask,
  ExecutiveKPI,
  MobileGlobalSearchResult,
} from '../types/mobile';

export class MobileService {
  private static STORAGE_KEY_NOTIFICATIONS = 'hostelerp_mobile_notifications_v1';
  private static STORAGE_KEY_DELIVERY_TASKS = 'hostelerp_mobile_delivery_tasks_v1';
  private static STORAGE_KEY_OFFLINE_QUEUE = 'hostelerp_mobile_offline_queue_v1';
  private static memoryStore = new Map<string, string>();

  private static getItem<T>(key: string, fallback: T): T {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      } else {
        const data = this.memoryStore.get(key);
        return data ? JSON.parse(data) : fallback;
      }
    } catch {
      return fallback;
    }
  }

  private static setItem<T>(key: string, val: T): void {
    try {
      const jsonStr = JSON.stringify(val);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, jsonStr);
      } else {
        this.memoryStore.set(key, jsonStr);
      }
    } catch (e) {
      logger.error(`[MobileService] LocalStorage set error: ${key}`, e);
    }
  }

  static clearMemoryStore(): void {
    this.memoryStore.clear();
  }

  // --- PUSH NOTIFICATIONS ENGINE ---

  static getPushNotifications(): PushNotification[] {
    const defaultNotifs: PushNotification[] = [
      {
        id: 'NOTIF-001',
        type: 'RESERVATION',
        title: 'Nueva Reserva VIP',
        message: 'Reserva para 6 personas en Terraza Principal a las 21:30 (Cliente habitual VIP - Juan Pérez).',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        priority: 'HIGH',
        payload: { reservationId: 'RES-901', customerName: 'Juan Pérez' },
      },
      {
        id: 'NOTIF-002',
        type: 'STOCK_CRITICAL',
        title: 'Alerta de Stock Crítico',
        message: 'Solomillo de Buey Premium por debajo del stock mínimo (Quedan 3 kg).',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: false,
        priority: 'CRITICAL',
        payload: { itemId: 'ITEM-88', currentStock: 3 },
      },
      {
        id: 'NOTIF-003',
        type: 'HIGH_SALE',
        title: 'Venta Importante TPV',
        message: 'Ticket #4092 cobrado por 850,00 € en Mesa 12 Salón Principal.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: true,
        priority: 'MEDIUM',
        payload: { ticketId: 'TKT-4092', amount: 850 },
      },
      {
        id: 'NOTIF-004',
        type: 'INCIDENT',
        title: 'Retraso de Reparto Delivery',
        message: 'El pedido #DEL-104 supera los 35 minutos de espera. Conductor: Carlos M.',
        timestamp: new Date(Date.now() - 2500000).toISOString(),
        read: false,
        priority: 'HIGH',
        payload: { deliveryId: 'DEL-104' },
      },
      {
        id: 'NOTIF-005',
        type: 'TECH_INCIDENT',
        title: 'Impresora de Cocina Desconectada',
        message: 'Impresora KDS-02 de Pescados perdió la conexión de red local (IP: 192.168.1.120).',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        priority: 'CRITICAL',
        payload: { printerIp: '192.168.1.120' },
      },
    ];

    return this.getItem<PushNotification[]>(this.STORAGE_KEY_NOTIFICATIONS, defaultNotifs);
  }

  static sendPushNotification(
    type: PushNotificationType,
    title: string,
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
    payload?: Record<string, any>,
    username: string = 'SISTEMA'
  ): PushNotification {
    const notifs = this.getPushNotifications();
    const newNotif: PushNotification = {
      id: `NOTIF-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
      payload,
    };

    notifs.unshift(newNotif);
    this.setItem(this.STORAGE_KEY_NOTIFICATIONS, notifs);

    AuditService.log({
      action: 'PUSH_NOTIFICATION_SENT',
      username,
      resource: 'MobileEngine',
      details: `Notificación enviada: [${type}] ${title} (${priority})`,
    });

    return newNotif;
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getPushNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.setItem(this.STORAGE_KEY_NOTIFICATIONS, updated);
  }

  static clearNotifications(): void {
    this.setItem(this.STORAGE_KEY_NOTIFICATIONS, []);
  }

  // --- DELIVERY DRIVER OPERATIONS ---

  static getDeliveryTasks(): DeliveryDriverTask[] {
    const defaultTasks: DeliveryDriverTask[] = [
      {
        id: 'DEL-101',
        orderId: 'ORD-8821',
        customerName: 'Laura Gómez',
        phone: '+34 612 345 678',
        address: 'Calle Gran Vía 42, 3ºB, Madrid',
        lat: 40.4202,
        lng: -3.7058,
        amount: 48.5,
        status: 'ASSIGNED',
        assignedAt: new Date(Date.now() - 1200000).toISOString(),
      },
      {
        id: 'DEL-102',
        orderId: 'ORD-8822',
        customerName: 'Manuel Fernández',
        phone: '+34 688 990 112',
        address: 'Paseo de la Castellana 110, Madrid',
        lat: 40.4431,
        lng: -3.6912,
        amount: 62.0,
        status: 'IN_TRANSIT',
        assignedAt: new Date(Date.now() - 2400000).toISOString(),
      },
      {
        id: 'DEL-103',
        orderId: 'ORD-8819',
        customerName: 'Elena Martínez',
        phone: '+34 655 443 221',
        address: 'Calle Serrano 15, 1ºA, Madrid',
        lat: 40.4255,
        lng: -3.6881,
        amount: 35.8,
        status: 'DELIVERED',
        assignedAt: new Date(Date.now() - 4000000).toISOString(),
        deliveredAt: new Date(Date.now() - 1000000).toISOString(),
      },
    ];

    return this.getItem<DeliveryDriverTask[]>(this.STORAGE_KEY_DELIVERY_TASKS, defaultTasks);
  }

  static updateDeliveryStatus(
    taskId: string,
    status: 'IN_TRANSIT' | 'DELIVERED' | 'INCIDENT',
    extra?: { signature?: string; photoUrl?: string; incidentReason?: string },
    username: string = 'Repartidor'
  ): DeliveryDriverTask {
    const tasks = this.getDeliveryTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      throw new Error('Tarea de reparto no encontrada');
    }

    const updated: DeliveryDriverTask = {
      ...tasks[idx],
      status,
      ...(extra?.signature && { signature: extra.signature }),
      ...(extra?.photoUrl && { photoUrl: extra.photoUrl }),
      ...(extra?.incidentReason && { incidentReason: extra.incidentReason }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date().toISOString() }),
    };

    tasks[idx] = updated;
    this.setItem(this.STORAGE_KEY_DELIVERY_TASKS, tasks);

    SyncService.queueOfflineChange({
      entityName: 'DeliveryDriverTask',
      entityId: taskId,
      action: 'UPDATE',
      payload: updated,
      version: Date.now(),
    });

    AuditService.log({
      action: 'DELIVERY_STATUS_UPDATE',
      username,
      resource: 'MobileDelivery',
      details: `Pedido #${updated.orderId} actualizado a ${status}`,
    });

    return updated;
  }

  // --- EXECUTIVE KPIS & BI ---

  static getExecutiveKPIs(): ExecutiveKPI[] {
    return [
      { id: 'KPI-1', title: 'Ventas del Día', value: '14.850,00 €', change: '+18.4%', isPositive: true, category: 'SALES' },
      { id: 'KPI-2', title: 'Margen Bruto BI', value: '68.2%', change: '+3.1%', isPositive: true, category: 'FINANCE' },
      { id: 'KPI-3', title: 'Ticket Medio TPV', value: '42,50 €', change: '+2.80 €', isPositive: true, category: 'SALES' },
      { id: 'KPI-4', title: 'Productividad RRHH', value: '145,20 €/h', change: '+5.2%', isPositive: true, category: 'HR' },
      { id: 'KPI-5', title: 'Reservas Confirmadas', value: '128 personas', change: '+12%', isPositive: true, category: 'RESERVATIONS' },
      { id: 'KPI-6', title: 'Tiempo Medio Delivery', value: '24 min', change: '-4 min', isPositive: true, category: 'DELIVERY' },
      { id: 'KPI-7', title: 'Rotación Inventario', value: '4.2x / mes', change: 'Óptimo', isPositive: true, category: 'INVENTORY' },
      { id: 'KPI-8', title: 'Satisfacción CRM', value: '4.8 / 5.0', change: '+0.2', isPositive: true, category: 'CRM' },
    ];
  }

  // --- GLOBAL SEARCH ENGINE ---

  static searchGlobal(query: string): MobileGlobalSearchResult[] {
    if (!query || query.trim().length < 2) return [];

    const q = query.toLowerCase().trim();
    const allResults: MobileGlobalSearchResult[] = [
      { id: 'M-12', category: 'TABLE', title: 'Mesa 12', subtitle: 'Salón Principal • 4 Pax • Ocupada', badge: 'Activa' },
      { id: 'M-15', category: 'TABLE', title: 'Mesa 15 (Terraza)', subtitle: 'Terraza Ext. • 6 Pax • Libre', badge: 'Disponible' },
      { id: 'C-801', category: 'CUSTOMER', title: 'Juan Pérez (VIP)', subtitle: '+34 600 112 233 • 45 visitas • Descuento 10%', badge: 'VIP' },
      { id: 'C-802', category: 'CUSTOMER', title: 'Empresa Gastro S.L.', subtitle: 'Facturación Empresa • NIF: B88223344', badge: 'Corporativo' },
      { id: 'P-101', category: 'PRODUCT', title: 'Entrecot de Buey Azafrán', subtitle: 'P.V.P.: 26,50 € • Alérgenos: Ninguno', badge: 'Cocina' },
      { id: 'P-102', category: 'PRODUCT', title: 'Vino Tinto Ribera Reserva', subtitle: 'P.V.P.: 32,00 € • C bodega: 18 ud', badge: 'Barra' },
      { id: 'O-4091', category: 'ORDER', title: 'Ticket #4091', subtitle: 'Mesa 8 • Impuesto: 10% • Total: 124,50 €', badge: 'Pendiente' },
      { id: 'R-901', category: 'RESERVATION', title: 'Reserva #901 - Familia Ruiz', subtitle: 'Hoy 21:00h • 8 Pax • Zona Vip', badge: 'Confirmada' },
      { id: 'D-102', category: 'DELIVERY', title: 'Reparto #DEL-102', subtitle: 'Manuel Fdez • En Tránsito • 62,00 €', badge: 'Repartidor 1' },
      { id: 'E-501', category: 'EMPLOYEE', title: 'Carlos Camarero Principal', subtitle: 'Camarero Senior • Turno Noche', badge: 'En Turno' },
    ];

    return allResults.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.badge && r.badge.toLowerCase().includes(q))
    );
  }

  // --- IMPORT & EXPORT ENGINE ---

  static exportMobileReport(): string {
    const notifs = this.getPushNotifications();
    const tasks = this.getDeliveryTasks();
    const kpis = this.getExecutiveKPIs();

    const payload = {
      exportedAt: new Date().toISOString(),
      system: 'Sotium POS Enterprise Mobile Suite v12.4',
      notificationsCount: notifs.length,
      notifications: notifs,
      deliveryTasksCount: tasks.length,
      deliveryTasks: tasks,
      executiveKPIs: kpis,
    };

    AuditService.log({
      action: 'MOBILE_EXPORT_DATA',
      username: 'Director Móvil',
      resource: 'MobileService',
      details: 'Informe de auditoría y métricas de app móvil exportado en JSON',
    });

    return JSON.stringify(payload, null, 2);
  }

  static importMobileConfig(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.notifications && Array.isArray(parsed.notifications)) {
        this.setItem(this.STORAGE_KEY_NOTIFICATIONS, parsed.notifications);
      }
      if (parsed.deliveryTasks && Array.isArray(parsed.deliveryTasks)) {
        this.setItem(this.STORAGE_KEY_DELIVERY_TASKS, parsed.deliveryTasks);
      }

      AuditService.log({
        action: 'MOBILE_IMPORT_DATA',
        username: 'Admin Móvil',
        resource: 'MobileService',
        details: 'Configuración móvil y tareas importadas desde JSON',
      });

      return { success: true, message: 'Configuración importada correctamente.' };
    } catch (err: any) {
      return { success: false, message: `Error importando JSON: ${err.message}` };
    }
  }
}
