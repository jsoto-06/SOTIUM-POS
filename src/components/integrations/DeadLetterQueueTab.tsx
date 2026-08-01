import React from 'react';
import { DLQItem } from '../../types/integration';
import { AlertTriangle, RefreshCw, Trash2, Sparkles, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface DeadLetterQueueTabProps {
  dlqItems: DLQItem[];
  onRetry: (id: string) => void;
  onPurge: (id: string) => void;
}

export const DeadLetterQueueTab: React.FC<DeadLetterQueueTabProps> = ({ dlqItems, onRetry, onPurge }) => {
  const pendingItems = dlqItems.filter((i) => i.status === 'PENDING');
  const resolvedItems = dlqItems.filter((i) => i.status === 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Dead Letter Queue (DLQ) & Colas de Fallo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión resiliente de eventos que han agotado el límite de reintentos automáticos de sincronización o webhooks.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-red-950/80 border border-red-800 text-red-300 px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Pendientes: {pendingItems.length}</span>
          </div>
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span>Resueltos: {resolvedItems.length}</span>
          </div>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eventos en Espera de Acción Manal</h3>

        {pendingItems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Cola DLQ limpia y sin errores pendientes.</p>
            <p className="text-xs text-slate-500 mt-1">
              Todos los conectores y webhooks han procesado sus eventos con éxito.
            </p>
          </div>
        ) : (
          pendingItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{item.connectorName}</span>
                      <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-mono border border-red-800">
                        {item.eventType}
                      </span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">ID DLQ: #{item.id}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRetry(item.id)}
                    className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-amber-500/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar Ahora</span>
                  </button>

                  <button
                    onClick={() => onPurge(item.id)}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Descartar</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs font-mono text-red-400">
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">
                  Mensaje de Error Excepcional
                </span>
                {item.errorMessage}
              </div>

              {/* Gemini AI Diagnosis Card */}
              {item.aiDiagnosis && (
                <div className="bg-amber-950/30 border border-amber-800/60 rounded-lg p-3.5 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Diagnóstico de Causa Raíz IA Gemini 3.6 Flash:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px] pl-5">{item.aiDiagnosis}</p>
                </div>
              )}

              {/* Telemetry Footer */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 font-mono">
                <div>
                  Intentos agotados: <span className="text-white font-bold">{item.attemptCount}</span> / {item.maxAttempts}
                </div>
                <div>
                  Primer fallo: {item.firstFailedAt.substring(11, 19)}h | Último reintento:{' '}
                  {item.lastAttemptAt.substring(11, 19)}h
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
