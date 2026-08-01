import React, { useState } from 'react';
import { SyncOverview } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { RefreshCw, Database, Server, Wifi, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  syncOverview: SyncOverview;
  onUpdate: () => void;
}

export const SyncDiagnosisTab: React.FC<Props> = ({ syncOverview: initialOverview, onUpdate }) => {
  const [overview, setOverview] = useState<SyncOverview>(initialOverview);
  const [isSyncing, setIsSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = backofficeService.forceSyncTrigger();
      setOverview(res);
      setIsSyncing(false);
      onUpdate();
      setMsg('Sincronización manual forzada completada correctamente. SQLite y PostgreSQL 100% alineados.');
      setTimeout(() => setMsg(''), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-400" />
            Diagnóstico de Sincronización Offline (SQLite ↔ PostgreSQL)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Monitor de colas de transacciones locales TPV, reintentos automáticos de red y consistencia multisede.
          </p>
        </div>

        <button
          onClick={handleForceSync}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sincronizando...' : 'Forzar Sincronización Ahora'}
        </button>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
          <span className="text-xs text-slate-400">Estado de Red / Sync</span>
          <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
            <Wifi className="w-4 h-4" /> {overview.overallStatus}
          </div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
          <span className="text-xs text-slate-400">Transacciones Pendientes</span>
          <div className="text-xl font-bold text-amber-300 font-mono">{overview.pendingQueueCount}</div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
          <span className="text-xs text-slate-400">Latencia Servidor Cloud</span>
          <div className="text-xl font-bold text-cyan-400 font-mono">{overview.latencyMs} ms</div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
          <span className="text-xs text-slate-400">Registros SQLite / Postgres</span>
          <div className="text-base font-bold text-white font-mono">{overview.sqliteRecordCount} / {overview.postgresRecordCount}</div>
        </div>
      </div>

      {/* Queue items */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-base font-semibold text-amber-400">Últimas Transacciones Procesadas en Cola</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">ID / Tabla Target</th>
                <th className="p-3">Record ID</th>
                <th className="p-3">Operación</th>
                <th className="p-3">Reintentos</th>
                <th className="p-3">Último Intento</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {overview.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-white">{item.table}</td>
                  <td className="p-3 font-mono text-amber-300">{item.recordId}</td>
                  <td className="p-3 font-mono text-slate-300">{item.operation}</td>
                  <td className="p-3 font-mono text-slate-400">{item.retryCount}</td>
                  <td className="p-3 font-mono text-slate-400">{new Date(item.lastAttemptAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[10px]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
