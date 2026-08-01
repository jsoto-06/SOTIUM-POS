import React, { useState } from 'react';
import { AIPredictionItem, AIPredictionCategory } from '../../types/pos';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Users,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

interface BIGeminiPredictorProps {
  predictions: AIPredictionItem[];
  onGeneratePredictions: () => void;
  isLoading?: boolean;
}

export const BIGeminiPredictor: React.FC<BIGeminiPredictorProps> = ({
  predictions,
  onGeneratePredictions,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AIPredictionCategory | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = predictions.filter((p) => (selectedCategory === 'ALL' ? true : p.category === selectedCategory));

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <span>Sotium AI Predictor (Gemini 3.6 Flash)</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                Enterprise AI
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Predicciones de ventas, detección de fraude, alertas de stockout, optimización de turnos y sugerencias dinámicas con explicación técnica.
            </p>
          </div>
        </div>

        <button
          onClick={onGeneratePredictions}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Generando Inteligencia IA...' : 'Ejecutar Análisis IA Gemini'}</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Todas las Predicciones' },
          { id: 'SALES_FORECAST', label: 'Predicción Ventas' },
          { id: 'STOCKOUT_ALERT', label: 'Alertas Stockout' },
          { id: 'STAFFING_PLAN', label: 'Optimización Personal' },
          { id: 'ANOMALY_FRAUD', label: 'Anomalías & Fraude' },
          { id: 'PROMO_PRICING_SUGGESTION', label: 'Precios & Promos' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Predictions Cards List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-4 transition-all shadow-xl space-y-3 ${
                item.impactScore === 'CRITICAL'
                  ? 'border-red-500/40 bg-red-950/10'
                  : item.impactScore === 'HIGH'
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Title & Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                      item.impactScore === 'CRITICAL'
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : item.impactScore === 'HIGH'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    }`}
                  >
                    {item.impactScore === 'CRITICAL' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold text-white">{item.title}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          item.impactScore === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : item.impactScore === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        Impacto {item.impactScore}
                      </span>
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                        Confianza: {item.confidencePercent}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{item.summary}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(item.id)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex-shrink-0"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Actionable recommendation preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-300 font-semibold">{item.actionableRecommendation}</span>
                </div>

                <button
                  onClick={() => alert(`Acción ejecutada: ${item.actionableRecommendation}`)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold rounded-lg flex-shrink-0"
                >
                  Aplicar Sugerencia
                </button>
              </div>

              {/* Detailed Explanation Drawer */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl">
                  <h5 className="font-bold text-amber-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Explicación Técnica & Justificación del Modelo IA Gemini</span>
                  </h5>
                  <p className="leading-relaxed opacity-90">{item.detailedExplanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
