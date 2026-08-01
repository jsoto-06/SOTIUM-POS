import React, { useState } from 'react';
import { backofficeService } from '../../services/backofficeService';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onUpdate: () => void;
}

export const DataImportExportTab: React.FC<Props> = ({ onUpdate }) => {
  const [importJson, setImportJson] = useState('');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleExportJSON = () => {
    const jsonStr = backofficeService.exportAllSettings();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SotiumPOS_Global_Settings_${Date.now()}.json`;
    a.click();
    setMsg('Archivo JSON de configuración exportado correctamente.');
    setIsError(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;
    const res = backofficeService.importAllSettings(importJson);
    setIsError(!res.success);
    setMsg(res.message);
    if (res.success) {
      setImportJson('');
      onUpdate();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setImportJson(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            Importación & Exportación Masiva (JSON, CSV, Excel)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Respaldar o migrar la configuración completa del ERP, catálogo de impuestos, usuarios y hardware entre instalaciones.
          </p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${isError ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'}`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Configuración Completa
          </h3>

          <p className="text-xs text-slate-300">
            Descargue un paquete JSON con todos los parámetros globales de la empresa, series TPV, red de impresoras, usuarios, políticas de seguridad y reglas de alertas.
          </p>

          <button
            onClick={handleExportJSON}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Descargar Archivo JSON de Configuración
          </button>
        </div>

        {/* Import */}
        <form onSubmit={handleImport} className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar o Restaurar Configuración
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cargar Archivo JSON</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-amber-300 hover:file:bg-slate-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">O Pegar Contenido JSON</label>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="{ 'company': { ... } }"
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition-colors border border-slate-600"
          >
            Procesar e Importar
          </button>
        </form>
      </div>
    </div>
  );
};
