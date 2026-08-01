import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { biService } from '../services/biService';
import { biAIService } from '../services/biAIService';
import { BIFiltersHeader } from './bi/BIFiltersHeader';
import { BIExecutiveDashboard } from './bi/BIExecutiveDashboard';
import { BISalesAnalysis } from './bi/BISalesAnalysis';
import { BIProductsAnalysis } from './bi/BIProductsAnalysis';
import { BICustomersAnalysis } from './bi/BICustomersAnalysis';
import { BIWaitersAnalysis } from './bi/BIWaitersAnalysis';
import { BIKitchenAnalysis } from './bi/BIKitchenAnalysis';
import { BIInventoryAnalysis } from './bi/BIInventoryAnalysis';
import { BIDeliveryAnalysis } from './bi/BIDeliveryAnalysis';
import { BIGeminiPredictor } from './bi/BIGeminiPredictor';
import { BIExportModal } from './bi/BIExportModal';
import {
  BIFilters,
  BIExecutiveMetrics,
  BISalesPoint,
  BISalesComparison,
  BIProductMetric,
  BICustomerMetric,
  BIWaiterMetric,
  BIKitchenMetric,
  BIInventoryMetric,
  BIDeliveryMetric,
  AIPredictionItem,
} from '../types/pos';
import {
  BarChart3,
  Download,
  Sparkles,
  TrendingUp,
  Package,
  Users,
  Award,
  Flame,
  Boxes,
  Truck,
  Zap,
} from 'lucide-react';

export const ReportsDashboardModule: React.FC = () => {
  const {
    ordersHistory,
    products,
    customers,
    employees,
    salons,
    categories,
    ingredients,
    deliveryOrders,
    reservations,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<
    'EXECUTIVE' | 'SALES' | 'PRODUCTS' | 'CUSTOMERS' | 'WAITERS' | 'KITCHEN' | 'INVENTORY' | 'DELIVERY' | 'GEMINI_AI'
  >('EXECUTIVE');

  const [filters, setFilters] = useState<BIFilters>({
    dateRange: 'TODAY',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Calculated metrics state
  const [executiveMetrics, setExecutiveMetrics] = useState<BIExecutiveMetrics>(() =>
    biService.getExecutiveMetrics(ordersHistory, products, customers, reservations, deliveryOrders, filters)
  );

  const [salesPoints, setSalesPoints] = useState<BISalesPoint[]>(() =>
    biService.getSalesBreakdown(ordersHistory, filters)
  );

  const [salesComparisons, setSalesComparisons] = useState<BISalesComparison[]>(() =>
    biService.getSalesComparisons(ordersHistory)
  );

  const [productMetrics, setProductMetrics] = useState<BIProductMetric[]>(() =>
    biService.getProductMetrics(ordersHistory, products, filters)
  );

  const [customerMetrics, setCustomerMetrics] = useState<BICustomerMetric[]>(() =>
    biService.getCustomerMetrics(customers, ordersHistory)
  );

  const [waiterMetrics, setWaiterMetrics] = useState<BIWaiterMetric[]>(() =>
    biService.getWaiterMetrics(employees, ordersHistory)
  );

  const [kitchenMetrics, setKitchenMetrics] = useState<BIKitchenMetric[]>(() =>
    biService.getKitchenMetrics(ordersHistory)
  );

  const [inventoryMetrics, setInventoryMetrics] = useState<BIInventoryMetric>(() =>
    biService.getInventoryMetrics(ingredients)
  );

  const [deliveryMetrics, setDeliveryMetrics] = useState<BIDeliveryMetric>(() =>
    biService.getDeliveryMetrics(deliveryOrders)
  );

  const [aiPredictions, setAiPredictions] = useState<AIPredictionItem[]>([]);

  // Re-calculate when context data or filters change
  const refreshBI = async () => {
    setIsLoading(true);
    try {
      setExecutiveMetrics(biService.getExecutiveMetrics(ordersHistory, products, customers, reservations, deliveryOrders, filters));
      setSalesPoints(biService.getSalesBreakdown(ordersHistory, filters));
      setSalesComparisons(biService.getSalesComparisons(ordersHistory));
      setProductMetrics(biService.getProductMetrics(ordersHistory, products, filters));
      setCustomerMetrics(biService.getCustomerMetrics(customers, ordersHistory));
      setWaiterMetrics(biService.getWaiterMetrics(employees, ordersHistory));
      setKitchenMetrics(biService.getKitchenMetrics(ordersHistory));
      setInventoryMetrics(biService.getInventoryMetrics(ingredients));
      setDeliveryMetrics(biService.getDeliveryMetrics(deliveryOrders));

      const aiRes = await biAIService.generateBIPredictions(ordersHistory, products, ingredients, employees);
      setAiPredictions(aiRes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBI();
  }, [filters, ordersHistory.length]);

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <span>Business Intelligence & Analytics Enterprise</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                FASE 15 COMPLETE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Informes ejecutivos, análisis matricial BCG, predicciones IA Gemini 3.6 Flash y exportación PDF/Excel
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Informe BI</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <BIFiltersHeader
        filters={filters}
        onFilterChange={setFilters}
        salons={salons}
        employees={employees}
        categories={categories}
        onRefresh={refreshBI}
        isLoading={isLoading}
      />

      {/* Main Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'EXECUTIVE', label: 'Cuadro Ejecutivo', icon: Zap },
          { id: 'SALES', label: 'Ventas & Tiempos', icon: TrendingUp },
          { id: 'PRODUCTS', label: 'Productos & BCG', icon: Package },
          { id: 'CUSTOMERS', label: 'Clientes & RFM', icon: Users },
          { id: 'WAITERS', label: 'Camareros', icon: Award },
          { id: 'KITCHEN', label: 'Cocina KDS', icon: Flame },
          { id: 'INVENTORY', label: 'Almacén & Mermas', icon: Boxes },
          { id: 'DELIVERY', label: 'Delivery & Web', icon: Truck },
          { id: 'GEMINI_AI', label: 'Predicciones IA Gemini', icon: Sparkles, highlight: true },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-extrabold rounded-xl border transition-all whitespace-nowrap ${
                isActive
                  ? tab.highlight
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                  : tab.highlight
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'EXECUTIVE' && <BIExecutiveDashboard metrics={executiveMetrics} />}
        {activeTab === 'SALES' && <BISalesAnalysis hourlyData={salesPoints} comparisons={salesComparisons} />}
        {activeTab === 'PRODUCTS' && <BIProductsAnalysis products={productMetrics} />}
        {activeTab === 'CUSTOMERS' && <BICustomersAnalysis customers={customerMetrics} />}
        {activeTab === 'WAITERS' && <BIWaitersAnalysis waiters={waiterMetrics} />}
        {activeTab === 'KITCHEN' && <BIKitchenAnalysis kitchenMetrics={kitchenMetrics} />}
        {activeTab === 'INVENTORY' && <BIInventoryAnalysis inventory={inventoryMetrics} />}
        {activeTab === 'DELIVERY' && <BIDeliveryAnalysis delivery={deliveryMetrics} />}
        {activeTab === 'GEMINI_AI' && (
          <BIGeminiPredictor
            predictions={aiPredictions}
            onGeneratePredictions={refreshBI}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Export Modal */}
      <BIExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportData={salesPoints}
        reportTitle={`BI_${activeTab}`}
      />
    </div>
  );
};
