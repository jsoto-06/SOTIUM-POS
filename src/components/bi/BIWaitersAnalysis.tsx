import React from 'react';
import { BIWaiterMetric } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';
import { Award, Clock, DollarSign, ShieldAlert, Star, Users } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface BIWaitersAnalysisProps {
  waiters: BIWaiterMetric[];
}

export const BIWaitersAnalysis: React.FC<BIWaitersAnalysisProps> = ({ waiters }) => {
  const radarData = waiters.map((w) => ({
    name: w.employeeName.split(' ')[0],
    Ventas: Math.min(100, Math.round((w.totalSales / 700) * 100)),
    Velocidad: Math.max(20, 100 - w.avgServiceTimeMinutes * 3),
    Productividad: w.productivityScore,
    Rating: Math.round(w.rating * 20),
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <Award className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-base font-bold text-white">Análisis de Rendimiento de Camareros & Personal de Sala</h3>
          <p className="text-xs text-slate-400">Evaluación de ventas, tiempos de servicio, invitaciones y auditoría de anulaciones</p>
        </div>
      </div>

      {/* Main Grid: Radar chart & Top Performer card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 lg:col-span-2 shadow-xl">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Comparativa Multidimensional de Eficiencia de Empleados</span>
          </h4>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                <Radar name="Productividad" dataKey="Productividad" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                <Radar name="Ventas" dataKey="Ventas" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performer Card */}
        {waiters.length > 0 && (
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Empleado Destacado del Período</span>
              <div className="flex items-center space-x-3 mt-3">
                <img src={waiters[0].photoUrl} alt={waiters[0].employeeName} className="w-14 h-14 rounded-full border-2 border-amber-500 object-cover" />
                <div>
                  <h4 className="font-extrabold text-white text-base">{waiters[0].employeeName}</h4>
                  <span className="text-xs text-slate-400">{waiters[0].role}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Facturación Acumulada:</span>
                <span className="font-bold text-amber-400">{formatCurrency(waiters[0].totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comandas Procesadas:</span>
                <span className="font-bold text-white">{waiters[0].ticketsProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tiempo Medio Servicio:</span>
                <span className="font-bold text-emerald-400">{waiters[0].avgServiceTimeMinutes.toFixed(1)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Score Productividad:</span>
                <span className="font-bold text-cyan-400">{waiters[0].productivityScore} / 100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Staff Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h4 className="font-bold text-sm text-white">Tabla Ejecutiva de Rendimiento & Auditoría de Descuentos</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Empleado</th>
                <th className="p-3 text-right">Ventas</th>
                <th className="p-3 text-right">Tickets</th>
                <th className="p-3 text-right">Ticket Medio</th>
                <th className="p-3 text-right">Tiempo Serv.</th>
                <th className="p-3 text-right">Descuentos</th>
                <th className="p-3 text-right">Invitaciones</th>
                <th className="p-3 text-right">Anulaciones</th>
                <th className="p-3 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {waiters.map((w, idx) => (
                <tr key={w.employeeId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-sans font-bold text-white flex items-center space-x-2">
                    <span className="text-amber-400 text-xs">#{idx + 1}</span>
                    <span>{w.employeeName}</span>
                  </td>
                  <td className="p-3 text-right font-bold text-amber-400">{formatCurrency(w.totalSales)}</td>
                  <td className="p-3 text-right text-slate-200">{w.ticketsProcessed}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">{formatCurrency(w.avgTicket)}</td>
                  <td className="p-3 text-right text-cyan-400 font-bold">{w.avgServiceTimeMinutes.toFixed(1)} min</td>
                  <td className="p-3 text-right text-amber-300">{formatCurrency(w.totalDiscounts)}</td>
                  <td className="p-3 text-right text-purple-400">{formatCurrency(w.totalInvitations)}</td>
                  <td className="p-3 text-right text-red-400 font-bold">{w.totalVoids}</td>
                  <td className="p-3 text-center font-sans">
                    <span className="flex items-center justify-center space-x-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{w.rating}</span>
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
