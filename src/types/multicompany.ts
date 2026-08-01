export type CompanyStatus = 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';

export type VenueType =
  | 'OFICINA'
  | 'RESTAURANTE'
  | 'HOTEL'
  | 'DARK_KITCHEN'
  | 'FOOD_TRUCK'
  | 'ALMACEN'
  | 'DELEGACION'
  | 'CENTRO_LOGISTICO';

export interface CompanyConfig {
  defaultVatRate: number;
  documentSeriesPrefix: string;
  verifactuEnabled: boolean;
  ticketBaiEnabled: boolean;
  defaultPrinter: string;
  smtpHost?: string;
  geminiApiKeyConfigured: boolean;
  currencySymbol: string;
}

export interface Company {
  id: string;
  code: string;
  tradeName: string;
  legalName: string;
  cif: string;
  vatId: string;
  address: string;
  province: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  corporateColor: string;
  currency: string;
  language: string;
  timeZone: string;
  fiscalYear: number;
  status: CompanyStatus;
  notes?: string;
  config: CompanyConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: VenueType;
  address: string;
  gpsLocation: string; // e.g. "40.416775, -3.703790"
  phone: string;
  managerName: string;
  schedule: string;
  taxesConfig: {
    vatRates: number[];
    isIgpOrCanarias: boolean;
  };
  documentSeries: string;
  status: 'ACTIVA' | 'INACTIVA';
  createdAt: string;
}

export interface CompanyPerformanceItem {
  companyId: string;
  companyName: string;
  companyCode: string;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  ebitdaMargin: number;
  venueCount: number;
  totalOrders: number;
  stockValue: number;
  activeEmployees: number;
}

export interface VenuePerformanceItem {
  venueId: string;
  companyId: string;
  venueName: string;
  venueType: VenueType;
  totalSales: number;
  occupancyRate: number;
  averageTicket: number;
  deliveryOrders: number;
  status: string;
}

export interface CorporateKPIs {
  globalSales: number;
  globalExpenses: number;
  globalNetProfit: number;
  globalProfitabilityMargin: number;
  globalStockValue: number;
  totalCompanies: number;
  totalVenues: number;
  totalActiveClients: number;
  totalDeliveryOrders: number;
  totalReservations: number;
  totalEmployees: number;
  companyRankings: CompanyPerformanceItem[];
  venueRankings: VenuePerformanceItem[];
}

export interface CorporateAIDiagnosis {
  analysisTimestamp: string;
  overallHealthScore: number;
  comparativeAnalysis: string;
  profitabilityRankingSummary: string;
  costOptimizationOpportunities: {
    companyId: string;
    companyName: string;
    issue: string;
    potentialSavings: number;
    actionableAdvice: string;
  }[];
  salesPredictions: {
    companyId: string;
    companyName: string;
    projectedGrowthNextQuarter: number;
    predictedRevenue: number;
  }[];
  strategicAlerts: {
    id: string;
    companyOrVenue: string;
    severity: 'ALTA' | 'MEDIA' | 'BAJA';
    message: string;
    timestamp: string;
  }[];
  recommendations: string[];
}

export type UserAccessScope = 'GLOBAL' | 'EMPRESA' | 'SEDE';

export interface ActiveUserScope {
  userId: string;
  userName: string;
  role: 'SUPER_ADMIN' | 'CORP_MANAGER' | 'STORE_MANAGER' | 'OPERATOR';
  scopeType: UserAccessScope;
  activeCompanyId: string;
  activeVenueId?: string;
  allowedCompanyIds: string[];
  allowedVenueIds: string[];
}
