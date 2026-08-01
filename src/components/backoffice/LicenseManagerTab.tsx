import React, { useState } from 'react';
import { LicenseInfo } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Key, ShieldCheck, CheckCircle2, Award, Sparkles, Clock } from 'lucide-react';

interface Props {
  license: LicenseInfo;
  onUpdate: () => void;
}

export const LicenseManagerTab: React.FC<Props> = ({ license: initialLicense, onUpdate }) => {
  const [lic, setLic] = useState<LicenseInfo>(initialLicense);
  const [inputKey, setInputKey] = useState('');
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = backofficeService.activateLicense(inputKey);
    setIsSuccess(res.success);
    setMsg(res.message);
    if (res.success) {
      setLic(res.license);
      setInputKey('');
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Gestión de Licencia Enterprise & Módulos Habilitados
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Activación de clave de producto, control de terminales TPV autorizados y características activas.
          </p>
        </div>

        <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {lic.type}
        </span>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${isSuccess ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* License Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2">
            Información del Titular & Suscripción
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-900 p-3 rounded">
              <span className="text-slate-500 block text-[10px]">CLAVE DE LICENCIA:</span>
              <span className="text-amber-300 font-bold">{lic.licenseKey}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded">
              <span className="text-slate-500 block text-[10px]">TITULAR CONTRATO:</span>
              <span className="text-white font-sans">{lic.companyHolder}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded">
              <span className="text-slate-500 block text-[10px]">FECHA VENCIMIENTO:</span>
              <span className="text-white">{new Date(lic.expirationDate).toLocaleDateString()}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded">
              <span className="text-slate-500 block text-[10px]">DÍAS RESTANTES:</span>
              <span className="text-emerald-400 font-bold">{lic.daysRemaining} días</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Licencias TPV Asignadas:</span>
            <span className="text-white font-bold">{lic.usedPOSLicenses} de {lic.maxPOSLicenses} TPVs activos</span>
          </div>
        </div>

        {/* Activation Form */}
        <form onSubmit={handleActivate} className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Renovar / Activar Clave
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nueva Clave de Producto</label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="ERP-ENT-XXXX-XXXX-XXXX"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors"
          >
            Activar Licencia
          </button>
        </form>
      </div>

      {/* Enabled Modules Grid */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2">
          Módulos Enterprise Habilitados en este Servidor
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(lic.features).map(([key, val]) => (
            <div key={key} className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              {val ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">Desactivado</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
