import React, { useState, useEffect } from 'react';
import { MaintenanceService } from '../services/maintenanceService';
import { MaintenanceAIService } from '../services/maintenanceAIService';
import {
  Asset,
  PreventivePlan,
  Incident,
  WorkOrder,
  SATIntervention,
  MaintenanceSparePart,
  AssetWarranty,
  AIMaintenanceInsight,
} from '../types/maintenance';
import { AssetsManager } from './maintenance/AssetsManager';
import { PreventiveMaintenanceManager } from './maintenance/PreventiveMaintenanceManager';
import { CorrectiveMaintenanceManager } from './maintenance/CorrectiveMaintenanceManager';
import { WorkOrdersManager } from './maintenance/WorkOrdersManager';
import { SATManager } from './maintenance/SATManager';
import { SparePartsManager } from './maintenance/SparePartsManager';
import { WarrantiesManager } from './maintenance/WarrantiesManager';
import { MaintenanceCalendar } from './maintenance/MaintenanceCalendar';
import { AIMaintenanceAssistant } from './maintenance/AIMaintenanceAssistant';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  FileText,
  Shield,
  Package,
  ShieldAlert,
  Sparkles,
  Download,
  Building2,
} from 'lucide-react';

type SubTab =
  | 'ACTIVOS'
  | 'PREVENTIVO'
  | 'CORRECTIVO'
  | 'ORDENES'
  | 'SAT'
  | 'REPUESTOS'
  | 'GARANTIAS'
  | 'CALENDARIO'
  | 'IA';

