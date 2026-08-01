import React, { useState } from 'react';
import { Company } from '../../types/multicompany';
import {
  Building2,
  PlusCircle,
  Edit,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Printer,
  FileText,
  Palette,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

interface Props {
  companies: Company[];
  onCreateCompany: (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCompany: (id: string, companyData: Partial<Company>) => void;
}

export const CompanyManager: React.FC<Props> = ({ companies, onCreateCompany, onUpdateCompany }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('EMP-004');
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [cif, setCif] = useState('');
  const [vatId, setVatId] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('España');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80');
  const [corporateColor, setCorporateColor] = useState('#f59e0b');
  const [currency, setCurrency] = useState('EUR (€)');
  const [language, setLanguage] = useState('es-ES');
  const [timeZone, setTimeZone] = useState('Europe/Madrid');
  const [fiscalYear, setFiscalYear] = useState(2026);
  const [status, setStatus] = useState<Company['status']>('ACTIVA');
  const [notes, setNotes] = useState('');

  // Config fields
  const [defaultVatRate, setDefaultVatRate] = useState(10);
  const [documentSeriesPrefix, setDocumentSeriesPrefix] = useState('F2026');
  const [verifactuEnabled, setVerifactuEnabled] = useState(true);
  const [ticketBaiEnabled, setTicketBaiEnabled] = useState(false);
  const [defaultPrinter, setDefaultPrinter] = useState('PRN-TPV-01');

  const openCreateModal = () => {
    setEditingId(null);
    setCode(`EMP-00${companies.length + 1}`);
    setTradeName('');
    setLegalName('');
    setCif('');
    setVatId('');
    setAddress('');
    setProvince('');
    setPostalCode('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setShowModal(true);
  };

  const openEditModal = (c: Company) => {
    setEditingId(c.id);
    setCode(c.code);
    setTradeName(c.tradeName);
    setLegalName(c.legalName);
    setCif(c.cif);
    setVatId(c.vatId);
    setAddress(c.address);
    setProvince(c.province);
    setCountry(c.country);
    setPostalCode(c.postalCode);
    setPhone(c.phone);
    setEmail(c.email);
    setWebsite(c.website);
    setLogo(c.logo);
    setCorporateColor(c.corporateColor);
    setCurrency(c.currency);
    setLanguage(c.language);
    setTimeZone(c.timeZone);
    setFiscalYear(c.fiscalYear);
    setStatus(c.status);
    setNotes(c.notes || '');
    setDefaultVatRate(c.config.defaultVatRate);
    setDocumentSeriesPrefix(c.config.documentSeriesPrefix);
    setVerifactuEnabled(c.config.verifactuEnabled);
    setTicketBaiEnabled(c.config.ticketBaiEnabled);
    setDefaultPrinter(c.config.defaultPrinter);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName || !cif) return;

    const companyPayload = {
      code,
      tradeName,
      legalName: legalName || tradeName,
      cif,
      vatId: vatId || `ES${cif}`,
      address,
      province,
      country,
      postalCode,
      phone,
      email,
      website,
      logo,
      corporateColor,
      currency,
      language,
      timeZone,
      fiscalYear,
      status,
      notes,
      config: {
        defaultVatRate,
        documentSeriesPrefix,
        verifactuEnabled,
        ticketBaiEnabled,
        defaultPrinter,
        geminiApiKeyConfigured: true,
        currencySymbol: '€',
      },
    };

    if (editingId) {
      onUpdateCompany(editingId, companyPayload);
    } else {
      onCreateCompany(companyPayload);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Gestión de Empresas del Grupo Corporativo ({companies.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuración independiente de impuestos, series documentales, VeriFactu/TicketBAI y parámetros contables
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Alta Nueva Empresa</span>
        </button>
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div className="p-5 space-y-4">
              {/* Card Top Banner */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={company.logo}
                    alt={company.tradeName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-800 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                        {company.code}
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {company.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1 leading-tight">{company.tradeName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{company.legalName}</p>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(company)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                  title="Editar Empresa"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Fiscal & Tax Information */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">CIF / NIF IVA:</span>
                  <span className="font-mono font-bold text-amber-400">{company.cif} ({company.vatId})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Dirección Fiscal:</span>
                  <span className="text-right font-medium">{company.address}, {company.province}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Contacto:</span>
                  <span className="font-mono text-slate-300">{company.phone} • {company.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Ejercicio Fiscal:</span>
                  <span className="font-mono text-emerald-400 font-bold">{company.fiscalYear} ({company.currency})</span>
                </div>
              </div>

              {/* Specific Features / Compliance Badges */}
              <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                {company.config.verifactuEnabled && (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" /> <span>VeriFactu Activo</span>
                  </span>
                )}
                {company.config.ticketBaiEnabled && (
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" /> <span>TicketBAI (Batuz)</span>
                  </span>
                )}
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Serie: {company.config.documentSeriesPrefix}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  IVA Base: {company.config.defaultVatRate}%
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
              <span>ID: {company.id}</span>
              <span className="text-slate-500">Actualizado: {company.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{editingId ? 'Editar Empresa Corporativa' : 'Alta de Nueva Empresa Corporativa'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Código Empresa</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono p-2 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Ej: Grupo Hostelería Norte S.L."
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Razón Social</label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Ej: Grupo Hostelería Norte S.L."
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">CIF / NIF</label>
                  <input
                    type="text"
                    required
                    value={cif}
                    onChange={(e) => setCif(e.target.value)}
                    placeholder="Ej: B12345678"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">NIF IVA Operador</label>
                  <input
                    type="text"
                    value={vatId}
                    onChange={(e) => setVatId(e.target.value)}
                    placeholder="Ej: ESB12345678"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estado de Empresa</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="INACTIVA">INACTIVA</option>
                    <option value="SUSPENDIDA">SUSPENDIDA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Dirección Fiscal Completa</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, número, piso"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Provincia</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Madrid"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Teléfono Directo</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 910 000 000"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email Corporativo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@empresa.es"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Serie Documental Prefijo</label>
                  <input
                    type="text"
                    value={documentSeriesPrefix}
                    onChange={(e) => setDocumentSeriesPrefix(e.target.value)}
                    placeholder="F2026"
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 text-xs">Parámetros de Cumplimiento & Facturación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={verifactuEnabled}
                      onChange={(e) => setVerifactuEnabled(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Activar Sistema VeriFactu (AEAT España)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={ticketBaiEnabled}
                      onChange={(e) => setTicketBaiEnabled(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Activar TicketBAI (Haciendas Forales País Vasco)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg">
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
