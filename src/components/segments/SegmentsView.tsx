import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Segment, SegmentRule } from '../../types';
import { 
  Filter, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Users, 
  Send, 
  Check, 
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

export const SegmentsView: React.FC = () => {
  const { 
    segments, 
    contacts, 
    tags, 
    createSegment, 
    editSegment, 
    deleteSegment, 
    duplicateSegment, 
    filterContactsBySegment,
    setActiveView 
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [segmentToDelete, setSegmentToDelete] = useState<Segment | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [matchType, setMatchType] = useState<'ALL' | 'ANY'>('ALL');
  const [rules, setRules] = useState<SegmentRule[]>([
    { id: 'r1', field: 'product', operator: 'equals', value: 'Cicil Emas' }
  ]);

  const openCreateModal = () => {
    setEditingSegment(null);
    setName('');
    setDescription('');
    setMatchType('ALL');
    setRules([{ id: `r_${Date.now()}`, field: 'product', operator: 'equals', value: 'Cicil Emas' }]);
    setModalOpen(true);
  };

  const openEditModal = (seg: Segment) => {
    setEditingSegment(seg);
    setName(seg.name);
    setDescription(seg.description);
    setMatchType(seg.matchType);
    setRules([...seg.rules]);
    setModalOpen(true);
  };

  const addRule = () => {
    setRules(prev => [...prev, {
      id: `r_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      field: 'product',
      operator: 'equals',
      value: 'Cicil Emas'
    }]);
  };

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const updateRule = (id: string, field: keyof SegmentRule, val: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  // Preview matching count in modal
  const previewMatchingCount = filterContactsBySegment(rules, matchType).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSegment) {
      editSegment(editingSegment.id, {
        name,
        description,
        matchType,
        rules
      });
    } else {
      createSegment({
        name,
        description,
        matchType,
        rules
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Segmentasi Dinamis Audiens</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelompokkan nasabah secara presisi berdasarkan produk, wilayah, tag, riwayat interaksi, dan status opt-in.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Segment Baru</span>
        </button>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {segments.map((seg) => {
          const currentCount = filterContactsBySegment(seg.rules, seg.matchType).length;

          return (
            <div 
              key={seg.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => duplicateSegment(seg.id)}
                      className="p-1 hover:text-slate-700 rounded cursor-pointer"
                      title="Duplikasi Segment"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(seg)}
                      className="p-1 hover:text-slate-700 rounded cursor-pointer"
                      title="Edit Segment"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSegmentToDelete(seg)}
                      className="p-1 hover:text-rose-600 rounded cursor-pointer"
                      title="Hapus Segment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{seg.name}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{seg.description}</p>

                {/* Rules Badges */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Kriteria ({seg.matchType === 'ALL' ? 'AND (Semua Harus Cocok)' : 'OR (Salah Satu Cocok)'}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seg.rules.map((r, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border text-slate-700 font-mono">
                        {r.field} {r.operator === 'equals' ? '=' : r.operator === 'contains' ? 'contains' : '!='} "{r.value}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">{currentCount} Kontak</span>
                </div>

                <button
                  onClick={() => setActiveView('campaign-wizard')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Blast Campaign</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Segment Builder Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSegment ? 'Edit Segmentasi Dinamis' : 'Buat Segmentasi Dinamis Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Segment</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Nasabah Prioritas Cicil Emas Surabaya"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Target Audiens</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target penawaran margin promo akad triwulan I"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Match Type */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border">
                <span className="font-bold text-slate-700">Kombinasi Aturan:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="matchType"
                    checked={matchType === 'ALL'}
                    onChange={() => setMatchType('ALL')}
                  />
                  <span>Semua Aturan Harus Cocok (AND)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="matchType"
                    checked={matchType === 'ANY'}
                    onChange={() => setMatchType('ANY')}
                  />
                  <span>Salah Satu Aturan Cocok (OR)</span>
                </label>
              </div>

              {/* Dynamic Rules List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Daftar Kriteria Filter:</span>
                  <button
                    type="button"
                    onClick={addRule}
                    className="text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Aturan</span>
                  </button>
                </div>

                {rules.map((rule, idx) => (
                  <div key={rule.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
                      className="p-1.5 border rounded bg-white font-medium"
                    >
                      <option value="product">Produk</option>
                      <option value="region">Wilayah</option>
                      <option value="city">Kota</option>
                      <option value="customerStatus">Status Nasabah</option>
                      <option value="optInStatus">Status Opt-In</option>
                      <option value="category">Kategori</option>
                      <option value="tag">Tag</option>
                      <option value="pic">Sales PIC</option>
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                      className="p-1.5 border rounded bg-white"
                    >
                      <option value="equals">Sama Dengan (=)</option>
                      <option value="not_equals">Tidak Sama (!=)</option>
                      <option value="contains">Mengandung teks</option>
                    </select>

                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                      placeholder="Nilai kriteria..."
                      className="flex-1 p-1.5 border rounded bg-white"
                    />

                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(rule.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Matching count indicator */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between font-semibold text-emerald-900">
                <span>Estimasi Audiens Terkualifikasi:</span>
                <span className="text-sm font-black">{previewMatchingCount} Kontak</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Simpan Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Segment Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!segmentToDelete}
        onClose={() => setSegmentToDelete(null)}
        onConfirm={() => {
          if (segmentToDelete) {
            deleteSegment(segmentToDelete.id);
            setSegmentToDelete(null);
          }
        }}
        title="Hapus Segmen Audiens?"
        message={`Apakah Anda yakin ingin menghapus segmen "${segmentToDelete?.name}"? Pengelompokan aturan segmen ini akan dihapus dari web.`}
        itemName={segmentToDelete?.name}
        confirmText="Hapus Segmen"
      />
    </div>
  );
};
