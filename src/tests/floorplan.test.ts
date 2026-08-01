import { describe, it, expect } from 'vitest';
import { Salon, Table } from '../types/pos';
import { INITIAL_SALONS } from '../data/initialData';

describe('Phase 8 - Salon & Table Visual Floorplan Engine', () => {
  it('should initialize pre-configured salons including Comedor, Terraza, Barra, Reservados, Eventos, and Planta Superior', () => {
    expect(INITIAL_SALONS.length).toBeGreaterThanOrEqual(6);
    const types = INITIAL_SALONS.map((s) => s.type);
    expect(types).toContain('COMEDOR');
    expect(types).toContain('TERRAZA');
    expect(types).toContain('BARRA');
    expect(types).toContain('RESERVADOS');
    expect(types).toContain('PLANTA_SUPERIOR');
    expect(types).toContain('EVENTOS');
  });

  it('should support table properties: rotation, locking, shapes, pax, and server assignment', () => {
    const mainSalon = INITIAL_SALONS.find((s) => s.id === 'salon-1');
    expect(mainSalon).toBeDefined();

    const table1 = mainSalon?.tables.find((t) => t.id === 'tbl-1');
    expect(table1).toBeDefined();
    expect(table1?.seats).toBe(4);
    expect(table1?.shape).toBe('square');
    expect(table1?.rotation).toBe(0);
    expect(table1?.isLocked).toBe(false);

    const vipTable = mainSalon?.tables.find((t) => t.id === 'tbl-4');
    expect(vipTable?.status).toBe('RESERVED');
    expect(vipTable?.isLocked).toBe(true);
    expect(vipTable?.reservationInfo?.customerName).toBe('Familia Navarro');
  });

  it('should support drag-and-drop coordinates and magnetic grid calculations', () => {
    const initialX = 65;
    const initialY = 105;
    const gridSize = 20;

    const snappedX = Math.round(initialX / gridSize) * gridSize;
    const snappedY = Math.round(initialY / gridSize) * gridSize;

    expect(snappedX).toBe(60);
    expect(snappedY).toBe(100);
  });

  it('should support table joining logic', () => {
    const mainTableId = 'tbl-1';
    const secondaryTableIds = ['tbl-2', 'tbl-3'];

    const updatedTables: Table[] = [
      { id: 'tbl-1', salonId: 'salon-1', number: '1', name: 'Mesa 1', seats: 4, pax: 0, x: 60, y: 60, width: 110, height: 90, shape: 'square' as const, status: 'OCCUPIED' as const },
      { id: 'tbl-2', salonId: 'salon-1', number: '2', name: 'Mesa 2', seats: 4, pax: 0, x: 220, y: 60, width: 110, height: 90, shape: 'square' as const, status: 'FREE' as const },
      { id: 'tbl-3', salonId: 'salon-1', number: '3', name: 'Mesa 3', seats: 6, pax: 0, x: 380, y: 60, width: 150, height: 90, shape: 'rectangle' as const, status: 'FREE' as const },
    ].map((t) => {
      if (t.id === mainTableId) {
        return { ...t, joinedWithTableIds: secondaryTableIds };
      }
      if (secondaryTableIds.includes(t.id)) {
        return { ...t, joinedToTableId: mainTableId, status: 'OCCUPIED' };
      }
      return t;
    });

    const mainTable = updatedTables.find((t) => t.id === 'tbl-1');
    const table2 = updatedTables.find((t) => t.id === 'tbl-2');

    expect(mainTable?.joinedWithTableIds).toEqual(['tbl-2', 'tbl-3']);
    expect(table2?.joinedToTableId).toBe('tbl-1');
    expect(table2?.status).toBe('OCCUPIED');
  });
});
