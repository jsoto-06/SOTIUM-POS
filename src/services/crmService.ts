import {
  Customer,
  CustomerTier,
  MarketingSegmentFilter,
  MarketingCampaign,
  AICustomerPrediction,
  CRMAnalyticsSummary,
  GiftCard,
  VoucherCoupon,
  CustomerHistoryEntry,
} from '../types/crm';
import { INITIAL_CUSTOMERS, INITIAL_CAMPAIGNS, INITIAL_AI_PREDICTIONS } from '../data/crmData';

export class CRMService {
  /**
   * Recalculates VIP tier based on total lifetime spend and visits
   */
  public static calculateTier(spent: number, visits: number): CustomerTier {
    if (spent >= 1500 || visits >= 25) return 'PLATINO';
    if (spent >= 750 || visits >= 15) return 'ORO';
    if (spent >= 300 || visits >= 8) return 'PLATA';
    return 'BRONCE';
  }

  /**
   * Accrues points and cashback on ticket purchase
   */
  public static processPurchase(
    customer: Customer,
    amount: number,
    referenceNumber: string,
    description: string,
    performedBy: string = 'TPV Central'
  ): Customer {
    const pointsEarned = Math.floor(amount);
    // 2% cashback for Bronce, 3% for Plata, 5% for Oro, 7% for Platino
    const cashbackRates: Record<CustomerTier, number> = {
      BRONCE: 0.02,
      PLATA: 0.03,
      ORO: 0.05,
      PLATINO: 0.07,
    };
    const cashbackEarned = Number((amount * cashbackRates[customer.loyalty.tier]).toFixed(2));

    const newSpent = customer.loyalty.totalSpentLifetime + amount;
    const newVisits = customer.loyalty.totalVisitsLifetime + 1;
    const newTier = this.calculateTier(newSpent, newVisits);

    const historyEntry: CustomerHistoryEntry = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'TICKET',
      referenceNumber,
      description,
      amount,
      pointsEarnedOrSpent: pointsEarned,
      performedBy,
    };

