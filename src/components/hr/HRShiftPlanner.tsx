import React, { useState } from 'react';
import { WorkShift, HREmployee, ShiftType, ShiftRosterSummary } from '../../types/hr';
import { hrService } from '../../services/hrService';
import {
  Calendar as CalendarIcon,
  Clock,
  Euro,
  Users,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Props {
  shifts: WorkShift[];
  employees: HREmployee[];
  onRefresh: () => void;
}

export const HRShiftPlanner: React.FC<Props> = ({ shifts, employees, onRefresh }) => {
  const [viewMode, setViewMode] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-31');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // New Shift state
  const [newShift, setNewShift] = useState<{
    employeeId: string;
    date: string;
    shiftType: ShiftType;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    plannedHours: number;
    estimatedLaborCost: number;
  }>({
    employeeId: employees[0]?.id || '',
    date: '2026-07-31',
    shiftType: 'MANANA',
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 30,
    plannedHours: 7.5,
    estimatedLaborCost: 110.0,
  });

  const rosterSummary: ShiftRosterSummary[] = hrService.getRosterSummary(selectedDate);

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newShift.employeeId);
    if (!emp) return;

    hrService.createShift({
      ...newShift,
      employeeName: `${emp.name} ${emp.surname}`,
    });

    setIsAssignModalOpen(false);
    onRefresh();
  };

  const handleSwapRequest = (shiftId: string) => {
    const targetEmpId = prompt('Ingrese ID o Seleccione Empleado para la permuta:');
    if (targetEmpId) {
      hrService.requestShiftSwap(shiftId, targetEmpId);
      onRefresh();
    }
  };

  const shiftTypeBadge = (type: ShiftType) => {
    switch (type) {
      case 'MANANA':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'TARDE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'NOCHE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'PARTIDO':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'LIBRE':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'VACACIONES':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'BAJA':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Planificador Inteligente de Turnos</h3>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('DAY')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'DAY' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'WEEK' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'MONTH' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mes
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-mono font-bold focus:outline-none"
          />

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar Turno</span>
          </button>
        </div>
      </div>

      {/* Roster Coverage Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rosterSummary.map((summary) => (
          <div
            key={summary.department}
            className={`p-4 rounded-xl border transition-all ${
              summary.isCovered
                ? 'bg-slate-900 border-slate-800'
                : 'bg-rose-950/20 border-rose-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Dpto. {summary.department}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  summary.isCovered ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {summary.isCovered ? 'COBERTURA OK' : 'FALTA PERSONAL'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Mínimo Req.</span>
                <span className="font-bold text-amber-400">{summary.minCoverageRequired}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Planificados</span>
                <span className="font-bold text-emerald-400">{summary.scheduledStaffCount}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Coste Est.</span>
                <span className="font-bold text-cyan-400">{summary.totalCost} €</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shifts Calendar / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="font-bold text-white text-sm">Cuadrante de Turnos ({selectedDate})</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Empleado</th>
                <th className="p-3">Tipo Turno</th>
                <th className="p-3">Horario</th>
                <th className="p-3">Descanso</th>
                <th className="p-3">Horas Previstas</th>
                <th className="p-3">Coste Estimado</th>
                <th className="p-3">Permuta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 font-semibold text-white">{shift.employeeName}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${shiftTypeBadge(shift.shiftType)}`}>
                      {shift.shiftType}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-amber-400">
                    {shift.startTime} - {shift.endTime}
                  </td>
                  <td className="p-3 font-mono text-slate-400">{shift.breakMinutes} min</td>
                  <td className="p-3 font-mono font-bold text-slate-200">{shift.plannedHours} h</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">{shift.estimatedLaborCost} €</td>
                  <td className="p-3">
                    {shift.swapStatus ? (
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                        {shift.swapStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwapRequest(shift.id)}
                        className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center space-x-1"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Solicitar Permuta</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Asignar Turno */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Asignar Turno de Trabajo</span>
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Empleado</label>
                <select
                  value={newShift.employeeId}
                  onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.surname} ({e.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Turno</label>
                  <select
                    value={newShift.shiftType}
                    onChange={(e) => setNewShift({ ...newShift, shiftType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="MANANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                    <option value="NOCHE">Noche</option>
                    <option value="PARTIDO">Partido</option>
                    <option value="LIBRE">Libre</option>
                    <option value="VACACIONES">Vacaciones</option>
                    <option value="BAJA">Baja Médica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Guardar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
