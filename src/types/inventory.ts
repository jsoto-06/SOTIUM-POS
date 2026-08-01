export type ArticleType =
  | 'PRODUCTO'
  | 'INGREDIENTE'
  | 'MATERIA_PRIMA'
  | 'ELABORADO'
  | 'SEMIELABORADO'
  | 'ENVASES'
  | 'CONSUMIBLES'
  | 'SERVICIOS';

export type ArticleUnit = 'kg' | 'g' | 'l' | 'ml' | 'ud' | 'caja' | 'pack' | 'metro';

export interface Article {
  id: string; // UUID
  internalCode: string;
  barcode: string;
  ean13: string;
  ean128: string;
  qrCode: string;
  name: string;
  shortName: string;
  description: string;
  photoUrl: string;
  family: string;
  subfamily: string;
  type: ArticleType;
  primarySupplier: string;
  secondarySupplier?: string;
  brand: string;
  unit: ArticleUnit;
  vatRate: number; // e.g., 21, 10, 4, 0
  purchasePrice: number;
  averagePrice: number;
  lastPrice: number;
  salePrice: number;
  cost: number;
  margin: number; // %
  minStock: number;
  maxStock: number;
  safetyStock: number;
  hasExpiration: boolean;
  hasBatchControl: boolean;
  active: boolean;
  notes?: string;
  stock?: number; // Total aggregated stock across warehouses
}

export type WarehouseType =
  | 'PRINCIPAL'
  | 'CAMARA'
  | 'CONGELADOR'
  | 'BARRA'
  | 'TERRAZA'
  | 'BODEGA'
  | 'ECONOMATO'
  | 'OTRO';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: WarehouseType;
  description?: string;
  isDefault?: boolean;
  active: boolean;
  capacityPercentage?: number;
}

export interface BatchControl {
  id: string;
  articleId: string;
  articleName: string;
  batchNumber: string;
  manufacturingDate: string;
  expirationDate: string;
  warehouseId: string;
  warehouseName: string;
  initialQuantity: number;
  currentQuantity: number;
  costPrice: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
}

export type StockMovementType =
  | 'ENTRADA'
  | 'SALIDA'
  | 'TRANSFERENCIA'
  | 'AJUSTE'
  | 'REGULARIZACION'
  | 'INVENTARIO'
  | 'ROTURA'
  | 'MERMA'
  | 'AUTOCONSUMO'
  | 'DEVOLUCION';

export type MermaReason =
  | 'ROTURA'
  | 'DESPERDICIO'
  | 'CADUCIDAD'
  | 'ERROR_COCINA'
  | 'INVITACION'
  | 'PERSONAL';

export interface StockMovementRecord {
  id: string;
  articleId: string;
  articleName: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  cost: number;
  totalValue: number;
  sourceWarehouseId?: string;
  sourceWarehouseName?: string;
  targetWarehouseId?: string;
  targetWarehouseName?: string;
  batchNumber?: string;
  reason?: MermaReason | string;
  user: string;
  date: string;
  referenceDoc?: string;
  notes?: string;
}

export type InventoryMode = 'COMPLETE' | 'PARTIAL' | 'FAMILY' | 'BLIND';

export interface InventoryItemCount {
  articleId: string;
  articleName: string;
  expectedStock: number;
  countedStock: number;
  difference: number;
  unitCost: number;
  differenceValue: number;
  notes?: string;
}

export interface InventorySession {
  id: string;
  inventoryNumber: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  mode: InventoryMode;
  familyFilter?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'REGULARIZED';
  createdBy: string;
  completedBy?: string;
  items: InventoryItemCount[];
  totalDiffValue?: number;
}

export interface WarehouseTransfer {
  id: string;
  transferNumber: string;
  date: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  status: 'PENDING' | 'TRANSIT' | 'COMPLETED' | 'CANCELLED';
  requestedBy: string;
  approvedBy?: string;
  items: {
    articleId: string;
    articleName: string;
    quantity: number;
    unit: string;
    batchNumber?: string;
  }[];
  notes?: string;
}

export interface InventoryAnalytics {
  totalValuation: number;
  totalArticlesCount: number;
  lowStockCount: number;
  expiredBatchesCount: number;
  expiringSoonBatchesCount: number;
  rotationIndex: number;
  inmobilizedStockValue: number;
  valuationByWarehouse: { warehouseName: string; totalValue: number }[];
  valuationByFamily: { familyName: string; totalValue: number }[];
  topConsumedArticles: { articleName: string; quantity: number; totalCost: number }[];
}
