import React, { useState } from 'react';
import { Salon, SalonType } from '../../types/pos';
import { Layers, X, Plus, Trash2, Check, LayoutGrid } from 'lucide-react';

interface SalonEditorModalProps {
  salon?: Salon | null;
  onClose: () => void;
  onSave: (data: Partial<Salon> & { name: string }) => void;
  onDelete?: (salonId: string) => void;
}

const SALON_TYPES: { type: SalonType; label: string; desc: string }[] = [
  { type: 'COMEDOR', label: 'Comedor Principal', desc: 'Zona noble interior para comidas y cenas' },
  { type: 'BARRA', label: 'Zona de Barra', desc: 'Taburetes, zonas altas y tapeo rápido' },
  { type: 'TERRAZA', label: 'Terraza / Exterior', desc: 'Mesas al aire libre, sombrillas y veladores' },
  { type: 'RESERVADOS', label: 'Reservados VIP', desc: 'Espacios privados para grupos y ejecutivos' },
  { type: 'EVENTOS', label: 'Eventos & Banquetes', desc: 'Salón modular de gran capacidad' },
  { type: 'PLANTA_SUPERIOR', label: 'Planta Superior / Altillo', desc: 'Segunda planta o terraza panorámica' },
  { type: 'CUSTOM', label: 'Salón Personalizado', desc: 'Cualquier otra ubicación de hostelería' },
];

export const SalonEditorModal: React.FC<SalonEditorModalProps> = ({
  salon,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(salon?.name || '');
  const [type, setType] = useState<SalonType>(salon?.type || 'COMEDOR');
  const [width, setWidth] = useState(salon?.width || 1400);
  const [height, setHeight] = useState(salon?.height || 900);
  const [gridSize, setGridSize] = useState(salon?.gridSize || 20);
  const [notes, setNotes] = useState(salon?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      type,
      width: Number(width),
      height: Number(height),
      gridSize: Number(gridSize),
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">
              {salon ? `Editar ${salon.name}` : 'Crear Nuevo Salón / Zona'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Name & Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Nombre del Salón *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Terraza Jardín, Salón Noble, Barra Principal"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tipo de Zona / Salón
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SALON_TYPES.map((st) => (
                <button
                  key={st.type}
                  type="button"
                  onClick={() => setType(st.type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    type === st.type
                      ? 'bg-amber-500/15 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-300">{st.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions & Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Ancho (px)
              </label>
              <input
                type="number"
                value={width}
                min={800}
                max={3000}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Alto (px)
              </label>
              <input
                type="number"
                value={height}
                min={600}
                max={3000}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Rejilla (px)
              </label>
              <input
                type="number"
                value={gridSize}
                min={10}
                max={50}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Notas / Observaciones
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles de climatización, enchufes o zona de paso..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {salon && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar salón ${salon.name}? Se perderán sus mesas.`)) {
                    onDelete(salon.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-bold rounded-xl text-xs flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Salón</span>
              </button>
            ) : <div />}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20 flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Salón</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
