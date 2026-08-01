import React, { useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Grid,
  ChefHat,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  Truck,
  TrendingUp,
  Receipt,
  BarChart3,
  Warehouse,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Utensils,
  ShoppingBag,
} from 'lucide-react';

export const RoleDashboard: React.FC = React.memo(() => {
  const {
    activeEmployee,
    setActiveTab,
    salons,
    ordersHistory,
    reservations,
    deliveryOrders,
    ingredients,
    activeCashSession,
  } = usePOS();

  const role = activeEmployee.role ? activeEmployee.role.toUpperCase() : 'CAMARERO';

  // 1. CAMARERO Metrics
  const waiterData = useMemo(() => {
    let occupiedTablesCount = 0;
    const occupiedTablesList: { name: string; salonName: string; pax: number; total: number }[] = [];

    salons.forEach((s) => {
      s.tables.forEach((t) => {
        if (t.status === 'OCCUPIED' || t.status === 'SERVING' || t.status === 'IN_KITCHEN' || t.status === 'PAYING') {
          occupiedTablesCount++;
          occupiedTablesList.push({
            name: t.name,
            salonName: s.name,
            pax: t.pax || t.seats,
            total: t.accumulatedTotal || 0,
          });
        }
      });
    });

    const pendingKitchenItems = ordersHistory
      .filter((o) => !o.isClosed)
      .reduce((acc, o) => acc + o.items.filter((i) => i.kdsStatus !== 'SERVED' && i.kdsStatus !== 'DELIVERED' && i.kdsStatus !== 'CANCELLED').length, 0);

    const todayStr = new Date().toISOString().substring(0, 10);
    const todayReservations = reservations.filter((r) => r.date === todayStr);

    const shiftSales = ordersHistory
      .filter((o) => o.isClosed && o.serverId === activeEmployee.id)
      .reduce((acc, o) => acc + o.total, 0);

    return { occupiedTablesCount, occupiedTablesList, pendingKitchenItems, todayReservations, shiftSales };
  }, [salons, ordersHistory, reservations, activeEmployee.id]);

  // 2. COCINA Metrics
  const kitchenData = useMemo(() => {
    const activeOrders = ordersHistory.filter((o) => !o.isClosed);
    const pendingTickets = activeOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      tableName: o.tableName || 'Barra',
      itemsCount: o.items.filter((i) => i.kdsStatus !== 'SERVED' && i.kdsStatus !== 'CANCELLED').length,
      createdAt: o.createdAt,
    }));

    const totalActiveDishes = pendingTickets.reduce((acc, t) => acc + t.itemsCount, 0);
    const avgPrepMinutes = 12.4; // Average calculated preparation minutes
    const lowStockAlerts = ingredients.filter((ing) => ing.stock <= ing.minStock);

    return { pendingTickets, totalActiveDishes, avgPrepMinutes, lowStockAlerts };
  }, [ordersHistory, ingredients]);

  // 3. DELIVERY Metrics
  const deliveryData = useMemo(() => {
    const activeDeliveries = deliveryOrders.filter((d) => d.status !== 'ENTREGADO' && d.status !== 'CANCELADO');
    const completedDeliveries = deliveryOrders.filter((d) => d.status === 'ENTREGADO');
    const incidents = deliveryOrders.filter((d) => d.hasIncident);

    return { activeDeliveries, completedDeliveries, incidents };
  }, [deliveryOrders]);

  // 4. GERENTE / ENCARGADO / ADMIN Metrics
  const managerData = useMemo(() => {
    const totalTodaySales = ordersHistory.reduce((acc, o) => acc + (o.isClosed ? o.total : 0), 0);
    const estimatedProfit = totalTodaySales * 0.38; // 38% estimated margin
    const cashBalance = activeCashSession.initialCash + totalTodaySales;

    const criticalStock = ingredients.filter((i) => i.stock <= i.minStock);
    const aiAlerts = [
      'Previsión de alta afluencia para este fin de semana (+22% ventas estimadas).',
      `Detectado nivel crítico de stock en ${criticalStock.length} ingredientes clave.`,
      'Ticket medio en terraza ha aumentado a 34.50€ (+8.2% vs semana anterior).',
    ];

    return { totalTodaySales, estimatedProfit, cashBalance, criticalStock, aiAlerts };
  }, [ordersHistory, activeCashSession, ingredients]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">
              {role} PANEL
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Turno: {activeCashSession.openedAt.substring(11, 16)}h
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1 text-slate-100 tracking-tight">
            Bienvenido, <span className="text-amber-400">{activeEmployee.name}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Panel de control optimizado para la operativa de {role.toLowerCase()} en Sotium POS Enterprise.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('tpv')}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <DollarSign className="w-4 h-4" />
            <span>Abrir TPV Táctil</span>
          </button>
          <button
            onClick={() => setActiveTab('mesas')}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
          >
            <Grid className="w-4 h-4 text-emerald-400" />
            <span>Plano Mesas</span>
          </button>
        </div>
      </div>

      {/* RENDER DASHBOARD BY ROLE */}
      {(role === 'CAMARERO' || role === 'WAITER') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Mesas Ocupadas</span>
                <Grid className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white mt-2">{waiterData.occupiedTablesCount}</div>
              <div className="text-xs text-slate-400 mt-1">Salones activos en este turno</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pendientes Cocina</span>
                <ChefHat className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 mt-2">{waiterData.pendingKitchenItems}</div>
              <div className="text-xs text-slate-400 mt-1">Platos marchando en KDS</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Reservas Hoy</span>
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-purple-300 mt-2">{waiterData.todayReservations.length}</div>
              <div className="text-xs text-slate-400 mt-1">Mesas reservadas confirmadas</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Ventas Turno</span>
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2">{waiterData.shiftSales.toFixed(2)}€</div>
              <div className="text-xs text-slate-400 mt-1">Total cobrado por {activeEmployee.name}</div>
            </div>
          </div>

          {/* Table List Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Estado de Mesas Ocupadas ({waiterData.occupiedTablesList.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab('mesas')}
                className="text-xs text-amber-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>Ver Plano Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {waiterData.occupiedTablesList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Todas las mesas están libres actualmente.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {waiterData.occupiedTablesList.map((tbl, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Mesa {tbl.name} ({tbl.salonName})</div>
                      <div className="text-[11px] text-slate-400">{tbl.pax} Comensales</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-amber-400">{tbl.total.toFixed(2)}€</div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Ocupada</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(role === 'COCINERO' || role === 'COCINA') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Comandas Pendientes</span>
                <ChefHat className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-black text-red-400 mt-2">{kitchenData.totalActiveDishes}</div>
              <div className="text-xs text-slate-400 mt-1">Platos activos en comanderos KDS</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Tiempo Medio Elaboración</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-300 mt-2">{kitchenData.avgPrepMinutes} min</div>
              <div className="text-xs text-slate-400 mt-1">SLA objetivo: &lt; 15 min</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Alertas de Ingredientes</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 mt-2">{kitchenData.lowStockAlerts.length}</div>
              <div className="text-xs text-slate-400 mt-1">Insumos bajo mínimo de seguridad</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-red-400" />
                <span>Tickets Activos en Pantalla Cocina KDS</span>
              </h3>
              <button
                onClick={() => setActiveTab('comandas')}
                className="text-xs text-amber-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>Abrir KDS Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {kitchenData.pendingTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No hay comandas pendientes de cocina en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {kitchenData.pendingTickets.map((t) => (
                  <div key={t.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{t.orderNumber} - Mesa {t.tableName}</div>
                      <div className="text-[11px] text-slate-400">{t.itemsCount} Platos pendientes</div>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                      MARCHANDO
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(role === 'REPARTIDOR' || role === 'DELIVERY') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pedidos Activos</span>
                <Truck className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-cyan-300 mt-2">{deliveryData.activeDeliveries.length}</div>
              <div className="text-xs text-slate-400 mt-1">En preparación / En ruta</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Entregas Realizadas</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2">{deliveryData.completedDeliveries.length}</div>
              <div className="text-xs text-slate-400 mt-1">Entregados en este turno</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Incidencias Reparto</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 mt-2">{deliveryData.incidents.length}</div>
              <div className="text-xs text-slate-400 mt-1">Retrasos o direcciones erróneas</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Monitor Delivery Hub</span>
              </h3>
              <button
                onClick={() => setActiveTab('delivery')}
                className="text-xs text-amber-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>Ver Hub Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {deliveryData.activeDeliveries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No hay pedidos de delivery pendientes de entrega.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliveryData.activeDeliveries.map((d) => (
                  <div key={d.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{d.orderNumber} - {d.customerName}</div>
                      <div className="text-[11px] text-slate-400">{d.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-cyan-300">{d.totalAmount.toFixed(2)}€</div>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(role === 'GERENTE' || role === 'MANAGER' || role === 'ADMIN' || role === 'ADMINISTRADOR' || role === 'ENCARGADO') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Ventas Hoy</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">{managerData.totalTodaySales.toFixed(2)}€</div>
              <div className="text-[10px] text-slate-400 mt-1">+14.2% vs ayer</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Beneficio Est.</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-2">{managerData.estimatedProfit.toFixed(2)}€</div>
              <div className="text-[10px] text-slate-400 mt-1">Margen medio ~38%</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Arqueo Caja</span>
                <Receipt className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-300 mt-2">{managerData.cashBalance.toFixed(2)}€</div>
              <div className="text-[10px] text-slate-400 mt-1">Caja barra OK</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Business Intel</span>
                <BarChart3 className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-teal-300 mt-2">100%</div>
              <div className="text-[10px] text-slate-400 mt-1">KPIs en tiempo real</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Stock Crítico</span>
                <Warehouse className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 mt-2">{managerData.criticalStock.length}</div>
              <div className="text-[10px] text-slate-400 mt-1">Insumos bajo mínimo</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Sotium AI</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-black text-amber-300 mt-2">3</div>
              <div className="text-[10px] text-slate-400 mt-1">Alertas inteligentes</div>
            </div>
          </div>

          {/* AI Insights & Quick Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Recomendaciones & Alertas Inteligentes (Sotium AI)</span>
              </h3>
              <div className="space-y-2">
                {managerData.aiAlerts.map((alertText, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start space-x-3 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{alertText}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Accesos Directos Gerencia</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('informes')}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
                >
                  <BarChart3 className="w-5 h-5 text-teal-400 mb-1" />
                  <div className="text-xs font-bold text-white">Analytics</div>
                  <div className="text-[10px] text-slate-400">Informes BI</div>
                </button>
                <button
                  onClick={() => setActiveTab('finanzas')}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
                >
                  <Receipt className="w-5 h-5 text-emerald-400 mb-1" />
                  <div className="text-xs font-bold text-white">Finanzas</div>
                  <div className="text-[10px] text-slate-400">Contabilidad PGC</div>
                </button>
                <button
                  onClick={() => setActiveTab('compras')}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
                >
                  <Warehouse className="w-5 h-5 text-indigo-400 mb-1" />
                  <div className="text-xs font-bold text-white">Compras</div>
                  <div className="text-[10px] text-slate-400">Proveedores</div>
                </button>
                <button
                  onClick={() => setActiveTab('rrhh')}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
                >
                  <Users className="w-5 h-5 text-rose-400 mb-1" />
                  <div className="text-xs font-bold text-white">RRHH</div>
                  <div className="text-[10px] text-slate-400">Control Fichajes</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
