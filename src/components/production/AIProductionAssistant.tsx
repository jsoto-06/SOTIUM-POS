import React, { useState, useEffect } from 'react';
import { Recipe, ProductionOrder, ProductionBatch, ProductionWaste, AIProductionInsight } from '../../types/production';
import { ProductionAIService } from '../../services/productionAIService';
import { Sparkles, Brain, Lightbulb, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AIProductionAssistantProps {
  recipes: Recipe[];
  orders: ProductionOrder[];
  batches: ProductionBatch[];
  wasteRecords: ProductionWaste[];
}

export const AIProductionAssistant: React.FC<AIProductionAssistantProps> = ({
  recipes,
  orders,
  batches,
  wasteRecords,
}) => {
  const [insights, setInsights] = useState<AIProductionInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    ProductionAIService.generateProductionInsights(recipes, orders, batches, wasteRecords)
      .then((res) => {
        if (isMounted) {
          setInsights(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [recipes, orders, batches, wasteRecords]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-4 rounded-xl border border-amber-500/20 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Asistente IA Gemini de Producción & Escandallos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Predicción inteligente de consumo, optimización de márgenes de recetas, detección de mermas y recomendaciones con explicación técnica
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
          Gemini 2.5 Flash Engine
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-spin mb-3" />
          <p className="text-xs font-semibold">Generando recomendaciones inteligentes de producción...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition shadow-xl"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                      ins.type === 'OPTIMIZACION_COSTE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : ins.type === 'PREDICCION_CONSUMO'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : ins.type === 'DESPERDICIO_DETECTADO'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {ins.type.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Confianza {ins.confidenceScore}%
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white">{ins.title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{ins.description}</p>
                </div>

                <div className="mt-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase block mb-0.5">Acción Recomendada</span>
                    <p className="text-slate-200 font-medium">{ins.recommendedAction}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-0.5">Explicación del Algoritmo</span>
                    <p className="text-slate-400 italic text-[11px]">{ins.explanation}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3.5 py-1.5 rounded-lg text-xs transition shadow">
                  <span>Aplicar Recomendación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
