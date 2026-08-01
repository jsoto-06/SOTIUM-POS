import React, { useState } from 'react';
import { SupplierInvoice, Supplier, PaymentExpiration } from '../../types/purchases';
import { FileText, Plus, Search, Calendar, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SupplierInvoicesManagerProps {
  invoices: SupplierInvoice[];
  suppliers: Supplier[];
  onAddInvoice: (invoice: SupplierInvoice, expiration: PaymentExpiration) => void;
}

export const SupplierInvoicesManager: React.FC<SupplierInvoicesManagerProps> = ({
  invoices,
  suppliers,
  onAddInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`FACT-PROV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10));
  const [taxBase, setTaxBase] = useState<number>(500);
  const [vatRate, setVatRate] = useState<number>(21);
  const [notes, setNotes] = useState('');

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierCif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

    const vatTotal = Number((taxBase * (vatRate / 100)).toFixed(2));
    const grandTotal = Number((taxBase + vatTotal).toFixed(2));
    const dueDate = new Date(Date.now() + 86400000 * (supplier.paymentTermsDays || 30))
      .toISOString()
      .substring(0, 10);

    const invoiceId = `inv-${Date.now()}`;
    const expiration: PaymentExpiration = {
      id: `exp-${Date.now()}`,
      invoiceId,
      invoiceNumber,
      supplierId: supplier.id,
      supplierName: supplier.socialName,
      amount: grandTotal,
      dueDate,
      status: 'PENDIENTE',
      paymentMethod: supplier.paymentMethod,
      notes: `Vencimiento programado a ${supplier.paymentTermsDays} días`,
    };

    const newInvoice: SupplierInvoice = {
      id: invoiceId,
      invoiceNumber,
      supplierId: supplier.id,
      supplierName: supplier.socialName,
      supplierCif: supplier.cifNif,
      orderIds: [],
      deliveryNoteIds: [],
      issueDate,
      dueDate,
      taxBase,
      vatTotal,
      grandTotal,
      status: 'PENDIENTE_PAGO',
      expirations: [expiration],
      notes,
    };

    onAddInvoice(newInvoice, expiration);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Facturas de Proveedores</h2>
            <p className="text-xs text-slate-400">
              Registro de facturas recibidas, desglose de IVA soportado y generación automática de vencimientos de pago
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Factura Proveedor</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por Nº Factura, Proveedor o CIF/NIF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
        />
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3.5">Nº Factura</th>
              <th className="p-3.5">Proveedor</th>
              <th className="p-3.5">CIF/NIF</th>
              <th className="p-3.5">Fecha Emisión</th>
              <th className="p-3.5">Fecha Vencimiento</th>
              <th className="p-3.5 text-right">Base Imponible</th>
              <th className="p-3.5 text-right">Cuota IVA</th>
              <th className="p-3.5 text-right">Total Factura</th>
              <th className="p-3.5 text-center">Estado Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/50">
                <td className="p-3.5 font-mono font-bold text-amber-400">{inv.invoiceNumber}</td>
                <td className="p-3.5 font-bold text-white">{inv.supplierName}</td>
                <td className="p-3.5 font-mono text-slate-400">{inv.supplierCif}</td>
                <td className="p-3.5 font-mono text-slate-400">{inv.issueDate}</td>
                <td className="p-3.5 font-mono text-slate-400">{inv.dueDate}</td>
                <td className="p-3.5 text-right font-mono">{inv.taxBase.toFixed(2)} €</td>
                <td className="p-3.5 text-right font-mono text-slate-400">{inv.vatTotal.toFixed(2)} €</td>
                <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                  {inv.grandTotal.toFixed(2)} €
                </td>
                <td className="p-3.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'PAGADA'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : inv.status === 'VENCIDA'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Register Invoice */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Registrar Factura de Proveedor</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Proveedor *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.socialName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nº Factura Proveedor *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de IVA (%)</label>
                  <select
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value={21}>21% (General)</option>
                    <option value={10}>10% (Alimentación / Horeca)</option>
                    <option value={4}>4% (Superreducido)</option>
                    <option value={0}>0% (Exento)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Base Imponible (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={taxBase}
                    onChange={(e) => setTaxBase(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Total Factura (€)</label>
                  <input
                    type="text"
                    disabled
                    value={(taxBase + taxBase * (vatRate / 100)).toFixed(2) + ' €'}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-amber-400 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                >
                  Guardar y Generar Vencimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
