import React, { useState, useEffect, useCallback } from 'react';
import { usePOS } from '../../context/POSContext';
import { hrService } from '../../services/hrService';
import { HREmployeeManagement } from './HREmployeeManagement';
import { HRPermissionsEditor } from './HRPermissionsEditor';
import { HRTimeClockControl } from './HRTimeClockControl';
import { HRShiftPlanner } from './HRShiftPlanner';
import { HRVacationsAbsences } from './HRVacationsAbsences';
import { HRPayrollDocuments } from './HRPayrollDocuments';
import { HRAIAssistant } from './HRAIAssistant';
import { HRDashboardKPIsView } from './HRDashboardKPIsView';
import {
  Users,
  ShieldCheck,
  Clock,
  Calendar,
  Palmtree,
  BadgeEuro,
  Sparkles,
  BarChart3,
  RefreshCw,
  Database,
  Wifi,
} from 'lucide-react';

export const HRModule: React.FC = () => {
  const { refreshHRState } = usePOS();
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'EMPLOYEES' | 'PERMISSIONS' | 'TIME_CLOCK' | 'SHIFTS' | 'VACATIONS' | 'PAYROLL' | 'AI'
  >('DASHBOARD');

  const [hrData, setHrData] = useState(() => ({
    employees: hrService.getEmployees(),
    permissions: hrService.getAllPermissions(),
    shifts: hrService.getShifts(),
    timeLogs: hrService.getTimeLogs(),
    vacations: hrService.getVacations(),
    absences: hrService.getAbsences(),
    payrolls: hrService.getPayrolls(),
    aiPredictions: hrService.getAIPredictions(),
    kpis: hrService.getDashboardKPIs(),
    isLoading: false,
  }));

  const handleRefresh = useCallback(() => {
    if (refreshHRState) refreshHRState();
    setHrData({
      employees: hrService.getEmployees(),
      permissions: hrService.getAllPermissions(),
      shifts: hrService.getShifts(),
      timeLogs: hrService.getTimeLogs(),
      vacations: hrService.getVacations(),
      absences: hrService.getAbsences(),
      payrolls: hrService.getPayrolls(),
      aiPredictions: hrService.getAIPredictions(),
      kpis: hrService.getDashboardKPIs(),
      isLoading: false,
    });
  }, [refreshHRState]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  if (hrData.isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 space-x-2 font-mono">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
        <span>Cargando Módulo Enterprise de Recursos Humanos...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Module Title & Sync Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-3">
            <Users className="w-7 h-7 text-amber-500" />
            <span>Recursos Humanos, Empleados, Turnos & Control Horario Enterprise</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Módulo homologado RD-ley 8/2019 con matriz de &gt;300 permisos granulares, turnos dinámicos, pre-nóminas e Inteligencia Artificial Gemini.
          </p>
        </div>

        {/* Offline & Sync Status Indicator */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono font-bold">
            <Wifi className="w-3.5 h-3.5" />
            <span>Online Sync</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQLite Offline + Postgres</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'DASHBOARD'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'EMPLOYEES'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Empleados ({hrData.employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'PERMISSIONS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Permisos Granulares (&gt;300)</span>
        </button>

        <button
          onClick={() => setActiveTab('TIME_CLOCK')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'TIME_CLOCK'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Control Horario / TPV</span>
        </button>

        <button
          onClick={() => setActiveTab('SHIFTS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'SHIFTS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Planificador Turnos</span>
        </button>

        <button
          onClick={() => setActiveTab('VACATIONS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'VACATIONS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Palmtree className="w-4 h-4" />
          <span>Vacaciones & Ausencias</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYROLL')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'PAYROLL'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <BadgeEuro className="w-4 h-4" />
          <span>Nóminas & Docs</span>
        </button>

        <button
          onClick={() => setActiveTab('AI')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'AI'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>IA Gemini Advisor</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'DASHBOARD' && <HRDashboardKPIsView kpis={hrData.kpis} />}
      {activeTab === 'EMPLOYEES' && (
        <HREmployeeManagement employees={hrData.employees} onRefresh={handleRefresh} />
      )}
      {activeTab === 'PERMISSIONS' && (
        <HRPermissionsEditor
          permissions={hrData.permissions}
          employees={hrData.employees}
          onRefresh={handleRefresh}
        />
      )}
      {activeTab === 'TIME_CLOCK' && (
        <HRTimeClockControl
          timeLogs={hrData.timeLogs}
          employees={hrData.employees}
          onRefresh={handleRefresh}
        />
      )}
      {activeTab === 'SHIFTS' && (
        <HRShiftPlanner
          shifts={hrData.shifts}
          employees={hrData.employees}
          onRefresh={handleRefresh}
        />
      )}
      {activeTab === 'VACATIONS' && (
        <HRVacationsAbsences
          vacations={hrData.vacations}
          absences={hrData.absences}
          employees={hrData.employees}
          onRefresh={handleRefresh}
        />
      )}
      {activeTab === 'PAYROLL' && (
        <HRPayrollDocuments
          payrolls={hrData.payrolls}
          employees={hrData.employees}
          onRefresh={handleRefresh}
        />
      )}
      {activeTab === 'AI' && (
        <HRAIAssistant predictions={hrData.aiPredictions} onRefresh={handleRefresh} />
      )}
    </div>
  );
};
