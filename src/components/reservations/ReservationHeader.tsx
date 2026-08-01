import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  List,
  Sparkles,
  Plus,
  Zap,
  Download,
  Upload,
  Search,
  Filter,
  Users,
  Grid,
} from 'lucide-react';

export type CalendarViewType = 'daily' | 'weekly' | 'monthly' | 'timeline' | 'agenda' | 'waiting' | 'ai_analytics';

interface ReservationHeaderProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  channelFilter: string;
  onChannelFilterChange: (channel: string) => void;
  onOpenNewReservation: () => void;
  onOpenQuickReservation: () => void;
  onExportCSV: () => void;
  onImportCSVClick: () => void;
  totalReservationsCount: number;
  totalPaxCount: number;
  waitingListCount: number;
}

export const ReservationHeader: React.FC<ReservationHeaderProps> = ({
  currentView,
  onViewChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  channelFilter,
  onChannelFilterChange,
  onOpenNewReservation,
  onOpenQuickReservation,
  onExportCSV,
  onImportCSVClick,
  totalReservationsCount,
  totalPaxCount,
  waitingListCount,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-2xl">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl">
            <CalendarIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-tight">Gestión de Reservas Enterprise</h2>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                FASE 14 – Omnicanal + IA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control total de mesas, listas de espera, predicción de No-Show con IA Gemini y notificaciones en tiempo real
            </p>
          </div>
        </div>

        {/* Quick Stats & Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Reservas:</span>
            <strong className="text-amber-400 font-bold">{totalReservationsCount}</strong>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Pax Total:</span>
            <strong className="text-cyan-400 font-bold">{totalPaxCount}</strong>
          </div>
          {waitingListCount > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 text-xs text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Espera: {waitingListCount}</span>
            </div>
          )}

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={onOpenQuickReservation}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Reserva Rápida</span>
          </button>

          <button
            onClick={onOpenNewReservation}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Reserva Completa</span>
          </button>
        </div>
      </div>

      {/* Navigation View Tabs & Date / Export controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onViewChange('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              currentView === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Diario</span>
          </button>

          <button
            onClick={() => onViewChange('weekly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              currentView === 'weekly'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Semanal</span>
          </button>

          <button
            onClick={() => onViewChange('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              currentView === 'monthly'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Mensual</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              currentView === 'timeline'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Timeline Mesas</span>
          </button>

          <button
            onClick={() => onViewChange('agenda')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              currentView === 'agenda'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Agenda Lista</span>
          </button>

          <button
            onClick={() => onViewChange('waiting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              currentView === 'waiting'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lista de Espera ({waitingListCount})</span>
          </button>

          <button
            onClick={() => onViewChange('ai_analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              currentView === 'ai_analytics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>IA Optimization</span>
          </button>
        </div>

        {/* Date Selector & Export / Import */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs font-medium text-white px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
          />

          <button
            onClick={onExportCSV}
            title="Exportar Reservas a CSV/Excel"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onImportCSVClick}
            title="Importar Reservas desde CSV"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono, código..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="CONFIRMADA">CONFIRMADA</option>
            <option value="RECORDADA">RECORDADA</option>
            <option value="CHECK_IN">CHECK-IN</option>
            <option value="SENTADOS">SENTADOS</option>
            <option value="EN_SERVICIO">EN SERVICIO</option>
            <option value="FINALIZADA">FINALIZADA</option>
            <option value="NO_SHOW">NO SHOW</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={channelFilter}
            onChange={(e) => onChannelFilterChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los canales de origen</option>
            <option value="TELEFONO">Teléfono Directo</option>
            <option value="WEB">Sitio Web Restaurante</option>
            <option value="ONLINE">Plataforma Online</option>
            <option value="QR">Código QR Carta</option>
            <option value="CRM">CRM Fidelización</option>
            <option value="TPV">TPV En Sala</option>
            <option value="WALK_IN">Walk-in Directo</option>
            <option value="RAPIDA">Reserva Rápida</option>
          </select>
        </div>
      </div>
    </div>
  );
};
