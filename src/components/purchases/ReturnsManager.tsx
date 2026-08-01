import React, { useState } from 'react';
import { PurchaseReturn, Supplier } from '../../types/purchases';
import { Article } from '../../types/inventory';
import { PurchasesService } from '../../services/purchasesService';
import { RotateCcw, Plus, Search, Building2, Warehouse, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReturnsManagerProps {
  returns: PurchaseReturn[];
  suppliers: Supplier[];
  articles: Article[];
  onAddReturn: (newReturn: PurchaseReturn, updatedArticles: Article[]) => void;
}

export const ReturnsManager: React.FC<ReturnsManagerProps> = ({
  returns,
  suppliers,
  articles,
  onAddReturn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [reason, setReason] = useState('Mercancía defectuosa o rotura de envasado al vacío');
  const [selectedArticleId, setSelectedArticleId] = useState(articles[0]?.id || '');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [batchNumber, setBatchNumber] = useState('LOTE-9921');

  const filteredReturns = returns.filter(
    (r) =>
      r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const article = articles.find((a) => a.id === selectedArticleId) || articles[0];

    const unitPrice = article.purchasePrice || 10;
    const lineTotal = unitPrice * returnQty;

    const newReturn: PurchaseReturn = {
      id: `ret-${Date.now()}`,
      returnNumber: `DEV-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: supplier.id,
      supplierName: supplier.socialName,
      warehouseId: 'wh-001',
      warehouseName: 'Almacén Principal Economato',
      date: new Date().toISOString(),
      reason,
      lines: [
        {
          articleId: article.id,
          articleName: article.name,
          quantity: returnQty,
          unitPrice,
          total: Number(lineTotal.toFixed(2)),
          batchNumber,
        },
      ],
      grandTotal: Number(lineTotal.toFixed(2)),
      status: 'REGISTRADO',
    };

    const updatedArticles = PurchasesService.processSupplierReturn(newReturn, articles);
    onAddReturn(newReturn, updatedArticles);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Devoluciones a Proveedores</h2>
            <p className="text-xs text-slate-400">
              Registro de devoluciones por tara o caducidad con actualización automática de existencias en almacén
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-red-500/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Devolución</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar devolución por Nº, proveedor o motivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
        />
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3.5">Nº Devolución</th>
              <th className="p-3.5">Proveedor</th>
              <th className="p-3.5">Fecha</th>
              <th className="p-3.5">Motivo Registrado</th>
              <th className="p-3.5 text-center">Lote</th>
              <th className="p-3.5 text-right">Total Abonar</th>
              <th className="p-3.5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No hay devoluciones registradas.
                </td>
              </tr>
            ) : (
              filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-800/50">
                  <td className="p-3.5 font-mono font-bold text-red-400">{ret.returnNumber}</td>
                  <td className="p-3.5 font-bold text-white">{ret.supplierName}</td>
                  <td className="p-3.5 font-mono text-slate-400">{ret.date.substring(0, 10)}</td>
                  <td className="p-3.5 text-slate-300 max-w-xs truncate">{ret.reason}</td>
                  <td className="p-3.5 text-center font-mono text-slate-400">
                    {ret.lines[0]?.batchNumber || 'N/D'}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                    {ret.grandTotal.toFixed(2)} €
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {ret.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-400" />
                <span>Nueva Devolución a Proveedor</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Proveedor *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.socialName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Artículo a Devolver *</label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Stock actual: {a.stock || 0} {a.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Cantidad a Devolver *</label>
                  <input
                    type="number"
                    min="1"
                    value={returnQty}
                    onChange={(e) => setReturnQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Lote Afectado</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Motivo de Devolución *</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded"
                >
                  Registrar y Restar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
