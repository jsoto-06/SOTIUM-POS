import React, { useState } from 'react';
import { PGCAccount, AccountingJournalEntry, ProfitAndLossStatement, BalanceSheetItem } from '../../types/finance';
import {
  BookOpen,
  FileSpreadsheet,
  PlusCircle,
  Search,
  Scale,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface Props {
  pgcAccounts: PGCAccount[];
  journalEntries: AccountingJournalEntry[];
  pandl: ProfitAndLossStatement;
  balanceSheet: BalanceSheetItem[];
  onCreateEntry: (params: {
    concept: string;
    date: string;
    documentType: AccountingJournalEntry['documentType'];
    documentRef?: string;
    lines: { subaccountCode: string; concept: string; debit: number; credit: number }[];
  }) => void;
}

export const AccountingJournalLedger: React.FC<Props> = ({
  pgcAccounts,
  journalEntries,
  pandl,
  balanceSheet,
  onCreateEntry,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'diario' | 'pgc' | 'mayor' | 'pyg' | 'balance'>('diario');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMayorAccount, setSelectedMayorAccount] = useState('57200001');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for new journal entry
  const [newConcept, setNewConcept] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().substring(0, 10));
  const [newDocType, setNewDocType] = useState<AccountingJournalEntry['documentType']>('MANUAL');
  const [newDocRef, setNewDocRef] = useState('');
  const [lines, setLines] = useState<{ subaccountCode: string; concept: string; debit: number; credit: number }[]>([
    { subaccountCode: '60000001', concept: 'Gasto diverso', debit: 100, credit: 0 },
    { subaccountCode: '57200001', concept: 'Pago por banco', debit: 0, credit: 100 },
  ]);
  const [entryError, setEntryError] = useState('');

  const filteredPGC = pgcAccounts.filter(
    (a) =>
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebitSum = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCreditSum = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebitSum - totalCreditSum) < 0.01;

  const handleAddLine = () => {
    setLines([...lines, { subaccountCode: '57000001', concept: newConcept || 'Línea de asiento', debit: 0, credit: 0 }]);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    (updated[index] as any)[field] = value;
    setLines(updated);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setEntryError(`El asiento no está cuadrado. Debe: ${totalDebitSum.toFixed(2)}€ | Haber: ${totalCreditSum.toFixed(2)}€`);
      return;
    }
    if (!newConcept.trim()) {
      setEntryError('Indique un concepto general para el asiento');
      return;
    }

    try {
      onCreateEntry({
        concept: newConcept,
        date: newDate,
        documentType: newDocType,
        documentRef: newDocRef || undefined,
        lines,
      });
      setShowCreateModal(false);
      setNewConcept('');
      setEntryError('');
    } catch (err: any) {
      setEntryError(err.message || 'Error al guardar asiento');
    }
  };

  const mayorLines = journalEntries.flatMap((e) =>
    e.lines
      .filter((l) => l.subaccountCode === selectedMayorAccount)
      .map((l) => ({ ...l, entryNumber: e.entryNumber, date: e.date }))
  );

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('diario')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'diario' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Libro Diario</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pgc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'pgc' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Plan de Cuentas (PGC)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mayor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'mayor' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Extracto de Mayor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pyg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'pyg' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Pérdidas y Ganancias (PyG)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('balance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'balance' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balance de Situación</span>
          </button>
        </div>

        {activeSubTab === 'diario' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Asiento Manual</span>
          </button>
        )}
      </div>

      {/* VIEW 1: LIBRO DIARIO */}
      {activeSubTab === 'diario' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Asientos Contables Registrados ({journalEntries.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Ejercicio 2026 - PGC España</span>
            </div>

            <div className="divide-y divide-slate-800">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-300 mb-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        Asiento #{entry.entryNumber}
                      </span>
                      <span className="text-white font-bold">{entry.concept}</span>
                      {entry.documentRef && <span className="text-slate-500 font-mono">Ref: {entry.documentRef}</span>}
                    </div>
                    <div className="flex items-center space-x-3 text-slate-400">
                      <span>{entry.date}</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded uppercase text-[10px]">{entry.documentType}</span>
                      <span className="text-emerald-400 font-mono font-bold">{entry.totalDebit.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Lines Table */}
                  <div className="bg-slate-950 rounded-lg p-2 overflow-x-auto border border-slate-850">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800 text-[11px]">
                          <th className="py-1 px-2 font-mono">Subcuenta</th>
                          <th className="py-1 px-2">Nombre / Concepto Línea</th>
                          <th className="py-1 px-2 text-right font-mono">Debe (€)</th>
                          <th className="py-1 px-2 text-right font-mono">Haber (€)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {entry.lines.map((l) => (
                          <tr key={l.id} className="text-slate-300">
                            <td className="py-1 px-2 font-mono text-amber-400">{l.subaccountCode}</td>
                            <td className="py-1 px-2">
                              <span>{l.subaccountName}</span>
                              <span className="text-slate-500 text-[10px] ml-2">({l.concept})</span>
                            </td>
                            <td className="py-1 px-2 text-right font-mono text-emerald-400">
                              {l.debit > 0 ? `${l.debit.toFixed(2)} €` : '-'}
                            </td>
                            <td className="py-1 px-2 text-right font-mono text-cyan-400">
                              {l.credit > 0 ? `${l.credit.toFixed(2)} €` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PLAN GENERAL CONTABLE */}
      {activeSubTab === 'pgc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Plan de Cuentas y Subcuentas</span>
            </h3>

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar cuenta o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Grupo PGC</th>
                  <th className="py-2.5 px-3">Nombre de Cuenta / Subcuenta</th>
                  <th className="py-2.5 px-3 text-right">Suma Debe (€)</th>
                  <th className="py-2.5 px-3 text-right">Suma Haber (€)</th>
                  <th className="py-2.5 px-3 text-right">Saldo Actual (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPGC.map((acc) => (
                  <tr key={acc.code} className={`hover:bg-slate-800/50 ${acc.isSubaccount ? '' : 'font-bold bg-slate-950/40'}`}>
                    <td className="py-2 px-3 font-mono text-amber-400">{acc.code}</td>
                    <td className="py-2 px-3">Grupo {acc.group}</td>
                    <td className="py-2 px-3">{acc.title}</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-400">{acc.debitBalance.toFixed(2)} €</td>
                    <td className="py-2 px-3 text-right font-mono text-cyan-400">{acc.creditBalance.toFixed(2)} €</td>
                    <td className={`py-2 px-3 text-right font-mono font-bold ${acc.currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {acc.currentBalance.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: EXTRACTO DE MAYOR */}
      {activeSubTab === 'mayor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center space-x-3">
            <label className="text-xs font-semibold text-slate-300">Seleccionar Subcuenta:</label>
            <select
              value={selectedMayorAccount}
              onChange={(e) => setSelectedMayorAccount(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
            >
              {pgcAccounts
                .filter((a) => a.isSubaccount)
                .map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.title}
                  </option>
                ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Asiento #</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Concepto</th>
                  <th className="py-2.5 px-3 text-right">Debe (€)</th>
                  <th className="py-2.5 px-3 text-right">Haber (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {mayorLines.length > 0 ? (
                  mayorLines.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono text-amber-400">#{l.entryNumber}</td>
                      <td className="py-2 px-3">{l.date}</td>
                      <td className="py-2 px-3">{l.concept}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400">{l.debit > 0 ? `${l.debit.toFixed(2)} €` : '-'}</td>
                      <td className="py-2 px-3 text-right font-mono text-cyan-400">{l.credit > 0 ? `${l.credit.toFixed(2)} €` : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No hay movimientos registrados para esta subcuenta.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: P&L */}
      {activeSubTab === 'pyg' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 max-w-3xl mx-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Cuenta de Pérdidas y Ganancias ({pandl.fiscalYear})</h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
              Oficial PGC España
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
              <span>(+) Importe Neto de la Cifra de Negocios (Ventas TPV / Delivery):</span>
              <span className="text-emerald-400 font-bold">+{pandl.netTurnover.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300 pl-4">
              <span>(-) Aprovisionamientos y Compras de Materias Primas:</span>
              <span className="text-rose-400">-{pandl.rawMaterialsCost.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 bg-slate-950 px-3 rounded font-bold text-amber-400">
              <span>(=) MARGEN BRUTO OPERATIVO:</span>
              <span>+{pandl.grossMargin.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300 pl-4">
              <span>(-) Gastos de Personal (Sueldos y Seguridad Social):</span>
              <span className="text-rose-400">-{pandl.personnelExpenses.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300 pl-4">
              <span>(-) Otros Gastos de Explotación (Alquiler, Suministros):</span>
              <span className="text-rose-400">-{pandl.otherOperatingExpenses.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 bg-slate-950 px-3 rounded font-bold text-emerald-400 text-sm">
              <span>(=) EBITDA (Resultado Bruto Explotación):</span>
              <span>+{pandl.ebitda.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300 pl-4">
              <span>(-) Amortización del Inmovilizado:</span>
              <span className="text-rose-400">-{pandl.depreciationAmortization.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300 pl-4">
              <span>(+/-) Resultado Financiero:</span>
              <span className="text-rose-400">{pandl.financialResult} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300 pl-4">
              <span>(-) Impuesto sobre Sociedades (25%):</span>
              <span className="text-rose-400">-{pandl.corporateTax.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between py-3 bg-amber-500 text-slate-950 px-3 rounded-lg font-bold text-base mt-2 shadow-lg">
              <span>(=) RESULTADO NETO DEL EJERCICIO:</span>
              <span>+{pandl.netProfit.toLocaleString('es-ES')} €</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: BALANCE DE SITUACIÓN */}
      {activeSubTab === 'balance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
              ACTIVO (Bienes y Derechos)
            </h4>
            <div className="space-y-2 text-xs">
              {balanceSheet
                .filter((b) => b.category.startsWith('ACTIVO'))
                .map((b) => (
                  <div key={b.code} className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                    <span>
                      <strong className="text-amber-400 font-mono mr-2">{b.code}</strong> {b.name}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{b.amount.toLocaleString('es-ES')} €</span>
                  </div>
                ))}
              <div className="flex justify-between pt-3 font-bold text-sm text-emerald-400 border-t border-emerald-500/30">
                <span>TOTAL ACTIVO:</span>
                <span>
                  {balanceSheet
                    .filter((b) => b.category.startsWith('ACTIVO'))
                    .reduce((sum, b) => sum + b.amount, 0)
                    .toLocaleString('es-ES')}{' '}
                  €
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
              PASIVO Y PATRIMONIO NETO (Obligaciones)
            </h4>
            <div className="space-y-2 text-xs">
              {balanceSheet
                .filter((b) => !b.category.startsWith('ACTIVO'))
                .map((b) => (
                  <div key={b.code} className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                    <span>
                      <strong className="text-amber-400 font-mono mr-2">{b.code}</strong> {b.name}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{b.amount.toLocaleString('es-ES')} €</span>
                  </div>
                ))}
              <div className="flex justify-between pt-3 font-bold text-sm text-cyan-400 border-t border-cyan-500/30">
                <span>TOTAL PASIVO + NETO:</span>
                <span>
                  {balanceSheet
                    .filter((b) => !b.category.startsWith('ACTIVO'))
                    .reduce((sum, b) => sum + b.amount, 0)
                    .toLocaleString('es-ES')}{' '}
                  €
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE JOURNAL ENTRY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Nuevo Asiento Manual</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            {entryError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{entryError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Concepto General</label>
                  <input
                    type="text"
                    required
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="Ej: Asiento regularización"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Documento</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="FACTURA_VENTA">Factura Venta</option>
                    <option value="FACTURA_COMPRA">Factura Compra</option>
                    <option value="NOMINA">Nómina</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Líneas de Apunte Contable</span>
                  <button type="button" onClick={handleAddLine} className="text-amber-400 hover:underline text-xs">
                    + Añadir Línea
                  </button>
                </div>

                {lines.map((l, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="col-span-4">
                      <select
                        value={l.subaccountCode}
                        onChange={(e) => handleLineChange(idx, 'subaccountCode', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-amber-400 font-mono text-[11px] p-1.5 rounded"
                      >
                        {pgcAccounts
                          .filter((a) => a.isSubaccount)
                          .map((a) => (
                            <option key={a.code} value={a.code}>
                              {a.code} - {a.title}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <input
                        type="text"
                        value={l.concept}
                        onChange={(e) => handleLineChange(idx, 'concept', e.target.value)}
                        placeholder="Concepto línea"
                        className="w-full bg-slate-900 border border-slate-800 text-white p-1.5 rounded text-[11px]"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={l.debit || ''}
                        onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                        placeholder="Debe (€)"
                        className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono p-1.5 rounded text-[11px]"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={l.credit || ''}
                        onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                        placeholder="Haber (€)"
                        className="w-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono p-1.5 rounded text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Balance Bar */}
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex space-x-4">
                  <span className="text-slate-400">
                    Total Debe: <strong className="text-emerald-400 font-mono">{totalDebitSum.toFixed(2)} €</strong>
                  </span>
                  <span className="text-slate-400">
                    Total Haber: <strong className="text-cyan-400 font-mono">{totalCreditSum.toFixed(2)} €</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-1 font-bold">
                  {isBalanced ? (
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" /> <span>Asiento Cuadrado</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" /> <span>Descuadre ({Math.abs(totalDebitSum - totalCreditSum).toFixed(2)}€)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg"
                >
                  Guardar Asiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
