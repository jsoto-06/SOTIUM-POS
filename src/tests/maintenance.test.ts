import { describe, it, expect, beforeEach } from 'vitest';
import { MaintenanceService } from '../services/maintenanceService';
import { MaintenanceAIService } from '../services/maintenanceAIService';
import { Asset, PreventivePlan, Incident, WorkOrder, SATIntervention } from '../types/maintenance';

describe('FASE 21 - Mantenimiento, Activos, SAT y Gestión Técnica Enterprise', () => {
  beforeEach(() => {
    // Reset or ensure service has initial assets
  });

  it('1. Debe listar y realizar búsquedas ultra-rápidas en activos por código, serie, marca y ubicación', () => {
    const allAssets = MaintenanceService.getAssets();
    expect(allAssets.length).toBeGreaterThanOrEqual(5);

    // Search by internal code
    const foundByCode = MaintenanceService.searchAssets('ACT-001');
    expect(foundByCode.length).toBe(1);
    expect(foundByCode[0].name).toContain('TPV Principal');

    // Search by serial number
    const foundBySerial = MaintenanceService.searchAssets('RAT-2023-994182');
    expect(foundBySerial.length).toBe(1);
    expect(foundBySerial[0].brand).toBe('Rational');

    // Search by location
    const foundByLocation = MaintenanceService.searchAssets('Barra Principal');
    expect(foundByLocation.length).toBe(1);
  });

  it('2. Debe dar de alta un nuevo activo con todos los metadatos requeridos', () => {
    const newAssetData: Omit<Asset, 'id'> = {
      internalCode: 'ACT-999',
      barcode: '840000009999',
      qrCode: 'QR-ACT-999',
      nfcCode: 'NFC-999',
      name: 'Freidora Industrial 20L',
      description: 'Freidora Eléctrica Doble Seno Inox',
      type: 'FREIDORA',
      brand: 'Movilfrit',
      model: 'FH-2020',
      serialNumber: 'SN-FRE-8841',
      supplierId: 'sup-102',
      supplierName: 'Maquinaria Hostelería Sur',
      purchaseDate: '2025-01-10',
      invoiceNumber: 'FAC-2025-11',
      warrantyExpirationDate: '2027-01-10',
      purchaseValue: 2400.0,
      currentValue: 2100.0,
      costCenter: 'CC-COCINA',
      companyId: 'comp-001',
      venueId: 'sed-001',
      department: 'Cocina',
      location: 'Zona Freidoras',
      responsiblePerson: 'Chef Elena R.',
      status: 'OPERATIVO',
      notes: 'Instalada y probada.',
      photos: [],
      documents: [],
      operatingHours: 500,
    };

    const created = MaintenanceService.createAsset(newAssetData, 'Test Runner');
    expect(created.id).toBeDefined();
    expect(created.internalCode).toBe('ACT-999');

    const fetched = MaintenanceService.getAssetById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe('Freidora Industrial 20L');
  });

  it('3. Debe crear y ejecutar un plan de mantenimiento preventivo generando una Orden de Trabajo', () => {
    const plans = MaintenanceService.getPreventivePlans();
    expect(plans.length).toBeGreaterThan(0);

    const plan = plans[0];
    const wo = MaintenanceService.executePreventivePlan(plan.id, '2026-08-01', 'Ejecución de test');

    expect(wo).toBeDefined();
    expect(wo.type).toBe('PREVENTIVO');
    expect(wo.assetId).toBe(plan.assetId);
    expect(wo.status).toBe('EN_CURSO');
  });

  it('4. Debe registrar una incidencia/avería correctiva y actualizar el estado del activo', () => {
    const assets = MaintenanceService.getAssets();
    const targetAsset = assets[0];

    const incident = MaintenanceService.createIncident({
      assetId: targetAsset.id,
      assetName: targetAsset.name,
      title: 'Fallo táctil en pantalla TPV',
      priority: 'CRITICA',
      description: 'La pantalla no responde al toque en la esquina derecha.',
      photos: [],
      videos: [],
      documents: [],
      responsiblePerson: 'Carlos M.',
      timeSpentMinutes: 0,
      usedMaterials: [],
      laborCost: 0,
      materialCost: 0,
      totalCost: 0,
    });

    expect(incident.status).toBe('ABIERTA');
    expect(incident.priority).toBe('CRITICA');

    // Asset status should update to EN_REPARACION for critical priority
    const updatedAsset = MaintenanceService.getAssetById(targetAsset.id);
    expect(updatedAsset?.status).toBe('EN_REPARACION');

    // Close incident
    const closed = MaintenanceService.closeIncident(incident.id, 'Pantalla recalibrada');
    expect(closed.status).toBe('RESUELTA');
    expect(closed.closeDate).toBeDefined();
  });

  it('5. Debe gestionar el ciclo de vida de una Orden de Trabajo y descontar repuestos del stock al finalizar', () => {
    const spareParts = MaintenanceService.getSpareParts();
    const targetSpare = spareParts[0];
    const initialStock = targetSpare.stock;

    const wo = MaintenanceService.createWorkOrder({
      assetId: 'ast-101',
      assetName: 'TPV Principal Barra 1',
      type: 'CORRECTIVO',
      priority: 'ALTA',
      status: 'EN_CURSO',
      technicianName: 'Antonio Valero',
      scheduledDate: '2026-08-01',
      scheduledTime: '10:00',
      spareParts: [
        {
          sparePartId: targetSpare.id,
          code: targetSpare.code,
          name: targetSpare.name,
          quantity: 1,
          unitCost: targetSpare.cost,
          totalCost: targetSpare.cost,
        },
      ],
      laborHours: 2,
      laborRate: 40,
      totalLaborCost: 80,
      totalCost: 80 + targetSpare.cost,
      checklist: [],
      observations: 'Sustitución de componente',
      photos: [],
      companyId: 'comp-001',
      venueId: 'sed-001',
    });

    expect(wo.status).toBe('EN_CURSO');

    // Transition to FINALIZADA
    const finalized = MaintenanceService.updateWorkOrderStatus(wo.id, 'FINALIZADA', 'Test Runner');
    expect(finalized.status).toBe('FINALIZADA');

    // Verify stock deduction
    const afterSpare = MaintenanceService.getSpareParts().find((s) => s.id === targetSpare.id);
    expect(afterSpare?.stock).toBe(initialStock - 1);
  });

  it('6. Debe calcular diagnósticos predictivos de IA Gemini para activos', async () => {
    const assets = MaintenanceService.getAssets();
    const incidents = MaintenanceService.getIncidents();
    const wos = MaintenanceService.getWorkOrders();

    const insights = await MaintenanceAIService.analyzeAssetMaintenance(assets, incidents, wos);
    expect(insights.length).toBe(assets.length);

    insights.forEach((ins) => {
      expect(ins.anomalyScore).toBeGreaterThanOrEqual(0);
      expect(ins.anomalyScore).toBeLessThanOrEqual(100);
      expect(ins.predictiveBreakdownDate).toBeDefined();
      expect(ins.explanation).toBeDefined();
      expect(ins.recommendations.length).toBeGreaterThan(0);
    });
  });

  it('7. Debe exportar listado de activos y órdenes de trabajo a CSV correctamente', () => {
    const csvAssets = MaintenanceService.exportAssetsCSV();
    expect(csvAssets).toContain('ID,Codigo,Nombre,Tipo');
    expect(csvAssets).toContain('ACT-001');

    const csvWos = MaintenanceService.exportWorkOrdersCSV();
    expect(csvWos).toContain('Codigo,Activo,Tipo,Prioridad');
    expect(csvWos).toContain('OT-2026-0881');
  });
});
