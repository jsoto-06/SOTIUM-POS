import React, { useState } from 'react';
import { Table, TableShape } from '../../types/pos';
import { Settings2, X, Check, Trash2, Copy, Lock, RotateCw, Palette, Users } from 'lucide-react';

interface TableEditorModalProps {
  table?: Table | null;
  salonId: string;
  onClose: () => void;
  onSave: (data: Partial<Table> & { name: string; seats: number }) => void;
  onDuplicate?: (tableId: string) => void;
  onDelete?: (tableId: string) => void;
}

const TABLE_SHAPES: { shape: TableShape; label: string; icon: string }[] = [
  { shape: 'square', label: 'Cuadrada', icon: '▢' },
  { shape: 'rectangle', label: 'Rectangular', icon: '▭' },
  { shape: 'round', label: 'Circular', icon: '○' },
  { shape: 'oval', label: 'Ovalada', icon: '⬏' },
];

const PRESET_COLORS = [
  { name: 'Predeterminado', color: '' },
  { name: 'VIP Oro', color: '#f59e0b' },
  { name: 'Azul Ejecutivo', color: '#3b82f6' },
  { name: 'Verde Terraza', color: '#10b981' },
  { name: 'Purpura Reservado', color: '#8b5cf6' },
  { name: 'Rojo Prioritario', color: '#ef4444' },
];

export const TableEditorModal: React.FC<TableEditorModalProps> = ({
  table,
  salonId,
  onClose,
  onSave,
  onDuplicate,
  onDelete,
}) => {
  const [name, setName] = useState(table?.name || 'Mesa ');
  const [number, setNumber] = useState(table?.number || '');
  const [seats, setSeats] = useState(table?.seats || 4);
  const [shape, setShape] = useState<TableShape>(table?.shape || 'square');
  const [width, setWidth] = useState(table?.width || 110);
  const [height, setHeight] = useState(table?.height || 90);
  const [rotation, setRotation] = useState(table?.rotation || 0);
  const [color, setColor] = useState(table?.color || '');
  const [isLocked, setIsLocked] = useState(table?.isLocked || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      number: number.trim() || name.replace(/[^0-9]/g, ''),
      seats: Number(seats),
      shape,
      width: Number(width),
      height: Number(height),
      rotation: Number(rotation),
      color,
      isLocked,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">
              {table ? `Configurar ${table.name}` : 'Añadir Nueva Mesa'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Name & Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Nombre de la Mesa *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Mesa 12, Terraza T1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Nº Mesa
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="12"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* Seats & Shape */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Capacidad Comensales (Pax)
              </label>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Forma Geométrica
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {TABLE_SHAPES.map((s) => (
                  <button
                    key={s.shape}
                    type="button"
                    onClick={() => setShape(s.shape)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center space-x-1 justify-center ${
                      shape === s.shape
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-mono">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Width, Height, Rotation */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Ancho (px)
              </label>
              <input
                type="number"
                min={40}
                max={400}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Alto (px)
              </label>
              <input
                type="number"
                min={40}
                max={400}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Rotación (º)
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 45) % 360)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-amber-400"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white text-center font-mono"
                />
              </div>
            </div>
          </div>

          {/* Color & Locking */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Color Personalizado</span>
              <Palette className="w-3.5 h-3.5 text-amber-400" />
            </label>
            <div className="flex items-center space-x-2">
              {PRESET_COLORS.map((pc) => (
                <button
                  key={pc.name}
                  type="button"
                  onClick={() => setColor(pc.color)}
                  style={{ backgroundColor: pc.color || '#334155' }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === pc.color ? 'border-amber-400 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                  }`}
                  title={pc.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center space-x-2">
              <Lock className={`w-4 h-4 ${isLocked ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-slate-200">Bloquear Posición en Plano</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isLocked ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex space-x-1.5">
              {table && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar ${table.name}?`)) {
                      onDelete(table.id);
                      onClose();
                    }
                  }}
                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-bold rounded-xl text-xs"
                  title="Eliminar Mesa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {table && onDuplicate && (
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(table.id);
                    onClose();
                  }}
                  className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                  title="Duplicar Mesa"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

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
                <span>Guardar Mesa</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
