import React, { useState } from 'react';
import { AuditLogEntry } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { FileText, Search, Download, ShieldCheck, Eye, RefreshCw } from 'lucide-react';

interface Props {
  auditLogs: AuditLogEntry[];
}

export const AuditLogTab: React.FC<Props> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>(auditLogs);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.userName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q)
    );
  });

  const handleRefresh = () => {
    setLogs(backofficeService.getAuditLogs());
  };

  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,Usuario,Acción,Módulo,Entidad,IP,Hash\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.userName}","${l.action}","${l.module}","${l.entity}","${l.ipAddress}","${l.integrityHash}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SotiumPOS_Audit_Logs_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Registro de Auditoría Inmutable Enterprise
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Trazabilidad completa de operaciones: Quién, Qué, Cuándo, Desde dónde, Diff de cambios y Hash de integridad SHA-256.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por usuario, acción, módulo o entidad..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Audit table */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp / ID</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Acción Registrada</th>
                <th className="p-3">Entidad Target</th>
                <th className="p-3">IP / Dispositivo</th>
                <th className="p-3 text-right">Inspeccionar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-slate-300">
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">{log.id}</div>
                  </td>
                  <td className="p-3 font-medium text-white">{log.userName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 font-mono text-[10px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-emerald-400">{log.action}</td>
                  <td className="p-3 font-mono text-slate-400">{log.entity}</td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">
                    <div>{log.ipAddress}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{log.device}</div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded transition-colors"
                      title="Ver Detalles y Diff"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Detalles del Registro de Auditoría
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-800 p-2.5 rounded">
                <span className="text-slate-400 block text-[10px]">TIMESTAMP:</span>
                <span className="text-white">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded">
                <span className="text-slate-400 block text-[10px]">USUARIO:</span>
                <span className="text-amber-300">{selectedLog.userName}</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded">
                <span className="text-slate-400 block text-[10px]">ACCIÓN:</span>
                <span className="text-emerald-400 font-bold">{selectedLog.action}</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded">
                <span className="text-slate-400 block text-[10px]">INTEGRIDAD HASH:</span>
                <span className="text-slate-300 text-[10px] truncate block">{selectedLog.integrityHash}</span>
              </div>
            </div>

            {selectedLog.changesBefore && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-rose-400 block">Valores Anteriores (Before):</span>
                <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.changesBefore, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.changesAfter && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-400 block">Valores Nuevos (After):</span>
                <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.changesAfter, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
