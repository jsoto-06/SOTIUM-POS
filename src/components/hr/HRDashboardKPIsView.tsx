import React from 'react';
import { HRDashboardKPIs } from '../../types/hr';
import {
  Users,
  Clock,
  BadgeEuro,
  TrendingDown,
  TrendingUp,
  Percent,
  Palmtree,
  Zap,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

interface Props {
  kpis: HRDashboardKPIs;
}

export const HRDashboardKPIsView: React.FC<Props> = ({ kpis }) => {
  return (
    <div className="space-y-6">
      {/* Top 4 Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Coste Laboral Mensual</span>
            <BadgeEuro className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {kpis.totalLaborCost.toLocaleString('es-ES')} €
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span className="text-amber-400 font-bold">{kpis.laborCostPercentOfSales}%</span>
            <span>sobre ventas de hostelería</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Horas Trabajadas Totales</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{kpis.totalHoursWorked} h</p>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="text-amber-400 font-bold">+{kpis.overtimeHoursTotal}h extra</span>
            <span>|</span>
            <span className="text-cyan-400 font-bold">+{kpis.nightHoursTotal}h noct.</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Productividad Media</span>
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-400">
            {kpis.avgProductivityPerHour} €/h
          </p>
          <p className="text-xs text-slate-400">Ventas generadas por hora trabajada</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tasa de Absentismo</span>
            <Percent className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400">{kpis.absenteeismRatePercent}%</p>
          <p className="text-xs text-slate-400">Rotación de plantilla: {kpis.turnoverRatePercent}%</p>
        </div>
      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Plantilla Activa</span>
          </h4>
          <p className="text-3xl font-bold font-mono text-white">{kpis.activeEmployeesCount}</p>
          <p className="text-xs text-slate-400">Empleados de alta en Seguridad Social</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <Palmtree className="w-4 h-4 text-emerald-400" />
            <span>Vacaciones Disfrutadas</span>
          </h4>
          <p className="text-3xl font-bold font-mono text-emerald-400">{kpis.vacationsEnjoyedDays} días</p>
          <p className="text-xs text-slate-400">Acumulado año 2026</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Horas Extra Acumuladas</span>
          </h4>
          <p className="text-3xl font-bold font-mono text-purple-400">{kpis.overtimeHoursTotal} h</p>
          <p className="text-xs text-slate-400">Registradas en el control horario</p>
        </div>
      </div>
    </div>
  );
};
