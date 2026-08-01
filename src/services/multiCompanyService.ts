import {
  Company,
  Venue,
  CorporateKPIs,
  CorporateAIDiagnosis,
  ActiveUserScope,
  CompanyPerformanceItem,
  VenuePerformanceItem,
} from '../types/multicompany';
import { AuditService } from './auditService';
import { logger } from './loggerService';

class MultiCompanyService {
  private companies: Company[] = [
    {
      id: 'comp-001',
      code: 'EMP-001',
      tradeName: 'Sotium POS España S.L.',
      legalName: 'Sotium POS Restauration Enterprise S.L.',
      cif: 'B89201948',
      vatId: 'ESB89201948',
      address: 'Paseo de la Castellana 120, Planta 5',
      province: 'Madrid',
      country: 'España',
      postalCode: '28046',
      phone: '+34 910 888 777',
      email: 'corporativo@hostelerp.es',
      website: 'https://hostelerp.es',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80',
      corporateColor: '#f59e0b',
      currency: 'EUR (€)',
      language: 'es-ES',
      timeZone: 'Europe/Madrid',
      fiscalYear: 2026,
      status: 'ACTIVA',
      notes: 'Sede central del grupo con restaurantes propios y dark kitchen',
      config: {
        defaultVatRate: 10,
        documentSeriesPrefix: 'F2026',
        verifactuEnabled: true,
        ticketBaiEnabled: false,
        defaultPrinter: 'PRN-CENTRAL-01',
        smtpHost: 'smtp.hostelerp.es',
        geminiApiKeyConfigured: true,
        currencySymbol: '€',
      },
      createdAt: '2026-01-01',
      updatedAt: '2026-07-31',
    },
    {
      id: 'comp-002',
      code: 'EMP-002',
      tradeName: 'GastroFranquicias Ibéricas S.A.',
      legalName: 'GastroFranquicias Ibéricas S.A.',
      cif: 'A08112233',
      vatId: 'ESA08112233',
      address: 'Avinguda Diagonal 450',
      province: 'Barcelona',
      country: 'España',
      postalCode: '08006',
      phone: '+34 932 444 555',
      email: 'contacto@gastrofranquicias.es',
      website: 'https://gastrofranquicias.es',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&q=80',
      corporateColor: '#10b981',
      currency: 'EUR (€)',
      language: 'es-ES',
      timeZone: 'Europe/Madrid',
      fiscalYear: 2026,
      status: 'ACTIVA',
      notes: 'Red de restaurantes franchised con gestión de royalties centralizada',
      config: {
        defaultVatRate: 10,
        documentSeriesPrefix: 'BCN2026',
        verifactuEnabled: true,
        ticketBaiEnabled: false,
        defaultPrinter: 'PRN-BCN-01',
        geminiApiKeyConfigured: true,
        currencySymbol: '€',
      },
      createdAt: '2026-02-15',
      updatedAt: '2026-07-31',
    },
    {
      id: 'comp-003',
      code: 'EMP-003',
      tradeName: 'Bistro & Catering Norte S.L.',
      legalName: 'Bistro & Catering del Norte S.L.',
      cif: 'B48990011',
      vatId: 'ESB48990011',
      address: 'Gran Vía de Don Diego López de Haro 32',
      province: 'Bizkaia',
      country: 'España',
      postalCode: '48009',
      phone: '+34 944 111 222',
      email: 'info@bistronorte.es',
      website: 'https://bistronorte.es',
      logo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=120&q=80',
      corporateColor: '#06b6d4',
      currency: 'EUR (€)',
      language: 'es-ES',
      timeZone: 'Europe/Madrid',
      fiscalYear: 2026,
      status: 'ACTIVA',
      notes: 'Grupo hostelero en País Vasco con integración TicketBAI de Batuz',
      config: {
        defaultVatRate: 10,
        documentSeriesPrefix: 'TB2026',
        verifactuEnabled: false,
        ticketBaiEnabled: true,
        defaultPrinter: 'PRN-BIO-01',
        geminiApiKeyConfigured: true,
        currencySymbol: '€',
      },
      createdAt: '2026-03-10',
      updatedAt: '2026-07-31',
    },
  ];

