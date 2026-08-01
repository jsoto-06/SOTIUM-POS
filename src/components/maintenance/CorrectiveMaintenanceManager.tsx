import React, { useState } from 'react';
import { Incident, IncidentPriority, Asset } from '../../types/maintenance';
import { AlertTriangle, Plus, CheckCircle2, Clock, User, FileText, Wrench, X } from 'lucide-react';

interface CorrectiveMaintenanceManagerProps {
  incidents: Incident[];
  assets: Asset[];
  onCreateIncident: (data: Omit<Incident, 'id' | 'code' | 'openDate' | 'status'>) => void;
  onCloseIncident: (id: string, notes?: string) => void;
}

const PRIORITIES: IncidentPriority[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

export const CorrectiveMaintenanceManager: React.FC<CorrectiveMaintenanceManagerProps> = ({
  incidents,
  assets,
  onCreateIncident,
  onCloseIncident,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('ALTA');
  const [description, setDescription] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('Chef Elena R.');
  const [assignedTechnician, setAssignedTechnician] = useState('Antonio V.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (!asset || !title.trim()) return;

    onCreateIncident({
      assetId: asset.id,
      assetName: asset.name,
      title,
      priority,
      description,
      photos: [],
      videos: [],
      documents: [],
      responsiblePerson,
      assignedTechnician,
      timeSpentMinutes: 0,
      usedMaterials: [],
      laborCost: 0,
      materialCost: 0,
      totalCost: 0,
    });

    setShowModal(false);
  };

  const getPriorityBadge = (p: IncidentPriority) => {
    switch (p) {
      case 'CRITICA':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-600 text-white animate-pulse">CRÍTICA</span>;
      case 'ALTA':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">ALTA</span>;
      case 'MEDIA':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">MEDIA</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300">BAJA</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Mantenimiento Correctivo e Incidencias</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Registro inmediato de averías, asignación de técnicos, materiales consumidos y costes
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Avería</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((inc) => (
          <div key={inc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-800 text-rose-400 font-mono text-xs px-2 py-0.5 rounded font-bold">
                    {inc.code}
                  </span>
                  {getPriorityBadge(inc.priority)}
                </div>
                <h3 className="font-bold text-white text-base mt-2">{inc.title}</h3>
                <p className="text-slate-400 text-xs font-medium">{inc.assetName}</p>
              </div>

              {inc.status !== 'RESUELTA' ? (
                <button
                  onClick={() => onCloseIncident(inc.id, 'Reparación completada y verificada')}
                  className="flex items-center space-x-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cerrar Incidencia</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  RESUELTA
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {inc.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Reporta: {inc.responsiblePerson}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Técnico: {inc.assignedTechnician || 'Sin asignar'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Abierta: {inc.openDate}</span>
              </div>
              <div className="font-semibold text-amber-300">
                Coste total: {inc.totalCost.toFixed(2)}€
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Report Incident */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Reportar Avería o Incidencia</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Activo Afectado *</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.internalCode} - {a.name} ({a.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Título de la Avería *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  placeholder="Ej. Fuga de agua en manguito de entrada"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Técnico Asignado</label>
                  <input
                    type="text"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Descripción de la Avería</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
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
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg"
                >
                  Registrar Avería
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
