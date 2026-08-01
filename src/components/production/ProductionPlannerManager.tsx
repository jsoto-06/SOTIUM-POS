import React, { useState } from 'react';
import { ProductionPlan, ProductionOrder } from '../../types/production';
import { Calendar, Clock, BarChart2, Plus, CheckCircle2, Factory, ShieldCheck } from 'lucide-react';

interface ProductionPlannerManagerProps {
  plans: ProductionPlan[];
  orders: ProductionOrder[];
}

export const ProductionPlannerManager: React.FC<ProductionPlannerManagerProps> = ({ plans, orders }) => {
  const [period, setPeriod] = useState<'DIARIA' | 'SEMANAL' | 'MENSUAL'>('SEMANAL');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-4 rounded-xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Planificación & Carga de Trabajo de Producción</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calendario de producción diaria, semanal y mensual, control de capacidad instalada y turnos
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(['DIARIA', 'SEMANAL', 'MENSUAL'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                period === p
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((pl) => (
          <div key={pl.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-xl">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">{pl.periodType}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{pl.title}</h3>
                <span className="text-xs text-slate-400 font-mono mt-1 block">{pl.startDate} — {pl.endDate}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Capacidad Utilizada</span>
                <span className="font-mono text-amber-400 font-bold">{pl.capacityPercentage}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    pl.capacityPercentage > 85 ? 'bg-rose-500' : pl.capacityPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pl.capacityPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Órdenes Asignadas ({pl.orderIds.length})</span>
              {orders
                .filter((o) => pl.orderIds.includes(o.id))
                .map((o) => (
                  <div key={o.id} className="flex justify-between items-center text-slate-300">
                    <span className="font-bold">{o.recipeName}</span>
                    <span className="font-mono text-amber-400">{o.targetQuantity} {o.unit}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
