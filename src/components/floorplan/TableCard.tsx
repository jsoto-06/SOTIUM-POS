import React, { memo } from 'react';
import { Table, TableStatus } from '../../types/pos';
import { Users, Clock, Lock, Link2, Calendar, UserCheck, ShieldAlert, DollarSign } from 'lucide-react';

interface TableCardProps {
  table: Table;
  isEditMode: boolean;
  isSelectedInEdit: boolean;
  zoomLevel: number;
  onSelectTable: (table: Table) => void;
  onMouseDownDrag: (e: React.MouseEvent, table: Table) => void;
}

export const getStatusConfig = (status: TableStatus) => {
  switch (status) {
    case 'FREE':
      return {
        label: 'LIBRE',
        badgeBg: 'bg-emerald-500 text-slate-950 font-black',
        cardBorder: 'border-emerald-500/60 hover:border-emerald-400',
        cardBg: 'bg-emerald-950/20 hover:bg-emerald-900/30',
        textColor: 'text-emerald-300',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      };
    case 'RESERVED':
      return {
        label: 'RESERVADA',
        badgeBg: 'bg-amber-400 text-slate-950 font-black',
        cardBorder: 'border-amber-500/60 hover:border-amber-400',
        cardBg: 'bg-amber-950/25 hover:bg-amber-900/40',
        textColor: 'text-amber-300',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      };
    case 'OCCUPIED':
      return {
        label: 'OCUPADA',
        badgeBg: 'bg-red-600 text-white font-black',
        cardBorder: 'border-red-500/70 hover:border-red-400',
        cardBg: 'bg-red-950/30 hover:bg-red-900/40',
        textColor: 'text-red-300',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      };
    case 'PENDING_ORDER':
      return {
        label: 'PENDIENTE PEDIR',
        badgeBg: 'bg-orange-500 text-white font-black',
        cardBorder: 'border-orange-500/70 hover:border-orange-400',
        cardBg: 'bg-orange-950/30 hover:bg-orange-900/40',
        textColor: 'text-orange-300',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      };
    case 'IN_KITCHEN':
      return {
        label: 'EN COCINA',
        badgeBg: 'bg-yellow-500 text-slate-950 font-black',
        cardBorder: 'border-yellow-500/70 hover:border-yellow-400',
        cardBg: 'bg-yellow-950/30 hover:bg-yellow-900/40',
        textColor: 'text-yellow-300',
        glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
      };
    case 'SERVING':
      return {
        label: 'SIRVIENDO',
        badgeBg: 'bg-cyan-500 text-slate-950 font-black',
        cardBorder: 'border-cyan-500/70 hover:border-cyan-400',
        cardBg: 'bg-cyan-950/30 hover:bg-cyan-900/40',
        textColor: 'text-cyan-300',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      };
    case 'WAITING_DESSERT':
      return {
        label: 'ESPERANDO POSTRE',
        badgeBg: 'bg-indigo-500 text-white font-black',
        cardBorder: 'border-indigo-500/70 hover:border-indigo-400',
        cardBg: 'bg-indigo-950/30 hover:bg-indigo-900/40',
        textColor: 'text-indigo-300',
        glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]',
      };
    case 'BILL_REQUESTED':
      return {
        label: 'PIDIENDO CUENTA',
        badgeBg: 'bg-blue-600 text-white font-black animate-pulse',
        cardBorder: 'border-blue-500/80 hover:border-blue-400',
        cardBg: 'bg-blue-950/40 hover:bg-blue-900/50',
        textColor: 'text-blue-300',
        glow: 'shadow-[0_0_20px_rgba(37,99,235,0.3)]',
      };
    case 'PAYING':
      return {
        label: 'PAGANDO',
        badgeBg: 'bg-violet-600 text-white font-black',
        cardBorder: 'border-violet-500/80 hover:border-violet-400',
        cardBg: 'bg-violet-950/40 hover:bg-violet-900/50',
        textColor: 'text-violet-300',
        glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
      };
    case 'CLEANING':
      return {
        label: 'LIMPIEZA',
        badgeBg: 'bg-purple-600 text-white font-black',
        cardBorder: 'border-purple-500/70 hover:border-purple-400',
        cardBg: 'bg-purple-950/30 hover:bg-purple-900/40',
        textColor: 'text-purple-300',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      };
    case 'OUT_OF_SERVICE':
      return {
        label: 'FUERA DE SERVICIO',
        badgeBg: 'bg-slate-700 text-slate-300 font-bold',
        cardBorder: 'border-slate-800',
        cardBg: 'bg-slate-900/80 opacity-60',
        textColor: 'text-slate-400',
        glow: '',
      };
    default:
      return {
        label: 'LIBRE',
        badgeBg: 'bg-emerald-500 text-slate-950 font-bold',
        cardBorder: 'border-emerald-500/50',
        cardBg: 'bg-emerald-950/20',
        textColor: 'text-emerald-300',
        glow: '',
      };
  }
};

