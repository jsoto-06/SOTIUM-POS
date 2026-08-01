import React, { useState } from 'react';
import { MaintenanceSparePart } from '../../types/maintenance';
import { Package, Plus, Minus, AlertTriangle, Layers, MapPin, Tag, DollarSign, X } from 'lucide-react';

interface SparePartsManagerProps {
  spareParts: MaintenanceSparePart[];
  onCreateSparePart: (data: Omit<MaintenanceSparePart, 'id'>) => void;
  onConsumeSparePart: (id: string, quantity: number, reason: string) => void;
}

export const SparePartsManager: React.FC<SparePartsManagerProps> = ({
  spareParts,
  onCreateSparePart,
  onConsumeSparePart,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSpareId, setSelectedSpareId] = useState<string | null>(null);
  const [consumeQty, setConsumeQty] = useState(1);
  const [consumeReason, setConsumeReason] = useState('Consumo directo de taller');

  const [code, setCode] = useState(`REP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [name, setName] = useState('');
  const [family, setFamily] = useState('General');
  const [supplierName, setSupplierName] = useState('Proveedor Hostelería S.L.');
  const [stock, setStock] = useState(10);
  const [minStock, setMinStock] = useState(2);
  const [cost, setCost] = useState(25);
  const [location, setLocation] = useState('Estantería A-1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateSparePart({
      code,
      barcode: `8400000${Math.floor(10000 + Math.random() * 90000)}`,
      name,
      description: 'Repuesto original homologado para mantenimiento',
      family,
      supplierId: 'sup-101',
      supplierName,
      stock,
      minStock,
      cost,
      location,
      unit: 'ud',
    });

    setShowModal(false);
  };

  const handleConsume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpareId || consumeQty <= 0) return;
    onConsumeSparePart(selectedSpareId, consumeQty, consumeReason);
    setSelectedSpareId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Almacén de Repuestos y Consumibles</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Control de stock de componentes, lotes, proveedores y descuento automático por Orden de Trabajo
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Alta Repuesto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spareParts.map((sp) => {
          const isLowStock = sp.stock <= sp.minStock;
          return (
            <div
              key={sp.id}
              className={`bg-slate-900 border rounded-xl p-5 space-y-3 flex flex-col justify-between ${
                isLowStock ? 'border-amber-500/60 bg-amber-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-slate-800 text-amber-400 font-mono text-xs px-2 py-0.5 rounded font-bold">
                      {sp.code}
                    </span>
                    <h3 className="font-bold text-white text-base mt-2">{sp.name}</h3>
                    <p className="text-slate-400 text-xs">{sp.family}</p>
                  </div>
                  {isLowStock && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>STOCK BAJO</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 my-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Proveedor:</span>
                    <span className="text-slate-200">{sp.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ubicación:</span>
                    <span className="text-slate-200">{sp.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coste Unitario:</span>
                    <span className="font-mono text-emerald-400">{sp.cost.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Stock Actual: </span>
                  <span className="text-lg font-bold font-mono text-white">
                    {sp.stock} {sp.unit}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSpareId(sp.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Descontar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Spare Part */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span>Registrar Nuevo Repuesto</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Familia</label>
                  <input
                    type="text"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Coste (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Guardar Repuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consume Modal */}
      {selectedSpareId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Descontar Stock de Repuesto</h3>

            <form onSubmit={handleConsume} className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Cantidad a consumir</label>
                <input
                  type="number"
                  min="1"
                  value={consumeQty}
                  onChange={(e) => setConsumeQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Motivo / OT</label>
                <input
                  type="text"
                  value={consumeReason}
                  onChange={(e) => setConsumeReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSpareId(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs"
                >
                  Confirmar Consumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
