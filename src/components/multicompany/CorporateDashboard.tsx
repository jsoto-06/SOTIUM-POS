import React from 'react';
import { CorporateKPIs } from '../../types/multicompany';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Store,
  Boxes,
  Users,
  ShoppingBag,
  Calendar,
  Award,
  BarChart3,
  Percent,
} from 'lucide-react';

interface Props {
  kpis: CorporateKPIs;
}

export const CorporateDashboard: React.FC<Props> = ({ kpis }) => {
  return (
    <div className="space-y-6">
      {/* Top Main KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Global Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ventas Globales Grupo</span>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
                {kpis.globalSales.toLocaleString('es-ES')} €
              </h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+16.8% vs. Ejercicio Anterior</span>
          </div>
        </div>

        {/* Card 2: Net Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Beneficio Neto Consolidado</span>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                +{kpis.globalNetProfit.toLocaleString('es-ES')} €
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Margen EBITDA Global:</span>
            <span className="text-amber-400 font-bold font-mono">{kpis.globalProfitabilityMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 3: Stock Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valoración Stock Almacenes</span>
              <h3 className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">
                {kpis.globalStockValue.toLocaleString('es-ES')} €
              </h3>
            </div>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Centros Logísticos:</span>
            <span className="text-slate-200 font-mono">3 Almacenes Centrales</span>
          </div>
        </div>

        {/* Card 4: Structure Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estructura Corporativa</span>
              <h3 className="text-xl font-bold text-white mt-1">
                {kpis.totalCompanies} Empresas / {kpis.totalVenues} Sedes
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Plantilla Total:</span>
            <span className="text-amber-400 font-bold font-mono">{kpis.totalEmployees} Empleados</span>
          </div>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Clientes Activos</span>
            <span className="text-base font-bold text-white font-mono">{kpis.totalActiveClients.toLocaleString('es-ES')}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Pedidos Delivery Totales</span>
            <span className="text-base font-bold text-white font-mono">{kpis.totalDeliveryOrders.toLocaleString('es-ES')}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Reservas Confirmadas</span>
            <span className="text-base font-bold text-white font-mono">{kpis.totalReservations.toLocaleString('es-ES')}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Ratio Eficiencia Grupo</span>
            <span className="text-base font-bold text-emerald-400 font-mono">94.2 %</span>
          </div>
        </div>
      </div>

      {/* Companies Comparative Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Comparativa Consolidada por Empresa</h3>
          </div>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
            Ejercicio Fiscal 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Código / Razón Social</th>
                <th className="py-2.5 px-3 text-center">Sedes</th>
                <th className="py-2.5 px-3 text-right">Ventas (€)</th>
                <th className="py-2.5 px-3 text-right">Gastos (€)</th>
                <th className="py-2.5 px-3 text-right">Beneficio Neto (€)</th>
                <th className="py-2.5 px-3 text-center">Margen EBITDA</th>
                <th className="py-2.5 px-3 text-right">Stock (€)</th>
                <th className="py-2.5 px-3 text-center">Plantilla</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {kpis.companyRankings.map((company) => (
                <tr key={company.companyId} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {company.companyCode}
                      </span>
                      <span className="font-bold text-white">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">{company.venueCount}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {company.totalSales.toLocaleString('es-ES')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {company.totalExpenses.toLocaleString('es-ES')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    +{company.netProfit.toLocaleString('es-ES')} €
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold text-[10px]">
                      {company.ebitdaMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-cyan-400">
                    {company.stockValue.toLocaleString('es-ES')} €
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-300">{company.activeEmployees} emp.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Venues Comparative Ranking */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Rendimiento Operativo por Sede (Oficinas, Restaurantes, Dark Kitchen, Hoteles)</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Nombre de la Sede</th>
                <th className="py-2.5 px-3">Tipo de Sede</th>
                <th className="py-2.5 px-3 text-right">Ventas Acumuladas (€)</th>
                <th className="py-2.5 px-3 text-center">Ocupación Media</th>
                <th className="py-2.5 px-3 text-right">Ticket Medio (€)</th>
                <th className="py-2.5 px-3 text-center">Pedidos Delivery</th>
                <th className="py-2.5 px-3 text-center">Estado Sede</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {kpis.venueRankings.map((venue) => (
                <tr key={venue.venueId} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-white">{venue.venueName}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono text-amber-400">
                      {venue.venueType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {venue.totalSales.toLocaleString('es-ES')} €
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-300">
                    {venue.occupancyRate > 0 ? `${venue.occupancyRate.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-400">{venue.averageTicket.toFixed(2)} €</td>
                  <td className="py-3 px-3 text-center font-mono text-cyan-400">{venue.deliveryOrders}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {venue.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
