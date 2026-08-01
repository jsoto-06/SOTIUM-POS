import React, { useState } from 'react';
import { ProductionWaste, WasteReason } from '../../types/production';
import { Article } from '../../types/inventory';
import { ProductionService } from '../../services/productionService';
import { Trash2, Plus, AlertTriangle, DollarSign, ShieldAlert, BarChart3 } from 'lucide-react';

interface ProductionWasteManagerProps {
  wasteRecords: ProductionWaste[];
  articles: Article[];
  onAddWaste: (waste: ProductionWaste) => void;
}

export const ProductionWasteManager: React.FC<ProductionWasteManagerProps> = ({
  wasteRecords,
  articles,
  onAddWaste,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(articles[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<WasteReason>('ERROR_COCINA');
  const [operatorName, setOperatorName] = useState('Carlos M.');
  const [notes, setNotes] = useState('');

  const totalWasteCost = wasteRecords.reduce((sum, w) => sum + w.cost, 0);

  const handleCreateWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const art = articles.find((a) => a.id === selectedArticleId) || articles[0];
    const unitPrice = art?.cost || art?.purchasePrice || 2.0;
    const cost = Number((unitPrice * quantity).toFixed(2));

    const newWaste = ProductionService.registerWaste({
      articleId: art?.id || 'art-gen',
      articleName: art?.name || 'Materia Prima',
      quantity,
      unit: art?.unit || 'kg',
      reason,
      cost,
      operatorName,
      notes,
    });

    onAddWaste(newWaste);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>Control & Registro de Mermas de Producción</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro de desperdicios, roturas, errores de cocina, caducidades e impacto financiero
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block">Coste Total Mermas</span>
            <span className="text-base font-black text-rose-400 font-mono">{totalWasteCost.toFixed(2)}€</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2 rounded-lg text-xs transition shadow-md shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Merma</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                <th className="p-3">Fecha</th>
                <th className="p-3">Artículo / Materia Prima</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Motivo Merma</th>
                <th className="p-3 text-right">Coste €</th>
                <th className="p-3">Operario</th>
                <th className="p-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {wasteRecords.map((w) => (
                <tr key={w.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono text-slate-400">{w.date.substring(0, 10)}</td>
                  <td className="p-3 font-bold text-white">{w.articleName}</td>
                  <td className="p-3 font-mono text-amber-400">{w.quantity} {w.unit}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center space-x-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{w.reason}</span>
                    </span>
                  </td>
                  <td className="p-3 font-mono text-right font-extrabold text-rose-400">{w.cost.toFixed(2)}€</td>
                  <td className="p-3 text-slate-300 font-medium">{w.operatorName}</td>
                  <td className="p-3 text-slate-400 italic">{w.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Merma */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateWaste} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>Registrar Nueva Merma de Producción</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Artículo Afectado</label>
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              >
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({(a.cost || a.purchasePrice || 0).toFixed(2)}€/{a.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Cantidad Perdida</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Motivo Merma</label>
                <select
                  value={reason}
                  onChange={(e: any) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="ERROR_COCINA">Error Cocina</option>
                  <option value="ERROR_FABRICACION">Error Fabricación</option>
                  <option value="ROTURA">Rotura</option>
                  <option value="DESPERDICIO">Desperdicio</option>
                  <option value="CADUCIDAD">Caducidad</option>
                  <option value="DEFECTUOSO">Defectuoso</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Observaciones</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20"
                placeholder="Detalle de la incidencia..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-lg text-xs shadow-md shadow-rose-500/20"
              >
                Guardar Merma
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
