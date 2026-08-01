import React, { useState } from 'react';
import { Customer, MarketingCampaign, CommunicationChannel, MarketingSegmentFilter } from '../../types/crm';
import { CRMService } from '../../services/crmService';
import { Send, Users, Mail, Phone, MessageSquare, Plus, CheckCircle2, Filter } from 'lucide-react';

interface MarketingCampaignsManagerProps {
  customers: Customer[];
  campaigns: MarketingCampaign[];
  onCreateCampaign: (campaign: MarketingCampaign) => void;
}

export const MarketingCampaignsManager: React.FC<MarketingCampaignsManagerProps> = ({
  customers,
  campaigns,
  onCreateCampaign,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState<CommunicationChannel>('WHATSAPP');
  const [messageTemplate, setMessageTemplate] = useState('');

  // Segment filters
  const [minSpend, setMinSpend] = useState<number>(0);
  const [lastVisitDaysAgo, setLastVisitDaysAgo] = useState<number>(60);
  const [isVipOnly, setIsVipOnly] = useState<boolean>(false);

  const activeSegmentFilter: MarketingSegmentFilter = {
    minSpend: minSpend > 0 ? minSpend : undefined,
    lastVisitDaysAgo: lastVisitDaysAgo > 0 ? lastVisitDaysAgo : undefined,
    isVipOnly: isVipOnly || undefined,
  };

  const targetedCustomers = CRMService.segmentCustomers(customers, activeSegmentFilter);

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampaign: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      title,
      description,
      channel,
      scheduledDate: new Date().toISOString().substring(0, 10),
      status: 'PROGRAMADA',
      targetSegment: activeSegmentFilter,
      messageTemplate: messageTemplate || '¡Hola {NOMBRE}! Tenemos una oferta especial reservada para ti.',
      sentCount: targetedCustomers.length,
      conversionRatePercent: 0,
    };
    onCreateCampaign(newCampaign);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setMessageTemplate('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400" />
            <span>Motor de Segmentación y Campañas de Marketing Omnicanal</span>
          </h3>
          <p className="text-xs text-slate-400">
            Diseña y automatiza campañas por WhatsApp, SMS, Email o Push según comportamiento de consumo.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Campaña</span>
        </button>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-white">{c.title}</h4>
                <p className="text-xs text-slate-400">{c.description}</p>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {c.channel}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
              "{c.messageTemplate}"
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Enviados</span>
                <strong className="text-white">{c.sentCount}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Conversión</span>
                <strong className="text-emerald-400">{c.conversionRatePercent}%</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Estado</span>
                <strong className="text-amber-400">{c.status}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Creation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCampaign} className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" /> Crear Campaña de Marketing
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Título de la Campaña *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Descripción corta</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Canal de Envío</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-semibold"
                >
                  <option value="WHATSAPP">WhatsApp Business</option>
                  <option value="EMAIL">Email Marketing</option>
                  <option value="SMS">SMS Premium</option>
                  <option value="PUSH">Notificación Push TPV/Web</option>
                </select>
              </div>

              {/* Segment Filters */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Segmentación del Público Objetivo ({targetedCustomers.length} clientes)
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Inactividad Mínima (Días)</label>
                    <input
                      type="number"
                      value={lastVisitDaysAgo}
                      onChange={(e) => setLastVisitDaysAgo(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Gasto Mínimo (€)</label>
                    <input
                      type="number"
                      value={minSpend}
                      onChange={(e) => setMinSpend(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Mensaje / Plantilla</label>
                <textarea
                  rows={3}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  placeholder="¡Hola {NOMBRE}! Disfruta de un 15% de descuento en tu próxima cena."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Lanzar Campaña ({targetedCustomers.length} Envíos)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
