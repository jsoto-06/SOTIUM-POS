import React, { useState } from 'react';
import { ProductionOrder, Recipe } from '../../types/production';
import { Article, Warehouse } from '../../types/inventory';
import { ProductionService } from '../../services/productionService';
import { AuditService } from '../../services/auditService';
import {
  Factory,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';

interface ProductionOrdersManagerProps {
  orders: ProductionOrder[];
  recipes: Recipe[];
  warehouses: Warehouse[];
  onAddOrder: (order: ProductionOrder) => void;
  onUpdateOrder: (order: ProductionOrder) => void;
  onFinalizeOrder: (order: ProductionOrder, batch: any) => void;
}

export const ProductionOrdersManager: React.FC<ProductionOrdersManagerProps> = ({
  orders,
  recipes,
  warehouses,
  onAddOrder,
  onUpdateOrder,
  onFinalizeOrder,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [targetQuantity, setTargetQuantity] = useState(10);
  const [targetWarehouseId, setTargetWarehouseId] = useState(warehouses[0]?.id || 'wh-001');
  const [operatorName, setOperatorName] = useState('Carlos M. (Jefe de Cocina)');

  // Finalize order modal state
  const [finalizeOrderModal, setFinalizeOrderModal] = useState<ProductionOrder | null>(null);
  const [actualObtained, setActualObtained] = useState(10);

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];
    const warehouse = warehouses.find((w) => w.id === targetWarehouseId) || warehouses[0];

    const newOrder = ProductionService.createProductionOrder(
      recipe,
      targetQuantity,
      warehouse?.id || 'wh-001',
      warehouse?.name || 'Almacén Principal',
      operatorName
    );

    onAddOrder(newOrder);
    setShowModal(false);

    AuditService.log({
      username: operatorName,
      action: 'PRODUCTION_ORDER_CREATE',
      resource: 'Production',
      details: `Orden de producción ${newOrder.orderCode} creada para ${newOrder.recipeName}`,
    });
  };

  const handleStartProduction = (order: ProductionOrder) => {
    const updated: ProductionOrder = {
      ...order,
      status: 'EN_PRODUCCION',
      startTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateOrder(updated);

    AuditService.log({
      username: order.operatorName,
      action: 'PRODUCTION_ORDER_START',
      resource: 'Production',
      details: `Orden ${order.orderCode} iniciada`,
    });
  };

  const handleConfirmFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalizeOrderModal) return;

    const recipe = recipes.find((r) => r.id === finalizeOrderModal.recipeId) || recipes[0];
    const { updatedOrder, newBatch } = ProductionService.finalizeProductionOrder(
      finalizeOrderModal,
      recipe,
      actualObtained,
      operatorName
    );

    onFinalizeOrder(updatedOrder, newBatch);
    setFinalizeOrderModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Factory className="w-5 h-5 text-amber-400" />
            <span>Órdenes de Producción & Fabricación</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión del flujo de fabricación, consumos automáticos de materias primas y generación de lotes
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2 rounded-lg text-xs transition shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Fabricación</span>
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {ord.orderCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ord.status === 'FINALIZADA'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : ord.status === 'EN_PRODUCCION'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {ord.status}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-white">{ord.recipeName}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Objetivo: <strong className="text-white">{ord.targetQuantity} {ord.unit}</strong> | Destino: <strong className="text-slate-300">{ord.targetWarehouseName}</strong>
                </p>
              </div>

              <div className="mt-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Operario: <strong className="text-slate-200">{ord.operatorName}</strong></span>
                </div>
                {ord.batchNumber && (
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lote Generado: <strong className="font-mono text-emerald-300">{ord.batchNumber}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Coste Real</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{ord.realCost}€</span>
              </div>

              <div className="flex space-x-2">
                {ord.status === 'PENDIENTE' && (
                  <button
                    onClick={() => handleStartProduction(ord)}
                    className="flex items-center space-x-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Iniciar</span>
                  </button>
                )}
                {ord.status === 'EN_PRODUCCION' && (
                  <button
                    onClick={() => {
                      setFinalizeOrderModal(ord);
                      setActualObtained(ord.targetQuantity);
                    }}
                    className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-extrabold transition shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Finalizar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Orden */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateOrderSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-amber-400" />
              <span>Nueva Orden de Producción</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Receta a Fabricar</label>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.portions} raciones/lote)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Cantidad Objetivo</label>
                <input
                  type="number"
                  min="1"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Almacén Destino</label>
                <select
                  value={targetWarehouseId}
                  onChange={(e) => setTargetWarehouseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
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
              <label className="text-xs text-slate-400 font-semibold block mb-1">Operario Responsable</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                required
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
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-md shadow-amber-500/20"
              >
                Crear Orden
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Finalizar Orden */}
      {finalizeOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleConfirmFinalize} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Finalizar Orden de Fabricación</span>
            </h3>

            <p className="text-xs text-slate-400">
              Confirmar rendimiento obtenido y descontar automáticamente las materias primas consumidas del Almacén.
            </p>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Producción Obtenida Real</label>
              <input
                type="number"
                value={actualObtained}
                onChange={(e) => setActualObtained(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-amber-400 font-mono font-bold"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setFinalizeOrderModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-md shadow-emerald-500/20"
              >
                Confirmar y Generar Lote
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
