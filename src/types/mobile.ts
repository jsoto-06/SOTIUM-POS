export type MobileAppType = 'WAITER' | 'KITCHEN' | 'DELIVERY' | 'EXECUTIVE';

export type MobileDeviceMode = 'MOBILE' | 'TABLET';

export type MobileTheme = 'DARK' | 'LIGHT';

export type PushNotificationType =
  | 'RESERVATION'
  | 'ORDER'
  | 'INCIDENT'
  | 'STOCK_CRITICAL'
  | 'HIGH_SALE'
  | 'VIP_CUSTOMER'
  | 'TECH_INCIDENT';

export interface PushNotification {
  id: string;
  type: PushNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  payload?: Record<string, any>;
}

export interface MobileWaiterState {
  selectedRoomId: string;
  selectedTableId?: string;
  activeTicketId?: string;
  isTabletView: boolean;
  isDarkMode: boolean;
  notes: string;
}

export interface DeliveryDriverTask {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  amount: number;
  status: 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'INCIDENT';
  signature?: string;
  photoUrl?: string;
  incidentReason?: string;
  assignedAt: string;
  deliveredAt?: string;
}

export interface ExecutiveKPI {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  category: 'SALES' | 'FINANCE' | 'HR' | 'CRM' | 'RESERVATIONS' | 'DELIVERY' | 'INVENTORY';
}

export interface AIExecutiveRecommendation {
  id: string;
  topic: string;
  recommendation: string;
  explanation: string;
  confidence: number;
  category: 'SALES_PREDICTION' | 'STOCK_OUT_RISK' | 'STAFFING' | 'PROFIT_OPTIMIZATION';
  actionableStep: string;
}

export interface MobileGlobalSearchResult {
  id: string;
  category: 'TABLE' | 'CUSTOMER' | 'PRODUCT' | 'ORDER' | 'RESERVATION' | 'DELIVERY' | 'EMPLOYEE';
  title: string;
  subtitle: string;
  badge?: string;
}
