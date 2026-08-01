import { describe, it, expect } from 'vitest';
import { multiCompanyService } from '../services/multiCompanyService';

describe('FASE 18.1 - Multiempresa y Central Corporativa Enterprise', () => {
  it('debe obtener la lista de empresas iniciales del grupo corporativo', () => {
    const companies = multiCompanyService.getCompanies();
    expect(companies.length).toBeGreaterThanOrEqual(3);
    const flagship = companies.find((c) => c.code === 'EMP-001');
    expect(flagship).toBeDefined();
    expect(flagship?.tradeName).toBe('Sotium POS España S.L.');
    expect(flagship?.config.verifactuEnabled).toBe(true);
  });

  it('debe obtener la lista de sedes filtradas por empresa', () => {
    const allVenues = multiCompanyService.getVenues();
    expect(allVenues.length).toBeGreaterThanOrEqual(6);

    const madridVenues = multiCompanyService.getVenues('comp-001');
    expect(madridVenues.length).toBe(3);
    expect(madridVenues.some((v) => v.type === 'DARK_KITCHEN')).toBe(true);
  });

  it('debe crear una nueva empresa en el grupo corporativo', () => {
    const newCompany = multiCompanyService.createCompany({
      code: 'EMP-099',
      tradeName: 'Franquicias Andaluzas S.L.',
      legalName: 'Gastro Andalucía S.L.',
      cif: 'B41998877',
      vatId: 'ESB41998877',
      address: 'Calle Sierpes 45',
      province: 'Sevilla',
      country: 'España',
      postalCode: '41004',
      phone: '+34 954 112 233',
      email: 'sevilla@gastroandalucia.es',
      website: 'https://gastroandalucia.es',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      corporateColor: '#f59e0b',
      currency: 'EUR (€)',
      language: 'es-ES',
      timeZone: 'Europe/Madrid',
      fiscalYear: 2026,
      status: 'ACTIVA',
      notes: 'Nueva incorporación al grupo',
      config: {
        defaultVatRate: 10,
        documentSeriesPrefix: 'SEV2026',
        verifactuEnabled: true,
        ticketBaiEnabled: false,
        defaultPrinter: 'PRN-SEV-01',
        geminiApiKeyConfigured: true,
        currencySymbol: '€',
      },
    });

    expect(newCompany.id).toBeDefined();
    expect(newCompany.code).toBe('EMP-099');

    const fetched = multiCompanyService.getCompanyById(newCompany.id);
    expect(fetched).toBeDefined();
    expect(fetched?.tradeName).toBe('Franquicias Andaluzas S.L.');
  });

  it('debe crear una sede vinculada a una empresa', () => {
    const newVenue = multiCompanyService.createVenue({
      companyId: 'comp-001',
      code: 'MAD-03',
      name: 'Restaurante Salamanca Premium',
      type: 'RESTAURANTE',
      address: 'Calle Serrano 88, Madrid',
      gpsLocation: '40.431200, -3.687400',
      phone: '+34 910 888 799',
      managerName: 'Carlos Mendoza',
      schedule: 'L-D 13:00 - 01:00',
      taxesConfig: { vatRates: [10, 21], isIgpOrCanarias: false },
      documentSeries: 'MAD-SAL',
      status: 'ACTIVA',
    });

    expect(newVenue.id).toBeDefined();
    expect(newVenue.companyId).toBe('comp-001');
    expect(newVenue.type).toBe('RESTAURANTE');
  });

  it('debe permitir cambiar de contexto de empresa y sede activa con aislamiento', () => {
    const updatedScope = multiCompanyService.setActiveScope('comp-002', 'sed-004');
    expect(updatedScope.activeCompanyId).toBe('comp-002');
    expect(updatedScope.activeVenueId).toBe('sed-004');
  });

  it('debe calcular KPIs consolidados del grupo corporativo', () => {
    const kpis = multiCompanyService.getCorporateKPIs();
    expect(kpis.globalSales).toBeGreaterThan(400000);
    expect(kpis.globalNetProfit).toBeGreaterThan(150000);
    expect(kpis.companyRankings.length).toBeGreaterThanOrEqual(3);
    expect(kpis.venueRankings.length).toBeGreaterThanOrEqual(5);
  });

  it('debe generar el diagnóstico y análisis comparativo Gemini AI para el grupo', () => {
    const aiDiag = multiCompanyService.getCorporateAIDiagnosis();
    expect(aiDiag.overallHealthScore).toBeGreaterThan(80);
    expect(aiDiag.costOptimizationOpportunities.length).toBeGreaterThan(0);
    expect(aiDiag.salesPredictions.length).toBeGreaterThan(0);
    expect(aiDiag.strategicAlerts.length).toBeGreaterThan(0);
  });
});
