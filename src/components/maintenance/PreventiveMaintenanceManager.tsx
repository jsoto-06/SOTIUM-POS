import React, { useState } from 'react';
import { PreventivePlan, FrequencyType, Asset } from '../../types/maintenance';
import { Calendar, Plus, CheckSquare, Clock, Play, AlertCircle, Wrench, X } from 'lucide-react';

interface PreventiveMaintenanceManagerProps {
  plans: PreventivePlan[];
  assets: Asset[];
  onCreatePlan: (plan: Omit<PreventivePlan, 'id' | 'code'>) => void;
  onExecutePlan: (planId: string, executionDate: string, notes?: string) => void;
}

const FREQUENCIES: FrequencyType[] = [
  'DIARIA',
  'SEMANAL',
  'MENSUAL',
  'TRIMESTRAL',
  'SEMESTRAL',
  'ANUAL',
  'HORAS_USO',
  'KILOMETROS',
  'PRODUCCION',
];

export const PreventiveMaintenanceManager: React.FC<PreventiveMaintenanceManagerProps> = ({
  plans,
  assets,
  onCreatePlan,
  onExecutePlan,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('MENSUAL');
  const [frequencyValue, setFrequencyValue] = useState(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [technician, setTechnician] = useState('Técnico Antonio V.');
  const [checklistTasks, setChecklistTasks] = useState<string[]>([
    'Comprobar estado general y conexionado',
    'Limpieza profunda y sustitución de filtros',
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setChecklistTasks([...checklistTasks, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  const handleRemoveTask = (index: number) => {
    setChecklistTasks(checklistTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (!asset || !title.trim()) return;

    onCreatePlan({
      assetId: asset.id,
      assetName: asset.name,
      title,
      description,
      frequency,
      frequencyValue,
      checklist: checklistTasks.map((t, idx) => ({
        id: `chk-${idx}`,
        task: t,
        completed: false,
      })),
      nextExecutionDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      estimatedMinutes,
      assignedTechnician: technician,
      active: true,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Planes de Mantenimiento Preventivo</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Programación de revisiones periódicas, checklists de inspección y generación de Orden de Trabajo
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Plan Preventivo</span>
        </button>
      </div>

      {/* Grid of Preventive Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-800 text-amber-400 font-mono text-xs px-2 py-0.5 rounded font-bold">
                    {plan.code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {plan.frequency} ({plan.frequencyValue})
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-2">{plan.title}</h3>
                <p className="text-slate-400 text-xs font-medium">{plan.assetName}</p>
              </div>

              <button
                onClick={() =>
                  onExecutePlan(
                    plan.id,
                    new Date().toISOString().split('T')[0],
                    `Ejecución preventiva manual de ${plan.code}`
                  )
                }
                className="flex items-center space-x-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ejecutar Ahora</span>
              </button>
            </div>

            <p className="text-slate-300 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {plan.description}
            </p>

            {/* Checklist */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Checklist de Tareas:</span>
              <div className="space-y-1 text-xs">
                {plan.checklist.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 text-slate-300">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Tiempo estimado: {plan.estimatedMinutes} min</span>
              </div>
              <div>
                <span>Próxima revisión: </span>
                <span className="text-amber-300 font-mono font-bold">{plan.nextExecutionDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Preventive Plan */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Nuevo Plan de Mantenimiento Preventivo</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Activo Asociado *</label>
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
                <label className="block text-slate-400 text-xs mb-1">Título del Plan *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  placeholder="Ej. Descalcificación y Cambio de Filtro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Frecuencia</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">Tiempo Estimado (min)</label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Descripción de la Tarea</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              {/* Checklist builder */}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Configurar Checklist de Verificación</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                    placeholder="Agregar tarea a la lista..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                  >
                    Añadir
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {checklistTasks.map((t, i) => (
                    <div key={i} className="flex justify-between items-center text-xs text-slate-300">
                      <span>• {t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(i)}
                        className="text-rose-400 hover:text-rose-300 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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
                  Crear Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
