import React, { useState } from 'react';
import { GlobalIntegrationSearchItem } from '../../types/integration';
import { Search, Globe, Key, AlertTriangle, Code2, Layers, X } from 'lucide-react';

interface IntegrationsSearchModalProps {
  onSearch: (query: string) => GlobalIntegrationSearchItem[];
  onClose: () => void;
}

export const IntegrationsSearchModal: React.FC<IntegrationsSearchModalProps> = ({ onSearch, onClose }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<GlobalIntegrationSearchItem[]>([]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      setResults(onSearch(val));
    } else {
      setResults([]);
    }
  };

  const getTypeIcon = (type: GlobalIntegrationSearchItem['type']) => {
    switch (type) {
      case 'CONNECTOR':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'WEBHOOK':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'DLQ':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'TOKEN':
        return <Key className="w-4 h-4 text-emerald-400" />;
      default:
        return <Code2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
        {/* Search Input Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="relative flex-1 mr-4">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar por conector, webhook, error DLQ, token OAuth, API Key..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {query.trim().length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Escriba para buscar en el ecosistema de integraciones...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No se encontraron coincidencias para "{query}".</p>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-850 p-3 rounded-lg hover:border-slate-700 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{item.title}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                        {item.type}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>

                {item.status && (
                  <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                    {item.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
