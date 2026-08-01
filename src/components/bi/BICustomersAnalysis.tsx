import React from 'react';
import { BICustomerMetric } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';
import { Users, Heart, UserCheck, UserPlus, AlertTriangle } from 'lucide-react';

interface BICustomersAnalysisProps {
  customers: BICustomerMetric[];
}

export const BICustomersAnalysis: React.FC<BICustomersAnalysisProps> = ({ customers }) => {
  const vipCount = customers.filter((c) => c.segment === 'VIP').length;
  const newCount = customers.filter((c) => c.segment === 'NUEVO').length;
  const atRiskCount = customers.filter((c) => c.segment === 'EN_RIESGO').length;
  const regularCount = customers.filter((c) => c.segment === 'HABITUAL').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <Users className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-base font-bold text-white">Análisis de Clientes, Segmentación RFM & Fidelización</h3>
          <p className="text-xs text-slate-400">Comportamiento de consumo, gasto medio y retención</p>
        </div>
      </div>

      {/* Cohorts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-medium">Clientes VIP</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{vipCount}</div>
            <span className="text-[10px] text-amber-300 font-semibold">Gasto acumulado &gt; 300 €</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-medium">Clientes Habituales</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{regularCount}</div>
            <span className="text-[10px] text-emerald-300 font-semibold">Frecuencia &gt; 5 visitas</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-medium">Nuevos Clientes</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{newCount}</div>
            <span className="text-[10px] text-cyan-300 font-semibold">Primera visita este mes</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-medium">Clientes en Riesgo</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{atRiskCount}</div>
            <span className="text-[10px] text-red-300 font-semibold">Sin visitas hace &gt; 45 días</span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h4 className="font-bold text-sm text-white">Directorio Ejecutivo de Clientes & Puntos de Fidelización</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Contacto</th>
                <th className="p-3 text-right">Gasto Total</th>
                <th className="p-3 text-right">Tickets</th>
                <th className="p-3 text-right">Gasto Medio</th>
                <th className="p-3 text-right">Puntos Club</th>
                <th className="p-3 text-center">Segmento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {customers.map((c) => (
                <tr key={c.customerId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-sans font-bold text-white">{c.customerName}</td>
                  <td className="p-3 font-sans text-slate-400">{c.phone || c.email || 'N/A'}</td>
                  <td className="p-3 text-right font-bold text-amber-400">{formatCurrency(c.totalSpent)}</td>
                  <td className="p-3 text-right text-slate-200">{c.ticketCount}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">{formatCurrency(c.avgTicket)}</td>
                  <td className="p-3 text-right text-purple-400 font-bold">{c.loyaltyPoints} pts</td>
                  <td className="p-3 text-center font-sans">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        c.segment === 'VIP'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : c.segment === 'HABITUAL'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : c.segment === 'NUEVO'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {c.segment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