    return {
      ...customer,
      lastVisit: new Date().toISOString().substring(0, 10),
      lastPurchase: new Date().toISOString().substring(0, 10),
      loyalty: {
        ...customer.loyalty,
        points: customer.loyalty.points + pointsEarned,
        cashbackBalance: Number((customer.loyalty.cashbackBalance + cashbackEarned).toFixed(2)),
        tier: newTier,
        totalSpentLifetime: Number(newSpent.toFixed(2)),
        totalVisitsLifetime: newVisits,
      },
      history: [historyEntry, ...customer.history],
    };
  }

  /**
   * Top up Monedero / Prepaid Wallet
   */
  public static topUpMonedero(customer: Customer, amount: number, paymentMethod: string): Customer {
    const historyEntry: CustomerHistoryEntry = {
      id: `hist-mon-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'MONEDERO',
      referenceNumber: `REC-MON-${Date.now().toString().slice(-4)}`,
      description: `Recarga de Monedero (${paymentMethod})`,
      amount,
      performedBy: 'Caja TPV',
    };

    return {
      ...customer,
      loyalty: {
        ...customer.loyalty,
        monederoBalance: Number((customer.loyalty.monederoBalance + amount).toFixed(2)),
      },
      history: [historyEntry, ...customer.history],
    };
  }

  /**
   * Redeem Points for Discount / Monedero
   */
  public static redeemPoints(customer: Customer, pointsToRedeem: number): { updatedCustomer: Customer; discountValue: number } {
    if (customer.loyalty.points < pointsToRedeem) {
      throw new Error('Puntos insuficientes');
    }
    // Rate: 100 points = 5 €
    const discountValue = Number(((pointsToRedeem / 100) * 5).toFixed(2));

    const historyEntry: CustomerHistoryEntry = {
      id: `hist-pts-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'PUNTOS',
      referenceNumber: `CANJE-${Date.now().toString().slice(-4)}`,
      description: `Canje de ${pointsToRedeem} puntos por un cupón/descuento de ${discountValue} €`,
      pointsEarnedOrSpent: -pointsToRedeem,
      amount: discountValue,
      performedBy: 'TPV Central',
    };

    const updatedCustomer: Customer = {
      ...customer,
      loyalty: {
        ...customer.loyalty,
        points: customer.loyalty.points - pointsToRedeem,
      },
      history: [historyEntry, ...customer.history],
    };

    return { updatedCustomer, discountValue };
  }

  /**
   * Search customers by term across multiple fields
   */
  public static searchCustomers(customers: Customer[], query: string): Customer[] {
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q) || (c.surnames && c.surnames.toLowerCase().includes(q));
      const nifMatch = c.cifNif.toLowerCase().includes(q);
      const emailMatch = c.email.toLowerCase().includes(q);
      const phoneMatch = c.phone.includes(q) || (c.whatsapp && c.whatsapp.includes(q));
      const codeMatch = c.code.toLowerCase().includes(q);
      const companyMatch = c.socialName?.toLowerCase().includes(q) || c.tradeName?.toLowerCase().includes(q);
      const tagMatch = c.tags.some((t) => t.toLowerCase().includes(q));
      return nameMatch || nifMatch || emailMatch || phoneMatch || codeMatch || companyMatch || tagMatch;
    });
  }

  /**
   * Auto-Segmentation Engine for Marketing Campaigns
   */
  public static segmentCustomers(customers: Customer[], filter: MarketingSegmentFilter): Customer[] {
    const now = new Date();
    return customers.filter((c) => {
      if (filter.isVipOnly && !c.isVip) return false;
      if (filter.tier && c.loyalty.tier !== filter.tier) return false;
      if (filter.minSpend !== undefined && c.loyalty.totalSpentLifetime < filter.minSpend) return false;
      if (filter.maxSpend !== undefined && c.loyalty.totalSpentLifetime > filter.maxSpend) return false;
      if (filter.minVisits !== undefined && c.loyalty.totalVisitsLifetime < filter.minVisits) return false;
      if (filter.province && c.mainAddress.province.toLowerCase() !== filter.province.toLowerCase()) return false;
      if (filter.gender && c.gender !== filter.gender) return false;

      if (filter.lastVisitDaysAgo !== undefined && c.lastVisit) {
        const lastVisitDate = new Date(c.lastVisit);
        const diffDays = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays < filter.lastVisitDaysAgo) return false;
      }

      return true;
    });
  }

  /**
   * RGPD Compliance: Right to be Forgotten (Anonymize Customer Data)
   */
  public static anonymizeCustomer(customer: Customer): Customer {
    return {
      ...customer,
      name: 'ANÓNIMO (RGPD)',
      surnames: undefined,
      birthDate: undefined,
      cifNif: `ANON-${customer.id.substring(0, 6)}`,
      email: `anonimo-${customer.id}@rgpd-deleted.local`,
      phone: '000000000',
      whatsapp: undefined,
      photoUrl: undefined,
      socialName: undefined,
      tradeName: undefined,
      mainAddress: {
        id: customer.mainAddress.id,
        street: 'ANONIMIZADO POR SOLICITUD RGPD',
        city: 'ANONIMO',
        province: 'ANONIMO',
        postalCode: '00000',
        country: 'España',
        isMain: true,
      },
      additionalAddresses: [],
      delegations: [],
      contacts: [],
      notes: 'DATOS PERSONALES ELIMINADOS EN CUMPLIMIENTO DEL DERECHO AL OLVIDO (ART. 17 RGPD)',
      active: false,
      isBlocked: true,
      blockedReason: 'Eliminado por RGPD',
      rgpd: {
        acceptedMarketing: false,
        acceptedWhatsapp: false,
        acceptedAnalytics: false,
        acceptedThirdParties: false,
        consentDate: new Date().toISOString(),
      },
      history: [
        {
          id: `hist-rgpd-${Date.now()}`,
          date: new Date().toISOString().substring(0, 16),
          type: 'INCIDENCIA',
          referenceNumber: 'RGPD-RIGHT-TO-FORGET',
          description: 'Ejecución del Derecho al Olvido y anonimización de datos de carácter personal',
          performedBy: 'Oficial de Protección de Datos (DPO)',
        },
      ],
    };
  }

  /**
   * Export RGPD Data Package as structured JSON object
   */
  public static exportRGPDDataPackage(customer: Customer) {
    return {
      exportMetadata: {
        system: 'HOSERP Enterprise CRM',
        exportedAt: new Date().toISOString(),
        rgpdComplianceArticle: 'Art. 20 RGPD - Derecho a la Portabilidad de Datos',
      },
      customerProfile: {
        id: customer.id,
        code: customer.code,
        type: customer.type,
        name: customer.name,
        surnames: customer.surnames,
        cifNif: customer.cifNif,
        email: customer.email,
        phone: customer.phone,
        birthDate: customer.birthDate,
        addresses: [customer.mainAddress, ...(customer.additionalAddresses || [])],
      },
      loyaltyData: customer.loyalty,
      consents: customer.rgpd,
      historyLog: customer.history,
    };
  }

  /**
   * Generate Gemini AI Predictions & Recommendations for Churn / VIP candidates
   */
  public static generateAIPredictions(customers: Customer[]): AICustomerPrediction[] {
    return customers.map((c) => {
      const now = new Date();
      let lastVisitDays = 0;
      if (c.lastVisit) {
        lastVisitDays = Math.floor((now.getTime() - new Date(c.lastVisit).getTime()) / (1000 * 3600 * 24));
      }

      let churnRiskScore = 10;
      if (lastVisitDays > 90) churnRiskScore = 90;
      else if (lastVisitDays > 60) churnRiskScore = 65;
      else if (lastVisitDays > 30) churnRiskScore = 35;

      const isVipCandidate = c.loyalty.totalSpentLifetime > 1000 || c.loyalty.totalVisitsLifetime > 20;

      let recommendedCampaign = 'Campaña Estándar';
      let recommendedDiscountPercent = 0;
      let aiExplanation = 'Comportamiento habitual de consumo y visita dentro de rangos normales.';

      if (churnRiskScore > 75) {
        recommendedCampaign = 'Recuperación de Cliente Inactivo (Bono 20%)';
        recommendedDiscountPercent = 20;
        aiExplanation = `El cliente lleva ${lastVisitDays} días sin consumir en el establecimiento. Se sugiere activar un cupón de re-engagement inmediato.`;
      } else if (isVipCandidate && !c.isVip) {
        recommendedCampaign = 'Invitación Nivel VIP Platino';
        recommendedDiscountPercent = 10;
        aiExplanation = `Gasto acumulado de ${c.loyalty.totalSpentLifetime}€ supera el umbral de cliente VIP. Promover a Platino incrementará su rentabilidad.`;
      }

      return {
        customerId: c.id,
        customerName: c.type === 'EMPRESA' ? (c.socialName || c.name) : `${c.name} ${c.surnames || ''}`,
        churnRiskScore,
        isVipCandidate,
        predictedNextSpend: Number((c.loyalty.totalSpentLifetime / (c.loyalty.totalVisitsLifetime || 1) * 1.1).toFixed(2)),
        recommendedCampaign,
        recommendedDiscountPercent,
        aiExplanation,
      };
    });
  }

  /**
   * Compute CRM Analytics Summary
   */
  public static computeAnalytics(customers: Customer[]): CRMAnalyticsSummary {
    const totalCustomersCount = customers.length;
    const activeCustomersCount = customers.filter((c) => c.active).length;
    const vipCustomersCount = customers.filter((c) => c.isVip).length;
    const corporateCount = customers.filter((c) => c.type === 'EMPRESA').length;

    const totalPointsIssued = customers.reduce((acc, c) => acc + c.loyalty.points, 0);
    const totalMonederoBalance = customers.reduce((acc, c) => acc + c.loyalty.monederoBalance, 0);

    const totalSpent = customers.reduce((acc, c) => acc + c.loyalty.totalSpentLifetime, 0);
    const totalVisits = customers.reduce((acc, c) => acc + c.loyalty.totalVisitsLifetime, 0);
    const averageTicket = totalVisits > 0 ? Number((totalSpent / totalVisits).toFixed(2)) : 0;

    const churnAtRiskCount = customers.filter((c) => {
      if (!c.lastVisit) return false;
      const days = Math.floor((Date.now() - new Date(c.lastVisit).getTime()) / (1000 * 3600 * 24));
      return days > 60;
    }).length;

    const tierBreakdown: Record<CustomerTier, number> = {
      BRONCE: customers.filter((c) => c.loyalty.tier === 'BRONCE').length,
      PLATA: customers.filter((c) => c.loyalty.tier === 'PLATA').length,
      ORO: customers.filter((c) => c.loyalty.tier === 'ORO').length,
      PLATINO: customers.filter((c) => c.loyalty.tier === 'PLATINO').length,
    };

    return {
      totalCustomersCount,
      activeCustomersCount,
      vipCustomersCount,
      corporateCount,
      totalPointsIssued,
      totalMonederoBalance,
      averageTicket,
      topProvince: 'Madrid',
      churnAtRiskCount,
      tierBreakdown,
    };
  }

  /**
   * Helper to parse CSV string into array of Customer objects
   */
  public static importCustomersFromCSV(csvText: string): Customer[] {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const imported: Customer[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 4) {
        const [name, cifNif, email, phone, city, province] = cols;
        const newCustomer: Customer = {
          id: `cli-csv-${Date.now()}-${i}`,
          code: `CLI-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
          type: cifNif.startsWith('B') || cifNif.startsWith('A') ? 'EMPRESA' : 'PERSONA',
          name: name || 'Cliente Importado',
          cifNif: cifNif || `NIF-IMP-${i}`,
          email: email || `importado${i}@cliente.com`,
          phone: phone || '600000000',
          mainAddress: {
            id: `addr-imp-${i}`,
            street: 'Dirección Importada',
            city: city || 'Madrid',
            province: province || 'Madrid',
            postalCode: '28000',
            country: 'España',
            isMain: true,
          },
          active: true,
          isVip: false,
          isBlocked: false,
          tags: ['Importado CSV'],
          createdAt: new Date().toISOString().substring(0, 10),
          loyalty: {
            points: 0,
            cashbackBalance: 0,
            monederoBalance: 0,
            tier: 'BRONCE',
            totalSpentLifetime: 0,
            totalVisitsLifetime: 0,
          },
          rgpd: {
            acceptedMarketing: true,
            acceptedWhatsapp: true,
            acceptedAnalytics: true,
            acceptedThirdParties: false,
            consentDate: new Date().toISOString(),
          },
          history: [],
        };
        imported.push(newCustomer);
      }
    }
    return imported;
  }
}
