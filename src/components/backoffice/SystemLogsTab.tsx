import React, { useState } from 'react';
import { SystemLogEntry, LogLevel, SystemLogCategory } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Terminal, Search, Filter, AlertTriangle, Info, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  logs: SystemLogEntry[];
}

export const SystemLogsTab: React.FC<Props> = ({ logs: initialLogs }) => {
  const [logs, setLogs] = useState<SystemLogEntry[]>(initialLogs);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((l) => {
    if (filterLevel !== 'ALL' && l.level !== filterLevel) return false;
    if (filterCategory !== 'ALL' && l.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.message.toLowerCase().includes(q) || l.source.toLowerCase().includes(q);
    }
    return true;
  });

  const handleRefresh = () => {
    setLogs(backofficeService.getSystemLogs());
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px]">CRITICAL</span>;
      case 'ERROR':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px]">ERROR</span>;
      case 'WARNING':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px]">WARNING</span>;
      case 'INFO':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px]">INFO</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">DEBUG</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-amber-400" />
            Consola de Logs del Sistema, API & Diagnóstico
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Logs unificados de backend Node.js, SQLite offline, PostgreSQL cloud, Socket.IO y motor de IA Gemini.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refrescar Logs
        </button>
      </div>

      {/* Filter controls */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Nivel de Log</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          >
            <option value="ALL">Todos los Niveles</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="ERROR">ERROR</option>
            <option value="WARNING">WARNING</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Categoría del Subsistema</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="API">API REST</option>
            <option value="SQLITE">SQLITE</option>
            <option value="POSTGRES">POSTGRESQL</option>
            <option value="SOCKET_IO">SOCKET.IO</option>
            <option value="IA">IA GEMINI</option>
            <option value="SECURITY">SEGURIDAD</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Buscar Mensaje</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtro..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3 text-slate-500">
          <span>SOTIUM POS SYSTEM TELEMETRY MONITOR</span>
          <span>{filteredLogs.length} EVENTOS MOSTRADOS</span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-2 bg-slate-900/60 rounded border border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[10px] whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                {getLevelBadge(log.level)}
                <span className="text-amber-400 font-bold text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">[{log.category}]</span>
                <span className="text-slate-200">{log.message}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 self-end md:self-auto">
                <span>Fuente: {log.source}</span>
                {log.code && <span className="text-cyan-400 font-mono">({log.code})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
