import React, { useState } from 'react';
import { TemperatureEquipment, TemperatureLog } from '../../types/qualityHaccp';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { Thermometer, AlertOctagon, CheckCircle2, Clock, Plus, Download, UserCheck } from 'lucide-react';

export const TemperatureLogsManager: React.FC = () => {
  const [equipment, setEquipment] = useState<TemperatureEquipment[]>(QualityHaccpService.getTemperatureEquipment());
  const [logs, setLogs] = useState<TemperatureLog[]>(QualityHaccpService.getTemperatureLogs());

  const [selectedEqId, setSelectedEqId] = useState<string>(equipment[0]?.id || '');
  const [enteredTemp, setEnteredTemp] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('David García (Cocinero)');
  const [notes, setNotes] = useState<string>('');
  const [signature, setSignature] = useState<string>('D. García');
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const handleLogTemperature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId || enteredTemp === '') return;

    const result = QualityHaccpService.logTemperature(
      selectedEqId,
      Number(enteredTemp),
      operatorName,
      notes,
      undefined,
      signature,
      operatorName
    );

    setEquipment(QualityHaccpService.getTemperatureEquipment());
    setLogs(QualityHaccpService.getTemperatureLogs());
    setEnteredTemp('');
    setNotes('');

    if (result.alertTriggered) {
      setAlertBanner(`¡ALERTA CRÍTICA! La lectura de ${enteredTemp}ºC supera los límites de seguridad permitidos.`);
    } else {
      setAlertBanner(null);
    }
  };

  const alertingEquipmentCount = equipment.filter((e) => e.isAlerting).length;

  return (
    <div className="space-y-6">
      {/* Alert Banner if any equipment is out of thresholds */}
      {alertingEquipmentCount > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/50 p-4 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 text-red-400 font-bold text-sm">
            <AlertOctagon className="w-6 h-6 shrink-0" />
            <span>
              ¡ALERTA SANITARIA! {alertingEquipmentCount} equipo(s) con temperatura fuera de límites de seguridad APPCC.
            </span>
          </div>
          <span className="text-xs bg-red-500 text-white font-mono px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
            Acción Inmediata Requerida
          </span>
        </div>
      )}

      {alertBanner && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-lg text-amber-300 text-xs font-semibold flex items-center justify-between">
          <span>{alertBanner}</span>
          <button onClick={() => setAlertBanner(null)} className="text-amber-400 hover:text-white font-bold text-sm">✕</button>
        </div>
      )}

      {/* Equipment Cards Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-amber-400" />
          <span>Equipos de Frío, Calor y Lavado Monitorizados ({equipment.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((eq) => (
            <div
              key={eq.id}
              onClick={() => setSelectedEqId(eq.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                eq.isAlerting
                  ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10'
                  : selectedEqId === eq.id
                  ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono bg-slate-950 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-bold">
                  {eq.code}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                    eq.isAlerting ? 'bg-red-500 text-white animate-bounce' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {eq.isAlerting ? '¡Fuera de Rango!' : 'Normal'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{eq.name}</h4>
              <p className="text-xs text-slate-400 mb-3">{eq.location}</p>

              <div className="flex items-end justify-between border-t border-slate-800 pt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Rango Permitido</span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {eq.minTemp}ºC a {eq.maxTemp}ºC
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Última Lectura</span>
                  <span
                    className={`text-lg font-mono font-extrabold ${
                      eq.isAlerting ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {eq.lastReadingTemp !== undefined ? `${eq.lastReadingTemp}ºC` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Temperature Registration Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Plus className="w-4 h-4" />
            <span>Registrar Control Térmico</span>
          </h3>

          <form onSubmit={handleLogTemperature} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Equipo Seleccionado</label>
              <select
                value={selectedEqId}
                onChange={(e) => setSelectedEqId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
              >
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.code} - {eq.name} ({eq.minTemp}ºC a {eq.maxTemp}ºC)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Temperatura Medida (ºC)</label>
              <input
                type="number"
                step="0.1"
                required
                value={enteredTemp}
                onChange={(e) => setEnteredTemp(e.target.value)}
                placeholder="2.5"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-amber-400 font-mono text-lg font-bold text-center focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Operario / Cocinero</label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Firma Digital Operario</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Nombre / Rúbrica"
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Observaciones / Acción Correctiva</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indique cualquier desviación o ajuste efectuado..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Guardar Lectura y Validar</span>
            </button>
          </form>
        </div>

        {/* Temperature History Logs Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Histórico de Lecturas de Temperatura ({logs.length})</span>
            </h3>

            <a
              href="/api/quality/export/temp-csv"
              target="_blank"
              rel="noreferrer"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto max-h-[420px] scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="p-2.5">Fecha / Hora</th>
                  <th className="p-2.5">Equipo</th>
                  <th className="p-2.5">Temp Medida</th>
                  <th className="p-2.5">Estado</th>
                  <th className="p-2.5">Operario</th>
                  <th className="p-2.5">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="p-2.5 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                    <td className="p-2.5 font-semibold text-white">{log.equipmentName}</td>
                    <td className="p-2.5">
                      <span
                        className={`font-mono font-bold text-sm ${
                          log.isWithinLimits ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {log.temperature}ºC
                      </span>
                    </td>
                    <td className="p-2.5">
                      {log.isWithinLimits ? (
                        <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">
                          OK
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded text-[10px]">
                          DESVIACIÓN
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-300">{log.operatorName}</td>
                    <td className="p-2.5 text-slate-400 italic text-[11px]">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
