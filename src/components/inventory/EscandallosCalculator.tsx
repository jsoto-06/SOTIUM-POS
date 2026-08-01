import React, { useState } from 'react';
import { Product } from '../../types/pos';
import { Article } from '../../types/inventory';
import { recalculateProductEscandalloCosts } from '../../services/inventoryService';
import { Utensils, RefreshCw, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EscandallosCalculatorProps {
  products: Product[];
  articles: Article[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

export const EscandallosCalculator: React.FC<EscandallosCalculatorProps> = ({
  products,
  articles,
  onUpdateProducts,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  const recalculatedProducts = recalculateProductEscandalloCosts(products, articles);
  const currentProduct = recalculatedProducts.find((p) => p.id === selectedProductId) || recalculatedProducts[0];

  const handleSyncAllCosts = () => {
    onUpdateProducts(recalculatedProducts);
    alert('¡Escandallos y costes de platos recalculados con éxito según precios actuales de materias primas!');
  };

  const salePrice = currentProduct?.price || 0;
  const vatRate = currentProduct?.vatRate || 10;
  const priceBaseNoVat = salePrice / (1 + vatRate / 100);
  const costPrice = currentProduct?.costPrice || 0;
  const marginEuro = priceBaseNoVat - costPrice;
  const marginPercent = priceBaseNoVat > 0 ? (marginEuro / priceBaseNoVat) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <span>Motor de Recálculo de Escandallos (BOM) & Rentabilidad</span>
          </h3>
          <p className="text-xs text-slate-400">
            Sincronización automática de costes de materias primas con el escandallo de carta y margen de beneficio real
          </p>
        </div>

        <button
          onClick={handleSyncAllCosts}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sincronizar Todos los Escandallos</span>
        </button>
      </div>

      {/* Main Grid: Selector & Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product Selector List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Seleccionar Plato de Carta</h4>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {recalculatedProducts.map((prod) => {
              const isSelected = prod.id === selectedProductId;
              const prodCost = prod.costPrice || 0;
              const prodSaleNoVat = prod.price / 1.1;
              const prodMarginPercent = prodSaleNoVat > 0 ? ((prodSaleNoVat - prodCost) / prodSaleNoVat) * 100 : 0;

              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{prod.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      P. Venta: {prod.price.toFixed(2)} € | Coste: {prodCost.toFixed(2)} €
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      prodMarginPercent > 70
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : prodMarginPercent > 50
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        : 'bg-red-950 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {prodMarginPercent.toFixed(0)}% Margen
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Escandallo Detail */}
        {currentProduct && (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold block">Ficha Técnica Escandallo</span>
                <h3 className="text-lg font-black text-white">{currentProduct.name}</h3>
              </div>

              <div className="flex items-center space-x-4 font-mono text-xs">
                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Precio Venta (PVP)</span>
                  <span className="font-bold text-white text-sm">{salePrice.toFixed(2)} €</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Coste Materias Primas</span>
                  <span className="font-bold text-amber-400 text-sm">{costPrice.toFixed(2)} €</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Margen Neto Real</span>
                  <span className="font-bold text-emerald-400 text-sm">{marginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Escandallo Ingredients Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Desglose de Ingredientes & Costes</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Ingrediente / Materia Prima</th>
                      <th className="p-3 text-right">Cantidad Ración</th>
                      <th className="p-3">Unidad</th>
                      <th className="p-3 text-right">Coste / Unidad</th>
                      <th className="p-3 text-right">Coste Total Ingrediente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {currentProduct.escandallo && currentProduct.escandallo.length > 0 ? (
                      currentProduct.escandallo.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{item.ingredientName}</td>
                          <td className="p-3 text-right font-mono font-bold text-amber-400">{item.quantity}</td>
                          <td className="p-3 font-mono text-slate-400">{item.unit}</td>
                          <td className="p-3 text-right font-mono text-slate-300">{item.unitCost.toFixed(2)} €</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {item.totalCost.toFixed(2)} €
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 font-mono text-xs">
                          No se ha configurado la ficha técnica de escandallo para este plato.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
