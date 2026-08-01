import React, { useState } from 'react';
import { Search, ChevronRight, Settings } from 'lucide-react';
import { GlobalSearchItem } from '../../types/backoffice';

interface Props {
  onSelectTab: (tabId: string) => void;
}

const SEARCH_ITEMS: GlobalSearchItem[] = [
  { id: 's-1', title: 'Datos Fiscales & NIF / CIF', description: 'Razón social, dirección, NIF, certificado digital FNMT', tabId: 'empresa', path: 'Empresa > Fiscal', keywords: ['nif', 'cif', 'razon', 'empresa', 'direccion', 'certificado', 'verifactu'] },
  { id: 's-2', title: 'Series de Facturación TPV', description: 'Series de tickets, facturas ordinarias y rectificativas', tabId: 'hardware', path: 'TPV Hardware > Series', keywords: ['series', 'tickets', 'facturas', 'rectificativa', 'numeracion'] },
  { id: 's-3', title: 'Impresoras Térmicas ESC/POS', description: 'Configurar IPs, corte de papel y puertos de impresoras', tabId: 'hardware', path: 'TPV Hardware > Impresoras', keywords: ['impresora', 'esc/pos', 'cocina', 'bar', 'ip', 'puerto', 'corte'] },
  { id: 's-4', title: 'Cajón Portamonedas & Visores', description: 'Apertura automática de cajón RJ11 y pantalla de cliente', tabId: 'hardware', path: 'TPV Hardware > Dispositivos', keywords: ['cajon', 'portamonedas', 'visor', 'pantalla', 'kds', 'pda'] },
  { id: 's-5', title: 'Tipos Impositivos de IVA', description: 'Configurar IVA 10%, 21%, 4% y recargo de equivalencia', tabId: 'general', path: 'Config General > IVA', keywords: ['iva', 'impuestos', 'tasa', 'recargo', 'irpf'] },
  { id: 's-6', title: 'Familias & Categorías de Productos', description: 'Zonas de comandas y colores por familias', tabId: 'general', path: 'Config General > Familias', keywords: ['familias', 'categorias', 'subcategorias', 'platos'] },
  { id: 's-7', title: 'Formas de Pago & Bancos', description: 'Efectivo, Tarjeta, Bizum, Cuentas IBAN', tabId: 'general', path: 'Config General > Pagos', keywords: ['pago', 'efectivo', 'tarjeta', 'bizum', 'banco', 'iban'] },
  { id: 's-8', title: 'Usuarios Administradores & PINs', description: 'Gestión de cuentas, reseteo de contraseñas y bloqueos', tabId: 'usuarios', path: 'Usuarios & Seguridad > Usuarios', keywords: ['usuario', 'admin', 'pin', 'contraseña', 'bloqueo', 'login'] },
  { id: 's-9', title: 'Roles RBAC & Permisos Granulares', description: 'Creación de roles y asignación de permisos', tabId: 'usuarios', path: 'Usuarios & Seguridad > Roles', keywords: ['rol', 'rbac', 'permiso', 'acceso', 'superadmin', 'manager'] },
  { id: 's-10', title: 'Directivas de Seguridad & 2FA', description: 'Longitud de clave, timeout de sesión y 2FA obligatorio', tabId: 'usuarios', path: 'Usuarios & Seguridad > Directivas', keywords: ['seguridad', '2fa', 'timeout', 'sesion', 'politica'] },
  { id: 's-11', title: 'Registros de Auditoría Inmutable', description: 'Historial completo de quien hizo qué y diffs', tabId: 'auditoria', path: 'Auditoría > Registros', keywords: ['auditoria', 'audit', 'historial', 'trazabilidad', 'quien'] },
  { id: 's-12', title: 'Consola de Logs del Sistema & API', description: 'Logs de errores, PostgreSQL, SQLite y Gemini IA', tabId: 'logs', path: 'Logs > Telemetría', keywords: ['logs', 'consola', 'error', 'api', 'sqlite', 'postgres'] },
  { id: 's-13', title: 'Copias de Seguridad (Backups)', description: 'Backups manuales, programados y restauración', tabId: 'backups', path: 'Backups > Copias', keywords: ['backup', 'copia', 'seguridad', 'restaurar', 'cifrado'] },
  { id: 's-14', title: 'Diagnóstico de Sincronización', description: 'Estado de cola SQLite ↔ PostgreSQL Cloud', tabId: 'sincronizacion', path: 'Sincronización > Diagnóstico', keywords: ['sync', 'sincronizacion', 'sqlite', 'postgres', 'cola', 'offline'] },
  { id: 's-15', title: 'Clave de Licencia Enterprise', description: 'Activación de módulos y caducidad', tabId: 'licencia', path: 'Licencia > Activación', keywords: ['licencia', 'activar', 'modulos', 'caducidad', 'enterprise'] },
  { id: 's-16', title: 'Reglas de Notificaciones & Alertas', description: 'Alertas por correo, SMS o pantalla por incidencias', tabId: 'notificaciones', path: 'Notificaciones > Reglas', keywords: ['notificacion', 'alerta', 'email', 'sms', 'aviso'] },
  { id: 's-17', title: 'Auditoría IA Gemini Config Advisor', description: 'Diagnóstico inteligente de riesgos y auto-fix', tabId: 'ia_advisor', path: 'IA Advisor > Diagnóstico', keywords: ['ia', 'gemini', 'advisor', 'auditoria ia', 'autofix', 'salud'] },
  { id: 's-18', title: 'Importación & Exportación JSON/CSV', description: 'Exportar o importar configuraciones globales', tabId: 'import_export', path: 'Import / Export > JSON', keywords: ['importar', 'exportar', 'json', 'csv', 'excel', 'migrar'] },
];

export const SettingsSearchModal: React.FC<Props> = ({ onSelectTab }) => {
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? SEARCH_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q))
        );
      })
    : SEARCH_ITEMS.slice(0, 6);

  return (
    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-3">
      <div className="relative">
        <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscador Inteligente de Parámetros ERP (ej: 'IVA', 'Impresora', '2FA', 'VeriFactu', 'Backup')..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
        />
      </div>

      {query && results.length === 0 && (
        <div className="text-xs text-slate-400 p-3 text-center">
          No se encontraron ajustes con &quot;{query}&quot;.
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.tabId)}
              className="p-2.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.path}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
