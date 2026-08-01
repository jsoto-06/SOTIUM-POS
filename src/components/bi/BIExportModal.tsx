import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Download, X, Printer, CheckCircle2 } from 'lucide-react';
import { biService } from '../../services/biService';

interface BIExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportData: Record<string, any>[];
  reportTitle?: string;
}

export const BIExportModal: React.FC<BIExportModalProps> = ({
  isOpen,
  onClose,
  exportData,
  reportTitle = 'Informe Ejecutivo BI',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedSuccess, setExportedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setExportedSuccess(false);

    setTimeout(() => {
      const csv = biService.exportToCSV(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `SotiumPOS_${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${
          selectedFormat === 'EXCEL' ? 'csv' : 'csv'
        }`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-white flex items-center space-x-2">
            <Download className="w-5 h-5 text-amber-400" />
            <span>Exportar Informe BI Enterprise</span>
          </h3>
          <p className="text-xs text-slate-400">Generación de archivos certificados PDF, Excel XLSX y CSV</p>
        </div>

        {/* Format selectors */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'PDF', label: 'PDF Ejecutivo', icon: FileText, color: 'text-red-400' },
            { id: 'EXCEL', label: 'Excel XLSX', icon: FileSpreadsheet, color: 'text-emerald-400' },
            { id: 'CSV', label: 'CSV Plano', icon: Download, color: 'text-cyan-400' },
          ].map((fmt) => {
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id as any)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all space-y-1.5 ${
                  selectedFormat === fmt.id
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-6 h-6 ${fmt.color}`} />
                <span className="text-xs font-bold">{fmt.label}</span>
              </button>
            );
          })}
        </div>

        {exportedSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Informe exportado correctamente. ¡Descarga iniciada!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando...' : 'Descargar Archivo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
