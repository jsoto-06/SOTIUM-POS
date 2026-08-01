import React from 'react';
import { Customer } from '../../types/crm';
import { CRMService } from '../../services/crmService';
import { Shield, FileCheck, Download, Trash2, CheckCircle2, Lock } from 'lucide-react';

interface RGPDConsentManagerProps {
  customers: Customer[];
  onUpdateCustomer: (updated: Customer) => void;
}

export const RGPDConsentManager: React.FC<RGPDConsentManagerProps> = ({
  customers,
  onUpdateCustomer,
}) => {
  const handleToggleConsent = (customer: Customer, field: keyof Customer['rgpd']) => {
    const updated: Customer = {
      ...customer,
      rgpd: {
        ...customer.rgpd,
        [field]: !customer.rgpd[field],
        consentDate: new Date().toISOString(),
      },
    };
    onUpdateCustomer(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Auditoría & Registro RGPD (Reglamento UE 2016/679)</h3>
            <p className="text-xs text-slate-400">
              Gestión centralizada de consentimientos, derecho a la portabilidad (Art. 20) y derecho al olvido (Art. 17).
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">CIF/NIF</th>
              <th className="p-3 text-center">Marketing</th>
              <th className="p-3 text-center">WhatsApp</th>
              <th className="p-3 text-center">Analítica</th>
              <th className="p-3 text-center">Terceros</th>
              <th className="p-3 text-right">Fecha Registro</th>
              <th className="p-3 text-center">Acciones Portabilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/60">
                <td className="p-3 font-bold text-white">
                  {c.name} {c.surnames || ''}
                </td>
                <td className="p-3 font-mono text-slate-300">{c.cifNif}</td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={c.rgpd.acceptedMarketing}
                    onChange={() => handleToggleConsent(c, 'acceptedMarketing')}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={c.rgpd.acceptedWhatsapp}
                    onChange={() => handleToggleConsent(c, 'acceptedWhatsapp')}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={c.rgpd.acceptedAnalytics}
                    onChange={() => handleToggleConsent(c, 'acceptedAnalytics')}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={c.rgpd.acceptedThirdParties}
                    onChange={() => handleToggleConsent(c, 'acceptedThirdParties')}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500"
                  />
                </td>
                <td className="p-3 text-right font-mono text-slate-400">{c.rgpd.consentDate.substring(0, 10)}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      const dataPkg = CRMService.exportRGPDDataPackage(c);
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataPkg, null, 2));
                      const a = document.createElement('a');
                      a.setAttribute('href', dataStr);
                      a.setAttribute('download', `rgpd_${c.code}.json`);
                      a.click();
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-[11px] rounded flex items-center gap-1 mx-auto"
                  >
                    <Download className="w-3 h-3" /> Exportar JSON
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
