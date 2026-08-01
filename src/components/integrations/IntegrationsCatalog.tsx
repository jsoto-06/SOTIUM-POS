import React, { useState, useMemo, useCallback } from 'react';
import {
  IntegrationConnector,
  IntegrationCategory,
} from '../../types/integration';
import {
  Truck,
  CreditCard,
  Receipt,
  Building2,
  Megaphone,
  Calendar,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Zap,
  Check,
  Search,
} from 'lucide-react';

interface IntegrationsCatalogProps {
  connectors: IntegrationConnector[];
  onToggle: (id: string) => void;
  onUpdateConfig: (id: string, config: Record<string, any>) => void;
  onTestConnection: (id: string) => void;
}

export const IntegrationsCatalog: React.FC<IntegrationsCatalogProps> = ({
  connectors,
  onToggle,
  onUpdateConfig,
  onTestConnection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingConnector, setEditingConnector] = useState<IntegrationConnector | null>(null);
  const [configJson, setConfigJson] = useState<string>('');
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const categories: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'TODOS', label: 'Todos', icon: <Zap className="w-4 h-4" /> },
    { key: 'DELIVERY', label: 'Delivery & TakeAway', icon: <Truck className="w-4 h-4 text-amber-400" /> },
    { key: 'PAGOS', label: 'Pasarelas Pago', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
    { key: 'FACTURACION', label: 'Facturación & AEAT', icon: <Receipt className="w-4 h-4 text-cyan-400" /> },
    { key: 'CONTABILIDAD', label: 'Contabilidad ERP', icon: <Building2 className="w-4 h-4 text-purple-400" /> },
    { key: 'MARKETING', label: 'Marketing & CRM', icon: <Megaphone className="w-4 h-4 text-rose-400" /> },
    { key: 'CALENDARIOS', label: 'Calendarios & Turnos', icon: <Calendar className="w-4 h-4 text-blue-400" /> },
    { key: 'AUTENTICACION', label: 'Auth & SSO', icon: <Key className="w-4 h-4 text-amber-300" /> },
  ];

  const filteredConnectors = useMemo(() => {
    return connectors.filter((c) => {
      if (selectedCategory !== 'TODOS' && c.category !== selectedCategory) return false;
      if (statusFilter === 'CONNECTED' && c.status !== 'CONNECTED') return false;
      if (statusFilter === 'DISCONNECTED' && c.status !== 'DISCONNECTED') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.supportedFeatures.some((f) => f.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [connectors, selectedCategory, statusFilter, searchQuery]);

  const handleOpenConfig = useCallback((c: IntegrationConnector) => {
    setEditingConnector(c);
    setConfigJson(JSON.stringify(c.config, null, 2));
  }, []);

  const handleSaveConfig = useCallback(() => {
    if (!editingConnector) return;
    try {
      const parsed = JSON.parse(configJson);
      onUpdateConfig(editingConnector.id, parsed);
      setEditingConnector(null);
    } catch {
      alert('Error en el formato JSON de la configuración');
    }
  }, [editingConnector, configJson, onUpdateConfig]);

  const handleTest = useCallback(
    (id: string) => {
      const res = onTestConnection(id);
      // handled externally or feedback shown
    },
    [onTestConnection]
  );

  const getCategoryIcon = (cat: IntegrationCategory) => {
    switch (cat) {
      case 'DELIVERY':
        return <Truck className="w-5 h-5 text-amber-400" />;
      case 'PAGOS':
        return <CreditCard className="w-5 h-5 text-emerald-400" />;
      case 'FACTURACION':
        return <Receipt className="w-5 h-5 text-cyan-400" />;
      case 'CONTABILIDAD':
        return <Building2 className="w-5 h-5 text-purple-400" />;
      case 'MARKETING':
        return <Megaphone className="w-5 h-5 text-rose-400" />;
      case 'CALENDARIOS':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'AUTENTICACION':
        return <Key className="w-5 h-5 text-amber-300" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
        {/* Category Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar conector, API..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="CONNECTED">Conectados</option>
            <option value="DISCONNECTED">Desconectados</option>
          </select>
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConnectors.map((connector) => (
          <div
            key={connector.id}
            className={`bg-slate-900/80 border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-700 shadow-lg ${
              connector.enabled ? 'border-slate-800' : 'border-slate-800/50 opacity-75'
            }`}
          >
            <div>
              {/* Header: Icon, Name & Status Switch */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {getCategoryIcon(connector.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{connector.name}</span>
                      {connector.isCustom && (
                        <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                          CUSTOM
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span className="font-mono">{connector.code}</span>
                      <span>•</span>
                      <span>{connector.authType}</span>
                      <span>•</span>
                      <span className="text-slate-500">{connector.version}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => onToggle(connector.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    connector.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  title={connector.enabled ? 'Desactivar conector' : 'Activar conector'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      connector.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{connector.description}</p>

              {/* Supported Features Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {connector.supportedFeatures.map((feat, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                    ✓ {feat}
                  </span>
                ))}
              </div>

              {/* Health Score & Stats */}
              {connector.enabled && (
                <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Salud de Conexión</span>
                    <span
                      className={`font-mono font-bold ${
                        connector.healthScore >= 90
                          ? 'text-emerald-400'
                          : connector.healthScore >= 70
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {connector.healthScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        connector.healthScore >= 90
                          ? 'bg-emerald-500'
                          : connector.healthScore >= 70
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${connector.healthScore}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500">Peticiones Total:</span>
                      <p className="font-mono text-white font-medium">{connector.totalRequestsCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Tasa Éxito:</span>
                      <p className="font-mono text-emerald-400 font-medium">{connector.successRatePercentage}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
              <button
                onClick={() => onTestConnection(connector.id)}
                disabled={!connector.enabled}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs py-1.5 px-3 rounded-lg transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Ping</span>
              </button>

              <button
                onClick={() => handleOpenConfig(connector)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs py-1.5 px-3 rounded-lg transition-all"
                title="Configuración API"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Config</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Config Modal */}
      {editingConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Configurar {editingConnector.name}</span>
              </h3>
              <button
                onClick={() => setEditingConnector(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Modifica los parámetros de integración (API Key, Webhook Secrets, Endpoints, Store Identifiers) en formato JSON
              válido:
            </p>

            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-end space-x-3 mt-5">
              <button
                onClick={() => setEditingConnector(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-amber-500/20"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
