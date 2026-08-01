import React, { useState } from 'react';
import { BatchControl, Warehouse } from '../../types/inventory';
import { getBatchExpirationStatus, sortBatchesFEFO } from '../../services/inventoryService';
import { AlertTriangle, ShieldAlert, CheckCircle2, Calendar, Clock, Layers, Filter, Plus, Box } from 'lucide-react';

interface BatchesExpirationManagerProps {
  batches: BatchControl[];
  warehouses: Warehouse[];
  onAddBatch: (batch: BatchControl) => void;
  onUpdateBatch: (batch: BatchControl) => void;
}

export const BatchesExpirationManager: React.FC<BatchesExpirationManagerProps> = ({
  batches,
  warehouses,
  onAddBatch,
  onUpdateBatch,
}) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXPIRED' | 'URGENT' | 'WARNING'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fefoSorted = sortBatchesFEFO(batches);

  const filteredBatches = fefoSorted.filter((b) => {
    const matchesWh = selectedWarehouse === 'ALL' || b.warehouseId === selectedWarehouse;
    const status = getBatchExpirationStatus(b.expirationDate);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'EXPIRED' && status === 'EXPIRED') ||
      (statusFilter === 'URGENT' && status === 'URGENT') ||
      (statusFilter === 'WARNING' && (status === 'URGENT' || status === 'WARNING'));
    return matchesWh && matchesStatus;
  });

  const expiredCount = batches.filter((b) => getBatchExpirationStatus(b.expirationDate) === 'EXPIRED').length;
  const urgentCount = batches.filter((b) => getBatchExpirationStatus(b.expirationDate) === 'URGENT').length;
  const warningCount = batches.filter((b) => getBatchExpirationStatus(b.expirationDate) === 'WARNING').length;

  const getStatusBadge = (expDate: string) => {
    const status = getBatchExpirationStatus(expDate);
    switch (status) {
      case 'EXPIRED':
        return (
          <span className="bg-red-950 text-red-400 border border-red-500/50 px-2.5 py-1 rounded-xl font-mono text-[10px] font-black uppercase flex items-center space-x-1 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 inline" />
            <span>CADUCADO</span>
          </span>
        );
      case 'URGENT':
        return (
          <span className="bg-rose-950 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 inline text-rose-400" />
            <span>URGENTE (&lt;7 DÍAS)</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="bg-amber-950 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 inline text-amber-400" />
            <span>ATENCIÓN (&lt;15 DÍAS)</span>
          </span>
        );
      default:
        return (
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-400" />
            <span>EN FECHA SEGURO</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Expiration Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Lotes Caducados</span>
            <span className="text-2xl font-black text-red-400 font-mono">{expiredCount}</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-500/50" />
        </div>

        <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Caducidad Urgente (&lt;7 días)</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{urgentCount}</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-400/50" />
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Caducidad Próxima (&lt;15 días)</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{warningCount}</span>
          </div>
          <Clock className="w-8 h-8 text-amber-400/50" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-black text-white">Control de Lotes & FEFO (First Expired, First Out)</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Todos los Almacenes</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="EXPIRED">Solo Caducados</option>
            <option value="URGENT">Solo Urgentes (&lt;7d)</option>
            <option value="WARNING">Alertas (&lt;15d)</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Nº Lote</th>
                <th className="p-3">Artículo / Materia Prima</th>
                <th className="p-3">Almacén</th>
                <th className="p-3">Fecha Fabricación</th>
                <th className="p-3">Fecha Caducidad</th>
                <th className="p-3 text-right">Stock Lote</th>
                <th className="p-3 text-right">Coste Lote</th>
                <th className="p-3 text-center">Estado Caducidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono text-xs">
                    No hay lotes que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">{batch.batchNumber}</td>
                    <td className="p-3 font-bold text-white">{batch.articleName}</td>
                    <td className="p-3 text-slate-400">{batch.warehouseName}</td>
                    <td className="p-3 font-mono text-slate-400">{batch.manufacturingDate}</td>
                    <td className="p-3 font-mono font-bold text-amber-300">{batch.expirationDate}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {batch.currentQuantity} / {batch.initialQuantity}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">{batch.costPrice.toFixed(2)} €</td>
                    <td className="p-3 text-center">{getStatusBadge(batch.expirationDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
