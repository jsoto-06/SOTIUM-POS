import React, { useState } from 'react';
import { Warehouse, WarehouseType } from '../../types/inventory';
import { Warehouse as WarehouseIcon, Plus, Edit2, Trash2, CheckCircle2, Thermometer, Box, ShieldCheck, Gauge } from 'lucide-react';

interface WarehousesManagerProps {
  warehouses: Warehouse[];
  onAddWarehouse: (warehouse: Warehouse) => void;
  onUpdateWarehouse: (warehouse: Warehouse) => void;
  onDeleteWarehouse: (id: string) => void;
}

export const WarehousesManager: React.FC<WarehousesManagerProps> = ({
  warehouses,
  onAddWarehouse,
  onUpdateWarehouse,
  onDeleteWarehouse,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    code: '',
    name: '',
    type: 'PRINCIPAL',
    description: '',
    isDefault: false,
    active: true,
    capacityPercentage: 50,
  });

  const handleOpenModal = (wh?: Warehouse) => {
    if (wh) {
      setEditingWarehouse(wh);
      setFormData({ ...wh });
    } else {
      setEditingWarehouse(null);
      const randomCode = `WH-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        id: `wh-${Date.now()}`,
        code: randomCode,
        name: '',
        type: 'PRINCIPAL',
        description: '',
        isDefault: false,
        active: true,
        capacityPercentage: 50,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Debes especificar un código y un nombre de almacén.');
      return;
    }

    const finalWh: Warehouse = {
      id: formData.id || `wh-${Date.now()}`,
      code: formData.code || '',
      name: formData.name || '',
      type: (formData.type as WarehouseType) || 'PRINCIPAL',
      description: formData.description || '',
      isDefault: formData.isDefault ?? false,
      active: formData.active ?? true,
      capacityPercentage: formData.capacityPercentage ?? 50,
    };

    if (editingWarehouse) {
      onUpdateWarehouse(finalWh);
    } else {
      onAddWarehouse(finalWh);
    }
    setIsModalOpen(false);
  };

  const getTypeBadge = (type: WarehouseType) => {
    switch (type) {
      case 'CAMARA':
        return <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1"><Thermometer className="w-3 h-3 inline" /><span>Cámara Fría</span></span>;
      case 'CONGELADOR':
        return <span className="bg-blue-950 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1"><Thermometer className="w-3 h-3 inline" /><span>Congelador</span></span>;
      case 'BARRA':
        return <span className="bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Barra</span>;
      case 'BODEGA':
        return <span className="bg-rose-950 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Bodega Vinos</span>;
      case 'ECONOMATO':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Economato</span>;
      case 'TERRAZA':
        return <span className="bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Terraza</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">Principal</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center space-x-2">
            <WarehouseIcon className="w-5 h-5 text-amber-400" />
            <span>Gestión de Almacenes Ilimitados</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configuración de almacenes centrales, cámaras frigoríficas, congeladores, barras y bodegas
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Almacén</span>
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 relative overflow-hidden transition-all shadow-lg"
          >
            {wh.isDefault && (
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Predeterminado</span>
              </div>
            )}

            <div className="flex items-start justify-between pr-20">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold block">{wh.code}</span>
                <h4 className="text-sm font-bold text-white">{wh.name}</h4>
              </div>
            </div>

            <div className="flex items-center space-x-2">{getTypeBadge(wh.type)}</div>

            {wh.description && <p className="text-xs text-slate-400 line-clamp-2">{wh.description}</p>}

            {/* Capacity gauge */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="flex items-center space-x-1">
                  <Gauge className="w-3 h-3 text-amber-400" />
                  <span>Ocupación de Capacidad:</span>
                </span>
                <span className="font-bold text-white">{wh.capacityPercentage ?? 50}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    (wh.capacityPercentage ?? 50) > 85
                      ? 'bg-red-500'
                      : (wh.capacityPercentage ?? 50) > 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${wh.capacityPercentage ?? 50}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => handleOpenModal(wh)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              {!wh.isDefault && (
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el almacén ${wh.name}?`)) onDeleteWarehouse(wh.id);
                  }}
                  className="p-2 bg-slate-800 hover:bg-red-950 text-red-400 rounded-xl text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Warehouse Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <WarehouseIcon className="w-5 h-5 text-amber-400" />
              <span>{editingWarehouse ? `Editar Almacén` : 'Crear Nuevo Almacén'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Código Único *</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej: ALM_CAMARA_1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Nombre Descriptivo *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Cámara Frigorífica 1 (Verduras)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Tipo de Almacén</label>
                <select
                  value={formData.type || 'PRINCIPAL'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WarehouseType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                >
                  <option value="PRINCIPAL">Almacén Principal Central</option>
                  <option value="CAMARA">Cámara Frigorífica (0-4ºC)</option>
                  <option value="CONGELADOR">Congelador Industrial (-18ºC)</option>
                  <option value="BARRA">Almacén de Barra</option>
                  <option value="TERRAZA">Barra Terraza</option>
                  <option value="BODEGA">Bodega de Vinos</option>
                  <option value="ECONOMATO">Economato & Consumibles</option>
                  <option value="OTRO">Otro Tipo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Descripción / Ubicación Física</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault ?? false}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Almacén Predeterminado</span>
                </label>
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
                  Guardar Almacén
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
