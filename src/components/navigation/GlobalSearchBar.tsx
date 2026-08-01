import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { usePOS } from '../../context/POSContext';
import { ActiveTab } from '../../types/pos';
import { GlobalSearchResult } from '../../types/navigation';
import {
  Search,
  X,
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
  User,
  ShoppingBag,
  FileText,
  MapPin,
  Tag,
} from 'lucide-react';

interface Props {
  onSelectTab?: (tab: ActiveTab) => void;
  className?: string;
}

export const GlobalSearchBar: React.FC<Props> = React.memo(({ onSelectTab, className = '' }) => {
  const {
    setActiveTab,
    customers,
    products,
    reservations,
    salons,
    employees,
    ordersHistory,
  } = usePOS();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const ALL_MODULES: { id: ActiveTab; title: string; subtitle: string; icon: React.ReactNode; keywords: string[] }[] = [
    { id: 'tpv', title: 'TPV Táctil', subtitle: 'Operaciones de Venta Directa y Cobro', icon: <Calculator className="w-4 h-4 text-amber-400" />, keywords: ['tpv', 'venta', 'cobro', 'ticket', 'caja', 'camarero'] },
    { id: 'mesas', title: 'Plano Mesas', subtitle: 'Gestión Visual de Salones y Comandero', icon: <Grid className="w-4 h-4 text-emerald-400" />, keywords: ['mesa', 'salon', 'comedor', 'terraza', 'pax', 'plano'] },
    { id: 'comandas', title: 'Cocina (KDS)', subtitle: 'Monitor KDS Pantalla de Cocina', icon: <ChefHat className="w-4 h-4 text-red-400" />, keywords: ['cocina', 'kds', 'comanda', 'plato', 'marcha'] },
    { id: 'delivery', title: 'Delivery Hub', subtitle: 'Agregadores Glovo, Uber Eats, Just Eat', icon: <Truck className="w-4 h-4 text-cyan-400" />, keywords: ['delivery', 'glovo', 'uber', 'reparto', 'takeaway'] },
    { id: 'reservas', title: 'Reservas', subtitle: 'Gestión de Reservas de Mesas y Libro', icon: <Calendar className="w-4 h-4 text-purple-400" />, keywords: ['reserva', 'libro', 'pax', 'cliente', 'turno'] },
    { id: 'productos', title: 'Productos', subtitle: 'Catálogo de Artículos y Tarifas', icon: <Package className="w-4 h-4 text-blue-400" />, keywords: ['producto', 'articulo', 'carta', 'precio', 'iva'] },
    { id: 'produccion', title: 'Producción & Lotes', subtitle: 'Ordenes de Elaboración y Lotes', icon: <ChefHat className="w-4 h-4 text-amber-300" />, keywords: ['produccion', 'lote', 'receta', 'elaboracion'] },
    { id: 'almacen', title: 'Almacén Enterprise', subtitle: 'Stock, Inventario y Multialmacén', icon: <Warehouse className="w-4 h-4 text-indigo-400" />, keywords: ['almacen', 'stock', 'inventario', 'merma', 'ingrediente'] },
    { id: 'compras', title: 'Compras', subtitle: 'Pedidos a Proveedores y Albaranes', icon: <Building2 className="w-4 h-4 text-amber-400" />, keywords: ['compras', 'proveedor', 'albaran', 'factura', 'pedido'] },
    { id: 'caja', title: 'Caja & Arqueo Z', subtitle: 'Cierre de Caja y Control de Efectivo', icon: <Receipt className="w-4 h-4 text-emerald-400" />, keywords: ['caja', 'arqueo', 'cierre', 'efectivo', 'descuadre'] },
    { id: 'informes', title: 'Informes & Analytics', subtitle: 'Business Intelligence y Ventas', icon: <BarChart3 className="w-4 h-4 text-teal-400" />, keywords: ['informes', 'bi', 'analytics', 'ventas', 'estadistica'] },
    { id: 'ia', title: 'Sotium AI', subtitle: 'Asistente IA Generativa de Hostelería', icon: <Sparkles className="w-4 h-4 text-amber-300" />, keywords: ['ia', 'asistente', 'sotium', 'gemini', 'prediccion'] },
    { id: 'clientes', title: 'Clientes CRM', subtitle: 'Base de Datos CRM y Fidelización', icon: <Users className="w-4 h-4 text-sky-400" />, keywords: ['cliente', 'crm', 'puntos', 'fidelizacion', 'descuento'] },
    { id: 'rrhh', title: 'RRHH & Fichajes', subtitle: 'Control Horario, Fichajes y Turnos', icon: <UserCheck className="w-4 h-4 text-rose-400" />, keywords: ['rrhh', 'fichaje', 'empleado', 'turno', 'nomina'] },
    { id: 'finanzas', title: 'Finanzas & PGC', subtitle: 'Contabilidad, Tesorería y Balance', icon: <Landmark className="w-4 h-4 text-emerald-300" />, keywords: ['finanzas', 'contabilidad', 'banco', 'asiento', 'pgc'] },
    { id: 'cumplimiento', title: 'VeriFactu España', subtitle: 'Normativa AEAT Ley Antifraude', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, keywords: ['verifactu', 'aeat', 'factura', 'fiscal', 'antifraude'] },
    { id: 'multicompany', title: 'Central Corporativa', subtitle: 'Grupo Multiempresa y Multisede', icon: <Globe className="w-4 h-4 text-amber-400" />, keywords: ['multiempresa', 'central', 'sede', 'corporativo', 'franquicia'] },
    { id: 'mantenimiento', title: 'Activos & SAT', subtitle: 'Mantenimiento Preventivo de Maquinaria', icon: <Wrench className="w-4 h-4 text-amber-400" />, keywords: ['sat', 'maquinaria', 'mantenimiento', 'incidencia'] },
    { id: 'calidad', title: 'Calidad APPCC', subtitle: 'Plan de Higiene y Registros Sanitarios', icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, keywords: ['appcc', 'haccp', 'sanidad', 'higiene', 'temperatura'] },
    { id: 'backoffice', title: 'BackOffice', subtitle: 'Configuración de Sistema y Parámetros', icon: <Settings className="w-4 h-4 text-slate-400" />, keywords: ['backoffice', 'configuracion', 'empresa', 'impresora', 'parametro'] },
    { id: 'integraciones', title: 'Integraciones', subtitle: 'Hub de Conexiones API Externa', icon: <Puzzle className="w-4 h-4 text-cyan-400" />, keywords: ['integracion', 'api', 'webhook', 'redsys', 'stripe'] },
    { id: 'mobile', title: 'Ecosistema Móvil', subtitle: 'Comandero App y Notificaciones', icon: <Smartphone className="w-4 h-4 text-amber-400" />, keywords: ['movil', 'app', 'comandero', 'tablet', 'push'] },
    { id: 'arquitectura', title: 'Arquitectura & Docs', subtitle: 'Documentación Técnica y Servidores', icon: <FileCode className="w-4 h-4 text-slate-400" />, keywords: ['docs', 'arquitectura', 'sqlite', 'postgres', 'docker'] },
  ];

  const searchResults = useMemo<GlobalSearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: GlobalSearchResult[] = [];

    // 1. Search Modules
    ALL_MODULES.forEach((mod) => {
      if (
        mod.title.toLowerCase().includes(q) ||
        mod.subtitle.toLowerCase().includes(q) ||
        mod.keywords.some((k) => k.includes(q))
      ) {
        results.push({
          id: `mod-${mod.id}`,
          type: 'MODULE',
          title: mod.title,
          subtitle: mod.subtitle,
          badge: 'Módulo',
          targetTab: mod.id,
        });
      }
    });

    // 2. Search Customers
    customers.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.nif.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      ) {
        results.push({
          id: `cust-${c.id}`,
          type: 'CUSTOMER',
          title: c.name,
          subtitle: `NIF: ${c.nif} | Tel: ${c.phone} | Puntos: ${c.points}`,
          badge: 'Cliente CRM',
          targetTab: 'clientes',
          payload: c,
        });
      }
    });

    // 3. Search Products
    products.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        (p.allergens && p.allergens.some((a) => a.toLowerCase().includes(q)))
      ) {
        results.push({
          id: `prod-${p.id}`,
          type: 'PRODUCT',
          title: p.name,
          subtitle: `PVP: ${p.price.toFixed(2)}€ | Stock: ${p.stock} | Código: ${p.barcode}`,
          badge: 'Producto',
          targetTab: 'productos',
          payload: p,
        });
      }
    });

    // 4. Search Reservations
    reservations.forEach((r) => {
      if (
        r.customerName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.tableName.toLowerCase().includes(q)
      ) {
        results.push({
          id: `res-${r.id}`,
          type: 'RESERVATION',
          title: `Reserva ${r.customerName}`,
          subtitle: `${r.date} a las ${r.time}h | ${r.pax} PAX | Mesa: ${r.tableName}`,
          badge: 'Reserva',
          targetTab: 'reservas',
          payload: r,
        });
      }
    });

    // 5. Search Tables
    salons.forEach((s) => {
      s.tables.forEach((t) => {
        if (t.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
          results.push({
            id: `tbl-${t.id}`,
            type: 'TABLE',
            title: `Mesa ${t.name} (${s.name})`,
            subtitle: `Capacidad: ${t.seats} PAX | Estado: ${t.status}`,
            badge: 'Mesa',
            targetTab: 'mesas',
            payload: t,
          });
        }
      });
    });

    // 6. Search Employees
    employees.forEach((e) => {
      if (e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) {
        results.push({
          id: `emp-${e.id}`,
          type: 'EMPLOYEE',
          title: e.name,
          subtitle: `Rol: ${e.role} | PIN: ${e.pin} | ${e.isClockedIn ? 'Fichado' : 'Fuera'}`,
          badge: 'Empleado',
          targetTab: 'rrhh',
          payload: e,
        });
      }
    });

    // 7. Search Orders / Invoices
    ordersHistory.forEach((o) => {
      if (
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q))
      ) {
        results.push({
          id: `ord-${o.id}`,
          type: 'ORDER',
          title: `Ticket/Factura ${o.orderNumber}`,
          subtitle: `Total: ${o.total.toFixed(2)}€ | Server: ${o.serverName} | ${o.createdAt.substring(0, 10)}`,
          badge: 'Ticket/Factura',
          targetTab: 'tpv',
          payload: o,
        });
      }
    });

    return results.slice(0, 12);
  }, [query, customers, products, reservations, salons, employees, ordersHistory]);

  const handleSelectResult = useCallback(
    (res: GlobalSearchResult) => {
      setActiveTab(res.targetTab);
      if (onSelectTab) onSelectTab(res.targetTab);
      setIsOpen(false);
      setQuery('');
    },
    [setActiveTab, onSelectTab]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className={`relative flex-1 max-w-md ${className}`}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar en Sotium POS (módulos, clientes, productos, facturas, mesas...)"
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto divide-y divide-slate-800">
          <div className="p-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50 rounded-t-xl flex justify-between">
            <span>Resultados de búsqueda global ({searchResults.length})</span>
            <span>Usa ↑↓ Enter</span>
          </div>
          {searchResults.map((res, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={res.id}
                onClick={() => handleSelectResult(res)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left p-2.5 flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-amber-500/15 border-l-4 border-amber-500 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                    {res.type === 'MODULE' && <Tag className="w-4 h-4 text-amber-400" />}
                    {res.type === 'CUSTOMER' && <User className="w-4 h-4 text-sky-400" />}
                    {res.type === 'PRODUCT' && <ShoppingBag className="w-4 h-4 text-blue-400" />}
                    {res.type === 'RESERVATION' && <Calendar className="w-4 h-4 text-purple-400" />}
                    {res.type === 'TABLE' && <MapPin className="w-4 h-4 text-emerald-400" />}
                    {res.type === 'EMPLOYEE' && <Users className="w-4 h-4 text-amber-300" />}
                    {res.type === 'ORDER' && <FileText className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-100 truncate">{res.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{res.subtitle}</div>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0 ml-2">
                  {res.badge}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
