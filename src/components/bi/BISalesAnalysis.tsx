import React, { useState } from 'react';
import { BISalesPoint, BISalesComparison } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Clock, TrendingUp, Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BISalesAnalysisProps {
  hourlyData: BISalesPoint[];
  comparisons: BISalesComparison[];
}

export const BISalesAnalysis: React.FC<BISalesAnalysisProps> = ({ hourlyData, comparisons }) => {
  const [timeframe, setTimeframe] = useState<'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('HOURLY');

  return (
    <div className="space-y-4">
      {/* Timeframe selector header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Análisis de Ventas por Franja Horaria y Períodos</h3>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'HOURLY', label: 'Por Hora' },
            { id: 'DAILY', label: 'Por Día' },
            { id: 'WEEKLY', label: 'Por Semana' },
            { id: 'MONTHLY', label: 'Por Mes' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === tf.id ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparisons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisons.map((comp, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
              <span>{comp.dimension}</span>
              <span
                className={`flex items-center text-[11px] font-bold ${
                  comp.percentChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {comp.percentChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{comp.percentChange >= 0 ? `+${comp.percentChange.toFixed(1)}%` : `${comp.percentChange.toFixed(1)}%`}</span>
              </span>
            </div>

            <div className="flex justify-between items-baseline font-mono">
              <span className="text-xl font-black text-amber-400">{formatCurrency(comp.currentSales)}</span>
              <span className="text-xs text-slate-500 line-through">{formatCurrency(comp.previousSales)}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Diferencia: <span className="text-emerald-400 font-bold">+{formatCurrency(comp.difference)}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Chart 1: Sales Area & Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Curva de Facturación Horaria (€) vs Número de Tickets</span>
        </h4>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)} €`, 'Ventas']}
              />
              <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Average Ticket Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Evolución del Ticket Medio por Franja Horaria (€)</span>
        </h4>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)} €`, 'Ticket Medio']}
              />
              <Line type="monotone" dataKey="avgTicket" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
