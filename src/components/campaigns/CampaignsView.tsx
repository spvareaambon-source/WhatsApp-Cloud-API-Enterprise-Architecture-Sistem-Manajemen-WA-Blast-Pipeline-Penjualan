import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Campaign } from '../../types';
import { 
  Send, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  XOctagon, 
  Trash2, 
  Eye, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { CampaignDetailModal } from './CampaignDetailModal';

export const CampaignsView: React.FC = () => {
  const { 
    campaigns, 
    sendCampaign, 
    pauseCampaign, 
    resumeCampaign, 
    cancelCampaign, 
    duplicateCampaign, 
    deleteCampaign,
    setActiveView,
    selectedCampaignId,
    setSelectedCampaignId
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.segmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen WhatsApp Blast Campaigns</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring siklus hidup pesan massal, kontrol antrean throttling, tracking real-time, dan mitigasi pesan gagal.
          </p>
        </div>

        <button
          onClick={() => setActiveView('campaign-wizard')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Campaign Baru</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari campaign, segmen audiens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="RUNNING">RUNNING (Berjalan)</option>
            <option value="COMPLETED">COMPLETED (Selesai)</option>
            <option value="DRAFT">DRAFT (Konsep)</option>
            <option value="SCHEDULED">SCHEDULED (Terjadwal)</option>
            <option value="PAUSED">PAUSED (Jeda)</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards List */}
      <div className="space-y-3.5">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((cmp) => {
            const total = cmp.stats.total || 1;
            const sentPct = Math.round((cmp.stats.sent / total) * 100);
            const deliveredPct = cmp.stats.sent > 0 ? Math.round((cmp.stats.delivered / cmp.stats.sent) * 100) : 0;
            const readPct = cmp.stats.delivered > 0 ? Math.round((cmp.stats.read / cmp.stats.delivered) * 100) : 0;

            const statusColors = {
              RUNNING: 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse',
              COMPLETED: 'bg-slate-100 text-slate-800 border-slate-200',
              DRAFT: 'bg-amber-100 text-amber-800 border-amber-200',
              SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
              PAUSED: 'bg-orange-100 text-orange-800 border-orange-200',
              CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
              FAILED: 'bg-rose-100 text-rose-800 border-rose-200'
            };

            return (
              <div
                key={cmp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Info & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{cmp.name}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[cmp.status]}`}>
                      {cmp.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                    <span>Segmen: <strong className="text-slate-800">{cmp.segmentName}</strong></span>
                    <span>•</span>
                    <span>Template: <strong className="text-slate-800 font-mono">{cmp.templateName}</strong></span>
                    <span>•</span>
                    <span>Dibuat: <strong className="text-slate-800">{new Date(cmp.createdAt).toLocaleDateString('id-ID')}</strong></span>
                  </div>

                  {/* Progress Bar & High Level Delivery Stats */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Progres Pengiriman:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {cmp.stats.sent} / {cmp.stats.total} Pesan ({sentPct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${sentPct}%` }} />
                    </div>
                  </div>

                  {/* Detailed Counters Pill Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-3 text-center">
                    <div className="p-1.5 bg-slate-50 rounded-lg border text-[11px]">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Target</span>
                      <strong className="text-slate-800">{cmp.stats.total}</strong>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg border text-[11px]">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Terkirim</span>
                      <strong className="text-slate-800">{cmp.stats.sent}</strong>
                    </div>
                    <div className="p-1.5 bg-emerald-50/60 rounded-lg border border-emerald-100 text-[11px]">
                      <span className="text-emerald-700 block text-[9px] uppercase font-bold">Delivered</span>
                      <strong className="text-emerald-900">{cmp.stats.delivered} ({deliveredPct}%)</strong>
                    </div>
                    <div className="p-1.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px]">
                      <span className="text-blue-700 block text-[9px] uppercase font-bold">Read</span>
                      <strong className="text-blue-900">{cmp.stats.read} ({readPct}%)</strong>
                    </div>
                    <div className="p-1.5 bg-amber-50/60 rounded-lg border border-amber-100 text-[11px]">
                      <span className="text-amber-700 block text-[9px] uppercase font-bold">Balasan</span>
                      <strong className="text-amber-900">{cmp.stats.replied}</strong>
                    </div>
                    <div className="p-1.5 bg-purple-50/60 rounded-lg border border-purple-100 text-[11px]">
                      <span className="text-purple-700 block text-[9px] uppercase font-bold">Closing</span>
                      <strong className="text-purple-900">{cmp.stats.conversion ?? cmp.stats.converted ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {cmp.status === 'DRAFT' && (
                    <button
                      onClick={() => sendCampaign(cmp.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Mulai Blast</span>
                    </button>
                  )}

                  {cmp.status === 'RUNNING' && (
                    <button
                      onClick={() => pauseCampaign(cmp.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda (Pause)</span>
                    </button>
                  )}

                  {cmp.status === 'PAUSED' && (
                    <button
                      onClick={() => resumeCampaign(cmp.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Lanjutkan</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCampaignId(cmp.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>

                  <button
                    onClick={() => duplicateCampaign(cmp.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Duplikasi Campaign"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCampaignToDelete(cmp)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Hapus Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-2xl border text-center text-slate-400 text-xs">
            Belum ada campaign yang dibuat atau sesuai filter pencarian.
          </div>
        )}
      </div>

      {/* Campaign Detail Drill-down Modal */}
      {activeCampaign && (
        <CampaignDetailModal
          campaign={activeCampaign}
          onClose={() => setSelectedCampaignId(null)}
        />
      )}

      {/* Confirm Delete Campaign Modal */}
      <ConfirmDeleteModal
        isOpen={!!campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={() => {
          if (campaignToDelete) {
            deleteCampaign(campaignToDelete.id);
            setCampaignToDelete(null);
          }
        }}
        title="Hapus Campaign WhatsApp Blast?"
        message={`Apakah Anda yakin ingin menghapus campaign "${campaignToDelete?.name}"? Data statistik dan antrean pesan kampanye ini akan dihapus dari web.`}
        itemName={campaignToDelete?.name}
        confirmText="Hapus Campaign"
      />
    </div>
  );
};
