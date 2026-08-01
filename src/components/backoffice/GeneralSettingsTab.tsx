import React, { useState } from 'react';
import { GeneralSettings, TaxRate, FamilyCategory, PaymentMethod, BankAccount } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Percent, Layers, CreditCard, Landmark, DollarSign, CheckCircle2, Save, Plus } from 'lucide-react';

interface Props {
  settings: GeneralSettings;
  onUpdate: () => void;
}

export const GeneralSettingsTab: React.FC<Props> = ({ settings, onUpdate }) => {
  const [data, setData] = useState<GeneralSettings>(settings);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    backofficeService.updateGeneralSettings(data);
    setSuccessMsg('Configuración general (impuestos, familias, pagos) guardada.');
    onUpdate();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Percent className="w-6 h-6 text-amber-400" />
            Configuración General ERP
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Gestión de tipos impositivos de IVA, familias de productos, formas de pago, cuentas bancarias y tipos de cambio.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 text-sm"
        >
          <Save className="w-4 h-4" />
          Guardar Cambios
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Taxes & IVA */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
          <Percent className="w-4 h-4" />
          Tipos Impositivos & IVA (España / UE)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.taxes.map((tax, idx) => (
            <div key={tax.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-amber-400">{tax.code}</span>
                {tax.isDefault && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Por Defecto</span>}
              </div>
              <input
                type="text"
                value={tax.name}
                onChange={(e) => {
                  const updated = [...data.taxes];
                  updated[idx].name = e.target.value;
                  setData({ ...data, taxes: updated });
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white"
              />
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Tipo IVA:</span>
                <input
                  type="number"
                  value={tax.rate}
                  onChange={(e) => {
                    const updated = [...data.taxes];
                    updated[idx].rate = Number(e.target.value);
                    setData({ ...data, taxes: updated });
                  }}
                  className="w-20 bg-slate-800 border border-slate-700 rounded p-1 text-center font-mono text-white"
                />
                <span>%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Families */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Familias & Categorías de Venta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.families.map((fam, idx) => (
            <div key={fam.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-8 rounded" style={{ backgroundColor: fam.color }}></div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={fam.name}
                    onChange={(e) => {
                      const updated = [...data.families];
                      updated[idx].name = e.target.value;
                      setData({ ...data, families: updated });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm font-semibold text-white"
                  />
                </div>
                <span className="text-xs font-mono text-slate-400">[{fam.code}]</span>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>Zona Comanda:</span>
                <span className="text-amber-300 font-sans">{fam.printerZone}</span>
              </div>

              <div className="text-xs text-slate-400">
                <span>Subcategorías:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {fam.subcategories.map((sub, sidx) => (
                    <span key={sidx} className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods & Banks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment methods */}
        <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Métodos de Pago Autorizados
          </h3>

          <div className="space-y-3">
            {data.paymentMethods.map((pm) => (
              <div key={pm.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{pm.name}</span>
                  <span className="text-slate-400 text-[11px] font-mono">Abre cajón: {pm.opensDrawer ? 'SÍ' : 'NO'}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono font-bold">
                  {pm.active ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank accounts */}
        <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            Cuentas Bancarias & Tesorería
          </h3>

          <div className="space-y-3">
            {data.bankAccounts.map((bank) => (
              <div key={bank.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{bank.bankName}</span>
                  <span className="font-mono text-emerald-400 font-bold">{bank.balance.toLocaleString('es-ES', { style: 'currency', currency: bank.currency })}</span>
                </div>
                <div className="font-mono text-slate-400 text-[11px]">{bank.iban}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
