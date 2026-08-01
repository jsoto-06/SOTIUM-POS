import React, { useState } from 'react';
import { SupplierDeliveryNote, Supplier, SupplierInvoice } from '../../types/purchases';
import { FileCheck, Search, Building2, Calendar, FileText, ArrowRight, CheckCircle } from 'lucide-react';

interface AlbaranesManagerProps {
  deliveryNotes: SupplierDeliveryNote[];
  suppliers: Supplier[];
  onConvertToInvoice: (selectedNotes: SupplierDeliveryNote[]) => void;
}

export const AlbaranesManager: React.FC<AlbaranesManagerProps> = ({
  deliveryNotes,
  suppliers,
  onConvertToInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  const filteredNotes = deliveryNotes.filter((dn) => {
    const matchesSearch =
      dn.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dn.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'ALL' || dn.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectNote = (id: string) => {
    if (selectedNoteIds.includes(id)) {
      setSelectedNoteIds(selectedNoteIds.filter((i) => i !== id));
    } else {
      setSelectedNoteIds([...selectedNoteIds, id]);
    }
  };

  const handleConvertSelected = () => {
    const selectedObj = deliveryNotes.filter((dn) => selectedNoteIds.includes(dn.id));
    if (selectedObj.length) {
      onConvertToInvoice(selectedObj);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Albaranes de Entrada</h2>
            <p className="text-xs text-slate-400">
              Control de albaranes de mercancía recepcionada y agrupación para generación de facturas de proveedor
            </p>
          </div>
        </div>

        <button
          onClick={handleConvertSelected}
          disabled={selectedNoteIds.length === 0}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all text-sm disabled:opacity-50"
        >
          <span>Facturar Albaranes Seleccionados ({selectedNoteIds.length})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nº Albarán o Proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
        </div>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
        >
          <option value="ALL">Todos los Albaranes</option>
          <option value="PENDIENTE_FACTURAR">Pendientes de Facturar</option>
          <option value="FACTURADO">Facturados</option>
        </select>
      </div>

      {/* Table of Albaranes */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3.5 text-center">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedNoteIds(filteredNotes.map((n) => n.id));
                    } else {
                      setSelectedNoteIds([]);
                    }
                  }}
                  checked={selectedNoteIds.length === filteredNotes.length && filteredNotes.length > 0}
                />
              </th>
              <th className="p-3.5">Nº Albarán</th>
              <th className="p-3.5">Proveedor</th>
              <th className="p-3.5">Fecha Entrada</th>
              <th className="p-3.5">Almacén Destino</th>
              <th className="p-3.5 text-right">Base Imponible</th>
              <th className="p-3.5 text-right">Total Albarán</th>
              <th className="p-3.5 text-center">Estado Facturación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {filteredNotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                  No hay albaranes registrados.
                </td>
              </tr>
            ) : (
              filteredNotes.map((dn) => {
                const isSelected = selectedNoteIds.includes(dn.id);
                return (
                  <tr key={dn.id} className="hover:bg-slate-800/50">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectNote(dn.id)}
                      />
                    </td>
                    <td className="p-3.5 font-mono font-bold text-amber-400">{dn.deliveryNumber}</td>
                    <td className="p-3.5 font-bold text-white">{dn.supplierName}</td>
                    <td className="p-3.5 font-mono text-slate-400">{dn.date.substring(0, 10)}</td>
                    <td className="p-3.5 text-slate-300">{dn.warehouseName}</td>
                    <td className="p-3.5 text-right font-mono">{dn.taxBase.toFixed(2)} €</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      {dn.grandTotal.toFixed(2)} €
                    </td>
                    <td className="p-3.5 text-center">
                      {dn.status === 'PENDIENTE_FACTURAR' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          PENDIENTE FACTURAR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          FACTURADO
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
