import React, { useState } from 'react';
import { NotificationRule } from '../../types/backoffice';
import { backofficeService } from '../../services/backofficeService';
import { Bell, Mail, Smartphone, ShieldAlert, CheckCircle2, Save } from 'lucide-react';

interface Props {
  rules: NotificationRule[];
  onUpdate: () => void;
}

export const NotificationRulesTab: React.FC<Props> = ({ rules: initialRules, onUpdate }) => {
  const [rulesList, setRulesList] = useState<NotificationRule[]>(initialRules);
  const [msg, setMsg] = useState('');

  const handleToggle = (id: string, field: 'enabled' | 'notifyByEmail' | 'notifyInApp' | 'notifySMS') => {
    const updated = rulesList.map((r) => (r.id === id ? { ...r, [field]: !r[field] } : r));
    setRulesList(updated);
  };

  const handleSave = () => {
    rulesList.forEach((r) => backofficeService.updateNotificationRule(r.id, r));
    setMsg('Reglas de alertas y notificaciones del sistema actualizadas.');
    onUpdate();
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            Centro de Alertas, Avisos & Notificaciones del Sistema
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configuración de canales (In-App, Email, SMS) y destinatarios por rol para incidencias de hardware, fiscales o de sync.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 text-sm"
        >
          <Save className="w-4 h-4" />
          Guardar Reglas
        </button>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="space-y-4">
        {rulesList.map((rule) => (
          <div key={rule.id} className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  rule.level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {rule.level}
                </span>
                <h3 className="text-base font-semibold text-white">{rule.title}</h3>
                <span className="font-mono text-slate-500 text-xs">[{rule.code}]</span>
              </div>
              <p className="text-xs text-slate-400">{rule.description}</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.notifyInApp}
                  onChange={() => handleToggle(rule.id, 'notifyInApp')}
                  className="rounded bg-slate-800 border-slate-700 text-amber-400"
                />
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                In-App
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.notifyByEmail}
                  onChange={() => handleToggle(rule.id, 'notifyByEmail')}
                  className="rounded bg-slate-800 border-slate-700 text-amber-400"
                />
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Email
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.notifySMS}
                  onChange={() => handleToggle(rule.id, 'notifySMS')}
                  className="rounded bg-slate-800 border-slate-700 text-amber-400"
                />
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                SMS
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
