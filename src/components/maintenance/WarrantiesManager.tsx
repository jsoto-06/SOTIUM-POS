import React, { useState } from 'react';
import { AssetWarranty, Asset } from '../../types/maintenance';
import { ShieldAlert, Plus, Calendar, Phone, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface WarrantiesManagerProps {
  warranties: AssetWarranty[];
  assets: Asset[];
  onCreateWarranty: (data: Omit<AssetWarranty, 'id'>) => void;
}

export const WarrantiesManager: React.FC<WarrantiesManagerProps> = ({
  warranties,
  assets,
  onCreateWarranty,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [provider, setProvider] = useState('Sotium Hardware S.L.');
  const [manufacturer, setManufacturer] = useState('Rational AG');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [coverageDetails, setCoverageDetails] = useState('Garantía total de componentes y mano de obra');
  const [policyNumber, setPolicyNumber] = useState(`POL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [contactPhone, setContactPhone] = useState('+34 900 112 233');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (!asset) return;

    onCreateWarranty({
      assetId: asset.id,
      assetName: asset.name,
      provider,
      manufacturer,
      startDate,
      endDate,
      coverageDetails,
      alertDaysBefore: 30,
      status: 'VIGENTE',
      policyNumber,
      contactPhone,
    });

    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VIGENTE':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">VIGENTE</span>;
      case 'PROXIMA_VENCER':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRÓXIMA A VENCER</span>;
      case 'VENCIDA':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">VENCIDA</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <span>Gestión de Garantías y Coberturas</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Control automático de vencimientos de garantía, pólizas de fabricante y contacto directo
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Garantía</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warranties.map((war) => (
          <div key={war.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-slate-800 text-amber-400 font-mono text-xs px-2 py-0.5 rounded font-bold">
                  {war.policyNumber}
                </span>
                <h3 className="font-bold text-white text-base mt-2">{war.assetName}</h3>
                <p className="text-slate-400 text-xs">
                  {war.manufacturer} ({war.provider})
                </p>
              </div>

              {getStatusBadge(war.status)}
            </div>

            <p className="text-slate-300 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {war.coverageDetails}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Vence: <strong className="text-slate-200">{war.endDate}</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{war.contactPhone || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Warranty */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <span>Registrar Nueva Póliza de Garantía</span>
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
                      {a.internalCode} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Proveedor Vendedor</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Nº Póliza / Registro</label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Teléfono SAT / Cobertura</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Fecha Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Detalle de Coberturas</label>
                <textarea
                  rows={2}
                  value={coverageDetails}
                  onChange={(e) => setCoverageDetails(e.target.value)}
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
                  Guardar Garantía
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
