import React, { useState } from 'react';
import { WorkOrder, PreventivePlan, SATIntervention } from '../../types/maintenance';
import { Calendar, Clock, User, Wrench, Shield, CheckCircle2 } from 'lucide-react';

interface MaintenanceCalendarProps {
  workOrders: WorkOrder[];
  plans: PreventivePlan[];
  satInterventions: SATIntervention[];
}

export const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  workOrders,
  plans,
  satInterventions,
}) => {
  const [viewMode, setViewMode] = useState<'SEMANAL' | 'MENSUAL'>('SEMANAL');

  // Sample schedule calendar cards
  const events = [
    ...workOrders.map((w) => ({
      id: w.id,
      title: `OT ${w.code}: ${w.assetName}`,
      date: w.scheduledDate,
      time: w.scheduledTime,
      type: 'WORK_ORDER',
      technician: w.technicianName || 'Sin asignar',
      status: w.status,
    })),
    ...plans.map((p) => ({
      id: p.id,
      title: `Preventivo ${p.code}: ${p.title}`,
      date: p.nextExecutionDate,
      time: '10:00',
      type: 'PREVENTIVE',
      technician: p.assignedTechnician || 'Técnico de Mantenimiento',
      status: 'PENDIENTE',
    })),
    ...satInterventions.map((s) => ({
      id: s.id,
      title: `SAT ${s.code}: Visita Oficial ${s.providerSAT}`,
      date: s.scheduledDate,
      time: '11:30',
      type: 'SAT',
      technician: s.technician,
      status: s.status,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Calendario Técnico y Carga de Trabajo</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Planificación unificada de Órdenes de Trabajo, visitas SAT y mantenimiento preventivo
          </p>
        </div>

        <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('SEMANAL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'SEMANAL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vista Semanal
          </button>
          <button
            onClick={() => setViewMode('MENSUAL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'MENSUAL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vista Mensual
          </button>
        </div>
      </div>

      {/* Technician Workload Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Técnico Antonio Valero</div>
            <div className="text-sm font-bold text-white">4 Tareas Asignadas (Carga: 85%)</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Rational SAT Oficial</div>
            <div className="text-sm font-bold text-white">2 Visitas Programadas</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Frío Industrial Ibérica</div>
            <div className="text-sm font-bold text-white">1 Revisión Trimestral</div>
          </div>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
          Agenda de Mantenimiento (Próximos 30 Días)
        </h3>

        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-amber-500/40 transition-all text-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-amber-300 font-mono font-bold">
                  <span>{ev.date}</span>
                  <span className="text-[10px] text-slate-400">{ev.time}h</span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{ev.title}</h4>
                  <p className="text-slate-400">Asignado a: {ev.technician}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`px-2.5 py-1 rounded font-bold uppercase ${
                    ev.type === 'WORK_ORDER'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : ev.type === 'PREVENTIVE'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {ev.type}
                </span>
                <span className="text-slate-300 font-medium">{ev.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
