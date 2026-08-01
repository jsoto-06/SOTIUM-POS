import React, { useState } from 'react';
import {
  DeliveryOrder,
  Driver,
  DeliveryRoute,
  OmnichannelConnector,
  DeliveryChannel,
  DeliveryPaymentMethod,
} from '../types/delivery';
import {
  INITIAL_DELIVERY_ORDERS,
  INITIAL_DRIVERS,
  INITIAL_ROUTES,
  INITIAL_CONNECTORS,
} from '../data/deliveryData';
import { DeliveryService } from '../services/deliveryService';
import { DeliveryOrderManager } from './delivery/DeliveryOrderManager';
import { DriverFleetManager } from './delivery/DriverFleetManager';
import { RouteOptimizationPanel } from './delivery/RouteOptimizationPanel';
import { OmnichannelConnectorsPanel } from './delivery/OmnichannelConnectorsPanel';
import { DeliveryAIAnalyticsPanel } from './delivery/DeliveryAIAnalyticsPanel';
import { DeliveryCustomerTrackingModal } from './delivery/DeliveryCustomerTrackingModal';
import { DeliveryAnalyticsView } from './delivery/DeliveryAnalyticsView';
import { DeliveryImportExportModal } from './delivery/DeliveryImportExportModal';
import {
  Truck,
  Users,
  Navigation,
  Radio,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Plus,
  X,
  Phone,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

export const DeliveryModule: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_DELIVERY_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [routes, setRoutes] = useState<DeliveryRoute[]>(INITIAL_ROUTES);
  const [connectors, setConnectors] = useState<OmnichannelConnector[]>(INITIAL_CONNECTORS);

  const [activeTab, setActiveTab] = useState<
    'HUB_PEDIDOS' | 'FLOTA_REPARTIDORES' | 'RUTAS_IA' | 'CONECTORES' | 'IA_ANALYTICS' | 'ANALITICAS'
  >('HUB_PEDIDOS');

  const [trackingOrder, setTrackingOrder] = useState<DeliveryOrder | null>(null);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Order Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newChannel, setNewChannel] = useState<DeliveryChannel>('DELIVERY_PROPIO');
  const [newPayment, setNewPayment] = useState<DeliveryPaymentMethod>('ONLINE');
  const [newItemName, setNewItemName] = useState('Menú Especial Degustación');
  const [newItemPrice, setNewItemPrice] = useState<number>(24.5);

  const analytics = DeliveryService.computeAnalytics(orders, drivers);
  const predictions = DeliveryService.generateAIPredictions(orders, drivers);

  const handleUpdateOrder = (updated: DeliveryOrder) => {
    setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleAssignDriver = (order: DeliveryOrder, driver: Driver) => {
    const { updatedOrder, updatedDriver } = DeliveryService.assignDriverToOrder(order, driver);
    setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    setDrivers(drivers.map((d) => (d.id === updatedDriver.id ? updatedDriver : d)));
  };

  const handleUpdateDriver = (updated: Driver) => {
    setDrivers(drivers.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleCreateDriver = (newDriver: Driver) => {
    setDrivers([newDriver, ...drivers]);
  };

  const handleCreateRoute = (newRoute: DeliveryRoute) => {
    setRoutes([newRoute, ...routes]);
  };

  const handleToggleAutoAccept = (connectorId: string) => {
    setConnectors(
      connectors.map((c) => (c.id === connectorId ? { ...c, autoAcceptOrders: !c.autoAcceptOrders } : c))
    );
  };

  const handleSimulateWebhook = (connectorId: string) => {
    const conn = connectors.find((c) => c.id === connectorId);
    if (!conn) return;

    const newOrder: DeliveryOrder = {
      id: `webhook-${Date.now()}`,
      orderCode: `DEL-2026-${Math.floor(200 + Math.random() * 700)}`,
      channel: (conn.type as unknown as DeliveryChannel) || 'GLOVO',
      externalPlatformOrderId: `${conn.type.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: conn.autoAcceptOrders ? 'ACEPTADO' : 'NUEVO',
      paymentMethod: 'ONLINE',
      isPaid: true,
      customer: {
        name: `Cliente ${conn.name}`,
        phone: '611998877',
        address: 'Paseo de la Habana 24, Madrid',
        city: 'Madrid',
        postalCode: '28036',
      },
      items: [
        { productId: 'item-wh', productName: 'Pizza Artisanal Trufada', quantity: 2, unitPrice: 15.0, totalPrice: 30.0 },
      ],
      subtotal: 27.27,
      deliveryFee: 3.0,
      tipAmount: 2.0,
      total: 35.0,
      estimatedPrepMinutes: 15,
      estimatedDeliveryMinutes: 18,
      etaTimestamp: new Date(Date.now() + 1900000).toISOString(),
      createdAt: new Date().toISOString(),
      acceptedAt: conn.autoAcceptOrders ? new Date().toISOString() : undefined,
    };

    setOrders([newOrder, ...orders]);
    alert(`⚡ Webhook recibido desde ${conn.name}: Creado pedido #${newOrder.orderCode}`);
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) {
      alert('Nombre y Teléfono son obligatorios');
      return;
    }

    const created: DeliveryOrder = {
      id: `manual-${Date.now()}`,
      orderCode: `DEL-2026-${Math.floor(300 + Math.random() * 600)}`,
      channel: newChannel,
      status: 'NUEVO',
      paymentMethod: newPayment,
      isPaid: newPayment !== 'EFECTIVO',
      customer: {
        name: newCustomerName,
        phone: newCustomerPhone,
        address: newCustomerAddress || 'Recogida en Local / Take Away',
        city: 'Madrid',
        postalCode: '28001',
      },
      items: [
        { productId: 'prod-manual', productName: newItemName, quantity: 1, unitPrice: newItemPrice, totalPrice: newItemPrice },
      ],
      subtotal: Number((newItemPrice * 0.9).toFixed(2)),
      deliveryFee: newChannel === 'TAKE_AWAY' ? 0 : 3.0,
      tipAmount: 0,
      total: newItemPrice + (newChannel === 'TAKE_AWAY' ? 0 : 3.0),
      estimatedPrepMinutes: 15,
      estimatedDeliveryMinutes: newChannel === 'TAKE_AWAY' ? 0 : 20,
      etaTimestamp: new Date(Date.now() + 1800000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setOrders([created, ...orders]);
    setShowCreateModal(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerAddress('');
  };

  const handleImportOrders = (imported: DeliveryOrder[]) => {
    setOrders([...imported, ...orders]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Delivery, Take Away & Omnicanal Enterprise</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                FASE 13
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              HUB Integrador Deliverect, Glovo, Uber Eats, Just Eat, WhatsApp, Rutas IA, GPS Flota y Tracking Cliente
            </p>
          </div>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Nuevo Pedido
          </button>
          <button
            onClick={() => setShowImportExportModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Import / Export CSV
          </button>

          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
            {(
              [
                { id: 'HUB_PEDIDOS', label: 'Hub Pedidos', icon: <ShoppingBag className="w-4 h-4" />, badge: orders.length },
                { id: 'FLOTA_REPARTIDORES', label: 'Flota & GPS', icon: <Users className="w-4 h-4 text-emerald-400" /> },
                { id: 'RUTAS_IA', label: 'Rutas IA', icon: <Navigation className="w-4 h-4 text-cyan-400" /> },
                { id: 'CONECTORES', label: 'Conectores POS', icon: <Radio className="w-4 h-4 text-amber-400" /> },
                { id: 'IA_ANALYTICS', label: 'Asistente IA', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
                { id: 'ANALITICAS', label: 'Analíticas', icon: <BarChart3 className="w-4 h-4 text-purple-400" /> },
              ] as Array<{ id: typeof activeTab; label: string; icon: React.ReactNode; badge?: number }>
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === t.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-amber-300 border border-amber-500/30 font-mono">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'HUB_PEDIDOS' && (
          <DeliveryOrderManager
            orders={orders}
            drivers={drivers}
            onUpdateOrder={handleUpdateOrder}
            onAssignDriver={handleAssignDriver}
            onOpenTracking={(ord) => setTrackingOrder(ord)}
          />
        )}

        {activeTab === 'FLOTA_REPARTIDORES' && (
          <DriverFleetManager
            drivers={drivers}
            onUpdateDriver={handleUpdateDriver}
            onCreateDriver={handleCreateDriver}
          />
        )}

        {activeTab === 'RUTAS_IA' && (
          <RouteOptimizationPanel
            orders={orders}
            drivers={drivers}
            routes={routes}
            onCreateRoute={handleCreateRoute}
          />
        )}

        {activeTab === 'CONECTORES' && (
          <OmnichannelConnectorsPanel
            connectors={connectors}
            onToggleAutoAccept={handleToggleAutoAccept}
            onSimulateWebhook={handleSimulateWebhook}
          />
        )}

        {activeTab === 'IA_ANALYTICS' && (
          <DeliveryAIAnalyticsPanel
            analytics={analytics}
            predictions={predictions}
            onApplyDriverRecommendation={(ordId, drvId) => {
              const ord = orders.find((o) => o.id === ordId);
              const drv = drivers.find((d) => d.id === drvId);
              if (ord && drv) handleAssignDriver(ord, drv);
            }}
          />
        )}

        {activeTab === 'ANALITICAS' && <DeliveryAnalyticsView analytics={analytics} />}
      </div>

      {/* Live Customer Tracking Modal */}
      {trackingOrder && (
        <DeliveryCustomerTrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
      )}

      {/* Manual Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateOrderSubmit} className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" /> Registro Manual de Pedido (Delivery / TakeAway)
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Canal de Entrada *</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as DeliveryChannel)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="DELIVERY_PROPIO">Delivery Propio</option>
                  <option value="TAKE_AWAY">Take Away (Recogida)</option>
                  <option value="WHATSAPP">WhatsApp Bot</option>
                  <option value="TELEFONO">Pedido Telefónico</option>
                  <option value="WEB_PROPIA">Web / App Propia</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Teléfono Móvil *</label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Dirección Completa de Entrega</label>
                <input
                  type="text"
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  placeholder="Calle Gran Vía 12, 4ºA"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Método de Pago *</label>
                  <select
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value as DeliveryPaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="ONLINE">Pago Online / Tarjeta</option>
                    <option value="BIZUM">Bizum</option>
                    <option value="EFECTIVO">Efectivo al Repartidor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Importe Total (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Crear Pedido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import / Export Modal */}
      {showImportExportModal && (
        <DeliveryImportExportModal
          orders={orders}
          onClose={() => setShowImportExportModal(false)}
          onImportOrders={handleImportOrders}
        />
      )}
    </div>
  );
};
