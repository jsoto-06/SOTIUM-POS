import React, { useState } from 'react';
import { FinancialInvoice, FinancialDueDateItem } from '../../types/finance';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  Search,
  DollarSign,
} from 'lucide-react';

interface Props {
  invoices: FinancialInvoice[];
  dueDates: FinancialDueDateItem[];
  onCreateInvoice: (params: {
    type: FinancialInvoice['type'];
    series: string;
    issuerName: string;
    issuerDniCif: string;
    recipientName: string;
    recipientDniCif: string;
    items: { description: string; quantity: number; unitPrice: number; vatRate: number }[];
    paymentMethod: FinancialInvoice['paymentMethod'];
    dueDate?: string;
    notes?: string;
  }) => void;
}

export const InvoicingPayments: React.FC<Props> = ({ invoices, dueDates, onCreateInvoice }) => {
  const [activeTab, setActiveTab] = useState<'facturas' | 'vencimientos' | 'entidades'>('facturas');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>('TODAS');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice Form
  const [type, setType] = useState<FinancialInvoice['type']>('EMITIDA');
  const [series, setSeries] = useState('F2026');
  const [issuerName, setIssuerName] = useState('Sotium POS España S.L.');
  const [issuerDniCif, setIssuerDniCif] = useState('B89201948');
  const [recipientName, setRecipientName] = useState('');
  const [recipientDniCif, setRecipientDniCif] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<FinancialInvoice['paymentMethod']>('TRANSFERENCIA');
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));

  const [items, setItems] = useState<{ description: string; quantity: number; unitPrice: number; vatRate: number }[]>([
    { description: 'Servicio de Menú Evento Hostelería', quantity: 10, unitPrice: 35.0, vatRate: 10 },
  ]);

  const filteredInvoices = invoices.filter((inv) => {
    if (invoiceTypeFilter === 'TODAS') return true;
    return inv.type === invoiceTypeFilter;
  });

  const handleAddItem = () => {
    setItems([...items, { description: 'Producto / Consumición', quantity: 1, unitPrice: 10.0, vatRate: 10 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientDniCif) return;

    onCreateInvoice({
      type,
      series,
      issuerName,
      issuerDniCif,
      recipientName,
      recipientDniCif,
      items,
      paymentMethod,
      dueDate,
    });

    setShowCreateModal(false);
    setRecipientName('');
    setRecipientDniCif('');
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('facturas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'facturas' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Facturas & Documentos ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vencimientos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'vencimientos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Agenda de Vencimientos ({dueDates.length})</span>
          </button>
        </div>

        {activeTab === 'facturas' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Factura / Documento</span>
          </button>
        )}
      </div>

      {/* VIEW 1: FACTURAS */}
      {activeTab === 'facturas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Gestión de Facturación Comercial</span>
            </h3>

            <div className="flex space-x-2">
              {['TODAS', 'EMITIDA', 'RECIBIDA', 'RECTIFICATIVA', 'PRESUPUESTO'].map((t) => (
                <button
                  key={t}
                  onClick={() => setInvoiceTypeFilter(t)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    invoiceTypeFilter === t ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Número / Serie</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Fecha / Vencimiento</th>
                  <th className="py-2.5 px-3">Receptor / CIF</th>
                  <th className="py-2.5 px-3 text-right">Base (€)</th>
                  <th className="py-2.5 px-3 text-right">IVA (€)</th>
                  <th className="py-2.5 px-3 text-right">Total Factura (€)</th>
                  <th className="py-2.5 px-3 text-center">Estado Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{inv.number}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase">{inv.type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      <span>{inv.issueDate}</span>
                      <span className="block text-[10px] text-slate-500">Venc: {inv.dueDate}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-white">{inv.recipientName}</span>
                      <span className="block text-slate-500 text-[10px] font-mono">{inv.recipientDniCif}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{inv.taxableBase.toFixed(2)} €</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">{inv.vatTotal.toFixed(2)} €</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{inv.grandTotal.toFixed(2)} €</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.paymentStatus === 'PAGADA'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : inv.paymentStatus === 'PARCIAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: AGENDA VENCIMIENTOS */}
      {activeTab === 'vencimientos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Agenda de Vencimientos de Cobros y Pagos</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Factura</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Tercero / Entidad</th>
                  <th className="py-2.5 px-3">Fecha Vencimiento</th>
                  <th className="py-2.5 px-3 text-right">Importe Pendiente (€)</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dueDates.map((due) => (
                  <tr key={due.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{due.invoiceNumber}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          due.type === 'COBRO_CLIENTE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {due.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{due.entityName}</td>
                    <td className="py-2.5 px-3 font-mono">{due.dueDate}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">{due.amount.toFixed(2)} €</td>
                    <td className="py-2.5 px-3 text-center">
                      {due.daysOverdue > 0 ? (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center justify-center space-x-1 w-28 mx-auto">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Vencido ({due.daysOverdue} d)</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold w-28 mx-auto block">
                          En Plazo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Nueva Factura / Documento Comercial</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Documento</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    <option value="EMITIDA">Factura Emitida (Venta)</option>
                    <option value="RECIBIDA">Factura Recibida (Compra)</option>
                    <option value="RECTIFICATIVA">Factura Rectificativa</option>
                    <option value="PRESUPUESTO">Presupuesto</option>
                    <option value="ALBARAN">Albarán</option>
                    <option value="PROFORMA">Factura Proforma</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Serie</label>
                  <input
                    type="text"
                    required
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cliente / Proveedor (Nombre)</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ej: Eventos Empresa S.L."
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">NIF / CIF / DNI</label>
                  <input
                    type="text"
                    required
                    value={recipientDniCif}
                    onChange={(e) => setRecipientDniCif(e.target.value)}
                    placeholder="Ej: B12345678"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Forma de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="TARJETA">Tarjeta Datáfono</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="BIZUM">Bizum</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Ítems / Conceptos de Factura</span>
                  <button type="button" onClick={handleAddItem} className="text-amber-400 text-xs hover:underline">
                    + Añadir Ítem
                  </button>
                </div>

                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 items-center">
                    <input
                      type="text"
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="col-span-6 bg-slate-900 border border-slate-800 text-white p-1 rounded text-[11px]"
                      placeholder="Descripción"
                    />
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="col-span-2 bg-slate-900 border border-slate-800 text-white p-1 rounded text-[11px] font-mono"
                      placeholder="Cant"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={it.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="col-span-2 bg-slate-900 border border-slate-800 text-emerald-400 p-1 rounded text-[11px] font-mono"
                      placeholder="Precio (€)"
                    />
                    <select
                      value={it.vatRate}
                      onChange={(e) => handleItemChange(idx, 'vatRate', parseInt(e.target.value))}
                      className="col-span-2 bg-slate-900 border border-slate-800 text-amber-400 p-1 rounded text-[11px]"
                    >
                      <option value={10}>10% IVA</option>
                      <option value={21}>21% IVA</option>
                      <option value={4}>4% IVA</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg">
                  Emitir Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
