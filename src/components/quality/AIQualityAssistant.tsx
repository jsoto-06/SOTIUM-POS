import React, { useState, useEffect } from 'react';
import { QualityHaccpAIService, QualityAIAnalysisResult } from '../../services/qualityHaccpAIService';
import { Sparkles, ShieldAlert, CheckCircle2, RefreshCw, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

export const AIQualityAssistant: React.FC = () => {
  const [analysis, setAnalysis] = useState<QualityAIAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await QualityHaccpAIService.analyzeFoodSafetyStatus();
      setAnalysis(res);
    } catch (err) {
      console.error('Error running AI Quality analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header card with refresh button */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <span>Asistente de Inteligencia Sanitaria & APPCC (Powered by Gemini)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auditoría en tiempo real, detección de riesgos sanitarios, predicción de inspecciones y recomendación de acciones correctivas.
          </p>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analizando APPCC...' : 'Reanalizar Seguridad Alimentaria'}</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs font-mono">Ejecutando modelo de Inteligencia Sanitaria sobre lotes, temperaturas y registros...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Nivel de Riesgo Alimentario</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-black font-mono ${
                    analysis.riskLevel === 'BAJO'
                      ? 'text-emerald-400'
                      : analysis.riskLevel === 'MEDIO'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {analysis.riskLevel}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Índice de Cumplimiento APPCC</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {analysis.complianceScore}%
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Preparación para Inspección Sanitaria</span>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {analysis.predictiveReadinessScore}%
              </div>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Dictamen del Asistente Sanitarias IA</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800 italic">
              "{analysis.summary}"
            </p>
          </div>

          {/* Detected Risks List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Riesgos Detectados y Alertas Prioritarias ({analysis.detectedRisks.length})</span>
            </h3>

            {analysis.detectedRisks.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-lg text-center text-xs text-slate-400 border border-slate-800">
                ✓ No se ha detectado ningún riesgo activo. Los registros de temperatura, lotes y auditorías están limpios.
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.detectedRisks.map((risk, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono text-[10px] border border-cyan-500/20">
                          {risk.category}
                        </span>
                        <span>{risk.title}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                          risk.urgency === 'INMEDIATA'
                            ? 'bg-red-500 text-white animate-pulse'
                            : risk.urgency === 'PREVENTIVA'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {risk.urgency}
                      </span>
                    </div>

                    <p className="text-slate-300">{risk.description}</p>

                    <div className="bg-slate-900/70 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-amber-400 font-bold block flex items-center gap-1 text-[11px]">
                        <ArrowRight className="w-3.5 h-3.5" />
                        Acción Correctiva Recomendada:
                      </span>
                      <p className="text-slate-200 text-[11px] italic">{risk.suggestedCorrectiveAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recomendaciones Preventivas de Calidad</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-300">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};
