import React, { useState } from 'react';
import { Article, Warehouse, StockMovementRecord, StockMovementType, MermaReason } from '../../types/inventory';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Plus, FileText, User, Calendar, Tag, ShieldAlert } from 'lucide-react';

interface StockMovementsManagerProps {
  movements: StockMovementRecord[];
  articles: Article[];
  warehouses: Warehouse[];
  onRecordMovement: (movement: StockMovementRecord) => void;
}

export const StockMovementsManager: React.FC<StockMovementsManagerProps> = ({
  movements,
  articles,
  warehouses,
  onRecordMovement,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<StockMovementRecord>>({
    articleId: '',
    type: 'ENTRADA',
    quantity: 1,
    cost: 0,
    targetWarehouseId: warehouses[0]?.id || '',
    batchNumber: '',
    reason: '',
    user: 'Carlos Encargado',
    referenceDoc: '',
    notes: '',
  });

  const handleOpenModal = (type: StockMovementType = 'ENTRADA') => {
    const firstArt = articles[0];
    setFormData({
      id: `mov-${Date.now()}`,
      articleId: firstArt?.id || '',
      articleName: firstArt?.name || '',
      type,
      quantity: 1,
      cost: firstArt?.purchasePrice || 0,
      totalValue: firstArt?.purchasePrice || 0,
      targetWarehouseId: warehouses[0]?.id || '',
      sourceWarehouseId: warehouses[0]?.id || '',
      batchNumber: `LOTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      reason: type === 'MERMA' ? 'DESPERDICIO' : '',
      user: 'Carlos Encargado',
      date: new Date().toISOString(),
      referenceDoc: type === 'ENTRADA' ? `ALBARAN-${Math.floor(1000 + Math.random() * 9000)}` : '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const article = articles.find((a) => a.id === formData.articleId);
    if (!article) {
      alert('Por favor selecciona un artículo.');
      return;
    }

    const qty = formData.quantity || 1;
    const unitCost = formData.cost || article.purchasePrice || 0;
    const totalVal = Number((qty * unitCost).toFixed(2));

    const sourceWh = warehouses.find((w) => w.id === formData.sourceWarehouseId);
    const targetWh = warehouses.find((w) => w.id === formData.targetWarehouseId);

    const movement: StockMovementRecord = {
      id: formData.id || `mov-${Date.now()}`,
      articleId: article.id,
      articleName: article.name,
      type: (formData.type as StockMovementType) || 'ENTRADA',
      quantity: qty,
      unit: article.unit,
      cost: unitCost,
      totalValue: totalVal,
      sourceWarehouseId: formData.sourceWarehouseId,
      sourceWarehouseName: sourceWh?.name,
      targetWarehouseId: formData.targetWarehouseId,
      targetWarehouseName: targetWh?.name,
      batchNumber: formData.batchNumber || '',
      reason: formData.reason || '',
      user: formData.user || 'Carlos Encargado',
      date: new Date().toISOString(),
      referenceDoc: formData.referenceDoc || '',
      notes: formData.notes || '',
    };

    onRecordMovement(movement);
    setIsModalOpen(false);
  };

  const getMovementBadge = (type: StockMovementType) => {
    switch (type) {
      case 'ENTRADA':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1"><ArrowDownLeft className="w-3 h-3 inline" /><span>Entrada Stock</span></span>;
      case 'SALIDA':
        return <span className="bg-blue-950 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1"><ArrowUpRight className="w-3 h-3 inline" /><span>Salida / Venta</span></span>;
      case 'MERMA':
        return <span className="bg-red-950 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Merma / Pérdida</span>;
      case 'TRANSFERENCIA':
        return <span className="bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Traspaso Almacenes</span>;
      case 'AUTOCONSUMO':
        return <span className="bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Autoconsumo Personal</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{type}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            <span>Registro Auditado de Movimientos de Almacén</span>
          </h3>
          <p className="text-xs text-slate-400">
            Kardex histórico de Entradas, Salidas, Traspasos, Mermas y Ajustes de Inventario
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenModal('ENTRADA')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Entrada de Stock</span>
          </button>
          <button
            onClick={() => handleOpenModal('SALIDA')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-1.5"
          >
            <span>Salida Directa</span>
          </button>
          <button
            onClick={() => handleOpenModal('MERMA')}
            className="px-3.5 py-2 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold rounded-xl text-xs flex items-center space-x-1.5"
          >
            <span>Registrar Merma</span>
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Tipo Movimiento</th>
                <th className="p-3">Artículo</th>
                <th className="p-3">Almacén Origen/Destino</th>
                <th className="p-3 text-right">Cantidad</th>
                <th className="p-3 text-right">Coste / Ud</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3">Lote / Doc. Ref</th>
                <th className="p-3">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-mono text-xs">
                    No hay movimientos registrados en el histórico.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400">
                      {new Date(mov.date).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3">{getMovementBadge(mov.type)}</td>
                    <td className="p-3 font-bold text-white">{mov.articleName}</td>
                    <td className="p-3 text-slate-400">
                      {mov.sourceWarehouseName && (
                        <span className="text-red-300 font-mono text-[10px] block">De: {mov.sourceWarehouseName}</span>
                      )}
                      {mov.targetWarehouseName && (
                        <span className="text-emerald-300 font-mono text-[10px] block">A: {mov.targetWarehouseName}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      {mov.quantity} {mov.unit}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-300">{mov.cost.toFixed(2)} €</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">{mov.totalValue.toFixed(2)} €</td>
                    <td className="p-3 font-mono">
                      {mov.batchNumber && (
                        <span className="bg-slate-950 text-cyan-400 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] block">
                          {mov.batchNumber}
                        </span>
                      )}
                      {mov.referenceDoc && (
                        <span className="text-[9px] text-slate-400 block">{mov.referenceDoc}</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">{mov.user}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <span>Nuevo Registro de Movimiento de Stock</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Tipo de Operación *</label>
                <select
                  value={formData.type || 'ENTRADA'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as StockMovementType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
                >
                  <option value="ENTRADA">ENTRADA (Recepción de Albarán / Compra)</option>
                  <option value="SALIDA">SALIDA (Consumo directo fuera de POS)</option>
                  <option value="MERMA">MERMA (Pérdida / Rotura / Caducidad)</option>
                  <option value="AUTOCONSUMO">AUTOCONSUMO (Cata / Personal)</option>
                  <option value="REGULARIZACION">REGULARIZACION (Ajuste manual)</option>
                  <option value="DEVOLUCION">DEVOLUCION A PROVEEDOR</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Artículo Afectado *</label>
                <select
                  value={formData.articleId || ''}
                  onChange={(e) => {
                    const art = articles.find((a) => a.id === e.target.value);
                    setFormData({
                      ...formData,
                      articleId: e.target.value,
                      cost: art?.purchasePrice || 0,
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                >
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.internalCode} - {art.name} ({art.stock ?? 0} {art.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Cantidad *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantity ?? 1}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Coste Unitario (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost ?? 0}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Almacén Destino / Afectado</label>
                <select
                  value={formData.targetWarehouseId || ''}
                  onChange={(e) => setFormData({ ...formData, targetWarehouseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Número de Lote</label>
                  <input
                    type="text"
                    value={formData.batchNumber || ''}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="Ej: LOTE-2026-991"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Documento Ref / Albarán</label>
                  <input
                    type="text"
                    value={formData.referenceDoc || ''}
                    onChange={(e) => setFormData({ ...formData, referenceDoc: e.target.value })}
                    placeholder="Ej: ALBARAN-MAHOU-882"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Observaciones Auditoría</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Recepción en buen estado con albarán sellado"
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
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
