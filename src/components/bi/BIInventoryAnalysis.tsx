import React from 'react';
import { BIInventoryMetric } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';
import { Boxes, AlertTriangle, RefreshCw, Trash2, TrendingUp } from 'lucide-react';

interface BIInventoryAnalysisProps {
  inventory: BIInventoryMetric;
}

export const BIInventoryAnalysis: React.FC<BIInventoryAnalysisProps> = ({ inventory }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <Boxes className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-base font-bold text-white">Análisis de Almacén, Rotación & Control de Mermas</h3>
          <p className="text-xs text-slate-400">Valoración total de stock, caducidades y coste de desperdicio</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Valoración Total Stock</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{formatCurrency(inventory.totalValuation)}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Coste medio insumos</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Índice de Rotación Mensual</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{inventory.rotationRate}x / mes</div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Rotación saludable</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Coste Mermas & Desperdicio</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{formatCurrency(inventory.wasteCost)}</div>
            <span className="text-[10px] text-red-300 mt-1 block">1.8% de las compras totales</span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Alertas Stock Mínimo</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{inventory.lowStockItemsCount} insumos</div>
            <span className="text-[10px] text-amber-300 mt-1 block">Requiere reposición urgente</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
