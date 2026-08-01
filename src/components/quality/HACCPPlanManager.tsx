import React, { useState } from 'react';
import { HACCPPlan, CriticalControlPoint } from '../../types/qualityHaccp';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { ShieldAlert, AlertTriangle, Plus, CheckCircle, FileText, Activity } from 'lucide-react';

export const HACCPPlanManager: React.FC = () => {
  const [plans, setPlans] = useState<HACCPPlan[]>(QualityHaccpService.getHACCPPlans());
  const [selectedPlan, setSelectedPlan] = useState<HACCPPlan | null>(plans[0] || null);
  const [showAddPccModal, setShowAddPccModal] = useState(false);

  // New PCC Form State
  const [pccCode, setPccCode] = useState('');
  const [pccName, setPccName] = useState('');
  const [pccTargetStage, setPccTargetStage] = useState('');
  const [minTemp, setMinTemp] = useState<number | ''>('');
  const [maxTemp, setMaxTemp] = useState<number | ''>('');
  const [monitoringMethod, setMonitoringMethod] = useState('');
  const [responsibleRole, setResponsibleRole] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');

  const handleAddPcc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !pccCode || !pccName) return;

    const newPCC: Omit<CriticalControlPoint, 'id'> = {
      code: pccCode,
      name: pccName,
      level: 'PCC',
      targetStage: pccTargetStage || 'Etapa General',
      criticalLimitMin: minTemp !== '' ? Number(minTemp) : undefined,
      criticalLimitMax: maxTemp !== '' ? Number(maxTemp) : undefined,
      unit: 'ºC',
      monitoringMethod: monitoringMethod || 'Inspección termométrica',
      monitoringFrequency: 'DIARIA',
      responsibleRole: responsibleRole || 'Jefe de Cocina',
      correctiveAction: correctiveAction || 'Inmovilizar producto y consultar plan de contingencia',
      verificationProcedure: 'Verificación semanal de registros',
      recordsRequired: 'Registro APPCC Digital',
    };

    const updated = QualityHaccpService.addPCCtoPlan(selectedPlan.id, newPCC, 'Usuario Calidad');
    setSelectedPlan({ ...updated });
    setPlans(QualityHaccpService.getHACCPPlans());
    setShowAddPccModal(false);

    // Reset Form
    setPccCode('');
    setPccName('');
    setPccTargetStage('');
    setMinTemp('');
    setMaxTemp('');
    setMonitoringMethod('');
    setResponsibleRole('');
    setCorrectiveAction('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl gap-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            <span>Sistema Autocontrol APPCC / HACCP Enterprise</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Análisis de Peligros y Puntos Críticos de Control conforme al Reglamento (CE) 852/2004 y norma ISO 22000.
          </p>
        </div>
        {selectedPlan && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddPccModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nuevo PCC</span>
            </button>
          </div>
        )}
      </div>

      {/* Plan Details Card */}
      {selectedPlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 mr-2">
                {selectedPlan.code}
              </span>
              <span className="text-lg font-bold text-white">{selectedPlan.title}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Versión: <strong className="text-white">{selectedPlan.version}</strong></span>
              <span>•</span>
              <span>Aprobado por: <strong className="text-white">{selectedPlan.approvedBy}</strong></span>
              <span>•</span>
              <span>Revisión: <strong className="text-amber-300">{selectedPlan.nextReviewDate}</strong></span>
            </div>
          </div>

          {/* Critical Control Points (PCC) Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Puntos Críticos de Control (PCC) Registrados ({selectedPlan.pccs.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedPlan.pccs.map((pcc) => (
                <div key={pcc.id} className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-lg p-4 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-red-500/20 text-red-400 font-mono text-xs font-bold px-2 py-0.5 rounded border border-red-500/30">
                      {pcc.code}
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      Frecuencia: {pcc.monitoringFrequency}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{pcc.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">Etapa: <strong className="text-slate-300">{pcc.targetStage}</strong></p>

                  <div className="space-y-2 text-xs bg-slate-900/60 p-3 rounded border border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Límite Crítico:</span>
                      <strong className="text-amber-400 font-mono">
                        {pcc.criticalLimitMin !== undefined ? `${pcc.criticalLimitMin}ºC` : ''} a {pcc.criticalLimitMax !== undefined ? `${pcc.criticalLimitMax}ºC` : ''}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Responsable:</span>
                      <span className="font-medium text-emerald-300">{pcc.responsibleRole}</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400 block mb-0.5">Acción Correctiva:</span>
                      <p className="text-[11px] text-slate-300 italic">{pcc.correctiveAction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hazards Table */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Análisis de Peligros y Evaluación de Riesgos ({selectedPlan.hazards.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Etapa</th>
                    <th className="p-3">Tipo Peligro</th>
                    <th className="p-3">Descripción</th>
                    <th className="p-3">Severidad</th>
                    <th className="p-3">PCC?</th>
                    <th className="p-3">Medida Preventiva</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {selectedPlan.hazards.map((hz) => (
                    <tr key={hz.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-semibold text-white">{hz.stage}</td>
                      <td className="p-3">
                        <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono border border-cyan-500/20">
                          {hz.hazardType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{hz.description}</td>
                      <td className="p-3">
                        <span className="text-amber-400 font-bold">{hz.severity}</span>
                      </td>
                      <td className="p-3">
                        {hz.isPCC ? (
                          <span className="bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded border border-red-500/30">
                            {hz.pccCode}
                          </span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300 italic">{hz.preventiveMeasure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add PCC */}
      {showAddPccModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Registrar Nuevo Punto Crítico de Control (PCC)</span>
            </h3>

            <form onSubmit={handleAddPcc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Código PCC (ej. PCC-5)</label>
                  <input
                    type="text"
                    required
                    value={pccCode}
                    onChange={(e) => setPccCode(e.target.value)}
                    placeholder="PCC-5"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nombre PCC</label>
                  <input
                    type="text"
                    required
                    value={pccName}
                    onChange={(e) => setPccName(e.target.value)}
                    placeholder="Mantenimiento en Muestra"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Etapa de la Cadena Alimentaria</label>
                <input
                  type="text"
                  value={pccTargetStage}
                  onChange={(e) => setPccTargetStage(e.target.value)}
                  placeholder="ej. Cocina Principal / Servicio de Platos"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Temp Mínima (ºC)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minTemp}
                    onChange={(e) => setMinTemp(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Temp Máxima (ºC)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxTemp}
                    onChange={(e) => setMaxTemp(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="4.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Método de Monitorización</label>
                <input
                  type="text"
                  value={monitoringMethod}
                  onChange={(e) => setMonitoringMethod(e.target.value)}
                  placeholder="ej. Lectura termométrica de hincado en núcleo"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Responsable</label>
                <input
                  type="text"
                  value={responsibleRole}
                  onChange={(e) => setResponsibleRole(e.target.value)}
                  placeholder="ej. Jefe de Partida / Cocinero"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Acción Correctiva de Emergencia</label>
                <textarea
                  rows={2}
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="Acción si se superan los límites críticos..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPccModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded shadow-md"
                >
                  Guardar PCC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
