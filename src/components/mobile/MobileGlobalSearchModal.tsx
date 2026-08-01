import React, { useState, useCallback } from 'react';
import { MobileService } from '../../services/mobileService';
import { MobileGlobalSearchResult } from '../../types/mobile';
import { Search, X, Layers, User, Package, FileText, Calendar, Truck, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileGlobalSearchModal: React.FC<Props> = React.memo(({ isOpen, onClose }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<MobileGlobalSearchResult[]>([]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length === 0) {
      setResults([]);
      return;
    }
    const res = MobileService.searchGlobal(q);
    setResults(res);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center p-4 pt-16">
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900 max-w-lg w-full space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Search className="w-4 h-4" />
            <span>Buscador Global Móvil Enterprise</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por mesa, cliente, producto, ticket, reserva, reparto, empleado..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Results List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {query.trim().length > 0 && results.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No se encontraron resultados para "{query}"</p>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={onClose}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between cursor-pointer transition-all text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/20">
                      {item.type}
                    </span>
                    <span className="font-bold text-slate-200">{item.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{item.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});
