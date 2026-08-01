import React from 'react';
import { OAuthTokenConnection } from '../../types/integration';
import { Key, RefreshCw, Slash, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface OAuthTokensTabProps {
  connections: OAuthTokenConnection[];
  onRefresh: (id: string) => void;
  onRevoke: (id: string) => void;
}

export const OAuthTokensTab: React.FC<OAuthTokensTabProps> = ({ connections, onRefresh, onRevoke }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-400" />
            <span>Gestor de Tokens OAuth2 & Identidad SSO</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Conexiones de autorización seguras mediante OAuth 2.0 / PKCE con rotación de Refresh Tokens y revocación inmediata.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-300">
          Activas: <span className="text-emerald-400 font-bold">{connections.filter((c) => c.status === 'ACTIVE').length}</span>{' '}
          / Total: {connections.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>{conn.provider}</span>
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">{conn.accountEmail}</p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    conn.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {conn.status}
                </span>
              </div>

              {/* Scopes */}
              <div className="mt-3 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Permisos (Scopes)</span>
                <div className="flex flex-wrap gap-1">
                  {conn.scopes.map((scope, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                <div>
                  Client ID: <span className="text-slate-300">{conn.clientId}</span>
                </div>
                <div>
                  Caduca en:{' '}
                  <span className="text-emerald-400 font-bold">{new Date(conn.expiresAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => onRefresh(conn.id)}
                disabled={conn.status === 'REVOKED'}
                className="flex-1 flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs py-1.5 rounded-lg transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Refrescar</span>
              </button>

              <button
                onClick={() => onRevoke(conn.id)}
                disabled={conn.status === 'REVOKED'}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-red-900/60 disabled:opacity-50 text-slate-300 hover:text-red-300 text-xs py-1.5 px-3 rounded-lg transition-all"
              >
                <Slash className="w-3.5 h-3.5" />
                <span>Revocar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
