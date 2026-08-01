import React, { useState } from 'react';
import { Customer, MarketingCampaign, GiftCard } from '../types/crm';
import { INITIAL_CUSTOMERS, INITIAL_CAMPAIGNS, INITIAL_AI_PREDICTIONS } from '../data/crmData';
import { CRMService } from '../services/crmService';
import { CustomerListManager } from './crm/CustomerListManager';
import { CustomerDetailModal } from './crm/CustomerDetailModal';
import { LoyaltyProgramManager } from './crm/LoyaltyProgramManager';
import { MarketingCampaignsManager } from './crm/MarketingCampaignsManager';
import { CRMAIAnalyticsPanel } from './crm/CRMAIAnalyticsPanel';
import { RGPDConsentManager } from './crm/RGPDConsentManager';
import { CRMImportExportModal } from './crm/CRMImportExportModal';
import { Users, Award, Send, Sparkles, ShieldCheck, FileSpreadsheet, Plus, X, Building2 } from 'lucide-react';

export const CRMModule: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(INITIAL_CAMPAIGNS);
  const [activeTab, setActiveTab] = useState<'CLIENTES' | 'FIDELIZACION' | 'MARKETING' | 'IA_ANALYTICS' | 'RGPD'>('CLIENTES');
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // New Customer Form State
  const [newCustomerType, setNewCustomerType] = useState<'PERSONA' | 'EMPRESA'>('PERSONA');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerNif, setNewCustomerNif] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('Madrid');
  const [newCustomerIsVip, setNewCustomerIsVip] = useState(false);

  const analytics = CRMService.computeAnalytics(customers);
  const aiPredictions = CRMService.generateAIPredictions(customers);

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedCustomer?.id === updated.id) {
      setSelectedCustomer(updated);
    }
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerNif) {
      alert('Nombre y CIF/NIF son campos obligatorios');
      return;
    }

    const created: Customer = {
      id: `cli-${Date.now()}`,
      code: `CLI-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: newCustomerType,
      name: newCustomerName,
      cifNif: newCustomerNif,
      email: newCustomerEmail || 'cliente@ejemplo.com',
      phone: newCustomerPhone || '600000000',
      mainAddress: {
        id: `addr-${Date.now()}`,
        street: 'Calle Principal 1',
        city: newCustomerCity,
        province: newCustomerCity,
        postalCode: '28001',
        country: 'España',
        isMain: true,
      },
      active: true,
      isVip: newCustomerIsVip,
      isBlocked: false,
      tags: [newCustomerType === 'EMPRESA' ? 'EMPRESA' : 'NUEVO'],
      createdAt: new Date().toISOString().substring(0, 10),
      loyalty: {
        points: 50, // Welcome points
        cashbackBalance: 0,
        monederoBalance: 0,
        tier: 'BRONCE',
        totalSpentLifetime: 0,
        totalVisitsLifetime: 0,
      },
      rgpd: {
        acceptedMarketing: true,
        acceptedWhatsapp: true,
        acceptedAnalytics: true,
        acceptedThirdParties: false,
        consentDate: new Date().toISOString(),
      },
      history: [
        {
          id: `hist-create-${Date.now()}`,
          date: new Date().toISOString().substring(0, 16),
          type: 'VISITA',
          referenceNumber: 'BIENVENIDA',
          description: 'Registro inicial de ficha de cliente con 50 puntos de bienvenida.',
          performedBy: 'Recepción Central',
        },
      ],
    };

    setCustomers([created, ...customers]);
    setShowCreateModal(false);
    setNewCustomerName('');
    setNewCustomerNif('');
    setNewCustomerEmail('');
    setNewCustomerPhone('');
  };

  const handleIssueGiftCard = (card: GiftCard) => {
    // Add giftcard to first active customer or general pool
    if (customers.length > 0) {
      const target = customers[0];
      const updated: Customer = {
        ...target,
        giftCards: [...(target.giftCards || []), card],
      };
      handleUpdateCustomer(updated);
    }
  };

  const handleCreateCampaign = (camp: MarketingCampaign) => {
    setCampaigns([camp, ...campaigns]);
  };

  const handleImportCustomers = (imported: Customer[]) => {
    setCustomers([...imported, ...customers]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>CRM, Clientes & Fidelización Enterprise</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                FASE 12
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Gestión 360º de Clientes, Razón Social, Tarjetas Regalo, Monedero, Segmentación IA y Cumplimiento RGPD
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          {(
            [
              { id: 'CLIENTES', label: 'Clientes', icon: <Users className="w-4 h-4" />, badge: customers.length },
              { id: 'FIDELIZACION', label: 'Fidelización', icon: <Award className="w-4 h-4 text-emerald-400" /> },
              { id: 'MARKETING', label: 'Campañas', icon: <Send className="w-4 h-4 text-cyan-400" /> },
              { id: 'IA_ANALYTICS', label: 'Asistente IA', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
              { id: 'RGPD', label: 'RGPD', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
            ] as Array<{ id: typeof activeTab; label: string; icon: React.ReactNode; badge?: number }>
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-amber-300 border border-amber-500/30 font-mono">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'CLIENTES' && (
          <CustomerListManager
            customers={customers}
            onSelectCustomer={(c) => setSelectedCustomer(c)}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onOpenImportModal={() => setShowImportModal(true)}
          />
        )}

        {activeTab === 'FIDELIZACION' && (
          <LoyaltyProgramManager customers={customers} onIssueGiftCard={handleIssueGiftCard} />
        )}

        {activeTab === 'MARKETING' && (
          <MarketingCampaignsManager
            customers={customers}
            campaigns={campaigns}
            onCreateCampaign={handleCreateCampaign}
          />
        )}

        {activeTab === 'IA_ANALYTICS' && (
          <CRMAIAnalyticsPanel
            analytics={analytics}
            aiPredictions={aiPredictions}
            onApplyRecommendation={(pred) => {
              alert(`Ejecutando campaña recomendada: "${pred.recommendedCampaign}" para ${pred.customerName}`);
            }}
          />
        )}

        {activeTab === 'RGPD' && (
          <RGPDConsentManager customers={customers} onUpdateCustomer={handleUpdateCustomer} />
        )}
      </div>

      {/* Customer 360 Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdateCustomer={handleUpdateCustomer}
        />
      )}

      {/* Create New Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomerSubmit} className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" /> Alta de Nuevo Cliente CRM
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setNewCustomerType('PERSONA')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  newCustomerType === 'PERSONA' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Persona Física
              </button>
              <button
                type="button"
                onClick={() => setNewCustomerType('EMPRESA')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  newCustomerType === 'EMPRESA' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Empresa / Razón Social
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  {newCustomerType === 'EMPRESA' ? 'Razón Social / Nombre Comercial *' : 'Nombre Completo *'}
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">CIF / NIF Fiscal *</label>
                <input
                  type="text"
                  value={newCustomerNif}
                  onChange={(e) => setNewCustomerNif(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Teléfono Móvil</label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="vipNewCheck"
                  checked={newCustomerIsVip}
                  onChange={(e) => setNewCustomerIsVip(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500"
                />
                <label htmlFor="vipNewCheck" className="text-xs font-bold text-amber-400">
                  Marcar como Cliente VIP
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Crear Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import / Export Modal */}
      {showImportModal && (
        <CRMImportExportModal
          customers={customers}
          onClose={() => setShowImportModal(false)}
          onImportCustomers={handleImportCustomers}
        />
      )}
    </div>
  );
};
