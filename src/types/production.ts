export type RecipeType = 'SEMIELABORADO' | 'ELABORADO';
export type RecipeStatus = 'BORRADOR' | 'ACTIVA' | 'ARCHIVADA';

export type UEAllergen =
  | 'Gluten'
  | 'Crustáceos'
  | 'Huevos'
  | 'Pescado'
  | 'Cacahuetes'
  | 'Soja'
  | 'Lácteos'
  | 'Frutos de cáscara'
  | 'Apio'
  | 'Mostaza'
  | 'Sésamo'
  | 'Sulfitos'
  | 'Altramuces'
  | 'Moluscos';

export interface NutritionalInfo {
  calories: number; // kcal
  proteins: number; // g
  carbs: number; // g
  fats: number; // g
}

export interface RecipeIngredient {
  id: string;
  articleId: string;
  articleName: string;
  quantity: number;
  unit: string; // kg, g, l, ml, ud
  wastePercent: number; // Merma % (e.g. 10%)
  unitCost: number;
  totalCost: number;
  isOptional?: boolean;
  substitutions?: string[];
  allergens?: UEAllergen[];
}

export interface RecipeSubRecipe {
  id: string;
  subRecipeId: string;
  subRecipeName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface RecipePackaging {
  id: string;
  articleId: string;
  articleName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface RecipeHistoricalCost {
  date: string;
  cost: number;
  reason: string;
}

export interface Recipe {
  id: string; // UUID
  code: string; // REC-2026-001
  name: string;
  shortName: string;
  family: string;
  subfamily?: string;
  category: string;
  type: RecipeType;
  description: string;
  photoUrl: string;
  prepTime: number; // mins
  cookTime: number; // mins
  portions: number; // Raciones obtenidas
  theoreticalCost: number; // Coste teórico escandallo
  realCost: number; // Coste real post-producción
  grossMargin: number; // Margen bruto %
  netMargin: number; // Margen neto %
  recommendedPrice: number;
  vatRate: number; // e.g. 10%
  status: RecipeStatus;
  ingredients: RecipeIngredient[];
  subRecipes: RecipeSubRecipe[];
  packaging: RecipePackaging[];
  allergensUE: UEAllergen[];
  nutritionalInfo: NutritionalInfo;
  historicalCosts: RecipeHistoricalCost[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductionOrderStatus =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'EN_PRODUCCION'
  | 'FINALIZADA'
  | 'CANCELADA';

export interface ProductionConsumedItem {
  articleId: string;
  articleName: string;
  expectedQuantity: number;
  actualQuantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
}

export interface ProductionOrder {
  id: string; // UUID
  orderCode: string; // ORD-PROD-2026-001
  recipeId: string;
  recipeName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  targetQuantity: number; // Raciones o unidades a fabricar
  unit: string;
  status: ProductionOrderStatus;
  operatorName: string;
  startTime?: string;
  endTime?: string;
  batchNumber?: string;
  expirationDate?: string;
  incidents?: string;
  theoreticalCost: number;
  realCost: number;
  consumedItems: ProductionConsumedItem[];
  obtainedOutput: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductionBatchStatus = 'ACTIVO' | 'CADUCADO' | 'AGOTADO';

export interface ProductionBatch {
  id: string;
  batchNumber: string; // LOTE-20260731-001
  recipeId: string;
  recipeName: string;
  manufacturingDate: string;
  expirationDate: string;
  operatorName: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  status: ProductionBatchStatus;
  traceabilityLog: string[];
  createdAt: string;
}

export type WasteReason =
  | 'ROTURA'
  | 'DESPERDICIO'
  | 'CADUCIDAD'
  | 'ERROR_COCINA'
  | 'ERROR_FABRICACION'
  | 'DEFECTUOSO';

export interface ProductionWaste {
  id: string;
  date: string;
  recipeId?: string;
  recipeName?: string;
  articleId: string;
  articleName: string;
  quantity: number;
  unit: string;
  reason: WasteReason;
  cost: number;
  operatorName: string;
  notes?: string;
  createdAt: string;
}

export interface ProductionPlan {
  id: string;
  title: string;
  periodType: 'DIARIA' | 'SEMANAL' | 'MENSUAL';
  startDate: string;
  endDate: string;
  orderIds: string[];
  capacityPercentage: number;
  notes?: string;
}

export interface AIProductionInsight {
  id: string;
  type:
    | 'PREDICCION_CONSUMO'
    | 'PREDICCION_ROTURA'
    | 'OPTIMIZACION_COSTE'
    | 'DESPERDICIO_DETECTADO'
    | 'RECOMENDACION_COMPRA'
    | 'RECOMENDACION_PRODUCCION';
  title: string;
  description: string;
  confidenceScore: number; // 0-100%
  recommendedAction: string;
  explanation: string;
}
