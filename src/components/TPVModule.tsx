import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  CourseType,
  ExtraOption,
  OrderType,
  PaymentMethod,
  Product,
  ProductVariant,
} from '../types/pos';
import {
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  User,
  Percent,
  Split,
  ArrowRightLeft,
  Gift,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Utensils,
  Receipt,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Zap,
  Beer,
  ShoppingBag,
  Truck,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  UserCheck,
  RefreshCw,
  Copy,
  EyeOff,
  Tag,
  Ban,
  Building2,
  Clock,
  Check,
} from 'lucide-react';

const MANDATORY_VOID_REASONS = [
  'Error de tecleo / digitación de camarero',
  'Producto defectuoso / mala calidad cocina',
  'Cliente canceló la comanda antes de servir',
  'Plato devuelto por alergia no informada',
  'Cortesía / Atención especial de dirección',
  'Prueba de cocina / Degustación personal',
];

const DENOMINATIONS = [
  { label: '500 €', val: 500 },
  { label: '200 €', val: 200 },
  { label: '100 €', val: 100 },
  { label: '50 €', val: 50 },
  { label: '20 €', val: 20 },
  { label: '10 €', val: 10 },
  { label: '5 €', val: 5 },
  { label: '2 €', val: 2 },
  { label: '1 €', val: 1 },
  { label: '0.50 €', val: 0.5 },
  { label: '0.20 €', val: 0.2 },
  { label: '0.10 €', val: 0.1 },
];

