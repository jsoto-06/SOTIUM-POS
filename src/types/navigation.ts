import { ActiveTab, Employee } from './pos';

export type NavCategoryKey =
  | 'dashboard'
  | 'operaciones'
  | 'inventario'
  | 'finanzas'
  | 'personas'
  | 'inteligencia'
  | 'empresa'
  | 'sistema';

export interface NavModuleItem {
  id: ActiveTab;
  label: string;
  categoryKey: NavCategoryKey;
  iconName: string;
  badge?: number;
  description?: string;
  requiredRole?: string[]; // Allowed roles (if empty, accessible by all with general permission)
  requiredPermission?: string;
}

export interface NavCategory {
  key: NavCategoryKey;
  label: string;
  emoji: string;
  iconName: string;
  description: string;
  items: NavModuleItem[];
}

export interface GlobalSearchResult {
  id: string;
  type: 'MODULE' | 'CUSTOMER' | 'PRODUCT' | 'RESERVATION' | 'TABLE' | 'EMPLOYEE' | 'ORDER' | 'SUPPLIER' | 'INVOICE' | 'INTEGRATION';
  title: string;
  subtitle: string;
  badge?: string;
  targetTab: ActiveTab;
  payload?: any;
}

// Default Favorites per Role
export const DEFAULT_FAVORITES_BY_ROLE: Record<string, ActiveTab[]> = {
  CAMARERO: ['tpv', 'mesas', 'reservas', 'clientes'],
  COCINA: ['comandas', 'produccion', 'productos'],
  COCINERO: ['comandas', 'produccion', 'productos'],
  REPARTIDOR: ['delivery', 'tpv', 'mesas'],
  ENCARGADO: ['tpv', 'mesas', 'caja', 'compras', 'reservas'],
  GERENTE: ['dashboard', 'informes', 'finanzas', 'compras', 'rrhh', 'clientes'],
  MANAGER: ['dashboard', 'informes', 'finanzas', 'compras', 'rrhh', 'clientes'],
  ADMINISTRADOR: [
    'tpv', 'mesas', 'comandas', 'delivery', 'clientes', 'productos', 'produccion',
    'almacen', 'compras', 'caja', 'informes', 'dashboard', 'ia', 'reservas',
    'cumplimiento', 'rrhh', 'finanzas', 'multicompany', 'mantenimiento',
    'calidad', 'backoffice', 'integraciones', 'mobile', 'arquitectura'
  ],
  ADMIN: [
    'tpv', 'mesas', 'comandas', 'delivery', 'clientes', 'productos', 'produccion',
    'almacen', 'compras', 'caja', 'informes', 'dashboard', 'ia', 'reservas',
    'cumplimiento', 'rrhh', 'finanzas', 'multicompany', 'mantenimiento',
    'calidad', 'backoffice', 'integraciones', 'mobile', 'arquitectura'
  ],
};
