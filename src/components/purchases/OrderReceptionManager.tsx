import React, { useState } from 'react';
import { PurchaseOrder, SupplierDeliveryNote } from '../../types/purchases';
import { Article } from '../../types/inventory';
import { PurchasesService } from '../../services/purchasesService';
import { PackageCheck, Calendar, Tag, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OrderReceptionManagerProps {
  order: PurchaseOrder;
  articles: Article[];
  onCompleteReception: (
    updatedOrder: PurchaseOrder,
    deliveryNote: SupplierDeliveryNote,
    updatedArticles: Article[]
  ) => void;
  onCancel: () => void;
}

export const OrderReceptionManager: React.FC<OrderReceptionManagerProps> = ({
  order,
  articles,
  onCompleteReception,
  onCancel,
}) => {
  const [receptionInputs, setReceptionInputs] = useState<{
    [lineId: string]: {
      qtyToReceive: number;
      batchNumber: string;
      expirationDate: string;
    };
  }>(() => {
    const initial: any = {};
    order.lines.forEach((l) => {
      const remaining = Math.max(0, l.orderedQuantity - l.receivedQuantity);
      initial[l.id] = {
        qtyToReceive: remaining,
        batchNumber: l.batchNumber || `LOTE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        expirationDate: l.expirationDate || new Date(Date.now() + 86400000 * 180).toISOString().substring(0, 10),
      };
    });
    return initial;
  });

  const handleQtyChange = (lineId: string, val: number) => {
    setReceptionInputs({
      ...receptionInputs,
      [lineId]: {
        ...receptionInputs[lineId],
        qtyToReceive: val,
      },
    });
  };

  const handleBatchChange = (lineId: string, batchNumber: string) => {
    setReceptionInputs({
      ...receptionInputs,
      [lineId]: {
        ...receptionInputs[lineId],
        batchNumber,
      },
    });
  };

  const handleExpChange = (lineId: string, expirationDate: string) => {
    setReceptionInputs({
      ...receptionInputs,
      [lineId]: {
        ...receptionInputs[lineId],
        expirationDate,
      },
    });
  };

  const handleSubmitReception = (e: React.FormEvent) => {
    e.preventDefault();

    const receivedLinesPayload = order.lines.map((l) => ({
      lineId: l.id,
      quantityReceived: receptionInputs[l.id]?.qtyToReceive || 0,
      batchNumber: receptionInputs[l.id]?.batchNumber,
      expirationDate: receptionInputs[l.id]?.expirationDate,
    }));

    const result = PurchasesService.processOrderReception(order, receivedLinesPayload, articles);
    onCompleteReception(result.updatedOrder, result.generatedDeliveryNote, result.updatedArticles);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recepción de Mercancía en Almacén</h2>
            <p className="text-xs text-slate-400">
              Pedido <span className="font-mono text-amber-400 font-bold">{order.orderNumber}</span> — Proveedor:{' '}
              {order.supplierName}
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Destino: <strong className="text-white">{order.warehouseName}</strong>
        </span>
      </div>

      <form onSubmit={handleSubmitReception} className="space-y-6">
        <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Pedidas</th>
                <th className="p-3 text-center">Ya Recibidas</th>
                <th className="p-3 text-center w-32">A Recepcionar Hoy</th>
                <th className="p-3">Lote de Fabricación</th>
                <th className="p-3">Fecha Caducidad</th>
                <th className="p-3 text-right">Precio Ud.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {order.lines.map((line) => {
                const inputState = receptionInputs[line.id];
                return (
                  <tr key={line.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-medium text-white">{line.articleName}</td>
                    <td className="p-3 text-center font-bold text-amber-300">
                      {line.orderedQuantity} {line.unit}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-400">
                      {line.receivedQuantity} {line.unit}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={line.orderedQuantity - line.receivedQuantity + 10}
                        value={inputState?.qtyToReceive || 0}
                        onChange={(e) => handleQtyChange(line.id, Number(e.target.value))}
                        className="w-24 bg-slate-900 border border-amber-500/40 rounded p-1.5 text-center font-bold text-amber-400 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={inputState?.batchNumber || ''}
                        onChange={(e) => handleBatchChange(line.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-xs text-slate-300"
                        placeholder="LOTE-000"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={inputState?.expirationDate || ''}
                        onChange={(e) => handleExpChange(line.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-300"
                      />
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {line.unitPrice.toFixed(2)} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Info Alert Box */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start space-x-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="font-bold">Acciones Automáticas al Confirmar Recepción:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-emerald-200/80">
              <li>Generación automática de Albarán de entrada de proveedor (ALB-PROV).</li>
              <li>Actualización instantánea de stock en el almacén de destino.</li>
              <li>Recálculo automático del Precio Medio Ponderado y Último Precio de compra.</li>
              <li>Actualización de costes de escandallos asociados a las materias primas.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-emerald-500/20"
          >
            <span>Confirmar Recepción y Actualizar Stock</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