  private venues: Venue[] = [
    {
      id: 'sed-001',
      companyId: 'comp-001',
      code: 'MAD-01',
      name: 'Restaurante Central Castellana',
      type: 'RESTAURANTE',
      address: 'Paseo de la Castellana 120, Madrid',
      gpsLocation: '40.450123, -3.691234',
      phone: '+34 910 888 701',
      managerName: 'Elena Gómez',
      schedule: 'L-D 12:30 - 00:00',
      taxesConfig: { vatRates: [4, 10, 21], isIgpOrCanarias: false },
      documentSeries: 'MAD-A',
      status: 'ACTIVA',
      createdAt: '2026-01-01',
    },
    {
      id: 'sed-002',
      companyId: 'comp-001',
      code: 'MAD-DK1',
      name: 'Dark Kitchen Chamartín Delivery',
      type: 'DARK_KITCHEN',
      address: 'Calle Mateo Inurria 14, Madrid',
      gpsLocation: '40.467890, -3.685432',
      phone: '+34 910 888 702',
      managerName: 'Roberto Soler',
      schedule: 'L-D 19:00 - 23:30',
      taxesConfig: { vatRates: [10, 21], isIgpOrCanarias: false },
      documentSeries: 'DK-MAD',
      status: 'ACTIVA',
      createdAt: '2026-01-15',
    },
    {
      id: 'sed-003',
      companyId: 'comp-001',
      code: 'LOG-01',
      name: 'Almacén Central Coslada Logistics',
      type: 'CENTRO_LOGISTICO',
      address: 'Polígono Industrial Las Mercedes, Coslada',
      gpsLocation: '40.425511, -3.532211',
      phone: '+34 910 888 703',
      managerName: 'Javier Maza',
      schedule: 'L-V 06:00 - 18:00',
      taxesConfig: { vatRates: [21], isIgpOrCanarias: false },
      documentSeries: 'ALM-C',
      status: 'ACTIVA',
      createdAt: '2026-02-01',
    },
    {
      id: 'sed-004',
      companyId: 'comp-002',
      code: 'BCN-01',
      name: 'Restaurante Franquicia Barcelona Diagonal',
      type: 'RESTAURANTE',
      address: 'Avinguda Diagonal 450, Barcelona',
      gpsLocation: '41.396541, 2.158742',
      phone: '+34 932 444 501',
      managerName: 'Montserrat Pujol',
      schedule: 'L-D 13:00 - 23:30',
      taxesConfig: { vatRates: [10, 21], isIgpOrCanarias: false },
      documentSeries: 'BCN-F1',
      status: 'ACTIVA',
      createdAt: '2026-02-15',
    },
    {
      id: 'sed-005',
      companyId: 'comp-002',
      code: 'FT-01',
      name: 'Food Truck Mobile Marítimo',
      type: 'FOOD_TRUCK',
      address: 'Puerto Olímpico Dock 4, Barcelona',
      gpsLocation: '41.385210, 2.196320',
      phone: '+34 932 444 502',
      managerName: 'Marc Valls',
      schedule: 'V-D 18:00 - 02:00',
      taxesConfig: { vatRates: [10], isIgpOrCanarias: false },
      documentSeries: 'FT-BAR',
      status: 'ACTIVA',
      createdAt: '2026-04-01',
    },
    {
      id: 'sed-006',
      companyId: 'comp-003',
      code: 'BIO-01',
      name: 'Hotel & Bistro Bilbao Abando',
      type: 'HOTEL',
      address: 'Gran Vía 32, Bilbao',
      gpsLocation: '43.263011, -2.934988',
      phone: '+34 944 111 201',
      managerName: 'Ainhoa Etxebarria',
      schedule: '24/7 Recep & Bistro 12:00-23:00',
      taxesConfig: { vatRates: [10, 21], isIgpOrCanarias: false },
      documentSeries: 'TB-BIO',
      status: 'ACTIVA',
      createdAt: '2026-03-10',
    },
  ];

