import React, { useState } from 'react';
import { Article } from '../../types/inventory';
import { exportArticlesToCSV, downloadFile } from '../../services/inventoryService';
import { Download, Upload, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

interface ImportExportModalProps {
  articles: Article[];
  onImportArticles: (importedArticles: Article[]) => void;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  articles,
  onImportArticles,
  onClose,
}) => {
  const [csvRawText, setCsvRawText] = useState('');
  const [importPreview, setImportPreview] = useState<Partial<Article>[]>([]);
  const [importError, setImportError] = useState('');

  const handleExportCSV = () => {
    const csvContent = exportArticlesToCSV(articles);
    downloadFile(csvContent, `Inventario_Almacen_Enterprise_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleParseCSV = (text: string) => {
    setCsvRawText(text);
    setImportError('');
    try {
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setImportError('El archivo no contiene suficientes líneas de datos.');
        return;
      }

      const parsed: Partial<Article>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 3) {
          parsed.push({
            id: `art-imp-${Date.now()}-${i}`,
            internalCode: cols[1] || `ART-IMP-${i}`,
            barcode: cols[2] || `841000${Math.floor(100000 + Math.random() * 900000)}`,
            name: cols[4] || cols[0] || `Artículo Importado ${i}`,
            family: cols[5] || 'General',
            type: 'MATERIA_PRIMA',
            stock: parseFloat(cols[7]) || 10,
            unit: 'kg',
            purchasePrice: parseFloat(cols[9]) || 5.0,
            averagePrice: parseFloat(cols[10]) || 5.0,
            salePrice: parseFloat(cols[11]) || 0,
            cost: parseFloat(cols[12]) || 5.0,
            margin: 0,
            minStock: 5,
            maxStock: 50,
            safetyStock: 8,
            hasExpiration: true,
            hasBatchControl: true,
            active: true,
          });
        }
      }

      setImportPreview(parsed);
    } catch (err: any) {
      setImportError('Error al procesar el archivo CSV. Verifica la estructura.');
    }
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;
    const finalArticles: Article[] = importPreview.map((p) => ({
      id: p.id || `art-${Date.now()}`,
      internalCode: p.internalCode || 'ART-IMP',
      barcode: p.barcode || '841000000000',
      ean13: p.barcode || '841000000000',
      ean128: '',
      qrCode: '',
      name: p.name || 'Sin Nombre',
      shortName: p.name || 'Sin Nombre',
      description: 'Importado de CSV',
      photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      family: p.family || 'General',
      subfamily: 'General',
      type: p.type || 'MATERIA_PRIMA',
      primarySupplier: 'Proveedor CSV',
      brand: 'General',
      unit: p.unit || 'kg',
      vatRate: 10,
      purchasePrice: p.purchasePrice || 0,
      averagePrice: p.averagePrice || 0,
      lastPrice: p.purchasePrice || 0,
      salePrice: p.salePrice || 0,
      cost: p.cost || 0,
      margin: 0,
      minStock: 5,
      maxStock: 50,
      safetyStock: 8,
      hasExpiration: true,
      hasBatchControl: true,
      active: true,
      stock: p.stock || 0,
    }));

    onImportArticles(finalArticles);
    alert(`Se han importado exitosamente ${finalArticles.length} artículos al catálogo.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white">Importación / Exportación Masiva de Artículos</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">
            ✕ Cerrar
          </button>
        </div>

        {/* Section 1: Export */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <h4 className="font-mono font-bold text-amber-400 uppercase flex items-center space-x-1">
            <Download className="w-4 h-4 inline" />
            <span>Exportar Catálogo de Almacén Actual</span>
          </h4>
          <p className="text-slate-400">
            Descarga la plantilla oficial en formato CSV compatible con Excel, ERPs comerciales e ICG/Ágora.
          </p>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Catálogo a CSV ({articles.length} Artículos)</span>
          </button>
        </div>

        {/* Section 2: Import */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="font-mono font-bold text-cyan-400 uppercase flex items-center space-x-1">
            <Upload className="w-4 h-4 inline" />
            <span>Importar Archivo CSV / Excel</span>
          </h4>

          <textarea
            rows={4}
            value={csvRawText}
            onChange={(e) => handleParseCSV(e.target.value)}
            placeholder="Pega aquí el contenido CSV o arrastra la estructura del archivo..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] focus:outline-none"
          />

          {importError && (
            <div className="p-2 bg-red-950/60 border border-red-500/40 text-red-300 text-[11px] rounded-lg">
              {importError}
            </div>
          )}

          {importPreview.length > 0 && (
            <div className="space-y-2">
              <span className="text-emerald-400 font-bold block">
                ✓ Se detectaron {importPreview.length} artículos listos para importar.
              </span>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Importación Masiva</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
