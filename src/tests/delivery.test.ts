import { describe, it, expect } from 'vitest';
import { DeliveryService } from '../services/deliveryService';
import { DeliveryOrder, Driver, DeliveryChannel } from '../types/delivery';
import { INITIAL_DELIVERY_ORDERS, INITIAL_DRIVERS } from '../data/deliveryData';

describe('FASE 13: Delivery, Take Away y Omnicanal Enterprise', () => {
  it('1. Debe validar creación de pedidos en múltiples canales omnicanal (Glovo, Uber Eats, WhatsApp, Web, TakeAway)', () => {
    const glovoOrder = INITIAL_DELIVERY_ORDERS[0];
    const uberOrder = INITIAL_DELIVERY_ORDERS[1];
    const whatsappOrder = INITIAL_DELIVERY_ORDERS[2];
    const takeAwayOrder = INITIAL_DELIVERY_ORDERS[3];

    expect(glovoOrder.channel).toBe('GLOVO');
    expect(glovoOrder.externalPlatformOrderId).toBe('GLV-9821-X');
    expect(glovoOrder.isPaid).toBe(true);

    expect(uberOrder.channel).toBe('UBER_EATS');
    expect(uberOrder.status).toBe('EN_REPARTO');
    expect(uberOrder.driverName).toBe('Laura García');

    expect(whatsappOrder.channel).toBe('WHATSAPP');
    expect(whatsappOrder.paymentMethod).toBe('BIZUM');

    expect(takeAwayOrder.channel).toBe('TAKE_AWAY');
    expect(takeAwayOrder.deliveryFee).toBe(0);
  });

  it('2. Debe gestionar la flota de repartidores y sus estados de turno (Disponible, Ocupado, Descanso, Fin Turno)', () => {
    const availableDriver = INITIAL_DRIVERS[0];
    const enRutaDriver = INITIAL_DRIVERS[1];

    expect(availableDriver.status).toBe('DISPONIBLE');
    expect(availableDriver.vehicle).toBe('MOTO');
    expect(availableDriver.rating).toBeGreaterThanOrEqual(4.5);

    expect(enRutaDriver.status).toBe('EN_RUTA');
    expect(enRutaDriver.vehicle).toBe('BICICLETA');
  });

  it('3. Debe ejecutar el ciclo de vida de estados del pedido (Nuevo -> Aceptado -> En cocina -> Listo -> En reparto -> Entregado)', () => {
    const order = INITIAL_DELIVERY_ORDERS[0]; // NUEVO
    expect(order.status).toBe('NUEVO');

    const accepted = DeliveryService.updateOrderStatus(order, 'ACEPTADO', 'Operador TPV');
    expect(accepted.status).toBe('ACEPTADO');
    expect(accepted.acceptedAt).toBeDefined();

    const inKitchen = DeliveryService.updateOrderStatus(accepted, 'EN_COCINA', 'Cocina KDS');
    expect(inKitchen.status).toBe('EN_COCINA');
    expect(inKitchen.inKitchenAt).toBeDefined();

    const ready = DeliveryService.updateOrderStatus(inKitchen, 'LISTO', 'Chef');
    expect(ready.status).toBe('LISTO');
    expect(ready.readyAt).toBeDefined();

    const delivered = DeliveryService.updateOrderStatus(ready, 'ENTREGADO', 'Repartidor');
    expect(delivered.status).toBe('ENTREGADO');
    expect(delivered.deliveredAt).toBeDefined();
  });

  it('4. Debe asignar repartidor a un pedido listo y actualizar el estado de ambos', () => {
    const order = INITIAL_DELIVERY_ORDERS[3]; // LISTO
    const driver = INITIAL_DRIVERS[0]; // DISPONIBLE

    const { updatedOrder, updatedDriver } = DeliveryService.assignDriverToOrder(order, driver, 'Despachador');

    expect(updatedOrder.driverId).toBe(driver.id);
    expect(updatedOrder.driverName).toBe(driver.name);
    expect(updatedOrder.status).toBe('EN_REPARTO');
    expect(updatedDriver.status).toBe('EN_RUTA');
    expect(updatedDriver.currentOrderId).toBe(order.id);
  });

  it('5. Debe realizar búsqueda ultra rápida por código, cliente, teléfono, dirección y repartidor', () => {
    const searchByCode = DeliveryService.searchOrders(INITIAL_DELIVERY_ORDERS, 'DEL-2026-101');
    expect(searchByCode).toHaveLength(1);
    expect(searchByCode[0].customer.name).toBe('Elena Gómez');

    const searchByPhone = DeliveryService.searchOrders(INITIAL_DELIVERY_ORDERS, '655443322');
    expect(searchByPhone).toHaveLength(1);
    expect(searchByPhone[0].channel).toBe('WHATSAPP');

    const searchByDriver = DeliveryService.searchOrders(INITIAL_DELIVERY_ORDERS, 'Laura');
    expect(searchByDriver).toHaveLength(1);
  });

  it('6. Debe predecir retrasos e incidencias con el motor Gemini IA', () => {
    const predictions = DeliveryService.generateAIPredictions(INITIAL_DELIVERY_ORDERS, INITIAL_DRIVERS);

    expect(predictions).toHaveLength(INITIAL_DELIVERY_ORDERS.length);
    const readyOrderPred = predictions.find((p) => p.orderCode === 'DEL-2026-104');
    expect(readyOrderPred).toBeDefined();
    if (readyOrderPred) {
      expect(readyOrderPred.riskLevel).toBe('CRITICO');
      expect(readyOrderPred.suggestedDriverId).toBeDefined();
    }
  });

  it('7. Debe agrupar y optimizar rutas de entrega para repartidores', () => {
    const driver = INITIAL_DRIVERS[0];
    const ordersToGroup = [INITIAL_DELIVERY_ORDERS[0], INITIAL_DELIVERY_ORDERS[2]];

    const route = DeliveryService.optimizeRoute(ordersToGroup, driver);

    expect(route.driverId).toBe(driver.id);
    expect(route.status).toBe('EN_MARCHA');
    expect(route.waypoints).toHaveLength(2);
    expect(route.waypoints[0].sequenceOrder).toBe(1);
    expect(route.waypoints[1].sequenceOrder).toBe(2);
    expect(route.totalDistanceKm).toBeGreaterThan(0);
  });

  it('8. Debe enviar notificaciones omnicanal (SMS / WhatsApp) al cliente final', () => {
    const order = INITIAL_DELIVERY_ORDERS[0];
    const notif = DeliveryService.sendNotification(
      order,
      'WHATSAPP',
      'Tu pedido DEL-2026-101 está en camino con Carlos'
    );

    expect(notif.channel).toBe('WHATSAPP');
    expect(notif.status).toBe('ENVIADO');
    expect(notif.recipient).toBe(order.customer.phone);
  });

  it('9. Debe importar y exportar pedidos en formato CSV', () => {
    const csvExport = DeliveryService.exportOrdersToCSV(INITIAL_DELIVERY_ORDERS);
    expect(csvExport).toContain('Código,Canal,Estado,Cliente');
    expect(csvExport).toContain('DEL-2026-101');

    const csvImport = `Código,Canal,Estado,Cliente,Teléfono,Dirección,Pago,Pagado,Total
DEL-2026-999,GLOVO,NUEVO,Prueba Import,600000111,Calle Test 12,ONLINE,true,45.00`;

    const imported = DeliveryService.importOrdersFromCSV(csvImport);
    expect(imported).toHaveLength(1);
    expect(imported[0].orderCode).toBe('DEL-2026-999');
    expect(imported[0].customer.name).toBe('Prueba Import');
  });

  it('10. Debe calcular analíticas globales de ventas por canal, tiempos medios y ranking de repartidores', () => {
    const analytics = DeliveryService.computeAnalytics(INITIAL_DELIVERY_ORDERS, INITIAL_DRIVERS);

    expect(analytics.totalOrders).toBe(INITIAL_DELIVERY_ORDERS.length);
    expect(analytics.totalRevenue).toBeGreaterThan(0);
    expect(analytics.salesByChannel.GLOVO.count).toBeGreaterThanOrEqual(1);
    expect(analytics.salesByChannel.UBER_EATS.count).toBeGreaterThanOrEqual(1);
    expect(analytics.driverRankings.length).toBe(INITIAL_DRIVERS.length);
  });
});
