import React, { useState } from 'react';
import { WaitingListItem, Salon } from '../../types/reservation';
import { Clock, Users, Phone, Plus, MessageSquare, CheckCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface WaitingListPanelProps {
  waitingList: WaitingListItem[];
  salons: Salon[];
  onAddWaitingItem: (item: Omit<WaitingListItem, 'id' | 'code' | 'joinedAt' | 'position' | 'status'>) => void;
  onSeatItem: (waitingId: string, tableId: string) => void;
  onRemoveItem: (waitingId: string) => void;
  onSendNotification: (item: WaitingListItem) => void;
}

export const WaitingListPanel: React.FC<WaitingListPanelProps> = ({
  waitingList,
  salons,
  onAddWaitingItem,
  onSeatItem,
  onRemoveItem,
  onSendNotification,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pax, setPax] = useState(2);
  const [estimatedWait, setEstimatedWait] = useState(15);
  const [notes, setNotes] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    onAddWaitingItem({
      customerName,
      phone,
      pax,
      estimatedWaitMinutes: estimatedWait,
      notes: notes || undefined,
    });

    setCustomerName('');
    setPhone('');
    setPax(2);
    setEstimatedWait(15);
    setNotes('');
    setShowForm(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 overflow-y-auto space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-xl">
            <Users className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Lista de Espera en Puerta / Walk-in</h3>
            <p className="text-xs text-slate-400">Asignación rápida de mesas libres para clientes sin reserva previa</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Cliente en Espera</span>
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">Nuevo Registro en Lista de Espera</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nombre Cliente</label>
              <input
                type="text"
                required
                placeholder="Nombre completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Teléfono Mobile</label>
              <input
                type="text"
                required
                placeholder="+34 600..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nº Pax (Comensales)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={pax}
                onChange={(e) => setPax(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Espera Est. (Min)</label>
              <input
                type="number"
                min={5}
                max={120}
                step={5}
                value={estimatedWait}
                onChange={(e) => setEstimatedWait(parseInt(e.target.value) || 15)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Preferencias / Notas</label>
            <input
              type="text"
              placeholder="Ej: Prefiere terraza, carrito de bebé..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl text-xs"
            >
              Guardar en Lista
            </button>
          </div>
        </form>
      )}

      {/* Waiting List Items */}
      {waitingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
          <Clock className="w-10 h-10 stroke-1 text-slate-600" />
          <p className="text-xs font-medium">No hay clientes en la lista de espera en este momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {waitingList.map((item, idx) => {
            const joinedDate = new Date(item.joinedAt);
            const elapsedMins = Math.floor((Date.now() - joinedDate.getTime()) / 60000);

            return (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-black text-rose-400 text-base">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-base text-white">{item.customerName}</h4>
                      <span className="text-xs font-mono text-slate-500">[{item.code}]</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.phone}</span>
                      </span>
                      <span>•</span>
                      <span className="text-cyan-400 font-bold">{item.pax} PAX</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Espera: {elapsedMins} min (Est. {item.estimatedWaitMinutes}m)</span>
                      </span>
                    </div>
                    {item.notes && <p className="text-xs text-slate-400 italic mt-1">{item.notes}</p>}
                  </div>
                </div>

                {/* Seat Assignment selector & actions */}
                <div className="flex items-center space-x-2">
                  <select
                    className="bg-slate-900 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-rose-500"
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Seleccionar Mesa Libre...
                    </option>
                    {salons.flatMap((s) =>
                      s.tables
                        .filter((t) => t.status === 'FREE')
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {s.name} - {t.name} ({t.seats}p)
                          </option>
                        ))
                    )}
                  </select>

                  <button
                    onClick={() => {
                      if (selectedTableId) {
                        onSeatItem(item.id, selectedTableId);
                      } else {
                        alert('Selecciona una mesa libre primero para sentar al cliente.');
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Sentar</span>
                  </button>

                  <button
                    onClick={() => onSendNotification(item as any)}
                    className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl"
                    title="Avisar por WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition-colors"
                    title="Eliminar de lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
