import React, { useState } from 'react';
import { DeliveryOrder } from '../../types/delivery';
import { DeliveryService } from '../../services/deliveryService';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface DeliveryImportExportModalProps {
  orders: DeliveryOrder[];
  onClose: () => void;
  onImportOrders: (imported: DeliveryOrder[]) => void;
}

export const DeliveryImportExportModal: React.FC<DeliveryImportExportModalProps> = ({
  orders,
  onClose,
  onImportOrders,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [importCount, setImportCount] = useState<number | null>(null);

  const handleProcessImport = () => {
    if (!csvContent.trim()) return;
    const imported = DeliveryService.importOrdersFromCSV(csvContent);
    onImportOrders(imported);
    setImportCount(imported.length);
  };

  const handleExportCSV = () => {
    const csvData = DeliveryService.exportOrdersToCSV(orders);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `export_pedidos_delivery_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Importar / Exportar Pedidos Delivery (CSV / Excel)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Option */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-white">Exportar Pedidos Registrados</h4>
            <p className="text-[11px] text-slate-400">Descarga {orders.length} pedidos en formato CSV/Excel</p>
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
            Formato: Código, Canal, Estado, Cliente, Teléfono, Dirección, Pago, Pagado, Total
          </p>
          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder={`Código,Canal,Estado,Cliente,Teléfono,Dirección,Pago,Pagado,Total\nDEL-2026-901,GLOVO,NUEVO,Carlos Ruiz,600111222,Calle Mayor 10,ONLINE,true,35.50`}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />

          {importCount !== null && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> ¡Se han importado exitosamente {importCount} pedidos!
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
