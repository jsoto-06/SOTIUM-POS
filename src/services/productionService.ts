import {
  Recipe,
  RecipeIngredient,
  RecipeSubRecipe,
  RecipePackaging,
  ProductionOrder,
  ProductionConsumedItem,
  ProductionBatch,
  ProductionWaste,
  ProductionPlan,
  RecipeStatus,
  ProductionOrderStatus,
} from '../types/production';
import { Article } from '../types/inventory';
import { AuditService } from './auditService';
import { sortBatchesFEFO, sortBatchesFIFO } from './inventoryService';

export class ProductionService {
  /**
   * Recalculates multi-level recipe costs, margins, and yield per portion.
   */
  static calculateRecipeEscandallo(
    recipe: Recipe,
    articles: Article[],
    allRecipes: Recipe[] = []
  ): Recipe {
    const articleMap = new Map<string, Article>();
    articles.forEach((a) => articleMap.set(a.id, a));

    const recipeMap = new Map<string, Recipe>();
    allRecipes.forEach((r) => recipeMap.set(r.id, r));

    // 1. Calculate ingredients cost with waste percentage
    const updatedIngredients: RecipeIngredient[] = recipe.ingredients.map((ing) => {
      const art = articleMap.get(ing.articleId);
      const unitCost = art ? (art.cost || art.purchasePrice || ing.unitCost) : ing.unitCost;
      const wasteFactor = 1 + (ing.wastePercent || 0) / 100;
      const totalCost = Number((ing.quantity * unitCost * wasteFactor).toFixed(2));
      return {
        ...ing,
        unitCost,
        totalCost,
      };
    });

    // 2. Calculate sub-recipes cost (multilevel escandallo)
    const updatedSubRecipes: RecipeSubRecipe[] = recipe.subRecipes.map((sub) => {
      const parentRec = recipeMap.get(sub.subRecipeId);
      let subUnitCost = sub.unitCost;
      if (parentRec) {
        // Yield cost per unit of subrecipe
        subUnitCost = parentRec.theoreticalCost / (parentRec.portions || 1);
      }
      const totalCost = Number((sub.quantity * subUnitCost).toFixed(2));
      return {
        ...sub,
        unitCost: Number(subUnitCost.toFixed(2)),
        totalCost,
      };
    });

    // 3. Calculate packaging cost
    const updatedPackaging: RecipePackaging[] = recipe.packaging.map((pack) => {
      const art = articleMap.get(pack.articleId);
      const unitCost = art ? (art.cost || art.purchasePrice || pack.unitCost) : pack.unitCost;
      const totalCost = Number((pack.quantity * unitCost).toFixed(2));
      return {
        ...pack,
        unitCost,
        totalCost,
      };
    });

    const ingredientsSum = updatedIngredients.reduce((sum, i) => sum + i.totalCost, 0);
    const subRecipesSum = updatedSubRecipes.reduce((sum, s) => sum + s.totalCost, 0);
    const packagingSum = updatedPackaging.reduce((sum, p) => sum + p.totalCost, 0);

    const theoreticalCost = Number((ingredientsSum + subRecipesSum + packagingSum).toFixed(2));

    // Calculate margins
    const priceNet = recipe.recommendedPrice > 0
      ? recipe.recommendedPrice / (1 + (recipe.vatRate || 10) / 100)
      : 0;

    const grossMargin = priceNet > 0
      ? Number((((priceNet - (theoreticalCost / (recipe.portions || 1))) / priceNet) * 100).toFixed(1))
      : 0;

    const netMargin = Number((grossMargin * 0.85).toFixed(1)); // 15% estimated labor/overhead

    return {
      ...recipe,
      theoreticalCost,
      grossMargin,
      netMargin,
      ingredients: updatedIngredients,
      subRecipes: updatedSubRecipes,
      packaging: updatedPackaging,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Simulates cost impact if raw material prices increase by a given percentage.
   */
  static simulatePriceHikeImpact(
    recipe: Recipe,
    priceHikePercent: number
  ): {
    currentCost: number;
    projectedCost: number;
    costIncrease: number;
    newGrossMargin: number;
  } {
    const factor = 1 + priceHikePercent / 100;
    const projectedCost = Number((recipe.theoreticalCost * factor).toFixed(2));
    const costIncrease = Number((projectedCost - recipe.theoreticalCost).toFixed(2));

    const priceNet = recipe.recommendedPrice > 0
      ? recipe.recommendedPrice / (1 + (recipe.vatRate || 10) / 100)
      : 0;

    const costPerPortion = projectedCost / (recipe.portions || 1);
    const newGrossMargin = priceNet > 0
      ? Number((((priceNet - costPerPortion) / priceNet) * 100).toFixed(1))
      : 0;

    return {
      currentCost: recipe.theoreticalCost,
      projectedCost,
      costIncrease,
      newGrossMargin,
    };
  }

  /**
   * Creates a new recipe.
   */
  static createRecipe(data: Partial<Recipe>): Recipe {
    const id = `rec-${Date.now()}`;
    const code = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    return {
      id,
      code,
      name: data.name || 'Nueva Receta',
      shortName: data.shortName || data.name || 'Receta',
      family: data.family || 'General',
      category: data.category || 'PLATOS_PRINCIPALES',
      type: data.type || 'ELABORADO',
      description: data.description || '',
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop',
      prepTime: data.prepTime || 15,
      cookTime: data.cookTime || 20,
      portions: data.portions || 1,
      theoreticalCost: data.theoreticalCost || 0,
      realCost: data.realCost || 0,
      grossMargin: data.grossMargin || 70,
      netMargin: data.netMargin || 60,
      recommendedPrice: data.recommendedPrice || 10,
      vatRate: data.vatRate || 10,
      status: data.status || 'ACTIVA',
      ingredients: data.ingredients || [],
      subRecipes: data.subRecipes || [],
      packaging: data.packaging || [],
      allergensUE: data.allergensUE || [],
      nutritionalInfo: data.nutritionalInfo || { calories: 350, proteins: 15, carbs: 40, fats: 12 },
      historicalCosts: data.historicalCosts || [
        { date: now.substring(0, 10), cost: data.theoreticalCost || 0, reason: 'Creación receta' },
      ],
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a production order.
   */
  static createProductionOrder(
    recipe: Recipe,
    targetQuantity: number,
    targetWarehouseId: string,
    targetWarehouseName: string,
    operatorName: string
  ): ProductionOrder {
    const id = `ord-p-${Date.now()}`;
    const orderCode = `OP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const multiplier = targetQuantity / (recipe.portions || 1);
    const consumedItems: ProductionConsumedItem[] = recipe.ingredients.map((ing) => ({
      articleId: ing.articleId,
      articleName: ing.articleName,
      expectedQuantity: Number((ing.quantity * multiplier).toFixed(3)),
      actualQuantity: Number((ing.quantity * multiplier).toFixed(3)),
      unit: ing.unit,
      unitCost: ing.unitCost,
      totalCost: Number((ing.totalCost * multiplier).toFixed(2)),
    }));

    const theoreticalCost = Number((recipe.theoreticalCost * multiplier).toFixed(2));

    return {
      id,
      orderCode,
      recipeId: recipe.id,
      recipeName: recipe.name,
      targetWarehouseId,
      targetWarehouseName,
      targetQuantity,
      unit: recipe.type === 'SEMIELABORADO' ? 'l' : 'ud',
      status: 'PENDIENTE',
      operatorName,
      theoreticalCost,
      realCost: theoreticalCost,
      consumedItems,
      obtainedOutput: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Finalizes a production order, deducts stock, creates output batch.
   */
  static finalizeProductionOrder(
    order: ProductionOrder,
    recipe: Recipe,
    actualObtainedQuantity: number,
    operatorName: string
  ): {
    updatedOrder: ProductionOrder;
    newBatch: ProductionBatch;
  } {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Calculate actual real cost
    const realCost = order.consumedItems.reduce((acc, curr) => acc + curr.totalCost, 0);

    // 2. Generate batch number and expiration date
    const batchNumber = `LOTE-${order.recipeName.substring(0, 4).toUpperCase()}-${now.toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;
    
    // Expiration date: prepTime/cookTime heuristic (e.g., 7 days for semielaborados, 3 days for elaborados)
    const expDays = recipe.type === 'SEMIELABORADO' ? 7 : 3;
    const expDate = new Date(now.getTime() + expDays * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const newBatch: ProductionBatch = {
      id: `bat-${Date.now()}`,
      batchNumber,
      recipeId: recipe.id,
      recipeName: recipe.name,
      manufacturingDate: nowIso.substring(0, 10),
      expirationDate: expDate,
      operatorName,
      initialQuantity: actualObtainedQuantity,
      currentQuantity: actualObtainedQuantity,
      unit: order.unit,
      warehouseId: order.targetWarehouseId,
      warehouseName: order.targetWarehouseName,
      status: 'ACTIVO',
      traceabilityLog: [
        `${nowIso.substring(0, 16)}: Fabricados ${actualObtainedQuantity} ${order.unit} por ${operatorName} (Orden ${order.orderCode})`,
      ],
      createdAt: nowIso,
    };

    const updatedOrder: ProductionOrder = {
      ...order,
      status: 'FINALIZADA',
      endTime: nowIso,
      batchNumber,
      expirationDate: expDate,
      realCost,
      obtainedOutput: actualObtainedQuantity,
      updatedAt: nowIso,
    };

    AuditService.log({
      username: operatorName,
      action: 'PRODUCTION_ORDER_FINALIZE',
      resource: 'Production',
      details: `Orden ${order.orderCode} finalizada. Producidas ${actualObtainedQuantity} ${order.unit} (Lote ${batchNumber})`,
    });

    return { updatedOrder, newBatch };
  }

  /**
   * Registers production waste / loss.
   */
  static registerWaste(wasteData: Partial<ProductionWaste>): ProductionWaste {
    const waste: ProductionWaste = {
      id: `wst-${Date.now()}`,
      date: new Date().toISOString(),
      recipeId: wasteData.recipeId,
      recipeName: wasteData.recipeName,
      articleId: wasteData.articleId || 'art-gen',
      articleName: wasteData.articleName || 'Materia Prima',
      quantity: wasteData.quantity || 1,
      unit: wasteData.unit || 'kg',
      reason: wasteData.reason || 'ERROR_COCINA',
      cost: wasteData.cost || 0,
      operatorName: wasteData.operatorName || 'Operario Cocina',
      notes: wasteData.notes || '',
      createdAt: new Date().toISOString(),
    };

    AuditService.log({
      username: waste.operatorName,
      action: 'PRODUCTION_WASTE_REGISTER',
      resource: 'Production',
      details: `Merma de producción registrada: ${waste.quantity} ${waste.unit} de ${waste.articleName} (Motivo: ${waste.reason}, Coste: ${waste.cost}€)`,
    });

    return waste;
  }

  /**
   * Multi-criteria ultra-fast search.
   */
  static searchProduction(
    query: string,
    recipes: Recipe[],
    orders: ProductionOrder[],
    batches: ProductionBatch[],
    wasteRecords: ProductionWaste[]
  ) {
    const q = query.toLowerCase().trim();
    if (!q) return { recipes, orders, batches, wasteRecords };

    const filteredRecipes = recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.family.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );

    const filteredOrders = orders.filter(
      (o) =>
        o.orderCode.toLowerCase().includes(q) ||
        o.recipeName.toLowerCase().includes(q) ||
        o.operatorName.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );

    const filteredBatches = batches.filter(
      (b) =>
        b.batchNumber.toLowerCase().includes(q) ||
        b.recipeName.toLowerCase().includes(q) ||
        b.warehouseName.toLowerCase().includes(q)
    );

    const filteredWaste = wasteRecords.filter(
      (w) =>
        w.articleName.toLowerCase().includes(q) ||
        (w.recipeName && w.recipeName.toLowerCase().includes(q)) ||
        w.reason.toLowerCase().includes(q)
    );

    return {
      recipes: filteredRecipes,
      orders: filteredOrders,
      batches: filteredBatches,
      wasteRecords: filteredWaste,
    };
  }

  /**
   * Export production data to CSV.
   */
  static exportToCSV(
    type: 'RECIPES' | 'ORDERS' | 'BATCHES' | 'WASTE',
    data: any[]
  ): string {
    if (type === 'RECIPES') {
      const headers = ['Código', 'Nombre', 'Tipo', 'Familia', 'Raciones', 'Coste Teórico €', 'Margen %', 'Precio PVP €', 'Estado'];
      const rows = data.map((r: Recipe) => [
        r.code,
        `"${r.name.replace(/"/g, '""')}"`,
        r.type,
        r.family,
        r.portions,
        r.theoreticalCost,
        r.grossMargin,
        r.recommendedPrice,
        r.status,
      ]);
      return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    if (type === 'ORDERS') {
      const headers = ['Código Orden', 'Receta', 'Cantidad Objetivo', 'Unidad', 'Estado', 'Operario', 'Coste Real €'];
      const rows = data.map((o: ProductionOrder) => [
        o.orderCode,
        `"${o.recipeName.replace(/"/g, '""')}"`,
        o.targetQuantity,
        o.unit,
        o.status,
        `"${o.operatorName.replace(/"/g, '""')}"`,
        o.realCost,
      ]);
      return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    if (type === 'BATCHES') {
      const headers = ['Número Lote', 'Receta', 'Fecha Fabricación', 'Fecha Caducidad', 'Cantidad Actual', 'Unidad', 'Estado'];
      const rows = data.map((b: ProductionBatch) => [
        b.batchNumber,
        `"${b.recipeName.replace(/"/g, '""')}"`,
        b.manufacturingDate,
        b.expirationDate,
        b.currentQuantity,
        b.unit,
        b.status,
      ]);
      return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    const headers = ['Fecha', 'Artículo / Receta', 'Cantidad', 'Unidad', 'Motivo', 'Coste €', 'Operario'];
    const rows = data.map((w: ProductionWaste) => [
      w.date.substring(0, 10),
      `"${w.articleName.replace(/"/g, '""')}"`,
      w.quantity,
      w.unit,
      w.reason,
      w.cost,
      `"${w.operatorName.replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
