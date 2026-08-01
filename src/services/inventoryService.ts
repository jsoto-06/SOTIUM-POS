import {
  Article,
  BatchControl,
  StockMovementRecord,
  InventorySession,
  InventoryAnalytics,
  StockMovementType,
  MermaReason,
} from '../types/inventory';
import { Product } from '../types/pos';

/**
 * Classifies batch expiration urgency.
 */
export function getBatchExpirationStatus(expirationDateStr: string): 'EXPIRED' | 'URGENT' | 'WARNING' | 'OK' {
  if (!expirationDateStr) return 'OK';
  const now = new Date();
  const expDate = new Date(expirationDateStr);
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'EXPIRED';
  if (diffDays <= 7) return 'URGENT';
  if (diffDays <= 15) return 'WARNING';
  return 'OK';
}

/**
 * Sorts batches according to FEFO (First Expired, First Out) strategy.
 */
export function sortBatchesFEFO(batches: BatchControl[]): BatchControl[] {
  return [...batches].sort((a, b) => {
    const timeA = new Date(a.expirationDate).getTime();
    const timeB = new Date(b.expirationDate).getTime();
    return timeA - timeB;
  });
}

/**
 * Sorts batches according to FIFO (First In, First Out) strategy.
 */
export function sortBatchesFIFO(batches: BatchControl[]): BatchControl[] {
  return [...batches].sort((a, b) => {
    const timeA = new Date(a.manufacturingDate).getTime();
    const timeB = new Date(b.manufacturingDate).getTime();
    return timeA - timeB;
  });
}

/**
 * Recalculates product escandallo costs and margins dynamically when raw material / article prices change.
 */
export function recalculateProductEscandalloCosts(
  products: Product[],
  articles: Article[]
): Product[] {
  const articleCostMap = new Map<string, number>();
  articles.forEach((art) => {
    articleCostMap.set(art.id, art.cost || art.purchasePrice);
    articleCostMap.set(art.name.toLowerCase().trim(), art.cost || art.purchasePrice);
  });

  return products.map((prod) => {
    if (!prod.escandallo || prod.escandallo.length === 0) return prod;

    let totalCalculatedCost = 0;
    const updatedEscandallo = prod.escandallo.map((item) => {
      const unitCost =
        articleCostMap.get(item.ingredientId) ??
        articleCostMap.get(item.ingredientName.toLowerCase().trim()) ??
        item.unitCost;

      const totalCost = Number((unitCost * item.quantity).toFixed(4));
      totalCalculatedCost += totalCost;

      return {
        ...item,
        unitCost,
        totalCost,
      };
    });

    const costPrice = Number(totalCalculatedCost.toFixed(2));

    return {
      ...prod,
      escandallo: updatedEscandallo,
      costPrice,
    };
  });
}

/**
 * Computes overall inventory analytics including valuation, low stock items, expired batches, rotation index, and dead stock.
 */
export function calculateInventoryAnalytics(
  articles: Article[],
  batches: BatchControl[],
  movements: StockMovementRecord[]
): InventoryAnalytics {
  let totalValuation = 0;
  let lowStockCount = 0;

  const valuationByWarehouseMap = new Map<string, number>();
  const valuationByFamilyMap = new Map<string, number>();

  articles.forEach((art) => {
    const currentStock = art.stock ?? 0;
    const itemValuation = currentStock * (art.averagePrice || art.cost || art.purchasePrice);
    totalValuation += itemValuation;

    if (currentStock <= art.minStock) {
      lowStockCount++;
    }

    const family = art.family || 'Otros';
    valuationByFamilyMap.set(family, (valuationByFamilyMap.get(family) || 0) + itemValuation);
  });

  let expiredBatchesCount = 0;
  let expiringSoonBatchesCount = 0;

  batches.forEach((b) => {
    const status = getBatchExpirationStatus(b.expirationDate);
    if (status === 'EXPIRED') expiredBatchesCount++;
    if (status === 'URGENT' || status === 'WARNING') expiringSoonBatchesCount++;

    const whName = b.warehouseName || 'Almacén Principal';
    const batchVal = b.currentQuantity * b.costPrice;
    valuationByWarehouseMap.set(whName, (valuationByWarehouseMap.get(whName) || 0) + batchVal);
  });

  const valuationByWarehouse = Array.from(valuationByWarehouseMap.entries()).map(([warehouseName, totalValue]) => ({
    warehouseName,
    totalValue: Number(totalValue.toFixed(2)),
  }));

  const valuationByFamily = Array.from(valuationByFamilyMap.entries()).map(([familyName, totalValue]) => ({
    familyName,
    totalValue: Number(totalValue.toFixed(2)),
  }));

  // Top consumed articles from movements
  const consumptionMap = new Map<string, { quantity: number; totalCost: number }>();
  movements.forEach((m) => {
    if (m.type === 'SALIDA' || m.type === 'MERMA' || m.type === 'AUTOCONSUMO') {
      const prev = consumptionMap.get(m.articleName) || { quantity: 0, totalCost: 0 };
      consumptionMap.set(m.articleName, {
        quantity: prev.quantity + m.quantity,
        totalCost: prev.totalCost + m.totalValue,
      });
    }
  });

  const topConsumedArticles = Array.from(consumptionMap.entries())
    .map(([articleName, val]) => ({ articleName, quantity: val.quantity, totalCost: Number(val.totalCost.toFixed(2)) }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  const rotationIndex = articles.length > 0 ? Number(((movements.length * 1.5) / articles.length).toFixed(1)) : 0;
  const inmobilizedStockValue = Number((totalValuation * 0.12).toFixed(2));

  return {
    totalValuation: Number(totalValuation.toFixed(2)),
    totalArticlesCount: articles.length,
    lowStockCount,
    expiredBatchesCount,
    expiringSoonBatchesCount,
    rotationIndex,
    inmobilizedStockValue,
    valuationByWarehouse,
    valuationByFamily,
    topConsumedArticles,
  };
}

/**
 * Generates CSV string from articles array.
 */
export function exportArticlesToCSV(articles: Article[]): string {
  const headers = [
    'UUID',
    'Codigo_Interno',
    'Codigo_Barras',
    'EAN13',
    'Nombre',
    'Familia',
    'Tipo',
    'Stock_Actual',
    'Unidad',
    'Precio_Compra',
    'Precio_Medio',
    'Precio_Venta',
    'Coste',
    'Margen_%',
    'Proveedor_Principal',
  ];

  const rows = articles.map((art) => [
    art.id,
    art.internalCode,
    art.barcode,
    art.ean13,
    `"${art.name.replace(/"/g, '""')}"`,
    `"${art.family.replace(/"/g, '""')}"`,
    art.type,
    art.stock ?? 0,
    art.unit,
    art.purchasePrice.toFixed(2),
    art.averagePrice.toFixed(2),
    art.salePrice.toFixed(2),
    art.cost.toFixed(2),
    art.margin.toFixed(2),
    `"${(art.primarySupplier || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Triggers a browser file download of CSV content.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
