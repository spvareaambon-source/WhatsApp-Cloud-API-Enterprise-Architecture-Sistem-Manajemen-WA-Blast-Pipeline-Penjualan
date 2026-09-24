import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { FollowUpItem, LeadStage } from '../../types';
import { 
  Kanban, 
  Plus, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  X,
  Phone,
  Trash2
} from 'lucide-react';
import { formatPhoneDisplay } from '../../utils/phoneNormalizer';

export const SalesPipelineView: React.FC = () => {
  const { followUps, updateFollowUpStage, deleteFollowUp, addFollowUp, contacts } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<FollowUpItem | null>(null);
  const [selectedContactPhone, setSelectedContactPhone] = useState(contacts[0]?.phone || '');
  const [dealValue, setDealValue] = useState(25000000);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [notes, setNotes] = useState('Minat akad cicil emas batangan 10 gram');
  const [dueDate, setDueDate] = useState('2026-09-28');

  const stages: { id: LeadStage; title: string; color: string }[] = [
    { id: 'NEW', title: 'New Leads', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'CONTACTED', title: 'Contacted', color: 'bg-sky-50 text-sky-800 border-sky-200' },
    { id: 'INTERESTED', title: 'Interested', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'FOLLOW_UP', title: 'Follow-Up', color: 'bg-orange-50 text-orange-800 border-orange-200' },
    { id: 'NEGOTIATION', title: 'Negotiation', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { id: 'CLOSED', title: 'Closed / Won', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
  ];

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.phone === selectedContactPhone);
    if (!contact) return;

    addFollowUp({
      contactId: contact.id,
      contactName: contact.name,
      phone: contact.phone,
      productInterest: contact.product,
      pic: contact.pic,
      stage: 'NEW',
      priority,
      potentialValue: dealValue,
      notes,
      dueDate,
      followUpDate: dueDate,
      nextAction: 'Hubungi nasabah'
    });

    setModalOpen(false);
  };

  const getNextStage = (current: LeadStage): LeadStage | null => {
    const order: LeadStage[] = ['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'NEGOTIATION', 'CLOSED'];
    const idx = order.indexOf(current);
    if (idx < order.length - 1) return order[idx + 1];
    return null;
  };

  const getPrevStage = (current: LeadStage): LeadStage | null => {
    const order: LeadStage[] = ['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'NEGOTIATION', 'CLOSED'];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sales Pipeline & Lead Tracking</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Papan Kanban konversi sales dari balasan pesan WhatsApp blast hingga akad transaksi resmi.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lead Baru</span>
        </button>
      </div>

      {/* Kanban Board Container (6 Stages Horizontal Scroll) */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {stages.map((stage) => {
          const items = followUps.filter(f => f.stage === stage.id);
          const totalValue = items.reduce((acc, it) => acc + (it.potentialValue || 0), 0);

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col max-h-[calc(100vh-210px)]"
            >
              {/* Stage Header */}
              <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900">{stage.title}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                      {items.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Rp {totalValue.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {items.length > 0 ? (
                  items.map((item) => {
                    const prev = getPrevStage(item.stage);
                    const next = getNextStage(item.stage);

                    return (
                      <div
                        key={item.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900 leading-tight">{item.contactName}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            (item.priority || 'HIGH') === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            item.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.priority || 'HIGH'}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-slate-500">
                          {formatPhoneDisplay(item.contactPhone || item.phone)}
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                            {item.productInterest || item.product || 'Cicil Emas'}
                          </span>
                          <span className="font-bold text-slate-800">
                            Rp {(item.potentialValue || 0).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                            "{item.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>PIC: <strong>{item.pic}</strong></span>
                          {item.dueDate && <span>Due: {item.dueDate}</span>}
                        </div>

                        {/* Stage Mover Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {prev && (
                              <button
                                onClick={() => updateFollowUpStage(item.id, prev)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 flex items-center gap-0.5 text-[10px]"
                                title={`Pindah mundur ke ${prev}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Mundur</span>
                              </button>
                            )}

                            <button
                              onClick={() => setLeadToDelete(item)}
                              className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                              title="Hapus lead dari pipeline"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {next ? (
                            <button
                              onClick={() => updateFollowUpStage(item.id, next)}
                              className="p-1 hover:bg-emerald-50 rounded text-emerald-700 font-bold flex items-center gap-0.5 text-[10px]"
                              title={`Lanjut ke ${next}`}
                            >
                              <span>Lanjut</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[10px]">✓ Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    Belum ada lead di tahap ini.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Lead */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Lead ke Pipeline Sales</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Nasabah dari Kontak</label>
                <select
                  value={selectedContactPhone}
                  onChange={(e) => setSelectedContactPhone(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.phone}>
                      {c.name} ({c.phone}) - {c.product}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Potensi Nilai Deal (Rp)</label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Tanggal Akad</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Follow-up Sales</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Kebutuhan nasabah, simulasi pembiayaan, dsb."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan ke Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={() => {
          if (leadToDelete) {
            deleteFollowUp(leadToDelete.id);
            setLeadToDelete(null);
          }
        }}
        title="Hapus Lead dari Pipeline?"
        message={`Apakah Anda yakin ingin menghapus lead "${leadToDelete?.contactName}" dari tahap ${leadToDelete?.stage}? Data peluang ini akan dihapus dari web.`}
        itemName={leadToDelete ? `${leadToDelete.contactName} - Rp ${(leadToDelete.potentialValue || 0).toLocaleString('id-ID')}` : undefined}
        confirmText="Hapus Lead"
      />
    </div>
  );
};
