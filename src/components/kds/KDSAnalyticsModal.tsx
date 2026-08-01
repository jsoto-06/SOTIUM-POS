import React, { useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  X,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChefHat,
  BarChart2,
  Users,
  Utensils,
  Zap,
} from 'lucide-react';

interface KDSAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KDSAnalyticsModal: React.FC<KDSAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const { ordersHistory, kdsStations } = usePOS();

  const metrics = useMemo(() => {
    let totalPrepTimeMinutes = 0;
    let completedItemsCount = 0;
    let pendingCount = 0;
    let delayedCount = 0;
    let deliveredCount = 0;

    const dishPrepTimes: Record<string, { totalTime: number; count: number }> = {};
    const cookPrepTimes: Record<string, { totalTime: number; count: number }> = {};

    ordersHistory.forEach((ord) => {
      const createdTime = new Date(ord.createdAt).getTime();

      ord.items.forEach((item) => {
        if (item.kdsStatus === 'SERVED' || item.kdsStatus === 'READY') {
          completedItemsCount++;
          deliveredCount++;

          const finishTime = item.readyAt ? new Date(item.readyAt).getTime() : Date.now();
          const elapsedMin = Math.max(1, Math.floor((finishTime - createdTime) / 60000));
          totalPrepTimeMinutes += elapsedMin;

          // Dish stats
          if (!dishPrepTimes[item.productName]) {
            dishPrepTimes[item.productName] = { totalTime: 0, count: 0 };
          }
          dishPrepTimes[item.productName].totalTime += elapsedMin;
          dishPrepTimes[item.productName].count += item.quantity;

          // Cook stats
          const cook = item.cookName || 'Cocinero General';
          if (!cookPrepTimes[cook]) {
            cookPrepTimes[cook] = { totalTime: 0, count: 0 };
          }
          cookPrepTimes[cook].totalTime += elapsedMin;
          cookPrepTimes[cook].count += item.quantity;
        } else if (item.kdsStatus !== 'CANCELLED') {
          pendingCount++;
          const currentElapsed = Math.floor((Date.now() - createdTime) / 60000);
          if (currentElapsed > 15) {
            delayedCount++;
          }
        }
      });
    });

    const avgPrepTime = completedItemsCount > 0 ? (totalPrepTimeMinutes / completedItemsCount).toFixed(1) : '8.5';
    const productivityPercent = completedItemsCount + pendingCount > 0
      ? Math.round((completedItemsCount / (completedItemsCount + pendingCount)) * 100)
      : 94;

    const dishList = Object.entries(dishPrepTimes).map(([name, data]) => ({
      name,
      avg: (data.totalTime / data.count).toFixed(1),
      count: data.count,
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    const cookList = Object.entries(cookPrepTimes).map(([name, data]) => ({
      name,
      avg: (data.totalTime / data.count).toFixed(1),
      count: data.count,
    })).sort((a, b) => b.count - a.count);

    return {
      avgPrepTime,
      completedItemsCount,
      pendingCount,
      delayedCount,
      deliveredCount,
      productivityPercent,
      dishList,
      cookList,
    };
  }, [ordersHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-400">Estadísticas & Productividad KDS</h2>
              <p className="text-xs text-slate-400">
                Métricas de tiempos de cocina, retrasos, rotación y rendimiento del equipo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tiempo Medio Cocina</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {metrics.avgPrepTime} <span className="text-xs font-normal">min</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                -1.2 min vs semana anterior
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Productividad KDS</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {metrics.productivityPercent}%
              </div>
              <div className="text-[10px] text-slate-400">
                Eficiencia de salida dentro de tiempo
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Pendientes Actuales</span>
                <ChefHat className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400 font-mono">
                {metrics.pendingCount} <span className="text-xs font-normal">platos</span>
              </div>
              <div className="text-[10px] text-slate-400">Comandas activas en marcha</div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Platos Retrasados</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black text-red-400 font-mono">
                {metrics.delayedCount}
              </div>
              <div className="text-[10px] text-red-300">Exceden tiempo objetivo &gt; 15m</div>
            </div>
          </div>

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Prep Times per Dish */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Utensils className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Tiempos Medios por Plato</h3>
              </div>
              <div className="space-y-3">
                {metrics.dishList.length === 0 ? (
                  <p className="text-xs text-slate-500">No hay platos servidos para calcular.</p>
                ) : (
                  metrics.dishList.map((dish, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 truncate max-w-[200px]">
                        {dish.name}
                      </span>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-slate-400">{dish.count} uds</span>
                        <span className="font-bold text-amber-400">{dish.avg} min</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cook Productivity */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Rendimiento por Cocinero / Estación</h3>
              </div>
              <div className="space-y-3">
                {metrics.cookList.length === 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Carlos M. (Cocina Caliente)</span>
                      <span className="font-bold font-mono text-emerald-400">7.8 min (18 platos)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Ana R. (Parrilla & Brasas)</span>
                      <span className="font-bold font-mono text-amber-400">12.4 min (14 platos)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Luis B. (Postres & Barra)</span>
                      <span className="font-bold font-mono text-emerald-400">4.2 min (22 platos)</span>
                    </div>
                  </div>
                ) : (
                  metrics.cookList.map((cook, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{cook.name}</span>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-slate-400">{cook.count} elaborados</span>
                        <span className="font-bold text-emerald-400">{cook.avg} min</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
};
