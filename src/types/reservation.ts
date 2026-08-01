export type { Salon, Table } from './pos';

export type ReservationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'RECORDADA'
  | 'CHECK_IN'
  | 'SENTADOS'
  | 'EN_SERVICIO'
  | 'FINALIZADA'
  | 'NO_SHOW'
  | 'CANCELADA';

export type ReservationChannel =
  | 'WEB'
  | 'TELEFONO'
  | 'ONLINE'
  | 'QR'
  | 'CRM'
  | 'TPV'
  | 'WALK_IN'
  | 'RAPIDA';

export type ReservationLanguage = 'ES' | 'EN' | 'FR' | 'DE' | 'IT' | 'CAT' | 'EUS' | 'GAL';

export type ReservationEventType =
  | 'NINGUNO'
  | 'CUMPLEAÑOS'
  | 'EMPRESA'
  | 'COMUNION'
  | 'BODA'
  | 'GRUPO'
  | 'BANQUETE'
  | 'PRIVADO';

export interface Reservation {
  id: string; // UUID
  code: string; // e.g. "RES-2026-001"
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  pax: number;
  kids?: number;
  babies?: number;
  pets?: boolean;
  highChairs?: number;
  boosterSeats?: number;
  allergies?: string[];
  notes?: string;
  language?: ReservationLanguage;
  channel: ReservationChannel;
  status: ReservationStatus;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number; // e.g. 90
  tableId: string;
  tableName: string;
  salonId: string;
  salonName: string;
  serverId?: string;
  serverName?: string;
  eventType?: ReservationEventType;
  depositAmount?: number;
  depositPaid?: boolean;
  // Waiting list linkage
  waitingListPosition?: number;
  estimatedWaitTimeMinutes?: number;
  // No show & AI
  noShowRecorded?: boolean;
  noShowPenalty?: number;
  noShowProbability?: number; // 0 - 100 (%)
  aiTableRecommendationReason?: string;
  // Timestamps
  checkInTime?: string;
  seatedTime?: string;
  completedTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WaitingListItem {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email?: string;
  pax: number;
  kids?: number;
  highChairs?: number;
  salonId?: string;
  salonName?: string;
  preferredArea?: string;
  notes?: string;
  joinedAt: string;
  estimatedWaitMinutes: number;
  position: number;
  notifiedAt?: string;
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'CANCELLED';
  allergies?: string[];
}

export interface ReservationAnalytics {
  totalReservations: number;
  confirmedCount: number;
  seatedCount: number;
  completedCount: number;
  noShowCount: number;
  cancelledCount: number;
  noShowRate: number; // percentage
  cancellationRate: number; // percentage
  occupancyRate: number; // percentage
  averageEstanciaMinutes: number;
  mostProfitableTable: { tableName: string; totalRevenue: number; count: number };
  mostProfitableSalon: { salonName: string; totalRevenue: number; count: number };
  topCustomer: { customerName: string; count: number; totalSpent: number };
  byHour: { hour: string; count: number; pax: number }[];
  byChannel: { channel: string; count: number }[];
  byEventType: { eventType: string; count: number }[];
}

export interface ReservationFilter {
  searchQuery?: string;
  date?: string;
  salonId?: string;
  status?: ReservationStatus | 'ALL';
  channel?: ReservationChannel | 'ALL';
  eventType?: ReservationEventType | 'ALL';
}

export interface AINoShowPrediction {
  reservationId: string;
  riskScorePercent: number; // 0-100
  riskCategory: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  reasons: string[];
  recommendedAction: string;
}

export interface AITableRecommendation {
  tableId: string;
  tableName: string;
  salonId: string;
  salonName: string;
  suitabilityScore: number; // 0 - 100
  reasons: string[];
}

export interface AIOccupancyForecast {
  date: string;
  peakHours: string[];
  expectedTotalPax: number;
  suggestedOverbookingPercentage: number; // e.g. 10%
  recommendedStaffing: { role: string; recommendedCount: number }[];
  insights: string[];
}
