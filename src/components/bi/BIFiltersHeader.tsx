import React from 'react';
import { BIFilters, BIDateRange, Salon, Employee, Category } from '../../types/pos';
import { Calendar, Filter, RefreshCw, SlidersHorizontal, Users, Tag, Store } from 'lucide-react';

interface BIFiltersHeaderProps {
  filters: BIFilters;
  onFilterChange: (newFilters: BIFilters) => void;
  salons: Salon[];
  employees: Employee[];
  categories: Category[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export const BIFiltersHeader: React.FC<BIFiltersHeaderProps> = ({
  filters,
  onFilterChange,
  salons,
  employees,
  categories,
  onRefresh,
  isLoading = false,
}) => {
  const handleDateRangeSelect = (range: BIDateRange) => {
    onFilterChange({ ...filters, dateRange: range });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date Presets */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Calendar className="w-4 h-4 text-amber-400 mr-1 flex-shrink-0" />
          {[
            { id: 'TODAY', label: 'Hoy' },
            { id: 'YESTERDAY', label: 'Ayer' },
            { id: 'WEEK', label: 'Esta Semana' },
            { id: 'MONTH', label: 'Este Mes' },
            { id: 'QUARTER', label: 'Trimestre' },
            { id: 'YEAR', label: 'Año Actual' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleDateRangeSelect(preset.id as BIDateRange)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                filters.dateRange === preset.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Live Refresh Action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar BI'}</span>
          </button>
        </div>
      </div>

      {/* Selectors Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        {/* Salon Selector */}
        <div className="relative">
          <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={filters.salonId || ''}
            onChange={(e) => onFilterChange({ ...filters, salonId: e.target.value || undefined })}
            className="w-full bg-slate-950 text-slate-200 text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los Salones / Áreas</option>
            {salons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Waiter Selector */}
        <div className="relative">
          <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={filters.employeeId || ''}
            onChange={(e) => onFilterChange({ ...filters, employeeId: e.target.value || undefined })}
            className="w-full bg-slate-950 text-slate-200 text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los Empleados / Camareros</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.role})
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="relative">
          <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value || undefined })}
            className="w-full bg-slate-950 text-slate-200 text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todas las Familias de Producto</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Selector */}
        <div className="relative">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={filters.channelId || ''}
            onChange={(e) => onFilterChange({ ...filters, channelId: e.target.value || undefined })}
            className="w-full bg-slate-950 text-slate-200 text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos los Canales de Venta</option>
            <option value="MESA">Comedor / Salón</option>
            <option value="BARRA">Barra Central</option>
            <option value="TERRAZA">Terraza Exterior</option>
            <option value="TAKE_AWAY">Para Llevar (Take Away)</option>
            <option value="DELIVERY">Delivery (Glovo/Uber/Web)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
