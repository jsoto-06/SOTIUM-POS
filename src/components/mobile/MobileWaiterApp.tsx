import React, { useState, useMemo, useCallback } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, OrderItem, Employee, Customer } from '../../types/pos';
import { MobileService } from '../../services/mobileService';
import {
  User,
  Clock,
  LayoutGrid,
  CheckCircle2,
  Send,
  Plus,
  Minus,
  Trash2,
  Percent,
  Split,
  MoveRight,
  Printer,
  Moon,
  Sun,
  Smartphone,
  Tablet,
  Search,
  Users,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Key,
} from 'lucide-react';

export const MobileWaiterApp: React.FC = React.memo(() => {
  const {
    salons,
    selectedSalonId,
    setSelectedSalonId,
    selectedTable,
    setSelectedTable,
    products,
    categories,
    employees,
    activeEmployee,
    setActiveEmployee,
    ordersHistory,
    customers,
    reservations,
  } = usePOS();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isTabletView, setIsTabletView] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'order' | 'crm' | 'reservations'>('tables');
  const [pinInput, setPinInput] = useState<string>('');
  const [showUserSwitchModal, setShowUserSwitchModal] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchProduct]);

  // Current active salon
  const currentSalon = useMemo(() => {
    return salons.find((s) => s.id === selectedSalonId) || salons[0];
  }, [salons, selectedSalonId]);

  // Handle adding product to ticket
  const handleAddProduct = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity: 1,
          notes: '',
        },
      ];
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Subtotal and Total calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    const disc = subtotal * (discountPercent / 100);
    return Math.max(0, subtotal - disc);
  }, [subtotal, discountPercent]);

  // Send comanda to KDS
  const handleSendToKDS = useCallback(() => {
    if (cartItems.length === 0) {
      setStatusMessage({ text: 'Añade productos antes de enviar la comanda', type: 'error' });
      return;
    }
    MobileService.sendPushNotification(
      'ORDER',
      'Comanda enviada a Cocina',
      `Mesa ${selectedTable ? selectedTable.number : 'Barra'} - ${cartItems.length} artículos enviados al KDS.`,
      'HIGH',
      { tableNumber: selectedTable?.number, itemsCount: cartItems.length }
    );
    setStatusMessage({ text: 'Comanda enviada exitosamente a cocina (KDS)', type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  }, [cartItems, selectedTable]);

  // Apply discount with permission check
  const handleApplyDiscount = useCallback(() => {
    if (activeEmployee.role !== 'MANAGER' && activeEmployee.role !== 'ADMIN' && discountPercent > 10) {
      setStatusMessage({
        text: 'Rol insuficiente: Descuentos > 10% requieren autorización de Encargado',
        type: 'error',
      });
      return;
    }
    setShowDiscountModal(false);
    setStatusMessage({ text: `Descuento del ${discountPercent}% aplicado correctamente`, type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  }, [activeEmployee.role, discountPercent]);

  // Process payment
  const handleProcessPayment = useCallback(() => {
    if (cartItems.length === 0) return;
    MobileService.sendPushNotification(
      'HIGH_SALE',
      'Ticket Cobrado en Móvil',
      `Cobro de ${total.toFixed(2)} € realizado por ${activeEmployee.name}`,
      'MEDIUM',
      { total, table: selectedTable?.number }
    );
    setStatusMessage({ text: `Cobro completado: ${total.toFixed(2)} €. Ticket impreso.`, type: 'success' });
    setCartItems([]);
    setDiscountPercent(0);
    setOrderNotes('');
    setTimeout(() => setStatusMessage(null), 3500);
  }, [cartItems, total, activeEmployee, selectedTable]);

  // Handle user switch
  const handleUserSwitch = useCallback(() => {
    const emp = employees.find((e) => e.pin === pinInput);
    if (emp) {
      setActiveEmployee(emp);
      setShowUserSwitchModal(false);
      setPinInput('');
      setStatusMessage({ text: `Usuario cambiado a ${emp.name} (${emp.role})`, type: 'success' });
    } else {
      setStatusMessage({ text: 'PIN incorrecto', type: 'error' });
    }
    setTimeout(() => setStatusMessage(null), 3000);
  }, [employees, pinInput, setActiveEmployee]);

  const themeBg = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900';
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className={`min-h-screen flex flex-col ${themeBg}`}>
      {/* Top Mobile Bar */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${cardBg}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">App Camarero Enterprise</h1>
            <p className="text-xs text-slate-400">
              {activeEmployee.name} • <span className="text-amber-400 font-mono">{activeEmployee.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Mode Toggle Mobile / Tablet */}
          <button
            onClick={() => setIsTabletView(!isTabletView)}
            className={`p-2 rounded-lg transition-colors ${
              isTabletView ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Modo Tablet/Móvil"
          >
            {isTabletView ? <Tablet className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
          </button>

          {/* Switch User Button */}
          <button
            onClick={() => setShowUserSwitchModal(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-1 text-xs font-semibold"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Cambiar</span>
          </button>
        </div>
      </div>

      {/* Alert status message */}
      {statusMessage && (
        <div
          className={`px-4 py-2 text-xs font-medium text-center flex items-center justify-center space-x-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-b border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-b border-rose-500/30'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Mobile Sub-Navigation */}
      <div className={`grid grid-cols-4 border-b text-xs font-bold ${cardBg}`}>
        <button
          onClick={() => setActiveSubTab('tables')}
          className={`py-2.5 flex flex-col items-center space-y-1 border-b-2 ${
            activeSubTab === 'tables' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Salones & Mesas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('order')}
          className={`py-2.5 flex flex-col items-center space-y-1 border-b-2 relative ${
            activeSubTab === 'order' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ticket / Comanda</span>
          {cartItems.length > 0 && (
            <span className="absolute top-1 right-4 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('crm')}
          className={`py-2.5 flex flex-col items-center space-y-1 border-b-2 ${
            activeSubTab === 'crm' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes CRM</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reservations')}
          className={`py-2.5 flex flex-col items-center space-y-1 border-b-2 ${
            activeSubTab === 'reservations' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Reservas</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* SUBTAB 1: SALONES & MESAS */}
        {activeSubTab === 'tables' && (
          <div className="space-y-4">
            {/* Salon Selector */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {salons.map((salon) => (
                <button
                  key={salon.id}
                  onClick={() => setSelectedSalonId(salon.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSalonId === salon.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : isDarkMode
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {salon.name}
                </button>
              ))}
            </div>

            {/* Tables Grid */}
            <div className={`grid ${isTabletView ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-3`}>
              {currentSalon.tables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const statusColor =
                  table.status === 'OCCUPIED'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : table.status === 'RESERVED'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';

                return (
                  <button
                    key={table.id}
                    onClick={() => {
                      setSelectedTable(table);
                      setActiveSubTab('order');
                    }}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-between transition-all ${statusColor} ${
                      isSelected ? 'ring-2 ring-amber-500 scale-105 shadow-lg' : ''
                    }`}
                  >
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Mesa</span>
                    <span className="text-2xl font-black my-1">{table.number}</span>
                    <div className="flex items-center space-x-1 text-[11px] font-semibold">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity} Pax</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 2: TICKET / COMANDA & CATALOG */}
        {activeSubTab === 'order' && (
          <div className={`grid ${isTabletView ? 'grid-cols-12 gap-4' : 'grid-cols-1 gap-4'}`}>
            {/* Left/Main Column: Product Catalog */}
            <div className={`${isTabletView ? 'col-span-7' : 'col-span-1'} space-y-3`}>
              {/* Table Info Header */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${cardBg}`}>
                <div>
                  <span className="text-xs text-slate-400">Mesa Seleccionada:</span>
                  <p className="font-bold text-sm text-amber-400">
                    {selectedTable ? `Mesa ${selectedTable.number} (${currentSalon.name})` : 'Barra / General'}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowMoveModal(true)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1"
                    title="Mover o cambiar mesa"
                  >
                    <MoveRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mover</span>
                  </button>
                </div>
              </div>

              {/* Product Search & Categories */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar plato, bebida..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      selectedCategory === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : isDarkMode
                        ? 'bg-slate-900 text-slate-400 border border-slate-800'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-slate-950'
                          : isDarkMode
                          ? 'bg-slate-900 text-slate-400 border border-slate-800'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products List Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between hover:border-amber-500/50 transition-all ${cardBg}`}
                  >
                    <span className="font-bold text-xs line-clamp-2">{product.name}</span>
                    <span className="text-amber-400 font-extrabold text-sm mt-2">{product.price.toFixed(2)} €</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right/Cart Column: Active Order Ticket */}
            <div className={`${isTabletView ? 'col-span-5' : 'col-span-1'} p-4 rounded-2xl border space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Ticket de Comanda</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">{cartItems.length} artículos</span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Ticket vacío. Toca un producto para añadir.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <p className="font-bold">{item.product.name}</p>
                        <p className="text-slate-400 font-mono">{(item.product.price * item.quantity).toFixed(2)} €</p>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notes Input */}
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Observaciones / Alergias:</label>
                <input
                  type="text"
                  placeholder="Ej: Sin sal, salsa aparte..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              {/* Totals & Discounts Summary */}
              <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{subtotal.toFixed(2)} €</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Descuento ({discountPercent}%):</span>
                    <span className="font-mono">-{(subtotal * (discountPercent / 100)).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-white pt-1">
                  <span>TOTAL:</span>
                  <span className="text-amber-400 font-mono text-lg">{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleSendToKDS}
                  disabled={cartItems.length === 0}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Cocina</span>
                </button>

                <button
                  onClick={handleProcessPayment}
                  disabled={cartItems.length === 0}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cobrar Ticket</span>
                </button>

                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1"
                >
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Descuento</span>
                </button>

                <button
                  onClick={() => {
                    setStatusMessage({ text: 'Ticket impreso en impresora bluetooth móvil', type: 'success' });
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: CRM CLIENTES */}
        {activeSubTab === 'crm' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Clientes Frecuentes CRM</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customers.map((c) => (
                <div key={c.id} className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </div>
                    {c.isVip && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Puntos: {c.loyaltyPoints || 0}</span>
                    <span>Consumo: {(c.totalSpent || 0).toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 4: RESERVAS */}
        {activeSubTab === 'reservations' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Reservas del Turno</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reservations.map((r) => (
                <div key={r.id} className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{r.customerName}</h4>
                      <p className="text-xs text-slate-400">{r.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {r.time}h
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{r.guests} Comensales</span>
                    <span className="text-amber-400 font-semibold">{r.salonName || 'Zona Principal'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`p-5 rounded-2xl border max-w-xs w-full space-y-4 ${cardBg}`}>
            <h3 className="font-bold text-sm text-amber-400">Aplicar Descuento a Ticket</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Porcentaje de Descuento (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-slate-950 border-slate-800 text-amber-400 font-bold focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Descuentos &gt; 10% requieren permisos de Encargado/Admin.</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyDiscount}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Switch PIN Modal */}
      {showUserSwitchModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`p-5 rounded-2xl border max-w-xs w-full space-y-4 ${cardBg}`}>
            <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>Cambio de Camarero por PIN</span>
            </h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Introduce tu PIN:</label>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="****"
                className="w-full px-3 py-2 text-center text-lg tracking-widest rounded-xl border bg-slate-950 border-slate-800 text-amber-400 font-mono focus:outline-none"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUserSwitchModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleUserSwitch}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
              >
                Verificar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
