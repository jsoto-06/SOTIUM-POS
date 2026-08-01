import { describe, it, expect } from 'vitest';
import { PurchasesService } from '../services/purchasesService';
import { Supplier, PurchaseOrder, PurchaseOrderLine, SupplierDeliveryNote } from '../types/purchases';
import { Article } from '../types/inventory';
import { INITIAL_SUPPLIERS, INITIAL_PURCHASE_ORDERS, INITIAL_SUPPLIER_INVOICES } from '../data/purchasesData';
import { INITIAL_ARTICLES } from '../data/inventoryData';

describe('FASE 11: Módulo de Compras y Proveedores (Enterprise)', () => {
  it('1. Debe validar la estructura completa de fichas de proveedores', () => {
    const supplier: Supplier = INITIAL_SUPPLIERS[0];
    expect(supplier.id).toBeDefined();
    expect(supplier.socialName).toBe('Mahou San Miguel S.A.');
    expect(supplier.cifNif).toBe('A-28004812');
    expect(supplier.paymentMethod).toBe('TRANSFERENCIA');
    expect(supplier.paymentTermsDays).toBe(30);
    expect(supplier.deliveryDays).toContain('LUNES');
    expect(supplier.attachedDocs).toHaveLength(2);
    expect(supplier.historyLog).toHaveLength(2);
  });

  it('2. Debe calcular correctamente los totales y cuota de IVA en líneas de pedido', () => {
    const lines: PurchaseOrderLine[] = [
      {
        id: 'line-1',
        articleId: 'art-1',
        articleName: 'Cerveza Barril 50L',
        unit: 'ud',
        orderedQuantity: 2,
        receivedQuantity: 0,
        returnedQuantity: 0,
        unitPrice: 100.0,
        vatRate: 21,
        discountPercent: 10, // 100 * 2 * 0.9 = 180 base
        subtotal: 0,
        total: 0,
      },
    ];

    const totals = PurchasesService.calculateOrderTotals(lines);
    expect(totals.taxBase).toBe(180.0);
    expect(totals.vatTotal).toBe(37.8);
    expect(totals.grandTotal).toBe(217.8);
  });

  it('3. Debe procesar la recepción de mercancía y actualizar stock y coste medio (PMP)', () => {
    const order: PurchaseOrder = INITIAL_PURCHASE_ORDERS[0];
    const testArticle: Article = {
      ...INITIAL_ARTICLES[0],
      id: 'art-00102',
      stock: 10,
      averagePrice: 50.0,
      purchasePrice: 50.0,
    };

    const receptionPayload = [
      {
        lineId: order.lines[0].id,
        quantityReceived: 5,
        batchNumber: 'LOTE-TEST-001',
        expirationDate: '2026-12-31',
      },
    ];

    const result = PurchasesService.processOrderReception(order, receptionPayload, [testArticle]);

    expect(result.updatedOrder.status).toBe('RECEPCIONADO');
    expect(result.generatedDeliveryNote).toBeDefined();
    expect(result.generatedDeliveryNote.deliveryNumber).toContain('ALB-');

    const updatedArt = result.updatedArticles.find((a) => a.id === 'art-00102');
    expect(updatedArt).toBeDefined();
    expect(updatedArt?.stock).toBe(15); // 10 initial + 5 received
    expect(updatedArt?.lastPrice).toBe(75.0);
    // Weighted avg cost: ((10 * 50) + (5 * 75)) / 15 = (500 + 375) / 15 = 58.3333
    expect(updatedArt?.averagePrice).toBeCloseTo(58.3333, 2);
  });

  it('4. Debe convertir albaranes de entrega en facturas de proveedor con vencimientos asociados', () => {
    const supplier = INITIAL_SUPPLIERS[0];
    const deliveryNote: SupplierDeliveryNote = {
      id: 'alb-test',
      deliveryNumber: 'ALB-TEST-100',
      supplierId: supplier.id,
      supplierName: supplier.socialName,
      warehouseId: 'wh-1',
      warehouseName: 'Almacén Principal',
      date: '2026-02-15',
      lines: [],
      taxBase: 1000.0,
      vatTotal: 210.0,
      grandTotal: 1210.0,
      status: 'PENDIENTE_FACTURAR',
    };

    const futureDueDate = new Date(Date.now() + 86400000 * 30).toISOString().substring(0, 10);

    const { invoice, expiration } = PurchasesService.createSupplierInvoice(
      supplier,
      'FACT-SUP-9901',
      '2026-02-15',
      futureDueDate,
      [deliveryNote],
      []
    );

    expect(invoice.invoiceNumber).toBe('FACT-SUP-9901');
    expect(invoice.grandTotal).toBe(1210.0);
    expect(expiration.amount).toBe(1210.0);
    expect(expiration.status).toBe('PENDIENTE');
  });

  it('5. Debe procesar devoluciones a proveedor y descontar existencias', () => {
    const testArticle: Article = {
      ...INITIAL_ARTICLES[0],
      id: 'art-ret-1',
      stock: 20,
    };

    const supplierReturn = {
      id: 'ret-1',
      returnNumber: 'DEV-001',
      supplierId: 'sup-1',
      supplierName: 'Proveedor Test',
      warehouseId: 'wh-1',
      warehouseName: 'Almacén Principal',
      date: '2026-02-15',
      reason: 'Empaque roto',
      lines: [
        {
          articleId: 'art-ret-1',
          articleName: 'Articulo Test',
          quantity: 4,
          unitPrice: 10,
          total: 40,
        },
      ],
      grandTotal: 40,
      status: 'REGISTRADO' as const,
    };

    const updatedArticles = PurchasesService.processSupplierReturn(supplierReturn, [testArticle]);
    expect(updatedArticles[0].stock).toBe(16); // 20 - 4 = 16
  });

  it('6. Debe comparar el histórico de precios y calcular desviaciones de coste', () => {
    const articles: Article[] = [
      {
        ...INITIAL_ARTICLES[0],
        id: 'art-comp-1',
        name: 'Solomillo Vaca',
        unit: 'kg',
        purchasePrice: 20.0,
        averagePrice: 20.0,
      },
    ];

    const orders: PurchaseOrder[] = [
      {
        ...INITIAL_PURCHASE_ORDERS[0],
        lines: [
          {
            id: 'l1',
            articleId: 'art-comp-1',
            articleName: 'Solomillo Vaca',
            unit: 'kg',
            orderedQuantity: 10,
            receivedQuantity: 10,
            returnedQuantity: 0,
            unitPrice: 25.0,
            vatRate: 10,
            discountPercent: 0,
            subtotal: 250,
            total: 275,
          },
        ],
      },
    ];

    const comparisons = PurchasesService.getPriceComparisons(articles, orders, INITIAL_SUPPLIERS);
    expect(comparisons).toHaveLength(1);
    expect(comparisons[0].lowestPrice).toBe(20.0);
    expect(comparisons[0].highestPrice).toBe(25.0);
    expect(comparisons[0].priceVariancePercent).toBe(25.0); // (25-20)/20 = 25%
  });

  it('7. Debe sugerir pedidos de reposición mediante IA según niveles de stock mínimo', () => {
    const criticalArticle: Article = {
      ...INITIAL_ARTICLES[0],
      id: 'art-crit',
      name: 'Aceite de Oliva Extra Virgen 5L',
      stock: 1, // Stock actual
      minStock: 5,
      safetyStock: 3,
      maxStock: 15,
      family: 'Aceites',
    };

    const recs = PurchasesService.getAIPurchaseRecommendations([criticalArticle], INITIAL_SUPPLIERS);
    expect(recs).toHaveLength(1);
    expect(recs[0].suggestedQuantity).toBe(14); // maxStock (15) - currentStock (1) = 14
    expect(recs[0].stockoutRiskDays).toBe(1); // critical because stock (1) <= safetyStock (3)
  });

  it('8. Debe calcular analíticas generales de compras (proveedores, familias y ahorros)', () => {
    const analytics = PurchasesService.computeAnalytics(INITIAL_PURCHASE_ORDERS, INITIAL_SUPPLIERS);
    expect(analytics.totalPurchasesValuation).toBeGreaterThan(0);
    expect(analytics.purchasesBySupplier.length).toBeGreaterThan(0);
    expect(analytics.rotationRate).toBe(4.8);
  });

  it('9. Debe crear y convertir solicitudes de compra en pedidos formalizados', () => {
    const requestData = {
      requestorName: 'Chef Pastelería',
      department: 'Cocina',
      warehouseId: 'wh-001',
      warehouseName: 'Almacén Principal',
      urgency: 'ALTA' as const,
      lines: [
        {
          id: 'prl-test',
          articleId: 'art-00101',
          articleName: 'Arroz Bomba',
          unit: 'kg',
          requestedQuantity: 50,
          estimatedUnitPrice: 2.8,
          total: 140.0,
        },
      ],
      estimatedTotal: 140.0,
      notes: 'Reposición urgente',
    };

    const request = PurchasesService.createPurchaseRequest(requestData);
    expect(request.id).toContain('req-');
    expect(request.requestCode).toContain('SOL-2026-');
    expect(request.status).toBe('PENDIENTE');

    const supplier = INITIAL_SUPPLIERS[0];
    const convertedOrder = PurchasesService.convertRequestToOrder(request, supplier);
    expect(convertedOrder.orderNumber).toContain('PED-2026-');
    expect(convertedOrder.requestId).toBe(request.id);
    expect(convertedOrder.lines[0].orderedQuantity).toBe(50);
  });

  it('10. Debe realizar conciliación tripartita 3-Way Matching y detectar descuadres', () => {
    const order = INITIAL_PURCHASE_ORDERS[0];
    const reconciliation = PurchasesService.performThreeWayMatch(order);
    expect(reconciliation.isMatched).toBe(true);
    expect(reconciliation.status).toBe('CONCILIADO');

    const mismatchedInvoice = {
      ...INITIAL_SUPPLIER_INVOICES[0],
      grandTotal: 9999.0, // Mismatched price
    };

    const reconciliationWithMismatch = PurchasesService.performThreeWayMatch(order, undefined, mismatchedInvoice);
    expect(reconciliationWithMismatch.isMatched).toBe(false);
    expect(reconciliationWithMismatch.status).toBe('DESVIACION_DETECTADA');
    expect(reconciliationWithMismatch.discrepanciesDetails.length).toBeGreaterThan(0);
  });

  it('11. Debe detectar sobrecostes y anomalías de precios en compras', () => {
    const abnormalOrder: PurchaseOrder = {
      ...INITIAL_PURCHASE_ORDERS[0],
      lines: [
        {
          id: 'anom-line',
          articleId: 'art-00102',
          articleName: 'Barril Cerveza 50L',
          unit: 'ud',
          orderedQuantity: 10,
          receivedQuantity: 0,
          returnedQuantity: 0,
          unitPrice: 150.0, // Expected 75€ -> 100% inflation
          vatRate: 21,
          discountPercent: 0,
          subtotal: 1500,
          total: 1815,
        },
      ],
    };

    const testArticles: Article[] = [
      {
        ...INITIAL_ARTICLES[0],
        id: 'art-00102',
        purchasePrice: 75.0,
      },
    ];

    const anomalies = PurchasesService.detectCostAnomalies([abnormalOrder], testArticles);
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0].type).toBe('SOBRECOSTE_PRECIO');
    expect(anomalies[0].variancePercent).toBe(100);
  });
});

