import React, { useState } from 'react';
import {
  DeliveryOrder,
  DeliveryOrderStatus,
  DeliveryChannel,
  DeliveryPaymentMethod,
  Driver,
} from '../../types/delivery';
import { DeliveryService } from '../../services/deliveryService';
import {
  Search,
  Truck,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';

interface DeliveryOrderManagerProps {
  orders: DeliveryOrder[];
  drivers: Driver[];
  onUpdateOrder: (updated: DeliveryOrder) => void;
  onAssignDriver: (order: DeliveryOrder, driver: Driver) => void;
  onOpenTracking: (order: DeliveryOrder) => void;
}

export const DeliveryOrderManager: React.FC<DeliveryOrderManagerProps> = ({
  orders,
  drivers,
  onUpdateOrder,
  onAssignDriver,
  onOpenTracking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<DeliveryChannel | 'TODOS'>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<DeliveryOrderStatus | 'TODOS'>('TODOS');
  const [selectedPayment, setSelectedPayment] = useState<DeliveryPaymentMethod | 'TODOS'>('TODOS');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LISTA'>('KANBAN');

  // Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<DeliveryOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Assign Driver Modal State
  const [assignModalOrder, setAssignModalOrder] = useState<DeliveryOrder | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const searchedOrders = DeliveryService.searchOrders(orders, searchTerm);
  const filteredOrders = DeliveryService.filterOrders(searchedOrders, {
    channel: selectedChannel,
    status: selectedStatus,
    paymentMethod: selectedPayment,
  });

  const getPlatformBadge = (channel: DeliveryChannel) => {
    switch (channel) {
      case 'GLOVO':
        return <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">GLOVO</span>;
      case 'UBER_EATS':
        return <span className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">UBER EATS</span>;
      case 'JUST_EAT':
        return <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">JUST EAT</span>;
      case 'WHATSAPP':
        return <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">WHATSAPP</span>;
      case 'TAKE_AWAY':
        return <span className="bg-purple-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">TAKE AWAY</span>;
      case 'CLICK_COLLECT':
        return <span className="bg-indigo-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">CLICK & COLLECT</span>;
      default:
        return <span className="bg-cyan-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">WEB PROPIA</span>;
    }
  };

  const getStatusBadge = (status: DeliveryOrderStatus) => {
    switch (status) {
      case 'NUEVO':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">NUEVO</span>;
      case 'ACEPTADO':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded">ACEPTADO</span>;
      case 'PREPARANDO':
      case 'EN_COCINA':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded">EN COCINA</span>;
      case 'LISTO':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded">LISTO BARRA</span>;
      case 'EN_REPARTO':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">EN REPARTO</span>;
      case 'ENTREGADO':
        return <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">ENTREGADO</span>;
      case 'CANCELADO':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded">CANCELADO</span>;
      case 'INCIDENCIA':
        return <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">INCIDENCIA</span>;
    }
  };

  const handleNextStatus = (order: DeliveryOrder) => {
    let next: DeliveryOrderStatus = 'ACEPTADO';
    if (order.status === 'NUEVO') next = 'ACEPTADO';
    else if (order.status === 'ACEPTADO') next = 'PREPARANDO';
    else if (order.status === 'PREPARANDO' || order.status === 'EN_COCINA') next = 'LISTO';
    else if (order.status === 'LISTO') next = 'EN_REPARTO';
    else if (order.status === 'EN_REPARTO') next = 'ENTREGADO';

    const updated = DeliveryService.updateOrderStatus(order, next);
    onUpdateOrder(updated);
  };

  const handleCancelSubmit = () => {
    if (!cancelModalOrder) return;
    const updated = DeliveryService.updateOrderStatus(cancelModalOrder, 'CANCELADO', 'Operador TPV', cancelReason);
    onUpdateOrder(updated);
    setCancelModalOrder(null);
    setCancelReason('');
  };

  const handleAssignSubmit = () => {
    if (!assignModalOrder || !selectedDriverId) return;
    const driver = drivers.find((d) => d.id === selectedDriverId);
    if (!driver) return;

    onAssignDriver(assignModalOrder, driver);
    setAssignModalOrder(null);
    setSelectedDriverId('');
  };

  const kanbanColumns: { status: DeliveryOrderStatus; label: string; color: string }[] = [
    { status: 'NUEVO', label: '1. Nuevos', color: 'border-amber-500/40 text-amber-400' },
    { status: 'ACEPTADO', label: '2. Aceptados', color: 'border-cyan-500/40 text-cyan-400' },
    { status: 'PREPARANDO', label: '3. En Cocina', color: 'border-purple-500/40 text-purple-400' },
    { status: 'LISTO', label: '4. Listo en Barra', color: 'border-blue-500/40 text-blue-400' },
    { status: 'EN_REPARTO', label: '5. En Reparto', color: 'border-emerald-500/40 text-emerald-400' },
    { status: 'ENTREGADO', label: '6. Entregados', color: 'border-slate-700 text-slate-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Código (#DEL-2026), Cliente, Teléfono, Dirección, Repartidor..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="TODOS">Todos los Canales</option>
            <option value="GLOVO">Glovo</option>
            <option value="UBER_EATS">Uber Eats</option>
            <option value="JUST_EAT">Just Eat</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WEB_PROPIA">Web / App Propia</option>
            <option value="TAKE_AWAY">Take Away</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="NUEVO">Nuevos</option>
            <option value="ACEPTADO">Aceptados</option>
            <option value="PREPARANDO">En Cocina</option>
            <option value="LISTO">Listos</option>
            <option value="EN_REPARTO">En Reparto</option>
            <option value="ENTREGADO">Entregados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>

          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="TODOS">Todos los Pagos</option>
            <option value="ONLINE">Pago Online</option>
            <option value="BIZUM">Bizum</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta TPV</option>
          </select>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'KANBAN' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('LISTA')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'LISTA' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* View Mode: KANBAN BOARD */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter(
              (o) =>
                o.status === col.status ||
                (col.status === 'PREPARANDO' && o.status === 'EN_COCINA')
            );

            return (
              <div
                key={col.status}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 flex flex-col space-y-3 min-h-[500px]"
              >
                <div className={`flex items-center justify-between border-b border-slate-800 pb-2 ${col.color}`}>
                  <h3 className="font-extrabold text-xs">{col.label}</h3>
                  <span className="bg-slate-950 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2.5 shadow-md transition-all relative group"
                    >
                      <div className="flex justify-between items-center">
                        {getPlatformBadge(ord.channel)}
                        <span className="text-[10px] font-mono text-slate-400">#{ord.orderCode}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-white truncate max-w-[130px]" title={ord.customer.name}>
                            {ord.customer.name}
                          </h4>
                          <span className="text-xs font-black text-amber-400 font-mono">{ord.total.toFixed(2)}€</span>
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {ord.customer.phone}
                        </p>
                        <p className="text-[10px] text-slate-300 flex items-start gap-1 line-clamp-2">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {ord.customer.address}
                        </p>
                      </div>

                      {/* Items Brief */}
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 space-y-1 text-[11px]">
                        {ord.items.slice(0, 2).map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span className="truncate max-w-[120px]">{it.quantity}x {it.productName}</span>
                            <span className="font-mono text-slate-400">{it.totalPrice.toFixed(2)}€</span>
                          </div>
                        ))}
                        {ord.items.length > 2 && (
                          <p className="text-[9px] text-amber-400 font-bold">+ {ord.items.length - 2} productos más</p>
                        )}
                      </div>

                      {/* Driver & ETA */}
                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="text-slate-400 truncate max-w-[90px]">
                          {ord.driverName ? `🏍️ ${ord.driverName}` : '⚠️ Sin Repartidor'}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ord.estimatedPrepMinutes + ord.estimatedDeliveryMinutes} min
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 pt-1 border-t border-slate-800">
                        {ord.status !== 'ENTREGADO' && ord.status !== 'CANCELADO' && (
                          <button
                            onClick={() => handleNextStatus(ord)}
                            className="flex-1 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] flex items-center justify-center gap-0.5"
                          >
                            <span>Avanzar</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => setAssignModalOrder(ord)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                          title="Asignar Repartidor"
                        >
                          <Truck className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onOpenTracking(ord)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[10px]"
                          title="Ver Tracking Cliente"
                        >
                          <MapPin className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => setCancelModalOrder(ord)}
                          className="px-2 py-1 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded text-[10px]"
                          title="Cancelar Pedido"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode: LIST TABLE */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Código / Canal</th>
                <th className="p-3">Cliente / Teléfono</th>
                <th className="p-3">Dirección Entrega</th>
                <th className="p-3">Pago</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Repartidor</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-850 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">
                    <div className="flex flex-col gap-1">
                      <span>#{ord.orderCode}</span>
                      <div>{getPlatformBadge(ord.channel)}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-white">{ord.customer.name}</p>
                    <p className="text-[11px] text-slate-400">{ord.customer.phone}</p>
                  </td>
                  <td className="p-3 text-[11px] max-w-xs truncate" title={ord.customer.address}>
                    {ord.customer.address}
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[10px] font-mono text-cyan-400">
                      {ord.paymentMethod} ({ord.isPaid ? 'Pagado' : 'Pendiente'})
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400 text-sm">
                    {ord.total.toFixed(2)} €
                  </td>
                  <td className="p-3">{getStatusBadge(ord.status)}</td>
                  <td className="p-3 font-semibold text-slate-300">
                    {ord.driverName ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Truck className="w-3.5 h-3.5" /> {ord.driverName}
                      </span>
                    ) : (
                      <span className="text-rose-400 text-[11px]">Sin asignar</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleNextStatus(ord)}
                        className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold"
                        title="Avanzar Estado"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAssignModalOrder(ord)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                        title="Asignar Repartidor"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenTracking(ord)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded"
                        title="Ver Tracking"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Driver Modal */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Truck className="w-4 h-4 text-amber-400" /> Asignar Repartidor a #{assignModalOrder.orderCode}
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Seleccionar Repartidor de la Flota:</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              >
                <option value="">-- Seleccionar Repartidor --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.vehicle}) - Estado: {d.status} | Entregas: {d.totalDeliveriesLifetime}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setAssignModalOrder(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={!selectedDriverId}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg disabled:opacity-50"
              >
                Confirmar Asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <XCircle className="w-4 h-4 text-rose-500" /> Cancelar Pedido #{cancelModalOrder.orderCode}
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Motivo de Cancelación o Rechazo:</label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej: Cliente cancela por teléfono, cocina sin stock de ingrediente principal..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Volver
              </button>
              <button
                onClick={handleCancelSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg"
              >
                Ejecutar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
