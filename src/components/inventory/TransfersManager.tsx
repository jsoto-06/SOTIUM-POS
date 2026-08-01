import React, { useState } from 'react';
import { WarehouseTransfer, Article, Warehouse } from '../../types/inventory';
import { ArrowRightLeft, Plus, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

interface TransfersManagerProps {
  transfers: WarehouseTransfer[];
  articles: Article[];
  warehouses: Warehouse[];
  onExecuteTransfer: (transfer: WarehouseTransfer) => void;
}

export const TransfersManager: React.FC<TransfersManagerProps> = ({
  transfers,
  articles,
  warehouses,
  onExecuteTransfer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceWhId, setSourceWhId] = useState<string>(warehouses[0]?.id || '');
  const [targetWhId, setTargetWhId] = useState<string>(warehouses[1]?.id || warehouses[0]?.id || '');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWhId === targetWhId) {
      alert('El almacén de origen y destino no pueden ser el mismo.');
      return;
    }

    const sourceWh = warehouses.find((w) => w.id === sourceWhId);
    const targetWh = warehouses.find((w) => w.id === targetWhId);
    const article = articles.find((a) => a.id === selectedArticleId);

    if (!sourceWh || !targetWh || !article) {
      alert('Por favor, completa los datos del traspaso.');
      return;
    }

    const transfer: WarehouseTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      sourceWarehouseId: sourceWh.id,
      sourceWarehouseName: sourceWh.name,
      targetWarehouseId: targetWh.id,
      targetWarehouseName: targetWh.name,
      status: 'COMPLETED',
      requestedBy: 'Manuel Barman',
      approvedBy: 'Carlos Encargado',
      items: [
        {
          articleId: article.id,
          articleName: article.name,
          quantity,
          unit: article.unit,
        },
      ],
      notes: 'Traspaso directo auditado',
    };

    onExecuteTransfer(transfer);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <span>Traspasos y Transferencias Entre Almacenes</span>
          </h3>
          <p className="text-xs text-slate-400">
            Movimientos internos auditados de economato central a barras, cámaras o cocina
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Traspaso Directo</span>
        </button>
      </div>

      {/* Transfers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Nº Traspaso</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Almacén Origen</th>
                <th className="p-3">Almacén Destino</th>
                <th className="p-3">Artículos Traspasados</th>
                <th className="p-3">Solicitado Por</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono text-xs">
                    No hay traspasos registrados.
                  </td>
                </tr>
              ) : (
                transfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">{trf.transferNumber}</td>
                    <td className="p-3 font-mono text-slate-400">
                      {new Date(trf.date).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-bold text-red-400">{trf.sourceWarehouseName}</td>
                    <td className="p-3 font-bold text-emerald-400">{trf.targetWarehouseName}</td>
                    <td className="p-3">
                      {trf.items.map((it, idx) => (
                        <div key={idx} className="font-mono text-[11px] text-white">
                          • {it.articleName}: <strong className="text-amber-400">{it.quantity} {it.unit}</strong>
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-slate-400">{trf.requestedBy}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase">
                        COMPLETADO
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <span>Ejecutar Traspaso Directo entre Almacenes</span>
            </h3>

            <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Almacén Origen (Sale)</label>
                  <select
                    value={sourceWhId}
                    onChange={(e) => setSourceWhId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-red-400 font-bold focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Almacén Destino (Entra)</label>
                  <select
                    value={targetWhId}
                    onChange={(e) => setTargetWhId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Artículo A Traspasar *</label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                >
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.internalCode} - {art.name} (Stock Global: {art.stock ?? 0} {art.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Cantidad *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Confirmar Traspaso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
