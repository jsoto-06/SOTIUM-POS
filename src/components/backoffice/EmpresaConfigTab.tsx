import React, { useState } from 'react';
import { CompanyConfig } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Building2, Save, ShieldCheck, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  company: CompanyConfig;
  onUpdate: () => void;
}

export const EmpresaConfigTab: React.FC<Props> = ({ company, onUpdate }) => {
  const [form, setForm] = useState<CompanyConfig>(company);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    backofficeService.updateCompanyConfig(form);
    setSuccessMsg('Configuración de la empresa guardada correctamente.');
    onUpdate();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Configuración Global de la Empresa & Datos Fiscales
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Parámetros legales, certificados de firma digital VeriFactu, multisede y representación gráfica de comprobantes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            form.digitalCertificateStatus === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            Certificado FNMT: {form.digitalCertificateStatus === 'VALID' ? 'VÁLIDO' : 'CADUCADO'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fiscal Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2">
              Identificación Fiscal & Razón Social
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Razón Social Oficial</label>
                <input
                  type="text"
                  value={form.legalName}
                  onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">NIF / CIF / VAT Number</label>
                <input
                  type="text"
                  value={form.nif}
                  onChange={(e) => setForm({ ...form, nif: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Corporativo (Facturas)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono Central</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sitio Web Oficial</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dirección Fiscal / Sede Social</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Código Postal</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Provincia</label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">País</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Regional & Localization */}
          <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2">
              Localización, Moneda & Horarios
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Moneda Principal</label>
                <select
                  value={form.currency}
                  onChange={(e) => {
                    const sym = e.target.value === 'EUR' ? '€' : e.target.value === 'USD' ? '$' : '£';
                    setForm({ ...form, currency: e.target.value, currencySymbol: sym });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="EUR">EUR (€) Euro</option>
                  <option value="USD">USD ($) US Dollar</option>
                  <option value="GBP">GBP (£) British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Zona Horaria</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Europe/Madrid">Europe/Madrid (GMT+1 / GMT+2)</option>
                  <option value="Europe/Canary">Europe/Canary (GMT+0 / GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Idioma ERP</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="es-ES">Español (España)</option>
                  <option value="en-US">English (US)</option>
                  <option value="ca-ES">Català</option>
                  <option value="eu-ES">Euskara</option>
                  <option value="gl-ES">Galego</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pie de Página en Tickets y Comprobantes</label>
              <textarea
                value={form.ticketFooter}
                onChange={(e) => setForm({ ...form, ticketFooter: e.target.value })}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Branding & Digital Certificates */}
        <div className="space-y-6">
          <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2">
              Logotipo & Marca Visual
            </h3>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-dashed border-slate-700">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo Empresa" className="h-24 w-auto object-contain mb-3 rounded-lg border border-slate-800" />
              ) : (
                <div className="h-24 w-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 mb-3">Sin Logo</div>
              )}
              <div className="w-full">
                <label className="block text-xs font-medium text-slate-300 mb-1">URL de Logotipo</label>
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center justify-between">
              <span>Certificado Digital VeriFactu</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Estado:</span>
                <span className="text-emerald-400 font-semibold font-mono">ACTIVO / VÁLIDO</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Caducidad:</span>
                <span className="text-white font-mono">{form.digitalCertificateExpiresAt ? new Date(form.digitalCertificateExpiresAt).toLocaleDateString() : '31/12/2028'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Envío VeriFactu a AEAT:</span>
                <input
                  type="checkbox"
                  checked={form.verifactuEnabled}
                  onChange={(e) => setForm({ ...form, verifactuEnabled: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-amber-400 h-4 w-4"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Simulador: Certificado digital FNMT .p12 verificado e instalado correctamente.')}
              className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 border border-slate-600 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              Subir nuevo Certificado .P12 / .PFX
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Save className="w-5 h-5" />
              Guardar Cambios Globales
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