const calculateElapsedTime = (occupiedSince?: string) => {
  if (!occupiedSince) return null;
  const minutes = Math.floor((Date.now() - new Date(occupiedSince).getTime()) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return `${hours}h ${remMins}m`;
};

export const TableCard: React.FC<TableCardProps> = memo(({
  table,
  isEditMode,
  isSelectedInEdit,
  zoomLevel,
  onSelectTable,
  onMouseDownDrag,
}) => {
  const config = getStatusConfig(table.status);
  const elapsedTime = calculateElapsedTime(table.occupiedSince);

  const shapeClasses =
    table.shape === 'round'
      ? 'rounded-full'
      : table.shape === 'oval'
      ? 'rounded-[40px]'
      : 'rounded-2xl';

  return (
    <div
      style={{
        left: `${table.x}px`,
        top: `${table.y}px`,
        width: `${table.width}px`,
        height: `${table.height}px`,
        transform: `rotate(${table.rotation || 0}deg)`,
        backgroundColor: table.color ? `${table.color}22` : undefined,
      }}
      onMouseDown={(e) => {
        if (isEditMode) {
          onMouseDownDrag(e, table);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectTable(table);
      }}
      className={`absolute border-2 transition-all duration-75 select-none p-2 flex flex-col justify-between cursor-pointer backdrop-blur-md ${shapeClasses} ${config.cardBorder} ${config.cardBg} ${config.glow} ${
        isSelectedInEdit ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 z-30' : 'z-10'
      } ${isEditMode && table.isLocked ? 'cursor-not-allowed opacity-90' : ''}`}
    >
      {/* Top Bar: Table Name/Number & Status Badge */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center space-x-1 min-w-0">
          <span className="font-black text-xs md:text-sm tracking-tight text-white truncate">
            {table.name}
          </span>
          {table.isLocked && <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />}
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded tracking-wide truncate ${config.badgeBg}`}>
          {config.label}
        </span>
      </div>

      {/* Middle Section: Joined indicator or Reservation Info */}
      <div className="my-1 flex flex-col space-y-1 text-[10px]">
        {table.joinedToTableId && (
          <div className="flex items-center space-x-1 text-sky-300 font-bold bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500/40 truncate">
            <Link2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Unida a {table.joinedToTableId}</span>
          </div>
        )}

        {table.joinedWithTableIds && table.joinedWithTableIds.length > 0 && (
          <div className="flex items-center space-x-1 text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 truncate">
            <Link2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Unión ({table.joinedWithTableIds.length} mesas)</span>
          </div>
        )}

        {table.status === 'RESERVED' && table.reservationInfo && (
          <div className="flex items-center space-x-1 text-amber-200 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 truncate">
            <Calendar className="w-3 h-3 flex-shrink-0 text-amber-400" />
            <span className="truncate font-semibold">{table.reservationInfo.customerName} ({table.reservationInfo.time})</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Pax, Elapsed Time & Waiter */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-700/30">
        <div className="flex items-center space-x-1 text-amber-400 font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>{table.pax || 0}/{table.seats}</span>
        </div>

        {elapsedTime && (
          <div className="flex items-center space-x-1 text-amber-300 font-extrabold bg-slate-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{elapsedTime}</span>
          </div>
        )}

        {table.accumulatedTotal ? (
          <div className="flex items-center text-emerald-400 font-extrabold text-[10px]">
            <span>{table.accumulatedTotal.toFixed(2)}€</span>
          </div>
        ) : null}
      </div>

      {/* Waiter badge if assigned */}
      {table.serverName && (
        <div className="text-[9px] text-slate-400 truncate pt-0.5 flex items-center justify-between">
          <span className="truncate">Atiende: <strong className="text-amber-300">{table.serverName}</strong></span>
        </div>
      )}
    </div>
  );
});

TableCard.displayName = 'TableCard';
