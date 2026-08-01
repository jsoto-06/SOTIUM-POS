import React from 'react';
import { FinancialKPIs } from '../../types/finance';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Building2,
  PieChart,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  kpis: FinancialKPIs;
}

export const FinanceDashboardKPIsView: React.FC<Props> = ({ kpis }) => {
  return (
    <div className="space-y-6">
      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ventas / Ingresos Mes</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{kpis.totalRevenueMonth.toLocaleString('es-ES')} €</p>
            <div className="flex items-center space-x-1 mt-1 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% vs mes anterior</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gastos Totales Mes</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{kpis.totalExpensesMonth.toLocaleString('es-ES')} €</p>
            <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>60.3% sobre ingresos</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 text-rose-400">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Beneficio Neto Estimado</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{kpis.netProfitMonth.toLocaleString('es-ES')} €</p>
            <div className="flex items-center space-x-1 mt-1 text-xs text-amber-400 font-medium">
              <span>Margen Neto: {((kpis.netProfitMonth / kpis.totalRevenueMonth) * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Liquidez Disponible (Caja+Bancos)</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{kpis.currentLiquidity.toLocaleString('es-ES')} €</p>
            <div className="flex items-center space-x-1 mt-1 text-xs text-cyan-400">
              <Wallet className="w-3.5 h-3.5" />
              <span>18.5 meses de runway</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 text-cyan-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Rentabilidad & EBITDA Hostelería</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>EBITDA Operativo Mensual</span>
                <span className="text-emerald-400 font-bold">{kpis.ebitdaMonth.toLocaleString('es-ES')} €</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>Margen Bruto Alimentación y Bebida</span>
                <span className="text-amber-400 font-bold">{kpis.grossMarginPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${kpis.grossMarginPercentage}%` }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Punto de Equilibrio Mensual:</span>
              <span className="text-white font-mono font-bold">{kpis.breakEvenSalesMonth.toLocaleString('es-ES')} €</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Pendientes & Vencimientos</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-[11px] text-slate-400">Cobros Pendientes (Clientes)</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{kpis.totalPendingCollect.toLocaleString('es-ES')} €</p>
              <p className="text-[10px] text-slate-500 mt-0.5">2 facturas emitidas</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-[11px] text-slate-400">Pagos Pendientes (Proveedores)</p>
              <p className="text-lg font-bold text-rose-400 mt-1">{kpis.totalPendingPay.toLocaleString('es-ES')} €</p>
              <p className="text-[10px] text-slate-500 mt-0.5">3 facturas compra</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-300">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Saldo Neto de Vencimientos:</span>
            </div>
            <span className="font-bold">{(kpis.totalPendingCollect - kpis.totalPendingPay).toLocaleString('es-ES')} €</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span>Flujo de Caja Operativo</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Entradas por TPV & Cobros:</span>
              <span className="text-emerald-400 font-mono font-bold">+78.500,00 €</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Salidas por Materia Prima:</span>
              <span className="text-rose-400 font-mono font-bold">-18.400,00 €</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Salidas Personal y Nominas:</span>
              <span className="text-rose-400 font-mono font-bold">-22.000,00 €</span>
            </div>
            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-white font-bold">Cash Flow Libre Generado:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">+{kpis.operatingCashFlow.toLocaleString('es-ES')} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
