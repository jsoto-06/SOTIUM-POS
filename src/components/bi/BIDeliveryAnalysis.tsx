import React from 'react';
import { BIDeliveryMetric } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';
import { Truck, Clock, AlertTriangle, DollarSign, Smartphone } from 'lucide-react';

interface BIDeliveryAnalysisProps {
  delivery: BIDeliveryMetric;
}

export const BIDeliveryAnalysis: React.FC<BIDeliveryAnalysisProps> = ({ delivery }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <Truck className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-base font-bold text-white">Análisis Delivery, Canales Externos & Tiempos de Entrega</h3>
          <p className="text-xs text-slate-400">Desglose por plataformas (Glovo, Uber Eats, Just Eat, Web), incidencias y margen neto</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Pedidos Delivery Totales</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{delivery.orderCount}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Todas las plataformas</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Tiempo Medio de Entrega</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{delivery.avgDeliveryTimeMinutes} min</div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Dentro del ETA contratado</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Beneficio Neto Delivery</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatCurrency(delivery.netProfit)}</div>
            <span className="text-[10px] text-emerald-300 mt-1 block">Tras comisiones de canal</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Incidencias / Cancelados</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{delivery.incidentsCount}</div>
            <span className="text-[10px] text-red-300 mt-1 block">0.8% tasa de incidencia</span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Platform Breakdown Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Cuota de Mercado por Canal de Delivery</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {delivery.channelBreakdown.map((ch) => (
            <div key={ch.channel} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-white">{ch.channel}</span>
                <span className="font-mono text-xs text-amber-400 font-bold">{ch.percent.toFixed(1)}%</span>
              </div>
              <div className="text-lg font-black font-mono text-emerald-400">{formatCurrency(ch.sales)}</div>
              <span className="text-[10px] text-slate-400 block">{ch.count} pedido(s) procesados</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
