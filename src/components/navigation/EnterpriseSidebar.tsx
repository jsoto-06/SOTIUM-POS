import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePOS } from '../../context/POSContext';
import { ActiveTab } from '../../types/pos';
import { NavCategory, NavCategoryKey, NavModuleItem, DEFAULT_FAVORITES_BY_ROLE } from '../../types/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  ArrowUp,
  ArrowDown,
  Calculator,
  Grid,
  ChefHat,
  Truck,
  Users,
  Package,
  Warehouse,
  Building2,
  Receipt,
  BarChart3,
  Sparkles,
  Calendar,
  ShieldCheck,
  UserCheck,
  Landmark,
  Globe,
  Wrench,
  ShieldAlert,
  Settings,
  Puzzle,
  Smartphone,
  FileCode,
  LayoutDashboard,
} from 'lucide-react';

interface Props {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const STORAGE_KEY_FAVORITES = 'sotium_user_favorites_v2';
const STORAGE_KEY_COLLAPSED = 'sotium_sidebar_collapsed_v1';
const STORAGE_KEY_CATEGORY = 'sotium_sidebar_category_v1';

export const EnterpriseSidebar: React.FC<Props> = React.memo(({ isCollapsed, setIsCollapsed }) => {
  const { activeTab, setActiveTab, activeEmployee } = usePOS();

  // Load saved category or default to 'operaciones'
  const [expandedCategory, setExpandedCategory] = useState<NavCategoryKey>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedCat = localStorage.getItem(STORAGE_KEY_CATEGORY);
      if (savedCat) return savedCat as NavCategoryKey;
    }
    return 'operaciones';
  });

  // User favorites state
  const [userFavorites, setUserFavorites] = useState<ActiveTab[]>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedFavs = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (savedFavs) {
        try {
          return JSON.parse(savedFavs);
        } catch {
          // fallback
        }
      }
    }
    const roleKey = activeEmployee.role ? activeEmployee.role.toUpperCase() : 'CAMARERO';
    return DEFAULT_FAVORITES_BY_ROLE[roleKey] || DEFAULT_FAVORITES_BY_ROLE['CAMARERO'];
  });

  // Update default favorites when active employee role changes if user hasn't customized
  useEffect(() => {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORAGE_KEY_FAVORITES)) {
      const roleKey = activeEmployee.role ? activeEmployee.role.toUpperCase() : 'CAMARERO';
      const defs = DEFAULT_FAVORITES_BY_ROLE[roleKey] || DEFAULT_FAVORITES_BY_ROLE['CAMARERO'];
      setUserFavorites(defs);
    }
  }, [activeEmployee.role]);

  // Persist category changes
  const toggleCategory = useCallback((catKey: NavCategoryKey) => {
    setExpandedCategory((prev) => {
      const next = prev === catKey ? catKey : catKey;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CATEGORY, next);
      }
      return next;
    });
  }, []);

  // Save favorites
  const saveFavorites = (newFavs: ActiveTab[]) => {
    setUserFavorites(newFavs);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(newFavs));
    }
  };

  const toggleFavorite = (tabId: ActiveTab, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userFavorites.includes(tabId)) {
      saveFavorites(userFavorites.filter((id) => id !== tabId));
    } else {
      saveFavorites([...userFavorites, tabId]);
    }
  };

  const moveFavorite = (tabId: ActiveTab, direction: 'UP' | 'DOWN', e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = userFavorites.indexOf(tabId);
    if (idx === -1) return;
    const next = [...userFavorites];
    if (direction === 'UP' && idx > 0) {
      const temp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = temp;
    } else if (direction === 'DOWN' && idx < next.length - 1) {
      const temp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = temp;
    }
    saveFavorites(next);
  };

  // Check role authorization for modules
  const isModuleAuthorized = useCallback(
    (tabId: ActiveTab): boolean => {
      const role = activeEmployee.role ? activeEmployee.role.toUpperCase() : 'CAMARERO';

      if (role === 'ADMINISTRADOR' || role === 'ADMIN' || role === 'SUPERADMIN') return true;

      if (role === 'GERENTE' || role === 'MANAGER') {
        // Access to everything except raw low-level architecture if limited, but general access is allowed
        return true;
      }

      if (role === 'ENCARGADO') {
        const allowed: ActiveTab[] = [
          'tpv', 'mesas', 'comandas', 'delivery', 'reservas', 'productos',
          'produccion', 'almacen', 'compras', 'caja', 'clientes', 'rrhh',
          'informes', 'dashboard', 'ia', 'calidad', 'mantenimiento'
        ];
        return allowed.includes(tabId);
      }

      if (role === 'CAMARERO') {
        const allowed: ActiveTab[] = ['tpv', 'mesas', 'comandas', 'delivery', 'reservas', 'clientes', 'dashboard'];
        return allowed.includes(tabId);
      }

      if (role === 'COCINERO' || role === 'COCINA') {
        const allowed: ActiveTab[] = ['comandas', 'produccion', 'productos', 'almacen', 'calidad', 'dashboard'];
        return allowed.includes(tabId);
      }

      if (role === 'REPARTIDOR') {
        const allowed: ActiveTab[] = ['delivery', 'tpv', 'mesas', 'dashboard'];
        return allowed.includes(tabId);
      }

      return true;
    },
    [activeEmployee.role]
  );

  // Icon mapping helper
  const getModuleIcon = (id: ActiveTab) => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard className="w-4 h-4 text-amber-400" />;
      case 'tpv': return <Calculator className="w-4 h-4 text-amber-400" />;
      case 'mesas': return <Grid className="w-4 h-4 text-emerald-400" />;
      case 'comandas': return <ChefHat className="w-4 h-4 text-red-400" />;
      case 'delivery': return <Truck className="w-4 h-4 text-cyan-400" />;
      case 'reservas': return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'productos': return <Package className="w-4 h-4 text-blue-400" />;
      case 'produccion': return <ChefHat className="w-4 h-4 text-amber-300" />;
      case 'almacen': return <Warehouse className="w-4 h-4 text-indigo-400" />;
      case 'compras': return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'caja': return <Receipt className="w-4 h-4 text-emerald-400" />;
      case 'finanzas': return <Landmark className="w-4 h-4 text-emerald-300" />;
      case 'cumplimiento': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'clientes': return <Users className="w-4 h-4 text-sky-400" />;
      case 'rrhh': return <UserCheck className="w-4 h-4 text-rose-400" />;
      case 'informes': return <BarChart3 className="w-4 h-4 text-teal-400" />;
      case 'ia': return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'multicompany': return <Globe className="w-4 h-4 text-amber-400" />;
      case 'mantenimiento': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'calidad': return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'backoffice': return <Settings className="w-4 h-4 text-slate-400" />;
      case 'integraciones': return <Puzzle className="w-4 h-4 text-cyan-400" />;
      case 'mobile': return <Smartphone className="w-4 h-4 text-amber-400" />;
      case 'arquitectura': return <FileCode className="w-4 h-4 text-slate-400" />;
      default: return <Calculator className="w-4 h-4 text-amber-400" />;
    }
  };

  // Define Category Structure
  const categories = useMemo<NavCategory[]>(() => {
    return [
      {
        key: 'dashboard',
        label: 'Dashboard',
        emoji: '🏠',
        iconName: 'LayoutDashboard',
        description: 'Panel de Control General',
        items: [
          { id: 'dashboard', label: 'Dashboard Rol', categoryKey: 'dashboard', iconName: 'LayoutDashboard', description: 'Visión General' },
        ],
      },
      {
        key: 'operaciones',
        label: 'Operaciones',
        emoji: '🍽',
        iconName: 'Calculator',
        description: 'Gestión de Sala, TPV y Pedidos',
        items: [
          { id: 'tpv', label: 'TPV Táctil', categoryKey: 'operaciones', iconName: 'Calculator', description: 'Terminal de Venta' },
          { id: 'mesas', label: 'Plano Mesas', categoryKey: 'operaciones', iconName: 'Grid', description: 'Salones y Comandero' },
          { id: 'comandas', label: 'Cocina (KDS)', categoryKey: 'operaciones', iconName: 'ChefHat', description: 'Monitor KDS' },
          { id: 'delivery', label: 'Delivery Hub', categoryKey: 'operaciones', iconName: 'Truck', badge: 2, description: 'Agregadores Delivery' },
          { id: 'reservas', label: 'Reservas', categoryKey: 'operaciones', iconName: 'Calendar', description: 'Libro de Reservas' },
        ],
      },
      {
        key: 'inventario',
        label: 'Inventario',
        emoji: '📦',
        iconName: 'Package',
        description: 'Stock, Artículos y Compras',
        items: [
          { id: 'productos', label: 'Productos', categoryKey: 'inventario', iconName: 'Package', description: 'Catálogo de Artículos' },
          { id: 'produccion', label: 'Producción', categoryKey: 'inventario', iconName: 'ChefHat', description: 'Ordenes y Escandallos' },
          { id: 'almacen', label: 'Almacén', categoryKey: 'inventario', iconName: 'Warehouse', description: 'Stock e Insumos' },
          { id: 'compras', label: 'Compras', categoryKey: 'inventario', iconName: 'Building2', description: 'Proveedores y Pedidos' },
        ],
      },
      {
        key: 'finanzas',
        label: 'Finanzas',
        emoji: '💰',
        iconName: 'Landmark',
        description: 'Caja, Contabilidad y VeriFactu',
        items: [
          { id: 'caja', label: 'Caja', categoryKey: 'finanzas', iconName: 'Receipt', description: 'Arqueo Z y Cierre' },
          { id: 'finanzas', label: 'Finanzas', categoryKey: 'finanzas', iconName: 'Landmark', description: 'Contabilidad PGC' },
          { id: 'cumplimiento', label: 'VeriFactu', categoryKey: 'finanzas', iconName: 'ShieldCheck', description: 'Cumplimiento AEAT' },
        ],
      },
      {
        key: 'personas',
        label: 'Personas',
        emoji: '👥',
        iconName: 'Users',
        description: 'Clientes y Equipo de Trabajo',
        items: [
          { id: 'clientes', label: 'Clientes CRM', categoryKey: 'personas', iconName: 'Users', description: 'Fidelización y Datos' },
          { id: 'rrhh', label: 'RRHH', categoryKey: 'personas', iconName: 'UserCheck', description: 'Fichajes y Turnos' },
        ],
      },
      {
        key: 'inteligencia',
        label: 'Inteligencia',
        emoji: '📊',
        iconName: 'BarChart3',
        description: 'Business Intelligence e IA',
        items: [
          { id: 'informes', label: 'Business Intelligence', categoryKey: 'inteligencia', iconName: 'BarChart3', description: 'Informes Analytics' },
          { id: 'ia', label: 'Sotium AI', categoryKey: 'inteligencia', iconName: 'Sparkles', description: 'Asistente Virtual' },
        ],
      },
      {
        key: 'empresa',
        label: 'Empresa',
        emoji: '🏢',
        iconName: 'Globe',
        description: 'Corporativo, Activos y Calidad',
        items: [
          { id: 'multicompany', label: 'Central Corporativa', categoryKey: 'empresa', iconName: 'Globe', description: 'Multiempresa' },
          { id: 'mantenimiento', label: 'Activos', categoryKey: 'empresa', iconName: 'Wrench', description: 'Mantenimiento SAT' },
          { id: 'calidad', label: 'Calidad', categoryKey: 'empresa', iconName: 'ShieldAlert', description: 'Registros APPCC' },
        ],
      },
      {
        key: 'sistema',
        label: 'Sistema',
        emoji: '⚙',
        iconName: 'Settings',
        description: 'BackOffice y Configuración',
        items: [
          { id: 'backoffice', label: 'BackOffice', categoryKey: 'sistema', iconName: 'Settings', description: 'Configuración ERP' },
          { id: 'integraciones', label: 'Integraciones', categoryKey: 'sistema', iconName: 'Puzzle', description: 'Hub de APIs' },
          { id: 'mobile', label: 'Ecosistema móvil', categoryKey: 'sistema', iconName: 'Smartphone', description: 'Comandero App' },
          { id: 'arquitectura', label: 'Arquitectura', categoryKey: 'sistema', iconName: 'FileCode', description: 'Documentación Técnica' },
        ],
      },
    ];
  }, []);

  // Authorized categories and items
  const authorizedCategories = useMemo(() => {
    return categories
      .map((cat) => {
        const authorizedItems = cat.items.filter((item) => isModuleAuthorized(item.id));
        return {
          ...cat,
          items: authorizedItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categories, isModuleAuthorized]);

  // Authorized favorites
  const authorizedFavorites = useMemo(() => {
    return userFavorites.filter((id) => isModuleAuthorized(id));
  }, [userFavorites, isModuleAuthorized]);

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-white flex flex-col transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/60">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔥</span>
            <div>
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                SOTIUM POS
              </span>
              <span className="block text-[10px] text-slate-400 font-mono">ENTERPRISE NAV</span>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            setIsCollapsed((prev) => {
              const next = !prev;
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_COLLAPSED, String(next));
              }
              return next;
            });
          }}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all mx-auto"
          title={isCollapsed ? 'Expandir Menú' : 'Plegar Menú'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-amber-400" /> : <ChevronLeft className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 py-2 px-2 space-y-4">
        {/* Favoritos Section */}
        {authorizedFavorites.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Favoritos ({authorizedFavorites.length})</span>
                </span>
              </div>
            ) : (
              <div className="w-full text-center py-1 text-amber-400" title="Favoritos">
                <Star className="w-4 h-4 mx-auto fill-amber-400" />
              </div>
            )}

            <div className="space-y-0.5">
              {authorizedFavorites.map((favId, idx) => {
                const isActive = activeTab === favId;
                const moduleName = categories
                  .flatMap((c) => c.items)
                  .find((i) => i.id === favId)?.label || favId;

                return (
                  <div key={`fav-${favId}`} className="group relative flex items-center">
                    <button
                      onClick={() => setActiveTab(favId)}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={moduleName}
                    >
                      <span className="shrink-0">{getModuleIcon(favId)}</span>
                      {!isCollapsed && <span className="truncate flex-1 text-left">{moduleName}</span>}
                    </button>

                    {!isCollapsed && (
                      <div className="hidden group-hover:flex items-center space-x-1 absolute right-1">
                        <button
                          onClick={(e) => moveFavorite(favId, 'UP', e)}
                          disabled={idx === 0}
                          className="p-0.5 hover:text-amber-400 text-slate-500 disabled:opacity-20"
                          title="Subir"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => moveFavorite(favId, 'DOWN', e)}
                          disabled={idx === authorizedFavorites.length - 1}
                          className="p-0.5 hover:text-amber-400 text-slate-500 disabled:opacity-20"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(favId, e)}
                          className="p-0.5 text-amber-400 hover:text-red-400"
                          title="Quitar de favoritos"
                        >
                          <Star className="w-3 h-3 fill-amber-400" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-b border-slate-800/80 my-2"></div>
          </div>
        )}

        {/* Categories Section */}
        {authorizedCategories.map((cat) => {
          const isExpanded = expandedCategory === cat.key;
          const hasActiveChild = cat.items.some((i) => i.id === activeTab);

          return (
            <div key={cat.key} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.key)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  hasActiveChild
                    ? 'text-amber-300 bg-slate-800/80'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
                title={cat.label}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <span className="text-base shrink-0">{cat.emoji}</span>
                  {!isCollapsed && <span className="truncate">{cat.label}</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                      isExpanded ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                )}
              </button>

              {/* Module Items (If Expanded or Hover in Collapsed) */}
              {(isExpanded || isCollapsed) && (
                <div className={`space-y-0.5 ${!isCollapsed ? 'pl-3' : ''}`}>
                  {cat.items.map((item) => {
                    const isActive = activeTab === item.id;
                    const isFav = userFavorites.includes(item.id);

                    return (
                      <div key={item.id} className="group relative flex items-center">
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                          title={`${item.label} - ${item.description}`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <span className="shrink-0">{getModuleIcon(item.id)}</span>
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </div>

                          {!isCollapsed && item.badge ? (
                            <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full shrink-0">
                              {item.badge}
                            </span>
                          ) : null}
                        </button>

                        {!isCollapsed && (
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className={`opacity-0 group-hover:opacity-100 p-1 hover:text-amber-400 transition-opacity absolute right-1 ${
                              isFav ? 'text-amber-400' : 'text-slate-600'
                            }`}
                            title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                          >
                            <Star className={`w-3 h-3 ${isFav ? 'fill-amber-400' : ''}`} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Role Footer Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2.5">
            <img
              src={activeEmployee.photoUrl}
              alt={activeEmployee.name}
              className="w-7 h-7 rounded-full object-cover border border-amber-500"
            />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-200 truncate">{activeEmployee.name}</div>
              <div className="text-[10px] text-amber-400 font-mono uppercase">{activeEmployee.role}</div>
            </div>
          </div>
        ) : (
          <img
            src={activeEmployee.photoUrl}
            alt={activeEmployee.name}
            className="w-7 h-7 rounded-full object-cover border border-amber-500 mx-auto"
            title={`${activeEmployee.name} (${activeEmployee.role})`}
          />
        )}
      </div>
    </aside>
  );
});
