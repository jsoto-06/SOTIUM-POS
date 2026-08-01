import React, { useState } from 'react';
import { HRPermission, HRRole, HRModuleType, HRActionType, HREmployee } from '../../types/hr';
import { hrService } from '../../services/hrService';
import {
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  Lock,
  CheckCircle2,
  Users,
  Grid,
  Zap,
} from 'lucide-react';

interface Props {
  permissions: HRPermission[];
  employees: HREmployee[];
  onRefresh: () => void;
}

export const HRPermissionsEditor: React.FC<Props> = ({ permissions, employees, onRefresh }) => {
  const [selectedRole, setSelectedRole] = useState<HRRole>('CAMARERO');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('NONE');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Get active role permissions
  const [rolePermissions, setRolePermissions] = useState<string[]>(
    hrService.getPermissionsByRole('CAMARERO')
  );

  const handleRoleChange = (role: HRRole) => {
    setSelectedRole(role);
    setSelectedEmpId('NONE');
    setRolePermissions(hrService.getPermissionsByRole(role));
  };

  const handleEmpChange = (empId: string) => {
    setSelectedEmpId(empId);
    if (empId === 'NONE') {
      setRolePermissions(hrService.getPermissionsByRole(selectedRole));
    } else {
      const emp = employees.find((e) => e.id === empId);
      if (emp) {
        setRolePermissions(emp.customPermissions || hrService.getPermissionsByRole(emp.role));
      }
    }
  };

  const togglePermission = (permId: string) => {
    let next: string[];
    if (rolePermissions.includes(permId)) {
      next = rolePermissions.filter((id) => id !== permId);
    } else {
      next = [...rolePermissions, permId];
    }
    setRolePermissions(next);

    if (selectedEmpId !== 'NONE') {
      hrService.updateEmployeeCustomPermissions(selectedEmpId, next);
      onRefresh();
    }
  };

  const toggleModuleAll = (moduleCode: HRModuleType, grant: boolean) => {
    const modulePermIds = permissions.filter((p) => p.module === moduleCode).map((p) => p.id);
    let next: string[];
    if (grant) {
      next = Array.from(new Set([...rolePermissions, ...modulePermIds]));
    } else {
      next = rolePermissions.filter((id) => !modulePermIds.includes(id));
    }
    setRolePermissions(next);
    if (selectedEmpId !== 'NONE') {
      hrService.updateEmployeeCustomPermissions(selectedEmpId, next);
      onRefresh();
    }
  };

  const filteredPermissions = permissions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'ALL' || p.module === selectedModule;
    const matchesAction = selectedAction === 'ALL' || p.action === selectedAction;
    return matchesSearch && matchesModule && matchesAction;
  });

  // Group filtered permissions by Module
  const modulesList: HRModuleType[] = Array.from(new Set(permissions.map((p) => p.module)));

  return (
    <div className="space-y-6">
      {/* Header Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Editor Visual de Permisos Granulares (&gt;300 Permisos)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Matriz de control por Módulo, Acción, Rol de Sistema y Personalización por Empleado.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Rol:</span>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value as HRRole)}
                className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
              >
                <option value="ADMINISTRADOR">Administrador (Total)</option>
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

            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Personalizar Usuario:</span>
              <select
                value={selectedEmpId}
                onChange={(e) => handleEmpChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-cyan-400 focus:outline-none cursor-pointer"
              >
                <option value="NONE">-- Matriz Estándar de Rol --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.surname} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar permiso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los módulos</option>
            {modulesList.map((mod) => (
              <option key={mod} value={mod}>
                Módulo: {mod}
              </option>
            ))}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todas las acciones</option>
            <option value="VER">VER (Lectura)</option>
            <option value="CREAR">CREAR (Alta)</option>
            <option value="EDITAR">EDITAR (Modificación)</option>
            <option value="ELIMINAR">ELIMINAR (Baja)</option>
            <option value="APROBAR">APROBAR (Validación)</option>
            <option value="EXPORTAR">EXPORTAR (Descarga)</option>
            <option value="CONFIGURAR">CONFIGURAR (Parámetros)</option>
            <option value="ANULAR">ANULAR (Cancelaciones)</option>
          </select>
        </div>
      </div>

      {/* Permissions Matrix grouped by Module */}
      <div className="space-y-4">
        {modulesList
          .filter((mod) => selectedModule === 'ALL' || selectedModule === mod)
          .map((modCode) => {
            const modulePerms = filteredPermissions.filter((p) => p.module === modCode);
            if (modulePerms.length === 0) return null;

            const grantedCount = modulePerms.filter((p) => rolePermissions.includes(p.id)).length;
            const isAllGranted = grantedCount === modulePerms.length;

            return (
              <div key={modCode} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="bg-amber-500/10 text-amber-400 font-mono font-bold px-2.5 py-1 rounded text-xs border border-amber-500/20">
                      {modCode}
                    </span>
                    <h4 className="font-bold text-white text-sm">Módulo {modCode}</h4>
                    <span className="text-xs text-slate-400">
                      ({grantedCount} de {modulePerms.length} permitidos)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleModuleAll(modCode, true)}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-xs font-semibold transition-colors"
                    >
                      Conceder Todo
                    </button>
                    <button
                      onClick={() => toggleModuleAll(modCode, false)}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-xs font-semibold transition-colors"
                    >
                      Revocar Todo
                    </button>
                  </div>
                </div>

                {/* Grid of permissions inside module */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {modulePerms.map((perm) => {
                    const isGranted = rolePermissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => togglePermission(perm.id)}
                        className={`text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                          isGranted
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="pr-2 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                                perm.action === 'VER'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : perm.action === 'CREAR'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : perm.action === 'ELIMINAR'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {perm.action}
                            </span>
                            <span className="font-semibold text-xs text-slate-200">{perm.submodule || perm.module}</span>
                          </div>
                          <p className="text-xs font-medium line-clamp-1">{perm.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-2">{perm.description}</p>
                        </div>

                        <div className="pt-0.5">
                          {isGranted ? (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                              ✓
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-700 text-slate-600 flex items-center justify-center font-bold text-xs">
                              ✕
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
