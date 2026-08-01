import React, { useState } from 'react';
import {
  Supplier,
  PurchaseOrder,
  SupplierDeliveryNote,
  SupplierInvoice,
  PaymentExpiration,
  PurchaseReturn,
  PurchaseRequest,
  AIPurchaseRecommendation,
} from '../types/purchases';
import { Article } from '../types/inventory';
import { INITIAL_ARTICLES } from '../data/inventoryData';
import {
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_DELIVERY_NOTES,
  INITIAL_SUPPLIER_INVOICES,
  INITIAL_PAYMENT_EXPIRATIONS,
  INITIAL_RETURNS,
  INITIAL_PURCHASE_REQUESTS,
} from '../data/purchasesData';
import { PurchasesService } from '../services/purchasesService';

import { SuppliersManager } from './purchases/SuppliersManager';
import { PurchaseOrdersManager } from './purchases/PurchaseOrdersManager';
import { OrderReceptionManager } from './purchases/OrderReceptionManager';
import { AlbaranesManager } from './purchases/AlbaranesManager';
import { SupplierInvoicesManager } from './purchases/SupplierInvoicesManager';
import { ReturnsManager } from './purchases/ReturnsManager';
import { PaymentExpirationsManager } from './purchases/PaymentExpirationsManager';
import { PriceComparatorManager } from './purchases/PriceComparatorManager';
import { PurchasesAnalyticsPanel } from './purchases/PurchasesAnalyticsPanel';
import { AIPurchasesAssistant } from './purchases/AIPurchasesAssistant';
import { PurchaseRequestsManager } from './purchases/PurchaseRequestsManager';
import { ThreeWayReconciliationPanel } from './purchases/ThreeWayReconciliationPanel';

import {
  Building2,
  ShoppingCart,
  PackageCheck,
  FileCheck,
  FileText,
  RotateCcw,
  Calendar,
  ArrowUpDown,
  BarChart3,
  Sparkles,
  Download,
  FileQuestion,
  GitCompare,
} from 'lucide-react';

