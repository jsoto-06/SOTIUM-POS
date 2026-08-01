import React, { useState } from 'react';
import { Supplier, SupplierStatus, PaymentMethod } from '../../types/purchases';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  FileText,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  FileCode,
  Globe,
  MessageSquare,
  ChevronRight,
  User,
} from 'lucide-react';

interface SuppliersManagerProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export const SuppliersManager: React.FC<SuppliersManagerProps> = ({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'DATOS' | 'BANCARIOS' | 'REPARTO' | 'DOCS' | 'HISTORIAL'>('DATOS');

  // Form State for modal
  const [formData, setFormData] = useState<Partial<Supplier>>({
    internalCode: '',
    socialName: '',
    tradeName: '',
    cifNif: '',
    fiscalAddress: '',
    shippingAddress: '',
    province: 'Madrid',
    country: 'España',
    postalCode: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    contactPerson: '',
    iban: '',
    swift: '',
    paymentMethod: 'TRANSFERENCIA',
    paymentTermsDays: 30,
    deliveryDays: ['LUNES', 'MIÉRCOLES', 'VIERNES'],
    deliverySchedule: '08:00 - 12:00',
    suppliedFamilies: ['Bebidas', 'Alimentación'],
    status: 'ACTIVO',
    notes: '',
  });

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesSearch =
      sup.socialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.cifNif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.internalCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || sup.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setFormData({
      id: `sup-${Date.now()}`,
      internalCode: `PROV-${Math.floor(1000 + Math.random() * 9000)}`,
      socialName: '',
      tradeName: '',
      cifNif: '',
      fiscalAddress: '',
      shippingAddress: '',
      province: 'Madrid',
      country: 'España',
      postalCode: '28001',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      contactPerson: '',
      iban: '',
      swift: '',
      paymentMethod: 'TRANSFERENCIA',
      paymentTermsDays: 30,
      deliveryDays: ['LUNES', 'MIÉRCOLES'],
      deliverySchedule: '08:00 - 12:00',
      suppliedFamilies: ['Alimentación General'],
      associatedProducts: [],
      status: 'ACTIVO',
      notes: '',
      attachedDocs: [],
      historyLog: [
        {
          id: `hist-${Date.now()}`,
          date: new Date().toISOString(),
          user: 'Usuario Administrador',
          action: 'CREACIÓN',
          details: 'Registro inicial de nuevo proveedor.',
        },
      ],
    });
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({ ...supplier });
    setShowModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.socialName || !formData.cifNif) return;

    if (selectedSupplier) {
      const updated: Supplier = {
        ...(formData as Supplier),
        historyLog: [
          ...(selectedSupplier.historyLog || []),
          {
            id: `hist-${Date.now()}`,
            date: new Date().toISOString(),
            user: 'Usuario Administrador',
            action: 'EDICIÓN',
            details: 'Modificación de datos fiscales y bancarios del proveedor.',
          },
        ],
      };
      onUpdateSupplier(updated);
    } else {
      const newSup: Supplier = {
        ...(formData as Supplier),
        id: formData.id || `sup-${Date.now()}`,
        attachedDocs: formData.attachedDocs || [],
        historyLog: formData.historyLog || [],
      };
      onAddSupplier(newSup);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Catálogo de Proveedores</h2>
            <p className="text-xs text-slate-400">
              Gestión completa de fichas de proveedores, condiciones de pago, logística y auditoría
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Razón Social, Nombre Comercial, CIF/NIF o Código Interno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
          />
        </div>

        <div className="flex space-x-2">
          {['ALL', 'ACTIVO', 'INACTIVO', 'BLOQUEADO'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                selectedStatus === st
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Supplier Cards */}
        <div className="lg:col-span-1 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {filteredSuppliers.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-sm">
              No se encontraron proveedores que coincidan con la búsqueda.
            </div>
          ) : (
            filteredSuppliers.map((sup) => {
              const isSelected = selectedSupplier?.id === sup.id;
              return (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplier(sup)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-amber-500/20">
                          {sup.internalCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            sup.status === 'ACTIVO'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : sup.status === 'BLOQUEADO'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {sup.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base mt-1 line-clamp-1">{sup.socialName}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{sup.tradeName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center space-x-1 text-slate-400">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono">{sup.cifNif}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400 justify-end">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{sup.phone || sup.whatsapp || 'N/D'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Full Detail Inspector */}
        <div className="lg:col-span-2">
          {selectedSupplier ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {/* Header Inspector */}
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-xl font-bold text-white">{selectedSupplier.socialName}</h3>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedSupplier.cifNif}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{selectedSupplier.tradeName} ({selectedSupplier.province}, {selectedSupplier.country})</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedSupplier)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition border border-slate-700"
                    title="Editar Ficha Proveedor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteSupplier(selectedSupplier.id)}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-slate-700"
                    title="Eliminar Proveedor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inspector Sub-Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-900">
                {(
                  [
                    { id: 'DATOS', label: 'General & Contacto', icon: <User className="w-4 h-4" /> },
                    { id: 'BANCARIOS', label: 'Pago & IBAN', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'REPARTO', label: 'Logística & Días', icon: <Truck className="w-4 h-4" /> },
                    { id: 'DOCS', label: 'Documentos', icon: <FileCode className="w-4 h-4" /> },
                    { id: 'HISTORIAL', label: 'Historial Auditoría', icon: <History className="w-4 h-4" /> },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveDetailTab(t.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                      activeDetailTab === t.id
                        ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/20'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Inspector Body Content */}
              <div className="p-6 space-y-4">
                {activeDetailTab === 'DATOS' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Datos Fiscales y Dirección</h4>
                      <p className="text-slate-300"><span className="text-slate-500">UUID:</span> <span className="font-mono text-xs">{selectedSupplier.id}</span></p>
                      <p className="text-slate-300"><span className="text-slate-500">Dirección Fiscal:</span> {selectedSupplier.fiscalAddress}</p>
                      <p className="text-slate-300"><span className="text-slate-500">Dirección Envío:</span> {selectedSupplier.shippingAddress}</p>
                      <p className="text-slate-300"><span className="text-slate-500">Código Postal:</span> {selectedSupplier.postalCode} - {selectedSupplier.province}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Contacto Directo</h4>
                      <p className="text-slate-300 flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-500" /> {selectedSupplier.contactPerson || 'Sin persona asignada'}</p>
                      <p className="text-slate-300 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedSupplier.phone || 'N/D'}</p>
                      <p className="text-slate-300 flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> {selectedSupplier.whatsapp || 'N/D'}</p>
                      <p className="text-slate-300 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedSupplier.email || 'N/D'}</p>
                      <p className="text-slate-300 flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-500" /> {selectedSupplier.website || 'N/D'}</p>
                    </div>

                    <div className="md:col-span-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Familias Suministradas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier.suppliedFamilies.map((fam, idx) => (
                          <span key={idx} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded text-xs font-medium">
                            {fam}
                          </span>
                        ))}
                      </div>
                      {selectedSupplier.notes && (
                        <div className="mt-3 text-xs text-slate-400 italic bg-slate-900 p-2.5 rounded border border-slate-800">
                          "{selectedSupplier.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'BANCARIOS' && (
                  <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Condición y Forma de Pago
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-400">Forma de Pago Acordada</p>
                        <p className="font-bold text-white text-base mt-0.5">{selectedSupplier.paymentMethod}</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-400">Plazo de Pago (Días)</p>
                        <p className="font-bold text-emerald-400 text-base mt-0.5">{selectedSupplier.paymentTermsDays} Días</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-sm space-y-1">
                      <p className="text-xs text-slate-400 font-sans">IBAN (Cuenta Bancaria)</p>
                      <p className="text-amber-300 font-bold">{selectedSupplier.iban || 'No especificado'}</p>
                      <p className="text-xs text-slate-400 font-sans mt-2">SWIFT / BIC Code</p>
                      <p className="text-slate-200">{selectedSupplier.swift || 'N/D'}</p>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'REPARTO' && (
                  <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Horarios de Entrega y Logística
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-400 mb-2">Días de Reparto HORECA</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSupplier.deliveryDays.map((d, i) => (
                            <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-400 mb-2">Horario de Recepción</p>
                        <div className="flex items-center space-x-2 text-white font-mono text-base font-bold">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>{selectedSupplier.deliverySchedule || '08:00 - 13:00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'DOCS' && (
                  <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-400">Documentos Adjuntos</h4>
                    {selectedSupplier.attachedDocs.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No se han subido ficheros sanitarios ni contratos técnicos.</p>
                    ) : (
                      selectedSupplier.attachedDocs.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-amber-400" />
                            <span className="font-medium text-white">{doc.name}</span>
                          </div>
                          <span className="text-slate-400">{doc.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeDetailTab === 'HISTORIAL' && (
                  <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-bold text-amber-400">Auditoría de Cambios</h4>
                    {selectedSupplier.historyLog.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-900 rounded border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span className="font-bold text-amber-300">{log.action}</span>
                          <span className="font-mono">{new Date(log.date).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300">{log.details}</p>
                        <p className="text-[10px] text-slate-500">Por: {log.user}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500">
              <Building2 className="w-12 h-12 text-slate-700 mb-2 animate-bounce" />
              <p className="text-sm font-medium">Seleccione un proveedor de la lista para ver su ficha completa.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor Enterprise'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={formData.socialName || ''}
                    onChange={(e) => setFormData({ ...formData, socialName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    value={formData.tradeName || ''}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CIF / NIF *</label>
                  <input
                    type="text"
                    required
                    value={formData.cifNif || ''}
                    onChange={(e) => setFormData({ ...formData, cifNif: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Código Interno</label>
                  <input
                    type="text"
                    value={formData.internalCode || ''}
                    onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono Principal</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Pedidos</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">WhatsApp Comercial</label>
                  <input
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 mb-1">Dirección Fiscal</label>
                  <input
                    type="text"
                    value={formData.fiscalAddress || ''}
                    onChange={(e) => setFormData({ ...formData, fiscalAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Forma de Pago</label>
                  <select
                    value={formData.paymentMethod || 'TRANSFERENCIA'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="CONTADO">CONTADO / METÁLICO</option>
                    <option value="TRANSFERENCIA">TRANSFERENCIA BANCARIA</option>
                    <option value="DOMICILIACION">DOMICILIACIÓN SEPA</option>
                    <option value="PAGARE">PAGARÉ</option>
                    <option value="CONFIRMING">CONFIRMING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Plazo Pago (Días)</label>
                  <input
                    type="number"
                    value={formData.paymentTermsDays || 30}
                    onChange={(e) => setFormData({ ...formData, paymentTermsDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 mb-1">IBAN Cuenta Bancaria</label>
                  <input
                    type="text"
                    value={formData.iban || ''}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                >
                  {selectedSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
