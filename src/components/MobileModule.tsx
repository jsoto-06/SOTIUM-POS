import React, { useState, useEffect, useCallback } from 'react';
import { MobileWaiterApp } from './mobile/MobileWaiterApp';
import { MobileKitchenApp } from './mobile/MobileKitchenApp';
import { MobileDeliveryApp } from './mobile/MobileDeliveryApp';
import { MobileExecutiveApp } from './mobile/MobileExecutiveApp';
import { MobileNotificationsCenter } from './mobile/MobileNotificationsCenter';
import { MobileGlobalSearchModal } from './mobile/MobileGlobalSearchModal';
import { MobileService } from '../services/mobileService';
import {
  Smartphone,
  ChefHat,
  Truck,
  TrendingUp,
  Bell,
  Search,
  Download,
  Upload,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export const MobileModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'waiter' | 'kitchen' | 'delivery' | 'executive' | 'notifications'>('waiter');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Export JSON Report
  const handleExportJSON = useCallback(() => {
    const jsonStr = MobileService.exportMobileReport();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile_ecosystem_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Import JSON Config
  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = MobileService.importMobileConfig(content);
      if (res.success) {
        setImportStatus('Configuración Móvil importada exitosamente.');
      } else {
        setImportStatus(`Error al importar: ${res.message}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Mobile Ecosystem Control Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base leading-tight">Ecosistema Móvil Enterprise</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Oracle/Micros Rival
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Camarero • Cocina KDS • Repartidor • Gerencia Exec
            </p>
          </div>
        </div>

        {/* Connectivity & Actions */}
        <div className="flex items-center space-x-2">
          {/* Offline/Online Status */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online (SQLite Sync Ready)' : 'Modo Offline (SQLite Queue)'}</span>
          </div>

          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1"
            title="Búsqueda Global Móvil"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Buscar</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1"
            title="Exportar Config JSON"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Exportar</span>
          </button>

          {/* Import JSON */}
          <label className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Importar</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="px-4 py-2 text-xs font-bold bg-amber-500/20 text-amber-400 border-b border-amber-500/30 text-center flex items-center justify-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Primary Mobile App Selector Tabs */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('waiter')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'waiter'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>1. App Camarero</span>
        </button>

        <button
          onClick={() => setActiveTab('kitchen')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'kitchen'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>2. App Cocina KDS</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'delivery'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>3. App Repartidor</span>
        </button>

        <button
          onClick={() => setActiveTab('executive')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'executive'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>4. App Gerencia BI</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'notifications'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Push Alerts</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'waiter' && <MobileWaiterApp />}
        {activeTab === 'kitchen' && <MobileKitchenApp />}
        {activeTab === 'delivery' && <MobileDeliveryApp />}
        {activeTab === 'executive' && <MobileExecutiveApp />}
        {activeTab === 'notifications' && <MobileNotificationsCenter />}
      </div>

      {/* Global Search Modal */}
      <MobileGlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
