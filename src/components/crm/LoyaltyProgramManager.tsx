import React, { useState } from 'react';
import { Customer, GiftCard, CustomerTier } from '../../types/crm';
import { Award, Wallet, Gift, Percent, Plus, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';

interface LoyaltyProgramManagerProps {
  customers: Customer[];
  onIssueGiftCard: (giftCard: GiftCard) => void;
}

export const LoyaltyProgramManager: React.FC<LoyaltyProgramManagerProps> = ({
  customers,
  onIssueGiftCard,
}) => {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [amount, setAmount] = useState<number>(50);
  const [recipient, setRecipient] = useState<string>('');

  const totalPoints = customers.reduce((acc, c) => acc + c.loyalty.points, 0);
  const totalMonedero = customers.reduce((acc, c) => acc + c.loyalty.monederoBalance, 0);
  const totalCashback = customers.reduce((acc, c) => acc + c.loyalty.cashbackBalance, 0);

  const handleCreateGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: GiftCard = {
      id: `gc-${Date.now()}`,
      code: `GIFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      initialBalance: amount,
      currentBalance: amount,
      issueDate: new Date().toISOString().substring(0, 10),
      expirationDate: new Date(Date.now() + 86400000 * 365).toISOString().substring(0, 10),
      recipientName: recipient || 'Tarjeta Regalo al Portador',
      isActive: true,
    };
    onIssueGiftCard(newCard);
    setShowIssueModal(false);
    setAmount(50);
    setRecipient('');
  };

  return (
    <div className="space-y-6">
      {/* Top Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Puntos Emitidos</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{totalPoints.toLocaleString()} pts</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Saldo Monederos Prepago</span>
            <span className="text-xl font-bold font-mono text-amber-400">{totalMonedero.toFixed(2)} €</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cashback Vivo Acumulado</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{totalCashback.toFixed(2)} €</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Emisión Tarjetas Regalo</span>
            <button
              onClick={() => setShowIssueModal(true)}
              className="mt-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-md shadow-amber-500/20"
            >
              <Gift className="w-3.5 h-3.5" /> Nueva Tarjeta
            </button>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Gift className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Enterprise Tier Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Matriz de Niveles de Fidelización Enterprise</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              tier: 'BRONCE',
              color: 'border-amber-900/40 bg-amber-950/10 text-amber-500',
              spend: '0 € - 299 €',
              visits: '1 - 7 visitas',
              cashback: '2% Cashback',
              benefits: ['1 punto por cada 1 €', 'Descuento de cumpleaños'],
            },
            {
              tier: 'PLATA',
              color: 'border-slate-500/40 bg-slate-800/20 text-slate-200',
              spend: '300 € - 749 €',
              visits: '8 - 14 visitas',
              cashback: '3% Cashback',
              benefits: ['Mesa prioritaria', 'Promociones exclusivas mensual'],
            },
            {
              tier: 'ORO',
              color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
              spend: '750 € - 1.499 €',
              visits: '15 - 24 visitas',
              cashback: '5% Cashback',
              benefits: ['Copa de bienvenida gratuita', 'Atención por maitre VIP'],
            },
            {
              tier: 'PLATINO',
              color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
              spend: '≥ 1.500 €',
              visits: '≥ 25 visitas',
              cashback: '7% Cashback',
              benefits: ['Reserva garantizada en hora punta', 'Invitación a catas y eventos'],
            },
          ].map((t) => (
            <div key={t.tier} className={`border rounded-xl p-4 space-y-3 ${t.color}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{t.tier}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-bold">
                  {t.cashback}
                </span>
              </div>

              <div className="text-[11px] space-y-1 font-mono text-slate-300">
                <div>Consumo: <strong>{t.spend}</strong></div>
                <div>Visitas: <strong>{t.visits}</strong></div>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1 text-[11px]">
                {t.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Card Issuance Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateGiftCard} className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" /> Emitir Tarjeta Regalo Digital
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Importe de la Tarjeta (€)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre del Destinatario (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Generar Código Regalo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
