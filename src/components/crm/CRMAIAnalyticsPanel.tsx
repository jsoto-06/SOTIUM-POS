import React from 'react';
import { Customer, AICustomerPrediction, CRMAnalyticsSummary } from '../../types/crm';
import { Sparkles, AlertTriangle, TrendingUp, Award, Users, DollarSign, BrainCircuit, ArrowUpRight } from 'lucide-react';

interface CRMAIAnalyticsPanelProps {
  analytics: CRMAnalyticsSummary;
  aiPredictions: AICustomerPrediction[];
  onApplyRecommendation: (prediction: AICustomerPrediction) => void;
}

export const CRMAIAnalyticsPanel: React.FC<CRMAIAnalyticsPanelProps> = ({
  analytics,
  aiPredictions,
  onApplyRecommendation,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Clientes Activos</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-white">{analytics.activeCustomersCount}</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-500">{analytics.corporateCount} Clientes Empresa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ticket Medio Consumo</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">{analytics.averageTicket.toFixed(2)} €</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-400">+12% vs trimestre anterior</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Riesgo Abandono (Churn)</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-red-400">{analytics.churnAtRiskCount}</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] text-red-300">Inactividad &gt; 60 días</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Clientes VIP</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-amber-300">{analytics.vipCustomersCount}</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] text-amber-400/80">Niveles Oro y Platino</span>
        </div>
      </div>

      {/* Gemini AI Predictions & Recommendations Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Asistente IA Gemini: Detección de Fugas & Oportunidades VIP</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
                  Gemini Flash 2.5 Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Algoritmo de aprendizaje automático para prevención de churn y cálculo de consumo estimado futuro.
              </p>
            </div>
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiPredictions.map((pred) => (
            <div key={pred.customerId} className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-white">{pred.customerName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Consumo Futuro Est.: {pred.predictedNextSpend} €</span>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      pred.churnRiskScore > 70
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    Churn Risk: {pred.churnRiskScore}%
                  </span>
                </div>
              </div>

              {/* AI Explanation Box */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Explicación IA:</span>
                <p className="text-slate-300 italic">{pred.aiExplanation}</p>
              </div>

              {/* Action Button */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-semibold text-emerald-400">{pred.recommendedCampaign}</span>
                <button
                  onClick={() => onApplyRecommendation(pred)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                  <span>Ejecutar Acción</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
