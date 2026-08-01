import React, { useState } from 'react';
import { CleaningPlan, CleaningLog } from '../../types/qualityHaccp';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { Sparkles, CheckSquare, ShieldCheck, Plus, User, FileText, CheckCircle2 } from 'lucide-react';

export const CleaningLogsManager: React.FC = () => {
  const [plans] = useState<CleaningPlan[]>(QualityHaccpService.getCleaningPlans());
  const [logs, setLogs] = useState<CleaningLog[]>(QualityHaccpService.getCleaningLogs());
  const [selectedPlan, setSelectedPlan] = useState<CleaningPlan>(plans[0]);

  const [operatorName, setOperatorName] = useState<string>('Antonio Fernández (Cocinero Cierre)');
  const [checklistState, setChecklistState] = useState<boolean[]>(
    selectedPlan ? selectedPlan.checklistItems.map(() => true) : []
  );
  const [notes, setNotes] = useState<string>('');
  const [signature, setSignature] = useState<string>('A. Fernández');

  const handlePlanChange = (plan: CleaningPlan) => {
    setSelectedPlan(plan);
    setChecklistState(plan.checklistItems.map(() => true));
  };

  const toggleCheckitem = (idx: number) => {
    const next = [...checklistState];
    next[idx] = !next[idx];
    setChecklistState(next);
  };

  const handleRecordCleaning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const log = QualityHaccpService.recordCleaningExecution(
      selectedPlan.id,
      operatorName,
      checklistState,
      notes,
      undefined,
      signature,
      operatorName
    );

    setLogs(QualityHaccpService.getCleaningLogs());
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Plans Selection & Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plans List Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sparkles className="w-4 h-4" />
            <span>Planes de Limpieza y Desinfección (L+D)</span>
          </h3>

          <div className="space-y-2">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePlanChange(p)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedPlan.id === p.id
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {p.code}
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                    {p.frequency}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">{p.zone}</div>
                <div className="text-[11px] text-slate-400">{p.element}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Plan Execution Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mr-2">
                {selectedPlan.code}
              </span>
              <span className="text-base font-bold text-white">{selectedPlan.zone} - {selectedPlan.element}</span>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Resp: {selectedPlan.responsibleRole}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 block">Producto Químico Homologado</span>
              <strong className="text-amber-300">{selectedPlan.chemicalProduct}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Concentración & Dosis</span>
              <strong className="text-white">{selectedPlan.concentration}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Tiempo de Contacto Recomendado</span>
              <strong className="text-cyan-400 font-mono">{selectedPlan.contactTimeMinutes} minutos</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Equipos de Protección (EPIs)</span>
              <span className="text-slate-300 text-[11px]">{selectedPlan.protectiveEquipment.join(', ')}</span>
            </div>
          </div>

          <form onSubmit={handleRecordCleaning} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block text-slate-300 font-bold mb-2">Checklist de Puntos de Limpieza:</label>
              <div className="space-y-2">
                {selectedPlan.checklistItems.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleCheckitem(idx)}
                    className={`flex items-center space-x-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      checklistState[idx]
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklistState[idx] || false}
                      onChange={() => {}}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span className="text-xs font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Operario Responsable</label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Firma Digital</label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Observaciones L+D</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de desinfección..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Registrar Ejecución de Limpieza</span>
            </button>
          </form>
        </div>
      </div>

      {/* Historical Executed Cleaning Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>Histórico de Limpiezas Ejecutadas ({logs.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Zona</th>
                <th className="p-3">Elemento</th>
                <th className="p-3">Producto Químico</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Operario</th>
                <th className="p-3">Verificado Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-mono text-[11px] text-slate-400">{log.completedDate} {log.completedTime}</td>
                  <td className="p-3 font-semibold text-white">{log.zone}</td>
                  <td className="p-3 text-slate-300">{log.element}</td>
                  <td className="p-3 text-amber-300 font-mono text-[11px]">{log.chemicalProductUsed}</td>
                  <td className="p-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        log.status === 'CONFORME'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{log.operatorName}</td>
                  <td className="p-3 text-slate-400 italic">{log.verifiedBy || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
