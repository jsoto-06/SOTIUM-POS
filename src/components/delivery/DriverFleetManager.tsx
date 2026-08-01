import React, { useState } from 'react';
import { Driver, DriverStatus, VehicleType } from '../../types/delivery';
import { Truck, Navigation, Phone, Star, Clock, CheckCircle2, Shield, User, Plus, X } from 'lucide-react';

interface DriverFleetManagerProps {
  drivers: Driver[];
  onUpdateDriver: (driver: Driver) => void;
  onCreateDriver: (driver: Driver) => void;
}

export const DriverFleetManager: React.FC<DriverFleetManagerProps> = ({
  drivers,
  onUpdateDriver,
  onCreateDriver,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState<VehicleType>('MOTO');
  const [plate, setPlate] = useState('');

  const getVehicleBadge = (v: VehicleType) => {
    switch (v) {
      case 'MOTO':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">🏍️ MOTO</span>;
      case 'BICICLETA':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">🚲 BICI</span>;
      case 'PATINETE':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded">🛴 PATINETE</span>;
      case 'COCHE':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded">🚗 COCHE</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">🏃 A PIE</span>;
    }
  };

  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case 'DISPONIBLE':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">DISPONIBLE</span>;
      case 'EN_RUTA':
        return <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded">EN RUTA</span>;
      case 'OCUPADO':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">OCUPADO</span>;
      case 'DESCANSO':
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded">DESCANSO</span>;
      case 'FIN_TURNO':
        return <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">FIN TURNO</span>;
    }
  };

  const handleStatusToggle = (driver: Driver, newStatus: DriverStatus) => {
    const updated: Driver = {
      ...driver,
      status: newStatus,
      isActive: newStatus !== 'FIN_TURNO',
    };
    onUpdateDriver(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      code: `REP-0${drivers.length + 1}`,
      name,
      phone,
      vehicle,
      vehiclePlate: plate || undefined,
      status: 'DISPONIBLE',
      location: {
        latitude: 40.416775,
        longitude: -3.70379,
        lastUpdated: new Date().toISOString(),
      },
      totalDeliveriesLifetime: 0,
      avgDeliveryTimeMinutes: 18.0,
      rating: 5.0,
      isActive: true,
      shiftStartedAt: new Date().toISOString(),
      history: [],
    };

    onCreateDriver(newDriver);
    setShowModal(false);
    setName('');
    setPhone('');
    setPlate('');
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> Flota de Repartidores y Posicionamiento GPS
          </h3>
          <p className="text-xs text-slate-400">
            Control de disponibilidad, vehículo, tiempos medios y monitoreo de repartidores activos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Alta Nuevo Repartidor
        </button>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {drivers.map((drv) => (
          <div
            key={drv.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                    {drv.avatarUrl ? (
                      <img src={drv.avatarUrl} alt={drv.name} className="w-full h-full object-cover" />
                    ) : (
                      drv.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{drv.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{drv.code}</span>
                  </div>
                </div>
                {getStatusBadge(drv.status)}
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80 mb-2">
                <div>{getVehicleBadge(drv.vehicle)}</div>
                {drv.vehiclePlate && (
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {drv.vehiclePlate}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {drv.phone}
                </p>
                <div className="flex justify-between items-center text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Entregas totales:</span>
                  <span className="font-bold font-mono text-white">{drv.totalDeliveriesLifetime}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Tiempo medio:</span>
                  <span className="font-bold font-mono text-emerald-400">{drv.avgDeliveryTimeMinutes} min</span>
                </div>
                <div className="flex justify-between items-center text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Valoración:</span>
                  <span className="font-bold font-mono text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {drv.rating.toFixed(1)} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[10px] text-slate-400 block">Cambiar Estado Turno:</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleStatusToggle(drv, 'DISPONIBLE')}
                  className={`py-1 rounded text-[10px] font-bold ${
                    drv.status === 'DISPONIBLE' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Disponible
                </button>
                <button
                  onClick={() => handleStatusToggle(drv, 'DESCANSO')}
                  className={`py-1 rounded text-[10px] font-bold ${
                    drv.status === 'DESCANSO' ? 'bg-purple-500 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Descanso
                </button>
                <button
                  onClick={() => handleStatusToggle(drv, 'EN_RUTA')}
                  className={`py-1 rounded text-[10px] font-bold ${
                    drv.status === 'EN_RUTA' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  En Ruta
                </button>
                <button
                  onClick={() => handleStatusToggle(drv, 'FIN_TURNO')}
                  className={`py-1 rounded text-[10px] font-bold ${
                    drv.status === 'FIN_TURNO' ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Fin Turno
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" /> Registro de Nuevo Repartidor
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Teléfono Móvil *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Vehículo *</label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="MOTO">Moto</option>
                    <option value="BICICLETA">Bicicleta</option>
                    <option value="PATINETE">Patinete</option>
                    <option value="COCHE">Coche</option>
                    <option value="A_PIE">A Pie</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Matrícula (opcional)</label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="1234-ABC"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleCreateSubmit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Crear Repartidor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
