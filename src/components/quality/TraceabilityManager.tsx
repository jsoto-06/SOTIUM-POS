import React, { useState } from 'react';
import { FoodLot, TraceabilityMovement } from '../../types/qualityHaccp';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { PackageCheck, AlertCircle, Plus, ShieldAlert, History, Download, ShieldCheck, Flame } from 'lucide-react';

export const TraceabilityManager: React.FC = () => {
  const [lots, setLots] = useState<FoodLot[]>(QualityHaccpService.getFoodLots());
  const [fefoList] = useState<FoodLot[]>(QualityHaccpService.getFEFORecommendations());
  const [movements] = useState<TraceabilityMovement[]>(QualityHaccpService.getTraceabilityMovements());

  const [showAddLotModal, setShowAddLotModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [selectedLotForRecall, setSelectedLotForRecall] = useState<FoodLot | null>(null);
  const [recallReason, setRecallReason] = useState('');

  // Add Lot Form state
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Carne Vacuno');
  const [supplierName, setSupplierName] = useState('');
  const [rgseaa, setRgseaa] = useState('');
  const [mfgDate, setMfgDate] = useState('2026-07-30');
  const [receptionDate, setReceptionDate] = useState('2026-07-31');
  const [expiryDate, setExpiryDate] = useState('2026-08-15');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('kg');
  const [storageLocation, setStorageLocation] = useState('Cámara Frigorífica 1');

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !supplierName) return;

    QualityHaccpService.createFoodLot(
      {
        productName,
        category,
        supplierName,
        supplierSanitaryRegister: rgseaa,
        mfgDate,
        receptionDate,
        expiryDate,
        initialQuantity: Number(quantity),
        currentQuantity: Number(quantity),
        unit,
        storageLocation,
        refrigerationRequired: true,
        allergensPresent: [],
      },
      'Usuario Calidad'
    );

    setLots(QualityHaccpService.getFoodLots());
    setShowAddLotModal(false);

    // Reset Form
    setProductName('');
    setSupplierName('');
    setRgseaa('');
  };

  const handleConfirmRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForRecall || !recallReason) return;

    QualityHaccpService.triggerLotRecall(selectedLotForRecall.id, recallReason, 'Responsable Calidad');

    setLots(QualityHaccpService.getFoodLots());
    setShowRecallModal(false);
    setSelectedLotForRecall(null);
    setRecallReason('');
  };

  return (
    <div className="space-y-6">
      {/* FEFO Recommendation Highlight Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>Recomendación FEFO (First Expired, First Out) - Consumo Prioritario en Cocina</span>
        </h3>
        <p className="text-xs text-slate-300">
          Utilizar estos lotes de forma prioritaria para garantizar máxima frescura y evitar mermas por caducidad:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {fefoList.slice(0, 3).map((lot) => (
            <div
              key={lot.id}
              className="bg-slate-900 border border-amber-500/40 px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-3 shadow-sm"
            >
              <div>
                <span className="font-bold text-white block">{lot.productName}</span>
                <span className="text-[10px] text-slate-400 font-mono">Lote: {lot.lotNumber} ({lot.supplierName})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Caduca:</span>
                <span className="font-mono font-bold text-amber-400">{lot.expiryDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Lots Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
            <span>Trazabilidad Alimentaria por Lote de Producto ({lots.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control integral de recepción, caducidad, consumo en cocina y retiradas sanitarias de emergencia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/quality/export/lots-csv"
            target="_blank"
            rel="noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar CSV</span>
          </a>
          <button
            onClick={() => setShowAddLotModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Lote</span>
          </button>
        </div>
      </div>

      {/* Food Lots Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Código Lote</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Proveedor & RGSEAA</th>
                <th className="p-3">F. Recepción</th>
                <th className="p-3">F. Caducidad</th>
                <th className="p-3">Stock Disponible</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-amber-400">{lot.lotNumber}</td>
                  <td className="p-3 font-semibold text-white">{lot.productName}</td>
                  <td className="p-3">
                    <span className="text-slate-200 block font-medium">{lot.supplierName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{lot.supplierSanitaryRegister || 'N/A'}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-300">{lot.receptionDate}</td>
                  <td className="p-3 font-mono text-[11px]">
                    <span className="text-amber-300 font-bold">{lot.expiryDate}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    {lot.currentQuantity} {lot.unit}
                  </td>
                  <td className="p-3 text-slate-300">{lot.storageLocation}</td>
                  <td className="p-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        lot.status === 'ACTIVO'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : lot.status === 'AGOTADO'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {lot.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {lot.status === 'ACTIVO' && (
                      <button
                        onClick={() => {
                          setSelectedLotForRecall(lot);
                          setShowRecallModal(true);
                        }}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold px-2.5 py-1 rounded text-[11px] border border-red-500/30 transition-all"
                      >
                        Retirada Alerta
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traceability Movements History */}
      {movements.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Histórico de Movimientos de Trazabilidad ({movements.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha / Hora</th>
                  <th className="p-3">Lote</th>
                  <th className="p-3">Tipo Movimiento</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3">Referencia Documento</th>
                  <th className="p-3">Operario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-[11px] text-slate-400">{m.timestamp}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{m.lotNumber}</td>
                    <td className="p-3 font-bold text-cyan-300">{m.movementType}</td>
                    <td className="p-3 font-mono text-white">{m.quantity} {m.unit}</td>
                    <td className="p-3 text-slate-300">{m.referenceDoc || '-'}</td>
                    <td className="p-3 text-slate-400">{m.operatorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lot Modal */}
      {showAddLotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Registrar Nuevo Lote Alimentario</span>
            </h3>

            <form onSubmit={handleCreateLot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre Producto</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="ej. Solomillo de Vacuno"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Carne Vacuno">Carne Vacuno</option>
                    <option value="Pescado Fresco">Pescado Fresco</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Verduras y Hortalizas">Verduras y Hortalizas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre Proveedor</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Carnes Garrote S.L."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">RGSEAA Sanitario</label>
                  <input
                    type="text"
                    value={rgseaa}
                    onChange={(e) => setRgseaa(e.target.value)}
                    placeholder="ES 10.04892/LU CE"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">F. Fabricación</label>
                  <input
                    type="date"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">F. Recepción</label>
                  <input
                    type="date"
                    value={receptionDate}
                    onChange={(e) => setReceptionDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">F. Caducidad</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Cantidad Inicial</label>
                  <input
                    type="number"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unidad</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="l">l</option>
                    <option value="ud">ud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded shadow-md"
                >
                  Guardar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recall Confirmation Modal */}
      {showRecallModal && selectedLotForRecall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-red-500/50 text-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" />
              <span>Inmovilización y Retirada Sanitaria de Alerta</span>
            </h3>

            <p className="text-xs text-slate-300">
              Va a proceder a bloquear e inmovilizar el lote <strong className="text-amber-400 font-mono">{selectedLotForRecall.lotNumber}</strong> ({selectedLotForRecall.productName}).
            </p>

            <form onSubmit={handleConfirmRecall} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Motivo de la Alerta Sanitaria</label>
                <textarea
                  rows={3}
                  required
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  placeholder="ej. Notificación RASFF de alerta por presencia no declarada de alérgenos o patógenos..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecallModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded shadow-md"
                >
                  Confirmar Retirada Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
