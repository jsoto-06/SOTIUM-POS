import React, { useState } from 'react';
import { ChecklistTemplate, ChecklistExecution, ChecklistCategory } from '../../types/qualityHaccp';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Play, UserCheck, Calendar } from 'lucide-react';

export const ChecklistsManager: React.FC = () => {
  const [templates] = useState<ChecklistTemplate[]>(QualityHaccpService.getChecklistTemplates());
  const [executions, setExecutions] = useState<ChecklistExecution[]>(QualityHaccpService.getChecklistExecutions());
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate>(templates[0]);

  const [operatorName, setOperatorName] = useState<string>('Elena Torres (Jefa de Cocina)');
  const [answersState, setAnswersState] = useState<{ [qId: string]: boolean }>(() => {
    const initial: { [qId: string]: boolean } = {};
    if (templates[0]) {
      templates[0].questions.forEach((q) => {
        initial[q.id] = true;
      });
    }
    return initial;
  });

  const handleSelectTemplate = (tmpl: ChecklistTemplate) => {
    setSelectedTemplate(tmpl);
    const initial: { [qId: string]: boolean } = {};
    tmpl.questions.forEach((q) => {
      initial[q.id] = true;
    });
    setAnswersState(initial);
  };

  const toggleAnswer = (qId: string) => {
    setAnswersState((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleExecuteChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const answersPayload = selectedTemplate.questions.map((q) => ({
      questionId: q.id,
      questionText: q.text,
      isPassed: answersState[q.id] !== undefined ? answersState[q.id] : true,
    }));

    const result = QualityHaccpService.executeChecklist(
      selectedTemplate.id,
      operatorName,
      answersPayload,
      operatorName
    );

    setExecutions(QualityHaccpService.getChecklistExecutions());
  };

  return (
    <div className="space-y-6">
      {/* Templates Selector Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          <span>Checklists de Seguridad Alimentaria, Apertura y Cierre</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{tmpl.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Template Execution Interactive Form */}
      {selectedTemplate && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mr-2">
                {selectedTemplate.code}
              </span>
              <span className="text-base font-bold text-white">{selectedTemplate.title}</span>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800 font-mono">
              Categoría: {selectedTemplate.category}
            </span>
          </div>

          <form onSubmit={handleExecuteChecklist} className="space-y-4 text-xs">
            <div className="space-y-2">
              {selectedTemplate.questions.map((q, idx) => {
                const isPassed = answersState[q.id] !== undefined ? answersState[q.id] : true;
                return (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                      isPassed
                        ? 'bg-slate-950/80 border-slate-800'
                        : 'bg-red-950/30 border-red-500/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500 font-mono text-xs font-bold">#{idx + 1}</span>
                      <div>
                        <span className="text-xs font-medium text-white">{q.text}</span>
                        {q.isCritical && (
                          <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.2 rounded border border-red-500/30 uppercase">
                            Crítico APPCC
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAnswer(q.id)}
                        className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1 transition-all ${
                          isPassed
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CONFORME</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAnswer(q.id)}
                        className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1 transition-all ${
                          !isPassed
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>DESVIACIÓN</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-slate-400 mb-1">Nombre del Inspector / Operario</label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Firmar y Guardar Checklist</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historical Executions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Histórico de Checklists Realizados ({executions.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Checklist</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Cumplimiento</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {executions.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-mono text-[11px] text-slate-400">{ex.date} {ex.time}</td>
                  <td className="p-3 font-semibold text-white">{ex.templateTitle}</td>
                  <td className="p-3 font-mono text-[10px] text-amber-300">{ex.category}</td>
                  <td className="p-3">
                    <span className="font-mono font-bold text-amber-400">
                      {ex.compliancePercentage}% ({ex.passedQuestions}/{ex.totalQuestions})
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        ex.status === 'APROBADO'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ex.status === 'CON_OBSERVACIONES'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{ex.operatorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
