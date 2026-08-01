import { Reservation, WaitingListItem } from '../types/reservation';
import { logAuditEvent } from './auditService';
import { logger } from './loggerService';

export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH';
export type NotificationType =
  | 'CONFIRMATION'
  | 'REMINDER'
  | 'CHECKIN_LINK'
  | 'NO_SHOW_ALERT'
  | 'WAITING_LIST_READY'
  | 'CANCELLED_NOTICE';

export interface NotificationLog {
  id: string;
  reservationId?: string;
  waitingListId?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  channel: NotificationChannel;
  type: NotificationType;
  message: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt: string;
  trackingCode: string;
}

const notificationLogs: NotificationLog[] = [];

export function sendOmnichannelNotification(options: {
  reservation?: Reservation;
  waitingItem?: WaitingListItem;
  type: NotificationType;
  channel?: NotificationChannel;
  customMessage?: string;
}): NotificationLog {
  const channel = options.channel || 'WHATSAPP';
  const recipientName = options.reservation?.customerName || options.waitingItem?.customerName || 'Cliente';
  const recipientPhone = options.reservation?.phone || options.waitingItem?.phone || '600000000';
  const recipientEmail = options.reservation?.email || options.waitingItem?.email;

  let message = options.customMessage || '';

  if (!message) {
    if (options.reservation) {
      const res = options.reservation;
      switch (options.type) {
        case 'CONFIRMATION':
          message = `Hola ${res.customerName}, tu reserva ${res.code} para ${res.pax} pax el ${res.date} a las ${res.time}h en ${res.salonName} (${res.tableName}) está CONFIRMADA. ¡Te esperamos!`;
          break;
        case 'REMINDER':
          message = `Recordatorio: ${res.customerName}, te recordamos tu reserva ${res.code} de hoy a las ${res.time}h para ${res.pax} personas. Responde 1 para confirmar o 2 para cancelar.`;
          break;
        case 'CHECKIN_LINK':
          message = `Bienvenido a Sotium POS. Haz check-in online para tu mesa ${res.tableName}: https://sotium.app/res/checkin/${res.code}`;
          break;
        case 'NO_SHOW_ALERT':
          message = `Estimado ${res.customerName}, no se ha registrado tu llegada a la reserva ${res.code} de las ${res.time}h. Ponte en contacto con nosotros si deseas reprogramar.`;
          break;
        case 'CANCELLED_NOTICE':
          message = `Tu reserva ${res.code} para el ${res.date} a las ${res.time}h ha sido CANCELADA. Esperamos verte pronto.`;
          break;
        default:
          message = `Notificación de reserva ${res.code}`;
      }
    } else if (options.waitingItem) {
      const w = options.waitingItem;
      if (options.type === 'WAITING_LIST_READY') {
        message = `¡Buenas noticias ${w.customerName}! Tu mesa para ${w.pax} personas está LISTA. Dirígete a la recepción en los próximos 10 minutos.`;
      } else {
        message = `Lista de espera Sotium POS: ${w.customerName}, tu posición actual es #${w.position}. Tiempo est.: ${w.estimatedWaitMinutes} min.`;
      }
    }
  }

  const log: NotificationLog = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    reservationId: options.reservation?.id,
    waitingListId: options.waitingItem?.id,
    recipientName,
    recipientPhone,
    recipientEmail,
    channel,
    type: options.type,
    message,
    status: 'SENT',
    sentAt: new Date().toISOString(),
    trackingCode: `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  };

  notificationLogs.unshift(log);

  logger.info(`[NOTIFICATION] [${channel}] sent to ${recipientPhone} (${recipientName}): ${message}`);

  logAuditEvent(
    'NOTIFICATION_DISPATCH',
    'Sistema Notificaciones Omnicanal',
    `Envío ${channel} [${options.type}] a ${recipientName} (${recipientPhone}) - Tracking: ${log.trackingCode}`
  );

  return log;
}

export function getNotificationLogs(): NotificationLog[] {
  return [...notificationLogs];
}
