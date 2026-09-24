import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { SuppressionItem } from '../../types';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  X,
  Phone
} from 'lucide-react';
import { formatPhoneDisplay, normalizeWhatsAppNumber } from '../../utils/phoneNormalizer';

export const SuppressionView: React.FC = () => {
  const { suppressionList, addToSuppressionList, removeFromSuppressionList } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SuppressionItem | null>(null);
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState<SuppressionItem['reason']>('OPT_OUT');
  const [notes, setNotes] = useState('Permintaan nasabah via chat');

  const filtered = suppressionList.filter(s => 
    s.phone.includes(searchTerm) || (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const norm = normalizeWhatsAppNumber(phone);
    if (!norm.isValid) {
      alert('Format nomor tidak valid');
      return;
    }

    addToSuppressionList(norm.normalized, reason, notes);
    setPhone('');
    setNotes('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Suppression List (Daftar Pengecualian)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar proteksi nomor yang diblokir otomatis dari seluruh blast campaign demi mematuhi regulasi privasi & perlindungan nomor dari penalti Meta.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Nomor ke Suppression</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-3 text-xs text-rose-950">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Perlindungan Akun WhatsApp Business Otomatis</h4>
          <p className="opacity-90 mt-0.5">
            Setiap nomor di daftar ini akan otomatis dikecualikan (ditekan) saat wizard campaign memfilter audiens. Pesan tidak akan pernah dikirimkan ke nomor-nomor ini.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor tertekan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border rounded-lg focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} nomor terdaftar</span>
        </div>

        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b">
            <tr>
              <th className="p-3">Nomor WhatsApp</th>
              <th className="p-3">Alasan Suppression</th>
              <th className="p-3">Catatan</th>
              <th className="p-3">Tanggal Ditambahkan</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-slate-900">
                  {formatPhoneDisplay(item.phone)}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.reason === 'OPT_OUT' ? 'bg-amber-100 text-amber-800' :
                    item.reason === 'SPAM_COMPLAINT' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.reason}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{item.notes || '-'}</td>
                <td className="p-3 text-slate-500">{new Date(item.addedAt).toLocaleDateString('id-ID')}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Hapus dari daftar blokir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 text-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Tambah ke Suppression List</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Pengecualian</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                >
                  <option value="OPT_OUT">Permintaan Nasabah (Opt-Out)</option>
                  <option value="INVALID_NUMBER">Nomor Tidak Valid / Tidak Aktif</option>
                  <option value="SPAM_COMPLAINT">Keluhan Spam Nasabah</option>
                  <option value="MANUAL">Blokir Manual Internal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Permintaan berhenti kirim info"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg">
                  Simpan ke Daftar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Suppression Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            removeFromSuppressionList(itemToDelete.phone);
            setItemToDelete(null);
          }
        }}
        title="Hapus Nomor dari Suppression List?"
        message={`Apakah Anda yakin ingin menghapus nomor ${formatPhoneDisplay(itemToDelete?.phone || '')} dari daftar blokir/suppression? Nomor ini akan dapat menerima blast pesan kembali.`}
        itemName={itemToDelete ? formatPhoneDisplay(itemToDelete.phone) : undefined}
        confirmText="Hapus dari Blokir"
      />
    </div>
  );
};
