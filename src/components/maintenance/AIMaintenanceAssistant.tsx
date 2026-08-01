import React, { useState, useEffect } from 'react';
import { AIMaintenanceInsight, Asset } from '../../types/maintenance';
import { MaintenanceAIService } from '../../services/maintenanceAIService';
import { Sparkles, AlertTriangle, TrendingUp, RefreshCw, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';

interface AIMaintenanceAssistantProps {
  assets: Asset[];
  insights: AIMaintenanceInsight[];
}

export const AIMaintenanceAssistant: React.FC<AIMaintenanceAssistantProps> = ({
  assets,
  insights: initialInsights,
}) => {
  const [insights, setInsights] = useState<AIMaintenanceInsight[]>(initialInsights);
  const [loading, setLoading] = useState(false);

  const handleRefreshAI = async () => {
    setLoading(true);
    try {
      const res = await MaintenanceAIService.analyzeAssetMaintenance(assets, [], []);
      setInsights(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-5 rounded-xl border border-amber-500/30 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 border border-amber-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>IA Gemini - Motor de Mantenimiento Predictivo</span>
            </h2>
            <p className="text-amber-200/80 text-xs mt-0.5">
              Predicción de averías, detección de anomalías, cálculo de coste futuro y recomendación de sustitución de activos
            </p>
          </div>
        </div>

        <button
          onClick={handleRefreshAI}
          disabled={loading}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analizando...' : 'Recalcular con Gemini'}</span>
        </button>
      </div>

      {/* Grid of AI Asset Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.assetId}
            className={`bg-slate-900 border rounded-xl p-5 space-y-4 ${
              ins.recommendedReplacement
                ? 'border-rose-500/50 bg-rose-950/10'
                : ins.excessiveMaintenanceFlag
                ? 'border-amber-500/50 bg-amber-950/10'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">{ins.assetName}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Vida útil predicha restante: <strong className="text-amber-300 font-mono">{ins.predictedUsefulLifeMonths} meses</strong>
                </div>
              </div>

              {ins.recommendedReplacement ? (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  RECOMENDADA SUSTITUCIÓN
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ESTADO SALUDABLE
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500">Riesgo de Avería:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        ins.anomalyScore > 60 ? 'bg-rose-500' : ins.anomalyScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${ins.anomalyScore}%` }}
                    />
                  </div>
                  <span className="font-bold font-mono text-white">{ins.anomalyScore}%</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Fallo estimado: <strong className="text-rose-300">{ins.predictiveBreakdownDate}</strong>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500">Estimación Coste Futuro (12m):</span>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {ins.futureCostEstimate.toFixed(2)}€
                </div>
                <div className="text-[10px] text-slate-400">
                  Mantenimiento Excesivo: <strong className={ins.excessiveMaintenanceFlag ? 'text-amber-400' : 'text-slate-400'}>{ins.excessiveMaintenanceFlag ? 'SÍ' : 'NO'}</strong>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <span className="font-semibold text-amber-300 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Explicación del Diagnóstico IA:</span>
              </span>
              <p className="text-slate-300 leading-relaxed">{ins.explanation}</p>
            </div>

            {/* Actionable recommendations */}
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Recomendaciones Ejecutivas:</span>
              <div className="space-y-1">
                {ins.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
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
