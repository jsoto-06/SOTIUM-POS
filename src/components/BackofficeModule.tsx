import React, { useState, useEffect } from 'react';
import {
  CompanyConfig,
  TPVHardwareConfig,
  GeneralSettings,
  AdminUser,
  AdminRole,
  SecurityPolicy,
  AuditLogEntry,
  SystemLogEntry,
  BackupRecord,
  BackupScheduleConfig,
  SyncOverview,
  LicenseInfo,
  NotificationRule,
} from '../types/backoffice';
import { backofficeService } from '../services/backofficeService';
import { SettingsSearchModal } from './backoffice/SettingsSearchModal';
import { EmpresaConfigTab } from './backoffice/EmpresaConfigTab';
import { TPVHardwareTab } from './backoffice/TPVHardwareTab';
import { GeneralSettingsTab } from './backoffice/GeneralSettingsTab';
import { UserSecurityTab } from './backoffice/UserSecurityTab';
import { AuditLogTab } from './backoffice/AuditLogTab';
import { SystemLogsTab } from './backoffice/SystemLogsTab';
import { BackupDisasterTab } from './backoffice/BackupDisasterTab';
import { SyncDiagnosisTab } from './backoffice/SyncDiagnosisTab';
import { LicenseManagerTab } from './backoffice/LicenseManagerTab';
import { NotificationRulesTab } from './backoffice/NotificationRulesTab';
import { AIAdvisorTab } from './backoffice/AIAdvisorTab';
import { DataImportExportTab } from './backoffice/DataImportExportTab';
import {
  Building2,
  Printer,
  Percent,
  Users,
  FileText,
  Terminal,
  Database,
  RefreshCw,
  Award,
  Bell,
  Sparkles,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const BackofficeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('empresa');

  const [company, setCompany] = useState<CompanyConfig>(() => backofficeService.getCompanyConfig());
  const [hardware, setHardware] = useState<TPVHardwareConfig>(() => backofficeService.getTPVHardwareConfig());
  const [general, setGeneral] = useState<GeneralSettings>(() => backofficeService.getGeneralSettings());
  const [users, setUsers] = useState<AdminUser[]>(() => backofficeService.getAdminUsers());
  const [roles, setRoles] = useState<AdminRole[]>(() => backofficeService.getAdminRoles());
  const [policy, setPolicy] = useState<SecurityPolicy>(() => backofficeService.getSecurityPolicy());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => backofficeService.getAuditLogs());
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>(() => backofficeService.getSystemLogs());
  const [backups, setBackups] = useState<BackupRecord[]>(() => backofficeService.getBackups());
  const [backupSchedule, setBackupSchedule] = useState<BackupScheduleConfig>(() => backofficeService.getBackupScheduleConfig());
  const [syncOverview, setSyncOverview] = useState<SyncOverview>(() => backofficeService.getSyncOverview());
  const [license, setLicense] = useState<LicenseInfo>(() => backofficeService.getLicenseInfo());
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(() => backofficeService.getNotificationRules());

  const reloadData = () => {
    setCompany(backofficeService.getCompanyConfig());
    setHardware(backofficeService.getTPVHardwareConfig());
    setGeneral(backofficeService.getGeneralSettings());
    setUsers(backofficeService.getAdminUsers());
    setRoles(backofficeService.getAdminRoles());
    setPolicy(backofficeService.getSecurityPolicy());
    setAuditLogs(backofficeService.getAuditLogs());
    setSystemLogs(backofficeService.getSystemLogs());
    setBackups(backofficeService.getBackups());
    setBackupSchedule(backofficeService.getBackupScheduleConfig());
    setSyncOverview(backofficeService.getSyncOverview());
    setLicense(backofficeService.getLicenseInfo());
    setNotificationRules(backofficeService.getNotificationRules());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: <Building2 className="w-4 h-4" /> },
    { id: 'hardware', label: 'TPV Hardware', icon: <Printer className="w-4 h-4" /> },
    { id: 'general', label: 'Config General', icon: <Percent className="w-4 h-4" /> },
    { id: 'usuarios', label: 'Usuarios & RBAC', icon: <Users className="w-4 h-4" /> },
    { id: 'auditoria', label: 'Auditoría', icon: <FileText className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs Sistema', icon: <Terminal className="w-4 h-4" /> },
    { id: 'backups', label: 'Backups', icon: <Database className="w-4 h-4" /> },
    { id: 'sincronizacion', label: 'Sincronización', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'licencia', label: 'Licencia', icon: <Award className="w-4 h-4" /> },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-4 h-4" /> },
    { id: 'ia_advisor', label: 'IA Advisor', icon: <Sparkles className="w-4 h-4 text-amber-300" /> },
    { id: 'import_export', label: 'Import / Export', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-xl shadow-lg">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">BackOffice Enterprise & Administración Global</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                FASE 23 OK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Panel maestro de configuración del ERP: TPV, Impresoras, IVA, Usuarios, Auditoría Inmutable, Backups, Sync Offline y Motor IA Gemini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="space-y-0.5">
            <div className="text-slate-300 font-bold">{company.name}</div>
            <div className="text-slate-500 text-[10px]">VeriFactu OK | License: {license.type}</div>
          </div>
        </div>
      </div>

      {/* Global Settings Search */}
      <SettingsSearchModal onSelectTab={(tabId) => setActiveTab(tabId)} />

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tab View */}
      <div className="transition-all duration-200">
        {activeTab === 'empresa' && <EmpresaConfigTab company={company} onUpdate={reloadData} />}
        {activeTab === 'hardware' && <TPVHardwareTab hardware={hardware} onUpdate={reloadData} />}
        {activeTab === 'general' && <GeneralSettingsTab settings={general} onUpdate={reloadData} />}
        {activeTab === 'usuarios' && <UserSecurityTab users={users} roles={roles} policy={policy} onUpdate={reloadData} />}
        {activeTab === 'auditoria' && <AuditLogTab auditLogs={auditLogs} />}
        {activeTab === 'logs' && <SystemLogsTab logs={systemLogs} />}
        {activeTab === 'backups' && <BackupDisasterTab backups={backups} schedule={backupSchedule} onUpdate={reloadData} />}
        {activeTab === 'sincronizacion' && <SyncDiagnosisTab syncOverview={syncOverview} onUpdate={reloadData} />}
        {activeTab === 'licencia' && <LicenseManagerTab license={license} onUpdate={reloadData} />}
        {activeTab === 'notificaciones' && <NotificationRulesTab rules={notificationRules} onUpdate={reloadData} />}
        {activeTab === 'ia_advisor' && <AIAdvisorTab onUpdate={reloadData} />}
        {activeTab === 'import_export' && <DataImportExportTab onUpdate={reloadData} />}
      </div>
    </div>
  );
};
