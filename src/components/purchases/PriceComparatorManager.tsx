import React, { useState } from 'react';
import { ArticlePriceComparison } from '../../types/purchases';
import { TrendingUp, TrendingDown, Search, ArrowUpDown, History, ShieldAlert } from 'lucide-react';

interface PriceComparatorManagerProps {
  comparisons: ArticlePriceComparison[];
}

export const PriceComparatorManager: React.FC<PriceComparatorManagerProps> = ({ comparisons }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(comparisons[0]?.articleId || null);

  const filtered = comparisons.filter((c) =>
    c.articleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedComparison = comparisons.find((c) => c.articleId === selectedArticleId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <ArrowUpDown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Comparador Histórico de Precios & Proveedores</h2>
            <p className="text-xs text-slate-400">
              Detección automática de subidas y bajadas de costes por materia prima entre distintos proveedores
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar artículo para comparar histórico de precios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Article Price Summary Cards */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isSelected = item.articleId === selectedArticleId;
            return (
              <div
                key={item.articleId}
                onClick={() => setSelectedArticleId(item.articleId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-sm">{item.articleName}</h4>
                  {item.priceVariancePercent > 0 ? (
                    <span className="flex items-center space-x-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{item.priceVariancePercent}%</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Estable</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Coste Actual</span>
                    <span className="font-bold font-mono text-white">{item.currentCost.toFixed(2)} €</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Mínimo</span>
                    <span className="font-bold font-mono text-emerald-400">{item.lowestPrice.toFixed(2)} €</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Máximo</span>
                    <span className="font-bold font-mono text-amber-400">{item.highestPrice.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Historical Entries Detail */}
        <div className="lg:col-span-2">
          {selectedComparison ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-white">{selectedComparison.articleName}</h3>
                <p className="text-xs text-slate-400">
                  Variación máxima detectada: <strong className="text-amber-400">{selectedComparison.priceVariancePercent}%</strong> entre compras registradas.
                </p>
              </div>

              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Histórico de Transacciones de Compra</h4>

              <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Nº Pedido</th>
                      <th className="p-3">Proveedor Suministrador</th>
                      <th className="p-3 text-right">Precio Unitario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {selectedComparison.history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                          No hay historial de compras anteriores registrado. Coste base en ficha: {selectedComparison.currentCost.toFixed(2)} €
                        </td>
                      </tr>
                    ) : (
                      selectedComparison.history.map((h, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 font-mono text-slate-400">{h.date}</td>
                          <td className="p-3 font-mono text-amber-400">{h.orderNumber || 'PED-INICIAL'}</td>
                          <td className="p-3 font-bold text-white">{h.supplierName}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {h.unitPrice.toFixed(2)} € / {selectedComparison.unit}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500">
              <History className="w-12 h-12 text-slate-700 mb-2" />
              <p className="text-sm font-medium">Seleccione un artículo para inspeccionar su histórico de precios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
