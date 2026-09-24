import React from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign } from '../../types';
import { 
  X, 
  Send, 
  CheckCheck, 
  Eye, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { formatPhoneDisplay } from '../../utils/phoneNormalizer';

export const CampaignDetailModal: React.FC<{
  campaign: Campaign;
  onClose: () => void;
}> = ({ campaign, onClose }) => {
  const { messageLogs, retryFailedMessages } = useApp();

  // Filter logs for this campaign
  const campaignLogs = messageLogs.filter(l => l.campaignId === campaign.id);

  const total = campaign.stats.total || 1;
  const sent = campaign.stats.sent;
  const delivered = campaign.stats.delivered;
  const read = campaign.stats.read;
  const failed = campaign.stats.failed;
  const replied = campaign.stats.replied;
  const converted = campaign.stats.conversion ?? campaign.stats.converted ?? 0;

  const deliveryRate = sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '0';
  const readRate = delivered > 0 ? ((read / delivered) * 100).toFixed(1) : '0';
  const replyRate = read > 0 ? ((replied / read) * 100).toFixed(1) : '0';
  const conversionRate = sent > 0 ? ((converted / sent) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-slate-900">{campaign.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-xs">
              <span>Segmen: <strong className="text-slate-700">{campaign.segmentName}</strong></span>
              <span>•</span>
              <span>Template: <strong className="text-slate-700 font-mono">{campaign.templateName}</strong></span>
              <span>•</span>
              <span>Waktu: <strong className="text-slate-700">{new Date(campaign.createdAt).toLocaleString('id-ID')}</strong></span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Terkirim</span>
              <strong className="text-base text-slate-900">{sent}</strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Delivered</span>
              <strong className="text-base text-emerald-900">{delivered}</strong>
              <span className="text-[10px] text-emerald-600 block mt-0.5">{deliveryRate}%</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[10px] text-blue-700 uppercase font-bold block">Read</span>
              <strong className="text-base text-blue-900">{read}</strong>
              <span className="text-[10px] text-blue-600 block mt-0.5">{readRate}%</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-700 uppercase font-bold block">Reply</span>
              <strong className="text-base text-amber-900">{replied}</strong>
              <span className="text-[10px] text-amber-600 block mt-0.5">{replyRate}%</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-[10px] text-purple-700 uppercase font-bold block">Conversion</span>
              <strong className="text-base text-purple-900">{converted}</strong>
              <span className="text-[10px] text-purple-600 block mt-0.5">{conversionRate}%</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-700 uppercase font-bold block">Failed</span>
              <strong className="text-base text-rose-900">{failed}</strong>
              {failed > 0 && (
                <button
                  onClick={() => retryFailedMessages(campaign.id)}
                  className="mt-1 text-[9px] font-bold text-rose-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Kirim Ulang</span>
                </button>
              )}
            </div>
          </div>

          {/* Delivery Tracking Logs Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Log Rincian Pesan WhatsApp Cloud API ({campaignLogs.length} Pesan)
              </span>
              <span className="text-[11px] text-slate-500">Live Delivery Tracking Status</span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold border-b">
                  <tr>
                    <th className="p-2.5">Nasabah</th>
                    <th className="p-2.5">Nomor WhatsApp</th>
                    <th className="p-2.5">Status Pengiriman</th>
                    <th className="p-2.5">Waktu Kirim</th>
                    <th className="p-2.5">Diterima / Dibaca</th>
                    <th className="p-2.5">Status WAMID Meta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {campaignLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">{log.contactName}</td>
                      <td className="p-2.5 font-mono text-slate-600">{formatPhoneDisplay(log.contactPhone || log.phone)}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'READ' ? 'bg-blue-100 text-blue-800' :
                          log.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'SENT' ? 'bg-slate-100 text-slate-800' :
                          log.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {log.sentAt ? new Date(log.sentAt).toLocaleTimeString('id-ID') : '-'}
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {log.readAt ? `Read: ${new Date(log.readAt).toLocaleTimeString('id-ID')}` :
                         log.deliveredAt ? `Delivered: ${new Date(log.deliveredAt).toLocaleTimeString('id-ID')}` : '-'}
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-400 truncate max-w-xs">
                        {log.wamid || 'WAMID_SIMULATED_ID'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-slate-500 text-[11px]">
            Data sinkron dengan Meta Webhook Event Gateway.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
