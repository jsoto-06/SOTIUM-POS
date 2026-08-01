import React, { useState } from 'react';
import { TPVHardwareConfig, PrinterDevice, CashDrawerDevice, DisplayDevice } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Printer, Monitor, HardDrive, Network, Plus, Play, CheckCircle2, AlertCircle, Save, Wifi } from 'lucide-react';

interface Props {
  hardware: TPVHardwareConfig;
  onUpdate: () => void;
}

export const TPVHardwareTab: React.FC<Props> = ({ hardware, onUpdate }) => {
  const [config, setConfig] = useState<TPVHardwareConfig>(hardware);
  const [testResult, setTestResult] = useState<{ id: string; msg: string; success: boolean } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddPrinterModal, setShowAddPrinterModal] = useState(false);

  const [newPrinter, setNewPrinter] = useState<Omit<PrinterDevice, 'id'>>({
    name: '',
    type: 'ESC_POS',
    ipAddress: '192.168.1.110',
    port: 9100,
    assignedZone: 'BAR',
    paperWidth: '80mm',
    status: 'ONLINE',
    autoCut: true,
    openDrawer: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    backofficeService.updateTPVHardwareConfig(config);
    setSuccessMsg('Configuración de hardware TPV actualizada.');
    onUpdate();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleTestPrinter = (printerId: string) => {
    const res = backofficeService.testPrinterDevice(printerId);
    setTestResult({ id: printerId, msg: `${res.message} (${res.latencyMs}ms)`, success: res.success });
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    backofficeService.addPrinterDevice(newPrinter);
    setShowAddPrinterModal(false);
    onUpdate();
    setConfig(backofficeService.getTPVHardwareConfig());
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Printer className="w-6 h-6 text-amber-400" />
            Configuración TPV & Hardware Enterprise
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Series numéricas de comprobantes, impresoras térmicas ESC/POS, cajones portamonedas, monitores KDS y PDAs de comanda.
          </p>
        </div>

        <button
          onClick={() => setShowAddPrinterModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Impresora
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Series & Billing Numeration */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2">
          Series Numéricas de Facturación & TPV
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Serie Tickets TPV</label>
            <input
              type="text"
              value={config.ticketSeries}
              onChange={(e) => setConfig({ ...config, ticketSeries: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Serie Facturas Ordinarias</label>
            <input
              type="text"
              value={config.invoiceSeries}
              onChange={(e) => setConfig({ ...config, invoiceSeries: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Serie Facturas Rectificativas</label>
            <input
              type="text"
              value={config.creditNoteSeries}
              onChange={(e) => setConfig({ ...config, creditNoteSeries: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Printers List */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center justify-between">
          <span>Red de Impresoras Térmicas ESC/POS</span>
          <span className="text-xs text-slate-400 font-normal">{config.printers.length} dispositivos registrados</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.printers.map((prn) => (
            <div key={prn.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm">{prn.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    prn.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {prn.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>IP / Puerto:</span>
                    <span className="text-slate-200">{prn.ipAddress}:{prn.port || 9100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zona Asignada:</span>
                    <span className="text-amber-300 font-sans font-medium">{prn.assignedZone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Papel:</span>
                    <span className="text-slate-200">{prn.paperWidth}</span>
                  </div>
                </div>
              </div>

              {testResult?.id === prn.id && (
                <div className={`p-2 rounded text-[11px] font-mono ${testResult.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'}`}>
                  {testResult.msg}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Corte Auto: {prn.autoCut ? 'SÍ' : 'NO'}</span>
                <button
                  type="button"
                  onClick={() => handleTestPrinter(prn.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-medium flex items-center gap-1 border border-slate-700"
                >
                  <Play className="w-3 h-3" />
                  Test Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Drawers & Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drawers */}
        <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Cajones Portamonedas
          </h3>

          <div className="space-y-3">
            {config.cashDrawers.map((cdr) => (
              <div key={cdr.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{cdr.name}</span>
                  <span className="text-slate-400 text-[11px]">Conexión: {cdr.connectionType} | Impresora: {cdr.connectedPrinterId}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono font-bold">
                  {cdr.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Displays */}
        <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Monitores Visor & Pantallas KDS
          </h3>

          <div className="space-y-3">
            {config.displays.map((dsp) => (
              <div key={dsp.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{dsp.name}</span>
                  <span className="text-slate-400 text-[11px] font-mono">{dsp.type} ({dsp.resolution})</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono font-bold">
                  {dsp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
        >
          <Save className="w-5 h-5" />
          Guardar Hardware TPV
        </button>
      </div>

      {/* Add Printer Modal */}
      {showAddPrinterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
              Añadir Nueva Impresora Térmica
            </h3>

            <form onSubmit={handleAddPrinter} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nombre Impresora</label>
                <input
                  type="text"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                  placeholder="Ej: Impresora Terraza 2"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Dirección IP</label>
                  <input
                    type="text"
                    value={newPrinter.ipAddress}
                    onChange={(e) => setNewPrinter({ ...newPrinter, ipAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Zona Asignada</label>
                  <select
                    value={newPrinter.assignedZone}
                    onChange={(e) => setNewPrinter({ ...newPrinter, assignedZone: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="BAR">BAR</option>
                    <option value="COCINA_1">COCINA_1</option>
                    <option value="COCINA_2">COCINA_2</option>
                    <option value="POSTRES">POSTRES</option>
                    <option value="CAJA_PRINCIPAL">CAJA_PRINCIPAL</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPrinterModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold"
                >
                  Guardar Impresora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
