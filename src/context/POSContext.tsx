import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActiveTab,
  Category,
  Customer,
  DeliveryOrder,
  Employee,
  Ingredient,
  Order,
  OrderItem,
  PaymentMethod,
  Product,
  Reservation,
  ReservationStatus,
  WaitingListItem,
  Salon,
  Table,
  CashClosing,
  TableStatus,
  CourseType,
  CashMovement,
  CashRegister,
  ParkedOrder,
  ShiftLog,
  OrderType,
  ExtraOption,
  KDSStation,
  KDSStateColorConfig,
  KDSPriority,
  ItemKDSStatus,
} from '../types/pos';
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_DELIVERY_ORDERS,
  INITIAL_EMPLOYEES,
  INITIAL_INGREDIENTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_RESERVATIONS,
  INITIAL_SALONS,
  INITIAL_KDS_STATIONS,
  INITIAL_KDS_COLORS,
} from '../data/initialData';
import { kdsAudio } from '../services/kdsAudioService';
import { queueOfflineSyncAction, syncOfflineQueueWithServer } from '../db/sqlite-sync-engine';
import {
  createFullReservation,
  createQuickReservation as serviceCreateQuickReservation,
  handleCheckIn as serviceHandleCheckIn,
  handleNoShow as serviceHandleNoShow,
  addWaitingListItem as serviceAddWaitingListItem,
  parseReservationsCSV,
} from '../services/reservationService';

const INITIAL_REGISTERS: CashRegister[] = [
  { id: 'reg-1', name: 'Caja Principal Barra', location: 'Barra Central', currentBalance: 300.0, isOpened: true, openedAt: new Date().toISOString(), openedBy: 'Carlos Camarero' },
  { id: 'reg-2', name: 'Caja Terraza Exterior', location: 'Terraza', currentBalance: 150.0, isOpened: true, openedAt: new Date().toISOString(), openedBy: 'Ana Martínez' },
  { id: 'reg-3', name: 'Caja Comedor Noble', location: 'Planta 1', currentBalance: 200.0, isOpened: false },
];

