import React, { useState } from 'react';
import { HRAIPrediction } from '../../types/hr';
import { hrService } from '../../services/hrService';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Brain,
  Zap,
  RefreshCw,
  CheckCircle2,
  Users,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  predictions: HRAIPrediction[];
  onRefresh: () => void;
}

export const HRAIAssistant: React.FC<Props> = ({ predictions, onRefresh }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    await hrService.analyzeHRWithGemini();
    setIsAnalyzing(false);
    onRefresh();
  };

  const getImpactBadge = (impact: HRAIPrediction['impactScore']) => {
    switch (impact) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <h3 className="text-xl font-bold text-white">IA Gemini HR Advisor Enterprise</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Análisis predictivo en tiempo real de rotación de plantilla, riesgo de sobrecarga (burnout), falta de personal en horas punta, optimización de coste laboral y productividad por hora trabajada.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analizando con Gemini 2.5...' : 'Re-ejecutar Análisis IA'}</span>
        </button>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((pred) => (
          <div
            key={pred.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border uppercase ${getImpactBadge(pred.impactScore)}`}>
                  IMPACTO {pred.impactScore}
                </span>

                <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  {pred.confidencePercent}% Confianza
                </span>
              </div>

              <h4 className="font-bold text-white text-base mt-3">{pred.title}</h4>
              <p className="text-xs text-slate-300 font-medium mt-1">{pred.summary}</p>

              {/* Detailed Explanation */}
              <div className="mt-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                  Explicación Detallada Algorítmica:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{pred.detailedExplanation}</p>
              </div>
            </div>

            {/* Actionable Recommendation */}
            <div className="mt-4 pt-3 border-t border-slate-800 bg-amber-500/5 -mx-5 -mb-5 p-4 rounded-b-2xl border-t-amber-500/20">
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-400 block">Recomendación de Acción Inmediata:</span>
                  <p className="text-xs text-slate-200 mt-0.5">{pred.actionableRecommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
