import React, { useState, useMemo } from 'react';
import { Article, ArticleType, ArticleUnit } from '../../types/inventory';
import {
  Search,
  Plus,
  QrCode,
  Barcode,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpDown,
  Tag,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface ArticlesManagerProps {
  articles: Article[];
  onAddArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
}

export const ArticlesManager: React.FC<ArticlesManagerProps> = ({
  articles,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'NORMAL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [activeTabForm, setActiveTabForm] = useState<'general' | 'codes' | 'pricing' | 'stock'>('general');

  // Form State
  const [formData, setFormData] = useState<Partial<Article>>({
    internalCode: '',
    barcode: '',
    ean13: '',
    ean128: '',
    qrCode: '',
    name: '',
    shortName: '',
    description: '',
    photoUrl: '',
    family: 'General',
    subfamily: 'General',
    type: 'MATERIA_PRIMA',
    primarySupplier: '',
    secondarySupplier: '',
    brand: '',
    unit: 'kg',
    vatRate: 10,
    purchasePrice: 0,
    averagePrice: 0,
    lastPrice: 0,
    salePrice: 0,
    cost: 0,
    margin: 0,
    minStock: 5,
    maxStock: 50,
    safetyStock: 8,
    hasExpiration: true,
    hasBatchControl: true,
    active: true,
    notes: '',
    stock: 0,
  });

  const families = useMemo(() => {
    const fams = new Set(articles.map((a) => a.family).filter(Boolean));
    return ['ALL', ...Array.from(fams)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        art.name.toLowerCase().includes(searchLower) ||
        art.internalCode.toLowerCase().includes(searchLower) ||
        art.barcode.toLowerCase().includes(searchLower) ||
        (art.primarySupplier && art.primarySupplier.toLowerCase().includes(searchLower));

      const matchesFamily = selectedFamily === 'ALL' || art.family === selectedFamily;
      const matchesType = selectedType === 'ALL' || art.type === selectedType;

      const isLow = (art.stock ?? 0) <= art.minStock;
      const matchesStock =
        stockFilter === 'ALL' || (stockFilter === 'LOW' && isLow) || (stockFilter === 'NORMAL' && !isLow);

      return matchesSearch && matchesFamily && matchesType && matchesStock;
    });
  }, [articles, searchTerm, selectedFamily, selectedType, stockFilter]);

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({ ...article });
    } else {
      setEditingArticle(null);
      const randomCode = `ART-${Math.floor(10000 + Math.random() * 90000)}`;
      const randomEan = `84${Math.floor(10000000000 + Math.random() * 90000000000)}`;
      setFormData({
        id: `art-${Date.now()}`,
        internalCode: randomCode,
        barcode: randomEan,
        ean13: randomEan,
        ean128: `(01)0${randomEan}(10)LOT2026`,
        qrCode: `https://erp.hostel.es/qr/${randomCode}`,
        name: '',
        shortName: '',
        description: '',
        photoUrl: '',
        family: 'Carnes y Aves',
        subfamily: 'Vacuno',
        type: 'MATERIA_PRIMA',
        primarySupplier: 'Proveedor Central',
        secondarySupplier: '',
        brand: 'Selección',
        unit: 'kg',
        vatRate: 10,
        purchasePrice: 10.0,
        averagePrice: 10.0,
        lastPrice: 10.0,
        salePrice: 0,
        cost: 10.0,
        margin: 0,
        minStock: 5,
        maxStock: 50,
        safetyStock: 8,
        hasExpiration: true,
        hasBatchControl: true,
        active: true,
        notes: '',
        stock: 10,
      });
    }
    setActiveTabForm('general');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.internalCode) {
      alert('Por favor, indica al menos el nombre y código interno.');
      return;
    }

    const calculatedCost = formData.purchasePrice ?? 0;
    const calculatedMargin =
      (formData.salePrice ?? 0) > 0
        ? Number(((((formData.salePrice ?? 0) - calculatedCost) / (formData.salePrice ?? 1)) * 100).toFixed(1))
        : 0;

    const finalArticle: Article = {
      id: formData.id || `art-${Date.now()}`,
      internalCode: formData.internalCode || '',
      barcode: formData.barcode || '',
      ean13: formData.ean13 || formData.barcode || '',
      ean128: formData.ean128 || '',
      qrCode: formData.qrCode || '',
      name: formData.name || '',
      shortName: formData.shortName || formData.name || '',
      description: formData.description || '',
      photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      family: formData.family || 'General',
      subfamily: formData.subfamily || 'General',
      type: (formData.type as ArticleType) || 'MATERIA_PRIMA',
      primarySupplier: formData.primarySupplier || 'Proveedor',
      secondarySupplier: formData.secondarySupplier || '',
      brand: formData.brand || '',
      unit: (formData.unit as ArticleUnit) || 'kg',
      vatRate: formData.vatRate ?? 10,
      purchasePrice: formData.purchasePrice ?? 0,
      averagePrice: formData.averagePrice ?? formData.purchasePrice ?? 0,
      lastPrice: formData.lastPrice ?? formData.purchasePrice ?? 0,
      salePrice: formData.salePrice ?? 0,
      cost: calculatedCost,
      margin: calculatedMargin,
      minStock: formData.minStock ?? 5,
      maxStock: formData.maxStock ?? 50,
      safetyStock: formData.safetyStock ?? 8,
      hasExpiration: formData.hasExpiration ?? true,
      hasBatchControl: formData.hasBatchControl ?? true,
      active: formData.active ?? true,
      notes: formData.notes || '',
      stock: formData.stock ?? 0,
    };

    if (editingArticle) {
      onUpdateArticle(finalArticle);
    } else {
      onAddArticle(finalArticle);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Nombre, Código Interno, Código de Barras o Proveedor..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Family Filter */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Todas las Familias</option>
            {families
              .filter((f) => f !== 'ALL')
              .map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="MATERIA_PRIMA">Materia Prima</option>
            <option value="INGREDIENTE">Ingrediente</option>
            <option value="PRODUCTO">Producto Venta</option>
            <option value="ELABORADO">Elaborado</option>
            <option value="SEMIELABORADO">Semielaborado</option>
            <option value="ENVASES">Envases</option>
            <option value="CONSUMIBLES">Consumibles</option>
            <option value="SERVICIOS">Servicios</option>
          </select>

          {/* Stock Filter */}
          <button
            onClick={() => setStockFilter(stockFilter === 'LOW' ? 'ALL' : 'LOW')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
              stockFilter === 'LOW'
                ? 'bg-red-950/80 border-red-500 text-red-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Stock Bajo Mínimos</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Artículo Enterprise</span>
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Artículo / Descripción</th>
                <th className="p-3">Familia / Tipo</th>
                <th className="p-3">Proveedor</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-right">P. Compra</th>
                <th className="p-3 text-right">Coste Medio</th>
                <th className="p-3 text-right">P. Venta</th>
                <th className="p-3 text-center">Lote/Cad.</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-mono text-xs">
                    No se encontraron artículos que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  const isLow = (art.stock ?? 0) <= art.minStock;
                  return (
                    <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">
                        <div>{art.internalCode}</div>
                        <div className="text-[9px] text-slate-500 flex items-center space-x-1">
                          <Barcode className="w-2.5 h-2.5 inline" />
                          <span>{art.barcode}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2.5">
                          {art.photoUrl && (
                            <img
                              src={art.photoUrl}
                              alt={art.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-bold text-white block">{art.name}</span>
                            <span className="text-[10px] text-slate-400">{art.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold block w-max">
                          {art.family}
                        </span>
                        <span className="text-[9px] font-mono text-amber-400/80 uppercase">{art.type}</span>
                      </td>
                      <td className="p-3 text-slate-400">{art.primarySupplier || 'Sin proveedor'}</td>
                      <td className="p-3 text-right font-mono">
                        <span className={`font-bold ${isLow ? 'text-red-400 font-black animate-pulse' : 'text-emerald-400'}`}>
                          {art.stock ?? 0} {art.unit}
                        </span>
                        <div className="text-[9px] text-slate-500">Mín: {art.minStock}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-300">
                        {art.purchasePrice.toFixed(2)} €
                      </td>
                      <td className="p-3 text-right font-mono text-amber-400 font-bold">
                        {art.averagePrice.toFixed(2)} €
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                        {art.salePrice > 0 ? `${art.salePrice.toFixed(2)} €` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {art.hasBatchControl && (
                            <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold" title="Control por Lote FIFO/FEFO">
                              LOTE
                            </span>
                          )}
                          {art.hasExpiration && (
                            <span className="bg-rose-950 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold" title="Control de Caducidad">
                              CAD
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenModal(art)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                            title="Editar Artículo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el artículo ${art.name}?`)) onDeleteArticle(art.id);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg transition-colors"
                            title="Eliminar Artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit/Create Article */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">
                  {editingArticle ? `Editar Artículo: ${editingArticle.name}` : 'Crear Nuevo Artículo Enterprise'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Subtabs Form */}
            <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2">
              {[
                { id: 'general', label: '1. Datos Generales & Tipo' },
                { id: 'codes', label: '2. Códigos & Trazabilidad' },
                { id: 'pricing', label: '3. Precios & Márgenes' },
                { id: 'stock', label: '4. Stock & Alertas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabForm(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                    activeTabForm === tab.id
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {activeTabForm === 'general' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Solomillo de Ternera Gallega Suprema"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Nombre Corto Ticket</label>
                    <input
                      type="text"
                      value={formData.shortName || ''}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder="Ej: Solomillo Ternera"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Tipo de Artículo *</label>
                    <select
                      value={formData.type || 'MATERIA_PRIMA'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ArticleType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-bold text-amber-400"
                    >
                      <option value="MATERIA_PRIMA">MATERIA_PRIMA (Comprada para transformación)</option>
                      <option value="INGREDIENTE">INGREDIENTE (Usado en recetas)</option>
                      <option value="PRODUCTO">PRODUCTO (Venta directa al cliente)</option>
                      <option value="ELABORADO">ELABORADO (Producido internamente en cocina)</option>
                      <option value="SEMIELABORADO">SEMIELABORADO (Base de varias elaboraciones)</option>
                      <option value="ENVASES">ENVASES (Packaging takeaway / bolsas)</option>
                      <option value="CONSUMIBLES">CONSUMIBLES (Servilletas, limpieza)</option>
                      <option value="SERVICIOS">SERVICIOS (Mantenimiento externalizado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Familia de Producto</label>
                    <input
                      type="text"
                      value={formData.family || ''}
                      onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                      placeholder="Ej: Carnes y Aves"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Proveedor Principal</label>
                    <input
                      type="text"
                      value={formData.primarySupplier || ''}
                      onChange={(e) => setFormData({ ...formData, primarySupplier: e.target.value })}
                      placeholder="Ej: Carnes Cárnicas S.A."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Proveedor Secundario</label>
                    <input
                      type="text"
                      value={formData.secondarySupplier || ''}
                      onChange={(e) => setFormData({ ...formData, secondarySupplier: e.target.value })}
                      placeholder="Ej: Distribuciones Mercamurcia"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-400 font-mono mb-1">Descripción / Notas de Conservación</label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Notas técnicas de almacenaje, humedad, temperatura..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {activeTabForm === 'codes' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Código Interno (SKU) *</label>
                    <input
                      type="text"
                      required
                      value={formData.internalCode || ''}
                      onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Código de Barras / EAN13</label>
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value, ean13: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">EAN128 GS1 (Logística)</label>
                    <input
                      type="text"
                      value={formData.ean128 || ''}
                      onChange={(e) => setFormData({ ...formData, ean128: e.target.value })}
                      placeholder="(01)08410001001018(10)LOT2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">URL Código QR</label>
                    <input
                      type="text"
                      value={formData.qrCode || ''}
                      onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {activeTabForm === 'pricing' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Precio de Compra (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice ?? 0}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Precio Medio Ponderado (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.averagePrice ?? 0}
                      onChange={(e) => setFormData({ ...formData, averagePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Precio Venta Público (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.salePrice ?? 0}
                      onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">IVA Aplicable (%)</label>
                    <select
                      value={formData.vatRate ?? 10}
                      onChange={(e) => setFormData({ ...formData, vatRate: parseInt(e.target.value) || 10 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value={21}>21% (General / Bebidas)</option>
                      <option value={10}>10% (Alimentos / Hostelería)</option>
                      <option value={4}>4% (Superreducido / Pan, Leche)</option>
                      <option value={0}>0% (Exento)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Unidad de Medida</label>
                    <select
                      value={formData.unit || 'kg'}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value as ArticleUnit })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value="kg">Kilogramo (kg)</option>
                      <option value="g">Gramo (g)</option>
                      <option value="l">Litro (l)</option>
                      <option value="ml">Mililitro (ml)</option>
                      <option value="ud">Unidad (ud)</option>
                      <option value="caja">Caja (caja)</option>
                      <option value="pack">Pack / Paquete</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTabForm === 'stock' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Stock Actual Global</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.stock ?? 0}
                      onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Stock Mínimo (Alarma)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.minStock ?? 5}
                      onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-red-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Stock Máximo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.maxStock ?? 50}
                      onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="col-span-3 flex items-center space-x-6 pt-2">
                    <label className="flex items-center space-x-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasBatchControl ?? true}
                        onChange={(e) => setFormData({ ...formData, hasBatchControl: e.target.checked })}
                        className="rounded border-slate-800 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Control Obligatorio por Lote (FIFO/FEFO)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasExpiration ?? true}
                        onChange={(e) => setFormData({ ...formData, hasExpiration: e.target.checked })}
                        className="rounded border-slate-800 text-rose-500 focus:ring-rose-500"
                      />
                      <span>Control de Fecha de Caducidad</span>
                    </label>

                    <label className="flex items-center space-x-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active ?? true}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Artículo Activo Comercial</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
