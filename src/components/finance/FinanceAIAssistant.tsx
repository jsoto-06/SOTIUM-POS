import React from 'react';
import { FinanceAIPrediction } from '../../types/finance';
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Activity,
} from 'lucide-react';

interface Props {
  prediction: FinanceAIPrediction;
}

export const FinanceAIAssistantView: React.FC<Props> = ({ prediction }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner IA CFO */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Sotium AI Gemini Financial Intelligence Agent</span>
            </div>
            <h2 className="text-xl font-bold text-white">Diagnóstico Financiero Predictivo & Auditoría IA</h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Modelos de inteligencia artificial de Gemini analizan en tiempo real los asientos contables, flujos de tesorería, variaciones de margen y arqueos para detectar fraudes, optimizar la caja y predecir el comportamiento financiero a 90 días.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 text-center space-y-1 backdrop-blur-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Índice Salubridad Financiera</p>
            <p className="text-3xl font-extrabold text-amber-400 font-mono">{prediction.liquidityScore} / 100</p>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              Salud Excelente
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Runway de Liquidez</p>
          <p className="text-xl font-bold text-cyan-400 mt-1 font-mono">{prediction.runwayMonths} Meses</p>
          <p className="text-[10px] text-slate-500 mt-1">Capacidad para operar sin nuevos ingresos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Ventas Diarias Punto Equilibrio</p>
          <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{prediction.breakEvenDailySales.toFixed(2)} € / día</p>
          <p className="text-[10px] text-slate-500 mt-1">Cubrimiento de costes fijos diarios</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Previsión Caja 30 Días</p>
          <p className="text-xl font-bold text-amber-400 mt-1 font-mono">+{prediction.cashflowForecast30Days.toLocaleString('es-ES')} €</p>
          <p className="text-[10px] text-slate-500 mt-1">Superávit proyectado a final de mes</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Previsión EBITDA Mensual</p>
          <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">+{prediction.predictedMonthlyEbitda.toLocaleString('es-ES')} €</p>
          <p className="text-[10px] text-slate-500 mt-1">Margen operativo limpio estimado</p>
        </div>
      </div>

      {/* Fraud & Anomaly Alerts Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-bold text-white">Alertas de Fraude y Anomalías en Asientos / Caja</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prediction.fraudAnomalyAlerts.map((alert) => (
            <div key={alert.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-400">{alert.title}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    alert.severity === 'ALTA'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300">{alert.description}</p>
              <div className="text-[11px] bg-slate-900 p-2 rounded text-slate-400 flex items-center space-x-1.5 border border-slate-800">
                <BrainCircuit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Action: {alert.suggestedAction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic AI Recommendations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Recomendaciones Estratégicas CFO de Gemini</h3>
        </div>

        <div className="space-y-3">
          {prediction.strategicRecommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200">
              <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
