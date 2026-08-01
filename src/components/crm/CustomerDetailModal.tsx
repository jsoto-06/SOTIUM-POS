import React, { useState } from 'react';
import { Customer, CustomerType, CustomerTier } from '../../types/crm';
import { CRMService } from '../../services/crmService';
import {
  X,
  User,
  Building2,
  Award,
  Wallet,
  Gift,
  History,
  Shield,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Plus,
  Download,
  AlertTriangle,
  Send,
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdateCustomer: (updated: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onUpdateCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<'PERFIL' | 'EMPRESA' | 'HISTORIAL' | 'FIDELIZACION' | 'RGPD'>('PERFIL');
  const [monederoAmount, setMonederoAmount] = useState<number>(20);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(100);

  // Profile Edit Form State
  const [profile, setProfile] = useState({
    name: customer.name,
    surnames: customer.surnames || '',
    socialName: customer.socialName || '',
    tradeName: customer.tradeName || '',
    cifNif: customer.cifNif,
    email: customer.email,
    phone: customer.phone,
    whatsapp: customer.whatsapp || '',
    notes: customer.notes || '',
    isVip: customer.isVip,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Customer = {
      ...customer,
      name: profile.name,
      surnames: profile.surnames,
      socialName: profile.socialName,
      tradeName: profile.tradeName,
      cifNif: profile.cifNif,
      email: profile.email,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      notes: profile.notes,
      isVip: profile.isVip,
    };
    onUpdateCustomer(updated);
  };

  const handleTopUpMonedero = () => {
    if (monederoAmount <= 0) return;
    const updated = CRMService.topUpMonedero(customer, monederoAmount, 'Tarjeta de Crédito / TPV');
    onUpdateCustomer(updated);
    setMonederoAmount(20);
  };

  const handleRedeemPoints = () => {
    try {
      const { updatedCustomer } = CRMService.redeemPoints(customer, pointsToRedeem);
      onUpdateCustomer(updatedCustomer);
    } catch (err: any) {
      alert(err.message || 'Error al canjear puntos');
    }
  };

  const handleAnonymize = () => {
    if (confirm('¿Está seguro de que desea ejercer el Derecho al Olvido (RGPD)? Esta acción anonimizará de forma irreversible los datos personales del cliente.')) {
      const anonymized = CRMService.anonymizeCustomer(customer);
      onUpdateCustomer(anonymized);
    }
  };

  const handleExportRGPD = () => {
    const dataPackage = CRMService.exportRGPDDataPackage(customer);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataPackage, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rgpd_export_${customer.code}_${customer.cifNif}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              {customer.type === 'EMPRESA' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{customer.type === 'EMPRESA' ? (customer.socialName || customer.name) : `${customer.name} ${customer.surnames || ''}`}</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  {customer.code}
                </span>
                {customer.isVip && <span className="text-amber-400 text-sm font-bold">★ VIP</span>}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                NIF/CIF: <strong className="text-white">{customer.cifNif}</strong> | Nivel:{' '}
                <strong className="text-amber-400">{customer.loyalty.tier}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs Nav */}
        <div className="flex space-x-1 bg-slate-950 px-5 pt-2 border-b border-slate-800 overflow-x-auto">
          {(
            [
              { id: 'PERFIL', label: 'Ficha & Perfil', icon: <User className="w-4 h-4" /> },
              { id: 'EMPRESA', label: 'Datos Corporativos', icon: <Building2 className="w-4 h-4" /> },
              { id: 'HISTORIAL', label: 'Historial 360º', icon: <History className="w-4 h-4" /> },
              { id: 'FIDELIZACION', label: 'Puntos & Monedero', icon: <Wallet className="w-4 h-4" /> },
              { id: 'RGPD', label: 'RGPD & Privacidad', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === t.id
                  ? 'border-amber-500 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'PERFIL' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre / Razón Social *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Apellidos (Persona)</label>
                  <input
                    type="text"
                    value={profile.surnames}
                    onChange={(e) => setProfile({ ...profile, surnames: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">CIF / NIF Fiscal *</label>
                  <input
                    type="text"
                    value={profile.cifNif}
                    onChange={(e) => setProfile({ ...profile, cifNif: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Teléfono Principal</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">WhatsApp de Contacto</label>
                  <input
                    type="text"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notas Internas & Gustos del Cliente</label>
                <textarea
                  rows={3}
                  value={profile.notes}
                  onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isVipCheck"
                  checked={profile.isVip}
                  onChange={(e) => setProfile({ ...profile, isVip: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isVipCheck" className="text-xs font-bold text-amber-400">
                  Marcar como Cliente VIP Preferente
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Guardar Cambios de Ficha
                </button>
              </div>
            </form>
          )}

          {activeTab === 'EMPRESA' && (
            <div className="space-y-6">
              {customer.type !== 'EMPRESA' ? (
                <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
                  Este cliente está registrado como Persona Física. Para habilitar facturación agrupada y condiciones de crédito corporativas, cambie el tipo a Empresa.
                </div>
              ) : (
                <>
                  {/* Conditions Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Condiciones Comerciales de Facturación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Descuento Comercial</span>
                        <strong className="text-emerald-400">{customer.commercialConditions?.discountPercent || 0}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Plazo de Pago</span>
                        <strong className="text-amber-400">{customer.commercialConditions?.paymentTermDays || 30} días</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Límite Crédito</span>
                        <strong className="text-white">{customer.commercialConditions?.creditLimit || 0} €</strong>
                      </div>
                    </div>
                  </div>

                  {/* Delegations */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-300">Delegaciones & Sedes</h3>
                    {customer.delegations && customer.delegations.length > 0 ? (
                      customer.delegations.map((d) => (
                        <div key={d.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex justify-between">
                          <div>
                            <strong className="text-white block">{d.name}</strong>
                            <span className="text-slate-400">{d.address.street}, {d.address.city}</span>
                          </div>
                          <div className="text-right text-slate-400">
                            <div>Contacto: {d.contactPerson}</div>
                            <div>Tel: {d.phone}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No hay delegaciones adicionales registradas.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'HISTORIAL' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Histórico Unificado 360º de Consumo</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {customer.history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center p-6">No hay registros de actividad previos.</p>
                ) : (
                  customer.history.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {h.type}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">{h.date}</span>
                          <span className="font-mono font-bold text-white">{h.referenceNumber}</span>
                        </div>
                        <p className="text-slate-300 font-medium">{h.description}</p>
                      </div>

                      <div className="text-right">
                        {h.amount !== undefined && (
                          <div className="font-mono font-bold text-emerald-400 text-sm">{h.amount.toFixed(2)} €</div>
                        )}
                        {h.pointsEarnedOrSpent !== undefined && (
                          <div className="text-[10px] font-mono text-amber-400">
                            {h.pointsEarnedOrSpent > 0 ? `+${h.pointsEarnedOrSpent}` : h.pointsEarnedOrSpent} pts
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'FIDELIZACION' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Saldo de Puntos</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{customer.loyalty.points} pts</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Monedero Prepago</span>
                  <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{customer.loyalty.monederoBalance.toFixed(2)} €</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cashback Acumulado</span>
                  <p className="text-2xl font-bold font-mono text-cyan-300 mt-1">{customer.loyalty.cashbackBalance.toFixed(2)} €</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monedero TopUp */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-amber-400" /> Recargar Monedero
                  </h4>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={monederoAmount}
                      onChange={(e) => setMonederoAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                    <button
                      onClick={handleTopUpMonedero}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap"
                    >
                      Recargar €
                    </button>
                  </div>
                </div>

                {/* Redeem Points */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" /> Canjear Puntos por Descuento
                  </h4>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                    <button
                      onClick={handleRedeemPoints}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap"
                    >
                      Canjear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'RGPD' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Cumplimiento de Privacidad RGPD (Reglamento UE 2016/679)
                </h4>
                <p className="text-slate-300">
                  Consentimientos informados registrados el{' '}
                  <strong className="text-white font-mono">{customer.rgpd.consentDate}</strong>
                </p>
              </div>

              {/* RGPD Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleExportRGPD}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Exportar Paquete Completo de Datos (Art. 20 RGPD)</span>
                </button>

                <button
                  onClick={handleAnonymize}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Ejercer Derecho al Olvido / Anonimizar (Art. 17 RGPD)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