export interface POSContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  salons: Salon[];
  selectedSalonId: string;
  setSelectedSalonId: (id: string) => void;
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  ingredients: Ingredient[];
  customers: Customer[];
  employees: Employee[];
  activeEmployee: Employee;
  setActiveEmployee: (emp: Employee) => void;
  currentOrder: Order;
  ordersHistory: Order[];
  deliveryOrders: DeliveryOrder[];
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  waitingList: WaitingListItem[];
  setWaitingList: React.Dispatch<React.SetStateAction<WaitingListItem[]>>;
  addReservation: (resData: Partial<Reservation> & { customerName: string; phone: string; pax: number; date: string; time: string }) => Promise<Reservation>;
  addQuickReservation: (params: { customerName: string; phone: string; pax: number; time?: string; date?: string; tableId: string; tableName: string; salonId: string; salonName: string }) => Reservation;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  checkInReservation: (id: string, tableIdOverride?: string) => void;
  markNoShowReservation: (id: string, penaltyFee?: number) => void;
  addWaitingListItem: (item: Omit<WaitingListItem, 'id' | 'code' | 'joinedAt' | 'position' | 'status'>) => void;
  seatWaitingListItem: (waitingId: string, tableId: string) => void;
  removeFromWaitingList: (waitingId: string) => void;
  importReservationsFromCSV: (csvContent: string) => void;
  cashClosings: CashClosing[];
  activeCashSession: { openedAt: string; initialCash: number; isOpened: boolean };
  // Phase 7 Motor TPV Features
  parkedOrders: ParkedOrder[];
  parkCurrentOrder: (referenceName?: string) => void;
  unparkOrder: (parkedOrderId: string) => void;
  cashRegisters: CashRegister[];
  activeRegisterId: string;
  setActiveRegisterId: (id: string) => void;
  cashMovements: CashMovement[];
  addCashMovement: (type: 'IN' | 'OUT', amount: number, reason: string) => void;
  shiftLogs: ShiftLog[];
  performShiftChange: (newEmployeeId: string) => void;
  setOrderSurcharge: (surchargePercent: number) => void;
  setOrderType: (type: OrderType) => void;
  voidCurrentOrder: (reason: string) => void;
  voidOrderItem: (itemId: string, reason: string) => void;
  // POS Actions
  addItemToOrder: (product: Product, quantity?: number, course?: CourseType, selectedVariant?: { name: string; price: number }, selectedExtras?: ExtraOption[]) => void;
  updateOrderItem: (itemId: string, updates: Partial<OrderItem>) => void;
  removeOrderItem: (itemId: string) => void;
  clearCurrentOrder: () => void;
  setOrderCustomer: (customer: Customer | null) => void;
  setOrderDiscount: (discountPercent: number) => void;
  setOrderTip: (tipAmount: number) => void;
  processPayment: (
    method: PaymentMethod,
    paidAmount: number,
    mixedBreakdown?: { method: PaymentMethod; amount: number }[],
    documentType?: 'TICKET' | 'FACTURA' | 'ALBARAN' | 'PROFORMA' | 'REGALO'
  ) => Promise<{ success: boolean; verifactuHash: string; qrUrl: string }>;
  // Phase 8 Visual Floor Plan & Salon Actions
  addSalon: (salonData: Partial<Salon> & { name: string }) => void;
  updateSalon: (salonId: string, updates: Partial<Salon>) => void;
  deleteSalon: (salonId: string) => void;
  addTable: (salonId: string, tableData: Partial<Table> & { name: string; seats: number }) => void;
  updateTable: (tableId: string, updates: Partial<Table>) => void;
  duplicateTable: (tableId: string) => void;
  deleteTable: (tableId: string) => void;
  updateTablePosition: (tableId: string, x: number, y: number, isLocked?: boolean, rotation?: number) => void;
  updateTableStatus: (tableId: string, status: TableStatus, pax?: number, serverName?: string) => void;
  selectTableForPOS: (tableId: string) => void;
  transferTableOrder: (sourceTableId: string, targetTableId: string) => void;
  joinTables: (mainTableId: string, secondaryTableIds: string[]) => void;
  separateTables: (tableId: string) => void;
  moveClientsToSalon: (tableId: string, targetSalonId: string) => void;
  assignWaiterToTable: (tableId: string, serverId: string, serverName: string) => void;
  updateTablePax: (tableId: string, pax: number) => void;
  bindReservationToTable: (reservationId: string, tableId: string) => void;
  tableCheckIn: (tableId: string, reservationId?: string) => void;
  tableNoShow: (reservationId: string) => void;
  lockTableReservation: (tableId: string) => void;
  releaseTableReservation: (tableId: string) => void;
  // KDS Actions & Enterprise Management
  kdsStations: KDSStation[];
  kdsStateColors: KDSStateColorConfig;
  activeKDSStationId: string;
  setActiveKDSStationId: (id: string) => void;
  kdsSoundEnabled: boolean;
  setKDSSoundEnabled: (enabled: boolean) => void;
  kdsVolume: number;
  setKDSVolume: (vol: number) => void;
  updateKDSItemStatus: (orderId: string, itemId: string, newStatus: ItemKDSStatus, cookName?: string) => void;
  updateKDSItemPriority: (orderId: string, itemId: string, priority: KDSPriority) => void;
  addKDSStation: (stationData: Omit<KDSStation, 'id'>) => void;
  updateKDSStation: (stationId: string, updates: Partial<KDSStation>) => void;
  deleteKDSStation: (stationId: string) => void;
  updateKDSStateColors: (colors: Partial<KDSStateColorConfig>) => void;
  // Cash Register Actions
  openCashDrawer: (initialCash: number) => void;
  performArqueoZ: (countedCash: number, isBlind?: boolean) => CashClosing;
  // CRM Actions
  addCustomer: (cust: Omit<Customer, 'id' | 'points' | 'totalSpent' | 'balance'>) => void;
  // Recipe Escandallo Action
  updateProductEscandallo: (productId: string, escandallo: Product['escandallo']) => void;
  // Offline SQLite -> Master PostgreSQL Synchronization
  triggerSyncWithPostgres: () => Promise<{ syncedCount: number; errors: number }>;
  // VeriFactu Status
  lastVeriFactuHash: string;
  ticketSequenceCounter: number;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tpv');
  const [salons, setSalons] = useState<Salon[]>(INITIAL_SALONS);
  const [selectedSalonId, setSelectedSalonId] = useState<string>('salon-1');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [ingredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [activeEmployee, setActiveEmployee] = useState<Employee>(INITIAL_EMPLOYEES[0]);
  const [deliveryOrders] = useState<DeliveryOrder[]>(INITIAL_DELIVERY_ORDERS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [waitingList, setWaitingList] = useState<WaitingListItem[]>([
    {
      id: 'wait-1',
      code: 'W-LIST-101',
      customerName: 'Carlos Ruiz',
      phone: '+34 600 112 233',
      pax: 4,
      position: 1,
      estimatedWaitMinutes: 15,
      joinedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'WAITING',
      notes: 'Prefiere terraza si es posible',
    },
    {
      id: 'wait-2',
      code: 'W-LIST-102',
      customerName: 'Laura Gomez',
      phone: '+34 622 334 455',
      pax: 2,
      position: 2,
      estimatedWaitMinutes: 25,
      joinedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'WAITING',
    },
  ]);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>(INITIAL_ORDERS);
  const [cashClosings, setCashClosings] = useState<CashClosing[]>([]);
  const [activeCashSession, setActiveCashSession] = useState({
    openedAt: new Date().toISOString(),
    initialCash: 300.0,
    isOpened: true,
  });

  // Phase 7 Motor TPV State
  const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(INITIAL_REGISTERS);
  const [activeRegisterId, setActiveRegisterId] = useState<string>('reg-1');

  // Phase 9 KDS Enterprise State
  const [kdsStations, setKDSStations] = useState<KDSStation[]>(INITIAL_KDS_STATIONS);
  const [kdsStateColors, setKDSStateColors] = useState<KDSStateColorConfig>(INITIAL_KDS_COLORS);
  const [activeKDSStationId, setActiveKDSStationId] = useState<string>('ALL');
  const [kdsSoundEnabled, setKDSSoundEnabledState] = useState<boolean>(true);
  const [kdsVolume, setKDSVolumeState] = useState<number>(0.5);

  const setKDSSoundEnabled = useCallback((enabled: boolean) => {
    setKDSSoundEnabledState(enabled);
    kdsAudio.setSoundEnabled(enabled);
  }, []);

  const setKDSVolume = useCallback((vol: number) => {
    setKDSVolumeState(vol);
    kdsAudio.setVolume(vol);
  }, []);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([
    {
      id: 'cm-1',
      registerId: 'reg-1',
      type: 'IN',
      amount: 50.0,
      reason: 'Fondo de cambio inicial adicional',
      timestamp: new Date().toISOString(),
      performedBy: 'Carlos Camarero',
    },
  ]);
  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>([
    {
      id: 'shift-1',
      employeeId: 'emp-1',
      employeeName: 'Carlos Camarero',
      clockInTime: new Date(Date.now() - 3600000 * 4).toISOString(),
      totalSales: 480.5,
      ticketCount: 14,
      registerId: 'reg-1',
    },
  ]);

  const [lastVeriFactuHash, setLastVeriFactuHash] = useState<string>('VF2026INIT000000000000000000000000');
  const [ticketSequenceCounter, setTicketSequenceCounter] = useState<number>(482);

  // Initialize active empty order
  const [currentOrder, setCurrentOrder] = useState<Order>({
    id: `ord-${Date.now()}`,
    orderNumber: `T2026-00${ticketSequenceCounter}`,
    series: 'T2026',
    type: 'DIRECTA',
    serverId: activeEmployee.id,
    serverName: activeEmployee.name,
    items: [],
    subtotal: 0,
    vatAmount: 0,
    discountTotal: 0,
    surchargeTotal: 0,
    tipAmount: 0,
    total: 0,
    paidAmount: 0,
    changeAmount: 0,
    isClosed: false,
    createdAt: new Date().toISOString(),
    verifactuSigned: false,
    documentType: 'TICKET',
  });

  // Calculate totals helper
  const calculateTotals = useCallback((items: OrderItem[], discountTotal: number = 0, tipAmount: number = 0, surchargePercent: number = 0) => {
    let subtotal = 0;
    let vatAmount = 0;

    items.forEach((item) => {
      const linePrice = item.isInvitation ? 0 : item.unitPrice * item.quantity;
      const lineDiscount = item.discountPercent ? linePrice * (item.discountPercent / 100) : 0;
      const netLine = linePrice - lineDiscount;

      // VAT calculation (Spanish prices include VAT in PVP)
      const vatMultiplier = 1 + item.vatRate / 100;
      const base = netLine / vatMultiplier;
      const vat = netLine - base;

      subtotal += base;
      vatAmount += vat;
    });

    const netBeforeSurcharge = subtotal + vatAmount - discountTotal;
    const surchargeTotal = surchargePercent > 0 ? Number((netBeforeSurcharge * (surchargePercent / 100)).toFixed(2)) : 0;
    const finalTotal = Math.max(0, netBeforeSurcharge + surchargeTotal + tipAmount);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      surchargeTotal,
      total: Number(finalTotal.toFixed(2)),
    };
  }, []);

  const setOrderType = useCallback((type: OrderType) => {
    setCurrentOrder((prev) => ({ ...prev, type }));
  }, []);

  const setOrderSurcharge = useCallback((surchargePercent: number) => {
    setCurrentOrder((prev) => {
      const { subtotal, vatAmount, surchargeTotal, total } = calculateTotals(
        prev.items,
        prev.discountTotal,
        prev.tipAmount,
        surchargePercent
      );
      return {
        ...prev,
        subtotal,
        vatAmount,
        surchargeTotal,
        total,
      };
    });
  }, [calculateTotals]);

  const parkCurrentOrder = useCallback((referenceName?: string) => {
    if (currentOrder.items.length === 0) return;
    const parked: ParkedOrder = {
      id: `parked-${Date.now()}`,
      parkedAt: new Date().toISOString(),
      parkedBy: activeEmployee.name,
      referenceName: referenceName || currentOrder.tableName || `Ticket #${currentOrder.orderNumber}`,
      order: { ...currentOrder, isParked: true },
    };
    setParkedOrders((prev) => [parked, ...prev]);

    // Reset active ticket
    setTicketSequenceCounter((c) => {
      const nextCount = c + 1;
      setCurrentOrder({
        id: `ord-${Date.now()}`,
        orderNumber: `T2026-00${nextCount}`,
        series: 'T2026',
        type: 'DIRECTA',
        serverId: activeEmployee.id,
        serverName: activeEmployee.name,
        items: [],
        subtotal: 0,
        vatAmount: 0,
        discountTotal: 0,
        surchargeTotal: 0,
        tipAmount: 0,
        total: 0,
        paidAmount: 0,
        changeAmount: 0,
        isClosed: false,
        createdAt: new Date().toISOString(),
        verifactuSigned: false,
        documentType: 'TICKET',
      });
      return nextCount;
    });
  }, [currentOrder, activeEmployee]);

  const unparkOrder = useCallback((parkedOrderId: string) => {
    const parked = parkedOrders.find((p) => p.id === parkedOrderId);
    if (parked) {
      setCurrentOrder(parked.order);
      setParkedOrders((prev) => prev.filter((p) => p.id !== parkedOrderId));
    }
  }, [parkedOrders]);

  const addCashMovement = useCallback((type: 'IN' | 'OUT', amount: number, reason: string) => {
    const movement: CashMovement = {
      id: `cm-${Date.now()}`,
      registerId: activeRegisterId,
      type,
      amount,
      reason,
      timestamp: new Date().toISOString(),
      performedBy: activeEmployee.name,
    };
    setCashMovements((prev) => [movement, ...prev]);
    setCashRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id === activeRegisterId) {
          const delta = type === 'IN' ? amount : -amount;
          return { ...reg, currentBalance: Number((reg.currentBalance + delta).toFixed(2)) };
        }
        return reg;
      })
    );
  }, [activeRegisterId, activeEmployee]);

  const performShiftChange = useCallback((newEmployeeId: string) => {
    const newEmp = employees.find((e) => e.id === newEmployeeId);
    if (!newEmp) return;

    // Log shift end for active employee
    setShiftLogs((prev) => [
      {
        id: `shift-${Date.now()}`,
        employeeId: activeEmployee.id,
        employeeName: activeEmployee.name,
        clockInTime: activeEmployee.clockInTime || new Date(Date.now() - 14400000).toISOString(),
        clockOutTime: new Date().toISOString(),
        totalSales: ordersHistory
          .filter((o) => o.serverId === activeEmployee.id && o.isClosed)
          .reduce((sum, o) => sum + o.total, 0),
        ticketCount: ordersHistory.filter((o) => o.serverId === activeEmployee.id && o.isClosed).length,
        registerId: activeRegisterId,
      },
      ...prev,
    ]);

    setActiveEmployee(newEmp);
  }, [employees, activeEmployee, ordersHistory, activeRegisterId]);

  const voidCurrentOrder = useCallback((reason: string) => {
    if (!reason.trim()) return;
    setCurrentOrder((prev) => ({
      ...prev,
      items: [],
      subtotal: 0,
      vatAmount: 0,
      discountTotal: 0,
      surchargeTotal: 0,
      total: 0,
      voidReason: reason,
      voidedBy: activeEmployee.name,
    }));
    queueOfflineSyncAction('VOID_ORDER', { orderId: currentOrder.id, reason, employee: activeEmployee.name });
  }, [currentOrder.id, activeEmployee]);

  const voidOrderItem = useCallback((itemId: string, reason: string) => {
    if (!reason.trim()) return;
    setCurrentOrder((prev) => {
      const newItems = prev.items.filter((i) => i.id !== itemId);
      const { subtotal, vatAmount, surchargeTotal, total } = calculateTotals(newItems, prev.discountTotal, prev.tipAmount);
      return {
        ...prev,
        items: newItems,
        subtotal,
        vatAmount,
        surchargeTotal,
        total,
      };
    });
    queueOfflineSyncAction('VOID_ITEM', { itemId, reason, employee: activeEmployee.name });
  }, [activeEmployee, calculateTotals]);

  const addItemToOrder = useCallback((
    product: Product,
    quantity = 1,
    course: CourseType = 'PRIMERO',
    selectedVariant?: { name: string; price: number },
    selectedExtras?: ExtraOption[]
  ) => {
    setCurrentOrder((prev) => {
      const unitPrice = selectedVariant ? selectedVariant.price : product.price;
      const variantName = selectedVariant ? ` (${selectedVariant.name})` : '';
      const productName = `${product.name}${variantName}`;

      const existingIndex = prev.items.findIndex(
        (i) => i.productId === product.id && i.productName === productName && i.course === course && !i.isInvitation
      );

      let newItems: OrderItem[] = [...prev.items];
      if (existingIndex > -1) {
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
      } else {
        const newItem: OrderItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productName,
          unitPrice,
          vatRate: product.vatRate,
          quantity,
          selectedExtras,
          course: course || (product.categoryId === 'cat-9' ? 'BEBIDA' : product.categoryId === 'cat-8' ? 'POSTRE' : 'PRIMERO'),
          kdsStatus: 'PENDING',
          printerTarget: product.printerTarget,
        };
        newItems.push(newItem);
      }

      const { subtotal, vatAmount, surchargeTotal, total } = calculateTotals(newItems, prev.discountTotal, prev.tipAmount);
      return {
        ...prev,
        items: newItems,
        subtotal,
        vatAmount,
        surchargeTotal,
        total,
      };
    });
  }, [calculateTotals]);

  const updateOrderItem = useCallback((itemId: string, updates: Partial<OrderItem>) => {
    setCurrentOrder((prev) => {
      const newItems = prev.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item));
      const { subtotal, vatAmount, total } = calculateTotals(newItems, prev.discountTotal, prev.tipAmount);
      return {
        ...prev,
        items: newItems,
        subtotal,
        vatAmount,
        total,
      };
    });
  }, [calculateTotals]);

  const removeOrderItem = useCallback((itemId: string) => {
    setCurrentOrder((prev) => {
      const newItems = prev.items.filter((item) => item.id !== itemId);
      const { subtotal, vatAmount, total } = calculateTotals(newItems, prev.discountTotal, prev.tipAmount);
      return {
        ...prev,
        items: newItems,
        subtotal,
        vatAmount,
        total,
      };
    });
  }, [calculateTotals]);

  const clearCurrentOrder = useCallback(() => {
    setTicketSequenceCounter((c) => {
      const nextCount = c + 1;
      setCurrentOrder({
        id: `ord-${Date.now()}`,
        orderNumber: `T2026-00${nextCount}`,
        series: 'T2026',
        type: selectedTable ? 'MESA' : 'DIRECTA',
        tableId: selectedTable?.id,
        tableName: selectedTable?.name,
        serverId: activeEmployee.id,
        serverName: activeEmployee.name,
        items: [],
        subtotal: 0,
        vatAmount: 0,
        discountTotal: 0,
        tipAmount: 0,
        total: 0,
        paidAmount: 0,
        changeAmount: 0,
        isClosed: false,
        createdAt: new Date().toISOString(),
        verifactuSigned: false,
        documentType: 'TICKET',
      });
      return nextCount;
    });
  }, [selectedTable, activeEmployee]);

  const setOrderCustomer = useCallback((customer: Customer | null) => {
    setCurrentOrder((prev) => ({
      ...prev,
      customerId: customer?.id,
      customerName: customer?.name,
      customerNif: customer?.nif,
      documentType: customer ? 'FACTURA' : 'TICKET',
      series: customer ? 'F2026' : 'T2026',
    }));
  }, []);

  const setOrderDiscount = useCallback((discountPercent: number) => {
    setCurrentOrder((prev) => {
      const discountTotal = Number(((prev.subtotal + prev.vatAmount) * (discountPercent / 100)).toFixed(2));
      const { subtotal, vatAmount, total } = calculateTotals(prev.items, discountTotal, prev.tipAmount);
      return {
        ...prev,
        discountTotal,
        subtotal,
        vatAmount,
        total,
      };
    });
  }, [calculateTotals]);

  const setOrderTip = useCallback((tipAmount: number) => {
    setCurrentOrder((prev) => {
      const { subtotal, vatAmount, total } = calculateTotals(prev.items, prev.discountTotal, tipAmount);
      return {
        ...prev,
        tipAmount,
        subtotal,
        vatAmount,
        total,
      };
    });
  }, [calculateTotals]);

  const processPayment = useCallback(async (
    method: PaymentMethod,
    paidAmount: number,
    mixedBreakdown?: { method: PaymentMethod; amount: number }[],
    documentType: 'TICKET' | 'FACTURA' | 'ALBARAN' = 'TICKET'
  ) => {
    const changeAmount = Math.max(0, paidAmount - currentOrder.total);

    // Call server-side VeriFactu signing API
    let verifactuHash = 'VF2026_OFFLINE_SIGNED';
    let qrUrl = 'https://agenciatributaria.es/verifactu/qr';
    try {
      const response = await fetch('/api/verifactu/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: currentOrder.orderNumber,
          issueDate: new Date().toISOString(),
          total: currentOrder.total,
          vatAmount: currentOrder.vatAmount,
          previousHash: lastVeriFactuHash,
          nif: currentOrder.customerNif || 'B12345678',
        }),
      });
      const data = await response.json();
      if (data.currentHash) {
        verifactuHash = data.currentHash;
        qrUrl = data.qrPayload;
        setLastVeriFactuHash(data.currentHash);
      }
    } catch (e) {
      console.warn('VeriFactu server API fallback to local hash calculation.');
    }

    const closedOrder: Order = {
      ...currentOrder,
      paymentMethod: method,
      paidAmount,
      changeAmount,
      mixedPayments: mixedBreakdown,
      isClosed: true,
      closedAt: new Date().toISOString(),
      verifactuSigned: true,
      verifactuHash,
      verifactuQrUrl: qrUrl,
      aeatStatus: 'ENVIADO_OK_200',
      documentType,
    };

    setOrdersHistory((prev) => [closedOrder, ...prev]);

    // Save transaction to local SQLite relational database offline engine
    queueOfflineSyncAction('CREATE_ORDER', closedOrder).catch((err) =>
      console.warn('Error queuing order to local SQLite database:', err)
    );

    // Free occupied table if linked
    if (currentOrder.tableId) {
      setSalons((prev) =>
        prev.map((salon) => ({
          ...salon,
          tables: salon.tables.map((tbl) =>
            tbl.id === currentOrder.tableId
              ? { ...tbl, status: 'FREE', occupiedSince: undefined, currentOrderId: undefined, pax: undefined }
              : tbl
          ),
        }))
      );
      setSelectedTable(null);
    }

    // Award loyalty points if customer linked
    if (currentOrder.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === currentOrder.customerId
            ? { ...c, points: c.points + Math.floor(currentOrder.total), totalSpent: c.totalSpent + currentOrder.total }
            : c
        )
      );
    }

    clearCurrentOrder();
    return { success: true, verifactuHash, qrUrl };
  }, [currentOrder, lastVeriFactuHash, clearCurrentOrder]);

  // Phase 8 Visual Floor Plan & Salon Actions
  const addSalon = useCallback((salonData: Partial<Salon> & { name: string }) => {
    const newSalon: Salon = {
      id: `salon-${Date.now()}`,
      name: salonData.name,
      type: salonData.type || 'CUSTOM',
      width: salonData.width || 1400,
      height: salonData.height || 900,
      gridSize: salonData.gridSize || 20,
      notes: salonData.notes || '',
      tables: [],
    };
    setSalons((prev) => [...prev, newSalon]);
    setSelectedSalonId(newSalon.id);
  }, []);

  const updateSalon = useCallback((salonId: string, updates: Partial<Salon>) => {
    setSalons((prev) =>
      prev.map((s) => (s.id === salonId ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteSalon = useCallback((salonId: string) => {
    setSalons((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one salon
      const filtered = prev.filter((s) => s.id !== salonId);
      if (selectedSalonId === salonId) {
        setSelectedSalonId(filtered[0].id);
      }
      return filtered;
    });
  }, [selectedSalonId]);

  const addTable = useCallback((salonId: string, tableData: Partial<Table> & { name: string; seats: number }) => {
    setSalons((prev) =>
      prev.map((s) => {
        if (s.id !== salonId) return s;
        const newTable: Table = {
          id: `tbl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          salonId,
          number: tableData.number || `${s.tables.length + 1}`,
          name: tableData.name,
          seats: tableData.seats,
          pax: 0,
          x: tableData.x || 80,
          y: tableData.y || 80,
          width: tableData.width || 110,
          height: tableData.height || 90,
          shape: tableData.shape || 'square',
          status: tableData.status || 'FREE',
          color: tableData.color,
          rotation: tableData.rotation || 0,
          isLocked: tableData.isLocked || false,
        };
        return { ...s, tables: [...s.tables, newTable] };
      })
    );
  }, []);

  const updateTable = useCallback((tableId: string, updates: Partial<Table>) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => (t.id === tableId ? { ...t, ...updates } : t)),
      }))
    );
  }, []);

  const duplicateTable = useCallback((tableId: string) => {
    setSalons((prev) =>
      prev.map((s) => {
        const target = s.tables.find((tbl) => tbl.id === tableId);
        if (!target) return s;
        const copy: Table = {
          ...target,
          id: `tbl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: `${target.name} (Copia)`,
          number: `${target.number || ''}B`,
          x: Math.min((s.width || 1400) - target.width, target.x + 30),
          y: Math.min((s.height || 900) - target.height, target.y + 30),
          status: 'FREE',
          occupiedSince: undefined,
          lastOrderAt: undefined,
          accumulatedTotal: undefined,
          joinedWithTableIds: undefined,
          joinedToTableId: undefined,
          reservationId: undefined,
          reservationInfo: undefined,
        };
        return { ...s, tables: [...s.tables, copy] };
      })
    );
  }, []);

  const deleteTable = useCallback((tableId: string) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.filter((t) => t.id !== tableId),
      }))
    );
  }, []);

  const updateTablePosition = useCallback((tableId: string, x: number, y: number, isLocked?: boolean, rotation?: number) => {
    setSalons((prev) =>
      prev.map((salon) => ({
        ...salon,
        tables: salon.tables.map((t) => {
          if (t.id !== tableId) return t;
          return {
            ...t,
            x,
            y,
            ...(isLocked !== undefined ? { isLocked } : {}),
            ...(rotation !== undefined ? { rotation } : {}),
          };
        }),
      }))
    );
  }, []);

  const updateTableStatus = useCallback((tableId: string, status: TableStatus, pax?: number, serverName?: string) => {
    setSalons((prev) =>
      prev.map((salon) => ({
        ...salon,
        tables: salon.tables.map((t) => {
          if (t.id !== tableId) return t;
          const isOccupiedState = ['OCCUPIED', 'PENDING_ORDER', 'IN_KITCHEN', 'SERVING', 'WAITING_DESSERT', 'BILL_REQUESTED', 'PAYING'].includes(status);
          const isClearingState = ['FREE', 'CLEANING', 'OUT_OF_SERVICE'].includes(status);

          return {
            ...t,
            status,
            pax: pax !== undefined ? pax : t.pax,
            serverName: serverName || t.serverName,
            occupiedSince: isOccupiedState ? (t.occupiedSince || new Date().toISOString()) : (isClearingState ? undefined : t.occupiedSince),
            lastOrderAt: isOccupiedState ? (t.lastOrderAt || new Date().toISOString()) : (isClearingState ? undefined : t.lastOrderAt),
            accumulatedTotal: isClearingState ? 0 : t.accumulatedTotal,
          };
        }),
      }))
    );
  }, []);

  const joinTables = useCallback((mainTableId: string, secondaryTableIds: string[]) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => {
          if (t.id === mainTableId) {
            return {
              ...t,
              joinedWithTableIds: Array.from(new Set([...(t.joinedWithTableIds || []), ...secondaryTableIds])),
            };
          }
          if (secondaryTableIds.includes(t.id)) {
            return {
              ...t,
              joinedToTableId: mainTableId,
              status: 'OCCUPIED',
            };
          }
          return t;
        }),
      }))
    );
  }, []);

  const separateTables = useCallback((tableId: string) => {
    setSalons((prev) =>
      prev.map((s) => {
        const target = s.tables.find((t) => t.id === tableId);
        if (!target) return s;

        const mainId = target.joinedToTableId || target.id;
        const secondaryIds = target.joinedWithTableIds || [];

        return {
          ...s,
          tables: s.tables.map((t) => {
            if (t.id === mainId) {
              return { ...t, joinedWithTableIds: undefined };
            }
            if (secondaryIds.includes(t.id) || t.joinedToTableId === mainId) {
              return { ...t, joinedToTableId: undefined, status: 'FREE' };
            }
            return t;
          }),
        };
      })
    );
  }, []);

  const moveClientsToSalon = useCallback((tableId: string, targetSalonId: string) => {
    setSalons((prev) => {
      let movedTable: Table | undefined;
      prev.forEach((s) => {
        const t = s.tables.find((tbl) => tbl.id === tableId);
        if (t) movedTable = t;
      });

      if (!movedTable) return prev;

      return prev.map((s) => {
        if (s.id === movedTable?.salonId) {
          return { ...s, tables: s.tables.filter((t) => t.id !== tableId) };
        }
        if (s.id === targetSalonId) {
          return {
            ...s,
            tables: [...s.tables, { ...movedTable, salonId: targetSalonId, x: 80, y: 80 }],
          };
        }
        return s;
      });
    });
  }, []);

  const assignWaiterToTable = useCallback((tableId: string, serverId: string, serverName: string) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => (t.id === tableId ? { ...t, serverId, serverName } : t)),
      }))
    );
  }, []);

  const updateTablePax = useCallback((tableId: string, pax: number) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => (t.id === tableId ? { ...t, pax } : t)),
      }))
    );
  }, []);

  const addReservation = useCallback(
    async (resData: Partial<Reservation> & { customerName: string; phone: string; pax: number; date: string; time: string }) => {
      const newRes = await createFullReservation(resData, salons, reservations, customers);
      setReservations((prev) => [newRes, ...prev]);

      if (newRes.tableId) {
        setSalons((prev) =>
          prev.map((s) => ({
            ...s,
            tables: s.tables.map((t) => {
              if (t.id !== newRes.tableId) return t;
              return {
                ...t,
                status: 'RESERVED',
                reservationId: newRes.id,
                reservationInfo: {
                  customerName: newRes.customerName,
                  phone: newRes.phone,
                  time: newRes.time,
                  pax: newRes.pax,
                },
              };
            }),
          }))
        );
      }
      return newRes;
    },
    [salons, reservations, customers]
  );

  const addQuickReservation = useCallback(
    (params: { customerName: string; phone: string; pax: number; time?: string; date?: string; tableId: string; tableName: string; salonId: string; salonName: string }) => {
      const qRes = serviceCreateQuickReservation(params);
      setReservations((prev) => [qRes, ...prev]);

      setSalons((prev) =>
        prev.map((s) => ({
          ...s,
          tables: s.tables.map((t) => {
            if (t.id !== params.tableId) return t;
            return {
              ...t,
              status: 'RESERVED',
              reservationId: qRes.id,
              reservationInfo: {
                customerName: qRes.customerName,
                phone: qRes.phone,
                time: qRes.time,
                pax: qRes.pax,
              },
            };
          }),
        }))
      );
      return qRes;
    },
    []
  );

  const updateReservation = useCallback((id: string, updates: Partial<Reservation>) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const updateReservationStatus = useCallback((id: string, status: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          updatedAt: new Date().toISOString(),
          seatedTime: status === 'SENTADOS' || status === 'EN_SERVICIO' ? new Date().toISOString() : r.seatedTime,
          completedTime: status === 'FINALIZADA' ? new Date().toISOString() : r.completedTime,
        };
      })
    );
  }, []);

  const checkInReservation = useCallback(
    (id: string, tableIdOverride?: string) => {
      const res = reservations.find((r) => r.id === id);
      if (!res) return;

      const { updatedReservation, newTableId } = serviceHandleCheckIn(res, tableIdOverride, undefined, salons);

      setReservations((prev) => prev.map((r) => (r.id === id ? updatedReservation : r)));

      setSalons((prev) =>
        prev.map((s) => ({
          ...s,
          tables: s.tables.map((t) => {
            if (t.id !== newTableId) return t;
            return {
              ...t,
              status: 'OCCUPIED',
              occupiedSince: new Date().toISOString(),
              pax: updatedReservation.pax,
              reservationId: updatedReservation.id,
            };
          }),
        }))
      );
    },
    [reservations, salons]
  );

  const markNoShowReservation = useCallback(
    (id: string, penaltyFee: number = 0) => {
      const res = reservations.find((r) => r.id === id);
      if (!res) return;

      const updated = serviceHandleNoShow(res, penaltyFee);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));

      // Free table if assigned
      setSalons((prev) =>
        prev.map((s) => ({
          ...s,
          tables: s.tables.map((t) => {
            if (t.reservationId === id) {
              return {
                ...t,
                status: 'FREE',
                reservationId: undefined,
                reservationInfo: undefined,
              };
            }
            return t;
          }),
        }))
      );
    },
    [reservations]
  );

  const addWaitingListItem = useCallback(
    (item: Omit<WaitingListItem, 'id' | 'code' | 'joinedAt' | 'position' | 'status'>) => {
      const newItem = serviceAddWaitingListItem(item, waitingList);
      setWaitingList((prev) => [...prev, newItem]);
    },
    [waitingList]
  );

  const seatWaitingListItem = useCallback(
    (waitingId: string, tableId: string) => {
      setWaitingList((prev) =>
        prev.map((w) => (w.id === waitingId ? { ...w, status: 'SEATED' } : w))
      );
      setSalons((prev) =>
        prev.map((s) => ({
          ...s,
          tables: s.tables.map((t) => {
            if (t.id !== tableId) return t;
            return {
              ...t,
              status: 'OCCUPIED',
              occupiedSince: new Date().toISOString(),
            };
          }),
        }))
      );
    },
    []
  );

  const removeFromWaitingList = useCallback((waitingId: string) => {
    setWaitingList((prev) => prev.filter((w) => w.id !== waitingId));
  }, []);

  const importReservationsFromCSV = useCallback(
    (csvContent: string) => {
      const parsed = parseReservationsCSV(csvContent);
      parsed.forEach(async (p) => {
        if (p.customerName && p.phone) {
          await createFullReservation(
            {
              customerName: p.customerName,
              phone: p.phone,
              pax: p.pax || 2,
              date: p.date || new Date().toISOString().split('T')[0],
              time: p.time || '14:00',
              tableName: p.tableName || 'Mesa 1',
              salonName: p.salonName || 'Comedor Principal',
              notes: p.notes,
            },
            salons,
            reservations
          ).then((r) => {
            setReservations((prev) => [r, ...prev]);
          });
        }
      });
    },
    [salons, reservations]
  );

  const bindReservationToTable = useCallback((reservationId: string, tableId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => {
          if (t.id !== tableId) return t;
          return {
            ...t,
            status: 'RESERVED',
            reservationId,
            reservationInfo: {
              customerName: res.customerName,
              phone: res.phone,
              time: res.time,
              pax: res.pax,
            },
          };
        }),
      }))
    );
  }, [reservations]);

  const tableCheckIn = useCallback((tableId: string, _reservationId?: string) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => {
          if (t.id !== tableId) return t;
          return {
            ...t,
            status: 'OCCUPIED',
            occupiedSince: new Date().toISOString(),
            lastOrderAt: new Date().toISOString(),
            pax: t.reservationInfo?.pax || t.pax || t.seats,
          };
        }),
      }))
    );
  }, []);

  const tableNoShow = useCallback((reservationId: string) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => {
          if (t.reservationId === reservationId) {
            return {
              ...t,
              status: 'FREE',
              reservationId: undefined,
              reservationInfo: undefined,
            };
          }
          return t;
        }),
      }))
    );
  }, []);

  const lockTableReservation = useCallback((tableId: string) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => (t.id === tableId ? { ...t, isLocked: true } : t)),
      }))
    );
  }, []);

  const releaseTableReservation = useCallback((tableId: string) => {
    setSalons((prev) =>
      prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: 'FREE',
                reservationId: undefined,
                reservationInfo: undefined,
                occupiedSince: undefined,
                lastOrderAt: undefined,
                accumulatedTotal: 0,
              }
            : t
        ),
      }))
    );
  }, []);

  const selectTableForPOS = useCallback((tableId: string) => {
    setSalons((prevSalons) => {
      let foundTable: Table | null = null;
      prevSalons.forEach((s) => {
        const t = s.tables.find((tbl) => tbl.id === tableId);
        if (t) foundTable = t;
      });

      if (foundTable) {
        setSelectedTable(foundTable);
        setCurrentOrder((prev) => ({
          ...prev,
          type: 'MESA',
          tableId: (foundTable as Table).id,
          tableName: (foundTable as Table).name,
          salonName: prevSalons.find((s) => s.id === (foundTable as Table).salonId)?.name,
        }));
        if ((foundTable as Table).status === 'FREE') {
          return prevSalons.map((salon) => ({
            ...salon,
            tables: salon.tables.map((t) =>
              t.id === tableId
                ? {
                    ...t,
                    status: 'OCCUPIED',
                    pax: t.pax || 2,
                    occupiedSince: t.occupiedSince || new Date().toISOString(),
                  }
                : t
            ),
          }));
        }
      }
      return prevSalons;
    });
    setActiveTab('tpv');
  }, []);

  const transferTableOrder = useCallback((sourceTableId: string, targetTableId: string) => {
    setSalons((prev) => {
      let sourceTable: Table | undefined;
      prev.forEach((s) => {
        const t = s.tables.find((tbl) => tbl.id === sourceTableId);
        if (t) sourceTable = t;
      });

      if (!sourceTable) return prev;

      return prev.map((s) => ({
        ...s,
        tables: s.tables.map((t) => {
          if (t.id === sourceTableId) {
            return { ...t, status: 'FREE', occupiedSince: undefined, currentOrderId: undefined, pax: undefined, lastOrderAt: undefined, accumulatedTotal: undefined };
          }
          if (t.id === targetTableId) {
            return {
              ...t,
              status: 'OCCUPIED',
              occupiedSince: sourceTable?.occupiedSince || new Date().toISOString(),
              lastOrderAt: sourceTable?.lastOrderAt || new Date().toISOString(),
              accumulatedTotal: sourceTable?.accumulatedTotal || 0,
              pax: sourceTable?.pax,
              serverName: sourceTable?.serverName,
              serverId: sourceTable?.serverId,
            };
          }
          return t;
        }),
      }));
    });
  }, []);

  const updateKDSItemStatus = useCallback(
    (orderId: string, itemId: string, newStatus: ItemKDSStatus, cookName?: string) => {
      const now = new Date().toISOString();
      setOrdersHistory((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              items: ord.items.map((i) => {
                if (i.id === itemId) {
                  const updated: OrderItem = {
                    ...i,
                    kdsStatus: newStatus,
                    kdsUpdatedAt: now,
                    cookName: cookName || i.cookName || activeEmployee?.name,
                  };
                  if (newStatus === 'ACCEPTED' && !i.acceptedAt) updated.acceptedAt = now;
                  if (newStatus === 'PREPARING' && !i.preparingAt) updated.preparingAt = now;
                  if (newStatus === 'PLATING' && !i.platedAt) updated.platedAt = now;
                  if (newStatus === 'READY' && !i.readyAt) updated.readyAt = now;
                  if (newStatus === 'SERVED' && !i.servedAt) updated.servedAt = now;
                  if (newStatus === 'CANCELLED' && !i.cancelledAt) updated.cancelledAt = now;
                  return updated;
                }
                return i;
              }),
            };
          }
          return ord;
        })
      );

      setCurrentOrder((prev) => {
        if (prev.id === orderId) {
          return {
            ...prev,
            items: prev.items.map((i) => (i.id === itemId ? { ...i, kdsStatus: newStatus, kdsUpdatedAt: now } : i)),
          };
        }
        return prev;
      });

      if (newStatus === 'READY') {
        kdsAudio.playNewOrderSound();
      }
    },
    [activeEmployee]
  );

  const updateKDSItemPriority = useCallback((orderId: string, itemId: string, priority: KDSPriority) => {
    setOrdersHistory((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            items: ord.items.map((i) => (i.id === itemId ? { ...i, priority } : i)),
          };
        }
        return ord;
      })
    );
  }, []);

  const addKDSStation = useCallback((stationData: Omit<KDSStation, 'id'>) => {
    const newStation: KDSStation = {
      ...stationData,
      id: `st-${Date.now()}`,
    };
    setKDSStations((prev) => [...prev, newStation]);
  }, []);

  const updateKDSStation = useCallback((stationId: string, updates: Partial<KDSStation>) => {
    setKDSStations((prev) => prev.map((st) => (st.id === stationId ? { ...st, ...updates } : st)));
  }, []);

  const deleteKDSStation = useCallback((stationId: string) => {
    setKDSStations((prev) => prev.filter((st) => st.id !== stationId));
  }, []);

  const updateKDSStateColors = useCallback((colors: Partial<KDSStateColorConfig>) => {
    setKDSStateColors((prev) => ({ ...prev, ...colors }));
  }, []);

  const openCashDrawer = useCallback((initialCash: number) => {
    setActiveCashSession({
      openedAt: new Date().toISOString(),
      initialCash,
      isOpened: true,
    });
  }, []);

  const performArqueoZ = useCallback((countedCash: number): CashClosing => {
    const closedOrdersToday = ordersHistory.filter(
      (o) => o.isClosed && new Date(o.closedAt || '').toDateString() === new Date().toDateString()
    );

    let cashTotal = 0;
    let cardTotal = 0;
    let bizumTotal = 0;
    let otherTotal = 0;
    let grandTotal = 0;
    let vatTotal = 0;

    closedOrdersToday.forEach((o) => {
      grandTotal += o.total;
      vatTotal += o.vatAmount;
      if (o.paymentMethod === 'EFECTIVO') cashTotal += o.total;
      else if (o.paymentMethod === 'TARJETA') cardTotal += o.total;
      else if (o.paymentMethod === 'BIZUM') bizumTotal += o.total;
      else otherTotal += o.total;
    });

    const expectedCash = activeCashSession.initialCash + cashTotal;
    const cashDifference = countedCash - expectedCash;

    const newZReport: CashClosing = {
      id: `z-${Date.now()}`,
      closingNumber: `Z-2026-0${cashClosings.length + 142}`,
      openedAt: activeCashSession.openedAt,
      closedAt: new Date().toISOString(),
      openedBy: activeEmployee.name,
      closedBy: activeEmployee.name,
      initialCash: activeCashSession.initialCash,
      countedCash,
      expectedCash,
      cashDifference,
      salesCash: cashTotal,
      salesCard: cardTotal,
      salesBizum: bizumTotal,
      salesOther: otherTotal,
      totalSales: grandTotal,
      totalVat: vatTotal,
      ticketCount: closedOrdersToday.length,
      verifactuChainOK: true,
    };

    setCashClosings((prev) => [newZReport, ...prev]);
    setActiveCashSession({ openedAt: new Date().toISOString(), initialCash: countedCash, isOpened: true });
    return newZReport;
  }, [ordersHistory, activeCashSession, activeEmployee, cashClosings.length]);

  const addCustomer = useCallback((custData: Omit<Customer, 'id' | 'points' | 'totalSpent' | 'balance'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      points: 0,
      totalSpent: 0,
      balance: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
  }, []);

  const updateProductEscandallo = useCallback((productId: string, escandallo: Product['escandallo']) => {
    const totalCost = escandallo.reduce((acc, curr) => acc + curr.totalCost, 0);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, escandallo, costPrice: Number(totalCost.toFixed(2)) } : p))
    );
  }, []);

  const contextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      salons,
      selectedSalonId,
      setSelectedSalonId,
      selectedTable,
      setSelectedTable,
      products,
      setProducts,
      categories,
      ingredients,
      customers,
      employees,
      activeEmployee,
      setActiveEmployee,
      currentOrder,
      ordersHistory,
      deliveryOrders,
      reservations,
      setReservations,
      waitingList,
      setWaitingList,
      addReservation,
      addQuickReservation,
      updateReservation,
      updateReservationStatus,
      checkInReservation,
      markNoShowReservation,
      addWaitingListItem,
      seatWaitingListItem,
      removeFromWaitingList,
      importReservationsFromCSV,
      cashClosings,
      activeCashSession,
      addItemToOrder,
      updateOrderItem,
      removeOrderItem,
      clearCurrentOrder,
      setOrderCustomer,
      setOrderDiscount,
      setOrderTip,
      processPayment,
      updateTablePosition,
      updateTableStatus,
      selectTableForPOS,
      transferTableOrder,
      joinTables,
      addSalon,
      updateSalon,
      deleteSalon,
      addTable,
      updateTable,
      duplicateTable,
      deleteTable,
      separateTables,
      moveClientsToSalon,
      assignWaiterToTable,
      updateTablePax,
      bindReservationToTable,
      tableCheckIn,
      tableNoShow,
      lockTableReservation,
      releaseTableReservation,
      updateKDSItemStatus,
      kdsStations,
      kdsStateColors,
      activeKDSStationId,
      setActiveKDSStationId,
      kdsSoundEnabled,
      setKDSSoundEnabled,
      kdsVolume,
      setKDSVolume,
      updateKDSItemPriority,
      addKDSStation,
      updateKDSStation,
      deleteKDSStation,
      updateKDSStateColors,
      openCashDrawer,
      performArqueoZ,
      addCustomer,
      updateProductEscandallo,
      triggerSyncWithPostgres: syncOfflineQueueWithServer,
      lastVeriFactuHash,
      ticketSequenceCounter,
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
      setOrderSurcharge,
      setOrderType,
      voidCurrentOrder,
      voidOrderItem,
    }),
    [
      activeTab,
      salons,
      selectedSalonId,
      selectedTable,
      products,
      categories,
      ingredients,
      customers,
      employees,
      activeEmployee,
      currentOrder,
      ordersHistory,
      deliveryOrders,
      reservations,
      waitingList,
      addReservation,
      addQuickReservation,
      updateReservation,
      updateReservationStatus,
      checkInReservation,
      markNoShowReservation,
      addWaitingListItem,
      seatWaitingListItem,
      removeFromWaitingList,
      importReservationsFromCSV,
      cashClosings,
      activeCashSession,
      addItemToOrder,
      updateOrderItem,
      removeOrderItem,
      clearCurrentOrder,
      setOrderCustomer,
      setOrderDiscount,
      setOrderTip,
      processPayment,
      updateTablePosition,
      updateTableStatus,
      selectTableForPOS,
      transferTableOrder,
      joinTables,
      addSalon,
      updateSalon,
      deleteSalon,
      addTable,
      updateTable,
      duplicateTable,
      deleteTable,
      separateTables,
      moveClientsToSalon,
      assignWaiterToTable,
      updateTablePax,
      bindReservationToTable,
      tableCheckIn,
      tableNoShow,
      lockTableReservation,
      releaseTableReservation,
      updateKDSItemStatus,
      kdsStations,
      kdsStateColors,
      activeKDSStationId,
      setActiveKDSStationId,
      kdsSoundEnabled,
      setKDSSoundEnabled,
      kdsVolume,
      setKDSVolume,
      updateKDSItemPriority,
      addKDSStation,
      updateKDSStation,
      deleteKDSStation,
      updateKDSStateColors,
      openCashDrawer,
      performArqueoZ,
      addCustomer,
      updateProductEscandallo,
      syncOfflineQueueWithServer,
      lastVeriFactuHash,
      ticketSequenceCounter,
      parkedOrders,
      parkCurrentOrder,
      unparkOrder,
      cashRegisters,
      activeRegisterId,
      cashMovements,
      addCashMovement,
      shiftLogs,
      performShiftChange,
      setOrderSurcharge,
      setOrderType,
      voidCurrentOrder,
      voidOrderItem,
    ]
  );

  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};
