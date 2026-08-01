import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { KDSStation } from '../../types/pos';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Flame,
  Snowflake,
  Disc,
  Cake,
  Wine,
  Fish,
  Pizza,
  Printer,
  Clock,
  Layers,
} from 'lucide-react';

interface KDSStationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KDSStationManagerModal: React.FC<KDSStationManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { kdsStations, addKDSStation, updateKDSStation, deleteKDSStation } = usePOS();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [color, setColor] = useState<string>('#ef4444');
  const [icon, setIcon] = useState<string>('Flame');
  const [targetMinutes, setTargetMinutes] = useState<number>(10);
  const [printerTarget, setPrinterTarget] = useState<string>('PRINTER_COCINA_1');
  const [description, setDescription] = useState<string>('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setCode('');
    setColor('#ef4444');
    setIcon('Flame');
    setTargetMinutes(10);
    setPrinterTarget('PRINTER_COCINA_1');
    setDescription('');
    setEditingId(null);
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleStartEdit = (st: KDSStation) => {
    setEditingId(st.id);
    setName(st.name);
    setCode(st.code);
    setColor(st.color);
    setIcon(st.icon);
    setTargetMinutes(st.targetPreparationMinutes);
    setPrinterTarget(st.printerTarget || 'PRINTER_COCINA_1');
    setDescription(st.description || '');
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (isCreating) {
      addKDSStation({
        name,
        code: code.toUpperCase() || name.toUpperCase().replace(/\s+/g, '_'),
        color,
        icon,
        active: true,
        targetPreparationMinutes: targetMinutes,
        printerTarget,
        description,
      });
    } else if (editingId) {
      updateKDSStation(editingId, {
        name,
        code: code.toUpperCase() || name.toUpperCase().replace(/\s+/g, '_'),
        color,
        icon,
        targetPreparationMinutes: targetMinutes,
        printerTarget,
        description,
      });
    }

    resetForm();
  };

  const PRESET_ICONS = [
    { name: 'Flame', label: 'Caliente' },
    { name: 'Snowflake', label: 'Frío' },
    { name: 'Disc', label: 'Horno' },
    { name: 'Cake', label: 'Postres' },
    { name: 'Wine', label: 'Barra' },
    { name: 'Fish', label: 'Sushi' },
    { name: 'Pizza', label: 'Pizzería' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-400">Estaciones de Cocina (KDS)</h2>
              <p className="text-xs text-slate-400">
                Configura ruteo, temporizadores y ruteo de impresoras ESC/POS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">
              Estaciones Registradas ({kdsStations.length})
            </span>
            {!isCreating && !editingId && (
              <button
                onClick={handleStartCreate}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Estación</span>
              </button>
            )}
          </div>

          {/* Form Editor Section */}
          {(isCreating || editingId) && (
            <div className="p-5 bg-slate-950/80 border border-amber-500/40 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                {isCreating ? '➕ Nueva Estación' : '✏️ Editar Estación'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre de Estación</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Parrilla & Brasas"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Código Interno</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej. PARRILLA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Color de la Estación</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-9 bg-transparent border-0 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Tiempo Objetivo (Minutos)
                  </label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={targetMinutes}
                      onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Impresora Asignada (ESC/POS)
                  </label>
                  <select
                    value={printerTarget}
                    onChange={(e) => setPrinterTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PRINTER_COCINA_1">Impresora Cocina Caliente (Puerto 9100)</option>
                    <option value="PRINTER_COCINA_2">Impresora Cocina Fría (Puerto 9101)</option>
                    <option value="PRINTER_PARRILLA">Impresora Parrilla (Puerto 9102)</option>
                    <option value="PRINTER_BARRA">Impresora Barra (Puerto 9103)</option>
                    <option value="PRINTER_POSTRES">Impresora Postres (Puerto 9104)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Icono Visual</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {PRESET_ICONS.map((ic) => (
                      <option key={ic.name} value={ic.name}>
                        {ic.label} ({ic.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold text-xs">Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del puesto o área de trabajo..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg"
                >
                  Guardar Estación
                </button>
              </div>
            </div>
          )}

          {/* Stations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kdsStations.map((st) => (
              <div
                key={st.id}
                className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                    style={{ backgroundColor: st.color }}
                  >
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white">{st.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded">
                        {st.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{st.description || 'Puesto de cocina'}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-amber-400/80 mt-1 font-mono">
                      <span>⏱️ Objet: {st.targetPreparationMinutes}m</span>
                      <span>🖨️ {st.printerTarget || 'No asignada'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      updateKDSStation(st.id, { active: !st.active })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      st.active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {st.active ? 'ACTIVA' : 'INACTIVA'}
                  </button>
                  <button
                    onClick={() => handleStartEdit(st)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteKDSStation(st.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
