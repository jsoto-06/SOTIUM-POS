import React, { useState } from 'react';
import { QualityHaccpService } from '../services/qualityHaccpService';
import { HACCPPlanManager } from './quality/HACCPPlanManager';
import { TemperatureLogsManager } from './quality/TemperatureLogsManager';
import { CleaningLogsManager } from './quality/CleaningLogsManager';
import { ChecklistsManager } from './quality/ChecklistsManager';
import { TraceabilityManager } from './quality/TraceabilityManager';
import { AllergensManager } from './quality/AllergensManager';
import { SanitaryAuditsManager } from './quality/SanitaryAuditsManager';
import { AIQualityAssistant } from './quality/AIQualityAssistant';

import {
  ShieldAlert,
  Thermometer,
  Sparkles,
  ClipboardCheck,
  PackageCheck,
  Utensils,
  FileCheck,
  Activity,
  AlertOctagon,
  Flame,
  Award
} from 'lucide-react';

type SubTab = 'haccp' | 'temperatures' | 'cleaning' | 'checklists' | 'traceability' | 'allergens' | 'audits' | 'ai';

export const QualityHaccpModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('temperatures');

  // Load KPI Stats
  const equipment = QualityHaccpService.getTemperatureEquipment();
  const alertEqCount = equipment.filter((e) => e.isAlerting).length;

  const fefoList = QualityHaccpService.getFEFORecommendations();
  const expiringLotsCount = fefoList.filter((l) => {
    const days = (new Date(l.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    return days <= 5;
  }).length;

  const audits = QualityHaccpService.getSanitaryAudits();
  const openNcCount = audits.flatMap((a) => a.nonConformities).filter((nc) => nc.status !== 'VERIFICADA').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Top Header Title & Enterprise Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 text-xs font-mono font-bold px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-wider">
              FASE 22 Enterprise
            </span>
            <span className="text-xs text-slate-400 font-mono">Reglamento CE 852/2004 & ISO 22000</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
            <span>Calidad, APPCC, HACCP y Seguridad Alimentaria</span>
          </h1>
        </div>
      </div>

      {/* KPI Summary Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveSubTab('temperatures')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            alertEqCount > 0
              ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Alertas Frío / Calor</span>
            <Thermometer className={`w-4 h-4 ${alertEqCount > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {alertEqCount > 0 ? (
              <span className="text-red-400">{alertEqCount} Alertas</span>
            ) : (
              <span className="text-emerald-400">0 Alertas</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Control continuo termométrico</p>
        </div>

        <div
          onClick={() => setActiveSubTab('traceability')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Caducidad FEFO Próxima</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {expiringLotsCount} Lotes
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Consumo prioritario cocina</p>
        </div>

        <div
          onClick={() => setActiveSubTab('audits')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">No Conformidades NC</span>
            <AlertOctagon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {openNcCount > 0 ? (
              <span className="text-amber-400">{openNcCount} Pendientes</span>
            ) : (
              <span className="text-emerald-400">0 Abiertas</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Auditorías sanitarias</p>
        </div>

        <div
          onClick={() => setActiveSubTab('ai')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Salud APPCC IA</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            98.5%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Auditoría Gemini Activa</p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('temperatures')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'temperatures'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>Temperaturas ({equipment.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('haccp')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'haccp'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Planes APPCC</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cleaning')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'cleaning'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Limpieza L+D</span>
        </button>

        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'checklists'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Checklists Sanitarios</span>
        </button>

        <button
          onClick={() => setActiveSubTab('traceability')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'traceability'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Trazabilidad & Lotes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('allergens')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'allergens'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>14 Alérgenos UE</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audits')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'audits'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Auditorías & RGSEAA</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'ai'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>IA Gemini APPCC</span>
        </button>
      </div>

      {/* Main Tab Content Render */}
      <div>
        {activeSubTab === 'haccp' && <HACCPPlanManager />}
        {activeSubTab === 'temperatures' && <TemperatureLogsManager />}
        {activeSubTab === 'cleaning' && <CleaningLogsManager />}
        {activeSubTab === 'checklists' && <ChecklistsManager />}
        {activeSubTab === 'traceability' && <TraceabilityManager />}
        {activeSubTab === 'allergens' && <AllergensManager />}
        {activeSubTab === 'audits' && <SanitaryAuditsManager />}
        {activeSubTab === 'ai' && <AIQualityAssistant />}
      </div>
    </div>
  );
};
