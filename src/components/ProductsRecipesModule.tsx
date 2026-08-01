import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { Package, Utensils, Plus, Trash2, Calculator, Percent, Tag, Barcode, Shield } from 'lucide-react';

export const ProductsRecipesModule: React.FC = () => {
  const { products, ingredients, categories, updateProductEscandallo } = usePOS();
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);

  // Temporary local state for escandallo editor
  const [escandalloLines, setEscandalloLines] = useState(selectedProduct.escandallo || []);

  const totalFoodCost = escandalloLines.reduce((acc, curr) => acc + curr.totalCost, 0);
  const sellingPriceNet = selectedProduct.price / (1 + selectedProduct.vatRate / 100);
  const marginPercent = sellingPriceNet > 0 ? ((sellingPriceNet - totalFoodCost) / sellingPriceNet) * 100 : 0;

  const handleAddIngredientToRecipe = (ingredientId: string) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    const defaultQty = ing.unit === 'kg' ? 0.1 : ing.unit === 'l' ? 0.05 : 1;
    const newLine = {
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: defaultQty,
      unit: ing.unit,
      unitCost: ing.costPerUnit,
      totalCost: Number((defaultQty * ing.costPerUnit).toFixed(2)),
    };

    const updated = [...escandalloLines, newLine];
    setEscandalloLines(updated);
    updateProductEscandallo(selectedProduct.id, updated);
  };

  const handleRemoveLine = (index: number) => {
    const updated = escandalloLines.filter((_, i) => i !== index);
    setEscandalloLines(updated);
    updateProductEscandallo(selectedProduct.id, updated);
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    const updated = escandalloLines.map((line, i) => {
      if (i === index) {
        return {
          ...line,
          quantity: newQty,
          totalCost: Number((newQty * line.unitCost).toFixed(2)),
        };
      }
      return line;
    });
    setEscandalloLines(updated);
    updateProductEscandallo(selectedProduct.id, updated);
  };

  return (
    <div className="flex h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-x-4">
      {/* Products Catalog List */}
      <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Catálogo de Productos</h3>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            {products.length} ítems
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProduct(p);
                setEscandalloLines(p.escandallo || []);
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                selectedProduct.id === p.id
                  ? 'bg-amber-500/10 border-amber-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs truncate text-white">{p.name}</h4>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                  <span className="font-mono text-amber-400 font-bold">{p.price.toFixed(2)} €</span>
                  <span>IVA {p.vatRate}%</span>
                  <span>Pase: {p.printerTarget}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Escandallo & Recipe Cost Breakdown Panel */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl p-6 overflow-y-auto space-y-6">
        {/* Product Details Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <img src={selectedProduct.photoUrl} alt={selectedProduct.name} className="w-20 h-20 rounded-xl object-cover border border-slate-700 shadow" />
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Escandallo de Receta / Ficha Técnica
              </span>
              <h2 className="text-2xl font-black text-white">{selectedProduct.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Código Barras: {selectedProduct.barcode} | IVA Aplicable: {selectedProduct.vatRate}%
              </p>
            </div>
          </div>

          <div className="text-right bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">PVP Venta Público</span>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {selectedProduct.price.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Financial Margins Bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Coste Total Materia Prima (Materia)</span>
            <span className="text-2xl font-black text-red-400 font-mono">{totalFoodCost.toFixed(2)} €</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Base Imponible Neta</span>
            <span className="text-2xl font-black text-white font-mono">{sellingPriceNet.toFixed(2)} €</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Margen Bruto (%)</span>
            <span
              className={`text-2xl font-black font-mono ${
                marginPercent > 70 ? 'text-emerald-400' : marginPercent > 50 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {marginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Escandallo Ingredients Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-amber-400" />
              <span>Ingredientes y Cantidades por Ración</span>
            </h3>

            {/* Add ingredient dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddIngredientToRecipe(e.target.value);
                  e.target.value = '';
                }
              }}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="">+ Añadir Materia Prima de Almacén...</option>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.costPerUnit.toFixed(2)} € / {ing.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Ingrediente</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3">Unidad</th>
                  <th className="p-3">Coste / Unidad</th>
                  <th className="p-3">Coste Total</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {escandalloLines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                      No hay ingredientes configurados para esta receta.
                    </td>
                  </tr>
                ) : (
                  escandalloLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white">{line.ingredientName}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          value={line.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-amber-400 font-bold"
                        />
                      </td>
                      <td className="p-3 font-mono">{line.unit}</td>
                      <td className="p-3 font-mono">{line.unitCost.toFixed(2)} €</td>
                      <td className="p-3 font-mono font-bold text-red-400">{line.totalCost.toFixed(2)} €</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
