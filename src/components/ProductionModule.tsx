import React, { useState } from 'react';
import {
  Recipe,
  ProductionOrder,
  ProductionBatch,
  ProductionWaste,
  ProductionPlan,
} from '../types/production';
import { Article, Warehouse } from '../types/inventory';
import {
  INITIAL_RECIPES,
  INITIAL_PRODUCTION_ORDERS,
  INITIAL_PRODUCTION_BATCHES,
  INITIAL_PRODUCTION_WASTE,
  INITIAL_PRODUCTION_PLANS,
} from '../data/productionData';
import { INITIAL_ARTICLES, INITIAL_WAREHOUSES } from '../data/inventoryData';
import { ProductionService } from '../services/productionService';

import { RecipesManager } from './production/RecipesManager';
import { ProductionOrdersManager } from './production/ProductionOrdersManager';
import { BatchesTraceabilityManager } from './production/BatchesTraceabilityManager';
import { ProductionWasteManager } from './production/ProductionWasteManager';
import { ProductionPlannerManager } from './production/ProductionPlannerManager';
import { AIProductionAssistant } from './production/AIProductionAssistant';

import {
  ChefHat,
  Factory,
  PackageCheck,
  Trash2,
  Calendar,
  Sparkles,
  Download,
  Search,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

export const ProductionModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'RECETAS' | 'ORDENES' | 'LOTES' | 'MERMAS' | 'PLANIFICACION' | 'IA_ASSISTANT'
  >('RECETAS');

  // State
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [orders, setOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION_ORDERS);
  const [batches, setBatches] = useState<ProductionBatch[]>(INITIAL_PRODUCTION_BATCHES);
  const [wasteRecords, setWasteRecords] = useState<ProductionWaste[]>(INITIAL_PRODUCTION_WASTE);
  const [plans, setPlans] = useState<ProductionPlan[]>(INITIAL_PRODUCTION_PLANS);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // Handlers
  const handleAddRecipe = (r: Recipe) => setRecipes([r, ...recipes]);
  const handleUpdateRecipe = (r: Recipe) => setRecipes(recipes.map((item) => (item.id === r.id ? r : item)));

  const handleAddOrder = (o: ProductionOrder) => setOrders([o, ...orders]);
  const handleUpdateOrder = (o: ProductionOrder) => setOrders(orders.map((item) => (item.id === o.id ? o : item)));

  const handleFinalizeOrder = (o: ProductionOrder, b: ProductionBatch) => {
    setOrders(orders.map((item) => (item.id === o.id ? o : item)));
    setBatches([b, ...batches]);
  };

  const handleAddWaste = (w: ProductionWaste) => setWasteRecords([w, ...wasteRecords]);

  // Global search filtering
  const searchResults = ProductionService.searchProduction(
    globalSearch,
    recipes,
    orders,
    batches,
    wasteRecords
  );

  const handleExportCSV = () => {
    let type: 'RECIPES' | 'ORDERS' | 'BATCHES' | 'WASTE' = 'RECIPES';
    let data: any[] = recipes;

    if (activeTab === 'ORDENES') {
      type = 'ORDERS';
      data = orders;
    } else if (activeTab === 'LOTES') {
      type = 'BATCHES';
      data = batches;
    } else if (activeTab === 'MERMAS') {
      type = 'WASTE';
      data = wasteRecords;
    }

    const csvContent = ProductionService.exportToCSV(type, data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `produccion_${type.toLowerCase()}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-slate-950 shadow-md shadow-amber-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Producción, Escandallos & Fabricación Enterprise</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2.5 py-0.5 rounded-full border border-amber-500/30">
                FASE 20
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sistema integral de recetas multinivel, semielaborados, lotes FEFO, mermas e inteligencia Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscador Ultra Rápido..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        {[
          { id: 'RECETAS', label: 'Recetas y Escandallos', icon: <ChefHat className="w-4 h-4" />, badge: recipes.length },
          { id: 'ORDENES', label: 'Órdenes de Producción', icon: <Factory className="w-4 h-4 text-amber-400" />, badge: orders.length },
          { id: 'LOTES', label: 'Lotes & Trazabilidad', icon: <PackageCheck className="w-4 h-4 text-emerald-400" />, badge: batches.length },
          { id: 'MERMAS', label: 'Control Mermas', icon: <Trash2 className="w-4 h-4 text-rose-400" />, badge: wasteRecords.length },
          { id: 'PLANIFICACION', label: 'Planificación', icon: <Calendar className="w-4 h-4 text-blue-400" /> },
          { id: 'IA_ASSISTANT', label: 'Asistente IA Gemini', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === t.id ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'RECETAS' && (
        <RecipesManager
          recipes={searchResults.recipes}
          articles={articles}
          onAddRecipe={handleAddRecipe}
          onUpdateRecipe={handleUpdateRecipe}
        />
      )}

      {activeTab === 'ORDENES' && (
        <ProductionOrdersManager
          orders={searchResults.orders}
          recipes={recipes}
          warehouses={warehouses}
          onAddOrder={handleAddOrder}
          onUpdateOrder={handleUpdateOrder}
          onFinalizeOrder={handleFinalizeOrder}
        />
      )}

      {activeTab === 'LOTES' && <BatchesTraceabilityManager batches={searchResults.batches} />}

      {activeTab === 'MERMAS' && (
        <ProductionWasteManager
          wasteRecords={searchResults.wasteRecords}
          articles={articles}
          onAddWaste={handleAddWaste}
        />
      )}

      {activeTab === 'PLANIFICACION' && <ProductionPlannerManager plans={plans} orders={orders} />}

      {activeTab === 'IA_ASSISTANT' && (
        <AIProductionAssistant
          recipes={recipes}
          orders={orders}
          batches={batches}
          wasteRecords={wasteRecords}
        />
      )}
    </div>
  );
};
