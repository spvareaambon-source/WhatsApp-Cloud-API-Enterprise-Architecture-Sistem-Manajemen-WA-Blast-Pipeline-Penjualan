import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  CheckCheck, 
  Send, 
  Eye, 
  MessageSquare, 
  DollarSign,
  PieChart
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { campaigns, contacts, messageLogs, conversations, followUps } = useApp();

  const totalSent = messageLogs.filter(m => ['SENT', 'DELIVERED', 'READ'].includes(m.status)).length;
  const totalDelivered = messageLogs.filter(m => ['DELIVERED', 'READ'].includes(m.status)).length;
  const totalRead = messageLogs.filter(m => m.status === 'READ').length;
  const totalFailed = messageLogs.filter(m => m.status === 'FAILED').length;
  const totalReplies = conversations.reduce((acc, c) => acc + c.messages.filter(m => m.sender === 'CUSTOMER').length, 0);
  const totalClosed = followUps.filter(f => f.stage === 'CLOSED').length;
  const totalClosedValue = followUps.filter(f => f.stage === 'CLOSED').reduce((a, b) => a + (b.potentialValue || 0), 0);

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
  const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0';
  const replyRate = totalRead > 0 ? ((totalReplies / totalRead) * 100).toFixed(1) : '0';
  const conversionRate = totalSent > 0 ? ((totalClosed / totalSent) * 100).toFixed(1) : '0';

  // Group by Product
  const productStats = contacts.reduce((acc, c) => {
    if (!acc[c.product]) acc[c.product] = { contacts: 0, closed: 0 };
    acc[c.product].contacts++;
    return acc;
  }, {} as Record<string, { contacts: number; closed: number }>);

  followUps.filter(f => f.stage === 'CLOSED').forEach(f => {
    const prod = f.productInterest || f.product || 'Cicil Emas';
    if (productStats[prod]) productStats[prod].closed++;
  });

  const handleExportReport = () => {
    const lines = [
      'METRIK_LAPORAN,NILAI',
      `Total_Pesan_Terkirim,${totalSent}`,
      `Total_Pesan_Delivered,${totalDelivered}`,
      `Delivery_Rate,${deliveryRate}%`,
      `Total_Pesan_Read,${totalRead}`,
      `Read_Rate,${readRate}%`,
      `Total_Balasan_Pelanggan,${totalReplies}`,
      `Reply_Rate,${replyRate}%`,
      `Total_Deal_Closed,${totalClosed}`,
      `Conversion_Rate,${conversionRate}%`,
      `Total_Nominal_Closing_Rp,${totalClosedValue}`
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `ringkasan_performa_wa_blast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Laporan & Analitik Efektivitas WA Blast</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis komprehensif tingkat keterkiriman pesan resmi, engagement, dan kontribusi konversi omset penjualan.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Laporan Lengkap (CSV)</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Rata-Rata Delivery Rate</span>
            <CheckCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{deliveryRate}%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Standar resmi Meta Enterprise</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Rata-Rata Read Rate</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{readRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">{totalRead} dari {totalDelivered} pesan terbaca</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Rasio Balasan (Reply)</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{replyRate}%</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">{totalReplies} percakapan dua arah</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Omset Closing Terwujud</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-900">
            Rp {totalClosedValue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-1">{totalClosed} transaksi akad disetujui</p>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Performa Berdasarkan Campaign</h3>
        <p className="text-xs text-slate-500 mb-4">Efisiensi pengiriman dan konversi deal per campaign</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b">
              <tr>
                <th className="p-3">Nama Campaign</th>
                <th className="p-3">Segmen Audiens</th>
                <th className="p-3">Target</th>
                <th className="p-3">Terkirim</th>
                <th className="p-3">Delivered</th>
                <th className="p-3">Read Rate</th>
                <th className="p-3">Replies</th>
                <th className="p-3">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => {
                const total = c.stats.total || 1;
                const dRate = c.stats.sent > 0 ? ((c.stats.delivered / c.stats.sent) * 100).toFixed(0) : '0';
                const rRate = c.stats.delivered > 0 ? ((c.stats.read / c.stats.delivered) * 100).toFixed(0) : '0';

                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 text-slate-600">{c.segmentName}</td>
                    <td className="p-3 text-slate-800">{c.stats.total}</td>
                    <td className="p-3 text-slate-800 font-semibold">{c.stats.sent}</td>
                    <td className="p-3 text-emerald-800">{c.stats.delivered} ({dRate}%)</td>
                    <td className="p-3 text-blue-800">{c.stats.read} ({rRate}%)</td>
                    <td className="p-3 text-amber-800 font-semibold">{c.stats.replied}</td>
                    <td className="p-3 text-purple-800 font-bold">{c.stats.conversion ?? c.stats.converted ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Contribution breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Performa Berdasarkan Portofolio Produk</h3>
        <p className="text-xs text-slate-500 mb-4">Distribusi basis audiens nasabah vs closing deal per produk</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {Object.entries(productStats).map(([prod, data]) => (
            <div key={prod} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">{prod}</div>
              <div className="flex justify-between text-slate-600">
                <span>Database Nasabah:</span>
                <strong>{data.contacts} kontak</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Closing Akad:</span>
                <strong className="text-emerald-700">{data.closed} akad</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
