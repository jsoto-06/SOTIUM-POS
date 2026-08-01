import React, { useState } from 'react';
import { ProductionBatch } from '../../types/production';
import { getBatchExpirationStatus, sortBatchesFEFO, sortBatchesFIFO } from '../../services/inventoryService';
import { PackageCheck, ShieldCheck, AlertTriangle, Calendar, Filter, Clock, ArrowRight } from 'lucide-react';

interface BatchesTraceabilityManagerProps {
  batches: ProductionBatch[];
}

export const BatchesTraceabilityManager: React.FC<BatchesTraceabilityManagerProps> = ({ batches }) => {
  const [strategy, setStrategy] = useState<'FEFO' | 'FIFO'>('FEFO');
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(batches[0] || null);

  const sortedBatches = strategy === 'FEFO' ? sortBatchesFEFO(batches as any) : sortBatchesFIFO(batches as any);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-4 rounded-xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            <span>Lotes & Trazabilidad Completa FEFO / FIFO</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Control Sanitario UE, historial de fabricación, consumo por ración y alerta de fechas límite
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Estrategia de Salida:</span>
          {(['FEFO', 'FIFO'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                strategy === s
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s} {s === 'FEFO' ? '(Primero Expira)' : '(Primero Entra)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Batches Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                  <th className="p-3">Lote</th>
                  <th className="p-3">Receta / Producto</th>
                  <th className="p-3">Fabricado</th>
                  <th className="p-3">Caducidad</th>
                  <th className="p-3 text-right">Stock Actual</th>
                  <th className="p-3">Estado FEFO</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedBatches.map((b: any) => {
                  const status = getBatchExpirationStatus(b.expirationDate);
                  const isSelected = selectedBatch?.id === b.id;

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBatch(b)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition ${
                        isSelected ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="p-3 font-mono text-amber-400 font-bold">{b.batchNumber}</td>
                      <td className="p-3 font-bold text-white">{b.recipeName}</td>
                      <td className="p-3 text-slate-300 font-mono">{b.manufacturingDate}</td>
                      <td className="p-3 text-slate-300 font-mono">{b.expirationDate}</td>
                      <td className="p-3 font-mono text-right text-amber-400 font-bold">
                        {b.currentQuantity} / {b.initialQuantity} {b.unit}
                      </td>
                      <td className="p-3">
                        {status === 'EXPIRED' ? (
                          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            Caducado
                          </span>
                        ) : status === 'URGENT' ? (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                            Urgente (Uso Inmediato)
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            Óptimo
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-xs text-amber-400 font-bold hover:underline">
                          Trazabilidad &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traceability Details Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Trazabilidad Sanitaria del Lote</span>
          </h3>

          {selectedBatch ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">Identificador Lote</span>
                <span className="font-mono text-amber-400 font-extrabold text-sm">{selectedBatch.batchNumber}</span>
                <span className="text-slate-400 block mt-1">Receta: <strong className="text-white">{selectedBatch.recipeName}</strong></span>
                <span className="text-slate-400 block">Operario: <strong className="text-white">{selectedBatch.operatorName}</strong></span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Historial de Eventos (Logs)</h4>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 max-h-60 overflow-y-auto">
                  {selectedBatch.traceabilityLog && selectedBatch.traceabilityLog.length > 0 ? (
                    selectedBatch.traceabilityLog.map((log, i) => (
                      <div key={i} className="text-[11px] text-slate-400 border-l-2 border-amber-500 pl-2 py-0.5">
                        {log}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">Sin registros adicionales.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Selecciona un lote para ver la trazabilidad.</p>
          )}
        </div>
      </div>
    </div>
  );
};
