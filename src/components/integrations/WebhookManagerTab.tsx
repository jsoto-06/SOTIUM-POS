import React, { useState } from 'react';
import { WebhookEndpoint, WebhookLog } from '../../types/integration';
import {
  Globe,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Clock,
  Key,
  Code2,
  FileJson,
} from 'lucide-react';

interface WebhookManagerTabProps {
  webhooks: WebhookEndpoint[];
  webhookLogs: WebhookLog[];
  onCreateWebhook: (data: any) => void;
  onTestDispatch: (webhookId: string, eventName: string, payload: any) => void;
}

export const WebhookManagerTab: React.FC<WebhookManagerTabProps> = ({
  webhooks,
  webhookLogs,
  onCreateWebhook,
  onTestDispatch,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string>(webhooks[0]?.id || '');
  const [testEventName, setTestEventName] = useState<string>('ORDER_TEST_EVENT');
  const [testPayloadJson, setTestPayloadJson] = useState<string>(
    JSON.stringify({ orderId: 'TEST-2026-001', amount: 42.5, items: 2 }, null, 2)
  );

  // Form State
  const [name, setName] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('https://api.empresa.es/webhooks/pos');
  const [eventsStr, setEventsStr] = useState<string>('ORDER_CREATED, PAYMENT_SUCCESS');
  const [secretKey, setSecretKey] = useState<string>(`whsec_${Math.random().toString(36).substring(2, 12)}`);
  const [algo, setAlgo] = useState<'HMAC-SHA256' | 'HMAC-SHA512'>('HMAC-SHA256');

  const handleCreate = () => {
    if (!name.trim() || !targetUrl.trim()) return;
    const events = eventsStr.split(',').map((e) => e.trim()).filter(Boolean);
    onCreateWebhook({
      integrationId: 'int-custom',
      name,
      targetUrl,
      events,
      secretKey,
      signatureAlgorithm: algo,
      status: 'ACTIVE',
      maxRetries: 3,
    });
    setShowCreateModal(false);
    setName('');
  };

  const handleDispatch = () => {
    if (!selectedWebhookId) return;
    try {
      const payload = JSON.parse(testPayloadJson);
      onTestDispatch(selectedWebhookId, testEventName, payload);
    } catch {
      alert('Error en formato JSON del payload de prueba');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>Gestor de Webhooks Enterprise</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestione suscripciones de eventos salientes e inyección de datos con firma HMAC-SHA256 y reintentos automáticos.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Endpoint Webhook</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Endpoints Configurados ({webhooks.length})</span>
          </h3>

          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{wh.name}</span>
                      <span className="text-[10px] bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/60 font-mono">
                        {wh.status}
                      </span>
                    </h4>
                    <p className="text-xs font-mono text-amber-300 mt-1 break-all bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
                      {wh.targetUrl}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Firma Criptográfica</span>
                    <span className="font-mono text-white flex items-center space-x-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{wh.signatureAlgorithm}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Eventos Suscritos</span>
                    <span className="text-white font-medium">{wh.events.length} eventos</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Disparos / Fallos</span>
                    <span className="font-mono text-white">
                      {wh.totalDispatches} / <span className="text-red-400">{wh.failedDispatches}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Test Box */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Send className="w-4 h-4 text-amber-400" />
            <span>Simulador de Disparo Webhook</span>
          </h3>

          <div className="space-y-3 flex-1">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Seleccionar Endpoint Target</label>
              <select
                value={selectedWebhookId}
                onChange={(e) => setSelectedWebhookId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {webhooks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Nombre de Evento (Header: X-ERP-Event)</label>
              <input
                type="text"
                value={testEventName}
                onChange={(e) => setTestEventName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Payload Test (JSON)</label>
              <textarea
                value={testPayloadJson}
                onChange={(e) => setTestPayloadJson(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-xs text-cyan-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleDispatch}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ejecutar Test de Disparo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Webhook Execution Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Histórico de Logs de Disparo ({webhookLogs.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Proveedor / Evento</th>
                <th className="p-3">Estado HTTP</th>
                <th className="p-3">Latencia</th>
                <th className="p-3">HMAC SHA-256</th>
                <th className="p-3">Respuesta Server</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {webhookLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp.substring(11, 19)}h</td>
                  <td className="p-3 font-semibold text-white">
                    {log.provider} <span className="text-amber-400 font-normal">({log.event})</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.responseStatus >= 200 && log.responseStatus < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {log.responseStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{log.durationMs} ms</td>
                  <td className="p-3 text-emerald-400 font-bold">
                    {log.signatureValid ? '✓ VÁLIDA' : '✕ INVÁLIDA'}
                  </td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{log.responseBody}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400">Registrar Nuevo Webhook Endpoint</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nombre Descriptor</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Glovo Delivery Webhook"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target URL (HTTPS Target)</label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Eventos Suscritos (separados por coma)</label>
              <input
                type="text"
                value={eventsStr}
                onChange={(e) => setEventsStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Algoritmo de Firma Criptográfica</label>
              <select
                value={algo}
                onChange={(e) => setAlgo(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-500"
              >
                <option value="HMAC-SHA256">HMAC-SHA256 (Estándar)</option>
                <option value="HMAC-SHA512">HMAC-SHA512 (Máxima Seguridad)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20"
              >
                Guardar Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
