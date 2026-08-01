import React, { useState } from 'react';
import { PayrollReceipt, HRDocument, HREmployee } from '../../types/hr';
import { hrService } from '../../services/hrService';
import {
  FileText,
  BadgeEuro,
  Download,
  Plus,
  CheckCircle2,
  Lock,
  FileCode,
  Paperclip,
  Share2,
} from 'lucide-react';

interface Props {
  payrolls: PayrollReceipt[];
  employees: HREmployee[];
  onRefresh: () => void;
}

export const HRPayrollDocuments: React.FC<Props> = ({ payrolls, employees, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'NOMINAS' | 'DOCUMENTOS'>('NOMINAS');
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  // Form
  const [payrollForm, setPayrollForm] = useState({
    employeeId: employees[0]?.id || '',
    period: '2026-07',
    overtimeHoursCount: 4,
    comissionBonus: 100,
    otherComplements: 50,
  });

  const handleGeneratePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    hrService.generatePayroll(payrollForm);
    setIsPayrollModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <BadgeEuro className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Nóminas & Gestión Documental Laboral</h3>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('NOMINAS')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'NOMINAS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nóminas & Recibos
            </button>
            <button
              onClick={() => setActiveTab('DOCUMENTOS')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'DOCUMENTOS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Documentos & Firmas
            </button>
          </div>
        </div>

        {activeTab === 'NOMINAS' && (
          <button
            onClick={() => setIsPayrollModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generar Recibo de Nómina</span>
          </button>
        )}
      </div>

      {activeTab === 'NOMINAS' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-white text-sm">Pre-Nóminas & Desglose Salarial</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Empleado</th>
                  <th className="p-3">Periodo</th>
                  <th className="p-3">Salario Base</th>
                  <th className="p-3">H. Extra</th>
                  <th className="p-3">Complementos</th>
                  <th className="p-3">Bruto Total</th>
                  <th className="p-3">Retenciones (IRPF/SS)</th>
                  <th className="p-3">LÍQUIDO A PERCIBIR</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payrolls.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{pay.employeeName}</td>
                    <td className="p-3 font-mono text-amber-400 font-bold">{pay.period}</td>
                    <td className="p-3 font-mono text-slate-200">{pay.baseSalary.toLocaleString('es-ES')} €</td>
                    <td className="p-3 font-mono text-amber-300">
                      +{pay.overtimeAmount} € <span className="text-[10px] text-slate-500">({pay.overtimeHoursCount}h)</span>
                    </td>
                    <td className="p-3 font-mono text-cyan-300">+{pay.comissionBonus + pay.nightBonus + pay.otherComplements} €</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{pay.grossTotal.toLocaleString('es-ES')} €</td>
                    <td className="p-3 font-mono text-rose-400">-{Number((pay.irpfDeduction + pay.socialSecurityDeduction).toFixed(2))} €</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold text-sm">
                      {pay.netTotal.toLocaleString('es-ES')} €
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Document Repository */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-white text-sm">Repositorio de Documentación & Firmas Digitales</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.flatMap((emp) => emp.documents || []).length > 0 ? (
              employees.flatMap((emp) =>
                (emp.documents || []).map((doc) => (
                  <div key={doc.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {doc.type}
                      </span>
                      {doc.isSigned ? (
                        <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>FIRMADO</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono">PENDIENTE FIRMA</span>
                      )}
                    </div>

                    <div>
                      <h5 className="font-bold text-white text-sm">{doc.title}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">Subido el: {doc.uploadedAt}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button className="text-xs text-amber-400 hover:underline flex items-center space-x-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PDF</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              <p className="text-xs text-slate-500 col-span-full">No hay documentos registrados actualmente.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal Generar Nómina */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BadgeEuro className="w-5 h-5 text-emerald-400" />
                <span>Calcular Pre-Nómina</span>
              </h3>
              <button onClick={() => setIsPayrollModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleGeneratePayroll} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Empleado</label>
                <select
                  value={payrollForm.employeeId}
                  onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.surname} ({e.salary.toLocaleString('es-ES')} €/año)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Periodo (YYYY-MM)</label>
                <input
                  type="month"
                  value={payrollForm.period}
                  onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Horas Extra</label>
                  <input
                    type="number"
                    value={payrollForm.overtimeHoursCount}
                    onChange={(e) => setPayrollForm({ ...payrollForm, overtimeHoursCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Comisiones (€)</label>
                  <input
                    type="number"
                    value={payrollForm.comissionBonus}
                    onChange={(e) => setPayrollForm({ ...payrollForm, comissionBonus: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Generar Nómina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
