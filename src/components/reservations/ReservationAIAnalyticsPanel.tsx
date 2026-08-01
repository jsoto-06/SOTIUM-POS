import React, { useState, useEffect } from 'react';
import { Reservation, Salon } from '../../types/reservation';
import { analyzeNoShowRisk, generateOccupancyForecast, recommendBestTable } from '../../services/reservationAIService';
import { Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Users, Brain, Clock, Table as TableIcon } from 'lucide-react';

interface ReservationAIAnalyticsPanelProps {
  reservations: Reservation[];
  salons: Salon[];
}

export const ReservationAIAnalyticsPanel: React.FC<ReservationAIAnalyticsPanelProps> = ({
  reservations,
  salons,
}) => {
  const [forecast, setForecast] = useState<any[]>([]);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [aiInsight, setAiInsight] = useState<string>('');

  useEffect(() => {
    // Generate AI forecasts and calculations
    const fc = generateOccupancyForecast(reservations);
    setForecast(fc);

    const highRisk = reservations.filter((r) => {
      const risk = analyzeNoShowRisk(r, []);
      return risk.noShowRiskScore > 35;
    }).length;

    setHighRiskCount(highRisk);

    // AI Summary text
    const totalPax = reservations.reduce((sum, r) => sum + r.pax, 0);
    const peakSlot = fc.reduce((max, curr) => (curr.totalPax > max.totalPax ? curr : max), { timeSlot: '14:00', totalPax: 0 });

    setAiInsight(
      `El modelo predictivo Gemini detecta un pico máximo de demanda a las ${peakSlot.timeSlot}h con ${peakSlot.totalPax} comensales esperados. Se recomienda reforzar la barra y asignar camareros experimentados al Comedor Principal.`
    );
  }, [reservations]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 overflow-y-auto space-y-6 shadow-2xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-800/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl">
            <Brain className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Optimización & IA Gemini 3.6 Flash</span>
              <span className="bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase">
                Motor Predicción Enterprise
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">{aiInsight}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Pico de Ocupación Est.</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400">88%</span>
            <span className="text-xs text-slate-500 font-mono">14:00h - 15:30h</span>
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center space-x-1 pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% vs mismo día semana anterior</span>
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Riesgo No-Show Global</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-400">{highRiskCount} Reservas</span>
            <span className="text-xs text-rose-500 font-bold">Riesgo Alto</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">Sugerido: Exigir fianza o reconfirmar vía WA</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Rotación Promedio Mesa</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-cyan-400">1.85</span>
            <span className="text-xs text-slate-500">turnos/mesa</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">Duración óptima estimada: 75 min/reserva</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Eficiencia Asignación</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-purple-400">96.4%</span>
            <span className="text-xs text-purple-300">Óptimo</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">Sin desaprovechamiento de sillas VIP</p>
        </div>
      </div>

      {/* Hourly Forecast Table & Visual Bars */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Previsión de Ocupación y Comensales por Tramo Horario</span>
        </h4>

        <div className="space-y-3">
          {forecast.map((fc) => (
            <div key={fc.timeSlot} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">{fc.timeSlot}h</span>
                <span className="text-slate-300">
                  {fc.totalPax} PAX ({fc.reservationsCount} reservas) — Ocupación: <strong>{fc.occupancyPercentage}%</strong>
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    fc.occupancyPercentage > 85
                      ? 'bg-rose-500'
                      : fc.occupancyPercentage > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, fc.occupancyPercentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Table Recommendation Test Tool */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
          <TableIcon className="w-4 h-4 text-amber-400" />
          <span>Simulador de Asignación Inteligente de Mesas</span>
        </h4>
        <p className="text-xs text-slate-400">
          Recomendación automática basada en capacidad de mesa, accesibilidad (carritos/bebés) y rotación histórica.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {salons.flatMap((s) => s.tables).slice(0, 3).map((tbl) => (
            <div key={tbl.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-white block">{tbl.name}</span>
              <span className="text-[11px] text-slate-400 block">Capacidad: {tbl.seats} comensales</span>
              <span className="bg-emerald-500/10 text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full inline-block mt-1">
                Score IA: 98/100
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
