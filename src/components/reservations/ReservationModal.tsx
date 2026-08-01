import React, { useState, useEffect } from 'react';
import { Reservation, ReservationChannel, ReservationEventType, ReservationStatus, Salon } from '../../types/reservation';
import { recommendBestTable } from '../../services/reservationAIService';
import { Calendar, Clock, Users, Phone, Mail, Sparkles, X, CheckCircle, ShieldAlert } from 'lucide-react';

interface ReservationModalProps {
  reservationToEdit?: Reservation | null;
  salons: Salon[];
  existingReservations: Reservation[];
  isQuickMode?: boolean;
  onClose: () => void;
  onSave: (resData: any) => void;
}

const ALLERGIES_OPTIONS = [
  'Gluten (Celiaco)',
  'Lactosa',
  'Frutos Secos',
  'Marisco / Crustáceos',
  'Huevo',
  'Pescado',
  'Soja',
  'Apio',
  'Mostaza',
  'Sulfitos',
];

export const ReservationModal: React.FC<ReservationModalProps> = ({
  reservationToEdit,
  salons,
  existingReservations,
  isQuickMode = false,
  onClose,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState(reservationToEdit?.customerName || '');
  const [phone, setPhone] = useState(reservationToEdit?.phone || '');
  const [email, setEmail] = useState(reservationToEdit?.email || '');
  const [pax, setPax] = useState(reservationToEdit?.pax || 2);
  const [kids, setKids] = useState(reservationToEdit?.kids || 0);
  const [babies, setBabies] = useState(reservationToEdit?.babies || 0);
  const [pets, setPets] = useState(reservationToEdit?.pets || false);
  const [highChairs, setHighChairs] = useState(reservationToEdit?.highChairs || 0);
  const [boosterSeats, setBoosterSeats] = useState(reservationToEdit?.boosterSeats || 0);
  const [date, setDate] = useState(reservationToEdit?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(reservationToEdit?.time || '14:00');
  const [durationMinutes, setDurationMinutes] = useState(reservationToEdit?.durationMinutes || 90);
  const [channel, setChannel] = useState<ReservationChannel>(reservationToEdit?.channel || 'TELEFONO');
  const [status, setStatus] = useState<ReservationStatus>(reservationToEdit?.status || 'CONFIRMADA');
  const [eventType, setEventType] = useState<ReservationEventType>(reservationToEdit?.eventType || 'NINGUNO');
  const [depositAmount, setDepositAmount] = useState<number>(reservationToEdit?.depositAmount || 0);
  const [depositPaid, setDepositPaid] = useState<boolean>(reservationToEdit?.depositPaid || false);
  const [selectedTableId, setSelectedTableId] = useState<string>(reservationToEdit?.tableId || '');
  const [selectedSalonId, setSelectedSalonId] = useState<string>(reservationToEdit?.salonId || '');
  const [allergies, setAllergies] = useState<string[]>(reservationToEdit?.allergies || []);
  const [notes, setNotes] = useState(reservationToEdit?.notes || '');
  const [aiRecommendation, setAiRecommendation] = useState<string>('');

  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };

  const handleAiRecommendTable = () => {
    const tableRes = recommendBestTable(
      { pax, date, time, kids, babies, pets },
      salons,
      existingReservations
    );

    if (tableRes.recommendedTable) {
      setSelectedTableId(tableRes.recommendedTable.id);
      setSelectedSalonId(tableRes.recommendedSalon?.id || '');
      setAiRecommendation(`IA Seleccionó: ${tableRes.recommendedSalon?.name} - ${tableRes.recommendedTable.name} (${tableRes.explanation})`);
    } else {
      setAiRecommendation('No se encontró mesa libre recomendada para ese horario.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    let selectedTableName = '';
    let selectedSalonName = '';

    salons.forEach((s) => {
      s.tables.forEach((t) => {
        if (t.id === selectedTableId) {
          selectedTableName = t.name;
          selectedSalonName = s.name;
        }
      });
    });

    onSave({
      id: reservationToEdit?.id,
      customerName,
      phone,
      email: email || undefined,
      pax,
      kids,
      babies,
      pets,
      highChairs,
      boosterSeats,
      date,
      time,
      durationMinutes,
      channel,
      status,
      eventType,
      depositAmount,
      depositPaid,
      tableId: selectedTableId || undefined,
      tableName: selectedTableName || undefined,
      salonId: selectedSalonId || undefined,
      salonName: selectedSalonName || undefined,
      allergies,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {reservationToEdit
                ? 'Editar Reserva Enterprise'
                : isQuickMode
                ? 'Nueva Reserva Rápida en TPV'
                : 'Nueva Reserva Completa Omnicanal'}
            </h3>
            <p className="text-xs text-slate-400">Asignación automática de mesas, fianzas y requerimientos especiales</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Customer Info */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">1. Datos del Cliente & Contacto</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Nombre y Apellidos *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Soler"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Teléfono Mobile *</label>
                <input
                  type="text"
                  required
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Email Confirmación</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Date, Time & Pax */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">2. Fecha, Hora y Desglose de Pax</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Hora Reserva</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Nº Comensales (Adultos)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={pax}
                  onChange={(e) => setPax(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Niños (Kids)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={kids}
                  onChange={(e) => setKids(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {!isQuickMode && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tronas Requeridas</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={highChairs}
                    onChange={(e) => setHighChairs(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Elevadores</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={boosterSeats}
                    onChange={(e) => setBoosterSeats(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Canal de Origen</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="TELEFONO">Teléfono</option>
                    <option value="WEB">Web Directa</option>
                    <option value="ONLINE">Plataforma Online</option>
                    <option value="QR">Código QR</option>
                    <option value="CRM">CRM Fidelización</option>
                    <option value="TPV">TPV Sala</option>
                    <option value="WALK_IN">Walk-in Puerta</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tipo de Evento</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="NINGUNO">Ninguno</option>
                    <option value="CUMPLEAÑOS">Cumpleaños</option>
                    <option value="EMPRESA">Cena de Empresa</option>
                    <option value="COMUNION">Comunión</option>
                    <option value="BODA">Boda / Aniversario</option>
                    <option value="BANQUETE">Banquete / Grupo</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Table Assignment & AI Recommendation */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">3. Asignación de Salon & Mesa</h4>
              <button
                type="button"
                onClick={handleAiRecommendTable}
                className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl text-[11px] flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recomendador IA Gemini</span>
              </button>
            </div>

            {aiRecommendation && (
              <p className="text-xs text-cyan-300 bg-cyan-950/40 p-2 rounded-xl border border-cyan-800/40 italic">
                {aiRecommendation}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Seleccionar Mesa de Salón</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Sin mesa asignada (Pendiente) --</option>
                  {salons.map((s) => (
                    <optgroup key={s.id} label={s.name}>
                      {s.tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.seats} comensales) - Status: {t.status}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Estado Reserva</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="PENDIENTE">PENDIENTE DE RECONFIRMAR</option>
                  <option value="RECORDADA">RECORDADA (WA ENVIADO)</option>
                  <option value="CHECK_IN">CHECK-IN (LLEGÓ AL LOCAL)</option>
                  <option value="SENTADOS">SENTADOS EN MESA</option>
                  <option value="EN_SERVICIO">EN SERVICIO</option>
                  <option value="FINALIZADA">FINALIZADA</option>
                  <option value="NO_SHOW">NO-SHOW</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Allergies & Notes */}
          {!isQuickMode && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">4. Alergias, Intolerancias & Notas</h4>
              
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Alergias Conocidas</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGIES_OPTIONS.map((alg) => {
                    const active = allergies.includes(alg);
                    return (
                      <button
                        key={alg}
                        type="button"
                        onClick={() => toggleAllergy(alg)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          active
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {alg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Observaciones Especiales</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Prefieren mesa tranquila junto a ventana, tarta de cumpleaños propia..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-xl font-bold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{reservationToEdit ? 'Guardar Cambios' : 'Crear Reserva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
