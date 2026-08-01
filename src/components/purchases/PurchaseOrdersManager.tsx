import React, { useState } from 'react';
import { PurchaseOrder, PurchaseOrderLine, PurchaseOrderState, Supplier } from '../../types/purchases';
import { Article } from '../../types/inventory';
import { PurchasesService } from '../../services/purchasesService';
import {
  FileText,
  Plus,
  Search,
  Building2,
  Calendar,
  Warehouse,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Send,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
  Filter,
} from 'lucide-react';

interface PurchaseOrdersManagerProps {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  articles: Article[];
  onAddOrder: (order: PurchaseOrder) => void;
  onUpdateOrder: (order: PurchaseOrder) => void;
  onOpenReception: (order: PurchaseOrder) => void;
}

export const PurchaseOrdersManager: React.FC<PurchaseOrdersManagerProps> = ({
  orders,
  suppliers,
  articles,
  onAddOrder,
  onUpdateOrder,
  onOpenReception,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Order Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState('wh-001');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10)
  );
  const [orderLines, setOrderLines] = useState<PurchaseOrderLine[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Line selection form state inside modal
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [inputQty, setInputQty] = useState<number>(1);
  const [inputPrice, setInputPrice] = useState<number>(articles[0]?.purchasePrice || 10);
  const [inputDiscount, setInputDiscount] = useState<number>(0);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.warehouseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || ord.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddLineToOrder = () => {
    const art = articles.find((a) => a.id === selectedArticleId);
    if (!art) return;

    const discountMult = 1 - inputDiscount / 100;
    const subtotal = inputPrice * inputQty * discountMult;
    const vatAmount = subtotal * (art.vatRate / 100);

    const newLine: PurchaseOrderLine = {
      id: `pol-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      articleId: art.id,
      articleName: art.name,
      unit: art.unit,
      orderedQuantity: inputQty,
      receivedQuantity: 0,
      returnedQuantity: 0,
      unitPrice: inputPrice,
      vatRate: art.vatRate,
      discountPercent: inputDiscount,
      subtotal: Number(subtotal.toFixed(2)),
      total: Number((subtotal + vatAmount).toFixed(2)),
    };

    setOrderLines([...orderLines, newLine]);
  };

  const handleRemoveLine = (lineId: string) => {
    setOrderLines(orderLines.filter((l) => l.id !== lineId));
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderLines.length) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const totals = PurchasesService.calculateOrderTotals(orderLines);

    const newOrder: PurchaseOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `PED-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: supplier.id,
      supplierName: supplier.tradeName || supplier.socialName,
      warehouseId,
      warehouseName: warehouseId === 'wh-001' ? 'Almacén Principal Economato' : 'Cámara Frigorífica 01',
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: expectedDate,
      status: 'PENDIENTE',
      lines: orderLines,
      taxBase: totals.taxBase,
      vatTotal: totals.vatTotal,
      grandTotal: totals.grandTotal,
      notes: orderNotes,
      createdBy: 'Carlos Encargado',
    };

    onAddOrder(newOrder);
    setShowCreateModal(false);
    setOrderLines([]);
    setOrderNotes('');
  };

  const handleStateTransition = (order: PurchaseOrder, newStatus: PurchaseOrderState) => {
    const updated = { ...order, status: newStatus };
    onUpdateOrder(updated);
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(updated);
    }
  };

  const getStatusBadge = (status: PurchaseOrderState) => {
    switch (status) {
      case 'BORRADOR':
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">BORRADOR</span>;
      case 'PENDIENTE':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">PENDIENTE</span>;
      case 'ENVIADO':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold">ENVIADO</span>;
      case 'CONFIRMADO':
        return <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">CONFIRMADO</span>;
      case 'PREPARANDO':
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold">PREPARANDO</span>;
      case 'EN_TRANSITO':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold">EN TRÁNSITO</span>;
      case 'RECEPCIONADO_PARCIAL':
        return <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold">RECEPCIÓN PARCIAL</span>;
      case 'RECEPCIONADO':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">RECEPCIONADO</span>;
      case 'CANCELADO':
        return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">CANCELADO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Pedidos de Compra</h2>
            <p className="text-xs text-slate-400">
              Creación, seguimiento de estados, envío a proveedores y recepción en almacén
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Pedido de Compra</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nº Pedido, Proveedor o Almacén..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ENVIADO">Enviado</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="EN_TRANSITO">En Tránsito</option>
            <option value="RECEPCIONADO_PARCIAL">Recepcionado Parcial</option>
            <option value="RECEPCIONADO">Recepcionado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders List & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders Cards */}
        <div className="lg:col-span-1 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-sm">
              No hay pedidos registrados con los filtros seleccionados.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400">{ord.orderNumber}</span>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{ord.supplierName}</h4>
                    </div>
                    {getStatusBadge(ord.status)}
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 mt-2">
                    <p className="flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ord.warehouseName}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Fecha: {ord.orderDate.substring(0, 10)}</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">{ord.lines.length} artículos</span>
                    <span className="font-bold font-mono text-emerald-400 text-sm">
                      {ord.grandTotal.toFixed(2)} €
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Order Detail & Actions Inspector */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-bold font-mono text-amber-400">{selectedOrder.orderNumber}</h3>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-sm text-white font-semibold mt-1">{selectedOrder.supplierName}</p>
                  <p className="text-xs text-slate-400">Destino: {selectedOrder.warehouseName}</p>
                </div>

                {/* State Transition Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'PENDIENTE' && (
                    <button
                      onClick={() => handleStateTransition(selectedOrder, 'ENVIADO')}
                      className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Marcar Enviado</span>
                    </button>
                  )}

                  {(selectedOrder.status === 'ENVIADO' || selectedOrder.status === 'CONFIRMADO') && (
                    <button
                      onClick={() => handleStateTransition(selectedOrder, 'EN_TRANSITO')}
                      className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>En Tránsito</span>
                    </button>
                  )}

                  {selectedOrder.status !== 'RECEPCIONADO' && selectedOrder.status !== 'CANCELADO' && (
                    <button
                      onClick={() => onOpenReception(selectedOrder)}
                      className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded shadow"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Recepcionar Mercancía</span>
                    </button>
                  )}

                  {selectedOrder.status !== 'CANCELADO' && selectedOrder.status !== 'RECEPCIONADO' && (
                    <button
                      onClick={() => handleStateTransition(selectedOrder, 'CANCELADO')}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded"
                      title="Cancelar Pedido"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lines Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Líneas de Pedido</h4>
                <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Producto</th>
                        <th className="p-2.5 text-center">Pedidas</th>
                        <th className="p-2.5 text-center">Recibidas</th>
                        <th className="p-2.5 text-right">Precio Ud.</th>
                        <th className="p-2.5 text-right">Dto.</th>
                        <th className="p-2.5 text-right">IVA</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {selectedOrder.lines.map((line) => (
                        <tr key={line.id} className="hover:bg-slate-900/50">
                          <td className="p-2.5 font-medium text-white">{line.articleName}</td>
                          <td className="p-2.5 text-center font-bold text-amber-300">
                            {line.orderedQuantity} {line.unit}
                          </td>
                          <td className="p-2.5 text-center font-bold text-emerald-400">
                            {line.receivedQuantity} {line.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono">{line.unitPrice.toFixed(2)} €</td>
                          <td className="p-2.5 text-right font-mono">{line.discountPercent}%</td>
                          <td className="p-2.5 text-right font-mono">{line.vatRate}%</td>
                          <td className="p-2.5 text-right font-mono font-bold text-white">
                            {line.subtotal.toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-64 bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Imponible:</span>
                    <span className="font-mono text-white">{selectedOrder.taxBase.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cuota IVA Total:</span>
                    <span className="font-mono text-white">{selectedOrder.vatTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-amber-400 pt-2 border-t border-slate-800">
                    <span>Total Pedido:</span>
                    <span className="font-mono">{selectedOrder.grandTotal.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500">
              <FileText className="w-12 h-12 text-slate-700 mb-2" />
              <p className="text-sm font-medium">Seleccione un pedido para ver el detalle y operar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Nuevo Pedido de Compra a Proveedor</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Proveedor *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.tradeName || s.socialName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Almacén de Destino *</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="wh-001">Almacén Principal Economato</option>
                    <option value="wh-002">Cámara Frigorífica 01</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Fecha Entrega Prevista</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              {/* Add Lines Form */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider">Añadir Artículos al Pedido</h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Artículo</label>
                    <select
                      value={selectedArticleId}
                      onChange={(e) => {
                        setSelectedArticleId(e.target.value);
                        const art = articles.find((a) => a.id === e.target.value);
                        if (art) setInputPrice(art.purchasePrice || 10);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                    >
                      {articles.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={inputQty}
                      onChange={(e) => setInputQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Precio Ud. (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLineToOrder}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-2 rounded flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Lines Table preview inside Modal */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-2">Producto</th>
                      <th className="p-2 text-center">Cantidad</th>
                      <th className="p-2 text-right">Precio Ud.</th>
                      <th className="p-2 text-right">Subtotal</th>
                      <th className="p-2 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orderLines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                          No se han añadido productos todavía.
                        </td>
                      </tr>
                    ) : (
                      orderLines.map((l) => (
                        <tr key={l.id}>
                          <td className="p-2 text-white">{l.articleName}</td>
                          <td className="p-2 text-center font-bold text-amber-300">
                            {l.orderedQuantity} {l.unit}
                          </td>
                          <td className="p-2 text-right font-mono">{l.unitPrice.toFixed(2)} €</td>
                          <td className="p-2 text-right font-mono font-bold text-white">{l.subtotal.toFixed(2)} €</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(l.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={orderLines.length === 0}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded disabled:opacity-50"
                >
                  Guardar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
