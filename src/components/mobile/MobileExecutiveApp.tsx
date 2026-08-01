import React, { useState, useEffect, useCallback } from 'react';
import { MobileService } from '../../services/mobileService';
import { MobileAIService } from '../../services/mobileAIService';
import { ExecutiveKPI, AIExecutiveRecommendation } from '../../types/mobile';
import {
  TrendingUp,
  Sparkles,
  DollarSign,
  PieChart,
  Users,
  Calendar,
  Truck,
  Package,
  AlertCircle,
  HelpCircle,
  Send,
  Building2,
  Brain,
} from 'lucide-react';

export const MobileExecutiveApp: React.FC = React.memo(() => {
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [aiInsights, setAiInsights] = useState<AIExecutiveRecommendation[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [queryResponse, setQueryResponse] = useState<{ answer: string; explanation: string; kpisTriggered: string[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    const kpiList = MobileService.getExecutiveKPIs();
    setKpis(kpiList);

    const insights = await MobileAIService.getExecutiveAIInsights();
    setAiInsights(insights);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAskAI = useCallback(async () => {
    if (!prompt || prompt.trim().length < 2) return;
    setIsAiLoading(true);
    try {
      const res = await MobileAIService.answerExecutiveQuery(prompt);
      setQueryResponse(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  }, [prompt]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 space-y-4 font-sans">
      {/* Header Executive */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Dashboard Gerencial Móvil</h1>
            <p className="text-xs text-slate-400">
              Sotium POS Enterprise • Métricas BI & Asistente IA Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Real-time KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">{kpi.title}</span>
            <p className="text-lg font-black text-amber-400 font-mono my-1">{kpi.value}</p>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-max ${
                kpi.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {kpi.change}
            </span>
          </div>
        ))}
      </div>

      {/* Gemini AI Recommendations Section */}
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Recomendaciones Predictivas Gemini IA</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Modelo: Gemini 3.6 Flash</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight) => (
            <div key={insight.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-amber-300 text-xs">{insight.topic}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {(insight.confidence * 100).toFixed(0)}% Confianza
                </span>
              </div>

              <p className="text-slate-200 font-medium">{insight.recommendation}</p>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300 block mb-0.5">Explicación del Algoritmo:</span>
                {insight.explanation}
              </div>

              <div className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1 pt-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Acción Directa: {insight.actionableStep}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant Executive Query Section */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
        <h3 className="font-bold text-sm text-cyan-400 flex items-center space-x-2">
          <Brain className="w-4 h-4" />
          <span>Consultar al Asistente Gerencial IA</span>
        </h3>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Ej: ¿Cómo podemos mejorar el beneficio neto este mes?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleAskAI}
            disabled={isAiLoading}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consultar</span>
          </button>
        </div>

        {queryResponse && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div>
              <span className="text-amber-400 font-bold block mb-1">Respuesta Ejecutiva:</span>
              <p className="text-slate-200 font-medium">{queryResponse.answer}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block">Explicación Detallada:</span>
              <p>{queryResponse.explanation}</p>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold">KPIs Analizados:</span>
              <div className="flex space-x-1.5 flex-wrap">
                {queryResponse.kpisTriggered.map((k, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
