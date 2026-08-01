import React, { useState } from 'react';
import { CorporateAIDiagnosis } from '../../types/multicompany';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  DollarSign,
  Building2,
  BrainCircuit,
  RefreshCw,
} from 'lucide-react';

interface Props {
  diagnosis: CorporateAIDiagnosis;
}

export const CorporateAIEngine: React.FC<Props> = ({ diagnosis: initialDiagnosis }) => {
  const [diagnosis, setDiagnosis] = useState<CorporateAIDiagnosis>(initialDiagnosis);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleReanalyze = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDiagnosis({
        ...diagnosis,
        analysisTimestamp: new Date().toISOString(),
      });
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
              <BrainCircuit className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider">
                  IA Gemini Corporate Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Último análisis: {new Date(diagnosis.analysisTimestamp).toLocaleTimeString('es-ES')}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Diagnóstico IA Inteligente Multiempresa & Consolidación
              </h2>
            </div>
          </div>

          <button
            onClick={handleReanalyze}
            disabled={isRefreshing}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Re-analizar Grupo con Gemini 1.5 Pro</span>
          </button>
        </div>

        {/* Global Health Score Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div className="text-3xl font-black text-emerald-400 font-mono">{diagnosis.overallHealthScore}/100</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Índice Salud Operativa</span>
              <span className="text-xs text-slate-200">Eficiencia Excelente</span>
            </div>
          </div>

          <div className="col-span-2 bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-xs text-slate-300">
            <span className="text-amber-400 font-bold block mb-1">Resumen Ejecutivo Gemini AI:</span>
            <p className="leading-relaxed text-slate-300">{diagnosis.comparativeAnalysis}</p>
          </div>
        </div>
      </div>

      {/* Grid of AI Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Optimization Opportunities */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Oportunidades de Optimización de Costes</h3>
          </div>

          <div className="space-y-3">
            {diagnosis.costOptimizationOpportunities.map((opt, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <span className="bg-slate-800 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    {opt.companyName}
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Ahorro estimado: +{opt.potentialSavings.toLocaleString('es-ES')} €/año
                  </span>
                </div>
                <p className="text-xs font-bold text-white">{opt.issue}</p>
                <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                  💡 <strong className="text-amber-400">Recomendación Gemini:</strong> {opt.actionableAdvice}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Predictions next quarter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Predicciones de Facturación Próximo Trimestre</h3>
          </div>

          <div className="space-y-3">
            {diagnosis.salesPredictions.map((pred, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{pred.companyName}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{pred.projectedGrowthNextQuarter}% Crecimiento
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, pred.projectedGrowthNextQuarter * 4)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>Previsión Facturación:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {pred.predictedRevenue.toLocaleString('es-ES')} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Alerts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Alertas Estratégicas y de Cumplimiento</h3>
          </div>

          <div className="space-y-3">
            {diagnosis.strategicAlerts.map((alert) => (
              <div key={alert.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-amber-400 uppercase">{alert.companyOrVenue}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      alert.severity === 'ALTA'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : alert.severity === 'MEDIA'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    Severidad {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Directrices de Gestión Estratégica</h3>
          </div>

          <ul className="space-y-3">
            {diagnosis.recommendations.map((rec, idx) => (
              <li key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 flex items-start space-x-3">
                <span className="bg-amber-500/10 text-amber-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
