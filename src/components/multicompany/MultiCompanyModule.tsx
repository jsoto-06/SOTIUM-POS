import React, { useState, useEffect } from 'react';
import { Company, Venue, CorporateKPIs, CorporateAIDiagnosis, ActiveUserScope } from '../../types/multicompany';
import { multiCompanyService } from '../../services/multiCompanyService';
import { CorporateDashboard } from './CorporateDashboard';
import { CompanyManager } from './CompanyManager';
import { VenueManager } from './VenueManager';
import { CorporateAIEngine } from './CorporateAIEngine';
import {
  Building2,
  Store,
  LayoutDashboard,
  BrainCircuit,
  Globe,
  Layers,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export const MultiCompanyModule: React.FC = () => {
  const [subTab, setSubTab] = useState<'dashboard' | 'empresas' | 'sedes' | 'ia_engine'>('dashboard');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [kpis, setKpis] = useState<CorporateKPIs | null>(null);
  const [diagnosis, setDiagnosis] = useState<CorporateAIDiagnosis | null>(null);
  const [scope, setScope] = useState<ActiveUserScope | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCompanies(multiCompanyService.getCompanies());
    setVenues(multiCompanyService.getVenues());
    setKpis(multiCompanyService.getCorporateKPIs());
    setDiagnosis(multiCompanyService.getCorporateAIDiagnosis());
    setScope(multiCompanyService.getActiveScope());
  };

  const handleCreateCompany = (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    multiCompanyService.createCompany(data);
    loadData();
  };

  const handleUpdateCompany = (id: string, data: Partial<Company>) => {
    multiCompanyService.updateCompany(id, data);
    loadData();
  };

  const handleCreateVenue = (data: Omit<Venue, 'id' | 'createdAt'>) => {
    multiCompanyService.createVenue(data);
    loadData();
  };

  const handleUpdateVenue = (id: string, data: Partial<Venue>) => {
    multiCompanyService.updateVenue(id, data);
    loadData();
  };

  const handleScopeSwitch = (compCompanyId: string, compVenueId?: string) => {
    const updated = multiCompanyService.setActiveScope(compCompanyId, compVenueId);
    setScope(updated);
  };

  if (!kpis || !diagnosis || !scope) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <span className="font-mono text-sm">Cargando Central Corporativa Multiempresa...</span>
      </div>
    );
  }

  const activeCompObj = companies.find((c) => c.id === scope.activeCompanyId);
  const activeVenueObj = venues.find((v) => v.id === scope.activeVenueId);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Top Banner & Scope Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Enterprise Suite
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Multitenant Multi-Company Architecture
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-0.5">
              Central Corporativa & Multiempresa
            </h1>
          </div>
        </div>

        {/* Scope Selector Bar */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <Layers className="w-4 h-4 text-amber-400 ml-1" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400">Contexto Activo de Operación:</span>
            <div className="flex items-center space-x-2">
              <select
                value={scope.activeCompanyId}
                onChange={(e) => handleScopeSwitch(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold rounded p-1"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.tradeName}
                  </option>
                ))}
              </select>

              <select
                value={scope.activeVenueId || ''}
                onChange={(e) => handleScopeSwitch(scope.activeCompanyId, e.target.value)}
                className="bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold rounded p-1"
              >
                {venues
                  .filter((v) => v.companyId === scope.activeCompanyId)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {v.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('dashboard')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            subTab === 'dashboard'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Corporativo</span>
        </button>

        <button
          onClick={() => setSubTab('empresas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            subTab === 'empresas'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gestión de Empresas ({companies.length})</span>
        </button>

        <button
          onClick={() => setSubTab('sedes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            subTab === 'sedes'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Red de Sedes ({venues.length})</span>
        </button>

        <button
          onClick={() => setSubTab('ia_engine')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            subTab === 'ia_engine'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Motor IA Gemini Corporativo</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div>
        {subTab === 'dashboard' && <CorporateDashboard kpis={kpis} />}
        {subTab === 'empresas' && (
          <CompanyManager
            companies={companies}
            onCreateCompany={handleCreateCompany}
            onUpdateCompany={handleUpdateCompany}
          />
        )}
        {subTab === 'sedes' && (
          <VenueManager
            companies={companies}
            venues={venues}
            onCreateVenue={handleCreateVenue}
            onUpdateVenue={handleUpdateVenue}
          />
        )}
        {subTab === 'ia_engine' && <CorporateAIEngine diagnosis={diagnosis} />}
      </div>
    </div>
  );
};
