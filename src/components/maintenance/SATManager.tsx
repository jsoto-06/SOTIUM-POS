import React, { useState } from 'react';
import { SATIntervention, SATInterventionType, Asset } from '../../types/maintenance';
import { Shield, Plus, Calendar, User, FileText, CheckCircle2, Building, X } from 'lucide-react';

interface SATManagerProps {
  satInterventions: SATIntervention[];
  assets: Asset[];
  onCreateSAT: (data: Omit<SATIntervention, 'id' | 'code'>) => void;
}

const SAT_TYPES: SATInterventionType[] = [
  'INSTALACION',
  'GARANTIA',
  'CONTRATO_MANTENIMIENTO',
  'VISITA_TECNICA',
  'URGENCIA',
];

export const SATManager: React.FC<SATManagerProps> = ({
  satInterventions,
  assets,
  onCreateSAT,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [providerSAT, setProviderSAT] = useState('Rational Oficial España SAT');
  const [type, setType] = useState<SATInterventionType>('GARANTIA');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [technician, setTechnician] = useState('Javier Ruiz (SAT Oficial)');
  const [reportSummary, setReportSummary] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (!asset) return;

    onCreateSAT({
      assetId: asset.id,
      assetName: asset.name,
      clientOrVenue: 'Restaurante Salamanca Central (Sede 1)',
      providerSAT,
      type,
      scheduledDate,
      status: 'PROGRAMADA',
      technician,
      reportSummary,
      contractId: 'CTR-2026-991',
      totalCost,
      warrantyCovered: type === 'GARANTIA',
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>SAT - Servicio de Asistencia Técnica Oficial</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Gestión de intervenciones oficiales, visitas en garantía y contratos de mantenimiento
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Visita SAT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {satInterventions.map((sat) => (
          <div key={sat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-800 text-amber-400 font-mono text-xs px-2 py-0.5 rounded font-bold">
                    {sat.code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {sat.type}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-2">{sat.assetName}</h3>
                <p className="text-slate-400 text-xs">{sat.providerSAT}</p>
              </div>

              {sat.warrantyCovered ? (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  COBIERTO POR GARANTÍA (0€)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300">
                  {sat.totalCost.toFixed(2)}€
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {sat.reportSummary}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div>Fecha: {sat.scheduledDate}</div>
              <div>Técnico: {sat.technician}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create SAT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Registrar Intervención SAT</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Activo *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Proveedor SAT</label>
                  <input
                    type="text"
                    value={providerSAT}
                    onChange={(e) => setProviderSAT(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Tipo Intervención</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as SATInterventionType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    {SAT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Fecha Visita</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Técnico SAT</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Resumen del Informe Técnico</label>
                <textarea
                  rows={2}
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
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
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Guardar Visita SAT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
