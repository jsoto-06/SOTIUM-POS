import React, { useState } from 'react';
import { PaymentExpiration } from '../../types/purchases';
import { Calendar, AlertTriangle, CheckCircle2, Clock, DollarSign, Filter, Search } from 'lucide-react';

interface PaymentExpirationsManagerProps {
  expirations: PaymentExpiration[];
  onMarkAsPaid: (expirationId: string) => void;
}

export const PaymentExpirationsManager: React.FC<PaymentExpirationsManagerProps> = ({
  expirations,
  onMarkAsPaid,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');

  const filteredExpirations = expirations.filter((exp) => {
    const matchesSearch =
      exp.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || exp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = expirations
    .filter((e) => e.status === 'PENDIENTE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOverdue = expirations
    .filter((e) => e.status === 'VENCIDO')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPaid = expirations
    .filter((e) => e.status === 'PAGADO')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Pendiente de Pago</p>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{totalPending.toFixed(2)} €</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Vencidos (Alerta)</p>
            <p className="text-2xl font-bold font-mono text-red-400 mt-1">{totalOverdue.toFixed(2)} €</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Pagado en Período</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{totalPaid.toFixed(2)} €</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Factura o Proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'PENDIENTE', 'VENCIDO', 'PAGADO'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border ${
                filterStatus === st
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={() => setViewMode(viewMode === 'LIST' ? 'CALENDAR' : 'LIST')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg font-bold"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{viewMode === 'LIST' ? 'Modo Calendario' : 'Modo Lista'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'LIST' ? (
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/90 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Nº Factura</th>
                <th className="p-3.5">Proveedor</th>
                <th className="p-3.5">Fecha Vencimiento</th>
                <th className="p-3.5">Forma Pago</th>
                <th className="p-3.5 text-right">Importe</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredExpirations.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/50">
                  <td className="p-3.5 font-mono font-bold text-amber-400">{exp.invoiceNumber}</td>
                  <td className="p-3.5 font-bold text-white">{exp.supplierName}</td>
                  <td className="p-3.5 font-mono text-slate-300">{exp.dueDate}</td>
                  <td className="p-3.5 text-slate-400">{exp.paymentMethod}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-white">
                    {exp.amount.toFixed(2)} €
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        exp.status === 'PAGADO'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : exp.status === 'VENCIDO'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {exp.status !== 'PAGADO' && (
                      <button
                        onClick={() => onMarkAsPaid(exp.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[10px]"
                      >
                        Marcar Pagado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-slate-300 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Calendario de Vencimientos HORECA
          </h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>
          <div className="grid grid-cols-7 gap-2 h-64 text-xs font-mono">
            {Array.from({ length: 28 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasExp = filteredExpirations.find((e) => parseInt(e.dueDate.slice(-2)) === dayNum);
              return (
                <div
                  key={idx}
                  className={`p-2 rounded border flex flex-col justify-between ${
                    hasExp
                      ? hasExp.status === 'VENCIDO'
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span className="font-bold text-slate-400 text-[10px]">{dayNum} Feb</span>
                  {hasExp && (
                    <div className="truncate">
                      <span className="font-bold block text-[10px]">{hasExp.amount.toFixed(0)}€</span>
                      <span className="text-[9px] text-slate-300 truncate block">{hasExp.supplierName}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
