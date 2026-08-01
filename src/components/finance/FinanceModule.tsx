import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { FinanceDashboardKPIsView } from './FinanceDashboardKPIs';
import { AccountingJournalLedger } from './AccountingJournalLedger';
import { TreasuryCashflow } from './TreasuryCashflow';
import { InvoicingPayments } from './InvoicingPayments';
import { FacturaeSIISEPA } from './FacturaeSIISEPA';
import { FinanceAIAssistantView } from './FinanceAIAssistant';
import {
  Landmark,
  BarChart3,
  BookOpen,
  Wallet,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contabilidad' | 'tesoreria' | 'facturacion' | 'cumplimiento' | 'ia'>('dashboard');

  const [pgcAccounts, setPgcAccounts] = useState(financeService.getPGCAccounts());
  const [journalEntries, setJournalEntries] = useState(financeService.getJournalEntries());
  const [bankAccounts, setBankAccounts] = useState(financeService.getBankAccounts());
  const [treasuryMovements, setTreasuryMovements] = useState(financeService.getTreasuryMovements());
  const [invoices, setInvoices] = useState(financeService.getInvoices());
  const [dueDates, setDueDates] = useState(financeService.getDueDates());
  const [kpis, setKpis] = useState(financeService.getFinancialKPIs());
  const [pandl, setPandl] = useState(financeService.getProfitAndLossStatement(2026));
  const [balanceSheet, setBalanceSheet] = useState(financeService.getBalanceSheet(2026));
  const [aiDiagnosis, setAiDiagnosis] = useState(financeService.getAIFinanceDiagnosis());
  const [tax303, setTax303] = useState(financeService.getTaxModel303());
  const [tax390, setTax390] = useState(financeService.getTaxModel390(2026));
  const [tax347, setTax347] = useState(financeService.getTaxModel347(2026));
  const [retentionSummary, setRetentionSummary] = useState(financeService.getRetentionSummary());

  const refreshData = () => {
    setPgcAccounts(financeService.getPGCAccounts());
    setJournalEntries(financeService.getJournalEntries());
    setBankAccounts(financeService.getBankAccounts());
    setTreasuryMovements(financeService.getTreasuryMovements());
    setInvoices(financeService.getInvoices());
    setDueDates(financeService.getDueDates());
    setKpis(financeService.getFinancialKPIs());
    setPandl(financeService.getProfitAndLossStatement(2026));
    setBalanceSheet(financeService.getBalanceSheet(2026));
  };

  const handleCreateJournalEntry = (params: any) => {
    financeService.createJournalEntry(params);
    refreshData();
  };

  const handleAddTreasuryMovement = (movement: any) => {
    financeService.addTreasuryMovement(movement);
    refreshData();
  };

  const handleReconcileMovement = (id: string) => {
    financeService.reconcileMovement(id);
    refreshData();
  };

  const handleCreateInvoice = (params: any) => {
    financeService.createInvoice(params);
    refreshData();
  };

  const handleGenerateFacturae = (id: string) => {
    return financeService.generateFacturaeXML(id);
  };

  const handleGenerateSEPA = () => {
    financeService.generateSEPARemittance([
      { debtorCreditorName: 'Tech Corp Consulting S.L.', iban: 'ES2100112233445566778899', bic: 'BBVAESMMXXX', amount: 3500, concept: 'Cobro Evento Agosto', dueDate: '2026-08-15' },
      { debtorCreditorName: 'Grupo Resto Eventos S.L.', iban: 'ES9100887766554433221100', bic: 'CAIXESBBXXX', amount: 2700, concept: 'Cobro Catering', dueDate: '2026-08-20' },
    ]);
    refreshData();
  };

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col p-6 overflow-y-auto space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Módulo de Contabilidad, Tesorería & Finanzas Enterprise</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded uppercase">FASE 17</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Plan General Contable España 2007 • Facturae 3.2.2 XML • SII AEAT • SEPA ISO 20022 • Modelos 303/390/347 • Gemini Financial IA
            </p>
          </div>
        </div>
      </div>

      {/* Main Module Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Financiero & KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('contabilidad')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'contabilidad' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Contabilidad & PGC</span>
        </button>

        <button
          onClick={() => setActiveTab('tesoreria')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tesoreria' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Tesorería & Conciliación</span>
        </button>

        <button
          onClick={() => setActiveTab('facturacion')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'facturacion' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Facturación & Vencimientos</span>
        </button>

        <button
          onClick={() => setActiveTab('cumplimiento')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cumplimiento' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Facturae, SII & Modelos IVA</span>
        </button>

        <button
          onClick={() => setActiveTab('ia')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ia' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Diagnóstico Gemini IA</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeTab === 'dashboard' && <FinanceDashboardKPIsView kpis={kpis} />}

      {activeTab === 'contabilidad' && (
        <AccountingJournalLedger
          pgcAccounts={pgcAccounts}
          journalEntries={journalEntries}
          pandl={pandl}
          balanceSheet={balanceSheet}
          onCreateEntry={handleCreateJournalEntry}
        />
      )}

      {activeTab === 'tesoreria' && (
        <TreasuryCashflow
          bankAccounts={bankAccounts}
          treasuryMovements={treasuryMovements}
          onAddMovement={handleAddTreasuryMovement}
          onReconcile={handleReconcileMovement}
        />
      )}

      {activeTab === 'facturacion' && (
        <InvoicingPayments invoices={invoices} dueDates={dueDates} onCreateInvoice={handleCreateInvoice} />
      )}

      {activeTab === 'cumplimiento' && (
        <FacturaeSIISEPA
          onGenerateFacturae={handleGenerateFacturae}
          siiRecords={financeService.exportSIIRecords()}
          taxModel303={tax303}
          taxModel390={tax390}
          taxModel347={tax347}
          retentionSummary={retentionSummary}
          onGenerateSEPA={handleGenerateSEPA}
        />
      )}

      {activeTab === 'ia' && <FinanceAIAssistantView prediction={aiDiagnosis} />}
    </div>
  );
};
