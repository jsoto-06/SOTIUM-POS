import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Receipt, Banknote, CreditCard, ShieldCheck, Printer, FileText, CheckCircle2 } from 'lucide-react';

export const CashAccountingModule: React.FC = () => {
  const { activeCashSession, performArqueoZ, cashClosings, ordersHistory } = usePOS();
  const [countedCash, setCountedCash] = useState<number>(300);
  const [generatedZ, setGeneratedZ] = useState<any | null>(null);

  const closedToday = ordersHistory.filter((o) => o.isClosed);
  let totalCash = 0;
  let totalCard = 0;
  let totalBizum = 0;
  let grandTotal = 0;
  let vatTotal = 0;

  closedToday.forEach((o) => {
    grandTotal += o.total;
    vatTotal += o.vatAmount;
    if (o.paymentMethod === 'EFECTIVO') totalCash += o.total;
    else if (o.paymentMethod === 'TARJETA') totalCard += o.total;
    else if (o.paymentMethod === 'BIZUM') totalBizum += o.total;
  });

  const expectedCash = activeCashSession.initialCash + totalCash;
  const cashDiff = countedCash - expectedCash;

  const handleExecuteZ = () => {
    const zReport = performArqueoZ(countedCash);
    setGeneratedZ(zReport);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <Receipt className="w-7 h-7 text-amber-400" />
          <div>
            <h2 className="text-xl font-black text-white">Arqueo de Caja X y Cierre Fiscal Z / Z+</h2>
            <p className="text-xs text-slate-400">Cuadre de caja diario, resumen de IVA y libro de registro inalterable AEAT</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-lg font-mono">
            Secuencia Fiscal Z: ACTIVA
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {/* Left Turn Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-2">Resumen Arqueo X (En Vivo)</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Fondo Inicial de Caja:</span>
              <span className="font-mono font-bold text-white">{activeCashSession.initialCash.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Ventas en Efectivo:</span>
              <span className="font-mono font-bold text-emerald-400">+{totalCash.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Ventas en Tarjeta (Datáfono):</span>
              <span className="font-mono font-bold text-cyan-400">+{totalCard.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Ventas en Bizum:</span>
              <span className="font-mono font-bold text-purple-400">+{totalBizum.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 pt-3 text-sm font-extrabold">
              <span className="text-white">Total Facturado Turno:</span>
              <span className="font-mono text-amber-400">{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Center Cash Counting Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-2">Realizar Cierre de Caja Z</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Efectivo Total Recontado en Cajón (€):
              </label>
              <input
                type="number"
                step="0.01"
                value={countedCash}
                onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 font-mono font-bold text-amber-400 text-2xl p-3 rounded-xl focus:outline-none focus:border-amber-500 text-center"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Efectivo Esperado en Cajón:</span>
                <span className="font-mono font-bold text-white">{expectedCash.toFixed(2)} €</span>
              </div>

              <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-slate-800">
                <span>Descuadre de Caja:</span>
                <span className={`font-mono ${cashDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {cashDiff > 0 ? `+${cashDiff.toFixed(2)}` : `${cashDiff.toFixed(2)}`} €
                </span>
              </div>
            </div>

            <button
              onClick={handleExecuteZ}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20"
            >
              GENERAR Y FIRMAR INFORME Z FISCAL
            </button>
          </div>
        </div>

        {/* Right Generated Z Report Ticket */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-2">Informe Fiscal Z Emitido</h3>

          {generatedZ ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-center pb-2 border-b border-slate-800">
                <p className="font-bold text-amber-400">{generatedZ.closingNumber}</p>
                <p className="text-[10px] text-slate-400">Fecha: {new Date(generatedZ.closedAt).toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Tickets Emitidos:</span>
                  <span>{generatedZ.ticketCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas Efectivo:</span>
                  <span>{generatedZ.salesCash.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas Tarjeta:</span>
                  <span>{generatedZ.salesCard.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-amber-400 pt-1 border-t border-slate-800">
                  <span>Total Ventas:</span>
                  <span>{generatedZ.totalSales.toFixed(2)} €</span>
                </div>
              </div>

              <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/40 text-[10px] text-emerald-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Firmado digitalmente según norma VeriFactu.</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Introduzca el recuento de caja y ejecute el informe Z.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
