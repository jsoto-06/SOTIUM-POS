export type CustomerType = 'PERSONA' | 'EMPRESA';
export type CustomerTier = 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO';
export type CommunicationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';

export interface CustomerAddress {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isMain: boolean;
  notes?: string;
}

export interface CompanyContact {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface CompanyDelegation {
  id: string;
  name: string;
  cif: string;
  address: CustomerAddress;
  contactPerson: string;
  phone: string;
}

export interface CommercialConditions {
  specialRateId?: string;
  discountPercent: number;
  paymentTermDays: number;
  creditLimit: number;
  currentCreditUsed: number;
  requiresInvoice: boolean;
}

export interface RGPDConsent {
  acceptedMarketing: boolean;
  acceptedWhatsapp: boolean;
  acceptedAnalytics: boolean;
  acceptedThirdParties: boolean;
  consentDate: string;
  ipAddress?: string;
}

export interface LoyaltyAccount {
  points: number;
  cashbackBalance: number;
  monederoBalance: number;
  tier: CustomerTier;
  totalSpentLifetime: number;
  totalVisitsLifetime: number;
}

export interface GiftCard {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  issueDate: string;
  expirationDate: string;
  purchaserCustomerId?: string;
  recipientName?: string;
  isActive: boolean;
}

export interface VoucherCoupon {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchaseAmount?: number;
  validFrom: string;
  validUntil: string;
  isUsed: boolean;
  usedDate?: string;
}

export interface CustomerHistoryEntry {
  id: string;
  date: string;
  type: 'TICKET' | 'FACTURA' | 'RESERVA' | 'DELIVERY' | 'COMPRA' | 'VISITA' | 'EMAIL' | 'INCIDENCIA' | 'CAMPAÑA' | 'PUNTOS' | 'MONEDERO';
  referenceNumber: string;
  description: string;
  amount?: number;
  pointsEarnedOrSpent?: number;
  performedBy?: string;
}

export interface Customer {
  id: string;
  code: string; // e.g. CLI-2026-001
  type: CustomerType;
  
  // Person fields
  name: string;
  surnames?: string;
  birthDate?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'NO_ESPECIFICADO';
  languages?: string[];
  photoUrl?: string;

  // Company fields
  socialName?: string;
  tradeName?: string;
  cifNif: string;
  
  // Contact
  email: string;
  phone: string;
  whatsapp?: string;
  
  // Address
  mainAddress: CustomerAddress;
  additionalAddresses?: CustomerAddress[];
  
  // Enterprise Company Specifics
  delegations?: CompanyDelegation[];
  contacts?: CompanyContact[];
  commercialConditions?: CommercialConditions;

  // Status & Classification
  active: boolean;
  isVip: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  notes?: string;
  tags: string[];
  
  // Dates
  createdAt: string;
  lastVisit?: string;
  lastPurchase?: string;

  // Fidelización
  loyalty: LoyaltyAccount;
  giftCards?: GiftCard[];
  coupons?: VoucherCoupon[];

  // RGPD
  rgpd: RGPDConsent;

  // History timeline
  history: CustomerHistoryEntry[];
}

export interface MarketingSegmentFilter {
  minAge?: number;
  maxAge?: number;
  gender?: string;
  province?: string;
  minSpend?: number;
  maxSpend?: number;
  minVisits?: number;
  lastVisitDaysAgo?: number;
  favCategory?: string;
  tier?: CustomerTier;
  isVipOnly?: boolean;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  description: string;
  channel: CommunicationChannel;
  scheduledDate: string;
  status: 'BORRADOR' | 'PROGRAMADA' | 'ENVIADA' | 'CANCELADA';
  targetSegment: MarketingSegmentFilter;
  messageTemplate: string;
  sentCount: number;
  conversionRatePercent: number;
}

export interface AICustomerPrediction {
  customerId: string;
  customerName: string;
  churnRiskScore: number; // 0 - 100
  isVipCandidate: boolean;
  predictedNextSpend: number;
  recommendedCampaign: string;
  recommendedDiscountPercent: number;
  aiExplanation: string;
}

export interface CRMAnalyticsSummary {
  totalCustomersCount: number;
  activeCustomersCount: number;
  vipCustomersCount: number;
  corporateCount: number;
  totalPointsIssued: number;
  totalMonederoBalance: number;
  averageTicket: number;
  topProvince: string;
  churnAtRiskCount: number;
  tierBreakdown: Record<CustomerTier, number>;
}
