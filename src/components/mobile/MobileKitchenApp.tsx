import React, { useState, useMemo, useCallback } from 'react';
import { usePOS } from '../../context/POSContext';
import { kdsAudio } from '../../services/kdsAudioService';
import { ChefHat, Clock, Volume2, Filter, CheckCircle, Flame, RotateCcw, BookOpen, AlertTriangle } from 'lucide-react';

export const MobileKitchenApp: React.FC = React.memo(() => {
  const { ordersHistory } = usePOS();
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'URGENT'>('ALL');
  const [showRecipeModal, setShowRecipeModal] = useState<boolean>(false);
  const [activeRecipe, setActiveRecipe] = useState<{ name: string; ingredients: string[]; steps: string[] } | null>(null);

  // Active tickets in kitchen
  const activeKitchenOrders = useMemo(() => {
    return ordersHistory
      .filter((o) => !o.isClosed)
      .map((o) => ({
        ...o,
        elapsedMinutes: Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000),
        priority: (Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000) > 15
          ? 'URGENT'
          : Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000) > 8
          ? 'HIGH'
          : 'NORMAL') as 'NORMAL' | 'HIGH' | 'URGENT',
      }))
      .filter((o) => {
        if (priorityFilter === 'ALL') return true;
        return o.priority === priorityFilter;
      });
  }, [ordersHistory, priorityFilter]);

  // Audio warning alert trigger
  const handleTriggerAudioAlert = useCallback(() => {
    try {
      kdsAudio.playNewOrderSound();
    } catch {
      console.log('[KDS] Sound alert fallback');
    }
  }, []);

  const handleOpenRecipe = useCallback((productName: string) => {
    setActiveRecipe({
      name: productName,
      ingredients: ['300g Solomillo de Buey', '20g Mantequilla', 'Aceite de Oliva Virgen Extra', 'Sal Escama', 'Pimienta Negra'],
      steps: [
        'Atemperar la carne 20 minutos antes de marcar.',
        'Sellar a fuego vivo en plancha de hierro fundido durante 3 minutos por lado.',
        'Añadir mantequilla y napa la pieza con su propio jugo.',
        'Emplatar y sazonar con sal escama y pimienta recién molida.',
      ],
    });
    setShowRecipeModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 space-y-4 font-sans">
      {/* KDS Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Pantalla KDS Cocina Móvil</h1>
            <p className="text-xs text-slate-400">
              {activeKitchenOrders.length} comandas en preparación activa
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerAudioAlert}
            className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold flex items-center space-x-1.5 border border-amber-500/30"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Aviso Sonoro</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <div className="flex space-x-1.5">
          {['ALL', 'COCINA', 'BARRA', 'HORNO', 'POSTRES'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStation(st)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                selectedStation === st
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex space-x-1.5">
          <button
            onClick={() => setPriorityFilter(priorityFilter === 'URGENT' ? 'ALL' : 'URGENT')}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 ${
              priorityFilter === 'URGENT'
                ? 'bg-rose-500 text-white font-bold border-rose-500 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-rose-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgentes</span>
          </button>
        </div>
      </div>

      {/* Orders KDS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeKitchenOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-semibold space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/50" />
            <p>No hay comandas pendientes en cocina. ¡Todo servido!</p>
          </div>
        ) : (
          activeKitchenOrders.map((order) => {
            const isUrgent = order.priority === 'URGENT';
            const cardBorder = isUrgent
              ? 'border-rose-500/60 bg-rose-950/20'
              : order.priority === 'HIGH'
              ? 'border-amber-500/50 bg-amber-950/10'
              : 'border-slate-800 bg-slate-900';

            return (
              <div key={order.id} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${cardBorder}`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-base text-amber-400">Mesa {order.tableNumber || 'Barra'}</span>
                    <span className="text-xs text-slate-400 font-mono">#{order.id.slice(-4)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-mono font-bold text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{order.elapsedMinutes} min</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 flex-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-amber-400 text-sm w-4">{item.quantity}x</span>
                        <span className="font-bold text-slate-200">{item.product.name}</span>
                      </div>
                      <button
                        onClick={() => handleOpenRecipe(item.product.name)}
                        className="p-1 text-slate-400 hover:text-amber-400"
                        title="Ver Receta"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      kdsAudio.playNewOrderSound();
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Marcar Listo</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recipe Modal */}
      {showRecipeModal && activeRecipe && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-base text-amber-400 flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Escandallo: {activeRecipe.name}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-300">Ingredientes:</p>
              <ul className="list-disc pl-4 text-slate-400 space-y-1">
                {activeRecipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>

              <p className="font-bold text-slate-300 pt-2">Pasos de Elaboración:</p>
              <ol className="list-decimal pl-4 text-slate-400 space-y-1">
                {activeRecipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => setShowRecipeModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Cerrar Escandallo
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