export const MaintenanceModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('ACTIVOS');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [satInterventions, setSATInterventions] = useState<SATIntervention[]>([]);
  const [spareParts, setSpareParts] = useState<MaintenanceSparePart[]>([]);
  const [warranties, setWarranties] = useState<AssetWarranty[]>([]);
  const [aiInsights, setAIInsights] = useState<AIMaintenanceInsight[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const ast = MaintenanceService.getAssets();
    const pln = MaintenanceService.getPreventivePlans();
    const inc = MaintenanceService.getIncidents();
    const wo = MaintenanceService.getWorkOrders();
    const sat = MaintenanceService.getSATInterventions();
    const sp = MaintenanceService.getSpareParts();
    const war = MaintenanceService.getWarranties();

    setAssets(ast);
    setPlans(pln);
    setIncidents(inc);
    setWorkOrders(wo);
    setSATInterventions(sat);
    setSpareParts(sp);
    setWarranties(war);

    const insights = await MaintenanceAIService.analyzeAssetMaintenance(ast, inc, wo);
    setAIInsights(insights);
  };

  // State Handlers
  const handleAddAsset = (data: Omit<Asset, 'id'>) => {
    MaintenanceService.createAsset(data, 'Operador ERP');
    loadData();
  };

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    MaintenanceService.updateAsset(id, updates, 'Operador ERP');
    loadData();
  };

  const handleDeleteAsset = (id: string) => {
    MaintenanceService.deleteAsset(id, 'Operador ERP');
    loadData();
  };

  const handleCreatePlan = (data: Omit<PreventivePlan, 'id' | 'code'>) => {
    MaintenanceService.createPreventivePlan(data, 'Operador ERP');
    loadData();
  };

  const handleExecutePlan = (planId: string, executionDate: string, notes?: string) => {
    MaintenanceService.executePreventivePlan(planId, executionDate, notes, 'Operador ERP');
    loadData();
  };

  const handleCreateIncident = (data: Omit<Incident, 'id' | 'code' | 'openDate' | 'status'>) => {
    MaintenanceService.createIncident(data, 'Chef / Sala');
    loadData();
  };

  const handleCloseIncident = (id: string, notes?: string) => {
    MaintenanceService.closeIncident(id, notes, 'Técnico ERP');
    loadData();
  };

  const handleCreateWorkOrder = (data: Omit<WorkOrder, 'id' | 'code'>) => {
    MaintenanceService.createWorkOrder(data, 'Jefe Mantenimiento');
    loadData();
  };

  const handleUpdateWorkOrderStatus = (id: string, status: any) => {
    MaintenanceService.updateWorkOrderStatus(id, status, 'Técnico ERP');
    loadData();
  };

  const handleCreateSAT = (data: Omit<SATIntervention, 'id' | 'code'>) => {
    MaintenanceService.createSATIntervention(data, 'Gestor SAT');
    loadData();
  };

  const handleCreateSparePart = (data: Omit<MaintenanceSparePart, 'id'>) => {
    MaintenanceService.createSparePart(data, 'Gestor Almacén');
    loadData();
  };

  const handleConsumeSparePart = (id: string, quantity: number, reason: string) => {
    MaintenanceService.consumeSparePart(id, quantity, reason, 'Técnico ERP');
    loadData();
  };

  const handleCreateWarranty = (data: Omit<AssetWarranty, 'id'>) => {
    MaintenanceService.createWarranty(data, 'Gestor Compras');
    loadData();
  };

  // Download CSV
  const handleExportAssetsCSV = () => {
    const csv = MaintenanceService.exportAssetsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'activos_equipos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWorkOrdersCSV = () => {
    const csv = MaintenanceService.exportWorkOrdersCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ordenes_trabajo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Key metrics calculation
  const totalAssets = assets.length;
  const operationalAssets = assets.filter((a) => a.status === 'OPERATIVO').length;
  const openIncidents = incidents.filter((i) => i.status !== 'RESUELTA' && i.status !== 'CANCELADA').length;
  const activeWorkOrders = workOrders.filter((w) => w.status === 'EN_CURSO' || w.status === 'PENDIENTE').length;
  const totalMaintenanceCostYTD = workOrders.reduce((acc, w) => acc + w.totalCost, 0);

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Mantenimiento, Activos, SAT & Gestión Técnica Enterprise
              </h1>
              <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                FASE 21
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión Integral de Maquinaria, TPVs, Hornos, Frío Industrial, Preventivo, SAT e Inteligencia Gemini
            </p>
          </div>
        </div>

        {/* CSV Export Button Group */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportAssetsCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar Activos CSV</span>
          </button>
          <button
            onClick={handleExportWorkOrdersCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar OTs CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Activos</span>
          <div className="text-2xl font-black font-mono text-white mt-1">{totalAssets}</div>
          <span className="text-[10px] text-emerald-400">{operationalAssets} Operativos</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Averías Activas</span>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">{openIncidents}</div>
          <span className="text-[10px] text-slate-400">Atención inmediata</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Órdenes Trabajo</span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">{activeWorkOrders}</div>
          <span className="text-[10px] text-slate-400">En curso / Pendientes</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Coste Mantenimiento</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {totalMaintenanceCostYTD.toFixed(0)}€
          </div>
          <span className="text-[10px] text-slate-400">Materiales + M.O.</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Garantías Registradas</span>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-1">{warranties.length}</div>
          <span className="text-[10px] text-cyan-300">Cobertura oficial</span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('ACTIVOS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'ACTIVOS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Activos & Equipos ({assets.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PREVENTIVO')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'PREVENTIVO'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Mantenimiento Preventivo ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('CORRECTIVO')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'CORRECTIVO'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Incidencias & Averías ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ORDENES')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'ORDENES'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Órdenes de Trabajo OT ({workOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SAT')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'SAT'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Servicio Técnico SAT ({satInterventions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('REPUESTOS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'REPUESTOS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Repuestos ({spareParts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('GARANTIAS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'GARANTIAS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Garantías ({warranties.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('CALENDARIO')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'CALENDARIO'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendario</span>
        </button>

        <button
          onClick={() => setActiveSubTab('IA')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'IA'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Asistente IA Gemini</span>
        </button>
      </div>

      {/* Main Tab Content Render */}
      <div className="flex-1">
        {activeSubTab === 'ACTIVOS' && (
          <AssetsManager
            assets={assets}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}
        {activeSubTab === 'PREVENTIVO' && (
          <PreventiveMaintenanceManager
            plans={plans}
            assets={assets}
            onCreatePlan={handleCreatePlan}
            onExecutePlan={handleExecutePlan}
          />
        )}
        {activeSubTab === 'CORRECTIVO' && (
          <CorrectiveMaintenanceManager
            incidents={incidents}
            assets={assets}
            onCreateIncident={handleCreateIncident}
            onCloseIncident={handleCloseIncident}
          />
        )}
        {activeSubTab === 'ORDENES' && (
          <WorkOrdersManager
            workOrders={workOrders}
            assets={assets}
            spareParts={spareParts}
            onCreateWorkOrder={handleCreateWorkOrder}
            onUpdateStatus={handleUpdateWorkOrderStatus}
          />
        )}
        {activeSubTab === 'SAT' && (
          <SATManager
            satInterventions={satInterventions}
            assets={assets}
            onCreateSAT={handleCreateSAT}
          />
        )}
        {activeSubTab === 'REPUESTOS' && (
          <SparePartsManager
            spareParts={spareParts}
            onCreateSparePart={handleCreateSparePart}
            onConsumeSparePart={handleConsumeSparePart}
          />
        )}
        {activeSubTab === 'GARANTIAS' && (
          <WarrantiesManager
            warranties={warranties}
            assets={assets}
            onCreateWarranty={handleCreateWarranty}
          />
        )}
        {activeSubTab === 'CALENDARIO' && (
          <MaintenanceCalendar
            workOrders={workOrders}
            plans={plans}
            satInterventions={satInterventions}
          />
        )}
        {activeSubTab === 'IA' && (
          <AIMaintenanceAssistant assets={assets} insights={aiInsights} />
        )}
      </div>
    </div>
  );
};
