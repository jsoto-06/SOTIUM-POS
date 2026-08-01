import { describe, it, expect } from 'vitest';
import { CRMService } from '../services/crmService';
import { Customer, CustomerTier } from '../types/crm';
import { INITIAL_CUSTOMERS } from '../data/crmData';

describe('FASE 12: CRM, Clientes y Fidelización Enterprise', () => {
  it('1. Debe validar creación y tipos de clientes (Persona y Empresa con CIF/NIF)', () => {
    const persona: Customer = INITIAL_CUSTOMERS[0];
    const empresa: Customer = INITIAL_CUSTOMERS[1];

    expect(persona.type).toBe('PERSONA');
    expect(persona.cifNif).toBe('48920194A');
    expect(persona.loyalty.tier).toBe('PLATINO');

    expect(empresa.type).toBe('EMPRESA');
    expect(empresa.socialName).toBe('Tech Consulting Iberia Sociedad Limitada');
    expect(empresa.cifNif).toBe('B-84920194');
    expect(empresa.delegations).toHaveLength(1);
    expect(empresa.contacts).toHaveLength(2);
    expect(empresa.commercialConditions?.discountPercent).toBe(10);
  });

  it('2. Debe calcular los niveles de fidelización VIP (Bronce, Plata, Oro, Platino)', () => {
    expect(CRMService.calculateTier(100, 2)).toBe('BRONCE');
    expect(CRMService.calculateTier(350, 5)).toBe('PLATA');
    expect(CRMService.calculateTier(800, 10)).toBe('ORO');
    expect(CRMService.calculateTier(1600, 30)).toBe('PLATINO');
  });

  it('3. Debe acumular puntos y cashback en compras y actualizar la ficha del cliente', () => {
    const customer = INITIAL_CUSTOMERS[2]; // Ana (Bronce)
    const updated = CRMService.processPurchase(customer, 100.0, 'TICK-9001', 'Cena Almuerzo');

    expect(updated.loyalty.points).toBe(customer.loyalty.points + 100);
    // 2% cashback for Bronce = 2.0€
    expect(updated.loyalty.cashbackBalance).toBe(Number((customer.loyalty.cashbackBalance + 2.0).toFixed(2)));
    expect(updated.loyalty.totalSpentLifetime).toBe(customer.loyalty.totalSpentLifetime + 100.0);
    expect(updated.history[0].referenceNumber).toBe('TICK-9001');
  });

  it('4. Debe procesar recargas de monedero y canje de puntos por descuentos', () => {
    const customer = INITIAL_CUSTOMERS[0];
    const withMonedero = CRMService.topUpMonedero(customer, 50.0, 'Tarjeta');

    expect(withMonedero.loyalty.monederoBalance).toBe(customer.loyalty.monederoBalance + 50.0);

    const { updatedCustomer, discountValue } = CRMService.redeemPoints(withMonedero, 200);
    expect(discountValue).toBe(10.0); // 200 points = 10€
    expect(updatedCustomer.loyalty.points).toBe(withMonedero.loyalty.points - 200);
  });

  it('5. Debe realizar búsqueda ultra rápida por nombre, CIF/NIF, teléfono y etiquetas', () => {
    const searchByName = CRMService.searchCustomers(INITIAL_CUSTOMERS, 'Carlos');
    expect(searchByName).toHaveLength(1);
    expect(searchByName[0].name).toBe('Carlos');

    const searchByCif = CRMService.searchCustomers(INITIAL_CUSTOMERS, 'B-84920194');
    expect(searchByCif).toHaveLength(1);
    expect(searchByCif[0].id).toBe('cli-002');

    const searchByTag = CRMService.searchCustomers(INITIAL_CUSTOMERS, 'Vinos');
    expect(searchByTag).toHaveLength(1);
  });

  it('6. Debe segmentar automáticamente clientes para campañas de marketing', () => {
    const inactiveSegment = CRMService.segmentCustomers(INITIAL_CUSTOMERS, {
      lastVisitDaysAgo: 60,
    });
    expect(inactiveSegment.length).toBeGreaterThanOrEqual(1);

    const vipSegment = CRMService.segmentCustomers(INITIAL_CUSTOMERS, {
      isVipOnly: true,
    });
    expect(vipSegment.every((c) => c.isVip)).toBe(true);
  });

  it('7. Debe cumplir con la normativa RGPD: exportación de datos y Derecho al Olvido (Anonimización)', () => {
    const customer = INITIAL_CUSTOMERS[0];
    const rgpdExport = CRMService.exportRGPDDataPackage(customer);

    expect(rgpdExport.exportMetadata.system).toContain('HOSERP Enterprise');
    expect(rgpdExport.customerProfile.cifNif).toBe(customer.cifNif);

    const anonymized = CRMService.anonymizeCustomer(customer);
    expect(anonymized.name).toBe('ANÓNIMO (RGPD)');
    expect(anonymized.email).toContain('rgpd-deleted');
    expect(anonymized.active).toBe(false);
    expect(anonymized.history[0].referenceNumber).toBe('RGPD-RIGHT-TO-FORGET');
  });

  it('8. Debe generar predicciones de IA con Gemini para detección de Churn y recomendaciones', () => {
    const predictions = CRMService.generateAIPredictions(INITIAL_CUSTOMERS);

    expect(predictions).toHaveLength(INITIAL_CUSTOMERS.length);
    const inactivePrediction = predictions.find((p) => p.customerId === 'cli-003');
    expect(inactivePrediction?.churnRiskScore).toBeGreaterThan(70);
    expect(inactivePrediction?.aiExplanation).toBeDefined();
  });

  it('9. Debe importar clientes desde cadenas CSV correctamente', () => {
    const csvData = `Nombre,CIF/NIF,Email,Teléfono,Población,Provincia
Roberto Gómez,77889900K,roberto@test.com,611223344,Sevilla,Sevilla
Restaurante El Faro S.L.,B-99887766,contacto@elfaro.com,954000111,Sevilla,Sevilla`;

    const imported = CRMService.importCustomersFromCSV(csvData);
    expect(imported).toHaveLength(2);
    expect(imported[0].type).toBe('PERSONA');
    expect(imported[0].name).toBe('Roberto Gómez');
    expect(imported[1].type).toBe('EMPRESA');
    expect(imported[1].cifNif).toBe('B-99887766');
  });
});
