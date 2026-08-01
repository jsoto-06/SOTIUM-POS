import React, { useState, useEffect, useCallback } from 'react';
import { MobileService } from '../../services/mobileService';
import { PushNotification } from '../../types/mobile';
import { Bell, Check, Trash2, Send, AlertCircle, Sparkles, Filter, CheckCheck } from 'lucide-react';

export const MobileNotificationsCenter: React.FC = React.memo(() => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newType, setNewType] = useState<PushNotification['type']>('INCIDENT');
  const [newPriority, setNewPriority] = useState<PushNotification['priority']>('HIGH');

  const loadNotifications = useCallback(() => {
    const list = MobileService.getPushNotifications();
    setNotifications(list);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = useCallback((id: string) => {
    MobileService.markNotificationRead(id);
    loadNotifications();
  }, [loadNotifications]);

  const handleClearAll = useCallback(() => {
    MobileService.clearNotifications();
    loadNotifications();
  }, [loadNotifications]);

  const handleSendNotification = useCallback(() => {
    if (!newTitle || !newMessage) return;
    MobileService.sendPushNotification(newType, newTitle, newMessage, newPriority);
    loadNotifications();
    setShowSendModal(false);
    setNewTitle('');
    setNewMessage('');
  }, [newType, newTitle, newMessage, newPriority, loadNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (typeFilter === 'ALL') return true;
    return n.type === typeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 space-y-4 font-sans">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Centro de Notificaciones Push</h1>
            <p className="text-xs text-slate-400">
              {notifications.filter((n) => !n.read).length} notificaciones no leídas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSendModal(true)}
            className="p-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Notificación</span>
          </button>

          <button
            onClick={handleClearAll}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1"
            title="Limpiar Notificaciones"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'ORDER', 'RESERVATION', 'INCIDENT', 'STOCK_CRITICAL', 'HIGH_SALE', 'VIP_CUSTOMER', 'TECH_INCIDENT'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
              typeFilter === t
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-medium text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-700" />
            <p>Sin notificaciones push en esta categoría.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const priorityBadge =
              notif.priority === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : notif.priority === 'HIGH'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all ${
                  notif.read ? 'bg-slate-900/40 border-slate-800/80 opacity-75' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-100">{notif.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${priorityBadge}`}>
                        {notif.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Marcar como leída"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-slate-500 font-mono">
                  {new Date(notif.timestamp).toLocaleTimeString()} • Tipo: {notif.type}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Lanzar Notificación Push</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Título:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Stock Crítico Solomillo"
                className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Mensaje:</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ej: Quedan menos de 3 unidades en cámara..."
                className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none h-16"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo:</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none"
                >
                  <option value="INCIDENT">INCIDENT</option>
                  <option value="STOCK_CRITICAL">STOCK_CRITICAL</option>
                  <option value="HIGH_SALE">HIGH_SALE</option>
                  <option value="VIP_CUSTOMER">VIP_CUSTOMER</option>
                  <option value="TECH_INCIDENT">TECH_INCIDENT</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Prioridad:</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendNotification}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Enviar Push
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
