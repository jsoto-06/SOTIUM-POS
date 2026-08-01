import React, { useState } from 'react';
import { Customer } from '../../types/crm';
import { CRMService } from '../../services/crmService';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface CRMImportExportModalProps {
  customers: Customer[];
  onClose: () => void;
  onImportCustomers: (imported: Customer[]) => void;
}

export const CRMImportExportModal: React.FC<CRMImportExportModalProps> = ({
  customers,
  onClose,
  onImportCustomers,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [importCount, setImportCount] = useState<number | null>(null);

  const handleProcessImport = () => {
    if (!csvContent.trim()) return;
    const imported = CRMService.importCustomersFromCSV(csvContent);
    onImportCustomers(imported);
    setImportCount(imported.length);
  };

  const handleExportCSV = () => {
    const header = 'Código,Nombre,CIF/NIF,Email,Teléfono,Población,Provincia,Nivel,Puntos,ConsumoTotal\n';
    const rows = customers
      .map(
        (c) =>
          `"${c.code}","${c.name}","${c.cifNif}","${c.email}","${c.phone}","${c.mainAddress.city}","${c.mainAddress.province}","${c.loyalty.tier}",${c.loyalty.points},${c.loyalty.totalSpentLifetime}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `export_clientes_crm_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Importar / Exportar Datos de Clientes (CSV / Excel)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Option */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-white">Exportar Base de Datos Actual</h4>
            <p className="text-[11px] text-slate-400">Descarga {customers.length} fichas de clientes en formato CSV/Excel</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>

        {/* Import Option */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Pegar Contenido CSV para Importación Masiva
          </label>
          <p className="text-[10px] text-slate-400">
            Formato: Nombre, CIF/NIF, Email, Teléfono, Población, Provincia
          </p>
          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder={`Nombre,CIF/NIF,Email,Teléfono,Población,Provincia\nJuan Perez,12345678Z,juan@test.com,600111222,Madrid,Madrid`}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />

          {importCount !== null && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> ¡Se han importado exitosamente {importCount} clientes!
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
            Cerrar
          </button>
          <button
            onClick={handleProcessImport}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Procesar Importación
          </button>
        </div>
      </div>
    </div>
  );
};
