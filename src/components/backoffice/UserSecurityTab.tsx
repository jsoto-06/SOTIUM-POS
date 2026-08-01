import React, { useState } from 'react';
import { AdminUser, AdminRole, SecurityPolicy } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Users, Shield, Lock, Unlock, Key, Plus, UserCheck, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

interface Props {
  users: AdminUser[];
  roles: AdminRole[];
  policy: SecurityPolicy;
  onUpdate: () => void;
}

export const UserSecurityTab: React.FC<Props> = ({ users, roles, policy, onUpdate }) => {
  const [activeUsers, setActiveUsers] = useState<AdminUser[]>(users);
  const [secPolicy, setSecPolicy] = useState<SecurityPolicy>(policy);
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    roleId: roles[0]?.id || 'role-superadmin',
    roleName: roles[0]?.name || 'SuperAdmin ERP',
    twoFactorEnabled: false,
  });

  const handleToggleLock = (userId: string) => {
    backofficeService.toggleUserLock(userId);
    onUpdate();
    setActiveUsers(backofficeService.getAdminUsers());
    setSuccessMsg('Estado de bloqueo de usuario actualizado.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    backofficeService.updateSecurityPolicy(secPolicy);
    onUpdate();
    setSuccessMsg('Políticas globales de seguridad actualizadas.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const selRole = roles.find((r) => r.id === newUser.roleId);
    backofficeService.createAdminUser({
      ...newUser,
      roleName: selRole?.name || 'Usuario',
      active: true,
    });
    setShowAddUserModal(false);
    onUpdate();
    setActiveUsers(backofficeService.getAdminUsers());
    setSuccessMsg('Nuevo usuario administrador registrado.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Usuarios, Roles RBAC & Políticas de Seguridad Enterprise
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Matriz de permisos de grano fino, autenticación 2FA, control de bloqueos y caducidad de contraseñas.
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario Admin
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Usuarios Administradores del ERP ({activeUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Usuario / Nombre</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Rol Asignado</th>
                <th className="p-3">Seguridad (2FA)</th>
                <th className="p-3">Último Acceso / IP</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-medium text-white">
                    <div>{u.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                      {u.roleName}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.twoFactorEnabled ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 2FA Activo
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Sin 2FA
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">
                    <div>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Nunca'}</div>
                    <div className="text-slate-500">{u.ipAddress || '192.168.1.1'}</div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleLock(u.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ml-auto transition-colors ${
                        u.isLocked
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      }`}
                    >
                      {u.isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Desbloquear
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" /> Bloquear
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles RBAC & Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles List */}
        <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles RBAC Configurados
          </h3>

          <div className="space-y-3">
            {roles.map((r) => (
              <div key={r.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white text-sm">{r.name}</span>
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {r.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{r.description}</p>
                <div className="text-[11px] font-mono text-slate-500">
                  Permisos: {r.permissions.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Security Policy */}
        <form onSubmit={handleSavePolicy} className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
          <h3 className="text-base font-semibold text-amber-400 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Directivas de Seguridad Global
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Longitud Mínima de Contraseña</label>
              <input
                type="number"
                value={secPolicy.minPasswordLength}
                onChange={(e) => setSecPolicy({ ...secPolicy, minPasswordLength: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Intentos Fallidos Antes del Bloqueo</label>
              <input
                type="number"
                value={secPolicy.maxFailedAttemptsBeforeLock}
                onChange={(e) => setSecPolicy({ ...secPolicy, maxFailedAttemptsBeforeLock: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Timeout de Inactividad de Sesión (Minutos)</label>
              <input
                type="number"
                value={secPolicy.sessionTimeoutMinutes}
                onChange={(e) => setSecPolicy({ ...secPolicy, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-700">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={secPolicy.requireNumbers}
                  onChange={(e) => setSecPolicy({ ...secPolicy, requireNumbers: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-amber-400"
                />
                Exigir Números en Contraseña
              </label>

              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={secPolicy.requireSymbols}
                  onChange={(e) => setSecPolicy({ ...secPolicy, requireSymbols: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-amber-400"
                />
                Exigir Símbolos Especiales (@#$%)
              </label>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Directivas
            </button>
          </div>
        </form>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
              Crear Nuevo Usuario Administrador
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Ej: Laura Martínez"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nombre de Usuario (Username)</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="laura.martinez"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="laura@sotiumpos.es"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Rol de Seguridad</label>
                <select
                  value={newUser.roleId}
                  onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
