import React, { useState } from 'react';
import { Asset, AssetType, AssetStatus } from '../../types/maintenance';
import {
  Wrench,
  Search,
  Plus,
  QrCode,
  Barcode,
  Calendar,
  ShieldCheck,
  Building2,
  MapPin,
  User,
  DollarSign,
  FileText,
  Tag,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface AssetsManagerProps {
  assets: Asset[];
  onAddAsset: (newAsset: Omit<Asset, 'id'>) => void;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
  onDeleteAsset: (id: string) => void;
}

const ASSET_TYPES: AssetType[] = [
  'TPV',
  'TABLET',
  'IMPRESORA',
  'COMANDERA',
  'KDS',
  'HORNO',
  'FREIDORA',
  'CAMARA_FRIGORIFICA',
  'CONGELADOR',
  'LAVAVAJILLAS',
  'AIRE_ACONDICIONADO',
  'CAMPANA',
  'VEHICULO',
  'EQUIPO_INFORMATICO',
  'MOBILIARIO',
  'INSTALACION',
  'MAQUINARIA',
];

export const AssetsManager: React.FC<AssetsManagerProps> = ({
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form State for New Asset
  const [formData, setFormData] = useState<Omit<Asset, 'id'>>({
    internalCode: `ACT-${Math.floor(100 + Math.random() * 900)}`,
    barcode: `84000000${Math.floor(1000 + Math.random() * 9000)}`,
    qrCode: `QR-ACT-${Math.floor(100 + Math.random() * 900)}`,
    nfcCode: '',
    name: '',
    description: '',
    type: 'TPV',
    brand: '',
    model: '',
    serialNumber: '',
    supplierId: 'sup-101',
    supplierName: 'Sotium Hardware S.L.',
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    warrantyExpirationDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    purchaseValue: 0,
    currentValue: 0,
    costCenter: 'CC-COCINA',
    companyId: 'comp-001',
    venueId: 'sed-001',
    department: 'Cocina',
    location: 'Cocina Central',
    responsiblePerson: 'Carlos Mendoza',
    status: 'OPERATIVO',
    notes: '',
    photos: [],
    documents: [],
    operatingHours: 0,
  });

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.internalCode.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.brand.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || a.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAddAsset(formData);
    setShowModal(false);
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'OPERATIVO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">OPERATIVO</span>;
      case 'EN_REVISION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">EN REVISIÓN</span>;
      case 'EN_REPARACION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">EN REPARACIÓN</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por activo, código, serie, marca, ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los Tipos</option>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="OPERATIVO">OPERATIVO</option>
            <option value="EN_REVISION">EN REVISIÓN</option>
            <option value="EN_REPARACION">EN REPARACIÓN</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Alta Nuevo Activo</span>
        </button>
      </div>

      {/* Grid of Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-800 text-amber-400 font-mono text-xs px-2 py-1 rounded font-bold">
                    {asset.internalCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{asset.type}</span>
                </div>
                {getStatusBadge(asset.status)}
              </div>

              <h3 className="font-bold text-white text-base mb-1">{asset.name}</h3>
              <p className="text-slate-400 text-xs line-clamp-2 mb-4">{asset.description}</p>

              <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Marca / Modelo:</span>
                  <span className="font-medium text-slate-200">
                    {asset.brand} {asset.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nº Serie:</span>
                  <span className="font-mono text-amber-300">{asset.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ubicación:</span>
                  <span className="text-slate-200">{asset.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Responsable:</span>
                  <span className="text-slate-200">{asset.responsiblePerson}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Valor: {asset.purchaseValue.toFixed(2)}€</span>
              </div>
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-slate-400" />
                <Barcode className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Asset Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>Registrar Nuevo Activo Enterprise</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Nombre del Activo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    placeholder="Ej. TPV Barra Terraza"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Tipo de Activo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    placeholder="Rational, Posiflex..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Número de Serie</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Código Interno</label>
                  <input
                    type="text"
                    value={formData.internalCode}
                    onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">QR</label>
                  <input
                    type="text"
                    value={formData.qrCode}
                    onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    placeholder="Cocina Central - Pase 1"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Valor Compra (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchaseValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseValue: parseFloat(e.target.value) || 0,
                        currentValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Fecha Garantía</label>
                  <input
                    type="date"
                    value={formData.warrantyExpirationDate}
                    onChange={(e) => setFormData({ ...formData, warrantyExpirationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Guardar Activo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-amber-400 font-mono text-xs font-bold">{selectedAsset.internalCode}</span>
                <h2 className="text-xl font-bold text-white">{selectedAsset.name}</h2>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 text-xs">Tipo:</span> {selectedAsset.type}
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Estado:</span> {selectedAsset.status}
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Marca:</span> {selectedAsset.brand}
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Modelo:</span> {selectedAsset.model}
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Nº Serie:</span> {selectedAsset.serialNumber}
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Ubicación:</span> {selectedAsset.location}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Códigos de Trazabilidad:</div>
                <div className="flex justify-between font-mono text-amber-300">
                  <span>BC: {selectedAsset.barcode}</span>
                  <span>QR: {selectedAsset.qrCode}</span>
                  {selectedAsset.nfcCode && <span>NFC: {selectedAsset.nfcCode}</span>}
                </div>
              </div>

              <div className="text-xs text-slate-400">
                <span>Notas: {selectedAsset.notes || 'Sin observaciones.'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  onDeleteAsset(selectedAsset.id);
                  setSelectedAsset(null);
                }}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-xs"
              >
                Eliminar Activo
              </button>
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
