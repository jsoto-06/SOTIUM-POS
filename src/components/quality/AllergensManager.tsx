import React, { useState } from 'react';
import { DishAllergenInfo, EUAllergenCode } from '../../types/qualityHaccp';
import { QualityHaccpService } from '../../services/qualityHaccpService';
import { INITIAL_EU_ALLERGENS } from '../../data/qualityHaccpData';
import { Utensils, Shield, Check, Edit2, Info, Search, Sparkles } from 'lucide-react';

export const AllergensManager: React.FC = () => {
  const [dishes, setDishes] = useState<DishAllergenInfo[]>(QualityHaccpService.getDishAllergens());
  const [selectedDish, setSelectedDish] = useState<DishAllergenInfo | null>(dishes[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDishes = dishes.filter(
    (d) =>
      d.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDirectAllergen = (code: EUAllergenCode) => {
    if (!selectedDish) return;
    const isPresent = selectedDish.allergensDirect.includes(code);
    const updatedDirect = isPresent
      ? selectedDish.allergensDirect.filter((c) => c !== code)
      : [...selectedDish.allergensDirect, code];

    // Remove from traces if direct
    const updatedTraces = selectedDish.allergensTraces.filter((c) => c !== code);

    const updated = QualityHaccpService.updateDishAllergens(
      {
        ...selectedDish,
        allergensDirect: updatedDirect,
        allergensTraces: updatedTraces,
      },
      'Usuario Calidad'
    );

    setSelectedDish(updated);
    setDishes(QualityHaccpService.getDishAllergens());
  };

  const toggleTracesAllergen = (code: EUAllergenCode) => {
    if (!selectedDish) return;
    if (selectedDish.allergensDirect.includes(code)) return; // Cannot be traces if direct

    const isPresent = selectedDish.allergensTraces.includes(code);
    const updatedTraces = isPresent
      ? selectedDish.allergensTraces.filter((c) => c !== code)
      : [...selectedDish.allergensTraces, code];

    const updated = QualityHaccpService.updateDishAllergens(
      {
        ...selectedDish,
        allergensTraces: updatedTraces,
      },
      'Usuario Calidad'
    );

    setSelectedDish(updated);
    setDishes(QualityHaccpService.getDishAllergens());
  };

  const toggleDietaryFlag = (flag: 'isGlutenFree' | 'isLactoseFree' | 'isVegan' | 'isVegetarian') => {
    if (!selectedDish) return;
    const updated = QualityHaccpService.updateDishAllergens(
      {
        ...selectedDish,
        [flag]: !selectedDish[flag],
      },
      'Usuario Calidad'
    );

    setSelectedDish(updated);
    setDishes(QualityHaccpService.getDishAllergens());
  };

  return (
    <div className="space-y-6">
      {/* 14 EU Mandatory Allergens Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Matriz Oficial de 14 Alérgenos de Declaración Obligatoria (Reglamento UE 1169/2011)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {INITIAL_EU_ALLERGENS.map((alg) => (
            <div key={alg.code} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center space-y-1">
              <span className="text-xl block">{alg.icon}</span>
              <span className="text-[10px] font-bold text-white block leading-tight">{alg.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dishes Matrix Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dishes List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Platos de la Carta ({dishes.length})</span>
            </h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar plato o categoría..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {filteredDishes.map((dish) => (
              <button
                key={dish.productId}
                onClick={() => setSelectedDish(dish)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedDish?.productId === dish.productId
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white">{dish.productName}</span>
                  <span className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded font-mono">
                    {dish.categoryName}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {dish.allergensDirect.map((code) => {
                    const found = INITIAL_EU_ALLERGENS.find((a) => a.code === code);
                    return (
                      <span key={code} className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-500/30">
                        {found?.icon} {found?.name}
                      </span>
                    );
                  })}
                  {dish.allergensDirect.length === 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                      Sin Alérgenos Declarados
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Dish Editor */}
        {selectedDish && (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mr-2">
                  {selectedDish.categoryName}
                </span>
                <span className="text-lg font-bold text-white">{selectedDish.productName}</span>
              </div>
              <span className="text-xs text-slate-400">Última actualización: {selectedDish.lastUpdated}</span>
            </div>

            {/* Dietary Tags Toggles */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Etiquetas de Dieta y Tolerancias Especiales:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleDietaryFlag('isGlutenFree')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedDish.isGlutenFree
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🌾 Sin Gluten (Apto Celíacos)
                </button>
                <button
                  onClick={() => toggleDietaryFlag('isLactoseFree')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedDish.isLactoseFree
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🥛 Sin Lactosa
                </button>
                <button
                  onClick={() => toggleDietaryFlag('isVegan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedDish.isVegan
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🌱 Vegano
                </button>
                <button
                  onClick={() => toggleDietaryFlag('isVegetarian')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedDish.isVegetarian
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🥗 Vegetariano
                </button>
              </div>
            </div>

            {/* Allergen Toggle Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                Seleccione los Alérgenos presentes en la receta:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INITIAL_EU_ALLERGENS.map((alg) => {
                  const isDirect = selectedDish.allergensDirect.includes(alg.code);
                  const isTraces = selectedDish.allergensTraces.includes(alg.code);

                  return (
                    <div
                      key={alg.code}
                      className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                        isDirect
                          ? 'bg-red-950/40 border-red-500/60'
                          : isTraces
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">{alg.icon}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">{alg.name}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{alg.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleDirectAllergen(alg.code)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                            isDirect
                              ? 'bg-red-500 text-white border-red-400 shadow'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          CONTIENE
                        </button>
                        <button
                          onClick={() => toggleTracesAllergen(alg.code)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                            isTraces
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          TRAZAS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
