import React from 'react';
import { Reservation, ReservationStatus, Salon } from '../../types/reservation';
import { CalendarViewType } from './ReservationHeader';
import {
  Clock,
  Users,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface ReservationCalendarViewProps {
  view: CalendarViewType;
  selectedDate: string;
  reservations: Reservation[];
  salons: Salon[];
  onSelectReservation: (res: Reservation) => void;
  onCheckIn: (resId: string) => void;
  onNoShow: (resId: string) => void;
  onSendNotification: (res: Reservation) => void;
  onUpdateStatus: (resId: string, status: ReservationStatus) => void;
}

const HOURS_RANGE = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export const ReservationCalendarView: React.FC<ReservationCalendarViewProps> = ({
  view,
  selectedDate,
  reservations,
  salons,
  onSelectReservation,
  onCheckIn,
  onNoShow,
  onSendNotification,
  onUpdateStatus,
}) => {
  const getStatusBadgeClass = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMADA':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'CHECK_IN':
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse';
      case 'SENTADOS':
      case 'EN_SERVICIO':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'FINALIZADA':
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
      case 'NO_SHOW':
        return 'bg-rose-500/20 border-rose-500/40 text-rose-400 font-extrabold';
      case 'CANCELADA':
        return 'bg-red-950 border-red-900 text-red-500 line-through';
      case 'RECORDADA':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      default:
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    }
  };

  // 1. TIMELINE / MESA LANE VIEW
  if (view === 'timeline') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-x-auto flex-1 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Timeline de Ocupación de Mesas por Hora</span>
          </h3>
          <span className="text-xs text-slate-400">Fecha: {selectedDate}</span>
        </div>

        <div className="min-w-[900px] space-y-4">
          {salons.map((salon) => (
            <div key={salon.id} className="space-y-2">
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
                {salon.name} ({salon.tables.length} mesas)
              </div>
              <div className="space-y-1">
                {salon.tables.map((table) => {
                  const tableRes = reservations.filter(
                    (r) => r.tableId === table.id && r.date === selectedDate
                  );
                  return (
                    <div key={table.id} className="grid grid-cols-12 items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-xs">
                      <div className="col-span-2 font-bold text-white flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        <span>{table.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({table.seats}p)</span>
                      </div>
                      <div className="col-span-10 flex space-x-2 overflow-x-auto scrollbar-none">
                        {tableRes.length === 0 ? (
                          <span className="text-[11px] text-slate-600 italic">Sin reservas hoy</span>
                        ) : (
                          tableRes.map((res) => (
                            <button
                              key={res.id}
                              onClick={() => onSelectReservation(res)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center space-x-1 transition-all ${getStatusBadgeClass(
                                res.status
                              )}`}
                            >
                              <span className="font-mono font-bold">{res.time}</span>
                              <span>• {res.customerName}</span>
                              <span className="font-bold text-[10px]">({res.pax}p)</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. DAILY VIEW
  if (view === 'daily') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
        {/* Hours Column Timeline */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Horarios del Servicio ({selectedDate})
          </h3>
          <div className="space-y-1.5">
            {HOURS_RANGE.map((hour) => {
              const hourCount = reservations.filter(
                (r) => r.date === selectedDate && r.time.startsWith(hour.slice(0, 3))
              ).length;

              return (
                <div
                  key={hour}
                  className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <span className="font-mono text-xs font-bold text-amber-400">{hour}h</span>
                  {hourCount > 0 ? (
                    <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                      {hourCount} res.
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">Libre</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Reservations Grid */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Reservas para el Día {selectedDate}</span>
            </h3>
            <span className="text-xs text-slate-400">Total: {reservations.length} reservas</span>
          </div>

          {reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-2">
              <Clock className="w-12 h-12 stroke-1 text-slate-600" />
              <p className="text-sm font-medium">No hay reservas registradas para esta fecha.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => (
                <ReservationCard
                  key={res.id}
                  res={res}
                  onSelectReservation={onSelectReservation}
                  onCheckIn={onCheckIn}
                  onNoShow={onNoShow}
                  onSendNotification={onSendNotification}
                  onUpdateStatus={onUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. AGENDA LIST VIEW (Default / List)
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 overflow-y-auto space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-extrabold text-white">Listado Completo de Agenda de Reservas</h3>
        <span className="text-xs text-slate-400">Total mostrados: {reservations.length}</span>
      </div>

      <div className="space-y-3">
        {reservations.map((res) => (
          <div
            key={res.id}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[65px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hora</span>
                  <span className="text-sm font-mono font-black text-amber-400">{res.time}h</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-base text-white">{res.customerName}</h4>
                    <span className="text-xs font-mono text-slate-500">#{res.code || res.id}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{res.phone}</span>
                    </span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{res.pax} PAX</span>
                    {res.kids > 0 && <span>({res.kids} niños)</span>}
                    {res.tableName && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold">{res.tableName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadgeClass(res.status)}`}>
                  {res.status}
                </span>

                {res.noShowProbability !== undefined && (
                  <span
                    className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center space-x-1 ${
                      res.noShowProbability > 25
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                    title="Probabilidad de No-Show predicha por IA"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>No-Show: {res.noShowProbability}%</span>
                  </span>
                )}
              </div>
            </div>

            {/* Details row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Canal</span>
                <span className="text-slate-300 font-bold">{res.channel}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Evento</span>
                <span className="text-amber-400 font-bold">{res.eventType || 'NINGUNO'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Fianza / Depósito</span>
                <span className={res.depositPaid ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {res.depositAmount ? `${res.depositAmount}€ (${res.depositPaid ? 'PAGADO' : 'PENDIENTE'})` : 'Sin fianza'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Alergias</span>
                <span className="text-rose-400 font-bold">
                  {res.allergies && res.allergies.length > 0 ? res.allergies.join(', ') : 'Ninguna'}
                </span>
              </div>
            </div>

            {res.notes && (
              <p className="text-xs text-amber-300 italic bg-amber-950/20 p-2 rounded-xl border border-amber-900/30">
                Observaciones: {res.notes}
              </p>
            )}

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onCheckIn(res.id)}
                  disabled={res.status === 'CHECK_IN' || res.status === 'SENTADOS'}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs flex items-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Check-In</span>
                </button>

                <button
                  onClick={() => onNoShow(res.id)}
                  disabled={res.status === 'NO_SHOW'}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Registrar No-Show</span>
                </button>

                <button
                  onClick={() => onSendNotification(res)}
                  className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>WhatsApp / SMS</span>
                </button>
              </div>

              <button
                onClick={() => onSelectReservation(res)}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
              >
                <span>Editar / Detalles</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Internal Subcard Component
const ReservationCard: React.FC<{
  res: Reservation;
  onSelectReservation: (res: Reservation) => void;
  onCheckIn: (resId: string) => void;
  onNoShow: (resId: string) => void;
  onSendNotification: (res: Reservation) => void;
  onUpdateStatus: (resId: string, status: ReservationStatus) => void;
  getStatusBadgeClass: (status: ReservationStatus) => string;
}> = ({
  res,
  onSelectReservation,
  onCheckIn,
  onNoShow,
  onSendNotification,
  getStatusBadgeClass,
}) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-extrabold text-base text-white">{res.customerName}</h4>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{res.phone}</span>
            </p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStatusBadgeClass(res.status)}`}>
            {res.status}
          </span>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{res.time}h</span>
          </div>
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{res.pax} PAX</span>
          </div>
          <div className="col-span-2 text-slate-300 font-sans pt-1.5 border-t border-slate-800 flex justify-between">
            <span>Mesa: <strong className="text-white">{res.tableName || 'Sin asignar'}</strong></span>
            {res.salonName && <span className="text-slate-400">({res.salonName})</span>}
          </div>
        </div>

        {res.notes && (
          <p className="text-xs text-amber-300 italic bg-amber-950/30 p-2 rounded-xl border border-amber-900/30">
            {res.notes}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => onCheckIn(res.id)}
          className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Check-in</span>
        </button>

        <button
          onClick={() => onSendNotification(res)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl"
          title="WhatsApp / Notificación"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectReservation(res)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
          title="Detalles"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
