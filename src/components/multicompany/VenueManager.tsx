import React, { useState } from 'react';
import { Company, Venue, VenueType } from '../../types/multicompany';
import {
  Store,
  PlusCircle,
  MapPin,
  Phone,
  UserCheck,
  Clock,
  Building2,
  FileText,
  UtensilsCrossed,
  Truck,
  Hotel,
  Boxes,
  Compass,
} from 'lucide-react';

interface Props {
  companies: Company[];
  venues: Venue[];
  onCreateVenue: (venueData: Omit<Venue, 'id' | 'createdAt'>) => void;
  onUpdateVenue: (id: string, venueData: Partial<Venue>) => void;
}

export const VenueManager: React.FC<Props> = ({ companies, venues, onCreateVenue, onUpdateVenue }) => {
  const [filterCompanyId, setFilterCompanyId] = useState<string>('TODAS');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [companyId, setCompanyId] = useState<string>(companies[0]?.id || '');
  const [code, setCode] = useState('SED-007');
  const [name, setName] = useState('');
  const [type, setType] = useState<VenueType>('RESTAURANTE');
  const [address, setAddress] = useState('');
  const [gpsLocation, setGpsLocation] = useState('40.416775, -3.703790');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [schedule, setSchedule] = useState('L-D 12:00 - 23:30');
  const [documentSeries, setDocumentSeries] = useState('SER-01');
  const [status, setStatus] = useState<'ACTIVA' | 'INACTIVA'>('ACTIVA');

  const filteredVenues = venues.filter((v) => {
    if (filterCompanyId === 'TODAS') return true;
    return v.companyId === filterCompanyId;
  });

  const getVenueIcon = (t: VenueType) => {
    switch (t) {
      case 'RESTAURANTE':
        return <UtensilsCrossed className="w-5 h-5 text-amber-400" />;
      case 'HOTEL':
        return <Hotel className="w-5 h-5 text-indigo-400" />;
      case 'DARK_KITCHEN':
        return <Store className="w-5 h-5 text-emerald-400" />;
      case 'FOOD_TRUCK':
        return <Truck className="w-5 h-5 text-cyan-400" />;
      case 'CENTRO_LOGISTICO':
      case 'ALMACEN':
        return <Boxes className="w-5 h-5 text-rose-400" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-400" />;
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setCode(`SED-00${venues.length + 1}`);
    setName('');
    setAddress('');
    setPhone('');
    setManagerName('');
    setShowModal(true);
  };

  const openEditModal = (v: Venue) => {
    setEditingId(v.id);
    setCompanyId(v.companyId);
    setCode(v.code);
    setName(v.name);
    setType(v.type);
    setAddress(v.address);
    setGpsLocation(v.gpsLocation);
    setPhone(v.phone);
    setManagerName(v.managerName);
    setSchedule(v.schedule);
    setDocumentSeries(v.documentSeries);
    setStatus(v.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    const payload = {
      companyId,
      code,
      name,
      type,
      address,
      gpsLocation,
      phone,
      managerName,
      schedule,
      taxesConfig: { vatRates: [4, 10, 21], isIgpOrCanarias: false },
      documentSeries,
      status,
    };

    if (editingId) {
      onUpdateVenue(editingId, payload);
    } else {
      onCreateVenue(payload);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub Header Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div className="flex items-center space-x-3">
          <Store className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">Sedes, Oficinas, Restaurantes & Centros Logísticos ({venues.length})</h3>
            <p className="text-xs text-slate-400">Gestión de puntos de venta física, dark kitchens, food trucks y almacenes de grupo</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterCompanyId}
            onChange={(e) => setFilterCompanyId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-amber-400 text-xs rounded-xl p-2 font-bold"
          >
            <option value="TODAS">Todas las Empresas del Grupo</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.tradeName}
              </option>
            ))}
          </select>

          <button
            onClick={openCreateModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Alta Nueva Sede</span>
          </button>
        </div>
      </div>

      {/* Grid of Venues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((v) => {
          const comp = companies.find((c) => c.id === v.companyId);

          return (
            <div
              key={v.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                      {getVenueIcon(v.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-slate-800 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                          {v.code}
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {v.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1 leading-tight">{v.name}</h4>
                      <p className="text-[11px] text-amber-400/90 font-mono font-bold mt-0.5">
                        {comp ? comp.tradeName : v.companyId}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(v)}
                    className="text-slate-400 hover:text-amber-400 text-xs font-bold"
                  >
                    Editar
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{v.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-cyan-400 text-[11px]">
                    <Compass className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>GPS: {v.gpsLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Responsable: <strong className="text-white">{v.managerName}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-mono">{v.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{v.schedule}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px]">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Serie: {v.documentSeries}
                </span>
                <span className="text-slate-500 uppercase font-mono">{v.type}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT VENUE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>{editingId ? 'Editar Sede / Centro Operativo' : 'Alta de Nueva Sede Corporativa'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Empresa Propietaria</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.tradeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Sede</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-bold p-2 rounded-lg"
                  >
                    <option value="RESTAURANTE">RESTAURANTE</option>
                    <option value="HOTEL">HOTEL & BISTRO</option>
                    <option value="DARK_KITCHEN">DARK KITCHEN DELIVERY</option>
                    <option value="FOOD_TRUCK">FOOD TRUCK</option>
                    <option value="CENTRO_LOGISTICO">CENTRO LOGÍSTICO</option>
                    <option value="ALMACEN">ALMACÉN</option>
                    <option value="OFICINA">OFICINA / DELEGACIÓN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Código Sede</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono p-2 rounded-lg font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Nombre Comercial de la Sede</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Restaurante Castellana"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dirección Física</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle y número"
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Coordenadas GPS (Lat, Long)</label>
                  <input
                    type="text"
                    value={gpsLocation}
                    onChange={(e) => setGpsLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Teléfono Directo Sede</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white font-mono p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Responsable / Store Manager</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Nombre del director"
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Serie Documental Sede</label>
                  <input
                    type="text"
                    value={documentSeries}
                    onChange={(e) => setDocumentSeries(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg">
                  Guardar Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
