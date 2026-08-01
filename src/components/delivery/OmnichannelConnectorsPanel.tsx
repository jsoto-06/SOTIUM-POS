import React from 'react';
import { OmnichannelConnector } from '../../types/delivery';
import { Network, CheckCircle2, AlertCircle, RefreshCw, Radio, Globe, MessageSquare, Zap } from 'lucide-react';

interface OmnichannelConnectorsPanelProps {
  connectors: OmnichannelConnector[];
  onToggleAutoAccept: (connectorId: string) => void;
  onSimulateWebhook: (connectorId: string) => void;
}

export const OmnichannelConnectorsPanel: React.FC<OmnichannelConnectorsPanelProps> = ({
  connectors,
  onToggleAutoAccept,
  onSimulateWebhook,
}) => {
  const getConnectorIcon = (type: OmnichannelConnector['type']) => {
    switch (type) {
      case 'GLOVO':
        return <span className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-black text-xs">GLOVO</span>;
      case 'UBER_EATS':
        return <span className="p-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs">UBER EATS</span>;
      case 'JUST_EAT':
        return <span className="p-2.5 bg-red-600 text-white rounded-xl font-black text-xs">JUST EAT</span>;
      case 'WHATSAPP_BOT':
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      default:
        return <Globe className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Hub de Conectores Omnicanal & Webhooks (Deliverect / POS APIs)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Integración nativa bidireccional de cartas, precios y sincronización en tiempo real de pedidos entrantes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-xl font-mono flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4" /> WebSocket Realtime Engine: ONLINE
          </span>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((conn) => (
          <div
            key={conn.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 shadow-xl transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                {getConnectorIcon(conn.type)}
                <div>
                  <h4 className="font-bold text-sm text-white">{conn.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">ID: {conn.id}</span>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                {conn.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pedidos Hoy:</span>
                <span className="font-bold font-mono text-white text-sm">{conn.ordersTodayCount}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ventas Hoy:</span>
                <span className="font-bold font-mono text-amber-400 text-sm">{conn.salesTodayTotal.toFixed(2)} €</span>
              </div>
            </div>

            {/* Webhook Endpoint */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
              <span className="text-slate-500 block">URL Webhook Receiver:</span>
              <p className="font-mono text-slate-300 truncate">{conn.webhookUrl}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conn.autoAcceptOrders}
                  onChange={() => onToggleAutoAccept(conn.id)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-300 font-semibold">Auto-Aceptar</span>
              </label>

              <button
                onClick={() => onSimulateWebhook(conn.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> Test Webhook
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
