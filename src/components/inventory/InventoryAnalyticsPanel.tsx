import React from 'react';
import { InventoryAnalytics } from '../../types/inventory';
import { DollarSign, RefreshCcw, ShieldAlert, PieChart, TrendingUp, BarChart3, AlertOctagon, PackageCheck } from 'lucide-react';

interface InventoryAnalyticsPanelProps {
  analytics: InventoryAnalytics;
}

export const InventoryAnalyticsPanel: React.FC<InventoryAnalyticsPanelProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Valoración Total Almacén</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{analytics.totalValuation.toFixed(2)} €</span>
          </div>
          <DollarSign className="w-10 h-10 text-amber-400/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Índice de Rotación Stock</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{analytics.rotationIndex}x / mes</span>
          </div>
          <RefreshCcw className="w-10 h-10 text-emerald-400/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Stock Inmovilizado (&gt;60d)</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{analytics.inmobilizedStockValue.toFixed(2)} €</span>
          </div>
          <AlertOctagon className="w-10 h-10 text-rose-400/30" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Artículos Bajo Mínimos</span>
            <span className="text-2xl font-black text-red-400 font-mono">{analytics.lowStockCount}</span>
          </div>
          <ShieldAlert className="w-10 h-10 text-red-400/30" />
        </div>
      </div>

      {/* Two Column Section: Valuation by Warehouse & Valuation by Family */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valuation by Warehouse */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="text-sm font-black text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Valoración de Inventario por Almacén</span>
          </h4>

          <div className="space-y-3">
            {analytics.valuationByWarehouse.map((item, idx) => {
              const percentage =
                analytics.totalValuation > 0 ? (item.totalValue / analytics.totalValuation) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-bold">{item.warehouseName}</span>
                    <span className="text-amber-400 font-bold">
                      {item.totalValue.toFixed(2)} € ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Valuation by Family */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="text-sm font-black text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Distribución de Coste por Familia</span>
          </h4>

          <div className="space-y-3">
            {analytics.valuationByFamily.map((item, idx) => {
              const percentage =
                analytics.totalValuation > 0 ? (item.totalValue / analytics.totalValuation) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-bold">{item.familyName}</span>
                    <span className="text-emerald-400 font-bold">
                      {item.totalValue.toFixed(2)} € ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Consumed Articles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="text-sm font-black text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Top 5 Materias Primas Más Consumidas</span>
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Materia Prima / Artículo</th>
                <th className="p-3 text-right">Cantidad Consumida</th>
                <th className="p-3 text-right">Coste Acumulado (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              {analytics.topConsumedArticles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-500 text-xs">
                    Sin registros de consumo en el ciclo actual.
                  </td>
                </tr>
              ) : (
                analytics.topConsumedArticles.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white font-sans">{item.articleName}</td>
                    <td className="p-3 text-right text-amber-400 font-bold">{item.quantity}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{item.totalCost.toFixed(2)} €</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
