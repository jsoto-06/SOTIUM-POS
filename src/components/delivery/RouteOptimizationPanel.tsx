import React, { useState } from 'react';
import { DeliveryOrder, Driver, DeliveryRoute } from '../../types/delivery';
import { DeliveryService } from '../../services/deliveryService';
import { Navigation, MapPin, Sparkles, Truck, CheckCircle2, Clock, Map as MapIcon, ChevronRight } from 'lucide-react';

interface RouteOptimizationPanelProps {
  orders: DeliveryOrder[];
  drivers: Driver[];
  routes: DeliveryRoute[];
  onCreateRoute: (route: DeliveryRoute) => void;
}

export const RouteOptimizationPanel: React.FC<RouteOptimizationPanelProps> = ({
  orders,
  drivers,
  routes,
  onCreateRoute,
}) => {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const availableOrders = orders.filter(
    (o) => o.status === 'LISTO' || o.status === 'PREPARANDO' || o.status === 'ACEPTADO'
  );

  const availableDrivers = drivers.filter((d) => d.status === 'DISPONIBLE' || d.status === 'EN_RUTA');

  const toggleOrderSelection = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((i) => i !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleGenerateRoute = () => {
    if (selectedOrderIds.length === 0 || !selectedDriverId) {
      alert('Selecciona al menos 1 pedido y 1 repartidor');
      return;
    }

    const driver = drivers.find((d) => d.id === selectedDriverId);
    const ordersToGroup = orders.filter((o) => selectedOrderIds.includes(o.id));

    if (!driver) return;

    const newRoute = DeliveryService.optimizeRoute(ordersToGroup, driver);
    onCreateRoute(newRoute);
    setSelectedOrderIds([]);
    setSelectedDriverId('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Optimización Inteligente de Rutas & Agrupación (IA Gemini)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Agrupa múltiples envíos por cercanía geográfica y minimiza tiempos de espera y consumo de combustible
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateRoute}
          disabled={selectedOrderIds.length === 0 || !selectedDriverId}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" /> Generar Ruta Optimizada ({selectedOrderIds.length} Pedidos)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Step 1: Select Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" /> 1. Pedidos Disponibles para Agrupar
            </h4>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono">
              {availableOrders.length} listos
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[450px] pr-1">
            {availableOrders.map((ord) => {
              const isSelected = selectedOrderIds.includes(ord.id);
              return (
                <div
                  key={ord.id}
                  onClick={() => toggleOrderSelection(ord.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold text-amber-400">#{ord.orderCode}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded">
                      {ord.status}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-white">{ord.customer.name}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> {ord.customer.address}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono text-right font-bold mt-1">
                    {ord.total.toFixed(2)} €
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Driver & Map Simulation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Truck className="w-4 h-4 text-amber-400" /> 2. Asignar Repartidor de la Flota
            </h4>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">Repartidor Destino:</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Seleccionar Repartidor --</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.vehicle}) - Estado: {d.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Map Vector Mock */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 h-[260px] relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
            <MapIcon className="w-10 h-10 text-amber-400 relative z-10" />
            <h5 className="text-xs font-bold text-white relative z-10">Visualizador de Coordenadas de Ruta</h5>
            <p className="text-[11px] text-slate-400 max-w-xs relative z-10">
              Calculando waypoints óptimos para {selectedOrderIds.length} paradas seleccionadas
            </p>
            {selectedOrderIds.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] px-3 py-1 rounded-full font-mono font-bold relative z-10">
                Ahorro estimado: 18% tiempo / 2.1 km
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Active Routes List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Navigation className="w-4 h-4 text-amber-400" /> Rutas Activas en Marcha
          </h4>

          <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">
            {routes.map((rut) => (
              <div key={rut.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-amber-400">{rut.routeCode}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                    {rut.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="font-bold flex items-center gap-1 text-white">
                    <Truck className="w-3.5 h-3.5 text-amber-400" /> {rut.driverName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{rut.totalDistanceKm} km</span>
                </div>

                {/* Waypoints */}
                <div className="space-y-1 pt-1 border-t border-slate-800 text-[11px]">
                  {rut.waypoints.map((wp, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-slate-900 border border-amber-500/50 text-[9px] font-mono font-bold text-amber-400 flex items-center justify-center shrink-0">
                        {wp.sequenceOrder}
                      </span>
                      <span className="truncate max-w-[150px]">{wp.customerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
