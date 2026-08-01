import React, { useState } from 'react';
import { VacationRequest, AbsenceRecord, HREmployee, VacationStatus, AbsenceType } from '../../types/hr';
import { hrService } from '../../services/hrService';
import {
  Palmtree,
  Stethoscope,
  Plus,
  Check,
  X,
  Clock,
  Calendar,
  UserCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface Props {
  vacations: VacationRequest[];
  absences: AbsenceRecord[];
  employees: HREmployee[];
  onRefresh: () => void;
}

export const HRVacationsAbsences: React.FC<Props> = ({ vacations, absences, employees, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'VACACIONES' | 'AUSENCIAS'>('VACACIONES');
  const [isVacModalOpen, setIsVacModalOpen] = useState(false);
  const [isAbsModalOpen, setIsAbsModalOpen] = useState(false);

  // Form states
  const [vacForm, setVacForm] = useState({
    employeeId: employees[0]?.id || '',
    startDate: '2026-08-01',
    endDate: '2026-08-07',
    daysCount: 7,
  });

  const [absForm, setAbsForm] = useState({
    employeeId: employees[0]?.id || '',
    type: 'ENFERMEDAD' as AbsenceType,
    startDate: '2026-07-31',
    endDate: '2026-08-02',
    daysCount: 3,
    notes: '',
  });

  const handleCreateVacation = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === vacForm.employeeId);
    if (!emp) return;

    hrService.requestVacation({
      employeeId: emp.id,
      employeeName: `${emp.name} ${emp.surname}`,
      startDate: vacForm.startDate,
      endDate: vacForm.endDate,
      daysCount: vacForm.daysCount,
      year: 2026,
    });

    setIsVacModalOpen(false);
    onRefresh();
  };

  const handleResolveVacation = (id: string, status: VacationStatus) => {
    hrService.resolveVacation(id, status, 'Carlos García (Gerente)');
    onRefresh();
  };

  const handleCreateAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === absForm.employeeId);
    if (!emp) return;

    hrService.registerAbsence({
      employeeId: emp.id,
      employeeName: `${emp.name} ${emp.surname}`,
      type: absForm.type,
      startDate: absForm.startDate,
      endDate: absForm.endDate,
      daysCount: absForm.daysCount,
      notes: absForm.notes,
    });

    setIsAbsModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <Palmtree className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Gestión de Vacaciones y Ausencias</h3>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('VACACIONES')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'VACACIONES' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vacaciones
            </button>
            <button
              onClick={() => setActiveTab('AUSENCIAS')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'AUSENCIAS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ausencias & Bajas
            </button>
          </div>
        </div>

        {activeTab === 'VACACIONES' ? (
          <button
            onClick={() => setIsVacModalOpen(true)}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Solicitar Vacaciones</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAbsModalOpen(true)}
            className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ausencia / Baja</span>
          </button>
        )}
      </div>

      {activeTab === 'VACACIONES' ? (
        <div className="space-y-6">
          {/* Employee Balances Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.map((emp) => {
              const balance = hrService.getEmployeeVacationBalance(emp.id);
              return (
                <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <img src={emp.photoUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-white text-xs">{emp.name} {emp.surname}</p>
                      <p className="text-[10px] text-amber-400">{emp.position}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1 text-center font-mono text-xs">
                    <div className="bg-slate-950 p-1.5 rounded">
                      <span className="text-[9px] text-slate-500 block">Derecho</span>
                      <span className="font-bold text-slate-300">{balance.totalEntitled}d</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded">
                      <span className="text-[9px] text-slate-500 block">Usados</span>
                      <span className="font-bold text-emerald-400">{balance.enjoyed}d</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded">
                      <span className="text-[9px] text-slate-500 block">Saldo</span>
                      <span className="font-bold text-cyan-400">{balance.remaining}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vacations Requests List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm">Histórico & Solicitudes de Vacaciones</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Empleado</th>
                    <th className="p-3">Periodo</th>
                    <th className="p-3">Días Solicitados</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Fecha Solicitud</th>
                    <th className="p-3">Aprobado Por</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vacations.map((vac) => (
                    <tr key={vac.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{vac.employeeName}</td>
                      <td className="p-3 font-mono text-amber-400">
                        {vac.startDate} a {vac.endDate}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200">{vac.daysCount} días</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            vac.status === 'APROBADA'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : vac.status === 'RECHAZADA'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 animate-pulse'
                          }`}
                        >
                          {vac.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{vac.requestedAt}</td>
                      <td className="p-3 text-slate-300">{vac.approvedBy || '-'}</td>
                      <td className="p-3">
                        {vac.status === 'PENDIENTE' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleResolveVacation(vac.id, 'APROBADA')}
                              className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded"
                              title="Aprobar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResolveVacation(vac.id, 'RECHAZADA')}
                              className="p-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded"
                              title="Rechazar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Absences List */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-white text-sm">Registro de Ausencias y Bajas Médicas</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Empleado</th>
                  <th className="p-3">Tipo Ausencia</th>
                  <th className="p-3">Periodo</th>
                  <th className="p-3">Días</th>
                  <th className="p-3">Observaciones / SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {absences.map((abs) => (
                  <tr key={abs.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{abs.employeeName}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {abs.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-amber-400">
                      {abs.startDate} a {abs.endDate}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-200">{abs.daysCount} días</td>
                    <td className="p-3 text-slate-400">{abs.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Solicitar Vacaciones */}
      {isVacModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Palmtree className="w-5 h-5 text-amber-400" />
                <span>Solicitar Vacaciones</span>
              </h3>
              <button onClick={() => setIsVacModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVacation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Empleado</label>
                <select
                  value={vacForm.employeeId}
                  onChange={(e) => setVacForm({ ...vacForm, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.surname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={vacForm.startDate}
                    onChange={(e) => setVacForm({ ...vacForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={vacForm.endDate}
                    onChange={(e) => setVacForm({ ...vacForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Total Días Naturales</label>
                <input
                  type="number"
                  value={vacForm.daysCount}
                  onChange={(e) => setVacForm({ ...vacForm, daysCount: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsVacModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registar Ausencia */}
      {isAbsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-rose-400" />
                <span>Registrar Ausencia o Baja</span>
              </h3>
              <button onClick={() => setIsAbsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAbsence} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Empleado</label>
                <select
                  value={absForm.employeeId}
                  onChange={(e) => setAbsForm({ ...absForm, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.surname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Ausencia</label>
                <select
                  value={absForm.type}
                  onChange={(e) => setAbsForm({ ...absForm, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="ENFERMEDAD">Enfermedad Común (Baja Médica)</option>
                  <option value="PERMISO">Permiso Retribuido</option>
                  <option value="ACCIDENTE">Accidente Laboral</option>
                  <option value="MATERNIDAD">Maternidad</option>
                  <option value="PATERNIDAD">Paternidad</option>
                  <option value="FORMACION">Formación</option>
                  <option value="OTROS">Otros Motivos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={absForm.startDate}
                    onChange={(e) => setAbsForm({ ...absForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={absForm.endDate}
                    onChange={(e) => setAbsForm({ ...absForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Observaciones</label>
                <textarea
                  value={absForm.notes}
                  onChange={(e) => setAbsForm({ ...absForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white h-20"
                  placeholder="Justificante médico, número de colegiado..."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAbsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-rose-500/20"
                >
                  Registrar Ausencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
