export type DeliveryChannel =
  | 'LOCAL'
  | 'MESA'
  | 'BARRA'
  | 'TAKE_AWAY'
  | 'CLICK_COLLECT'
  | 'DELIVERY_PROPIO'
  | 'GLOVO'
  | 'UBER_EATS'
  | 'JUST_EAT'
  | 'DELIVEROO'
  | 'WEB_PROPIA'
  | 'APP_PROPIA'
  | 'WHATSAPP'
  | 'TELEFONO'
  | 'QR_CODE';

export type DeliveryOrderStatus =
  | 'NUEVO'
  | 'ACEPTADO'
  | 'PREPARANDO'
  | 'EN_COCINA'
  | 'LISTO'
  | 'ESPERANDO_REPARTIDOR'
  | 'EN_REPARTO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'INCIDENCIA';

export type DeliveryPaymentMethod =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'BIZUM'
  | 'ONLINE'
  | 'STRIPE'
  | 'REDSYS'
  | 'PAYPAL'
  | 'GIFT_CARD'
  | 'MONEDERO'
  | 'MEZCLADO';

export type DriverStatus = 'DISPONIBLE' | 'OCUPADO' | 'DESCANSO' | 'FIN_TURNO' | 'EN_RUTA';

export type VehicleType = 'MOTO' | 'BICICLETA' | 'COCHE' | 'PATINETE' | 'A_PIE';

export interface DriverGPSLocation {
  latitude: number;
  longitude: number;
  speedKmH?: number;
  headingDegrees?: number;
  lastUpdated: string;
}

export interface DriverHistoryItem {
  orderId: string;
  deliveredAt: string;
  deliveryTimeMinutes: number;
  rating?: number;
  distanceKm: number;
}

export interface Driver {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  vehicle: VehicleType;
  vehiclePlate?: string;
  status: DriverStatus;
  location: DriverGPSLocation;
  currentOrderId?: string;
  totalDeliveriesLifetime: number;
  avgDeliveryTimeMinutes: number;
  rating: number; // 1-5
  isActive: boolean;
  shiftStartedAt?: string;
  history: DriverHistoryItem[];
}

export interface DeliveryOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface DeliveryOrderCustomer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeliveryOrder {
  id: string;
  orderCode: string; // Ej: DEL-2026-001
  channel: DeliveryChannel;
  externalPlatformOrderId?: string;
  status: DeliveryOrderStatus;
  paymentMethod: DeliveryPaymentMethod;
  isPaid: boolean;
  customer: DeliveryOrderCustomer;
  items: DeliveryOrderItem[];
  subtotal: number;
  deliveryFee: number;
  tipAmount: number;
  total: number;
  driverId?: string;
  driverName?: string;
  estimatedPrepMinutes: number;
  estimatedDeliveryMinutes: number;
  etaTimestamp: string;
  createdAt: string;
  acceptedAt?: string;
  inKitchenAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  incidentNotes?: string;
  routeId?: string;
  verifactuCode?: string;
}

export interface DeliveryRouteWaypoint {
  orderId: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  estimatedArrivalAt: string;
  isDelivered: boolean;
}

export interface DeliveryRoute {
  id: string;
  routeCode: string;
  driverId: string;
  driverName: string;
  vehicle: VehicleType;
  status: 'ASIGNADA' | 'EN_MARCHA' | 'COMPLETADA';
  waypoints: DeliveryRouteWaypoint[];
  totalDistanceKm: number;
  estimatedTotalMinutes: number;
  aiOptimized: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface OmnichannelConnector {
  id: string;
  name: string; // Glovo, Uber Eats, Just Eat, Deliveroo, Web Direct, WhatsApp Bot
  type: 'GLOVO' | 'UBER_EATS' | 'JUST_EAT' | 'DELIVEROO' | 'WEB_DIRECT' | 'WHATSAPP_BOT';
  status: 'CONECTADO' | 'DESCONECTADO' | 'PAUSADO' | 'ERROR';
  webhookUrl: string;
  apiKeyConfigured: boolean;
  lastSyncTimestamp: string;
  ordersTodayCount: number;
  salesTodayTotal: number;
  autoAcceptOrders: boolean;
}

export interface DeliveryNotification {
  id: string;
  orderId: string;
  channel: 'SMS' | 'WHATSAPP' | 'PUSH' | 'EMAIL';
  recipient: string;
  message: string;
  status: 'ENVIADO' | 'ENTREGADO' | 'FALLIDO';
  sentAt: string;
}

export interface DeliveryAIPrediction {
  orderId: string;
  orderCode: string;
  predictedDelayMinutes: number;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  suggestedDriverId?: string;
  suggestedDriverName?: string;
  aiExplanation: string;
  routeGroupingSuggestion?: string;
}

export interface DeliveryAnalytics {
  totalOrders: number;
  totalRevenue: number;
  avgPreparationTimeMinutes: number;
  avgDeliveryTimeMinutes: number;
  avgTotalCycleMinutes: number;
  cancellationRatePercent: number;
  incidentCount: number;
  salesByChannel: Record<DeliveryChannel, { count: number; total: number }>;
  salesByPaymentMethod: Record<DeliveryPaymentMethod, { count: number; total: number }>;
  driverRankings: {
    driverId: string;
    driverName: string;
    totalDeliveries: number;
    avgMinutes: number;
    rating: number;
  }[];
  peakDeliveryHours: { hour: string; orderCount: number }[];
}
