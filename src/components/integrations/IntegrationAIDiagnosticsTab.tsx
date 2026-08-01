import React, { useState } from 'react';
import { IntegrationAIDiagnosis } from '../../types/integration';
import { Sparkles, AlertTriangle, CheckCircle2, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface IntegrationAIDiagnosticsTabProps {
  onRunAudit: () => Promise<IntegrationAIDiagnosis>;
}

export const IntegrationAIDiagnosticsTab: React.FC<IntegrationAIDiagnosticsTabProps> = ({ onRunAudit }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<IntegrationAIDiagnosis | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const res = await onRunAudit();
      setDiagnosis(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 p-5 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Auditoría de Integraciones Gemini 3.6 Flash</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Diagnóstico predictivo de APIs lentas, webhooks fallidos, cuellos de botella de red y sugerencias de optimización.
            </p>
          </div>
        </div>

        <button
          onClick={handleAudit}
          disabled={loading}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analizando con Gemini...' : 'Ejecutar Auditoría IA'}</span>
        </button>
      </div>

      {/* Results View */}
      {diagnosis && (
        <div className="space-y-6">
          {/* Health Score & Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider mb-2">Puntuación Salud Global</span>
              <div className="relative flex items-center justify-center">
                <span className="text-4xl font-extrabold font-mono text-emerald-400">{diagnosis.healthScore}%</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 rounded font-mono mt-3">
                OPTIMAL STATE
              </span>
            </div>

            <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Resumen Ejecutivo IA</span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{diagnosis.summary}</p>
              <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                Auditoría ejecutada: {new Date(diagnosis.timestamp).toLocaleString('es-ES')} | ID: #{diagnosis.id}
              </div>
            </div>
          </div>

          {/* Issues Detected */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Incidencias Detectadas ({diagnosis.detectedIssues.length})</span>
            </h3>

            <div className="space-y-3">
              {diagnosis.detectedIssues.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No se detectaron problemas críticos en los conectores activos.</p>
              ) : (
                diagnosis.detectedIssues.map((iss, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>{iss.component}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          iss.severity === 'HIGH'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : iss.severity === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {iss.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{iss.issue}</p>

                    <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded text-xs text-amber-300 font-sans flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Recomendación:</strong> {iss.recommendation}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Recomendaciones de Optimización de Rendimiento</span>
            </h3>

            <ul className="space-y-2">
              {diagnosis.optimizationTips.map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-850">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
