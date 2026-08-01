import React from 'react';
import { AIPurchaseRecommendation, PurchaseOrder, Supplier } from '../../types/purchases';
import { Article } from '../../types/inventory';
import { Sparkles, ShoppingCart, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface AIPurchasesAssistantProps {
  recommendations: AIPurchaseRecommendation[];
  suppliers: Supplier[];
  onGenerateOrderFromAI: (rec: AIPurchaseRecommendation) => void;
}

export const AIPurchasesAssistant: React.FC<AIPurchasesAssistantProps> = ({
  recommendations,
  suppliers,
  onGenerateOrderFromAI,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 p-6 rounded-xl space-y-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-lg shadow-lg shadow-amber-500/30">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Asistente de Reposición Inteligente IA</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                PREDICCIONAL
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Cálculo óptimo de pedidos según consumos históricos, días de reparto de proveedores y prevención de rotura de stock
            </p>
          </div>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Nivel de Stock Óptimo en Todos los Almacenes</p>
          <p className="text-xs text-slate-400 mt-1">
            No se detectan artículos por debajo de la suma de stock mínimo y stock de seguridad.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.articleId}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-xl space-y-4 shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{rec.articleName}</h3>
                  <p className="text-xs text-slate-400">
                    Stock Actual: <strong className="text-red-400">{rec.currentStock} {rec.unit}</strong> | Mínimo Seguridad: {rec.safetyStock} {rec.unit}
                  </p>
                </div>
                <span className="flex items-center space-x-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Riesgo {rec.stockoutRiskDays}d</span>
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
                <p className="text-slate-300 font-medium">{rec.reason}</p>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Proveedor Sugerido:</span>
                  <strong className="text-amber-400">{rec.recommendedSupplierName}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cantidad Óptima Sugerida:</span>
                  <strong className="text-emerald-400 font-mono">{rec.suggestedQuantity} {rec.unit}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Coste Estimado Total:</span>
                  <strong className="text-white font-mono">{rec.estimatedCost.toFixed(2)} €</strong>
                </div>
              </div>

              <button
                onClick={() => onGenerateOrderFromAI(rec)}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 rounded-lg shadow-lg shadow-amber-500/20 text-xs transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Generar Borrador de Pedido en 1-Click</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
