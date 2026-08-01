import React, { useState, useEffect, useCallback } from 'react';
import {
  IntegrationConnector,
  WebhookEndpoint,
  WebhookLog,
  OAuthTokenConnection,
  DLQItem,
  IntegrationCategory,
  GlobalIntegrationSearchItem,
} from '../types/integration';
import { integrationService } from '../services/integrationService';
import { integrationAIService } from '../services/integrationAIService';
import { IntegrationsCatalog } from './integrations/IntegrationsCatalog';
import { WebhookManagerTab } from './integrations/WebhookManagerTab';
import { DeadLetterQueueTab } from './integrations/DeadLetterQueueTab';
import { OAuthTokensTab } from './integrations/OAuthTokensTab';
import { IntegrationAIDiagnosticsTab } from './integrations/IntegrationAIDiagnosticsTab';
import { IntegrationsSearchModal } from './integrations/IntegrationsSearchModal';
import {
  Zap,
  Globe,
  ShieldAlert,
  Key,
  Sparkles,
  Search,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const IntegrationsModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'CATALOG' | 'WEBHOOKS' | 'DLQ' | 'OAUTH' | 'AI_DIAGNOSTICS'>('CATALOG');
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [oauthConnections, setOauthConnections] = useState<OAuthTokenConnection[]>([]);
  const [dlqItems, setDlqItems] = useState<DLQItem[]>([]);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  const reloadData = useCallback(() => {
    setConnectors(integrationService.getConnectors());
    setWebhooks(integrationService.getWebhooks());
    setWebhookLogs(integrationService.getWebhookLogs());
    setOauthConnections(integrationService.getOAuthConnections());
    setDlqItems(integrationService.getDLQItems());
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleToggleConnector = (id: string) => {
    integrationService.toggleConnector(id);
    reloadData();
  };

  const handleUpdateConfig = (id: string, config: Record<string, any>) => {
    integrationService.updateConnectorConfig(id, config);
    reloadData();
  };

  const handleTestConnection = (id: string) => {
    const res = integrationService.testConnectorConnection(id);
    alert(res.message);
    reloadData();
    return res;
  };

  const handleCreateWebhook = (data: any) => {
    integrationService.createWebhook(data);
    reloadData();
  };

  const handleTestDispatch = (webhookId: string, eventName: string, payload: any) => {
    integrationService.dispatchWebhookTest(webhookId, eventName, payload);
    reloadData();
  };

  const handleRefreshOAuth = (id: string) => {
    integrationService.refreshOAuthToken(id);
    reloadData();
  };

  const handleRevokeOAuth = (id: string) => {
    integrationService.revokeOAuthToken(id);
    reloadData();
  };

  const handleRetryDLQ = (id: string) => {
    integrationService.retryDLQItem(id);
    reloadData();
  };

  const handlePurgeDLQ = (id: string) => {
    integrationService.purgeDLQItem(id);
    reloadData();
  };

  const handleSyncAll = () => {
    const res = integrationService.triggerSyncAll();
    setSyncStatusMsg(`Sincronización masiva ejecutada: ${res.processedCount} conectores activos actualizados.`);
    setTimeout(() => setSyncStatusMsg(''), 4000);
    reloadData();
  };

  const handleExportJSON = () => {
    const jsonStr = integrationService.exportIntegrationsConfig();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sotium_integrations_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = integrationService.importIntegrationsConfig(content);
        alert(res.message);
        reloadData();
      }
    };
    reader.readAsText(file);
  };

  const handleRunAIAudit = async () => {
    return await integrationAIService.auditIntegrationsWithAI();
  };

  const handleGlobalSearch = (q: string): GlobalIntegrationSearchItem[] => {
    return integrationService.searchIntegrations(q);
  };

  const activeConnectorsCount = connectors.filter((c) => c.enabled).length;
  const pendingDlqCount = dlqItems.filter((d) => d.status === 'PENDING').length;

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white space-y-6">
      {/* Top Header & Telemetry Summary */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-extrabold text-white tracking-wide">Plataforma Enterprise de Integraciones</h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                FASE 24 READY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Hub omnicanal desacoplado: Delivery (Glovo/Uber), Pagos (Redsys/Stripe), AEAT Facturas, ERP Contable (Sage/Holded), Marketing & Calendarios.
            </p>
          </div>
        </div>

        {/* Global Toolbar & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-4 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Conectores Activos</span>
              <span className="text-emerald-400 font-bold text-sm">
                {activeConnectorsCount} / {connectors.length}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Cola DLQ Fallos</span>
              <span className={`font-bold text-sm ${pendingDlqCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {pendingDlqCount}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Buscar (Ctrl+K)</span>
          </button>

          <button
            onClick={handleSyncAll}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sincronizar Todo</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            title="Exportar Configuración JSON"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar</span>
          </button>

          <label
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
            title="Importar Configuración JSON"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Importar</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center space-x-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('CATALOG')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'CATALOG'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Conectores Enterprise ({connectors.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('WEBHOOKS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'WEBHOOKS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Gestor Webhooks ({webhooks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('DLQ')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DLQ'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Dead Letter Queue (DLQ)</span>
          {pendingDlqCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingDlqCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('OAUTH')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'OAUTH'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Tokens OAuth & SSO ({oauthConnections.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('AI_DIAGNOSTICS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'AI_DIAGNOSTICS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Auditoría IA Gemini</span>
        </button>
      </div>

      {/* Render Active Tab */}
      <div>
        {activeSubTab === 'CATALOG' && (
          <IntegrationsCatalog
            connectors={connectors}
            onToggle={handleToggleConnector}
            onUpdateConfig={handleUpdateConfig}
            onTestConnection={handleTestConnection}
          />
        )}

        {activeSubTab === 'WEBHOOKS' && (
          <WebhookManagerTab
            webhooks={webhooks}
            webhookLogs={webhookLogs}
            onCreateWebhook={handleCreateWebhook}
            onTestDispatch={handleTestDispatch}
          />
        )}

        {activeSubTab === 'DLQ' && (
          <DeadLetterQueueTab dlqItems={dlqItems} onRetry={handleRetryDLQ} onPurge={handlePurgeDLQ} />
        )}

        {activeSubTab === 'OAUTH' && (
          <OAuthTokensTab connections={oauthConnections} onRefresh={handleRefreshOAuth} onRevoke={handleRevokeOAuth} />
        )}

        {activeSubTab === 'AI_DIAGNOSTICS' && (
          <IntegrationAIDiagnosticsTab onRunAudit={handleRunAIAudit} />
        )}
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <IntegrationsSearchModal onSearch={handleGlobalSearch} onClose={() => setShowSearchModal(false)} />
      )}
    </div>
  );
};
