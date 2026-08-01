import React, { useState } from 'react';
import { BIProductMetric } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, TrendingDown, Star, Award, AlertCircle, HelpCircle } from 'lucide-react';

interface BIProductsAnalysisProps {
  products: BIProductMetric[];
}

const COLORS = ['#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316'];

export const BIProductsAnalysis: React.FC<BIProductsAnalysisProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState<'RANKING' | 'MATRIX'>('RANKING');
  const [filterType, setFilterType] = useState<'TOP_SALES' | 'TOP_PROFIT' | 'LOW_MARGIN' | 'DEAD'>('TOP_SALES');

  const filteredProducts = [...products].sort((a, b) => {
    if (filterType === 'TOP_SALES') return b.totalSales - a.totalSales;
    if (filterType === 'TOP_PROFIT') return b.totalProfit - a.totalProfit;
    if (filterType === 'LOW_MARGIN') return a.marginPercent - b.marginPercent;
    if (filterType === 'DEAD') return a.unitsSold - b.unitsSold;
    return 0;
  });

  // Group by classification for matrix
  const stars = products.filter((p) => p.classification === 'STAR');
  const plowhorses = products.filter((p) => p.classification === 'PLOWHORSE');
  const puzzles = products.filter((p) => p.classification === 'PUZZLE');
  const dogs = products.filter((p) => p.classification === 'DOG');

  return (
    <div className="space-y-4">
      {/* Header & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Análisis de Productos, Márgenes & Matriz BCG</h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('RANKING')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'RANKING' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Rankings de Productos
          </button>
          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'MATRIX' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Matriz BCG (Estrellas / Muertos)
          </button>
        </div>
      </div>

      {activeTab === 'RANKING' ? (
        <>
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'TOP_SALES', label: 'Más Vendidos' },
              { id: 'TOP_PROFIT', label: 'Mayor Beneficio' },
              { id: 'LOW_MARGIN', label: 'Menor Margen' },
              { id: 'DEAD', label: 'Productos en Caída / Muertos' },
            ].map((ft) => (
              <button
                key={ft.id}
                onClick={() => setFilterType(ft.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  filterType === ft.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>

          {/* Table Ranking */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Producto</th>
                    <th className="p-3">Familia</th>
                    <th className="p-3 text-right">Unidades</th>
                    <th className="p-3 text-right">Facturación</th>
                    <th className="p-3 text-right">Coste Est.</th>
                    <th className="p-3 text-right">Beneficio</th>
                    <th className="p-3 text-right">Margen %</th>
                    <th className="p-3 text-center">Clasificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredProducts.map((p, idx) => (
                    <tr key={p.productId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-sans font-bold text-white flex items-center space-x-2">
                        <span className="text-amber-400 font-mono text-xs">#{idx + 1}</span>
                        <span>{p.productName}</span>
                      </td>
                      <td className="p-3 font-sans text-slate-400">{p.categoryName}</td>
                      <td className="p-3 text-right font-bold text-slate-200">{p.unitsSold} ud</td>
                      <td className="p-3 text-right font-bold text-amber-400">{formatCurrency(p.totalSales)}</td>
                      <td className="p-3 text-right text-slate-400">{formatCurrency(p.costPrice * p.unitsSold)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{formatCurrency(p.totalProfit)}</td>
                      <td className="p-3 text-right font-bold text-cyan-400">{p.marginPercent.toFixed(1)}%</td>
                      <td className="p-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            p.classification === 'STAR'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : p.classification === 'PLOWHORSE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : p.classification === 'PUZZLE'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {p.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* BCG Matrix Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STAR PRODUCTS */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Productos ESTRELLA (Alta Demanda + Alto Margen)</span>
            </h4>
            <div className="space-y-2">
              {stars.map((p) => (
                <div key={p.productId} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-xs text-white">{p.productName}</span>
                  <span className="font-mono text-xs text-amber-400 font-bold">{p.marginPercent.toFixed(1)}% Margen</span>
                </div>
              ))}
            </div>
          </div>

          {/* PLOWHORSE PRODUCTS */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Caballos de Batalla (Alta Demanda + Margen Moderado)</span>
            </h4>
            <div className="space-y-2">
              {plowhorses.map((p) => (
                <div key={p.productId} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-xs text-white">{p.productName}</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">{p.unitsSold} vendidos</span>
                </div>
              ))}
            </div>
          </div>

          {/* PUZZLE PRODUCTS */}
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Enigmas (Alto Margen + Baja Demanda)</span>
            </h4>
            <div className="space-y-2">
              {puzzles.map((p) => (
                <div key={p.productId} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-xs text-white">{p.productName}</span>
                  <span className="font-mono text-xs text-cyan-400 font-bold">{formatCurrency(p.totalProfit)} Beneficio</span>
                </div>
              ))}
            </div>
          </div>

          {/* DOG PRODUCTS */}
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Productos en Caída / Muertos (Baja Demanda + Bajo Margen)</span>
            </h4>
            <div className="space-y-2">
              {dogs.map((p) => (
                <div key={p.productId} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-xs text-white">{p.productName}</span>
                  <span className="font-mono text-xs text-red-400 font-bold">Revisar Precio / Retirar</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
