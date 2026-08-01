import React, { useState } from 'react';
import { BackupRecord, BackupScheduleConfig } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Database, HardDrive, ShieldCheck, Play, RotateCcw, Clock, CheckCircle2, Save } from 'lucide-react';

interface Props {
  backups: BackupRecord[];
  schedule: BackupScheduleConfig;
  onUpdate: () => void;
}

export const BackupDisasterTab: React.FC<Props> = ({ backups: initialBackups, schedule: initialSchedule, onUpdate }) => {
  const [backups, setBackups] = useState<BackupRecord[]>(initialBackups);
  const [sched, setSched] = useState<BackupScheduleConfig>(initialSchedule);
  const [successMsg, setSuccessMsg] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateManualBackup = () => {
    setIsCreating(true);
    setTimeout(() => {
      backofficeService.createBackup('MANUAL');
      setIsCreating(false);
      onUpdate();
      setBackups(backofficeService.getBackups());
      setSuccessMsg('Nueva copia de seguridad cifrada creada correctamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1200);
  };

  const handleRestore = (id: string) => {
    if (confirm('¿Está seguro de restaurar el estado completo de la base de datos desde esta copia?')) {
      const res = backofficeService.restoreBackup(id);
      setSuccessMsg(res.message);
      onUpdate();
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    backofficeService.updateBackupScheduleConfig(sched);
    onUpdate();
    setSuccessMsg('Programación de copias de seguridad guardada.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" />
            Copias de Seguridad & Disaster Recovery Enterprise
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Backups automáticos cifrados AES-256, sincronización local y cloud, verificación de integridad MD5 y puntos de restauración.
          </p>
        </div>

        <button
          onClick={handleCreateManualBackup}
          disabled={isCreating}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 text-sm"
        >
          <Play className="w-4 h-4" />
          {isCreating ? 'Generando Backup...' : 'Crear Backup Manual Ahora'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Histórico de Copias de Seguridad Disponibles ({backups.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Nombre Archivo / Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Tamaño</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Checksum MD5</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-medium text-white">
                    <div className="font-mono text-amber-300">{b.fileName}</div>
                    <div className="text-[11px] text-slate-400">{new Date(b.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[10px]">
                      {b.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-200">{b.fileSizeMb} MB</td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">{b.storageLocation}</td>
                  <td className="p-3 font-mono text-slate-500 text-[10px]">{b.checksumMd5.substring(0, 16)}...</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleRestore(b.id)}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded text-xs font-semibold flex items-center gap-1 ml-auto border border-slate-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Settings */}
      <form onSubmit={handleSaveSchedule} className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Programación de Copias Automáticas & Políticas de Retención
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Frecuencia Automática</label>
            <select
              value={sched.frequency}
              onChange={(e) => setSched({ ...sched, frequency: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="HOURLY">Cada Hora</option>
              <option value="DAILY">Diaria</option>
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensual</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Hora de Ejecución (Servidor)</label>
            <input
              type="text"
              value={sched.timeOfDay}
              onChange={(e) => setSched({ ...sched, timeOfDay: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Días de Retención en Disco</label>
            <input
              type="number"
              value={sched.retentionDays}
              onChange={(e) => setSched({ ...sched, retentionDays: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-2 text-xs"
          >
            <Save className="w-4 h-4" />
            Guardar Programación
          </button>
        </div>
      </form>
    </div>
  );
};
