import React, { useState, useEffect, useCallback } from 'react';
import { MobileService } from '../../services/mobileService';
import { DeliveryDriverTask } from '../../types/mobile';
import { Truck, MapPin, Phone, CheckCircle2, AlertTriangle, Camera, Edit3, Navigation, Clock, ShieldCheck } from 'lucide-react';

export const MobileDeliveryApp: React.FC = React.memo(() => {
  const [tasks, setTasks] = useState<DeliveryDriverTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DeliveryDriverTask | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [signatureText, setSignatureText] = useState<string>('');
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [incidentText, setIncidentText] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadTasks = useCallback(() => {
    const list = MobileService.getDeliveryTasks();
    setTasks(list);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleUpdateStatus = useCallback(
    (taskId: string, status: 'IN_TRANSIT' | 'DELIVERED' | 'INCIDENT', extra?: any) => {
      try {
        const updated = MobileService.updateDeliveryStatus(taskId, status, extra);
        setStatusMsg(`Estado de entrega actualizado a: ${status}`);
        loadTasks();
        if (selectedTask?.id === taskId) {
          setSelectedTask(updated);
        }
        setTimeout(() => setStatusMsg(null), 3000);
      } catch (err: any) {
        setStatusMsg(`Error: ${err.message}`);
      }
    },
    [loadTasks, selectedTask]
  );

  const handleCompleteDeliveryWithSignature = useCallback(() => {
    if (!selectedTask) return;
    handleUpdateStatus(selectedTask.id, 'DELIVERED', {
      signature: signatureText || 'Firma Cliente Verificada',
      photoUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=300&q=80',
    });
    setShowSignatureModal(false);
    setSignatureText('');
  }, [selectedTask, handleUpdateStatus, signatureText]);

  const handleReportIncident = useCallback(() => {
    if (!selectedTask) return;
    handleUpdateStatus(selectedTask.id, 'INCIDENT', {
      incidentReason: incidentText || 'Cliente no responde al timbre / Teléfono fuera de servicio',
    });
    setShowIncidentModal(false);
    setIncidentText('');
  }, [selectedTask, handleUpdateStatus, incidentText]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 space-y-4 font-sans">
      {/* Delivery Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">App Repartidor Delivery</h1>
            <p className="text-xs text-slate-400">
              {tasks.filter((t) => t.status !== 'DELIVERED').length} repartos activos pendientes
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-center">
          {statusMsg}
        </div>
      )}

      {/* Main Delivery Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Task List Column */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-sm text-cyan-400 flex items-center space-x-2">
            <Navigation className="w-4 h-4" />
            <span>Mis Repartos Asignados</span>
          </h3>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const statusBadge =
                task.status === 'DELIVERED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : task.status === 'IN_TRANSIT'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : task.status === 'INCIDENT'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{task.customerName}</h4>
                      <p className="text-xs text-cyan-400 font-mono font-semibold">Pedido #{task.orderId}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{task.address}</span>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs font-mono pt-2 border-t border-slate-800">
                    <span className="text-slate-400">{task.phone}</span>
                    <span className="font-bold text-emerald-400 text-sm">{task.amount.toFixed(2)} €</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Map & Action Column */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
          {selectedTask ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-slate-400">Detalle de Reparto Activo</span>
                  <h3 className="font-bold text-base text-cyan-400">{selectedTask.customerName}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-mono">Importe a Cobrar</span>
                  <p className="font-black text-lg text-emerald-400">{selectedTask.amount.toFixed(2)} €</p>
                </div>
              </div>

              {/* Simulated GPS Route Map */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden h-48 flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 to-slate-950 pointer-events-none" />
                <div className="relative z-10 flex justify-between items-center text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold border border-cyan-500/30">
                    GPS Activo (Geolocalización Ok)
                  </span>
                  <span className="text-slate-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. 12 min</span>
                  </span>
                </div>

                <div className="relative z-10 space-y-1">
                  <p className="font-bold text-xs text-slate-200">{selectedTask.address}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Coords: {selectedTask.lat}, {selectedTask.lng}
                  </p>
                </div>
              </div>

              {/* Driver Action Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleUpdateStatus(selectedTask.id, 'IN_TRANSIT')}
                  disabled={selectedTask.status === 'IN_TRANSIT' || selectedTask.status === 'DELIVERED'}
                  className="py-3 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Iniciar Ruta</span>
                </button>

                <button
                  onClick={() => setShowSignatureModal(true)}
                  disabled={selectedTask.status === 'DELIVERED'}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completar & Firma</span>
                </button>

                <button
                  onClick={() => setShowIncidentModal(true)}
                  className="col-span-2 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center justify-center space-x-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reportar Incidencia de Entrega</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-500 text-xs font-medium space-y-2">
              <Truck className="w-10 h-10 mx-auto text-slate-700" />
              <p>Selecciona un reparto del panel izquierdo para ver la ruta y completar la entrega.</p>
            </div>
          )}
        </div>
      </div>

      {/* Signature & Proof Modal */}
      {showSignatureModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 max-w-xs w-full space-y-4">
            <h3 className="font-bold text-sm text-cyan-400 flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Firma Digital & Fotografía</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nombre o Firma del Cliente:</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Nombre del receptor"
                className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Foto de prueba adjuntada</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteDeliveryWithSignature}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {showIncidentModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 max-w-xs w-full space-y-4">
            <h3 className="font-bold text-sm text-rose-400 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Registrar Incidencia</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Motivo de la Incidencia:</label>
              <textarea
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                placeholder="Ej: Dirección incorrecta, cliente ausente..."
                className="w-full px-3 py-2 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none h-20"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleReportIncident}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
