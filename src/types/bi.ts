export type BIDateRange = 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export interface BIFilters {
  dateRange: BIDateRange;
  startDate?: string;
  endDate?: string;
  salonId?: string;
  tableId?: string;
  employeeId?: string;
  customerId?: string;
  productId?: string;
  categoryId?: string;
  supplierId?: string;
  channelId?: string;
}

export interface BIKPICard {
  id: string;
  title: string;
  value: string | number;
  formattedValue: string;
  previousValue?: string | number;
  changePercent?: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  unit?: string;
  color: 'amber' | 'emerald' | 'cyan' | 'purple' | 'red' | 'blue';
  icon: string;
  subtitle?: string;
}

export interface BIExecutiveMetrics {
  totalSales: number;
  previousSales: number;
  salesGrowthPercent: number;
  totalProfit: number;
  profitMarginPercent: number;
  totalVat: number;
  averageTicket: number;
  totalTickets: number;
  totalCustomers: number;
  totalReservations: number;
  totalDelivery: number;
  totalTakeAway: number;
  salonOccupancyPercent: number;
  avgServiceTimeMinutes: number;
  avgKitchenTimeMinutes: number;
  activeAlertsCount: number;
  kpis: BIKPICard[];
  alerts: { id: string; type: 'WARNING' | 'CRITICAL' | 'INFO'; title: string; message: string; timestamp: string }[];
}

export interface BISalesPoint {
  period: string;
  timestamp: string;
  sales: number;
  tickets: number;
  profit: number;
  vat: number;
  avgTicket: number;
}

export interface BISalesComparison {
  dimension: string;
  currentSales: number;
  previousSales: number;
  difference: number;
  percentChange: number;
}

export interface BIProductMetric {
  productId: string;
  productName: string;
  categoryName: string;
  categoryId: string;
  unitsSold: number;
  totalSales: number;
  costPrice: number;
  totalProfit: number;
  marginPercent: number;
  growthPercent: number;
  classification: 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
}

export interface BICustomerMetric {
  customerId: string;
  customerName: string;
  email?: string;
  phone?: string;
  totalSpent: number;
  ticketCount: number;
  avgTicket: number;
  lastVisitDate: string;
  loyaltyPoints: number;
  segment: 'VIP' | 'NUEVO' | 'RECUPERADO' | 'EN_RIESGO' | 'HABITUAL';
}

export interface BIWaiterMetric {
  employeeId: string;
  employeeName: string;
  photoUrl?: string;
  role: string;
  totalSales: number;
  ticketsProcessed: number;
  avgTicket: number;
  avgServiceTimeMinutes: number;
  totalDiscounts: number;
  totalVoids: number;
  totalInvitations: number;
  rating: number;
  productivityScore: number;
}

export interface BIKitchenMetric {
  stationId: string;
  stationName: string;
  avgPrepMinutes: number;
  delayedOrdersCount: number;
  totalPrepared: number;
  slowestDishes: { productName: string; avgMinutes: number; count: number }[];
}

export interface BIInventoryMetric {
  rotationRate: number;
  totalValuation: number;
  expiredItemsCount: number;
  wasteCost: number;
  totalConsumed: number;
  avgUnitCost: number;
  lowStockItemsCount: number;
}

export interface BIDeliveryMetric {
  orderCount: number;
  avgDeliveryTimeMinutes: number;
  channelBreakdown: { channel: string; count: number; sales: number; percent: number }[];
  incidentsCount: number;
  netProfit: number;
}

export type AIPredictionCategory =
  | 'SALES_FORECAST'
  | 'DEMAND_PREDICTION'
  | 'STOCKOUT_ALERT'
  | 'PURCHASE_SUGGESTION'
  | 'STAFFING_PLAN'
  | 'ANOMALY_FRAUD'
  | 'LOSS_DETECTION'
  | 'STAR_DEAD_PRODUCTS'
  | 'PROMO_PRICING_SUGGESTION';

export interface AIPredictionItem {
  id: string;
  category: AIPredictionCategory;
  title: string;
  summary: string;
  detailedExplanation: string;
  confidencePercent: number;
  impactScore: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actionableRecommendation: string;
  metrics?: Record<string, any>;
  createdAt: string;
}

export interface BIDashboardWidgetConfig {
  id: string;
  title: string;
  type: 'KPI' | 'CHART_BAR' | 'CHART_LINE' | 'CHART_AREA' | 'CHART_DONUT' | 'RADAR' | 'HEATMAP' | 'TABLE' | 'AI';
  visible: boolean;
  order: number;
  colSpan: number; // 1 to 12 in grid
}
