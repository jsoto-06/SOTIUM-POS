import React, { useState } from 'react';
import { BankAccount, TreasuryMovement } from '../../types/finance';
import {
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface Props {
  bankAccounts: BankAccount[];
  treasuryMovements: TreasuryMovement[];
  onAddMovement: (movement: Omit<TreasuryMovement, 'id' | 'createdAt' | 'isReconciled'>) => void;
  onReconcile: (movementId: string) => void;
}

export const TreasuryCashflow: React.FC<Props> = ({
  bankAccounts,
  treasuryMovements,
  onAddMovement,
  onReconcile,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<TreasuryMovement['type']>('INGRESO');
  const [paymentMethod, setPaymentMethod] = useState<TreasuryMovement['paymentMethod']>('TRANSFERENCIA');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [entityName, setEntityName] = useState('');

  const totalLiquidity = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0) + 3850;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || !amount) return;

    const selectedBank = bankAccounts.find((b) => b.id === bankAccountId);
    const finalAmount = type === 'GASTO' || type === 'PAGO_PROVEEDOR' ? -Math.abs(amount) : Math.abs(amount);

    onAddMovement({
      bankAccountId: bankAccountId || undefined,
      accountName: selectedBank ? selectedBank.accountName : 'Caja TPV',
      date: new Date().toISOString().substring(0, 10),
      type,
      paymentMethod,
      concept,
      amount: finalAmount,
      entityName: entityName || undefined,
    });

    setShowAddModal(false);
    setConcept('');
    setAmount(0);
    setEntityName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bank Accounts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bankAccounts.map((bank) => (
          <div key={bank.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">
                  {bank.bankName}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{bank.accountName}</h4>
              </div>
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Saldo Disponible:</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{bank.currentBalance.toLocaleString('es-ES')} €</span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 truncate">
              <span>IBAN: {bank.iban}</span>
            </div>
          </div>
        ))}

        {/* Cash Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">
                Efectivo Físico
              </span>
              <h4 className="text-sm font-bold text-white mt-1">Caja Central TPV</h4>
            </div>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Total Liquidez Restaurante:</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{totalLiquidity.toLocaleString('es-ES')} €</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            <span>Subcuenta Contable PGC: 57000001</span>
          </div>
        </div>
      </div>

      {/* Action Header & Movements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Extracto de Movimientos de Tesorería</h3>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Movimiento de Tesorería</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Cuenta / Origen</th>
                <th className="py-2.5 px-3">Concepto & Entidad</th>
                <th className="py-2.5 px-3">Forma de Pago</th>
                <th className="py-2.5 px-3 text-right">Importe (€)</th>
                <th className="py-2.5 px-3 text-center">Estado Conciliación</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {treasuryMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-mono">{m.date}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.accountName}</td>
                  <td className="py-2.5 px-3 font-medium">
                    <span className="text-white">{m.concept}</span>
                    {m.entityName && <span className="text-slate-500 text-[10px] block font-mono">Entidad: {m.entityName}</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase">{m.paymentMethod}</span>
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      m.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      {m.amount >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{m.amount >= 0 ? `+${m.amount.toFixed(2)}` : `${m.amount.toFixed(2)}`} €</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {m.isReconciled ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center justify-center space-x-1 w-24 mx-auto">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Conciliado</span>
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold w-24 mx-auto block">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {!m.isReconciled && (
                      <button
                        onClick={() => onReconcile(m.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-bold px-2 py-1 rounded"
                      >
                        Conciliar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MOVEMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Registrar Movimiento de Tesorería</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Concepto</label>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej: Pago factura proveedor"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Movimiento</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    <option value="INGRESO">Ingreso / Cobro</option>
                    <option value="GASTO">Gasto / Pago</option>
                    <option value="COBRO_CLIENTE">Cobro Cliente</option>
                    <option value="PAGO_PROVEEDOR">Pago Proveedor</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cuenta Bancaria / Caja</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    <option value="">Caja TPV Efectivo</option>
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Forma de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta Datáfono</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="BIZUM">Bizum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cliente / Proveedor / Entidad (Opcional)</label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Ej: Distribuidora Central"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg">
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
