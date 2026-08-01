import { describe, it, expect } from 'vitest';
import { DEFAULT_FAVORITES_BY_ROLE } from '../types/navigation';

describe('FASE 26.8 - Rediseño UX/UI Enterprise Sotium POS Tests', () => {
  it('1. Debe definir los favoritos por defecto correctos para cada rol', () => {
    expect(DEFAULT_FAVORITES_BY_ROLE.CAMARERO).toEqual(['tpv', 'mesas', 'reservas', 'clientes']);
    expect(DEFAULT_FAVORITES_BY_ROLE.COCINA).toEqual(['comandas', 'produccion', 'productos']);
    expect(DEFAULT_FAVORITES_BY_ROLE.REPARTIDOR).toEqual(['delivery', 'tpv', 'mesas']);
    expect(DEFAULT_FAVORITES_BY_ROLE.ENCARGADO).toEqual(['tpv', 'mesas', 'caja', 'compras', 'reservas']);
    expect(DEFAULT_FAVORITES_BY_ROLE.GERENTE).toEqual(['dashboard', 'informes', 'finanzas', 'compras', 'rrhh', 'clientes']);
    expect(DEFAULT_FAVORITES_BY_ROLE.ADMINISTRADOR.length).toBeGreaterThan(10);
  });

  it('2. Debe verificar que las categorías enterprise cubren todos los módulos requeridos', () => {
    const requiredModules = [
      'dashboard', 'tpv', 'mesas', 'comandas', 'delivery', 'reservas',
      'productos', 'produccion', 'almacen', 'compras', 'caja', 'finanzas',
      'cumplimiento', 'clientes', 'rrhh', 'informes', 'ia', 'multicompany',
      'mantenimiento', 'calidad', 'backoffice', 'integraciones', 'mobile', 'arquitectura'
    ];

    const adminFavs = DEFAULT_FAVORITES_BY_ROLE.ADMINISTRADOR;
    requiredModules.forEach((mod) => {
      expect(adminFavs).toContain(mod);
    });
  });

  it('3. Debe verificar el filtrado de permisos según el rol activo', () => {
    const waiterRole = 'CAMARERO';
    const waiterFavs = DEFAULT_FAVORITES_BY_ROLE[waiterRole];
    expect(waiterFavs).not.toContain('backoffice');
    expect(waiterFavs).not.toContain('finanzas');
    expect(waiterFavs).not.toContain('multicompany');
  });
});
