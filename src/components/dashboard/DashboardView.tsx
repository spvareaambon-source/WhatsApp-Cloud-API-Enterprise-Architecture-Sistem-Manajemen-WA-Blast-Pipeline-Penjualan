import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Send, 
  CheckCheck, 
  Eye, 
  XCircle, 
  MessageSquare, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  UploadCloud, 
  Play, 
  Activity, 
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    contacts, 
    campaigns, 
    messageLogs, 
    conversations, 
    followUps, 
    setActiveView, 
    setSelectedCampaignId,
    sendCampaign
  } = useApp();

  // Metrics calculations
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.customerStatus === 'AKTIF').length;
  const optInContacts = contacts.filter(c => c.optInStatus === 'OPTED_IN').length;
  const optOutContacts = contacts.filter(c => c.optInStatus === 'OPTED_OUT').length;

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'RUNNING').length;

  const totalSent = messageLogs.filter(m => ['SENT', 'DELIVERED', 'READ'].includes(m.status)).length;
  const totalPending = messageLogs.filter(m => ['QUEUED', 'PROCESSING'].includes(m.status)).length;
  const totalDelivered = messageLogs.filter(m => ['DELIVERED', 'READ'].includes(m.status)).length;
  const totalRead = messageLogs.filter(m => m.status === 'READ').length;
  const totalFailed = messageLogs.filter(m => m.status === 'FAILED').length;

  const totalReplies = conversations.reduce((acc, c) => acc + c.messages.filter(m => m.sender === 'CUSTOMER').length, 0);
  const totalFollowups = followUps.length;
  const totalConversions = followUps.filter(f => f.stage === 'CLOSED').length;
  const conversionRate = totalSent > 0 ? ((totalConversions / totalSent) * 100).toFixed(1) : '0.0';

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0';
  const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0.0';
  const replyRate = totalRead > 0 ? ((totalReplies / totalRead) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Architecture Flow & Quick Launch */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WhatsApp Cloud API Enterprise Architecture</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Sistem Manajemen WA Blast & Pipeline Penjualan
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              Pengiriman massal resmi berbasis Meta Business Platform, segmentasi dinamis cerdas, personalisasi otomatis, verifikasi opt-in, dan follow-up omnichannel.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('import')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs cursor-pointer transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Import Kontak</span>
            </button>
            <button
              onClick={() => setActiveView('campaign-wizard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-900/40 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Campaign Baru</span>
            </button>
          </div>
        </div>

        {/* Visual Lifecycle Pipeline Breadcrumb */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Alur Operasional End-to-End:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium text-slate-300 pb-1 scrollbar-none">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">1. Database</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">2. Import / Normalisasi</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">3. Segmentasi</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">4. Template Meta</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">5. Personalisasi</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">6. Queue & Throttle</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">7. Delivery Tracking</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-300 border border-amber-500/30">8. Reply & Closing</span>
          </div>
        </div>
      </div>

      {/* When Contacts Database is Empty */}
      {contacts.length === 0 && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <UploadCloud className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-sm">Database Kontak Saat Ini Bersih / Kosong (0 Data)</h4>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Seluruh data Excel telah direset ke tampilan kosong tanpa data. Silakan unggah file spreadsheet Excel (.xlsx) baru untuk mulai menyusun target kampanye broadcast WhatsApp.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('import')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File Excel (.xlsx)</span>
          </button>
        </div>
      )}

      {/* KPI Section 1: Audience & Campaign High Level */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Contact</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{totalContacts}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{activeContacts}</span> aktif
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Contact Opt-in</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{optInContacts}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((optInContacts / totalContacts) * 100).toFixed(0)}% telah consent
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Contact Opt-out</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-700">{optOutContacts}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ditekan otomatis</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Campaign</span>
            <Send className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{totalCampaigns}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{activeCampaigns}</span> berjalan
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Pesan Terkirim</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{totalSent}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-slate-600">{totalPending}</span> pending antrean
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Delivered & Read</span>
            <CheckCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{totalDelivered}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-bold text-slate-700">{totalRead}</span> dibaca ({readRate}%)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Conversion</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{totalConversions}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Rate: <span className="font-bold text-emerald-600">{conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Conversion & Delivery Funnel Visualizer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Funnel Performa Pesan WhatsApp Cloud API</h3>
            <p className="text-xs text-slate-500">Konversi dari antrean pesan hingga closing transaksi produk</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Delivered ({deliveryRate}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600">Read ({readRate}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600">Reply ({replyRate}%)</span>
            </div>
          </div>
        </div>

        {/* 5-Step Funnel Bars */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-1">1. Dikirim (Sent)</div>
            <div className="text-xl font-bold text-slate-800">{totalSent}</div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-slate-700 h-full w-full" />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">100% dari target blast</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-xs font-semibold text-emerald-800 mb-1">2. Diterima (Delivered)</div>
            <div className="text-xl font-bold text-emerald-900">{totalDelivered}</div>
            <div className="w-full bg-emerald-200 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full" style={{ width: `${deliveryRate}%` }} />
            </div>
            <div className="text-[11px] text-emerald-700 mt-2 font-medium">{deliveryRate}% delivery rate</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="text-xs font-semibold text-blue-800 mb-1">3. Dibaca (Read)</div>
            <div className="text-xl font-bold text-blue-900">{totalRead}</div>
            <div className="w-full bg-blue-200 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${readRate}%` }} />
            </div>
            <div className="text-[11px] text-blue-700 mt-2 font-medium">{readRate}% read rate</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="text-xs font-semibold text-amber-800 mb-1">4. Balasan (Replies)</div>
            <div className="text-xl font-bold text-amber-900">{totalReplies}</div>
            <div className="w-full bg-amber-200 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${replyRate}%` }} />
            </div>
            <div className="text-[11px] text-amber-700 mt-2 font-medium">{replyRate}% reply rate</div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="text-xs font-semibold text-purple-800 mb-1">5. Closing / Akad</div>
            <div className="text-xl font-bold text-purple-900">{totalConversions}</div>
            <div className="w-full bg-purple-200 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-purple-600 h-full" style={{ width: `${conversionRate}%` }} />
            </div>
            <div className="text-[11px] text-purple-700 mt-2 font-medium">{conversionRate}% conversion rate</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Campaigns & Live Inbox Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Status & Performa Campaign Terbaru</h3>
              <p className="text-xs text-slate-500">Monitoring pengiriman pesan massal secara real-time</p>
            </div>
            <button 
              onClick={() => setActiveView('campaigns')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {campaigns.slice(0, 4).map((cmp) => {
              const total = cmp.stats.total || 1;
              const sentPct = Math.min(100, Math.round((cmp.stats.sent / total) * 100));
              const readPct = cmp.stats.sent > 0 ? Math.round((cmp.stats.read / cmp.stats.sent) * 100) : 0;

              return (
                <div 
                  key={cmp.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{cmp.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cmp.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                        cmp.status === 'COMPLETED' ? 'bg-slate-100 text-slate-800' :
                        cmp.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cmp.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Segmen: <strong className="text-slate-700">{cmp.segmentName}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-slate-700">{cmp.stats.total} kontak</strong></span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${sentPct}%` }} 
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-600 shrink-0">
                        {cmp.stats.sent} / {cmp.stats.total} ({sentPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {cmp.status === 'DRAFT' && (
                      <button
                        onClick={() => sendCampaign(cmp.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <Play className="w-3 h-3" />
                        <span>Kirim Blast</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCampaignId(cmp.id);
                        setActiveView('campaigns');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Incoming Replies & Follow-Up Leads */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Respon Pelanggan Terbaru</h3>
              <p className="text-xs text-slate-500">Inbox WhatsApp & Potensi Closing</p>
            </div>
            <button
              onClick={() => setActiveView('inbox')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Inbox</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {conversations.slice(0, 4).map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveView('inbox')}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src={conv.avatar} 
                      alt={conv.contactName} 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {conv.contactName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {conv.assignedPic}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {conv.lastMessageAt}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{conv.lastMessage}"
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  {conv.tags.slice(0, 2).map((t, idx) => (
                    <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {t}
                    </span>
                  ))}
                  <span className="text-[9px] font-semibold text-slate-400 ml-auto">
                    {conv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Pipeline Summary Card */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Deal Terbuka di Pipeline:</span>
            <span className="text-xs font-extrabold text-slate-800">
              Rp {followUps.reduce((acc, f) => acc + (f.potentialValue || 0), 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
