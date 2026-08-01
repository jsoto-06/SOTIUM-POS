import React from 'react';
import { DeliveryAIPrediction, DeliveryAnalytics, DeliveryOrder } from '../../types/delivery';
import { Sparkles, AlertTriangle, CheckCircle2, Clock, UserCheck, TrendingUp, Zap } from 'lucide-react';

interface DeliveryAIAnalyticsPanelProps {
  analytics: DeliveryAnalytics;
  predictions: DeliveryAIPrediction[];
  onApplyDriverRecommendation: (orderId: string, driverId: string) => void;
}

export const DeliveryAIAnalyticsPanel: React.FC<DeliveryAIAnalyticsPanelProps> = ({
  analytics,
  predictions,
  onApplyDriverRecommendation,
}) => {
  const highRiskPredictions = predictions.filter(
    (p) => p.riskLevel === 'ALTO' || p.riskLevel === 'CRITICO' || p.riskLevel === 'MEDIO'
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Asistente Gemini IA: Predicción de Retrasos & Detección Precoz de Incidencias</span>
            </h3>
            <p className="text-xs text-slate-400">
              Modelos predictivos para cálculo de ETA preciso, recomendación de repartidores y optimización de despacho
            </p>
          </div>
        </div>

        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1.5 rounded-xl font-mono font-bold flex items-center gap-1.5">
          <Zap className="w-4 h-4" /> Gemini AI Engine: MODEL ACTIVE
        </span>
      </div>

      {/* AI Risk Monitor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highRiskPredictions.map((pred) => (
          <div
            key={pred.orderId}
            className={`border rounded-2xl p-4 space-y-3 shadow-xl transition-all ${
              pred.riskLevel === 'CRITICO'
                ? 'bg-rose-950/20 border-rose-500/50'
                : pred.riskLevel === 'ALTO'
                ? 'bg-amber-950/20 border-amber-500/50'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-white">#{pred.orderCode}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  pred.riskLevel === 'CRITICO'
                    ? 'bg-rose-600 text-white'
                    : pred.riskLevel === 'ALTO'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                Riesgo {pred.riskLevel}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-300 font-medium flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{pred.aiExplanation}</span>
              </p>
              {pred.predictedDelayMinutes > 0 && (
                <p className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Retraso estimado: +{pred.predictedDelayMinutes} minutos
                </p>
              )}
            </div>

            {pred.routeGroupingSuggestion && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-amber-300 space-y-0.5">
                <span className="font-bold block">💡 Sugerencia Agrupación:</span>
                <p className="text-slate-400">{pred.routeGroupingSuggestion}</p>
              </div>
            )}

            {pred.suggestedDriverId && (
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Repartidor recomendado:</span>
                <button
                  onClick={() => onApplyDriverRecommendation(pred.orderId, pred.suggestedDriverId!)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Asignar a {pred.suggestedDriverName}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
