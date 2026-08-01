import React, { useState } from 'react';
import { HREmployee, HRRole, EmployeeStatus, ContractType } from '../../types/hr';
import { hrService } from '../../services/hrService';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  BadgeEuro,
  Building2,
  Calendar,
  Lock,
} from 'lucide-react';

interface Props {
  employees: HREmployee[];
  onRefresh: () => void;
}

export const HREmployeeManagement: React.FC<Props> = ({ employees, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [editingEmp, setEditingEmp] = useState<HREmployee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<HREmployee>>({
    name: '',
    surname: '',
    internalCode: '',
    pin: '1234',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    dniNie: '',
    nss: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '1990-01-01',
    hireDate: new Date().toISOString().substring(0, 10),
    category: 'Grupo 1 - Sala',
    department: 'SALA',
    position: 'Camarero',
    workCenter: 'Restaurante Central Madrid',
    status: 'ACTIVO',
    contractType: 'INDEFINIDO',
    contractHours: 40,
    agreement: 'Convenio Hostelería Madrid 2024-2026',
    salary: 22000,
    iban: 'ES91 2100 0418 4012 3456 7891',
    role: 'CAMARERO',
    notes: '',
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dniNie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      surname: '',
      internalCode: `EMP-00${employees.length + 1}`,
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      dniNie: '',
      nss: '28' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      email: '',
      phone: '+34 600 000 000',
      address: 'Calle Principal 12, Madrid',
      birthDate: '1995-05-15',
      hireDate: new Date().toISOString().substring(0, 10),
      category: 'Grupo 1 - Sala',
      department: 'SALA',
      position: 'Camarero',
      workCenter: 'Restaurante Central Madrid',
      status: 'ACTIVO',
      contractType: 'INDEFINIDO',
      contractHours: 40,
      agreement: 'Convenio Hostelería Madrid 2024-2026',
      salary: 22000,
      iban: 'ES91 2100 0418 4012 3456 7891',
      role: 'CAMARERO',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: HREmployee) => {
    setEditingEmp(emp);
    setFormData(emp);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.surname || !formData.dniNie) {
      alert('Nombre, apellidos y DNI/NIE son obligatorios.');
      return;
    }

    if (editingEmp) {
      hrService.updateEmployee(editingEmp.id, formData);
    } else {
      hrService.createEmployee(formData as any);
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Está seguro de dar de baja/eliminar al empleado ${name}?`)) {
      hrService.deleteEmployee(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, código interno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los departamentos</option>
            <option value="SALA">Sala</option>
            <option value="COCINA">Cocina</option>
            <option value="BARRA">Barra</option>
            <option value="REPARTOS">Repartos</option>
            <option value="ADMIN">Administración</option>
            <option value="RRHH">RRHH</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="EXCEDENCIA">Excedencia</option>
            <option value="BAJA_MEDICA">Baja Médica</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Alta Empleado</span>
        </button>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={emp.photoUrl}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {emp.name} {emp.surname}
                    </h3>
                    <p className="text-xs text-amber-400 font-mono font-medium">{emp.position}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {emp.internalCode}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        PIN: {emp.pin}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      emp.status === 'ACTIVO'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : emp.status === 'BAJA_MEDICA'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {emp.status}
                  </span>
                  {emp.isClockedIn && (
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded flex items-center space-x-1 animate-pulse">
                      <Clock className="w-3 h-3" />
                      <span>Fichado</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Information Grid */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">DNI / NIE:</span>
                  <span className="font-mono text-slate-200">{emp.dniNie}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">NSS Seg. Social:</span>
                  <span className="font-mono text-slate-200">{emp.nss}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Departamento:</span>
                  <span className="font-semibold text-slate-200">{emp.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contrato / Horas:</span>
                  <span className="text-slate-200">
                    {emp.contractType} ({emp.contractHours}h/sem)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Salario Bruto:</span>
                  <span className="font-mono font-bold text-emerald-400">{emp.salary.toLocaleString('es-ES')} €/año</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>{emp.role}</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEditModal(emp)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                  title="Editar empleado"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(emp.id, `${emp.name} ${emp.surname}`)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  title="Eliminar empleado"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Alta/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{editingEmp ? 'Editar Empleado' : 'Nuevo Empleado Enterprise'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.surname || ''}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">DNI / NIE *</label>
                  <input
                    type="text"
                    required
                    value={formData.dniNie || ''}
                    onChange={(e) => setFormData({ ...formData, dniNie: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">NSS Seg. Social</label>
                  <input
                    type="text"
                    value={formData.nss || ''}
                    onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Código Interno</label>
                  <input
                    type="text"
                    value={formData.internalCode || ''}
                    onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">PIN TPV (4 dígitos)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.pin || ''}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Departamento</label>
                  <select
                    value={formData.department || 'SALA'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="SALA">Sala</option>
                    <option value="COCINA">Cocina</option>
                    <option value="BARRA">Barra</option>
                    <option value="REPARTOS">Repartos</option>
                    <option value="ADMIN">Administración</option>
                    <option value="RRHH">RRHH</option>
                    <option value="ALMACEN">Almacén</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Puesto / Cargo</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Rol de Permisos</label>
                  <select
                    value={formData.role || 'CAMARERO'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="ENCARGADO">Encargado</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="CAMARERO">Camarero</option>
                    <option value="COCINERO">Cocinero</option>
                    <option value="BARRA">Barra</option>
                    <option value="REPARTIDOR">Repartidor</option>
                    <option value="CAJA">Caja</option>
                    <option value="COMPRAS">Compras</option>
                    <option value="ALMACEN">Almacén</option>
                    <option value="RRHH">RRHH</option>
                    <option value="CONTABILIDAD">Contabilidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Salario Bruto Anual (€)</label>
                  <input
                    type="number"
                    value={formData.salary || 0}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">IBAN de Cobro</label>
                  <input
                    type="text"
                    value={formData.iban || ''}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-sm font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
