import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  ItemKDSStatus,
  KDSPriority,
  KDSGroupMode,
  Order,
  OrderItem,
} from '../types/pos';
import { KDSTicketCard } from './kds/KDSTicketCard';
import { KDSStationManagerModal } from './kds/KDSStationManagerModal';
import { KDSSettingsModal } from './kds/KDSSettingsModal';
import { KDSAnalyticsModal } from './kds/KDSAnalyticsModal';
import { PrinterService } from '../services/printerService';
import { kdsAudio } from '../services/kdsAudioService';
import {
  ChefHat,
  Printer,
  Sliders,
  TrendingUp,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Layers,
  RefreshCw,
  Flame,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';

export const KitchenKDSModule: React.FC = () => {
  const {
    ordersHistory,
    updateKDSItemStatus,
    updateKDSItemPriority,
    kdsStations,
    activeKDSStationId,
    setActiveKDSStationId,
    kdsSoundEnabled,
    setKDSSoundEnabled,
  } = usePOS();

  // Modals visibility
  const [isStationModalOpen, setIsStationModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState<boolean>(false);

  // Filters & Controls State
  const [priorityFilter, setPriorityFilter] = useState<KDSPriority | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ItemKDSStatus | 'ALL'>('ALL');
  const [groupMode, setGroupMode] = useState<KDSGroupMode>('TABLE');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'TIME_ASC' | 'TIME_DESC' | 'PRIORITY'>('TIME_ASC');

  // Trigger sound when new pending order arrives
  const activeOrders = useMemo(() => {
    return ordersHistory.filter((o) => !o.isClosed && o.items.length > 0);
  }, [ordersHistory]);

  // Selected Station Object
  const selectedStation = useMemo(() => {
    if (activeKDSStationId === 'ALL') return null;
    return kdsStations.find((st) => st.id === activeKDSStationId) || null;
  }, [activeKDSStationId, kdsStations]);

  // Filtered Items and Orders
  const filteredOrders = useMemo(() => {
    return activeOrders
      .map((ord) => {
        // Filter items matching active station and filters
        const matchingItems = ord.items.filter((item) => {
          // Station Filter
          if (selectedStation) {
            const matchesCode =
              item.printerTarget === selectedStation.code ||
              (item.stationIds && item.stationIds.includes(selectedStation.id));
            if (!matchesCode && selectedStation.code !== 'COCINA_CALIENTE') return false;
          }

          // Status Filter
          if (statusFilter !== 'ALL' && item.kdsStatus !== statusFilter) {
            return false;
          }

          // Priority Filter
          if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) {
            return false;
          }

          // Search term
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesName = item.productName.toLowerCase().includes(term);
            const matchesTable = (ord.tableName || '').toLowerCase().includes(term);
            const matchesOrderNum = (ord.orderNumber || '').toLowerCase().includes(term);
            if (!matchesName && !matchesTable && !matchesOrderNum) return false;
          }

          return true;
        });

        return {
          order: ord,
          items: matchingItems,
        };
      })
      .filter((entry) => entry.items.length > 0)
      .sort((a, b) => {
        const timeA = new Date(a.order.createdAt).getTime();
        const timeB = new Date(b.order.createdAt).getTime();

        if (sortBy === 'TIME_DESC') return timeB - timeA;
        if (sortBy === 'PRIORITY') {
          const isUrgentA = a.items.some((i) => i.priority === 'URGENTE' || i.priority === 'VIP');
          const isUrgentB = b.items.some((i) => i.priority === 'URGENTE' || i.priority === 'VIP');
          if (isUrgentA && !isUrgentB) return -1;
          if (!isUrgentA && isUrgentB) return 1;
        }
        return timeA - timeB;
      });
  }, [activeOrders, selectedStation, statusFilter, priorityFilter, searchTerm, sortBy]);

  const handleReprintOrder = (ord: Order, items: OrderItem[]) => {
    const printItems = items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      price: i.unitPrice,
      total: i.unitPrice * i.quantity,
      notes: i.notes,
    }));

    const rawEscPos = PrinterService.formatReprintTicket(
      ord.orderNumber,
      ord.tableName || 'Barra',
      ord.serverName || 'Camarero',
      printItems,
      selectedStation?.name || 'General'
    );

    alert(`Reimprimiendo comanda en impresora ESC/POS [${selectedStation?.printerTarget || 'PRINTER_COCINA_1'}]:\n\n${rawEscPos.substring(0, 150)}...`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden">
      {/* KDS Header Controls */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-col space-y-3">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Brand & Multi-Station Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-amber-400 font-black text-lg">
              <ChefHat className="w-7 h-7" />
              <span>KDS Enterprise</span>
            </div>

            {/* Station Tabs */}
            <div className="flex space-x-1 pl-3 border-l border-slate-800 overflow-x-auto max-w-2xl py-0.5">
              <button
                onClick={() => setActiveKDSStationId('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeKDSStationId === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Pase Global
              </button>

              {kdsStations
                .filter((st) => st.active)
                .map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveKDSStationId(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                      activeKDSStationId === st.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: st.color }}
                    />
                    <span>{st.name}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center space-x-2 text-xs">
            {/* Realtime Socket.io Sync Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded-xl font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>WebSockets (ON)</span>
            </div>

            {/* Sound Alert Toggle */}
            <button
              onClick={() => {
                const newVal = !kdsSoundEnabled;
                setKDSSoundEnabled(newVal);
                if (newVal) kdsAudio.playNewOrderSound();
              }}
              className={`p-2 rounded-xl border transition-all ${
                kdsSoundEnabled
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title="Avisos Sonoros KDS"
            >
              {kdsSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Station Manager Modal Button */}
            <button
              onClick={() => setIsStationModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold transition-all"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Estaciones</span>
            </button>

            {/* Analytics Modal Button */}
            <button
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold transition-all"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Estadísticas</span>
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all"
              title="Configuración KDS"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar plato, mesa o #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-slate-200 focus:outline-none focus:border-amber-500 w-44"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 font-semibold">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ItemKDSStatus | 'ALL')}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="ACCEPTED">Aceptados</option>
                <option value="PREPARING">En Marcha</option>
                <option value="PLATING">Emplatando</option>
                <option value="READY">Listos</option>
                <option value="SERVED">Servidos</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 font-semibold">Prioridad:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as KDSPriority | 'ALL')}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="ALL">Todas las prioridades</option>
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente⚡</option>
                <option value="VIP">VIP 👑</option>
                <option value="DELIVERY">Delivery 🛵</option>
                <option value="TAKE_AWAY">Para Llevar 📦</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 font-semibold">Orden:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="TIME_ASC">Más Antiguos Primero</option>
                <option value="TIME_DESC">Más Recientes Primero</option>
                <option value="PRIORITY">Por Prioridad / Urgencia</option>
              </select>
            </div>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Mostrando <span className="text-amber-400 font-bold">{filteredOrders.length}</span> comandas activas
          </div>
        </div>
      </div>

      {/* Main KDS Canvas Display */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex space-x-4 h-full">
          {filteredOrders.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl">
                <ChefHat className="w-16 h-16 stroke-1 text-slate-700" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-bold text-slate-300">
                  Sin comandas pendientes en esta estación.
                </p>
                <p className="text-xs text-slate-500">
                  Los nuevos pedidos emitidos desde el TPV o Comanderos aparecerán automáticamente.
                </p>
              </div>
            </div>
          ) : (
            filteredOrders.map(({ order, items }) => (
              <KDSTicketCard
                key={order.id}
                order={order}
                items={items}
                stationName={selectedStation?.name || 'General'}
                onStatusChange={updateKDSItemStatus}
                onPriorityChange={updateKDSItemPriority}
                onReprintOrder={handleReprintOrder}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <KDSStationManagerModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
      />
      <KDSSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <KDSAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
      />
    </div>
  );
};
