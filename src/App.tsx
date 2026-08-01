import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { HeaderNavigation } from './components/HeaderNavigation';
import { EnterpriseSidebar } from './components/navigation/EnterpriseSidebar';
import { RoleDashboard } from './components/dashboard/RoleDashboard';
import { TPVModule } from './components/TPVModule';
import { FloorPlanModule } from './components/FloorPlanModule';
import { KitchenKDSModule } from './components/KitchenKDSModule';
import { DeliveryModule } from './components/DeliveryModule';
import { CRMModule } from './components/CRMModule';
import { ProductsRecipesModule } from './components/ProductsRecipesModule';
import { InventoryPurchasesModule } from './components/InventoryPurchasesModule';
import { PurchasesModule } from './components/PurchasesModule';
import { CashAccountingModule } from './components/CashAccountingModule';
import { ReportsDashboardModule } from './components/ReportsDashboardModule';
import { EIAssistantModule } from './components/EIAssistantModule';
import { ReservationsModule } from './components/ReservationsModule';
import { SpanishComplianceModule } from './components/SpanishComplianceModule';
import { TechnicalArchitectureDocs } from './components/TechnicalArchitectureDocs';
import { HRModule } from './components/hr/HRModule';
import { FinanceModule } from './components/finance/FinanceModule';
import { MultiCompanyModule } from './components/multicompany/MultiCompanyModule';
import { ProductionModule } from './components/ProductionModule';
import { MaintenanceModule } from './components/MaintenanceModule';
import { QualityHaccpModule } from './components/QualityHaccpModule';
import { BackofficeModule } from './components/BackofficeModule';
import { IntegrationsModule } from './components/IntegrationsModule';
import { MobileModule } from './components/MobileModule';

export function AppContent() {
  const { activeTab } = usePOS();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sotium_sidebar_collapsed_v1');
      if (saved === 'true') return true;
    }
    return false;
  });

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RoleDashboard />;
      case 'tpv':
        return <TPVModule />;
      case 'mesas':
        return <FloorPlanModule />;
      case 'comandas':
        return <KitchenKDSModule />;
      case 'delivery':
        return <DeliveryModule />;
      case 'clientes':
        return <CRMModule />;
      case 'productos':
        return <ProductsRecipesModule />;
      case 'produccion':
        return <ProductionModule />;
      case 'almacen':
        return <InventoryPurchasesModule />;
      case 'compras':
        return <PurchasesModule />;
      case 'caja':
        return <CashAccountingModule />;
      case 'informes':
        return <ReportsDashboardModule />;
      case 'ia':
        return <EIAssistantModule />;
      case 'reservas':
        return <ReservationsModule />;
      case 'cumplimiento':
        return <SpanishComplianceModule />;
      case 'rrhh':
        return <HRModule />;
      case 'finanzas':
        return <FinanceModule />;
      case 'multicompany':
        return <MultiCompanyModule />;
      case 'mantenimiento':
        return <MaintenanceModule />;
      case 'calidad':
        return <QualityHaccpModule />;
      case 'backoffice':
        return <BackofficeModule />;
      case 'integraciones':
        return <IntegrationsModule />;
      case 'mobile':
        return <MobileModule />;
      case 'arquitectura':
        return <TechnicalArchitectureDocs />;
      default:
        return <TPVModule />;
    }
  };

  return (
    <div className="min-h-screen h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      <HeaderNavigation />
      <div className="flex flex-1 overflow-hidden">
        <EnterpriseSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <AppContent />
    </POSProvider>
  );
}
