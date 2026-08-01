import React, { useState } from 'react';
import { StockMovementRecord, MermaReason, Article, Warehouse } from '../../types/inventory';
import { Trash2, AlertTriangle, DollarSign, Plus, FileText, PieChart } from 'lucide-react';

interface MermasLossesManagerProps {
  movements: StockMovementRecord[];
  articles: Article[];
  warehouses: Warehouse[];
  onRecordMerma: (movement: StockMovementRecord) => void;
}

export const MermasLossesManager: React.FC<MermasLossesManagerProps> = ({
  movements,
  articles,
  warehouses,
  onRecordMerma,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<MermaReason>('DESPERDICIO');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [notes, setNotes] = useState<string>('');

  const mermasMovements = movements.filter((m) => m.type === 'MERMA' || m.type === 'AUTOCONSUMO');
  const totalMermasCost = mermasMovements.reduce((acc, curr) => acc + curr.totalValue, 0);

  const mermasByReasonMap = new Map<string, number>();
  mermasMovements.forEach((m) => {
    const r = m.reason || 'OTRO';
    mermasByReasonMap.set(r, (mermasByReasonMap.get(r) || 0) + m.totalValue);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const article = articles.find((a) => a.id === selectedArticleId);
    if (!article) return;

    const unitCost = article.purchasePrice || article.averagePrice || 0;
    const totalVal = Number((quantity * unitCost).toFixed(2));
    const wh = warehouses.find((w) => w.id === selectedWarehouseId);

    const mermaRecord: StockMovementRecord = {
      id: `mov-${Date.now()}`,
      articleId: article.id,
      articleName: article.name,
      type: 'MERMA',
      quantity,
      unit: article.unit,
      cost: unitCost,
      totalValue: totalVal,
      sourceWarehouseId: wh?.id,
      sourceWarehouseName: wh?.name,
      reason,
      user: 'Carlos Encargado',
      date: new Date().toISOString(),
      notes,
    };

    onRecordMerma(mermaRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Impacto Financiero de Mermas</span>
            <span className="text-2xl font-black text-red-400 font-mono">{totalMermasCost.toFixed(2)} €</span>
          </div>
          <DollarSign className="w-8 h-8 text-red-500/40" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Total Registros de Mermas</span>
            <span className="text-2xl font-black text-white font-mono">{mermasMovements.length}</span>
          </div>
          <Trash2 className="w-8 h-8 text-amber-400/40" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-mono mb-1">Causa Principal de Pérdida</span>
          <div className="flex items-center space-x-2">
            <span className="bg-red-950 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold text-xs uppercase">
              {Array.from(mermasByReasonMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'DESPERDICIO'}
            </span>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span>Control & Análisis de Mermas, Roturas y Desperdicio</span>
          </h3>
          <p className="text-xs text-slate-400">
            Imputación detallada de pérdidas por rotura, deterioro, caducidad o error en cocina
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Pérdida / Merma</span>
        </button>
      </div>

      {/* Mermas History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Artículo / Materia Prima</th>
                <th className="p-3">Motivo Pérdida</th>
                <th className="p-3">Almacén Afectado</th>
                <th className="p-3 text-right">Cantidad Perdida</th>
                <th className="p-3 text-right">Coste / Ud</th>
                <th className="p-3 text-right">Pérdida Total (€)</th>
                <th className="p-3">Observaciones / Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {mermasMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono text-xs">
                    No se han registrado mermas en el período activo.
                  </td>
                </tr>
              ) : (
                mermasMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400">
                      {new Date(m.date).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-bold text-white">{m.articleName}</td>
                    <td className="p-3">
                      <span className="bg-red-950 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {m.reason || 'MERMA'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{m.sourceWarehouseName || 'Almacén Principal'}</td>
                    <td className="p-3 text-right font-mono font-bold text-red-400">
                      -{m.quantity} {m.unit}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-300">{m.cost.toFixed(2)} €</td>
                    <td className="p-3 text-right font-mono font-bold text-red-400">{m.totalValue.toFixed(2)} €</td>
                    <td className="p-3 text-slate-400">{m.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Merma Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Imputar Registro de Merma / Pérdida</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Artículo Afectado *</label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                >
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.internalCode} - {art.name} ({art.stock ?? 0} {art.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Motivo Especificado *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as MermaReason)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-red-400 font-mono font-bold focus:outline-none"
                >
                  <option value="DESPERDICIO">DESPERDICIO (Caducidad / Mal estado)</option>
                  <option value="ROTURA">ROTURA (Caída / Rotura de envase)</option>
                  <option value="ERROR_COCINA">ERROR COCINA (Marcha equivocada)</option>
                  <option value="CADUCIDAD">CADUCIDAD SUPERADA</option>
                  <option value="INVITACION">INVITACION CLIENTE</option>
                  <option value="PERSONAL">COMIDA PERSONAL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Cantidad Perdida *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Almacén Afectado</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Observaciones / Causa</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Caída de bandeja en barra durante servicio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
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
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-xl shadow-md"
                >
                  Confirmar Pérdida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
