import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Tag } from '../../types';
import { Tag as TagIcon, Plus, Trash2, Users, Check, X } from 'lucide-react';

export const TagsView: React.FC = () => {
  const { tags, contacts, createTag, deleteTag } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');
  const [category, setCategory] = useState('Priority');

  // Compute live count per tag
  const tagCounts = tags.reduce((acc, t) => {
    acc[t.name] = contacts.filter(c => c.tags.includes(t.name)).length;
    return acc;
  }, {} as Record<string, number>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTag({
      name: name.trim().toUpperCase(),
      color,
      category
    });
    setName('');
    setModalOpen(false);
  };

  const presetColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Tag & Label Nasabah</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tag operasional untuk klasifikasi prospek, tahapan sales, dan preferensi produk.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tag Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {tags.map((tag) => {
          const count = tagCounts[tag.name] || 0;

          return (
            <div
              key={tag.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shrink-0 shadow-xs" 
                  style={{ backgroundColor: tag.color }} 
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{tag.name}</div>
                  <div className="text-[10px] text-slate-400">{tag.category || 'General'} • {count} nasabah</div>
                </div>
              </div>

              <button
                onClick={() => setTagToDelete(tag)}
                className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer"
                title={`Hapus tag ${tag.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Tag Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Tag</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PROMO RAMADHAN"
                  className="w-full px-3 py-2 border rounded-lg uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                >
                  <option value="Priority">Priority (HOT, WARM, COLD)</option>
                  <option value="Product">Product (CICIL EMAS, GADAI)</option>
                  <option value="Action">Action (FOLLOW UP, TOP UP)</option>
                  <option value="Tier">Tier (PRIORITAS, UMKM)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Pilih Warna Tag</label>
                <div className="flex items-center gap-2">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-slate-800' : 'opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tag Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => {
          if (tagToDelete) {
            deleteTag(tagToDelete.id);
            setTagToDelete(null);
          }
        }}
        title="Hapus Tag Nasabah?"
        message={`Apakah Anda yakin ingin menghapus tag "${tagToDelete?.name}"? Label ini akan dihapus dari daftar master tag.`}
        itemName={tagToDelete?.name}
        confirmText="Hapus Tag"
      />
    </div>
  );
};
