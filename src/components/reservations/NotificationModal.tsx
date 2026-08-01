import React, { useState } from 'react';
import { Reservation } from '../../types/reservation';
import { sendOmnichannelNotification } from '../../services/notificationService';
import { MessageSquare, Send, X, CheckCircle, Smartphone, Mail } from 'lucide-react';

interface NotificationModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  reservation,
  onClose,
}) => {
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [templateType, setTemplateType] = useState<'CONFIRMATION' | 'REMINDER' | 'NO_SHOW_ALERT'>('CONFIRMATION');
  const [phoneOrEmail, setPhoneOrEmail] = useState(channel === 'EMAIL' ? reservation.email || '' : reservation.phone);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const getTemplatePreview = () => {
    switch (templateType) {
      case 'CONFIRMATION':
        return `Hola ${reservation.customerName}, tu reserva en Restaurante El Tabernero está CONFIRMADA para el ${reservation.date} a las ${reservation.time}h para ${reservation.pax} comensales. Ref: #${reservation.code || reservation.id}. ¡Te esperamos!`;
      case 'REMINDER':
        return `Recordatorio de tu reserva mañana ${reservation.date} a las ${reservation.time}h (${reservation.pax} PAX). Por favor responde SI para confirmar o CANCELAR para liberar la mesa.`;
      case 'NO_SHOW_ALERT':
        return `Estimado/a ${reservation.customerName}, hemos registrado tu inasistencia a la reserva de hoy ${reservation.time}h. Por favor ponte en contacto con recepción al ${reservation.phone}.`;
    }
  };

  const handleSend = async () => {
    setSending(true);
    const result = sendOmnichannelNotification({
      reservation,
      type: templateType,
      channel,
      customMessage: getTemplatePreview(),
    });

    setSending(false);
    if (result && result.status === 'SENT') {
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Notificación Omnicanal a Cliente</h3>
            <p className="text-xs text-slate-400">WhatsApp API oficial / SMS / Email de confirmación</p>
          </div>
        </div>

        {sentSuccess ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-emerald-400">¡Notificación Enviada Correctamente!</h4>
            <p className="text-xs text-slate-300">Mensaje entregado mediante la pasarela {channel}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Channel selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Canal de Envío</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('WHATSAPP')}
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 ${
                    channel === 'WHATSAPP'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 ${
                    channel === 'SMS'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('EMAIL')}
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 ${
                    channel === 'EMAIL'
                      ? 'bg-purple-500 text-white border-purple-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">Plantilla de Mensaje</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="CONFIRMATION">Confirmación Inmediata de Reserva</option>
                <option value="REMINDER">Recordatorio 24 horas antes</option>
                <option value="NO_SHOW_ALERT">Notificación de Registro No-Show</option>
              </select>
            </div>

            {/* Destination Contact */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Destinatario</label>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Live Message Preview */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Vista Previa del Mensaje</label>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-amber-200 font-sans leading-relaxed">
                {getTemplatePreview()}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Enviando...' : 'Enviar Notificación'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
