import React, { useState } from 'react';
import { InventorySession, InventoryMode, Article, Warehouse, InventoryItemCount } from '../../types/inventory';
import { ClipboardList, Plus, CheckCircle2, AlertTriangle, EyeOff, Play, Save, RefreshCw } from 'lucide-react';

interface InventoriesManagerProps {
  inventories: InventorySession[];
  articles: Article[];
  warehouses: Warehouse[];
  onCreateInventory: (session: InventorySession) => void;
  onRegularizeInventory: (inventoryId: string, items: InventoryItemCount[]) => void;
}

export const InventoriesManager: React.FC<InventoriesManagerProps> = ({
  inventories,
  articles,
  warehouses,
  onCreateInventory,
  onRegularizeInventory,
}) => {
  const [activeSession, setActiveSession] = useState<InventorySession | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [inventoryMode, setInventoryMode] = useState<InventoryMode>('COMPLETE');

  // Counted stock form inside active counting session
  const [countedMap, setCountedMap] = useState<Record<string, number>>({});

  const handleStartInventory = () => {
    const wh = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

    const initialItems: InventoryItemCount[] = articles.map((art) => {
      const expStock = art.stock ?? 0;
      return {
        articleId: art.id,
        articleName: art.name,
        expectedStock: expStock,
        countedStock: expStock, // Initialized to expected or 0
        difference: 0,
        unitCost: art.purchasePrice || art.averagePrice || 0,
        differenceValue: 0,
      };
    });

    const newSession: InventorySession = {
      id: `inv-${Date.now()}`,
      inventoryNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      warehouseId: wh.id,
      warehouseName: wh.name,
      mode: inventoryMode,
      status: 'IN_PROGRESS',
      createdBy: 'Carlos Encargado',
      items: initialItems,
      totalDiffValue: 0,
    };

    const initialCounts: Record<string, number> = {};
    initialItems.forEach((it) => {
      initialCounts[it.articleId] = inventoryMode === 'BLIND' ? 0 : it.expectedStock;
    });
    setCountedMap(initialCounts);

    onCreateInventory(newSession);
    setActiveSession(newSession);
    setIsNewModalOpen(false);
  };

  const handleUpdateCount = (artId: string, value: number) => {
    setCountedMap((prev) => ({
      ...prev,
      [artId]: value,
    }));
  };

  const handleSaveAndRegularize = () => {
    if (!activeSession) return;

    let totalDiffValue = 0;
    const updatedItems: InventoryItemCount[] = activeSession.items.map((it) => {
      const counted = countedMap[it.articleId] ?? 0;
      const diff = counted - it.expectedStock;
      const diffValue = Number((diff * it.unitCost).toFixed(2));
      totalDiffValue += diffValue;

      return {
        ...it,
        countedStock: counted,
        difference: diff,
        differenceValue: diffValue,
      };
    });

    onRegularizeInventory(activeSession.id, updatedItems);
    alert(`Inventario regularizado con éxito. Diferencia total de inventario: ${totalDiffValue.toFixed(2)} €`);
    setActiveSession(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span>Regularizaciones de Inventarios Físicos (Conteo Ciego / Parcial / Completo)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Realiza toma de inventarios físicos con ajuste automático en tiempo real y cuadre auditado
          </p>
        </div>

        {!activeSession && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Iniciar Nuevo Inventario</span>
          </button>
        )}
      </div>

      {/* Active Inventory Session Panel */}
      {activeSession ? (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="font-mono text-xs text-amber-400 font-bold block">{activeSession.inventoryNumber}</span>
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span>Inventario Físico en Curso - {activeSession.warehouseName}</span>
                {activeSession.mode === 'BLIND' && (
                  <span className="bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded font-bold flex items-center space-x-1">
                    <EyeOff className="w-3 h-3" />
                    <span>CONTEO CIEGO</span>
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveSession(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Guardar Borrador
              </button>
              <button
                onClick={handleSaveAndRegularize}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar & Regularizar Stock</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Artículo</th>
                  {activeSession.mode !== 'BLIND' && <th className="p-3 text-right">Stock Esperado</th>}
                  <th className="p-3 text-right w-36">Conteo Físico Real</th>
                  {activeSession.mode !== 'BLIND' && <th className="p-3 text-right">Diferencia Unidades</th>}
                  <th className="p-3 text-right">Coste Ud</th>
                  {activeSession.mode !== 'BLIND' && <th className="p-3 text-right">Valor Diferencia</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {activeSession.items.map((item) => {
                  const counted = countedMap[item.articleId] ?? 0;
                  const diff = counted - item.expectedStock;
                  const diffVal = diff * item.unitCost;

                  return (
                    <tr key={item.articleId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{item.articleName}</td>
                      {activeSession.mode !== 'BLIND' && (
                        <td className="p-3 text-right font-mono text-slate-400">{item.expectedStock}</td>
                      )}
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={counted}
                          onChange={(e) => handleUpdateCount(item.articleId, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-slate-950 border border-amber-500/50 rounded-xl px-2 py-1 text-right text-emerald-400 font-mono font-bold focus:outline-none"
                        />
                      </td>
                      {activeSession.mode !== 'BLIND' && (
                        <td
                          className={`p-3 text-right font-mono font-bold ${
                            diff < 0 ? 'text-red-400' : diff > 0 ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      )}
                      <td className="p-3 text-right font-mono text-slate-300">{item.unitCost.toFixed(2)} €</td>
                      {activeSession.mode !== 'BLIND' && (
                        <td
                          className={`p-3 text-right font-mono font-bold ${
                            diffVal < 0 ? 'text-red-400' : diffVal > 0 ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {diffVal.toFixed(2)} €
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory History List */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Nº Inventario</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Almacén</th>
                  <th className="p-3">Modo Conteo</th>
                  <th className="p-3 text-right">Líneas Contadas</th>
                  <th className="p-3 text-right">Diferencia Valoración</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Realizado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {inventories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-mono text-xs">
                      No hay inventarios registrados recientemente.
                    </td>
                  </tr>
                ) : (
                  inventories.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">{inv.inventoryNumber}</td>
                      <td className="p-3 font-mono text-slate-400">
                        {new Date(inv.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="p-3 font-bold text-white">{inv.warehouseName}</td>
                      <td className="p-3">
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {inv.mode}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">{inv.items.length}</td>
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          (inv.totalDiffValue ?? 0) < 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {(inv.totalDiffValue ?? 0).toFixed(2)} €
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase">
                          REGULARIZADO
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400">{inv.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Inventory Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-amber-400" />
              <span>Configurar Nuevo Conteo de Inventario</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Almacén a Inventariar *</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Modo de Conteo *</label>
                <select
                  value={inventoryMode}
                  onChange={(e) => setInventoryMode(e.target.value as InventoryMode)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
                >
                  <option value="COMPLETE">Inventario Completo (Muestra stock teórico)</option>
                  <option value="BLIND">Conteo Ciego (Sin stock teórico visible para el operario)</option>
                  <option value="PARTIAL">Inventario Parcial por Selección</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartInventory}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center space-x-1"
                >
                  <Play className="w-4 h-4" />
                  <span>Empezar Conteo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
