import React from 'react';
import { usePOS } from '../../context/POSContext';
import { ItemKDSStatus } from '../../types/pos';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  Palette,
  Printer,
  Tv,
  Check,
} from 'lucide-react';

interface KDSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KDSSettingsModal: React.FC<KDSSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    kdsStateColors,
    updateKDSStateColors,
    kdsSoundEnabled,
    setKDSSoundEnabled,
    kdsVolume,
    setKDSVolume,
    kdsStations,
    activeKDSStationId,
    setActiveKDSStationId,
  } = usePOS();

  if (!isOpen) return null;

  const STATUS_LABELS: Record<ItemKDSStatus, string> = {
    PENDING: 'Pendiente (Nuevo pedido)',
    ACCEPTED: 'Aceptado (Confirmado en cocina)',
    PREPARING: 'Preparando (En marcha)',
    PLATING: 'Emplatando (Acabados/Pase)',
    READY: 'Listo (Aviso camarero/Pase)',
    SERVED: 'Servido (Entregado al cliente)',
    DELIVERED: 'Entregado (Pase cerrado)',
    CANCELLED: 'Cancelado (Anulado)',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-400">Configuración KDS Enterprise</h2>
              <p className="text-xs text-slate-400">
                Colores de flujo, avisos sonoros sintetizados y ruteo multipantalla
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Sound Settings */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-white">Alertas Sonoras (Web Audio API)</span>
              </div>
              <button
                onClick={() => setKDSSoundEnabled(!kdsSoundEnabled)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
                  kdsSoundEnabled
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {kdsSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{kdsSoundEnabled ? 'SONIDO ACTIVO' : 'SILENCIADO'}</span>
              </button>
            </div>

            {kdsSoundEnabled && (
              <div className="flex items-center space-x-4 pt-2">
                <span className="text-slate-400 font-semibold">Volumen de Avisos:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={kdsVolume}
                  onChange={(e) => setKDSVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
                <span className="font-mono text-amber-400 font-bold w-12 text-right">
                  {Math.round(kdsVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Multi-screen Screen Assignment */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <Tv className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-white">Asignación Multipantalla Terminal</span>
            </div>
            <p className="text-slate-400">
              Selecciona qué pantalla o estación de trabajo representa este terminal/monitor KDS:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => setActiveKDSStationId('ALL')}
                className={`p-2.5 rounded-xl font-bold border transition-all text-left ${
                  activeKDSStationId === 'ALL'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div>Monitor Pase Global</div>
                <div className="text-[10px] opacity-80 font-normal">Todas las estaciones</div>
              </button>

              {kdsStations.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveKDSStationId(st.id)}
                  className={`p-2.5 rounded-xl font-bold border transition-all text-left ${
                    activeKDSStationId === st.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div>{st.name}</div>
                  <div className="text-[10px] opacity-80 font-normal font-mono">{st.code}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Configurable Workflow State Colors */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-white">
                Colores de Estado de Preparación
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(STATUS_LABELS) as ItemKDSStatus[]).map((stKey) => (
                <div
                  key={stKey}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <span className="font-semibold text-slate-300">{STATUS_LABELS[stKey]}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={kdsStateColors[stKey] || '#f43f5e'}
                      onChange={(e) =>
                        updateKDSStateColors({ [stKey]: e.target.value })
                      }
                      className="w-8 h-8 bg-transparent border-0 cursor-pointer rounded"
                    />
                    <span className="font-mono text-[10px] text-slate-400">
                      {kdsStateColors[stKey]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
