import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { ItemKDSStatus, KDSPriority, Order, OrderItem } from '../../types/pos';
import {
  Clock,
  AlertTriangle,
  Printer,
  User,
  CheckCircle,
  Flame,
  ArrowRight,
  Sparkles,
  Ban,
  Tag,
} from 'lucide-react';

interface KDSTicketCardProps {
  order: Order;
  items: OrderItem[];
  stationName?: string;
  onStatusChange: (orderId: string, itemId: string, status: ItemKDSStatus) => void;
  onPriorityChange: (orderId: string, itemId: string, priority: KDSPriority) => void;
  onReprintOrder: (order: Order, items: OrderItem[]) => void;
}

export const KDSTicketCard: React.FC<KDSTicketCardProps> = ({
  order,
  items,
  stationName = 'General',
  onStatusChange,
  onPriorityChange,
  onReprintOrder,
}) => {
  const { kdsStateColors } = usePOS();
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const createdTime = new Date(order.createdAt).getTime();
      const now = Date.now();
      setElapsedMinutes(Math.floor((now - createdTime) / 60000));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const maxTargetMinutes = Math.max(...items.map((i) => i.targetMinutes || 12), 12);
  const isOverdue = elapsedMinutes > maxTargetMinutes;
  const isUrgent = elapsedMinutes > maxTargetMinutes * 0.75;

  const getPriorityBadge = (priority?: KDSPriority) => {
    switch (priority) {
      case 'URGENTE':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse uppercase">⚡ URGENTE</span>;
      case 'VIP':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/50 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">👑 VIP</span>;
      case 'DELIVERY':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">🛵 DELIVERY</span>;
      case 'TAKE_AWAY':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">📦 PARA LLEVAR</span>;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: ItemKDSStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-rose-950/40 border-rose-600/60 text-rose-300',
          badgeBg: 'bg-rose-500 text-slate-950',
          label: 'PENDIENTE',
        };
      case 'ACCEPTED':
        return {
          bg: 'bg-sky-950/40 border-sky-600/60 text-sky-300',
          badgeBg: 'bg-sky-500 text-slate-950',
          label: 'ACEPTADO',
        };
      case 'PREPARING':
        return {
          bg: 'bg-amber-950/50 border-amber-500 text-amber-300 animate-pulse',
          badgeBg: 'bg-amber-500 text-slate-950',
          label: 'EN MARCHA',
        };
      case 'PLATING':
        return {
          bg: 'bg-purple-950/40 border-purple-600/60 text-purple-300',
          badgeBg: 'bg-purple-500 text-slate-950',
          label: 'EMPLATANDO',
        };
      case 'READY':
        return {
          bg: 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300',
          badgeBg: 'bg-emerald-500 text-slate-950',
          label: 'LISTO PASE',
        };
      case 'SERVED':
      case 'DELIVERED':
        return {
          bg: 'bg-slate-900/60 border-slate-700/60 text-slate-400',
          badgeBg: 'bg-slate-700 text-slate-300',
          label: 'SERVIDO',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-slate-950 border-red-900/60 text-red-500 line-through',
          badgeBg: 'bg-red-900 text-white',
          label: 'CANCELADO',
        };
    }
  };

  const nextStatusMap: Record<ItemKDSStatus, ItemKDSStatus> = {
    PENDING: 'ACCEPTED',
    ACCEPTED: 'PREPARING',
    PREPARING: 'PLATING',
    PLATING: 'READY',
    READY: 'SERVED',
    SERVED: 'SERVED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
  };

  return (
    <div
      className={`w-88 shrink-0 bg-slate-900/90 border rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        isOverdue
          ? 'border-red-500 ring-4 ring-red-500/20 bg-red-950/20'
          : isUrgent
          ? 'border-amber-500/80 ring-2 ring-amber-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Ticket Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between ${
          isOverdue
            ? 'bg-red-950/80 border-red-800'
            : isUrgent
            ? 'bg-amber-950/60 border-amber-800'
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-black text-lg text-amber-400 tracking-wide">
              {order.tableName || 'Mesa Barra'}
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700 font-semibold">
              #{order.orderNumber}
            </span>
            {getPriorityBadge(items[0]?.priority)}
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <User className="w-3 h-3 text-slate-500" />
              <span>{order.serverName || 'Camarero'}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>{stationName}</span>
          </div>
        </div>

        {/* Timer Box */}
        <div className="flex flex-col items-end">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-mono font-extrabold text-sm border ${
              isOverdue
                ? 'bg-red-500 text-slate-950 border-red-400 animate-bounce'
                : isUrgent
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-amber-300 border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 ${isOverdue ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>{elapsedMinutes}m</span>
          </div>
          <span className="text-[9px] text-slate-400 mt-0.5">Objetivo: {maxTargetMinutes}m</span>
        </div>
      </div>

      {/* Order Line Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[420px]">
        {items.map((item) => {
          const style = getStatusStyle(item.kdsStatus);
          const nextStatus = nextStatusMap[item.kdsStatus];

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border space-y-2 transition-all ${style.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-black text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 font-mono">
                    {item.quantity}x
                  </span>
                  <span className="font-extrabold text-sm text-white leading-tight">
                    {item.productName}
                  </span>
                </div>
                <span className="text-[9px] bg-slate-950 text-amber-300 font-mono font-extrabold px-1.5 py-0.5 rounded border border-slate-800 uppercase shrink-0">
                  {item.course}
                </span>
              </div>

              {/* Modifiers & Allergens */}
              {(item.notes || (item.excludedIngredients && item.excludedIngredients.length > 0) || item.selectedExtras) && (
                <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/60">
                  {item.notes && (
                    <div className="flex items-center space-x-1.5 text-amber-300 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/50 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Nota: {item.notes}</span>
                    </div>
                  )}
                  {item.excludedIngredients && item.excludedIngredients.length > 0 && (
                    <div className="flex items-center space-x-1 text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/50 text-[11px]">
                      <Ban className="w-3 h-3 text-red-400 shrink-0" />
                      <span>SIN: {item.excludedIngredients.join(', ')}</span>
                    </div>
                  )}
                  {item.selectedExtras && item.selectedExtras.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.selectedExtras.map((ex) => (
                        <span key={ex.id} className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          +{ex.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Time stamps & Cook info if available */}
              {item.cookName && (
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Cocinero: {item.cookName}</span>
                  {item.preparingAt && (
                    <span>Marcha: {new Date(item.preparingAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              )}

              {/* Action Toolbar for Item Workflow */}
              <div className="flex items-center space-x-1 pt-1 border-t border-slate-800/40">
                {(['PENDING', 'ACCEPTED', 'PREPARING', 'PLATING', 'READY', 'SERVED'] as ItemKDSStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => onStatusChange(order.id, item.id, st)}
                      className={`flex-1 py-1 text-[9px] font-extrabold rounded uppercase transition-all ${
                        item.kdsStatus === st
                          ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                          : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {st === 'PENDING'
                        ? 'Pend'
                        : st === 'ACCEPTED'
                        ? 'Acept'
                        : st === 'PREPARING'
                        ? 'Marcha'
                        : st === 'PLATING'
                        ? 'Emplat'
                        : st === 'READY'
                        ? 'Listo'
                        : 'Serv'}
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Card Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <select
            value={items[0]?.priority || 'NORMAL'}
            onChange={(e) =>
              items.forEach((i) => onPriorityChange(order.id, i.id, e.target.value as KDSPriority))
            }
            className="bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded px-1.5 py-1 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="NORMAL">NORMAL</option>
            <option value="URGENTE">URGENTE⚡</option>
            <option value="VIP">VIP 👑</option>
            <option value="DELIVERY">DELIVERY 🛵</option>
            <option value="TAKE_AWAY">LLEVAR 📦</option>
          </select>
        </div>

        <button
          onClick={() => onReprintOrder(order, items)}
          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Reimprimir</span>
        </button>
      </div>
    </div>
  );
};
