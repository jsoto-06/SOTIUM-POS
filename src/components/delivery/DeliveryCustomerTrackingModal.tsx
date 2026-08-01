import React, { useState } from 'react';
import { DeliveryOrder, DeliveryOrderStatus } from '../../types/delivery';
import { DeliveryService } from '../../services/deliveryService';
import { X, MapPin, Phone, Clock, Truck, CheckCircle2, Send, MessageSquare, ShieldCheck, User } from 'lucide-react';

interface DeliveryCustomerTrackingModalProps {
  order: DeliveryOrder;
  onClose: () => void;
}

export const DeliveryCustomerTrackingModal: React.FC<DeliveryCustomerTrackingModalProps> = ({
  order,
  onClose,
}) => {
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const steps: { status: DeliveryOrderStatus; label: string }[] = [
    { status: 'ACEPTADO', label: 'Pedido Aceptado' },
    { status: 'PREPARANDO', label: 'En Cocina' },
    { status: 'LISTO', label: 'Listo en Barra' },
    { status: 'EN_REPARTO', label: 'En Reparto' },
    { status: 'ENTREGADO', label: 'Entregado' },
  ];

  const getCurrentStepIndex = () => {
    switch (order.status) {
      case 'NUEVO':
      case 'ACEPTADO':
        return 0;
      case 'PREPARANDO':
      case 'EN_COCINA':
        return 1;
      case 'LISTO':
        return 2;
      case 'EN_REPARTO':
        return 3;
      case 'ENTREGADO':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  const handleSendNotification = (channel: 'SMS' | 'WHATSAPP') => {
    const msg = `Hola ${order.customer.name}, tu pedido #${order.orderCode} está en estado [${order.status}]. Tiempo estimado de llegada: ${order.estimatedDeliveryMinutes} min.`;
    DeliveryService.sendNotification(order, channel, msg);
    setSentMessage(`¡Notificación enviada por ${channel} a ${order.customer.phone}!`);
    setTimeout(() => setSentMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" /> Seguimiento en Tiempo Real (Live Tracking)
            </h3>
            <p className="text-[11px] text-slate-400">Vista pública de seguimiento para el cliente final</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Code & ETA */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Pedido #{order.orderCode}</span>
            <h4 className="font-extrabold text-sm text-white">{order.customer.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Tiempo Estimado LLegada (ETA):</span>
            <span className="text-lg font-black text-emerald-400 font-mono flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4" /> {order.estimatedPrepMinutes + order.estimatedDeliveryMinutes} min
            </span>
          </div>
        </div>

        {/* Step Timeline */}
        <div className="py-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-800 -z-0" />
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentIndex;
              return (
                <div key={step.status} className="flex flex-col items-center relative z-10 space-y-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold ${isCompleted ? 'text-amber-400' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Vector Simulation */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-40 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
          <Truck className="w-8 h-8 text-emerald-400 relative z-10 animate-pulse" />
          <p className="text-xs font-bold text-white relative z-10">
            {order.driverName ? `Repartidor ${order.driverName} en camino` : 'Buscando repartidor asignado...'}
          </p>
          <p className="text-[10px] text-slate-400 relative z-10 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" /> {order.customer.address}
          </p>
        </div>

        {/* Trigger Notifications */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs text-slate-400 block font-semibold">Notificar Estado al Cliente:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSendNotification('SMS')}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" /> Enviar SMS
            </button>
            <button
              onClick={() => handleSendNotification('WHATSAPP')}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Enviar WhatsApp
            </button>
          </div>

          {sentMessage && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {sentMessage}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
