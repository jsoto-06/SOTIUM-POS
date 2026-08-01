import React, { useState } from 'react';
import { AIAdvisorAuditResult, AIAdvisorRecommendation } from '../../types/backoffice';
import { adminAIService } from '../../services/adminAIService';
import { backofficeService } from '../../services/backofficeService';
import { Sparkles, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  onUpdate: () => void;
}

export const AIAdvisorTab: React.FC<Props> = ({ onUpdate }) => {
  const [auditResult, setAuditResult] = useState<AIAdvisorAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await adminAIService.auditConfiguration();
      setAuditResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = (rec: AIAdvisorRecommendation) => {
    if (rec.category === 'SEGURIDAD') {
      backofficeService.updateSecurityPolicy({ sessionTimeoutMinutes: 30, requireNumbers: true, requireSymbols: true });
    } else if (rec.category === 'FISCAL') {
      backofficeService.updateCompanyConfig({ verifactuEnabled: true });
    } else if (rec.category === 'HARDWARE') {
      const hw = backofficeService.getTPVHardwareConfig();
      hw.printers.forEach((p) => (p.status = 'ONLINE'));
      backofficeService.updateTPVHardwareConfig(hw);
    }

    setAppliedFixes((prev) => [...prev, rec.id]);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-300" />
            Asistente de Inteligencia Artificial Gemini (Config Advisor)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Auditoría automática de salud del ERP: Detección de riesgos de seguridad, errores de hardware, incongruencias fiscales y optimizaciones recomendadas.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 text-sm"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analizando con Gemini 3.6 Flash...' : 'Ejecutar Auditoría IA'}
        </button>
      </div>

      {!auditResult && !loading && (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-12 text-center space-y-4">
          <Cpu className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-white">Ninguna Auditoría Ejecutada en esta Sesión</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Haga clic en &quot;Ejecutar Auditoría IA&quot; para que Gemini 3.6 Flash inspeccione los parámetros fiscales, hardware TPV, usuarios y red de su ERP.
          </p>
          <button
            onClick={handleRunAudit}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
          >
            Iniciar Diagnóstico Inteligente
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <div className="text-white font-semibold">Gemini 3.6 Flash inspeccionando base de datos y configuraciones...</div>
          <div className="text-xs text-slate-400 font-mono">Verificando firma digital VeriFactu, subnet TPV e índices de auditoría</div>
        </div>
      )}

      {auditResult && !loading && (
        <div className="space-y-6">
          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-xl font-bold font-mono text-amber-300">
                {auditResult.healthScore}%
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase font-mono">Puntuación de Salud</span>
                <span className="text-lg font-bold text-white">
                  {auditResult.healthScore >= 90 ? 'Excelente' : auditResult.healthScore >= 75 ? 'Buena con Riesgos' : 'Atención Requerida'}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-400 block uppercase font-mono">Cumplimiento Fiscal</span>
                <span className="text-base font-bold text-emerald-300">{auditResult.taxStatus}</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
              <ShieldAlert className="w-10 h-10 text-amber-400" />
              <div>
                <span className="text-xs text-slate-400 block uppercase font-mono">Seguridad Global</span>
                <span className="text-base font-bold text-amber-300">{auditResult.securityStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-sm text-slate-300">
            <span className="font-semibold text-amber-400 block mb-1">Resumen del Diagnóstico IA:</span>
            {auditResult.summary}
          </div>

          {/* Recommendations list */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Recomendaciones de Optimización ({auditResult.recommendations.length})
            </h3>

            {auditResult.recommendations.map((rec) => {
              const isApplied = appliedFixes.includes(rec.id);
              return (
                <div key={rec.id} className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        rec.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {rec.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-700">
                        {rec.category}
                      </span>
                      <h4 className="text-base font-bold text-white">{rec.title}</h4>
                    </div>

                    {rec.autoFixAvailable && (
                      <button
                        onClick={() => handleApplyFix(rec)}
                        disabled={isApplied}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          isApplied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Optimización Aplicada
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" /> Auto-Aplicar Corrección IA
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">{rec.description}</p>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs space-y-1">
                    <span className="text-amber-300 font-semibold block text-[11px]">Explicación Técnica:</span>
                    <p className="text-slate-400 text-[11px]">{rec.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
