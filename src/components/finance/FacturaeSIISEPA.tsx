import React, { useState } from 'react';
import { FacturaeXMLPayload, SIIRecord, SEPARemittance, TaxModel303, TaxModel390, TaxModel347Item, RetentionSummary } from '../../types/finance';
import {
  ShieldCheck,
  FileCode,
  Download,
  Send,
  Building2,
  CheckCircle2,
  FileText,
  CreditCard,
  Lock,
} from 'lucide-react';

interface Props {
  onGenerateFacturae: (invoiceId: string) => FacturaeXMLPayload;
  siiRecords: SIIRecord[];
  taxModel303: TaxModel303;
  taxModel390: TaxModel390;
  taxModel347: TaxModel347Item[];
  retentionSummary: RetentionSummary;
  onGenerateSEPA: () => void;
}

export const FacturaeSIISEPA: React.FC<Props> = ({
  onGenerateFacturae,
  siiRecords,
  taxModel303,
  taxModel390,
  taxModel347,
  retentionSummary,
  onGenerateSEPA,
}) => {
  const [activeTab, setActiveTab] = useState<'facturae' | 'sii' | 'sepa' | 'modelos'>('facturae');
  const [xmlOutput, setXmlOutput] = useState<string>('');
  const [generatedSEPARef, setGeneratedSEPARef] = useState<string>('');

  const handleGenerateFacturaeSample = () => {
    const res = onGenerateFacturae('inv-1001');
    setXmlOutput(res.xmlString);
  };

  const handleCreateSEPA = () => {
    onGenerateSEPA();
    setGeneratedSEPARef(`SEPA-PAIN-008-${Date.now().toString().substring(6)}`);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('facturae')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            activeTab === 'facturae' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Facturae 3.2.2 XML</span>
        </button>

        <button
          onClick={() => setActiveTab('sii')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            activeTab === 'sii' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>SII AEAT Suministro Inmediato</span>
        </button>

        <button
          onClick={() => setActiveTab('sepa')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            activeTab === 'sepa' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>SEPA ISO 20022 XML</span>
        </button>

        <button
          onClick={() => setActiveTab('modelos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            activeTab === 'modelos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Modelos Fiscales IVA (303/390/347)</span>
        </button>
      </div>

      {/* VIEW 1: FACTURAE 3.2.2 */}
      {activeTab === 'facturae' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>Generador Oficial Facturae 3.2.2 (España FACe / AAPP)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Firma electrónica XMLDsig y códigos de administración pública DIR3</p>
            </div>

            <button
              onClick={handleGenerateFacturaeSample}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-md"
            >
              <FileCode className="w-4 h-4" />
              <span>Generar y Validar XML Facturae</span>
            </button>
          </div>

          {xmlOutput ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" /> <span>Esquema XML 3.2.2 Validado Correctamente</span>
                </span>
                <button
                  onClick={() => {
                    const blob = new Blob([xmlOutput], { type: 'text/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Facturae_3.2.2_F2026-00042.xml';
                    a.click();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1 rounded text-xs flex items-center space-x-1 font-bold"
                >
                  <Download className="w-3.5 h-3.5" /> <span>Descargar Fichero XML</span>
                </button>
              </div>

              <textarea
                readOnly
                value={xmlOutput}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300/90 p-3 rounded-lg focus:outline-none"
              />
            </div>
          ) : (
            <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center space-y-2 text-slate-400 text-xs">
              <FileCode className="w-8 h-8 mx-auto text-slate-600" />
              <p>Haga clic en el botón superior para generar el fichero XML Facturae 3.2.2 de la factura F2026-00042.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SII AEAT */}
      {activeTab === 'sii' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>SII (Suministro Inmediato de Información AEAT)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Envío de libros de registro de facturas emitidas y recibidas en 4 días</p>
            </div>

            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5" /> <span>Canal AEAT Conectado</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Factura #</th>
                  <th className="py-2.5 px-3">Tipo Operación</th>
                  <th className="py-2.5 px-3">Contraparte / CIF</th>
                  <th className="py-2.5 px-3 text-right">Base Imponible (€)</th>
                  <th className="py-2.5 px-3 text-right">Cuota IVA (€)</th>
                  <th className="py-2.5 px-3 text-center">Estado AEAT</th>
                  <th className="py-2.5 px-3 text-mono font-mono text-center">Código Seguro Verificación (CSV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {siiRecords.map((sii) => (
                  <tr key={sii.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{sii.invoiceNumber}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">{sii.invoiceType}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-white">{sii.counterpartyName}</span>
                      <span className="block text-slate-500 text-[10px] font-mono">{sii.counterpartyDniCif}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{sii.taxableBase.toFixed(2)} €</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{sii.vatAmount.toFixed(2)} €</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        {sii.aeatStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-cyan-400">{sii.aeatCsvCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: SEPA ISO 20022 */}
      {activeTab === 'sepa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Gestor de Remesas SEPA ISO 20022 XML</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Normativa Bancaria Europea pain.008.001.02 (Adeudos Directos CORE/B2B)</p>
            </div>

            <button
              onClick={handleCreateSEPA}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-md"
            >
              <CreditCard className="w-4 h-4" />
              <span>Generar Fichero Remesa SEPA XML</span>
            </button>
          </div>

          {generatedSEPARef ? (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" /> <span>Remesa SEPA {generatedSEPARef} generada con éxito</span>
                </span>
                <span className="text-slate-400 font-mono">Fichero ISO 20022 pain.008.001.02</span>
              </div>
              <p className="text-xs text-slate-300">
                La remesa incluye 2 recibos de clientes por importe total de <strong>6.200,00 €</strong> listos para ser transmitidos a la banca online de BBVA/CaixaBank.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">Haga clic en el botón superior para emitir la remesa de adeudos SEPA.</p>
          )}
        </div>
      )}

      {/* VIEW 4: MODELOS FISCALES IVA */}
      {activeTab === 'modelos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Modelo 303 AEAT (Autoliquidación IVA Trimestral)</span>
              </h3>
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                {taxModel303.period}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span>Ventas 10% IVA (Base / Cuota):</span>
                <span>
                  {taxModel303.taxableBaseReduced.toFixed(2)}€ / <strong className="text-emerald-400">{taxModel303.vatReduced.toFixed(2)}€</strong>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span>Ventas 21% IVA (Base / Cuota):</span>
                <span>
                  {taxModel303.taxableBaseGeneral.toFixed(2)}€ / <strong className="text-emerald-400">{taxModel303.vatGeneral.toFixed(2)}€</strong>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300 font-bold">
                <span>Total IVA Repercutido:</span>
                <span className="text-emerald-400">+{taxModel303.totalVatRepercutido.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                <span>(-) Total IVA Soportado Deducible Compras:</span>
                <span className="text-rose-400">-{taxModel303.totalVatSoportado.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-2.5 bg-amber-500 text-slate-950 px-3 rounded-lg font-bold text-sm">
                <span>(=) RESULTADO A INGRESAR EN HACIENDA:</span>
                <span>+{taxModel303.resultToPayOrReturn.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Modelo 347 (Declaración Operaciones &gt; 3.005,06€)</span>
              </h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Anual 2026</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-2">CIF/NIF</th>
                    <th className="py-2 px-2">Razón Social</th>
                    <th className="py-2 px-2 text-right">Acumulado Anual (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {taxModel347.map((m) => (
                    <tr key={m.dniCif}>
                      <td className="py-2 px-2 font-mono text-amber-400">{m.dniCif}</td>
                      <td className="py-2 px-2 text-white font-medium">{m.name}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">{m.totalAnnualAmount.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
