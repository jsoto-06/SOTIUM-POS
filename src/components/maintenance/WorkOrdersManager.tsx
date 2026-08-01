import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus, Asset, MaintenanceSparePart } from '../../types/maintenance';
import { FileText, Plus, CheckCircle2, Clock, Wrench, User, Package, DollarSign, PenTool, X } from 'lucide-react';

interface WorkOrdersManagerProps {
  workOrders: WorkOrder[];
  assets: Asset[];
  spareParts: MaintenanceSparePart[];
  onCreateWorkOrder: (data: Omit<WorkOrder, 'id' | 'code'>) => void;
  onUpdateStatus: (id: string, status: WorkOrderStatus) => void;
}

const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  'BORRADOR',
  'PENDIENTE',
  'ASIGNADA',
  'EN_CURSO',
  'PAUSADA',
  'FINALIZADA',
  'CANCELADA',
];

export const WorkOrdersManager: React.FC<WorkOrdersManagerProps> = ({
  workOrders,
  assets,
  spareParts,
  onCreateWorkOrder,
  onUpdateStatus,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [technicianName, setTechnicianName] = useState('Antonio Valero');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [laborHours, setLaborHours] = useState(2);
  const [laborRate, setLaborRate] = useState(40);
  const [observations, setObservations] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === selectedAssetId);
    if (!asset) return;

    onCreateWorkOrder({
      assetId: asset.id,
      assetName: asset.name,
      type: 'CORRECTIVO',
      priority: 'ALTA',
      status: 'PENDIENTE',
      technicianName,
      scheduledDate,
      scheduledTime,
      spareParts: [],
      laborHours,
      laborRate,
      totalLaborCost: laborHours * laborRate,
      totalCost: laborHours * laborRate,
      checklist: [
        { id: 'c-1', task: 'Inspección previa de seguridad', completed: false },
        { id: 'c-2', task: 'Sustitución de componentes defectuosos', completed: false },
        { id: 'c-3', task: 'Prueba de funcionamiento en caliente', completed: false },
      ],
      observations,
      photos: [],
      companyId: 'comp-001',
      venueId: 'sed-001',
    });

    setShowModal(false);
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'FINALIZADA':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">FINALIZADA</span>;
      case 'EN_CURSO':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">EN CURSO</span>;
      case 'PENDIENTE':
      case 'ASIGNADA':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">{status}</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Órdenes de Trabajo (OT)</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Gestión de ciclo de vida, firma digital, repuestos asignados y costes de mano de obra
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Trabajo</span>
        </button>
      </div>

      <div className="space-y-4">
        {workOrders.map((wo) => (
          <div key={wo.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-800 text-amber-400 font-mono text-sm px-2.5 py-1 rounded font-bold">
                    {wo.code}
                  </span>
                  {getStatusBadge(wo.status)}
                  <span className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded uppercase font-mono">
                    {wo.type}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-1">{wo.assetName}</h3>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2">
                {wo.status !== 'FINALIZADA' && wo.status !== 'CANCELADA' && (
                  <select
                    value={wo.status}
                    onChange={(e) => onUpdateStatus(wo.id, e.target.value as WorkOrderStatus)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    {WORK_ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        Cambiar a {st}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Programación:</span>
                <div className="text-slate-200 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {wo.scheduledDate} a las {wo.scheduledTime}h
                  </span>
                </div>
                <div className="text-slate-400">Técnico: {wo.technicianName || 'Sin asignar'}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Repuestos Utilizados:</span>
                {wo.spareParts.length > 0 ? (
                  wo.spareParts.map((sp, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>• {sp.name} (x{sp.quantity})</span>
                      <span className="font-mono text-amber-300">{sp.totalCost.toFixed(2)}€</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">Sin repuestos cargados</div>
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Resumen Económico:</span>
                <div className="flex justify-between text-slate-300">
                  <span>Mano de Obra ({wo.laborHours}h):</span>
                  <span>{wo.totalLaborCost.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-1">
                  <span>Coste Total OT:</span>
                  <span className="text-emerald-400 font-mono text-sm">{wo.totalCost.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <span>Observaciones: {wo.observations || 'Sin notas.'}</span>
              <div className="flex items-center space-x-1 text-slate-400">
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firma Digital OK</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Work Order */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Crear Orden de Trabajo</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Activo *</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.internalCode} - {a.name} ({a.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Técnico Asignado</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Horas Estimadas Mano de Obra</label>
                  <input
                    type="number"
                    step="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Tarifa Horaria (€/h)</label>
                  <input
                    type="number"
                    value={laborRate}
                    onChange={(e) => setLaborRate(parseFloat(e.target.value) || 40)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Crear Orden de Trabajo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