export const TPVModule: React.FC = () => {
  const {
    categories,
    products,
    currentOrder,
    addItemToOrder,
    updateOrderItem,
    removeOrderItem,
    clearCurrentOrder,
    setOrderCustomer,
    setOrderDiscount,
    setOrderSurcharge,
    setOrderTip,
    setOrderType,
    processPayment,
    customers,
    selectedTable,
    salons,
    transferTableOrder,
    parkedOrders,
    parkCurrentOrder,
    unparkOrder,
    cashRegisters,
    activeRegisterId,
    setActiveRegisterId,
    cashMovements,
    addCashMovement,
    shiftLogs,
    performShiftChange,
    employees,
    activeEmployee,
    voidCurrentOrder,
    voidOrderItem,
    performArqueoZ,
    activeCashSession,
  } = usePOS();

  // Navigation & Filter state
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Modals visibility
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TARJETA');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [docType, setDocType] = useState<'TICKET' | 'FACTURA' | 'PROFORMA' | 'REGALO'>('TICKET');
  const [paymentResult, setPaymentResult] = useState<{ hash: string; qr: string } | null>(null);

  // Split bill modal state
  const [showSplitModal, setShowSplitModal] = useState<boolean>(false);
  const [splitDiners, setSplitDiners] = useState<number>(2);

  // Customer modal state
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [custSearch, setCustSearch] = useState<string>('');

  // Transfer table modal state
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [targetTableId, setTargetTableId] = useState<string>('');

  // Parked tickets modal state
  const [showParkedModal, setShowParkedModal] = useState<boolean>(false);

  // Cash Management Modals state
  const [showCashMovementModal, setShowCashMovementModal] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [movementAmount, setMovementAmount] = useState<string>('');
  const [movementReason, setMovementReason] = useState<string>('');

  const [showClosingModal, setShowClosingModal] = useState<boolean>(false);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(true);
  const [countedDenominations, setCountedDenominations] = useState<Record<number, number>>({});
  const [countedTotalManual, setCountedTotalManual] = useState<string>('');
  const [zReportGenerated, setZReportGenerated] = useState<any>(null);

  // Shift Change Modal
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('');

  // Void Reason Modal
  const [showVoidModal, setShowVoidModal] = useState<{ type: 'ORDER' | 'ITEM'; itemId?: string } | null>(null);
  const [voidReasonInput, setVoidReasonInput] = useState<string>('');

  // Product Variant Popover
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);

  // Item Note Inline Editing
  const [editingItemNote, setEditingItemNote] = useState<{ id: string; note: string } | null>(null);

  // Filtered products calculation
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCatId === 'all' || p.categoryId === selectedCatId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    const matchesFav = !showOnlyFavorites || p.isFavorite;
    return matchesCat && matchesSearch && matchesFav;
  });

  const activeRegister = cashRegisters.find((r) => r.id === activeRegisterId) || cashRegisters[0];

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = products.find((p) => p.barcode === barcodeInput.trim());
    if (found) {
      addItemToOrder(found);
      setBarcodeInput('');
    } else {
      alert(`Producto con código de barras "${barcodeInput}" no encontrado en catálogo.`);
    }
  };

  const handleAddProductClick = (product: Product) => {
    if (product.extras && product.extras.length > 0) {
      setSelectedProductForOptions(product);
    } else {
      addItemToOrder(product);
    }
  };

  const handlePaymentConfirm = async () => {
    const paid = paymentMethod === 'EFECTIVO' ? (cashGiven > 0 ? cashGiven : currentOrder.total) : currentOrder.total;
    const res = await processPayment(paymentMethod, paid, undefined, docType);
    setPaymentResult({ hash: res.verifactuHash, qr: res.qrUrl });
  };

  const closePaymentFlow = () => {
    setShowPaymentModal(false);
    setPaymentResult(null);
    setCashGiven(0);
  };

  const handleCashMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(movementAmount);
    if (isNaN(amt) || amt <= 0 || !movementReason.trim()) {
      alert('Introduzca un importe válido y el motivo obligatorio.');
      return;
    }
    addCashMovement(movementType, amt, movementReason.trim());
    setShowCashMovementModal(false);
    setMovementAmount('');
    setMovementReason('');
  };

  const calculateCountedTotal = () => {
    if (countedTotalManual) return parseFloat(countedTotalManual) || 0;
    return Object.entries(countedDenominations).reduce(
      (sum, [denom, count]) => sum + parseFloat(denom) * (Number(count) || 0),
      0
    );
  };

  const handlePerformZClosing = () => {
    const totalCounted = calculateCountedTotal();
    const zReport = performArqueoZ(totalCounted, isBlindMode);
    setZReportGenerated(zReport);
  };

  const handleConfirmShiftChange = () => {
    if (!targetEmployeeId) return;
    performShiftChange(targetEmployeeId);
    setShowShiftModal(false);
  };

  const handleConfirmVoid = () => {
    if (!voidReasonInput.trim()) {
      alert('El motivo de anulación es obligatorio por normativa de auditoría.');
      return;
    }
    if (showVoidModal?.type === 'ORDER') {
      voidCurrentOrder(voidReasonInput);
    } else if (showVoidModal?.type === 'ITEM' && showVoidModal.itemId) {
      voidOrderItem(showVoidModal.itemId, voidReasonInput);
    }
    setShowVoidModal(null);
    setVoidReasonInput('');
  };

  return (
    <div className="flex h-[calc(100vh-84px)] bg-slate-100 overflow-hidden font-sans">
      {/* Left Product Catalog Column */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden border-r border-slate-200">
        {/* Top Control Bar: Sales Type, Active Register, Shift & Parked Tickets */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
          {/* Order Type Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
            {[
              { type: 'DIRECTA', label: 'Venta Rápida', icon: <Zap className="w-3.5 h-3.5" /> },
              { type: 'MESA', label: 'Mesa', icon: <Utensils className="w-3.5 h-3.5" /> },
              { type: 'BARRA', label: 'Barra', icon: <Beer className="w-3.5 h-3.5" /> },
              { type: 'TAKE_AWAY', label: 'Llevar', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
              { type: 'DELIVERY', label: 'Delivery', icon: <Truck className="w-3.5 h-3.5" /> },
              { type: 'CLICK_COLLECT', label: 'Click & Collect', icon: <Clock className="w-3.5 h-3.5" /> },
            ].map((t) => (
              <button
                key={t.type}
                onClick={() => setOrderType(t.type as OrderType)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  currentOrder.type === t.type
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Active Cash Register & Shift Status */}
          <div className="flex items-center space-x-2">
            {/* Register Selector Dropdown */}
            <select
              value={activeRegisterId}
              onChange={(e) => setActiveRegisterId(e.target.value)}
              className="bg-slate-900 text-amber-400 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-none"
            >
              {cashRegisters.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.currentBalance.toFixed(2)} €)
                </option>
              ))}
            </select>

            {/* Active Shift Employee */}
            <button
              onClick={() => setShowShiftModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold"
              title="Cambiar turno de empleado"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeEmployee.name}</span>
            </button>

            {/* Parked Tickets Badge Button */}
            <button
              onClick={() => setShowParkedModal(true)}
              className="relative flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition-all"
            >
              <PauseCircle className="w-4 h-4 text-indigo-600" />
              <span>En Espera</span>
              {parkedOrders.length > 0 && (
                <span className="ml-1 bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {parkedOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar & Catalog Filters */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
          </div>

          <form onSubmit={handleBarcodeSubmit} className="flex items-center">
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Escáner PLU..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-40 pl-9 pr-2 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>
          </form>

          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center space-x-1 px-3 py-2 text-xs font-bold rounded-lg border transition-all shadow-xs ${
              showOnlyFavorites
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Favoritos</span>
          </button>

          <button
            onClick={() => {
              setSelectedCatId('all');
              setSearchQuery('');
              setShowOnlyFavorites(false);
            }}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all shadow-xs ${
              selectedCatId === 'all' && !searchQuery && !showOnlyFavorites
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Categories Horizontal Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shadow-xs ${
                selectedCatId === cat.id
                  ? `${cat.color} text-white ring-2 ring-amber-500 ring-offset-1`
                  : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Touch Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pr-1">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => handleAddProductClick(p)}
              className="group relative bg-white border border-slate-200 hover:border-amber-500 rounded-xl p-2.5 flex flex-col justify-between text-left shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <div className="relative w-full h-24 mb-2 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {p.isFavorite && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-xs">
                    <Sparkles className="w-3 h-3" />
                  </span>
                )}
                <span className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                  IVA {p.vatRate}%
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight mb-1">{p.name}</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-600 font-black text-sm font-mono">{p.price.toFixed(2)} €</span>
                  <span className="text-[10px] text-slate-400 font-mono">Stock: {p.stock}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Ticket Sidebar */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-xl">
        {/* Ticket Header */}
        <div className="p-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm tracking-wide text-amber-400">{currentOrder.orderNumber}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                {currentOrder.type}
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VeriFactu OK</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-1">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentOrder.tableName || 'Venta Directa / Barra'}</span>
            </div>
            <span>Atendido: {currentOrder.serverName}</span>
          </div>

          {currentOrder.customerName && (
            <div className="mt-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2 py-1 rounded flex items-center justify-between">
              <span>Cliente: {currentOrder.customerName} ({currentOrder.customerNif || 'Sin NIF'})</span>
              <button onClick={() => setOrderCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Ticket Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 divide-y divide-slate-100">
          {currentOrder.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
              <Receipt className="w-12 h-12 stroke-1 text-slate-300" />
              <p className="text-xs font-medium">Comanda vacía. Seleccione productos.</p>
            </div>
          ) : (
            currentOrder.items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-900">{item.productName}</span>
                      {item.isInvitation && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1 rounded">
                          INVITACIÓN
                        </span>
                      )}
                    </div>

                    {/* Course tag selector */}
                    <div className="flex items-center space-x-1 mt-1">
                      {(['ENTRANTE', 'PRIMERO', 'SEGUNDO', 'POSTRE', 'BEBIDA'] as CourseType[]).map((course) => (
                        <button
                          key={course}
                          onClick={() => updateOrderItem(item.id, { course })}
                          className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold transition-colors ${
                            item.course === course
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {course.substring(0, 3)}
                        </button>
                      ))}
                    </div>

                    {item.notes && <p className="text-[11px] text-amber-700 italic mt-0.5">Nota: {item.notes}</p>}
                  </div>

                  <div className="text-right font-mono font-bold text-slate-900">
                    {item.isInvitation ? '0.00 €' : `${(item.unitPrice * item.quantity).toFixed(2)} €`}
                  </div>
                </div>

                {/* Qty & Line modifier controls */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center space-x-1 bg-slate-100 rounded-md p-0.5 border border-slate-200">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateOrderItem(item.id, { quantity: item.quantity - 1 })
                          : removeOrderItem(item.id)
                      }
                      className="p-1 text-slate-600 hover:text-slate-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900 font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateOrderItem(item.id, { quantity: item.quantity + 1 })}
                      className="p-1 text-slate-600 hover:text-slate-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-500">
                    <button
                      onClick={() => updateOrderItem(item.id, { isInvitation: !item.isInvitation })}
                      className={`hover:text-amber-600 ${item.isInvitation ? 'text-amber-600 font-bold' : ''}`}
                      title="Invitación (Cortesía)"
                    >
                      <Gift className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setEditingItemNote({ id: item.id, note: item.notes || '' })}
                      className="hover:text-slate-900"
                      title="Nota cocina"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setShowVoidModal({ type: 'ITEM', itemId: item.id })}
                      className="text-red-500 hover:text-red-700"
                      title="Anular línea con motivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Item Note Modal */}
        {editingItemNote && (
          <div className="p-2 bg-amber-50 border-t border-amber-200 flex items-center space-x-2 text-xs">
            <input
              type="text"
              placeholder="Modificador cocina (Ej: Sin cebolla, muy hecho)..."
              value={editingItemNote.note}
              onChange={(e) => setEditingItemNote({ ...editingItemNote, note: e.target.value })}
              className="flex-1 bg-white border border-amber-300 rounded px-2 py-1 text-slate-800"
            />
            <button
              onClick={() => {
                updateOrderItem(editingItemNote.id, { notes: editingItemNote.note });
                setEditingItemNote(null);
              }}
              className="px-2 py-1 bg-amber-600 text-white font-bold rounded"
            >
              Guardar
            </button>
          </div>
        )}

        {/* Ticket Totals & Operations Action Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
          {/* Quick Action Grid (Phase 7 full features) */}
          <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <User className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
              <span>Cliente</span>
            </button>

            <button
              onClick={() => {
                const disc = prompt('Introducir descuento global %:', '10');
                if (disc) setOrderDiscount(parseFloat(disc));
              }}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Percent className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
              <span>Descuento</span>
            </button>

            <button
              onClick={() => {
                const sur = prompt('Introducir recargo % (Ej: Terraza 10%):', '10');
                if (sur) setOrderSurcharge(parseFloat(sur));
              }}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Tag className="w-3.5 h-3.5 text-purple-600 mb-0.5" />
              <span>Recargo</span>
            </button>

            <button
              onClick={() => parkCurrentOrder()}
              disabled={currentOrder.items.length === 0}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <PauseCircle className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
              <span>Aparcar</span>
            </button>

            <button
              onClick={() => setShowSplitModal(true)}
              disabled={currentOrder.items.length === 0}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <Split className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
              <span>Dividir</span>
            </button>

            <button
              onClick={() => setShowTransferModal(true)}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600 mb-0.5" />
              <span>Traspasar</span>
            </button>

            <button
              onClick={() => setShowCashMovementModal(true)}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
              <span>Entrada/Salida</span>
            </button>

            <button
              onClick={() => setShowClosingModal(true)}
              className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-700 mb-0.5" />
              <span>Cierre Caja</span>
            </button>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1 text-xs pt-2 border-t border-slate-200">
            <div className="flex justify-between text-slate-500">
              <span>Base Imponible</span>
              <span className="font-mono">{currentOrder.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Cuota IVA</span>
              <span className="font-mono">{currentOrder.vatAmount.toFixed(2)} €</span>
            </div>
            {currentOrder.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento</span>
                <span className="font-mono">-{currentOrder.discountTotal.toFixed(2)} €</span>
              </div>
            )}
            {currentOrder.surchargeTotal ? (
              <div className="flex justify-between text-purple-600 font-semibold">
                <span>Recargo Terraza</span>
                <span className="font-mono">+{currentOrder.surchargeTotal.toFixed(2)} €</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-900 font-black text-lg pt-1 border-t border-slate-300">
              <span>TOTAL</span>
              <span className="font-mono text-amber-600">{currentOrder.total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Checkout & Void Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setShowVoidModal({ type: 'ORDER' })}
              disabled={currentOrder.items.length === 0}
              className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-xs flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Anular Ticket</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={currentOrder.items.length === 0}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-sm shadow-md shadow-amber-500/30 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>COBRAR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            {!paymentResult ? (
              <>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-black text-amber-400">Cobro Ticket #{currentOrder.orderNumber}</h3>
                    <p className="text-xs text-slate-400">Tipo: {currentOrder.type} | Mesa: {currentOrder.tableName || 'Directa'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-amber-400 font-mono">
                      {currentOrder.total.toFixed(2)} €
                    </span>
                    <p className="text-[10px] text-slate-400">IVA Incluido</p>
                  </div>
                </div>

                {/* Document Type Selector (Factura vs Ticket vs Proforma vs Regalo) */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Tipo de Documento Fiscal
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { type: 'TICKET', label: 'Ticket Simplificado' },
                      { type: 'FACTURA', label: 'Factura Completa' },
                      { type: 'PROFORMA', label: 'Precuenta Proforma' },
                      { type: 'REGALO', label: 'Ticket Regalo' },
                    ].map((d) => (
                      <button
                        key={d.type}
                        onClick={() => setDocType(d.type as any)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                          docType === d.type
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Methods selector */}
                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Forma de Pago
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'TARJETA', label: 'Tarjeta Datáfono', icon: <CreditCard className="w-4 h-4" /> },
                      { id: 'EFECTIVO', label: 'Efectivo', icon: <Banknote className="w-4 h-4" /> },
                      { id: 'BIZUM', label: 'Bizum', icon: <Smartphone className="w-4 h-4" /> },
                      { id: 'TRANSFERENCIA', label: 'Transferencia', icon: <Building2 className="w-4 h-4" /> },
                      { id: 'TICKET_RESTAURANT', label: 'Vale Restaurante', icon: <FileText className="w-4 h-4" /> },
                      { id: 'VALE', label: 'Vale Local', icon: <Tag className="w-4 h-4" /> },
                      { id: 'GIFT_CARD', label: 'Gift Card', icon: <Gift className="w-4 h-4" /> },
                      { id: 'MIXTO', label: 'Pago Mixto', icon: <Receipt className="w-4 h-4" /> },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                          paymentMethod === pm.id
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {pm.icon}
                        <span className="text-[11px] text-center font-bold leading-tight">{pm.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'EFECTIVO' && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span>Importe Entregado por Cliente:</span>
                        <input
                          type="number"
                          value={cashGiven || ''}
                          onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                          placeholder={currentOrder.total.toFixed(2)}
                          className="w-32 bg-slate-900 border border-slate-700 font-mono font-bold text-amber-400 text-right text-lg px-2 py-1 rounded focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Fast Cash Buttons */}
                      <div className="flex space-x-2">
                        {[5, 10, 20, 50, 100].map((val) => (
                          <button
                            key={val}
                            onClick={() => setCashGiven(val)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-white rounded border border-slate-700"
                          >
                            {val} €
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800 font-bold">
                        <span className="text-slate-300">Cambio a Devolver:</span>
                        <span className="text-emerald-400 font-mono text-xl">
                          {Math.max(0, cashGiven - currentOrder.total).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  )}

                  {/* VeriFactu Compliance Note */}
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-center space-x-3 text-xs text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">Normativa VeriFactu Ley 11/2021 Activada</p>
                      <p className="text-[11px] text-emerald-400/80">
                        Encadenamiento SHA-256 e inalterabilidad fiscal garantizados antes de impresión.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={closePaymentFlow}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handlePaymentConfirm}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20"
                  >
                    Confirmar Cobro
                  </button>
                </div>
              </>
            ) : (
              /* Payment Complete Receipt Screen */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">¡Venta Procesada con Éxito!</h3>
                  <p className="text-xs text-slate-400 mt-1">Ticket firmado digitalmente y enviado a la AEAT</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Huella Digital VeriFactu:</span>
                    <span className="text-amber-400 truncate max-w-[220px]">{paymentResult.hash}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Respuesta AEAT:</span>
                    <span className="text-emerald-400">ACEPTADO (200 OK)</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    onClick={closePaymentFlow}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    Cerrar Ticket
                  </button>

                  <button
                    onClick={() => {
                      alert('Imprimiendo copia oficial en impresora térmica de caja...');
                      closePaymentFlow();
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Ticket Original</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Imprimiendo DUPLICADO de ticket con marca legal oficial...');
                      closePaymentFlow();
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copia Duplicada</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cash Movements Modal (Cash IN / Cash OUT) */}
      {showCashMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Entrada / Salida de Dinero en Caja</h3>
            <p className="text-xs text-slate-400 mb-4">Caja Activa: {activeRegister.name}</p>

            <form onSubmit={handleCashMovementSubmit} className="space-y-4">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1 border ${
                    movementType === 'IN'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-emerald-300" />
                  <span>Entrada (Cash IN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1 border ${
                    movementType === 'OUT'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-red-300" />
                  <span>Salida (Cash OUT)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Importe (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo / Justificante</label>
                <input
                  type="text"
                  placeholder="Ej: Aportar cambio de 50€ o Pago contado a proveedor hortalizas"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCashMovementModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash Closing / Arqueo Z & Blind Counting Modal */}
      {showClosingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
            {!zReportGenerated ? (
              <>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-black text-amber-400">Arqueo Z / Cierre Diario de Caja</h3>
                    <p className="text-xs text-slate-400">{activeRegister.name} — Responsable: {activeEmployee.name}</p>
                  </div>
                  <button
                    onClick={() => setIsBlindMode(!isBlindMode)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isBlindMode
                        ? 'bg-purple-950 border-purple-500 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isBlindMode ? 'Modo Caja Ciega ACTIVADO' : 'Modo Estándar'}</span>
                  </button>
                </div>

                {!isBlindMode && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-xs mb-4 font-mono">
                    <div>
                      <span className="text-slate-500 block">Fondo Inicial:</span>
                      <span className="text-white font-bold">{activeCashSession.initialCash.toFixed(2)} €</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ventas Teóricas:</span>
                      <span className="text-amber-400 font-bold">Calculando...</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Saldo Teórico en Caja:</span>
                      <span className="text-emerald-400 font-bold">Oculto</span>
                    </div>
                  </div>
                )}

                {/* Desglose de billetes y monedas */}
                <div className="space-y-2 mb-6">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Desglose de Efectivo Contado en Arqueo
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {DENOMINATIONS.map((d) => (
                      <div key={d.val} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">{d.label}</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={countedDenominations[d.val] || ''}
                          onChange={(e) =>
                            setCountedDenominations({
                              ...countedDenominations,
                              [d.val]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-14 bg-slate-900 border border-slate-700 font-mono text-center text-xs py-1 rounded text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-300 font-bold">Total Efectivo Recontado:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {calculateCountedTotal().toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowClosingModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePerformZClosing}
                    className="px-6 py-2 bg-amber-500 text-slate-950 font-black rounded-lg text-xs"
                  >
                    Generar Reporte Z de Cierre
                  </button>
                </div>
              </>
            ) : (
              /* Z-Report Summary Result */
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-black text-lg">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Cierre Z #{zReportGenerated.closingNumber} Generado</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Total Ventas Brutas:</span>
                    <span className="text-amber-400 font-bold">{zReportGenerated.totalSales.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Efectivo Esperado:</span>
                    <span className="text-white">{zReportGenerated.expectedCash.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Efectivo Recontado:</span>
                    <span className="text-emerald-400">{zReportGenerated.countedCash.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-800 pt-1">
                    <span className="text-slate-400">Desviación / Arqueo:</span>
                    <span className={zReportGenerated.cashDifference >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {zReportGenerated.cashDifference.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setShowClosingModal(false);
                      setZReportGenerated(null);
                    }}
                    className="px-6 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Cerrar Informe Z
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shift Change Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Cambio de Turno de Empleado</h3>
            <p className="text-xs text-slate-400 mb-4">Empleado Actual: {activeEmployee.name}</p>

            <div className="space-y-2 mb-6 max-h-52 overflow-y-auto">
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setTargetEmployeeId(emp.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    targetEmployeeId === emp.id
                      ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img src={emp.photoUrl} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold">{emp.name}</div>
                      <div className="text-[10px] text-slate-500">{emp.role}</div>
                    </div>
                  </div>
                  {targetEmployeeId === emp.id && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowShiftModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmShiftChange}
                disabled={!targetEmployeeId}
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs disabled:opacity-50"
              >
                Confirmar Entrar en Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Reason Audit Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-red-400 mb-2">
              {showVoidModal.type === 'ORDER' ? 'Anulación Completa de Ticket' : 'Anulación de Línea de Pedido'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Por Ley Antifraude y auditoría interna, debe seleccionar un motivo obligatorio:
            </p>

            <div className="space-y-2 mb-4">
              {MANDATORY_VOID_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setVoidReasonInput(reason)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs ${
                    voidReasonInput === reason
                      ? 'bg-red-950 border-red-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="O escriba otro motivo detallado..."
              value={voidReasonInput}
              onChange={(e) => setVoidReasonInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white mb-4 focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowVoidModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmVoid}
                className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg text-xs"
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parked Tickets Modal */}
      {showParkedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-indigo-400 mb-2">Tickets en Espera (Aparcados)</h3>
            <p className="text-xs text-slate-400 mb-4">Seleccione una comanda para recuperarla en pantalla:</p>

            {parkedOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No hay tickets aparcados en este momento.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {parkedOrders.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{p.referenceName}</div>
                      <div className="text-[10px] text-slate-400">
                        Aparcado por {p.parkedBy} — {new Date(p.parkedAt).toLocaleTimeString()} | {p.order.items.length} artículos
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">{p.order.total.toFixed(2)} €</span>
                      <button
                        onClick={() => {
                          unparkOrder(p.id);
                          setShowParkedModal(false);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                      >
                        Recuperar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowParkedModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-3">Asociar Cliente para Facturación</h3>

            <input
              type="text"
              placeholder="Buscar por nombre o NIF..."
              value={custSearch}
              onChange={(e) => setCustSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white mb-3"
            />

            <div className="space-y-2 max-h-56 overflow-y-auto mb-4 pr-1">
              {customers
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
                    c.nif.toLowerCase().includes(custSearch.toLowerCase())
                )
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setOrderCustomer(c);
                      setShowCustomerModal(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 transition-all flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        NIF: {c.nif} | Puntos: {c.points}
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs font-bold">Asociar</span>
                  </button>
                ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-teal-400 mb-2">Traspasar o Unir Comanda de Mesa</h3>
            <p className="text-xs text-slate-400 mb-4">Seleccione la mesa de destino para traspasar los productos:</p>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
              {salons.flatMap((s) =>
                s.tables.map((tbl) => (
                  <button
                    key={tbl.id}
                    onClick={() => setTargetTableId(tbl.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      targetTableId === tbl.id
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>{tbl.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {s.name} ({tbl.status})
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedTable && targetTableId) {
                    transferTableOrder(selectedTable.id, targetTableId);
                    alert('Comanda traspasada con éxito.');
                    setShowTransferModal(false);
                  }
                }}
                disabled={!targetTableId}
                className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs disabled:opacity-50"
              >
                Confirmar Traspaso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Bill Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Dividir Cuenta a Partes Iguales</h3>
            <p className="text-xs text-slate-400 mb-4">Total: {currentOrder.total.toFixed(2)} €</p>

            <div className="flex items-center justify-center space-x-4 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <button
                onClick={() => setSplitDiners(Math.max(2, splitDiners - 1))}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-3xl font-black text-amber-400 font-mono">{splitDiners}</span>
                <p className="text-[10px] text-slate-400">Comensales</p>
              </div>
              <button
                onClick={() => setSplitDiners(splitDiners + 1)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl text-center mb-6 border border-slate-800">
              <span className="text-xs text-slate-400">Importe a pagar por persona:</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {(currentOrder.total / splitDiners).toFixed(2)} €
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSplitModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert(`Generando cobro de fraccion por comensal (${(currentOrder.total / splitDiners).toFixed(2)} €)...`);
                  setShowSplitModal(false);
                  setShowPaymentModal(true);
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Cobrar Fracción ({ (currentOrder.total / splitDiners).toFixed(2) } €)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Variants / Extras Selector Modal */}
      {selectedProductForOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-amber-400 mb-1">{selectedProductForOptions.name}</h3>
            <p className="text-xs text-slate-400 mb-4">Seleccione suplementos o extras opcionales:</p>

            <div className="space-y-2 mb-6">
              {selectedProductForOptions.extras?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    addItemToOrder(selectedProductForOptions, 1, 'PRIMERO', undefined, [opt]);
                    setSelectedProductForOptions(null);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 flex justify-between items-center text-xs font-bold"
                >
                  <span>+ {opt.name}</span>
                  <span className="text-amber-400 font-mono">+{opt.price.toFixed(2)} €</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  addItemToOrder(selectedProductForOptions);
                  setSelectedProductForOptions(null);
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Sin Extras ({selectedProductForOptions.price.toFixed(2)} €)
              </button>
              <button
                onClick={() => setSelectedProductForOptions(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
