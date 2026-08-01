import React, { useState } from 'react';
import { Recipe, RecipeIngredient, RecipeSubRecipe, RecipePackaging, UEAllergen } from '../../types/production';
import { Article } from '../../types/inventory';
import { ProductionService } from '../../services/productionService';
import { AuditService } from '../../services/auditService';
import {
  ChefHat,
  Plus,
  Utensils,
  Calculator,
  Percent,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Search,
  FileText,
  DollarSign,
  ArrowRight,
  Layers,
  Box,
  Clock,
  Trash2,
} from 'lucide-react';

interface RecipesManagerProps {
  recipes: Recipe[];
  articles: Article[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
}

export const RecipesManager: React.FC<RecipesManagerProps> = ({
  recipes,
  articles,
  onAddRecipe,
  onUpdateRecipe,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);
  const [filterType, setFilterType] = useState<'TODOS' | 'ELABORADO' | 'SEMIELABORADO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceHikePercent, setPriceHikePercent] = useState<number>(10);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Recipe Form State
  const [newName, setNewName] = useState('');
  const [newFamily, setNewFamily] = useState('Salsas & Masas');
  const [newType, setNewType] = useState<'SEMIELABORADO' | 'ELABORADO'>('ELABORADO');
  const [newPortions, setNewPortions] = useState(4);
  const [newRecommendedPrice, setNewRecommendedPrice] = useState(12.0);

  const filteredRecipes = recipes.filter((r) => {
    const matchesType = filterType === 'TODOS' || r.type === filterType;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.family.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleRecalculate = (recipe: Recipe) => {
    const recalculated = ProductionService.calculateRecipeEscandallo(recipe, articles, recipes);
    onUpdateRecipe(recalculated);
    if (selectedRecipe.id === recipe.id) {
      setSelectedRecipe(recalculated);
    }
  };

  const priceHikeSim = ProductionService.simulatePriceHikeImpact(selectedRecipe, priceHikePercent);

  const handleCreateRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = ProductionService.createRecipe({
      name: newName,
      family: newFamily,
      type: newType,
      portions: newPortions,
      recommendedPrice: newRecommendedPrice,
    });
    const calculated = ProductionService.calculateRecipeEscandallo(created, articles, recipes);
    onAddRecipe(calculated);
    setSelectedRecipe(calculated);
    setShowCreateModal(false);
    setNewName('');

    AuditService.log({
      username: 'JEFE_COCINA',
      action: 'RECIPE_CREATE',
      resource: 'Production',
      details: `Receta ${calculated.code} - ${calculated.name} creada`,
    });
  };

  const handleAddIngredient = (articleId: string) => {
    const art = articles.find((a) => a.id === articleId);
    if (!art) return;

    const newIng: RecipeIngredient = {
      id: `ring-${Date.now()}`,
      articleId: art.id,
      articleName: art.name,
      quantity: 1,
      unit: art.unit,
      wastePercent: 5,
      unitCost: art.cost || art.purchasePrice || 1.0,
      totalCost: (art.cost || art.purchasePrice || 1.0) * 1.05,
    };

    const updated = {
      ...selectedRecipe,
      ingredients: [...selectedRecipe.ingredients, newIng],
    };
    const recalculated = ProductionService.calculateRecipeEscandallo(updated, articles, recipes);
    onUpdateRecipe(recalculated);
    setSelectedRecipe(recalculated);
  };

  const handleRemoveIngredient = (ingId: string) => {
    const updated = {
      ...selectedRecipe,
      ingredients: selectedRecipe.ingredients.filter((i) => i.id !== ingId),
    };
    const recalculated = ProductionService.calculateRecipeEscandallo(updated, articles, recipes);
    onUpdateRecipe(recalculated);
    setSelectedRecipe(recalculated);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-4 rounded-xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <span>Recetario & Escandallos Multinivel Enterprise</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fichas técnicas, cálculo automático de márgenes, mermas, alérgenos UE y simulación de subida de materias primas
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar receta, ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['TODOS', 'ELABORADO', 'SEMIELABORADO'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${
                  filterType === t
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3.5 py-2 rounded-lg text-xs transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </button>
        </div>
      </div>

      {/* Main Grid: List on Left, Detail & Escandallo on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[680px]">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Catálogo ({filteredRecipes.length})</span>
            <span>Tipo / Raciones</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
            {filteredRecipes.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center space-x-3 ${
                  selectedRecipe.id === r.id
                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <img
                  src={r.photoUrl}
                  alt={r.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold truncate text-white">{r.name}</span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        r.type === 'SEMIELABORADO'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {r.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span className="font-mono text-amber-400 font-bold">{r.theoreticalCost}€ cost</span>
                    <span>{r.portions} raciones</span>
                    <span className="text-emerald-400 font-bold">{r.grossMargin}% marg</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 h-[680px] overflow-y-auto">
          {/* Header info */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-800">
            <div className="flex space-x-4 items-center">
              <img
                src={selectedRecipe.photoUrl}
                alt={selectedRecipe.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {selectedRecipe.code}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{selectedRecipe.family}</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">{selectedRecipe.name}</h2>
                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Prep: {selectedRecipe.prepTime}m | Cocción: {selectedRecipe.cookTime}m
                  </span>
                  <span>Raciones: <strong className="text-white">{selectedRecipe.portions}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleRecalculate(selectedRecipe)}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Recalcular Escandallo</span>
              </button>
            </div>
          </div>

          {/* Margins & Key Financial Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">Coste Teórico Total</span>
              <span className="text-lg font-black text-amber-400 font-mono">{selectedRecipe.theoreticalCost}€</span>
              <span className="text-[9px] text-slate-500 block">{(selectedRecipe.theoreticalCost / selectedRecipe.portions).toFixed(2)}€ / ración</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">PVP Recomendado</span>
              <span className="text-lg font-black text-white font-mono">{selectedRecipe.recommendedPrice}€</span>
              <span className="text-[9px] text-slate-500 block">IVA {selectedRecipe.vatRate}% inc.</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">Margen Bruto (%)</span>
              <span className={`text-lg font-black font-mono ${selectedRecipe.grossMargin > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {selectedRecipe.grossMargin}%
              </span>
              <span className="text-[9px] text-slate-500 block">Materia prima</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block">Margen Neto (%)</span>
              <span className="text-lg font-black text-blue-400 font-mono">{selectedRecipe.netMargin}%</span>
              <span className="text-[9px] text-slate-500 block">Post-operativo</span>
            </div>
          </div>

          {/* Escandallo Ingredients Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Desglose de Materias Primas e Ingredientes</span>
              </h3>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddIngredient(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1"
              >
                <option value="">+ Añadir Ingrediente de Almacén...</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({(a.cost || a.purchasePrice || 0).toFixed(2)}€/{a.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Ingrediente</th>
                    <th className="p-2.5">Cantidad</th>
                    <th className="p-2.5">Unidad</th>
                    <th className="p-2.5">Merma %</th>
                    <th className="p-2.5 text-right">Coste / U</th>
                    <th className="p-2.5 text-right">Total €</th>
                    <th className="p-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {selectedRecipe.ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-white">{ing.articleName}</td>
                      <td className="p-2.5 font-mono text-amber-400">{ing.quantity}</td>
                      <td className="p-2.5 font-mono">{ing.unit}</td>
                      <td className="p-2.5 font-mono text-rose-400">{ing.wastePercent}%</td>
                      <td className="p-2.5 font-mono text-right">{ing.unitCost.toFixed(2)}€</td>
                      <td className="p-2.5 font-mono text-right font-bold text-white">{ing.totalCost.toFixed(2)}€</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => handleRemoveIngredient(ing.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-recipes (Multi-level) */}
          {selectedRecipe.subRecipes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Sub-recetas y Semielaborados Incluidos</span>
              </h3>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                {selectedRecipe.subRecipes.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center text-xs text-slate-300">
                    <span className="font-bold text-purple-300">{sub.subRecipeName}</span>
                    <span className="font-mono text-slate-400">{sub.quantity} {sub.unit} × {sub.unitCost}€ = <strong className="text-white">{sub.totalCost}€</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Hike Simulator */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Simulador de Impacto por Subida de Materias Primas</span>
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Subida %:</span>
                <input
                  type="number"
                  value={priceHikePercent}
                  onChange={(e) => setPriceHikePercent(Number(e.target.value))}
                  className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-amber-400 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Coste Proyectado</span>
                <span className="text-sm font-bold text-rose-400 font-mono">{priceHikeSim.projectedCost}€</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Incremento por Ración</span>
                <span className="text-sm font-bold text-amber-400 font-mono">+{priceHikeSim.costIncrease}€</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Nuevo Margen Bruto</span>
                <span className="text-sm font-bold text-blue-400 font-mono">{priceHikeSim.newGrossMargin}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Receta */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateRecipeSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <span>Crear Nueva Receta / Escandallo</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nombre de la Receta</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                placeholder="Ej. Salsa Holandesa..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="ELABORADO">Elaborado (Producto)</option>
                  <option value="SEMIELABORADO">Semielaborado (Base)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raciones Obtenidas</label>
                <input
                  type="number"
                  min="1"
                  value={newPortions}
                  onChange={(e) => setNewPortions(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow"
              >
                Guardar Receta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
