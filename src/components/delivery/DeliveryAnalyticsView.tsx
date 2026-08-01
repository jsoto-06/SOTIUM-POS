import React from 'react';
import { DeliveryAnalytics } from '../../types/delivery';
import { TrendingUp, Clock, Truck, DollarSign, AlertTriangle, ShieldCheck, Award } from 'lucide-react';

interface DeliveryAnalyticsViewProps {
  analytics: DeliveryAnalytics;
}

export const DeliveryAnalyticsView: React.FC<DeliveryAnalyticsViewProps> = ({ analytics }) => {
  return (
    <div className="space-y-4">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 block font-semibold">Ventas Totales Delivery & TakeAway</span>
          <p className="text-2xl font-black text-amber-400 font-mono">{analytics.totalRevenue.toFixed(2)} €</p>
          <span className="text-[10px] text-slate-500">{analytics.totalOrders} pedidos totales procesados</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 block font-semibold">Tiempo Medio de Cocina</span>
          <p className="text-2xl font-black text-purple-400 font-mono">{analytics.avgPreparationTimeMinutes} min</p>
          <span className="text-[10px] text-slate-500">Desde aceptación hasta emplatado</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 block font-semibold">Tiempo Medio de Reparto</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">{analytics.avgDeliveryTimeMinutes} min</p>
          <span className="text-[10px] text-slate-500">Desde recogida hasta entrega en destino</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 block font-semibold">Tasa de Cancelaciones</span>
          <p className="text-2xl font-black text-rose-400 font-mono">{analytics.cancellationRatePercent} %</p>
          <span className="text-[10px] text-slate-500">{analytics.incidentCount} incidencias registradas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales by Channel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Rentabilidad por Canal de Venta</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </h4>

          <div className="space-y-2">
            {Object.entries(analytics.salesByChannel).map(([channel, rawData]) => {
              const data = rawData as { count: number; total: number };
              if (data.count === 0 && data.total === 0) return null;
              return (
                <div key={channel} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{channel}</span>
                    <span className="text-[10px] text-slate-400">{data.count} pedidos</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm">{data.total.toFixed(2)} €</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Rankings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Ranking de Eficiencia de Repartidores</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </h4>

          <div className="space-y-2">
            {analytics.driverRankings.map((drv, idx) => (
              <div key={drv.driverId} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold font-mono text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{drv.driverName}</span>
                    <span className="text-[10px] text-slate-400">{drv.totalDeliveries} entregas</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold block">{drv.avgMinutes} min avg</span>
                  <span className="text-amber-400 text-[10px] font-bold">★ {drv.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
