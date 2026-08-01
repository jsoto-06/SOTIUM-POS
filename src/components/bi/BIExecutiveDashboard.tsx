import React, { useState } from 'react';
import { BIExecutiveMetrics, BIDashboardWidgetConfig } from '../../types/pos';
import { formatCurrency } from '../../utils/currency';
import {
  TrendingUp,
  DollarSign,
  Users,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  Truck,
  Settings,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface BIExecutiveDashboardProps {
  metrics: BIExecutiveMetrics;
}

const DEFAULT_WIDGETS: BIDashboardWidgetConfig[] = [
  { id: 'w-sales', title: 'Ventas Totales', type: 'KPI', visible: true, order: 1, colSpan: 3 },
  { id: 'w-profit', title: 'Beneficio Neto', type: 'KPI', visible: true, order: 2, colSpan: 3 },
  { id: 'w-ticket', title: 'Ticket Medio', type: 'KPI', visible: true, order: 3, colSpan: 3 },
  { id: 'w-vat', title: 'IVA Repercutido', type: 'KPI', visible: true, order: 4, colSpan: 3 },
  { id: 'w-occupancy', title: 'Ocupación de Salones', type: 'KPI', visible: true, order: 5, colSpan: 3 },
  { id: 'w-serviceTime', title: 'Tiempo Servicio', type: 'KPI', visible: true, order: 6, colSpan: 3 },
  { id: 'w-kitchenTime', title: 'Tiempo Cocina', type: 'KPI', visible: true, order: 7, colSpan: 3 },
  { id: 'w-delivery', title: 'Pedidos Delivery', type: 'KPI', visible: true, order: 8, colSpan: 3 },
];

export const BIExecutiveDashboard: React.FC<BIExecutiveDashboardProps> = ({ metrics }) => {
  const [widgets, setWidgets] = useState<BIDashboardWidgetConfig[]>(DEFAULT_WIDGETS);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const toggleWidget = (id: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)));
  };

  return (
    <div className="space-y-4">
      {/* Config Bar Toggle */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3 px-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white">Cuadro de Mando Ejecutivo Configurable</span>
          <span className="text-xs text-slate-400">({widgets.filter((w) => w.visible).length} widgets activos)</span>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
        >
          <Settings className="w-4 h-4 text-amber-400" />
          <span>Personalizar Widgets</span>
        </button>
      </div>

      {/* Configuration Drawer */}
      {showConfig && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {widgets.map((w) => (
            <label
              key={w.id}
              className={`flex items-center space-x-2 p-2 rounded-xl border cursor-pointer text-xs font-semibold ${
                w.visible ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <input type="checkbox" checked={w.visible} onChange={() => toggleWidget(w.id)} className="rounded accent-amber-500" />
              <span className="truncate">{w.title}</span>
            </label>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.find((w) => w.id === 'w-sales')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">Ventas Acumuladas</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{formatCurrency(metrics.totalSales)}</div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{metrics.salesGrowthPercent.toFixed(1)}% vs período anterior</span>
              </span>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        )}

        {widgets.find((w) => w.id === 'w-profit')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">Beneficio Neto Estimado</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatCurrency(metrics.totalProfit)}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Margen: {metrics.profitMarginPercent.toFixed(1)}% sobre base</span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        )}

        {widgets.find((w) => w.id === 'w-ticket')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">Ticket Medio</span>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{formatCurrency(metrics.averageTicket)}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">{metrics.totalTickets} comanda(s) cerradas</span>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        )}

        {widgets.find((w) => w.id === 'w-vat')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">IVA Repercutido</span>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1">{formatCurrency(metrics.totalVat)}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Facturas / VeriFactu Chained OK</span>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
        )}

        {widgets.find((w) => w.id === 'w-occupancy')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">Ocupación Salones</span>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-1">{metrics.salonOccupancyPercent}%</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Rotación promedio: 1.8x/mesa</span>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        )}

        {widgets.find((w) => w.id === 'w-serviceTime')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">Tiempo Servicio Sala</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{metrics.avgServiceTimeMinutes} min</div>
              <span className="text-[10px] text-emerald-400 mt-1 block">-1.5 min vs semana pasada</span>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        )}

        {widgets.find((w) => w.id === 'w-kitchenTime')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">Tiempo Preparación Cocina</span>
              <div className="text-2xl font-black text-teal-400 font-mono mt-1">{metrics.avgKitchenTimeMinutes} min</div>
              <span className="text-[10px] text-slate-400 mt-1 block">KDS Objetivo &lt; 10 min</span>
            </div>
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        )}

        {widgets.find((w) => w.id === 'w-delivery')?.visible && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-medium">Pedidos Delivery / Take Away</span>
              <div className="text-2xl font-black text-orange-400 font-mono mt-1">{metrics.totalDelivery + metrics.totalTakeAway}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Glovo, Uber Eats, Directo</span>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Alerts & Operational Health Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Alertas Operativas & Salud del Negocio en Tiempo Real</span>
          </div>
          <span className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-full font-mono font-bold">
            {metrics.alerts.length} Alerta(s)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {metrics.alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                alt.type === 'CRITICAL'
                  ? 'bg-red-500/10 border-red-500/30 text-red-200'
                  : alt.type === 'WARNING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
              }`}
            >
              {alt.type === 'CRITICAL' ? (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : alt.type === 'WARNING' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">{alt.title}</h4>
                <p className="text-[11px] opacity-80 leading-snug">{alt.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
