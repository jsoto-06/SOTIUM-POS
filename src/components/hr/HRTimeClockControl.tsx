import React, { useState } from 'react';
import { TimeLog, HREmployee, TimeLogType } from '../../types/hr';
import { hrService } from '../../services/hrService';
import {
  Clock,
  LogOut,
  Coffee,
  RotateCw,
  MapPin,
  Laptop,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Key,
  UserCheck,
} from 'lucide-react';

interface Props {
  timeLogs: TimeLog[];
  employees: HREmployee[];
  onRefresh: () => void;
}

export const HRTimeClockControl: React.FC<Props> = ({ timeLogs, employees, onRefresh }) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [selectedType, setSelectedType] = useState<TimeLogType>('ENTRADA');
  const [logNotes, setLogNotes] = useState<string>('');

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  const handlePinPress = (digit: string) => {
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
      setPinError('');
    }
  };

  const handleClearPin = () => {
    setPinInput('');
    setPinError('');
  };

  const handleClockAction = (type: TimeLogType) => {
    if (!selectedEmployee) {
      setPinError('Seleccione un empleado.');
      return;
    }

    if (pinInput !== selectedEmployee.pin) {
      setPinError('PIN incorrecto. Intente de nuevo.');
      return;
    }

    try {
      hrService.registerTimeLog({
        employeeId: selectedEmployee.id,
        type,
        device: 'TERMINAL-TPV-CENTRAL',
        notes: logNotes,
      });

      setPinInput('');
      setPinError('');
      setLogNotes('');
      onRefresh();
      alert(`Fichaje de ${type} registrado correctamente para ${selectedEmployee.name}`);
    } catch (err: any) {
      setPinError(err.message || 'Error al registrar fichaje');
    }
  };

  const handleExportCSV = () => {
    const today = new Date().toISOString().substring(0, 10);
    const startDate = '2026-07-01';
    const csvContent = hrService.generateSpanishLaborExport(startDate, today);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registro_diario_jornada_${startDate}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* TPV Terminal Clock In / Out Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Clock className="w-5 h-5 animate-spin-slow" />
            <span>Terminal de Fichaje Presencial (RD 8/2019)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cumplimiento estricto del Registro Diario de Jornada en Hostelería España.
          </p>
        </div>

        {/* Employee Selector */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-400">Empleado:</label>
          <select
            value={selectedEmpId}
            onChange={(e) => {
              setSelectedEmpId(e.target.value);
              setPinInput('');
              setPinError('');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.surname} ({emp.position}) {emp.isClockedIn ? '🟢 Fichado' : '🔴 Ausente'}
              </option>
            ))}
          </select>
        </div>

        {/* Status indicator */}
        {selectedEmployee && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={selectedEmployee.photoUrl}
                alt={selectedEmployee.name}
                className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
              />
              <div>
                <p className="font-bold text-white text-sm">{selectedEmployee.name}</p>
                <p className="text-xs text-slate-400">{selectedEmployee.department}</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedEmployee.isClockedIn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedEmployee.isClockedIn ? 'FICHADO' : 'FUERA DE TURNO'}
              </span>
            </div>
          </div>
        )}

        {/* PIN Keyboard */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400">Introducir PIN TPV:</label>
          <div className="flex items-center justify-center bg-slate-950 border border-slate-800 rounded-xl py-3 tracking-[0.5em] font-mono text-2xl font-bold text-amber-400 h-14">
            {pinInput ? '•'.repeat(pinInput.length) : <span className="text-slate-700 text-sm tracking-normal">XXXX</span>}
          </div>
          {pinError && <p className="text-xs text-rose-400 font-semibold text-center">{pinError}</p>}

          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '←'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') handleClearPin();
                  else if (key === '←') setPinInput((prev) => prev.slice(0, -1));
                  else handlePinPress(key);
                }}
                className="py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl font-mono text-lg font-bold text-white transition-all active:scale-95"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleClockAction('ENTRADA')}
            className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <Clock className="w-4 h-4" />
            <span>FICHAR ENTRADA</span>
          </button>

          <button
            onClick={() => handleClockAction('SALIDA')}
            className="py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>FICHAR SALIDA</span>
          </button>

          <button
            onClick={() => handleClockAction('PAUSA_INICIO')}
            className="py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1 transition-all"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>INICIO PAUSA</span>
          </button>

          <button
            onClick={() => handleClockAction('PAUSA_FIN')}
            className="py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>FIN PAUSA</span>
          </button>
        </div>
      </div>

      {/* Labor Logs & Official Export Column */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Registro Diario de Jornada Registrado</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditoría oficial de entradas, salidas, pausas, geolocalización e IP.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Registro Inspección (CSV/PDF)</span>
          </button>
        </div>

        {/* Table of logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Empleado</th>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Tipo Fichaje</th>
                <th className="p-3">H. Ordinarias</th>
                <th className="p-3">H. Extra</th>
                <th className="p-3">H. Nocturnas</th>
                <th className="p-3">Geolocalización & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {timeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 font-semibold text-white">{log.employeeName}</td>
                  <td className="p-3 font-mono">
                    {log.date} <span className="text-amber-400">{log.timestamp.substring(11, 19)}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.type === 'ENTRADA'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.type === 'SALIDA'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-200">{log.ordinaryHours} h</td>
                  <td className="p-3 font-mono text-amber-400 font-bold">{log.overtimeHours} h</td>
                  <td className="p-3 font-mono text-cyan-400 font-bold">{log.nightHours} h</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span>{log.geolocation?.address || 'Restaurante Central'}</span>
                      <span className="font-mono text-slate-500">({log.ip})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