export const PurchasesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'PROVEEDORES'
    | 'SOLICITUDES'
    | 'PEDIDOS'
    | 'RECEPCION'
    | 'ALBARANES'
    | 'FACTURAS'
    | 'CONCILIACION'
    | 'DEVOLUCIONES'
    | 'VENCIMIENTOS'
    | 'COMPARADOR'
    | 'ESTADISTICAS'
    | 'IA'
  >('PROVEEDORES');

  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [requests, setRequests] = useState<PurchaseRequest[]>(INITIAL_PURCHASE_REQUESTS);
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [deliveryNotes, setDeliveryNotes] = useState<SupplierDeliveryNote[]>(INITIAL_DELIVERY_NOTES);
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(INITIAL_SUPPLIER_INVOICES);
  const [expirations, setExpirations] = useState<PaymentExpiration[]>(INITIAL_PAYMENT_EXPIRATIONS);
  const [returns, setReturns] = useState<PurchaseReturn[]>(INITIAL_RETURNS);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);

  const [receptionOrder, setReceptionOrder] = useState<PurchaseOrder | null>(null);

  // Supplier CRUD
  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers([supplier, ...suppliers]);
  };

  const handleUpdateSupplier = (supplier: Supplier) => {
    setSuppliers(suppliers.map((s) => (s.id === supplier.id ? supplier : s)));
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== supplierId));
  };

  // Request CRUD & Conversion
  const handleAddRequest = (req: PurchaseRequest) => {
    setRequests([req, ...requests]);
  };

  const handleUpdateRequest = (req: PurchaseRequest) => {
    setRequests(requests.map((r) => (r.id === req.id ? req : r)));
  };

  const handleConvertRequestToOrder = (req: PurchaseRequest, supplier: Supplier) => {
    const newOrder = PurchasesService.convertRequestToOrder(req, supplier);
    setOrders([newOrder, ...orders]);
    setActiveTab('PEDIDOS');
  };

  // Order CRUD & Transitions
  const handleAddOrder = (order: PurchaseOrder) => {
    setOrders([order, ...orders]);
  };

  const handleUpdateOrder = (order: PurchaseOrder) => {
    setOrders(orders.map((o) => (o.id === order.id ? order : o)));
  };

  // Reception
  const handleOpenReception = (order: PurchaseOrder) => {
    setReceptionOrder(order);
    setActiveTab('RECEPCION');
  };

  const handleCompleteReception = (
    updatedOrder: PurchaseOrder,
    deliveryNote: SupplierDeliveryNote,
    updatedArticles: Article[]
  ) => {
    setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    setDeliveryNotes([deliveryNote, ...deliveryNotes]);
    setArticles(updatedArticles);
    setReceptionOrder(null);
    setActiveTab('ALBARANES');
  };

  // Albarán -> Invoice
  const handleConvertToInvoice = (selectedNotes: SupplierDeliveryNote[]) => {
    if (!selectedNotes.length) return;
    const sup = suppliers.find((s) => s.id === selectedNotes[0].supplierId) || suppliers[0];

    const { invoice, expiration } = PurchasesService.createSupplierInvoice(
      sup,
      `FACT-AGRUPADA-${Date.now().toString().slice(-4)}`,
      new Date().toISOString().substring(0, 10),
      new Date(Date.now() + 86400000 * 30).toISOString().substring(0, 10),
      selectedNotes,
      []
    );

    setInvoices([invoice, ...invoices]);
    setExpirations([expiration, ...expirations]);

    // Mark notes as facturados
    const updatedNotes = deliveryNotes.map((dn) =>
      selectedNotes.some((sn) => sn.id === dn.id)
        ? { ...dn, status: 'FACTURADO' as const, invoiceId: invoice.id }
        : dn
    );
    setDeliveryNotes(updatedNotes);
    setActiveTab('FACTURAS');
  };

  // Invoice creation
  const handleAddInvoice = (newInvoice: SupplierInvoice, expiration: PaymentExpiration) => {
    setInvoices([newInvoice, ...invoices]);
    setExpirations([expiration, ...expirations]);
  };

  // Returns
  const handleAddReturn = (newReturn: PurchaseReturn, updatedArticles: Article[]) => {
    setReturns([newReturn, ...returns]);
    setArticles(updatedArticles);
  };

  // Expiration Paid
  const handleMarkExpirationAsPaid = (expirationId: string) => {
    setExpirations(
      expirations.map((exp) =>
        exp.id === expirationId
          ? { ...exp, status: 'PAGADO', paymentDate: new Date().toISOString() }
          : exp
      )
    );
  };

  // AI 1-Click Order Generation
  const handleGenerateOrderFromAI = (rec: AIPurchaseRecommendation) => {
    const supplier = suppliers.find((s) => s.id === rec.recommendedSupplierId) || suppliers[0];
    const art = articles.find((a) => a.id === rec.articleId) || articles[0];

    const unitPrice = art.purchasePrice || 10;
    const subtotal = unitPrice * rec.suggestedQuantity;
    const vatTotal = subtotal * (art.vatRate / 100);

    const newOrder: PurchaseOrder = {
      id: `ord-ai-${Date.now()}`,
      orderNumber: `PED-AI-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: supplier.id,
      supplierName: supplier.tradeName || supplier.socialName,
      warehouseId: 'wh-001',
      warehouseName: 'Almacén Principal Economato',
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10),
      status: 'BORRADOR',
      lines: [
        {
          id: `pol-ai-${Date.now()}`,
          articleId: art.id,
          articleName: art.name,
          unit: art.unit,
          orderedQuantity: rec.suggestedQuantity,
          receivedQuantity: 0,
          returnedQuantity: 0,
          unitPrice,
          vatRate: art.vatRate,
          discountPercent: 0,
          subtotal: Number(subtotal.toFixed(2)),
          total: Number((subtotal + vatTotal).toFixed(2)),
        },
      ],
      taxBase: Number(subtotal.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      grandTotal: Number((subtotal + vatTotal).toFixed(2)),
      notes: `Sugerido por Asistente IA de Reposición. ${rec.reason}`,
      createdBy: 'IA Hostelería AutoReplenish',
    };

    setOrders([newOrder, ...orders]);
    setActiveTab('PEDIDOS');
  };

  // Computations
  const priceComparisons = PurchasesService.getPriceComparisons(articles, orders, suppliers);
  const aiRecommendations = PurchasesService.getAIPurchaseRecommendations(articles, suppliers);
  const analyticsData = PurchasesService.computeAnalytics(orders, suppliers);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Gestión de Compras & Proveedores Enterprise</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  FASE 19
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Módulo completo de Compras, Solicitudes, Pedidos, Albaranes, Facturación, Conciliación 3-Way e IA Gemini
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const csvContent = PurchasesService.exportToCSV('PROVEEDORES', suppliers);
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `proveedores_${new Date().toISOString().substring(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main Subtabs Header */}
      <div className="flex space-x-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        {(
          [
            { id: 'PROVEEDORES', label: 'Proveedores', icon: <Building2 className="w-4 h-4" /> },
            { id: 'SOLICITUDES', label: 'Solicitudes', icon: <FileQuestion className="w-4 h-4" />, badge: requests.length },
            { id: 'PEDIDOS', label: 'Pedidos', icon: <ShoppingCart className="w-4 h-4 text-amber-400" />, badge: orders.length },
            { id: 'RECEPCION', label: 'Recepción', icon: <PackageCheck className="w-4 h-4" /> },
            { id: 'ALBARANES', label: 'Albaranes', icon: <FileCheck className="w-4 h-4" /> },
            { id: 'FACTURAS', label: 'Facturas', icon: <FileText className="w-4 h-4" /> },
            { id: 'CONCILIACION', label: 'Conciliación 3-Way', icon: <GitCompare className="w-4 h-4 text-emerald-400" /> },
            { id: 'DEVOLUCIONES', label: 'Devoluciones', icon: <RotateCcw className="w-4 h-4" /> },
            { id: 'VENCIMIENTOS', label: 'Vencimientos', icon: <Calendar className="w-4 h-4" /> },
            { id: 'COMPARADOR', label: 'Comparador', icon: <ArrowUpDown className="w-4 h-4" /> },
            { id: 'ESTADISTICAS', label: 'Estadísticas', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'IA', label: 'Asistente IA', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: aiRecommendations.length },
          ] as Array<{ id: typeof activeTab; label: string; icon: React.ReactNode; badge?: number }>
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span className="ml-1 bg-slate-950 text-amber-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full border border-amber-500/30">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'PROVEEDORES' && (
        <SuppliersManager
          suppliers={suppliers}
          onAddSupplier={handleAddSupplier}
          onUpdateSupplier={handleUpdateSupplier}
          onDeleteSupplier={handleDeleteSupplier}
        />
      )}

      {activeTab === 'SOLICITUDES' && (
        <PurchaseRequestsManager
          requests={requests}
          suppliers={suppliers}
          articles={articles}
          onAddRequest={handleAddRequest}
          onUpdateRequest={handleUpdateRequest}
          onConvertToOrder={handleConvertRequestToOrder}
        />
      )}

      {activeTab === 'PEDIDOS' && (
        <PurchaseOrdersManager
          orders={orders}
          suppliers={suppliers}
          articles={articles}
          onAddOrder={handleAddOrder}
          onUpdateOrder={handleUpdateOrder}
          onOpenReception={handleOpenReception}
        />
      )}

      {activeTab === 'RECEPCION' && (
        <div>
          {receptionOrder ? (
            <OrderReceptionManager
              order={receptionOrder}
              articles={articles}
              onCompleteReception={handleCompleteReception}
              onCancel={() => setActiveTab('PEDIDOS')}
            />
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
              Seleccione un pedido en estado "Enviado", "Confirmado" o "En Tránsito" desde la pestaña de Pedidos para recepcionar.
            </div>
          )}
        </div>
      )}

      {activeTab === 'ALBARANES' && (
        <AlbaranesManager
          deliveryNotes={deliveryNotes}
          suppliers={suppliers}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}

      {activeTab === 'FACTURAS' && (
        <SupplierInvoicesManager
          invoices={invoices}
          suppliers={suppliers}
          onAddInvoice={handleAddInvoice}
        />
      )}

      {activeTab === 'CONCILIACION' && (
        <ThreeWayReconciliationPanel
          orders={orders}
          deliveryNotes={deliveryNotes}
          invoices={invoices}
        />
      )}

      {activeTab === 'DEVOLUCIONES' && (
        <ReturnsManager
          returns={returns}
          suppliers={suppliers}
          articles={articles}
          onAddReturn={handleAddReturn}
        />
      )}

      {activeTab === 'VENCIMIENTOS' && (
        <PaymentExpirationsManager
          expirations={expirations}
          onMarkAsPaid={handleMarkExpirationAsPaid}
        />
      )}

      {activeTab === 'COMPARADOR' && <PriceComparatorManager comparisons={priceComparisons} />}

      {activeTab === 'ESTADISTICAS' && <PurchasesAnalyticsPanel analytics={analyticsData} />}

      {activeTab === 'IA' && (
        <AIPurchasesAssistant
          recommendations={aiRecommendations}
          suppliers={suppliers}
          onGenerateOrderFromAI={handleGenerateOrderFromAI}
        />
      )}
    </div>
  );
};

