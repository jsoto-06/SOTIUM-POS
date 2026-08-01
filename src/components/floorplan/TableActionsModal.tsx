import React, { useState } from 'react';
import { Table, TableStatus, Salon, Employee } from '../../types/pos';
import { usePOS } from '../../context/POSContext';
import { getStatusConfig } from './TableCard';
import {
  X,
  Receipt,
  Users,
  User,
  ArrowRightLeft,
  Link2,
  Unlink,
  Layers,
  Calendar,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';

interface TableActionsModalProps {
  table: Table;
  salons: Salon[];
  employees: Employee[];
  onClose: () => void;
  onOpenPOS: (tableId: string) => void;
}

const ALL_STATUSES: { status: TableStatus; label: string; desc: string }[] = [
  { status: 'FREE', label: 'Libre', desc: 'Mesa lista para acomodar nuevos clientes' },
  { status: 'OCCUPIED', label: 'Ocupada', desc: 'Clientes sentados consumiendo' },
  { status: 'PENDING_ORDER', label: 'Pendiente Pedir', desc: 'Clientes sentados esperando tomar comanda' },
  { status: 'IN_KITCHEN', label: 'En Cocina', desc: 'Comanda marcha en cocina / barra' },
  { status: 'SERVING', label: 'Sirviendo', desc: 'Platos principales siendo servidos' },
  { status: 'WAITING_DESSERT', label: 'Esperando Postre', desc: 'Platos retirados, marcha de postres/café' },
  { status: 'BILL_REQUESTED', label: 'Pidiendo Cuenta', desc: 'Cliente solicita prefactura / ticket' },
  { status: 'PAYING', label: 'Pagando', desc: 'Cobro en curso por efectivo/tarjeta/bizum' },
  { status: 'CLEANING', label: 'Limpieza / Desbarraso', desc: 'Mesa requiere recogida y desinfección' },
  { status: 'RESERVED', label: 'Reservada', desc: 'Bloqueada por reserva confirmada' },
  { status: 'OUT_OF_SERVICE', label: 'Fuera de Servicio', desc: 'Mesa averiada o bloqueada' },
];

export const TableActionsModal: React.FC<TableActionsModalProps> = ({
  table,
  salons,
  employees,
  onClose,
  onOpenPOS,
}) => {
  const {
    updateTableStatus,
    transferTableOrder,
    joinTables,
    separateTables,
    moveClientsToSalon,
    assignWaiterToTable,
    updateTablePax,
    bindReservationToTable,
    tableCheckIn,
    tableNoShow,
    releaseTableReservation,
    reservations,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'STATUS' | 'TRANSFER' | 'JOIN' | 'WAITER' | 'PAX' | 'RESERVATION'>('STATUS');
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [secondaryTableIds, setSecondaryTableIds] = useState<string[]>([]);
  const [targetSalonId, setTargetSalonId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(table.serverId || '');
  const [paxInput, setPaxInput] = useState<number>(table.pax || table.seats);
  const [selectedReservationId, setSelectedReservationId] = useState<string>('');

  const currentSalon = salons.find((s) => s.id === table.salonId);
  const otherTablesInSalon = currentSalon?.tables.filter((t) => t.id !== table.id) || [];
  const statusConfig = getStatusConfig(table.status);

  // Filter available reservations for binding
  const pendingReservations = reservations.filter((r) => r.status === 'CONFIRMADA');

  const handleStatusChange = (st: TableStatus) => {
    updateTableStatus(table.id, st);
    onClose();
  };

  const handleTransfer = () => {
    if (!targetTableId) return;
    transferTableOrder(table.id, targetTableId);
    onClose();
  };

  const handleJoinToggle = (tId: string) => {
    setSecondaryTableIds((prev) =>
      prev.includes(tId) ? prev.filter((id) => id !== tId) : [...prev, tId]
    );
  };

  const handleApplyJoin = () => {
    if (secondaryTableIds.length === 0) return;
    joinTables(table.id, secondaryTableIds);
    onClose();
  };

  const handleSeparate = () => {
    separateTables(table.id);
    onClose();
  };

  const handleMoveSalon = () => {
    if (!targetSalonId) return;
    moveClientsToSalon(table.id, targetSalonId);
    onClose();
  };

  const handleAssignWaiter = () => {
    const emp = employees.find((e) => e.id === selectedEmployeeId);
    if (!emp) return;
    assignWaiterToTable(table.id, emp.id, emp.name);
    onClose();
  };

  const handleSavePax = () => {
    updateTablePax(table.id, Number(paxInput));
    onClose();
  };

  const handleBindReservation = () => {
    if (!selectedReservationId) return;
    bindReservationToTable(selectedReservationId, table.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-xl text-xs font-black ${statusConfig.badgeBg}`}>
              {statusConfig.label}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">{table.name}</h3>
              <p className="text-xs text-slate-400">
                {currentSalon?.name} • Capacidad: {table.seats} pax • Actuales: {table.pax || 0} pax
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => {
              onOpenPOS(table.id);
              onClose();
            }}
            className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <Receipt className="w-4 h-4" />
            <span>Abrir TPV Comanda</span>
          </button>

          <button
            onClick={() => setActiveTab('STATUS')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'STATUS'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Estado Servicio</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSFER')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'TRANSFER'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-sky-400" />
            <span>Transferir Mesa</span>
          </button>

          <button
            onClick={() => setActiveTab('JOIN')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'JOIN'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4 text-emerald-400" />
            <span>Unir / Separar</span>
          </button>
        </div>

        {/* Secondary Subtabs */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex space-x-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('WAITER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'WAITER' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Camarero ({table.serverName || 'Sin asignar'})
          </button>
          <button
            onClick={() => setActiveTab('PAX')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'PAX' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Comensales ({table.pax || 0} pax)
          </button>
          <button
            onClick={() => setActiveTab('RESERVATION')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'RESERVATION' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reserva ({table.reservationInfo ? 'Asignada' : 'Sin reserva'})
          </button>
        </div>

        {/* Body Content according to active tab */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {/* TAB 1: STATUS */}
          {activeTab === 'STATUS' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cambiar Estado de Mesa en Tiempo Real
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_STATUSES.map((st) => (
                  <button
                    key={st.status}
                    onClick={() => handleStatusChange(st.status)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      table.status === st.status
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-amber-300">{st.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TRANSFER */}
          {activeTab === 'TRANSFER' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-950/40 border border-sky-800/40 rounded-xl text-xs text-sky-200">
                Transfiere la comanda activa, cuenta y comensales de <strong>{table.name}</strong> a otra mesa.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Seleccionar Mesa Destino (en {currentSalon?.name})
                </label>
                <select
                  value={targetTableId}
                  onChange={(e) => setTargetTableId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                >
                  <option value="">-- Elegir Mesa Destino --</option>
                  {otherTablesInSalon.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status === 'FREE' ? 'LIBRE' : t.status}) - Capacidad: {t.seats} pax
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  disabled={!targetTableId}
                  onClick={handleTransfer}
                  className="px-5 py-2.5 bg-sky-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs hover:bg-sky-400 flex items-center space-x-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Confirmar Transferencia</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  O Mover Mesa Completa a Otro Salón
                </label>
                <div className="flex space-x-2">
                  <select
                    value={targetSalonId}
                    onChange={(e) => setTargetSalonId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Elegir Salón Destino --</option>
                    {salons
                      .filter((s) => s.id !== table.salonId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.tables.length} mesas)
                        </option>
                      ))}
                  </select>
                  <button
                    disabled={!targetSalonId}
                    onClick={handleMoveSalon}
                    className="px-4 py-2 bg-slate-800 disabled:opacity-50 text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-700"
                  >
                    Mover de Salón
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JOIN / SEPARATE */}
          {activeTab === 'JOIN' && (
            <div className="space-y-4">
              {table.joinedToTableId || (table.joinedWithTableIds && table.joinedWithTableIds.length > 0) ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                    <Link2 className="w-4 h-4" />
                    <span>Esta mesa forma parte de una unión de mesas.</span>
                  </div>
                  <button
                    onClick={handleSeparate}
                    className="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 font-extrabold rounded-xl text-xs flex items-center space-x-2"
                  >
                    <Unlink className="w-4 h-4" />
                    <span>Separar y Desvincular Mesas</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200">
                    Une <strong>{table.name}</strong> con otras mesas adyacentes para atender grandes grupos.
                  </div>

                  <label className="block text-xs font-bold text-slate-300">
                    Selecciona mesas para unir a {table.name}:
                  </label>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {otherTablesInSalon.map((t) => {
                      const isChecked = secondaryTableIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleJoinToggle(t.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                            isChecked
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>{t.name} ({t.seats} pax)</span>
                          {isChecked && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      disabled={secondaryTableIds.length === 0}
                      onClick={handleApplyJoin}
                      className="px-5 py-2.5 bg-emerald-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 flex items-center space-x-2"
                    >
                      <Link2 className="w-4 h-4" />
                      <span>Confirmar Unión de Mesas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WAITER */}
          {activeTab === 'WAITER' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Asignar Camarero / Servidor a la Mesa
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                      selectedEmployeeId === emp.id
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="font-extrabold text-xs text-amber-300">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.role}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleAssignWaiter}
                  className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-400 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Camarero</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PAX */}
          {activeTab === 'PAX' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300">
                Número de Comensales (Pax)
              </label>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPaxInput((prev) => Math.max(1, prev - 1))}
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white font-black text-xl rounded-xl"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={paxInput}
                  onChange={(e) => setPaxInput(Number(e.target.value))}
                  className="w-24 bg-slate-950 border border-slate-700 text-amber-400 font-mono text-center text-2xl font-black py-2 rounded-xl"
                />
                <button
                  onClick={() => setPaxInput((prev) => prev + 1)}
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white font-black text-xl rounded-xl"
                >
                  +
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSavePax}
                  className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-400 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Actualizar Pax</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: RESERVATION */}
          {activeTab === 'RESERVATION' && (
            <div className="space-y-4">
              {table.reservationInfo ? (
                <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-xl space-y-3">
                  <div className="font-extrabold text-sm text-amber-300 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Reserva Asignada a {table.name}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Cliente: <strong>{table.reservationInfo.customerName}</strong></div>
                    <div>Teléfono: <strong>{table.reservationInfo.phone}</strong></div>
                    <div>Hora: <strong>{table.reservationInfo.time}</strong></div>
                    <div>Comensales: <strong>{table.reservationInfo.pax} pax</strong></div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => {
                        tableCheckIn(table.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Sentar Cliente (Check-In)</span>
                    </button>
                    <button
                      onClick={() => {
                        releaseTableReservation(table.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700"
                    >
                      Liberar Reserva
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Vincular Reserva Confirmada a {table.name}:
                  </label>

                  {pendingReservations.length === 0 ? (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                      No hay reservas pendientes por asignar.
                    </div>
                  ) : (
                    <select
                      value={selectedReservationId}
                      onChange={(e) => setSelectedReservationId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    >
                      <option value="">-- Seleccionar Reserva --</option>
                      {pendingReservations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.customerName} ({r.time}) - {r.pax} pax - Tel: {r.phone}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      disabled={!selectedReservationId}
                      onClick={handleBindReservation}
                      className="px-5 py-2.5 bg-amber-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-400 flex items-center space-x-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Vincular Reserva y Marcar Reservada</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
