import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { ArticlesManager } from './inventory/ArticlesManager';
import { WarehousesManager } from './inventory/WarehousesManager';
import { StockMovementsManager } from './inventory/StockMovementsManager';
import { BatchesExpirationManager } from './inventory/BatchesExpirationManager';
import { InventoriesManager } from './inventory/InventoriesManager';
import { TransfersManager } from './inventory/TransfersManager';
import { MermasLossesManager } from './inventory/MermasLossesManager';
import { EscandallosCalculator } from './inventory/EscandallosCalculator';
import { InventoryAnalyticsPanel } from './inventory/InventoryAnalyticsPanel';
import { ImportExportModal } from './inventory/ImportExportModal';

import {
  Article,
  Warehouse,
  BatchControl,
  StockMovementRecord,
  InventorySession,
  WarehouseTransfer,
  InventoryItemCount,
} from '../types/inventory';
import { calculateInventoryAnalytics } from '../services/inventoryService';
import { INITIAL_ARTICLES, INITIAL_WAREHOUSES, INITIAL_BATCHES, INITIAL_STOCK_MOVEMENTS, INITIAL_INVENTORIES, INITIAL_TRANSFERS } from '../data/inventoryData';

import {
  Warehouse as WarehouseIcon,
  Package,
  Layers,
  RefreshCw,
  ClipboardList,
  ArrowRightLeft,
  Trash2,
  Utensils,
  BarChart3,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

export const InventoryPurchasesModule: React.FC = () => {
  const { products, setProducts } = usePOS();

  // SubTab Navigation
  const [activeSubTab, setActiveSubTab] = useState<
    'articles' | 'warehouses' | 'movements' | 'batches' | 'inventories' | 'transfers' | 'mermas' | 'escandallos' | 'analytics'
  >('articles');

  // Enterprise Inventory Local state (synced with context & initial data)
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [batches, setBatches] = useState<BatchControl[]>(INITIAL_BATCHES);
  const [stockMovements, setStockMovements] = useState<StockMovementRecord[]>(INITIAL_STOCK_MOVEMENTS);
  const [inventories, setInventories] = useState<InventorySession[]>(INITIAL_INVENTORIES);
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>(INITIAL_TRANSFERS);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Computed Analytics
  const analytics = useMemo(() => {
    return calculateInventoryAnalytics(articles, batches, stockMovements);
  }, [articles, batches, stockMovements]);

  // Handlers for Articles
  const handleAddArticle = (art: Article) => {
    setArticles((prev) => [art, ...prev]);
  };

  const handleUpdateArticle = (art: Article) => {
    setArticles((prev) => prev.map((a) => (a.id === art.id ? art : a)));
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Handlers for Warehouses
  const handleAddWarehouse = (wh: Warehouse) => {
    setWarehouses((prev) => [...prev, wh]);
  };

  const handleUpdateWarehouse = (wh: Warehouse) => {
    setWarehouses((prev) => prev.map((w) => (w.id === wh.id ? wh : w)));
  };

  const handleDeleteWarehouse = (id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  };

  // Handlers for Movements
  const handleRecordMovement = (mov: StockMovementRecord) => {
    setStockMovements((prev) => [mov, ...prev]);

    // Dynamically update total stock of the article
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === mov.articleId) {
          const delta =
            mov.type === 'ENTRADA'
              ? mov.quantity
              : mov.type === 'SALIDA' || mov.type === 'MERMA' || mov.type === 'AUTOCONSUMO'
              ? -mov.quantity
              : 0;
          return {
            ...art,
            stock: Math.max(0, (art.stock ?? 0) + delta),
          };
        }
        return art;
      })
    );
  };

  // Handlers for Inventories
  const handleCreateInventory = (session: InventorySession) => {
    setInventories((prev) => [session, ...prev]);
  };

  const handleRegularizeInventory = (inventoryId: string, items: InventoryItemCount[]) => {
    setInventories((prev) =>
      prev.map((inv) => (inv.id === inventoryId ? { ...inv, status: 'REGULARIZED', items } : inv))
    );

    // Apply regularization movements to articles
    items.forEach((it) => {
      if (it.difference !== 0) {
        handleRecordMovement({
          id: `mov-reg-${Date.now()}-${it.articleId}`,
          articleId: it.articleId,
          articleName: it.articleName,
          type: 'REGULARIZACION',
          quantity: Math.abs(it.difference),
          unit: 'kg',
          cost: it.unitCost,
          totalValue: Math.abs(it.differenceValue),
          reason: 'Ajuste de inventario físico',
          user: 'Carlos Encargado',
          date: new Date().toISOString(),
        });
      }
    });
  };

  // Handlers for Transfers
  const handleExecuteTransfer = (trf: WarehouseTransfer) => {
    setTransfers((prev) => [trf, ...prev]);

    trf.items.forEach((it) => {
      handleRecordMovement({
        id: `mov-trf-${Date.now()}-${it.articleId}`,
        articleId: it.articleId,
        articleName: it.articleName,
        type: 'TRANSFERENCIA',
        quantity: it.quantity,
        unit: it.unit,
        cost: 0,
        totalValue: 0,
        sourceWarehouseId: trf.sourceWarehouseId,
        sourceWarehouseName: trf.sourceWarehouseName,
        targetWarehouseId: trf.targetWarehouseId,
        targetWarehouseName: trf.targetWarehouseName,
        user: trf.requestedBy,
        date: new Date().toISOString(),
      });
    });
  };

  const handleImportArticles = (imported: Article[]) => {
    setArticles((prev) => [...imported, ...prev]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      {/* Module Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <WarehouseIcon className="w-7 h-7 text-amber-400" />
          <div>
            <h2 className="text-xl font-black text-white">Almacén Enterprise & Gestión de Producción</h2>
            <p className="text-xs text-slate-400">
              Valoración FIFO/FEFO, trazabilidad de lotes, multicámara, mermas, escandallos e inventario ciego
            </p>
          </div>
        </div>

        {/* SubTab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'articles', label: 'Artículos', icon: Package },
            { id: 'warehouses', label: 'Almacenes', icon: WarehouseIcon },
            { id: 'movements', label: 'Movimientos', icon: RefreshCw },
            { id: 'batches', label: 'Lotes & Caducidades', icon: Layers },
            { id: 'inventories', label: 'Inventarios', icon: ClipboardList },
            { id: 'transfers', label: 'Traspasos', icon: ArrowRightLeft },
            { id: 'mermas', label: 'Mermas', icon: Trash2 },
            { id: 'escandallos', label: 'Escandallos', icon: Utensils },
            { id: 'analytics', label: 'Analítica', icon: BarChart3 },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsImportExportOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
            title="Importar / Exportar CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto">
        {activeSubTab === 'articles' && (
          <ArticlesManager
            articles={articles}
            onAddArticle={handleAddArticle}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
          />
        )}

        {activeSubTab === 'warehouses' && (
          <WarehousesManager
            warehouses={warehouses}
            onAddWarehouse={handleAddWarehouse}
            onUpdateWarehouse={handleUpdateWarehouse}
            onDeleteWarehouse={handleDeleteWarehouse}
          />
        )}

        {activeSubTab === 'movements' && (
          <StockMovementsManager
            movements={stockMovements}
            articles={articles}
            warehouses={warehouses}
            onRecordMovement={handleRecordMovement}
          />
        )}

        {activeSubTab === 'batches' && (
          <BatchesExpirationManager
            batches={batches}
            warehouses={warehouses}
            onAddBatch={(b) => setBatches((prev) => [b, ...prev])}
            onUpdateBatch={(b) => setBatches((prev) => prev.map((x) => (x.id === b.id ? b : x)))}
          />
        )}

        {activeSubTab === 'inventories' && (
          <InventoriesManager
            inventories={inventories}
            articles={articles}
            warehouses={warehouses}
            onCreateInventory={handleCreateInventory}
            onRegularizeInventory={handleRegularizeInventory}
          />
        )}

        {activeSubTab === 'transfers' && (
          <TransfersManager
            transfers={transfers}
            articles={articles}
            warehouses={warehouses}
            onExecuteTransfer={handleExecuteTransfer}
          />
        )}

        {activeSubTab === 'mermas' && (
          <MermasLossesManager
            movements={stockMovements}
            articles={articles}
            warehouses={warehouses}
            onRecordMerma={handleRecordMovement}
          />
        )}

        {activeSubTab === 'escandallos' && (
          <EscandallosCalculator
            products={products}
            articles={articles}
            onUpdateProducts={setProducts}
          />
        )}

        {activeSubTab === 'analytics' && <InventoryAnalyticsPanel analytics={analytics} />}
      </div>

      {/* Import/Export Modal */}
      {isImportExportOpen && (
        <ImportExportModal
          articles={articles}
          onImportArticles={handleImportArticles}
          onClose={() => setIsImportExportOpen(false)}
        />
      )}
    </div>
  );
};
