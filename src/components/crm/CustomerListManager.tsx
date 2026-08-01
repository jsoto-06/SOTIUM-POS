import React, { useState } from 'react';
import { Customer, CustomerTier, CustomerType } from '../../types/crm';
import { Search, Filter, UserPlus, Building2, User, Award, Phone, Mail, MapPin, CheckCircle2, ShieldAlert, Sparkles, CreditCard } from 'lucide-react';

interface CustomerListManagerProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
}

export const CustomerListManager: React.FC<CustomerListManagerProps> = ({
  customers,
  onSelectCustomer,
  onOpenCreateModal,
  onOpenImportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | CustomerType>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | CustomerTier>('ALL');
  const [vipOnly, setVipOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.surnames && c.surnames.toLowerCase().includes(q)) ||
      c.cifNif.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q));

    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesTier = tierFilter === 'ALL' || c.loyalty.tier === tierFilter;
    const matchesVip = !vipOnly || c.isVip;

    return matchesSearch && matchesType && matchesTier && matchesVip;
  });

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'PLATINO':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'ORO':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PLATA':
        return 'bg-slate-300/20 text-slate-200 border-slate-400/40';
      default:
        return 'bg-amber-900/20 text-amber-500 border-amber-800/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Razón Social, NIF/CIF, Teléfono, Email o Código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:outline-none"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="PERSONA">Personas</option>
            <option value="EMPRESA">Empresas</option>
          </select>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:outline-none"
          >
            <option value="ALL">Todos los Niveles</option>
            <option value="BRONCE">Bronce</option>
            <option value="PLATA">Plata</option>
            <option value="ORO">Oro</option>
            <option value="PLATINO">Platino</option>
          </select>

          {/* VIP Toggle */}
          <button
            onClick={() => setVipOnly(!vipOnly)}
            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
              vipOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ★ Solo VIP
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'GRID' ? 'TABLE' : 'GRID')}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg font-bold"
          >
            {viewMode === 'GRID' ? 'Vista Tabla' : 'Vista Tarjetas'}
          </button>

          {/* Import Button */}
          <button
            onClick={onOpenImportModal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
          >
            Importar CSV
          </button>

          {/* Add Customer Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCustomer(c)}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 shadow-xl space-y-3 cursor-pointer transition-all hover:bg-slate-900 group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 group-hover:border-amber-500/40">
                    {c.type === 'EMPRESA' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{c.type === 'EMPRESA' ? (c.socialName || c.name) : `${c.name} ${c.surnames || ''}`}</span>
                      {c.isVip && <span className="text-amber-400 font-bold text-xs">★</span>}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      {c.code} | <span className="text-amber-300 font-bold">{c.cifNif}</span>
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getTierBadge(c.loyalty.tier)}`}>
                  {c.loyalty.tier}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{c.mainAddress.city}, {c.mainAddress.province}</span>
                </div>
              </div>

              {/* Loyalty summary bar */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Puntos</span>
                  <span className="text-xs font-bold text-emerald-400">{c.loyalty.points} pts</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Monedero</span>
                  <span className="text-xs font-bold text-amber-400">{c.loyalty.monederoBalance.toFixed(2)} €</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Consumo Total</span>
                  <span className="text-xs font-bold text-white">{c.loyalty.totalSpentLifetime.toFixed(2)} €</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {c.tags.map((t, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/90 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Nombre / Razón Social</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">CIF/NIF</th>
                <th className="p-3">Teléfono / Email</th>
                <th className="p-3 text-center">Nivel</th>
                <th className="p-3 text-right">Puntos</th>
                <th className="p-3 text-right">Monedero</th>
                <th className="p-3 text-right">Consumo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCustomer(c)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono text-amber-400 font-bold">{c.code}</td>
                  <td className="p-3 font-bold text-white">
                    {c.type === 'EMPRESA' ? (c.socialName || c.name) : `${c.name} ${c.surnames || ''}`}
                    {c.isVip && <span className="ml-1 text-amber-400 text-xs">★</span>}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                      {c.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{c.cifNif}</td>
                  <td className="p-3 text-slate-400">
                    <div>{c.phone}</div>
                    <div className="text-[10px] text-slate-500">{c.email}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getTierBadge(c.loyalty.tier)}`}>
                      {c.loyalty.tier}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">{c.loyalty.points} pts</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400">{c.loyalty.monederoBalance.toFixed(2)} €</td>
                  <td className="p-3 text-right font-mono font-bold text-white">{c.loyalty.totalSpentLifetime.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
