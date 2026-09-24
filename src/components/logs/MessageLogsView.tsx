import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { formatPhoneDisplay } from '../../utils/phoneNormalizer';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Eye, 
  FileSpreadsheet,
  X,
  Trash2
} from 'lucide-react';

export const MessageLogsView: React.FC = () => {
  const { messageLogs, campaigns, deleteMessageLog, clearMessageLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [campaignFilter, setCampaignFilter] = useState('ALL');
  const [logToDelete, setLogToDelete] = useState<any | null>(null);
  const [showClearLogsModal, setShowClearLogsModal] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [selectedLogPayload, setSelectedLogPayload] = useState<any | null>(null);

  const filteredLogs = useMemo(() => {
    return messageLogs.filter(l => {
      const p = l.contactPhone || l.phone || '';
      const matchesSearch = 
        l.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.includes(searchTerm) ||
        (l.wamid && l.wamid.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const matchesCampaign = campaignFilter === 'ALL' || l.campaignId === campaignFilter;

      return matchesSearch && matchesStatus && matchesCampaign;
    }).sort((a, b) => new Date(b.sentAt || b.queuedAt).getTime() - new Date(a.sentAt || a.queuedAt).getTime());
  }, [messageLogs, searchTerm, statusFilter, campaignFilter]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    const headers = ['WAMID', 'Campaign_ID', 'Nama', 'Nomor_WA', 'Status', 'Sent_At', 'Delivered_At', 'Read_At', 'Error_Code'];
    const rows = filteredLogs.map(l => [
      `"${l.wamid || ''}"`,
      `"${l.campaignId}"`,
      `"${l.contactName}"`,
      `"${l.contactPhone || l.phone}"`,
      l.status,
      l.sentAt || '',
      l.deliveredAt || '',
      l.readAt || '',
      `"${l.errorCode || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `delivery_tracking_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Delivery Tracking & Message Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit rincian pengiriman WhatsApp Business Cloud API per pesan dengan WAMID unik dan timestamp webhook Meta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messageLogs.length > 0 && (
            <button
              onClick={() => setShowClearLogsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Semua Log</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Logs (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama nasabah, nomor WA, atau WAMID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="READ">READ (Dibaca)</option>
            <option value="DELIVERED">DELIVERED (Diterima)</option>
            <option value="SENT">SENT (Terkirim)</option>
            <option value="QUEUED">QUEUED (Antrean)</option>
            <option value="FAILED">FAILED (Gagal)</option>
          </select>
        </div>

        <div>
          <select
            value={campaignFilter}
            onChange={(e) => { setCampaignFilter(e.target.value); setPage(1); }}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Semua Campaign</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">WAMID Meta</th>
                <th className="py-3 px-3">Nasabah</th>
                <th className="py-3 px-3">Nomor WhatsApp</th>
                <th className="py-3 px-3">Campaign</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Waktu Terkirim</th>
                <th className="py-3 px-3">Diterima / Dibaca</th>
                <th className="py-3 px-3">Error / Catatan</th>
                <th className="py-3 px-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[130px]">
                      {log.wamid || 'WAMID_SIMULATED'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{log.contactName}</td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-700">{formatPhoneDisplay(log.contactPhone || log.phone)}</td>
                    <td className="py-3 px-3 text-slate-700 truncate max-w-[140px]">
                      {campaigns.find(c => c.id === log.campaignId)?.name || 'Campaign'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'READ' ? 'bg-blue-100 text-blue-800' :
                        log.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'SENT' ? 'bg-slate-100 text-slate-800' :
                        log.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {log.sentAt ? new Date(log.sentAt).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {log.readAt ? `Read: ${new Date(log.readAt).toLocaleTimeString('id-ID')}` :
                       log.deliveredAt ? `Delivered: ${new Date(log.deliveredAt).toLocaleTimeString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {log.errorMessage || (log.errorCode ? `Err Code: ${log.errorCode}` : '✓ Success')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedLogPayload(log)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Lihat Raw Payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setLogToDelete(log)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Hapus Log Pesan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Tidak ada log pesan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan <strong>{Math.min(filteredLogs.length, (page - 1) * pageSize + 1)}</strong> - <strong>{Math.min(filteredLogs.length, page * pageSize)}</strong> dari <strong>{filteredLogs.length}</strong> log
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 font-semibold text-slate-800">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Raw Message Log Drawer */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Rincian Payload WhatsApp Cloud API</h3>
              <button onClick={() => setSelectedLogPayload(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border font-mono text-[11px] overflow-x-auto max-h-60">
                <pre>{JSON.stringify(selectedLogPayload, null, 2)}</pre>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-900 text-[11px]">
                💡 Payload ini merupakan format resmi yang diterima dari Meta Graph API Webhook (/api/webhooks/whatsapp).
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t mt-4">
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Message Log Modal */}
      <ConfirmDeleteModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={() => {
          if (logToDelete) {
            deleteMessageLog(logToDelete.id);
            setLogToDelete(null);
          }
        }}
        title="Hapus Log Pesan WhatsApp?"
        message={`Apakah Anda yakin ingin menghapus data log pesan untuk "${logToDelete?.contactName}" (${logToDelete?.contactPhone || logToDelete?.phone})? Data ini akan dihapus dari web.`}
        itemName={logToDelete?.wamid ? `WAMID: ${logToDelete.wamid}` : logToDelete?.contactName}
        confirmText="Hapus Log"
      />

      {/* Clear All Logs Modal */}
      <ConfirmDeleteModal
        isOpen={showClearLogsModal}
        onClose={() => setShowClearLogsModal(false)}
        onConfirm={() => {
          clearMessageLogs();
          setShowClearLogsModal(false);
          setPage(1);
        }}
        title="Bersihkan Semua Log Pengiriman?"
        message={`Tindakan ini akan menghapus seluruh ${messageLogs.length} riwayat log pengiriman dan tracking WhatsApp dari sistem web. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Seluruh Log"
      />
    </div>
  );
};
