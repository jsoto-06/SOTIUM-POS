import React from 'react';
import { PurchasesAnalytics } from '../../types/purchases';
import { BarChart3, TrendingUp, PiggyBank, RefreshCw, Percent, Building2, Package } from 'lucide-react';

interface PurchasesAnalyticsPanelProps {
  analytics: PurchasesAnalytics;
}

export const PurchasesAnalyticsPanel: React.FC<PurchasesAnalyticsPanelProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Volumen Total Compras</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{analytics.totalPurchasesValuation.toFixed(2)} €</p>
          <p className="text-[10px] text-slate-500 mt-1">{analytics.totalOrdersCount} pedidos procesados</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Ahorro Estimado (Rappels)</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">+{analytics.totalSavings.toFixed(2)} €</p>
          <p className="text-[10px] text-slate-500 mt-1">4.5% ahorro acumulado por volumen</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Rotación Almacén</span>
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-300">{analytics.rotationRate}x / año</p>
          <p className="text-[10px] text-slate-500 mt-1">Óptima liquidez de stock</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>Margen de Rentabilidad</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">{analytics.averageProfitabilityMargin}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Sobre escandallo medio</p>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compras por Proveedor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Compras por Proveedor
          </h3>
          <div className="space-y-3">
            {analytics.purchasesBySupplier.map((sup, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{sup.supplierName}</span>
                  <span className="font-mono text-amber-300">
                    {sup.totalAmount.toFixed(2)} € ({sup.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, sup.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compras por Familia */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Package className="w-4 h-4" /> Compras por Familia de Producto
          </h3>
          <div className="space-y-3">
            {analytics.purchasesByFamily.map((fam, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{fam.familyName}</span>
                  <span className="font-mono text-emerald-300">
                    {fam.totalAmount.toFixed(2)} € ({fam.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, fam.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
