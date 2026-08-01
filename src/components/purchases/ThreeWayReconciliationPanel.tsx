import React, { useState } from 'react';
import { PurchaseOrder, SupplierDeliveryNote, SupplierInvoice, ThreeWayReconciliation } from '../../types/purchases';
import { PurchasesService } from '../../services/purchasesService';
import { AuditService } from '../../services/auditService';
import { GitCompare, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface ThreeWayReconciliationPanelProps {
  orders: PurchaseOrder[];
  deliveryNotes: SupplierDeliveryNote[];
  invoices: SupplierInvoice[];
}

export const ThreeWayReconciliationPanel: React.FC<ThreeWayReconciliationPanelProps> = ({
  orders,
  deliveryNotes,
  invoices,
}) => {
  const reconciliations: ThreeWayReconciliation[] = orders.map((ord) => {
    const matchedNote = deliveryNotes.find((dn) => dn.purchaseOrderId === ord.id);
    const matchedInvoice = invoices.find((inv) => inv.orderIds.includes(ord.id));
    return PurchasesService.performThreeWayMatch(ord, matchedNote, matchedInvoice);
  });

  const [filter, setFilter] = useState<'TODOS' | 'CONCILIADOS' | 'DESVIACIONES'>('TODOS');

  const filtered = reconciliations.filter((r) => {
    if (filter === 'CONCILIADOS') return r.isMatched;
    if (filter === 'DESVIACIONES') return !r.isMatched;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-4 rounded-xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <span>Conciliación Tripartita 3-Way Matching</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verificación automática entre Pedido de Compra, Albarán de Recepción y Factura del Proveedor
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(['TODOS', 'CONCILIADOS', 'DESVIACIONES'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === f
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                <th className="p-3">Pedido</th>
                <th className="p-3">Albarán</th>
                <th className="p-3">Factura</th>
                <th className="p-3">Proveedor</th>
                <th className="p-3 text-right">Pedido €</th>
                <th className="p-3 text-right">Albarán €</th>
                <th className="p-3 text-right">Factura €</th>
                <th className="p-3">Estado Matching</th>
                <th className="p-3">Detalle Desviaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-mono text-amber-400 font-bold">{rec.orderNumber}</td>
                  <td className="p-3 font-mono text-slate-300">{rec.deliveryNumber || 'Pendiente'}</td>
                  <td className="p-3 font-mono text-slate-300">{rec.invoiceNumber || 'Pendiente'}</td>
                  <td className="p-3 text-white font-medium">{rec.supplierName}</td>
                  <td className="p-3 font-mono text-right text-slate-300">{rec.orderedTotal}€</td>
                  <td className="p-3 font-mono text-right text-slate-300">{rec.receivedTotal}€</td>
                  <td className="p-3 font-mono text-right text-amber-400 font-bold">{rec.invoicedTotal}€</td>
                  <td className="p-3">
                    {rec.isMatched ? (
                      <span className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Conciliado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/30 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Desviación</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">
                    {rec.discrepanciesDetails.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300">
                        {rec.discrepanciesDetails.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-emerald-400/80 text-[11px]">Sin descuadres</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
