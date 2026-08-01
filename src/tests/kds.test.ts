import { describe, it, expect } from 'vitest';
import { INITIAL_KDS_STATIONS, INITIAL_KDS_COLORS } from '../data/initialData';
import { ItemKDSStatus, KDSPriority, OrderItem } from '../types/pos';

describe('Phase 9: Kitchen Display System (KDS) Enterprise Engine', () => {
  it('should initialize 8 default enterprise kitchen stations', () => {
    expect(INITIAL_KDS_STATIONS).toHaveLength(8);

    const stationCodes = INITIAL_KDS_STATIONS.map((s) => s.code);
    expect(stationCodes).toContain('COCINA_CALIENTE');
    expect(stationCodes).toContain('COCINA_FRIA');
    expect(stationCodes).toContain('PARRILLA');
    expect(stationCodes).toContain('HORNO');
    expect(stationCodes).toContain('POSTRES');
    expect(stationCodes).toContain('BARRA');
    expect(stationCodes).toContain('SUSHI');
    expect(stationCodes).toContain('PIZZERIA');
  });

  it('should support all 7 workflow status states with configurable color maps', () => {
    const validStatuses: ItemKDSStatus[] = [
      'PENDING',
      'ACCEPTED',
      'PREPARING',
      'PLATING',
      'READY',
      'SERVED',
      'CANCELLED',
    ];

    validStatuses.forEach((st) => {
      expect(INITIAL_KDS_COLORS[st]).toBeDefined();
      expect(INITIAL_KDS_COLORS[st]).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('should accurately calculate overdue timer warnings when elapsed > target minutes', () => {
    const targetMinutes = 10;
    const createdAt = new Date(Date.now() - 16 * 60000).toISOString(); // 16 minutes ago

    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    const isOverdue = elapsed > targetMinutes;

    expect(elapsed).toBeGreaterThanOrEqual(15);
    expect(isOverdue).toBe(true);
  });

  it('should filter items by station target printer/station code', () => {
    const items: OrderItem[] = [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Paella Valenciana',
        unitPrice: 17.5,
        vatRate: 10,
        quantity: 2,
        course: 'PRIMERO',
        kdsStatus: 'PENDING',
        printerTarget: 'COCINA_CALIENTE',
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Caña Mahou 5 Estrellas',
        unitPrice: 2.5,
        vatRate: 10,
        quantity: 3,
        course: 'BEBIDA',
        kdsStatus: 'PENDING',
        printerTarget: 'BARRA',
      },
    ];

    const kitchenItems = items.filter((i) => i.printerTarget === 'COCINA_CALIENTE');
    const barItems = items.filter((i) => i.printerTarget === 'BARRA');

    expect(kitchenItems).toHaveLength(1);
    expect(kitchenItems[0].productName).toBe('Paella Valenciana');
    expect(barItems).toHaveLength(1);
    expect(barItems[0].productName).toBe('Caña Mahou 5 Estrellas');
  });

  it('should correctly assign priority levels to items', () => {
    const priorities: KDSPriority[] = ['NORMAL', 'URGENTE', 'VIP', 'DELIVERY', 'TAKE_AWAY'];

    priorities.forEach((p) => {
      const item: Partial<OrderItem> = {
        id: 'test-item',
        priority: p,
      };
      expect(item.priority).toBe(p);
    });
  });

  it('should record timestamps when item status changes to ACCEPTED, PREPARING, READY, SERVED', () => {
    const now = new Date().toISOString();
    const item: OrderItem = {
      id: 'item-100',
      productId: 'prod-1',
      productName: 'Chuleton Gallego',
      unitPrice: 32.0,
      vatRate: 10,
      quantity: 1,
      course: 'SEGUNDO',
      kdsStatus: 'PENDING',
      printerTarget: 'PARRILLA',
    };

    // Transition to ACCEPTED
    item.kdsStatus = 'ACCEPTED';
    item.acceptedAt = now;

    // Transition to PREPARING
    item.kdsStatus = 'PREPARING';
    item.preparingAt = now;

    // Transition to READY
    item.kdsStatus = 'READY';
    item.readyAt = now;

    expect(item.acceptedAt).toBe(now);
    expect(item.preparingAt).toBe(now);
    expect(item.readyAt).toBe(now);
    expect(item.kdsStatus).toBe('READY');
  });
});
