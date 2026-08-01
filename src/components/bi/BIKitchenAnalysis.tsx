import React from 'react';
import { BIKitchenMetric } from '../../types/pos';
import { ShoppingBag, AlertTriangle, Clock, Flame } from 'lucide-react';

interface BIKitchenAnalysisProps {
  kitchenMetrics: BIKitchenMetric[];
}

export const BIKitchenAnalysis: React.FC<BIKitchenAnalysisProps> = ({ kitchenMetrics }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <Flame className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-base font-bold text-white">Análisis de Cocina, Tiempos KDS & Cuellos de Botella</h3>
          <p className="text-xs text-slate-400">Rendimiento por estación, platos más lentos y retrasos en pase</p>
        </div>
      </div>

      {/* Stations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kitchenMetrics.map((st) => (
          <div key={st.stationId} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-white flex items-center space-x-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{st.stationName}</span>
              </h4>
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                {st.totalPrepared} servidos
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tiempo Medio Prep.:</span>
                <span className="font-bold text-amber-400">{st.avgPrepMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Órdenes con Retraso (&gt;15m):</span>
                <span className={`font-bold ${st.delayedOrdersCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {st.delayedOrdersCount}
                </span>
              </div>
            </div>

            {/* Slowest dishes */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Platos Más Lentos</span>
              <div className="space-y-1 mt-1">
                {st.slowestDishes.map((dish, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300 truncate max-w-[140px]">{dish.productName}</span>
                    <span className="font-mono font-bold text-amber-400">{dish.avgMinutes} min</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
