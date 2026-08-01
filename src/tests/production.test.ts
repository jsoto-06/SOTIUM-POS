import { describe, it, expect } from 'vitest';
import { ProductionService } from '../services/productionService';
import { Recipe } from '../types/production';
import { Article } from '../types/inventory';
import { INITIAL_RECIPES } from '../data/productionData';

describe('FASE 20 - Production, Recipes & Manufacturing Enterprise System', () => {
  const sampleArticles: Article[] = [
    {
      id: 'art-101',
      internalCode: 'ART-101',
      barcode: '840000000101',
      ean13: '840000000101',
      ean128: '',
      qrCode: '',
      name: 'Harina de Fuerza 00',
      shortName: 'Harina 00',
      description: '',
      photoUrl: '',
      family: 'Panadería',
      subfamily: 'Harinas',
      type: 'INGREDIENTE',
      primarySupplier: 'Harinas Molino',
      brand: 'Molino',
      unit: 'kg',
      vatRate: 10,
      purchasePrice: 1.2,
      averagePrice: 1.2,
      lastPrice: 1.2,
      salePrice: 0,
      cost: 1.2,
      margin: 50,
      minStock: 20,
      maxStock: 500,
      safetyStock: 10,
      hasExpiration: true,
      hasBatchControl: true,
      active: true,
      stock: 100,
    },
    {
      id: 'art-102',
      internalCode: 'ART-102',
      barcode: '840000000102',
      ean13: '840000000102',
      ean128: '',
      qrCode: '',
      name: 'Aceite de Oliva Extra',
      shortName: 'Aceite AOVE',
      description: '',
      photoUrl: '',
      family: 'Aceites',
      subfamily: 'Oliva',
      type: 'INGREDIENTE',
      primarySupplier: 'Aceites Sur',
      brand: 'Sur',
      unit: 'l',
      vatRate: 10,
      purchasePrice: 5.0,
      averagePrice: 5.0,
      lastPrice: 5.0,
      salePrice: 0,
      cost: 5.0,
      margin: 50,
      minStock: 10,
      maxStock: 200,
      safetyStock: 5,
      hasExpiration: true,
      hasBatchControl: true,
      active: true,
      stock: 50,
    },
  ];

  it('should calculate theoretical costs and margins correctly with waste factors', () => {
    const recipe: Recipe = {
      id: 'rec-test-1',
      code: 'REC-TEST',
      name: 'Masa Prueba',
      shortName: 'Masa',
      family: 'Bases',
      category: 'MASAS',
      type: 'SEMIELABORADO',
      description: 'Masa de prueba',
      photoUrl: '',
      prepTime: 10,
      cookTime: 0,
      portions: 10,
      theoreticalCost: 0,
      realCost: 0,
      grossMargin: 0,
      netMargin: 0,
      recommendedPrice: 20,
      vatRate: 10,
      status: 'ACTIVA',
      ingredients: [
        {
          id: 'ing-1',
          articleId: 'art-101',
          articleName: 'Harina de Fuerza 00',
          quantity: 5, // 5 kg * 1.2€ * 1.10 (10% waste) = 6.6€
          unit: 'kg',
          wastePercent: 10,
          unitCost: 1.2,
          totalCost: 6.6,
        },
      ],
      subRecipes: [],
      packaging: [],
      allergensUE: [],
      nutritionalInfo: { calories: 200, proteins: 5, carbs: 40, fats: 2 },
      historicalCosts: [],
      notes: '',
      createdAt: '2026-07-31T10:00:00Z',
      updatedAt: '2026-07-31T10:00:00Z',
    };

    const recalculated = ProductionService.calculateRecipeEscandallo(recipe, sampleArticles);
    expect(recalculated.theoreticalCost).toBe(6.6);
    expect(recalculated.grossMargin).toBeGreaterThan(0);
  });

  it('should simulate price hike impact accurately', () => {
    const baseRecipe = INITIAL_RECIPES[0];
    const sim = ProductionService.simulatePriceHikeImpact(baseRecipe, 10);

    expect(sim.projectedCost).toBe(Number((baseRecipe.theoreticalCost * 1.1).toFixed(2)));
    expect(sim.costIncrease).toBe(Number((sim.projectedCost - baseRecipe.theoreticalCost).toFixed(2)));
  });

  it('should create a production order and finalize it generating a new batch', () => {
    const recipe = INITIAL_RECIPES[0];
    const order = ProductionService.createProductionOrder(
      recipe,
      20,
      'wh-001',
      'Cámara Frigorífica',
      'Carlos M.'
    );

    expect(order.status).toBe('PENDIENTE');
    expect(order.targetQuantity).toBe(20);

    const { updatedOrder, newBatch } = ProductionService.finalizeProductionOrder(
      order,
      recipe,
      20,
      'Carlos M.'
    );

    expect(updatedOrder.status).toBe('FINALIZADA');
    expect(updatedOrder.obtainedOutput).toBe(20);
    expect(newBatch.initialQuantity).toBe(20);
    expect(newBatch.status).toBe('ACTIVO');
    expect(newBatch.batchNumber).toContain('LOTE-');
  });

  it('should register production waste correctly', () => {
    const waste = ProductionService.registerWaste({
      articleName: 'Harina 00',
      quantity: 2,
      unit: 'kg',
      reason: 'ERROR_COCINA',
      cost: 2.4,
      operatorName: 'Elena R.',
    });

    expect(waste.reason).toBe('ERROR_COCINA');
    expect(waste.cost).toBe(2.4);
    expect(waste.id).toContain('wst-');
  });
});
