import React, { useState } from 'react';
import { SanitaryAudit, NonConformity, SupplierSanitaryCert } from '../../types/qualityHaccp';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { FileCheck, ShieldAlert, CheckCircle, Plus, AlertCircle, Building, Award, Calendar } from 'lucide-react';

export const SanitaryAuditsManager: React.FC = () => {
  const [audits, setAudits] = useState<SanitaryAudit[]>(QualityHaccpService.getSanitaryAudits());
  const [supplierCerts] = useState<SupplierSanitaryCert[]>(QualityHaccpService.getSupplierCerts());
  const [selectedAudit, setSelectedAudit] = useState<SanitaryAudit>(audits[0]);

  const [showAddAuditModal, setShowAddAuditModal] = useState(false);
  const [showAddNcModal, setShowAddNcModal] = useState(false);

  // New Audit Form State
  const [auditTitle, setAuditTitle] = useState('');
  const [auditType, setAuditType] = useState<SanitaryAudit['type']>('INTERNA');
  const [auditorName, setAuditorName] = useState('');
  const [scorePercentage, setScorePercentage] = useState<number>(95);
  const [summary, setSummary] = useState('');

  // New Non-Conformity Form State
  const [ncDescription, setNcDescription] = useState('');
  const [ncSeverity, setNcSeverity] = useState<NonConformity['severity']>('LEVE');
  const [ncResponsible, setNcResponsible] = useState('');
  const [ncCorrectivePlan, setNcCorrectivePlan] = useState('');
  const [ncDeadline, setNcDeadline] = useState('2026-08-15');

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditTitle || !auditorName) return;

    const resultStatus: SanitaryAudit['resultStatus'] =
      scorePercentage >= 95 ? 'EXCELENTE' : scorePercentage >= 85 ? 'FAVORABLE' : 'FAVORABLE_CON_DEFICIENCIAS';

    const newAudit = QualityHaccpService.createSanitaryAudit(
      {
        title: auditTitle,
        type: auditType,
        auditDate: new Date().toISOString().split('T')[0],
        auditorName,
        scorePercentage,
        resultStatus,
        summary,
        nonConformities: [],
      },
      'Usuario Calidad'
    );

    setAudits(QualityHaccpService.getSanitaryAudits());
    setSelectedAudit(newAudit);
    setShowAddAuditModal(false);

    // Reset Form
    setAuditTitle('');
    setAuditorName('');
    setSummary('');
  };

  const handleAddNc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudit || !ncDescription) return;

    const updated = QualityHaccpService.addNonConformity(
      selectedAudit.id,
      {
        description: ncDescription,
        severity: ncSeverity,
        detectedDate: new Date().toISOString().split('T')[0],
        responsible: ncResponsible || 'Jefe de Cocina',
        correctiveActionPlan: ncCorrectivePlan,
        deadlineDate: ncDeadline,
        status: 'PENDIENTE',
      },
      'Usuario Calidad'
    );

    setSelectedAudit({ ...updated });
    setAudits(QualityHaccpService.getSanitaryAudits());
    setShowAddNcModal(false);

    // Reset Form
    setNcDescription('');
    setNcCorrectivePlan('');
  };

  const handleResolveNc = (ncId: string) => {
    if (!selectedAudit) return;
    const updated = QualityHaccpService.resolveNonConformity(selectedAudit.id, ncId, 'Usuario Calidad');
    setSelectedAudit({ ...updated });
    setAudits(QualityHaccpService.getSanitaryAudits());
  };

  return (
    <div className="space-y-6">
      {/* Supplier Sanitary Certificates Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>Homologación de Proveedores & Registros Sanitarios RGSEAA ({supplierCerts.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supplierCerts.map((sc) => (
            <div key={sc.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">{sc.supplierName}</span>
                <span className="text-[10px] text-amber-300 font-mono">RGSEAA: {sc.rgseaaNumber}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{sc.certType}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Caducidad Certificado</span>
                <span className="font-mono font-bold text-emerald-400">{sc.expiryDate}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.2 rounded font-bold block mt-1">
                  Homologado OK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Audits Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            <span>Auditorías Sanitarias e Inspecciones Oficiales</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de auditorías internas, inspecciones de sanidad y planes de acción para No Conformidades.
          </p>
        </div>

        <button
          onClick={() => setShowAddAuditModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Auditoría / Inspección</span>
        </button>
      </div>

      {/* Audits Selection & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audits List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Auditorías Registradas ({audits.length})
          </h3>

          <div className="space-y-2">
            {audits.map((aud) => (
              <button
                key={aud.id}
                onClick={() => setSelectedAudit(aud)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedAudit?.id === aud.id
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {aud.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {aud.scorePercentage}%
                  </span>
                </div>
                <div className="text-xs font-bold text-white">{aud.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>{aud.auditorName}</span>
                  <span className="font-mono text-[10px]">{aud.auditDate}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Audit Detail & Non-Conformities */}
        {selectedAudit && (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mr-2">
                  {selectedAudit.code}
                </span>
                <span className="text-base font-bold text-white">{selectedAudit.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
                  Puntuación: {selectedAudit.scorePercentage}%
                </span>
                <span className="text-xs font-bold bg-emerald-500 text-slate-950 px-2.5 py-1 rounded">
                  {selectedAudit.resultStatus}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 block mb-1">Resumen del Auditor ({selectedAudit.auditorName}):</span>
              <p className="italic">{selectedAudit.summary}</p>
            </div>

            {/* Non-Conformities List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>No Conformidades Registradas ({selectedAudit.nonConformities.length})</span>
                </h4>

                <button
                  onClick={() => setShowAddNcModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir No Conformidad</span>
                </button>
              </div>

              {selectedAudit.nonConformities.length === 0 ? (
                <div className="bg-slate-950 p-4 rounded-lg text-center text-xs text-slate-400 border border-slate-800">
                  ✓ Excelente. No hay ninguna No Conformidad o deficiencia detectada en esta auditoría.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAudit.nonConformities.map((nc) => (
                    <div key={nc.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded">
                          {nc.code}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              nc.status === 'VERIFICADA'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {nc.status}
                          </span>
                          {nc.status !== 'VERIFICADA' && (
                            <button
                              onClick={() => handleResolveNc(nc.id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[10px] shadow transition-all"
                            >
                              Verificar y Cerrar NC
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-white font-medium">{nc.description}</p>
                      <div className="text-slate-400 text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800 space-y-1">
                        <div>
                          <span className="text-slate-400">Plan de Acción Correctiva:</span>{' '}
                          <span className="text-slate-200 italic">{nc.correctiveActionPlan}</span>
                        </div>
                        <div className="flex justify-between text-[10px] pt-1 border-t border-slate-800/80">
                          <span>Responsable: <strong className="text-emerald-400">{nc.responsible}</strong></span>
                          <span>Fecha Límite: <strong className="text-amber-300 font-mono">{nc.deadlineDate}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Audit Modal */}
      {showAddAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Registrar Nueva Auditoría / Inspección</span>
            </h3>

            <form onSubmit={handleCreateAudit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Título Auditoría</label>
                <input
                  type="text"
                  required
                  value={auditTitle}
                  onChange={(e) => setAuditTitle(e.target.value)}
                  placeholder="ej. Auditoría Oficial Sanidad 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo Auditoría</label>
                  <select
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value as SanitaryAudit['type'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="INTERNA">Auditoría Interna</option>
                    <option value="EXTERNA">Auditoría Externa</option>
                    <option value="INSPECCION_OFICIAL">Inspección Oficial Sanidad</option>
                    <option value="CERTIFICACION_ISO">Certificación ISO 22000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Auditor / Inspector</label>
                  <input
                    type="text"
                    required
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    placeholder="Dr. Fernando Alarcón"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Puntuación Cumplimiento (0 - 100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scorePercentage}
                  onChange={(e) => setScorePercentage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-amber-400 font-mono text-center font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resumen del Informe</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Observaciones generales del inspector..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAuditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded shadow-md"
                >
                  Guardar Auditoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add NC Modal */}
      {showAddNcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Añadir No Conformidad o Deficiencia</span>
            </h3>

            <form onSubmit={handleAddNc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Descripción de la Deficiencia</label>
                <textarea
                  rows={2}
                  required
                  value={ncDescription}
                  onChange={(e) => setNcDescription(e.target.value)}
                  placeholder="Detalle la desviación observada..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Severidad</label>
                  <select
                    value={ncSeverity}
                    onChange={(e) => setNcSeverity(e.target.value as NonConformity['severity'])}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  >
                    <option value="LEVE">LEVE</option>
                    <option value="GRAVE">GRAVE</option>
                    <option value="MUY_GRAVE">MUY GRAVE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={ncResponsible}
                    onChange={(e) => setNcResponsible(e.target.value)}
                    placeholder="Mantenimiento / Jefe Cocina"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Plan de Acción Correctiva</label>
                <textarea
                  rows={2}
                  value={ncCorrectivePlan}
                  onChange={(e) => setNcCorrectivePlan(e.target.value)}
                  placeholder="Acciones para subsanar la no conformidad..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Fecha Límite Subsanación</label>
                <input
                  type="date"
                  value={ncDeadline}
                  onChange={(e) => setNcDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNcModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded shadow-md"
                >
                  Guardar No Conformidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
