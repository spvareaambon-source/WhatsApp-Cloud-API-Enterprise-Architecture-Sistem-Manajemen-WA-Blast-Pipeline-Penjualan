import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { FollowUpItem } from '../../types';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Phone, 
  User, 
  Search, 
  Filter,
  Plus,
  Trash2
} from 'lucide-react';
import { formatPhoneDisplay } from '../../utils/phoneNormalizer';

export const FollowUpView: React.FC = () => {
  const { followUps, updateFollowUpStage, deleteFollowUp, setActiveView } = useApp();

  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterPic, setFilterPic] = useState('ALL');
  const [itemToDelete, setItemToDelete] = useState<FollowUpItem | null>(null);

  const filtered = followUps.filter(f => {
    const priority = f.priority || 'HIGH';
    const matchesPriority = filterPriority === 'ALL' || priority === filterPriority;
    const matchesPic = filterPic === 'ALL' || f.pic === filterPic;
    return matchesPriority && matchesPic;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Jadwal & Agenda Follow-Up Sales</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar tugas follow-up nasabah yang merespon WhatsApp blast untuk memastikan tingkat closing maksimal.
          </p>
        </div>

        <button
          onClick={() => setActiveView('pipeline')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
        >
          <span>Buka Kanban Pipeline</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 text-xs">
        <div>
          <label className="text-slate-500 font-semibold mr-2">Filter Prioritas:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-1.5 border rounded-lg bg-slate-50"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div>
          <label className="text-slate-500 font-semibold mr-2">Sales PIC:</label>
          <select
            value={filterPic}
            onChange={(e) => setFilterPic(e.target.value)}
            className="p-1.5 border rounded-lg bg-slate-50"
          >
            <option value="ALL">Semua Petugas</option>
            <option value="Bagus Pratama">Bagus Pratama</option>
            <option value="Siti Rahmawati">Siti Rahmawati</option>
            <option value="Rudi Hartono">Rudi Hartono</option>
          </select>
        </div>
      </div>

      {/* Follow-up tasks list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-xs"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${
                  item.stage === 'CLOSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Calendar className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.contactName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      (item.priority || 'HIGH') === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.priority || 'HIGH'}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.2 rounded">
                      {item.productInterest || item.product || 'Cicil Emas'}
                    </span>
                  </div>

                  <p className="text-slate-600 mt-1 font-sans">
                    {item.notes || 'Hubungi nasabah untuk kelanjutan penawaran.'}
                  </p>

                  <div className="flex items-center gap-4 text-slate-400 text-[11px] mt-2">
                    <span>Telepon: <strong className="text-slate-700 font-mono">{formatPhoneDisplay(item.contactPhone || item.phone)}</strong></span>
                    <span>•</span>
                    <span>PIC: <strong className="text-slate-700">{item.pic}</strong></span>
                    <span>•</span>
                    <span>Tahap: <strong className="text-emerald-700 font-bold">{item.stage}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveView('inbox')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat WA</span>
                </button>

                {item.stage !== 'CLOSED' && (
                  <button
                    onClick={() => updateFollowUpStage(item.id, 'CLOSED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Closing</span>
                  </button>
                )}

                <button
                  onClick={() => setItemToDelete(item)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  title="Hapus Agenda Follow-Up"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Follow-Up Modal */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteFollowUp(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        title="Hapus Agenda Follow-Up?"
        message={`Apakah Anda yakin ingin menghapus agenda follow-up untuk nasabah "${itemToDelete?.contactName}"? Data ini akan dihapus dari web.`}
        itemName={itemToDelete ? `${itemToDelete.contactName} (${itemToDelete.productInterest || itemToDelete.product})` : undefined}
        confirmText="Hapus Follow-Up"
      />
    </div>
  );
};
