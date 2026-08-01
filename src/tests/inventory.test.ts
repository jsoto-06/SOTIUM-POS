import { describe, it, expect } from 'vitest';
import {
  getBatchExpirationStatus,
  sortBatchesFEFO,
  sortBatchesFIFO,
  recalculateProductEscandalloCosts,
  calculateInventoryAnalytics,
  exportArticlesToCSV,
} from '../services/inventoryService';
import { INITIAL_ARTICLES, INITIAL_BATCHES, INITIAL_STOCK_MOVEMENTS } from '../data/inventoryData';
import { Product } from '../types/pos';
import { Article, BatchControl, StockMovementRecord } from '../types/inventory';

describe('FASE 10 - Almacén Enterprise Unit & Business Logic Tests', () => {
  it('should classify batch expiration dates correctly', () => {
    const today = new Date();
    const expiredDate = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
    const urgentDate = new Date(today.getTime() + 86400000 * 3).toISOString().split('T')[0];
    const warningDate = new Date(today.getTime() + 86400000 * 10).toISOString().split('T')[0];
    const okDate = new Date(today.getTime() + 86400000 * 30).toISOString().split('T')[0];

    expect(getBatchExpirationStatus(expiredDate)).toBe('EXPIRED');
    expect(getBatchExpirationStatus(urgentDate)).toBe('URGENT');
    expect(getBatchExpirationStatus(warningDate)).toBe('WARNING');
    expect(getBatchExpirationStatus(okDate)).toBe('OK');
  });

  it('should sort batches using FEFO (First Expired First Out)', () => {
    const batch1: BatchControl = {
      id: 'b1',
      articleId: 'art-1',
      articleName: 'Art 1',
      batchNumber: 'LOT-1',
      manufacturingDate: '2026-01-01',
      expirationDate: '2026-10-01',
      warehouseId: 'wh1',
      warehouseName: 'Wh 1',
      initialQuantity: 10,
      currentQuantity: 10,
      costPrice: 5,
      status: 'ACTIVE',
    };

    const batch2: BatchControl = {
      id: 'b2',
      articleId: 'art-1',
      articleName: 'Art 1',
      batchNumber: 'LOT-2',
      manufacturingDate: '2026-01-05',
      expirationDate: '2026-08-01', // Earlier expiration
      warehouseId: 'wh1',
      warehouseName: 'Wh 1',
      initialQuantity: 10,
      currentQuantity: 10,
      costPrice: 5,
      status: 'ACTIVE',
    };

    const sorted = sortBatchesFEFO([batch1, batch2]);
    expect(sorted[0].id).toBe('b2');
    expect(sorted[1].id).toBe('b1');
  });

  it('should recalculate product escandallo costs based on article cost updates', () => {
    const mockProducts: Product[] = [
      {
        id: 'prod-test',
        name: 'Paella Test',
        categoryId: 'cat-1',
        price: 20.0,
        vatRate: 10,
        costPrice: 0,
        isFavorite: true,
        stock: 50,
        minStock: 5,
        barcode: '84100',
        photoUrl: '',
        ingredients: [],
        printerTarget: 'COCINA_CALIENTE',
        escandallo: [
          {
            ingredientId: 'art-101',
            ingredientName: 'Arroz Bomba D.O. Valencia (Saco 5kg)',
            quantity: 0.2,
            unit: 'kg',
            unitCost: 2.0, // outdated cost
            totalCost: 0.4,
          },
        ],
      },
    ];

    const mockArticles: Article[] = [
      {
        id: 'art-101',
        internalCode: 'ART-101',
        barcode: '84100',
        ean13: '84100',
        ean128: '',
        qrCode: '',
        name: 'Arroz Bomba D.O. Valencia (Saco 5kg)',
        shortName: 'Arroz',
        description: '',
        photoUrl: '',
        family: 'Grano',
        subfamily: 'Arroz',
        type: 'MATERIA_PRIMA',
        primarySupplier: 'Proveedor',
        brand: '',
        unit: 'kg',
        vatRate: 4,
        purchasePrice: 3.0, // updated purchase price
        averagePrice: 3.0,
        lastPrice: 3.0,
        salePrice: 0,
        cost: 3.0, // updated cost
        margin: 0,
        minStock: 10,
        maxStock: 50,
        safetyStock: 10,
        hasExpiration: true,
        hasBatchControl: true,
        active: true,
      },
    ];

    const recalculated = recalculateProductEscandalloCosts(mockProducts, mockArticles);
    expect(recalculated[0].escandallo![0].unitCost).toBe(3.0);
    expect(recalculated[0].escandallo![0].totalCost).toBe(0.6);
    expect(recalculated[0].costPrice).toBe(0.6);
  });

  it('should calculate complete inventory analytics valuation and top consumed items', () => {
    const analytics = calculateInventoryAnalytics(INITIAL_ARTICLES, INITIAL_BATCHES, INITIAL_STOCK_MOVEMENTS);

    expect(analytics.totalValuation).toBeGreaterThan(0);
    expect(analytics.totalArticlesCount).toBe(INITIAL_ARTICLES.length);
    expect(analytics.valuationByWarehouse.length).toBeGreaterThan(0);
    expect(analytics.valuationByFamily.length).toBeGreaterThan(0);
  });

  it('should export articles correctly to CSV string format', () => {
    const csv = exportArticlesToCSV(INITIAL_ARTICLES);
    expect(csv).toContain('UUID,Codigo_Interno,Codigo_Barras');
    expect(csv).toContain('ART-00101');
    expect(csv).toContain('Arroz Bomba D.O. Valencia (Saco 5kg)');
  });
});