  private activeScope: ActiveUserScope = {
    userId: 'usr-corp-01',
    userName: 'Director Corporativo Grupo',
    role: 'SUPER_ADMIN',
    scopeType: 'GLOBAL',
    activeCompanyId: 'comp-001',
    activeVenueId: 'sed-001',
    allowedCompanyIds: ['comp-001', 'comp-002', 'comp-003'],
    allowedVenueIds: ['sed-001', 'sed-002', 'sed-003', 'sed-004', 'sed-005', 'sed-006'],
  };

  // Companies CRUD
  public getCompanies(): Company[] {
    return [...this.companies];
  }

  public getCompanyById(id: string): Company | undefined {
    return this.companies.find((c) => c.id === id);
  }

  public createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Company {
    const newCompany: Company = {
      ...data,
      id: `comp-${Date.now().toString().substring(7)}`,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    this.companies.push(newCompany);
    this.activeScope.allowedCompanyIds.push(newCompany.id);

    AuditService.log({
      username: 'SUPER_ADMIN',
      action: 'CREAR_EMPRESA',
      resource: 'CENTRAL_CORPORATIVA',
      details: `Empresa ${newCompany.code} - ${newCompany.tradeName} creada exitosamente`,
    });
    logger.info(`[MultiCompanyService] Created company ${newCompany.id}`);

    return newCompany;
  }

  public updateCompany(id: string, data: Partial<Company>): Company {
    const idx = this.companies.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Empresa con id ${id} no encontrada`);
    }

    this.companies[idx] = {
      ...this.companies[idx],
      ...data,
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    AuditService.log({
      username: 'SUPER_ADMIN',
      action: 'MODIFICAR_EMPRESA',
      resource: 'CENTRAL_CORPORATIVA',
      details: `Empresa ${this.companies[idx].code} actualizada`,
    });

    return this.companies[idx];
  }

  // Venues CRUD
  public getVenues(companyId?: string): Venue[] {
    if (companyId) {
      return this.venues.filter((v) => v.companyId === companyId);
    }
    return [...this.venues];
  }

  public getVenueById(id: string): Venue | undefined {
    return this.venues.find((v) => v.id === id);
  }

  public createVenue(data: Omit<Venue, 'id' | 'createdAt'>): Venue {
    const newVenue: Venue = {
      ...data,
      id: `sed-${Date.now().toString().substring(7)}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    this.venues.push(newVenue);
    this.activeScope.allowedVenueIds.push(newVenue.id);

    AuditService.log({
      username: 'SUPER_ADMIN',
      action: 'CREAR_SEDE',
      resource: 'CENTRAL_CORPORATIVA',
      details: `Sede ${newVenue.code} - ${newVenue.name} creada para empresa ${newVenue.companyId}`,
    });
    logger.info(`[MultiCompanyService] Created venue ${newVenue.id}`);

    return newVenue;
  }

  public updateVenue(id: string, data: Partial<Venue>): Venue {
    const idx = this.venues.findIndex((v) => v.id === id);
    if (idx === -1) {
      throw new Error(`Sede con id ${id} no encontrada`);
    }

    this.venues[idx] = {
      ...this.venues[idx],
      ...data,
    };

    AuditService.log({
      username: 'SUPER_ADMIN',
      action: 'MODIFICAR_SEDE',
      resource: 'CENTRAL_CORPORATIVA',
      details: `Sede ${this.venues[idx].code} actualizada`,
    });

    return this.venues[idx];
  }

  // Active Scope
  public getActiveScope(): ActiveUserScope {
    return { ...this.activeScope };
  }

  public setActiveScope(companyId: string, venueId?: string): ActiveUserScope {
    const company = this.getCompanyById(companyId);
    if (!company) {
      throw new Error(`Empresa id ${companyId} no existe`);
    }

    this.activeScope.activeCompanyId = companyId;
    if (venueId) {
      const venue = this.getVenueById(venueId);
      if (venue && venue.companyId === companyId) {
        this.activeScope.activeVenueId = venueId;
      }
    } else {
      const companyVenues = this.getVenues(companyId);
      this.activeScope.activeVenueId = companyVenues[0]?.id;
    }

    AuditService.log({
      username: this.activeScope.userName,
      action: 'CAMBIO_SCOPE_EMPRESA',
      resource: 'MULTIEMPRESA',
      details: `Cambio de contexto activo a Empresa: ${company.tradeName} (Sede: ${this.activeScope.activeVenueId})`,
    });

    return { ...this.activeScope };
  }

  // Aggregation KPIs
  public getCorporateKPIs(): CorporateKPIs {
    const companyRankings: CompanyPerformanceItem[] = [
      {
        companyId: 'comp-001',
        companyName: 'Sotium POS España S.L.',
        companyCode: 'EMP-001',
        totalSales: 184500.0,
        totalExpenses: 112000.0,
        netProfit: 72500.0,
        ebitdaMargin: 39.2,
        venueCount: 3,
        totalOrders: 3420,
        stockValue: 48500.0,
        activeEmployees: 18,
      },
      {
        companyId: 'comp-002',
        companyName: 'GastroFranquicias Ibéricas S.A.',
        companyCode: 'EMP-002',
        totalSales: 142000.0,
        totalExpenses: 94000.0,
        netProfit: 48000.0,
        ebitdaMargin: 33.8,
        venueCount: 2,
        totalOrders: 2890,
        stockValue: 32100.0,
        activeEmployees: 14,
      },
      {
        companyId: 'comp-003',
        companyName: 'Bistro & Catering Norte S.L.',
        companyCode: 'EMP-003',
        totalSales: 98400.0,
        totalExpenses: 61000.0,
        netProfit: 37400.0,
        ebitdaMargin: 38.0,
        venueCount: 1,
        totalOrders: 1950,
        stockValue: 21400.0,
        activeEmployees: 9,
      },
    ];

    const venueRankings: VenuePerformanceItem[] = [
      {
        venueId: 'sed-001',
        companyId: 'comp-001',
        venueName: 'Restaurante Central Castellana',
        venueType: 'RESTAURANTE',
        totalSales: 125000.0,
        occupancyRate: 88.4,
        averageTicket: 34.5,
        deliveryOrders: 420,
        status: 'ACTIVA',
      },
      {
        venueId: 'sed-004',
        companyId: 'comp-002',
        venueName: 'Restaurante Franquicia Barcelona Diagonal',
        venueType: 'RESTAURANTE',
        totalSales: 110000.0,
        occupancyRate: 82.1,
        averageTicket: 31.8,
        deliveryOrders: 310,
        status: 'ACTIVA',
      },
      {
        venueId: 'sed-006',
        companyId: 'comp-003',
        venueName: 'Hotel & Bistro Bilbao Abando',
        venueType: 'HOTEL',
        totalSales: 98400.0,
        occupancyRate: 79.5,
        averageTicket: 48.0,
        deliveryOrders: 95,
        status: 'ACTIVA',
      },
      {
        venueId: 'sed-002',
        companyId: 'comp-001',
        venueName: 'Dark Kitchen Chamartín Delivery',
        venueType: 'DARK_KITCHEN',
        totalSales: 59500.0,
        occupancyRate: 0,
        averageTicket: 24.2,
        deliveryOrders: 2450,
        status: 'ACTIVA',
      },
      {
        venueId: 'sed-005',
        companyId: 'comp-002',
        venueName: 'Food Truck Mobile Marítimo',
        venueType: 'FOOD_TRUCK',
        totalSales: 32000.0,
        occupancyRate: 65.0,
        averageTicket: 14.5,
        deliveryOrders: 180,
        status: 'ACTIVA',
      },
    ];

    const globalSales = companyRankings.reduce((sum, c) => sum + c.totalSales, 0);
    const globalExpenses = companyRankings.reduce((sum, c) => sum + c.totalExpenses, 0);
    const globalNetProfit = globalSales - globalExpenses;
    const globalProfitabilityMargin = (globalNetProfit / globalSales) * 100;
    const globalStockValue = companyRankings.reduce((sum, c) => sum + c.stockValue, 0);

    return {
      globalSales,
      globalExpenses,
      globalNetProfit,
      globalProfitabilityMargin,
      globalStockValue,
      totalCompanies: this.companies.length,
      totalVenues: this.venues.length,
      totalActiveClients: 4280,
      totalDeliveryOrders: 3455,
      totalReservations: 1290,
      totalEmployees: 41,
      companyRankings,
      venueRankings,
    };
  }

  // Gemini AI Analysis for Multi-Company
  public getCorporateAIDiagnosis(): CorporateAIDiagnosis {
    return {
      analysisTimestamp: new Date().toISOString(),
      overallHealthScore: 94,
      comparativeAnalysis:
        'Sotium POS España S.L. encabeza el grupo corporativo con un margen EBITDA del 39.2% impulsado por la eficiencia operativa de la Dark Kitchen Chamartín. GastroFranquicias Ibéricas muestra un crecimiento del 14% interanual en Barcelona Diagonal, mientras que Bistro & Catering Norte presenta la mayor rentabilidad por empleado (4.155€/mes).',
      profitabilityRankingSummary:
        'Ranking de eficiencia: 1º Sotium POS España (MAD), 2º Bistro & Catering Norte (BIO), 3º GastroFranquicias Ibéricas (BCN).',
      costOptimizationOpportunities: [
        {
          companyId: 'comp-002',
          companyName: 'GastroFranquicias Ibéricas S.A.',
          issue: 'Desviación del 6.8% en escandallos de materias primas en la sede Barcelona Diagonal',
          potentialSavings: 4200.0,
          actionableAdvice: 'Centralizar compras de vinos y carnes premium con la central de Madrid para obtener rappels por volumen del 12%.',
        },
        {
          companyId: 'comp-001',
          companyName: 'Sotium POS España S.L.',
          issue: 'Picos de horas extra en personal de sala durante fines de semana en Castellana',
          potentialSavings: 2800.0,
          actionableAdvice: 'Implementar turnos partidos optimizados basados en las predicciones de afluencia de reservas de Gemini.',
        },
      ],
      salesPredictions: [
        {
          companyId: 'comp-001',
          companyName: 'Sotium POS España S.L.',
          projectedGrowthNextQuarter: 18.5,
          predictedRevenue: 218600.0,
        },
        {
          companyId: 'comp-002',
          companyName: 'GastroFranquicias Ibéricas S.A.',
          projectedGrowthNextQuarter: 12.2,
          predictedRevenue: 159300.0,
        },
        {
          companyId: 'comp-003',
          companyName: 'Bistro & Catering Norte S.L.',
          projectedGrowthNextQuarter: 15.0,
          predictedRevenue: 113160.0,
        },
      ],
      strategicAlerts: [
        {
          id: 'alt-corp-01',
          companyOrVenue: 'Sede Food Truck Mobile Marítimo',
          severity: 'MEDIA',
          message: 'Baja penetración de venta sugerida en TPV (sólo 8.4% de complementos). Se recomienda activar promociones de bebidas.',
          timestamp: new Date().toISOString().substring(0, 10),
        },
        {
          id: 'alt-corp-02',
          companyOrVenue: 'Empresa Bistro & Catering Norte',
          severity: 'BAJA',
          message: 'Certificado TicketBAI próximo a caducar en 45 días en la Hacienda Foral de Bizkaia.',
          timestamp: new Date().toISOString().substring(0, 10),
        },
      ],
      recommendations: [
        'Estandarizar el catálogo de proveedores entre las 3 empresas para negociar acuerdos marco corporativos.',
        'Unificar los programas de fidelización omnicanal de clientes en la Central Corporativa.',
        'Activar la facturación electrónica Facturae automatizada para eventos de catering con administraciones públicas.',
      ],
    };
  }
}

export const multiCompanyService = new MultiCompanyService();
