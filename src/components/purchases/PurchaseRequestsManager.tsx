import React, { useState } from 'react';
import { PurchaseRequest, Supplier } from '../../types/purchases';
import { Article } from '../../types/inventory';
import { PurchasesService } from '../../services/purchasesService';
import { AuditService } from '../../services/auditService';
import { FileQuestion, Plus, CheckCircle2, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PurchaseRequestsManagerProps {
  requests: PurchaseRequest[];
  suppliers: Supplier[];
  articles: Article[];
  onAddRequest: (req: PurchaseRequest) => void;
  onUpdateRequest: (req: PurchaseRequest) => void;
  onConvertToOrder: (req: PurchaseRequest, supplier: Supplier) => void;
}

export const PurchaseRequestsManager: React.FC<PurchaseRequestsManagerProps> = ({
  requests,
  suppliers,
  articles,
  onAddRequest,
  onUpdateRequest,
  onConvertToOrder,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [department, setDepartment] = useState('Cocina');
  const [requestorName, setRequestorName] = useState('Chef Ejecutivo');
  const [urgency, setUrgency] = useState<'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'>('MEDIA');
  const [selectedArticleId, setSelectedArticleId] = useState(articles[0]?.id || '');
  const [quantity, setQuantity] = useState(5);
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const article = articles.find((a) => a.id === selectedArticleId) || articles[0];
    const unitPrice = article?.purchasePrice || 10;
    const total = unitPrice * quantity;

    const newReq = PurchasesService.createPurchaseRequest({
      requestorName,
      department,
      warehouseId: 'wh-001',
      warehouseName: 'Almacén Principal Economato',
      urgency,
      lines: [
        {
          id: `prl-${Date.now()}`,
          articleId: article?.id || 'art-1',
          articleName: article?.name || 'Artículo Solicitado',
          unit: article?.unit || 'ud',
          requestedQuantity: quantity,
          estimatedUnitPrice: unitPrice,
          total,
        },
      ],
      estimatedTotal: total,
      notes,
    });

    onAddRequest(newReq);
    AuditService.log({
      username: requestorName,
      action: 'PURCHASE_REQUEST_CREATE',
      resource: 'Purchases',
      details: `Solicitud ${newReq.requestCode} creada por departamento ${department}`,
    });
    setShowModal(false);
  };

  const handleApprove = (req: PurchaseRequest) => {
    const updated = { ...req, status: 'APROBADA' as const };
    onUpdateRequest(updated);
    AuditService.log({
      username: 'RESPONSABLE_COMPRAS',
      action: 'PURCHASE_REQUEST_APPROVE',
      resource: 'Purchases',
      details: `Solicitud ${req.requestCode} aprobada`,
    });
  };

  const handleConvert = (req: PurchaseRequest) => {
    const matchedSup = suppliers.find((s) => s.id === req.supplierId) || suppliers[0];
    onConvertToOrder(req, matchedSup);
    const updated = { ...req, status: 'CONVERTIDA_EN_PEDIDO' as const };
    onUpdateRequest(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-amber-400" />
            <span>Solicitudes de Compra Internas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión y aprobación de peticiones internas de reposición por departamento
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* Grid of Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {req.requestCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === 'APROBADA'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : req.status === 'CONVERTIDA_EN_PEDIDO'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-white">{req.department} — {req.requestorName}</h3>
                <p className="text-xs text-slate-400 mt-1">Urgencia: <strong className="text-slate-200">{req.urgency}</strong></p>
              </div>

              <div className="mt-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                {req.lines.map((l) => (
                  <div key={l.id} className="flex justify-between text-xs text-slate-300">
                    <span>{l.articleName} ({l.requestedQuantity} {l.unit})</span>
                    <span className="font-mono text-slate-400">{l.total}€</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Estimado</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">{req.estimatedTotal}€</span>
              </div>

              <div className="flex space-x-2">
                {req.status === 'PENDIENTE' && (
                  <button
                    onClick={() => handleApprove(req)}
                    className="flex items-center space-x-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobar</span>
                  </button>
                )}
                {req.status === 'APROBADA' && (
                  <button
                    onClick={() => handleConvert(req)}
                    className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                  >
                    <span>Crear Pedido</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Solicitud */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Nueva Solicitud de Compra</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Departamento</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Solicitante</label>
                <input
                  type="text"
                  value={requestorName}
                  onChange={(e) => setRequestorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Artículo</label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.stock} en stock)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Cantidad Solicitada</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Urgencia</label>
              <select
                value={urgency}
                onChange={(e: any) => setUrgency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Observaciones</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white h-20"
                placeholder="Motivo de la compra..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-md shadow-amber-500/20"
              >
                Guardar Solicitud
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
