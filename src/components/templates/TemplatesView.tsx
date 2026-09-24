import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { MessageTemplate, HeaderType, TemplateCategory } from '../../types';
import { extractVariables } from '../../utils/personalization';
import { 
  FileText, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  X,
  Smartphone,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const { 
    templates, 
    createTemplate, 
    editTemplate, 
    duplicateTemplate, 
    deleteTemplate, 
    sendTestMessage 
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('MARKETING');
  const [language, setLanguage] = useState('id');
  const [headerType, setHeaderType] = useState<HeaderType>('NONE');
  const [headerContent, setHeaderContent] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [buttonsStr, setButtonsStr] = useState('Saya Tertarik, Konsultasi Petugas');

  // Test modal
  const [activeTestTemplate, setActiveTestTemplate] = useState<MessageTemplate | null>(null);
  const [testPhone, setTestPhone] = useState('081288990011');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('MARKETING');
    setLanguage('id');
    setHeaderType('NONE');
    setHeaderContent('');
    setBody('Halo Bapak/Ibu *{{nama}}*,\n\nKami memiliki program *{{produk}}* spesial untuk wilayah *{{wilayah}}*.\n\nHubungi *{{namaPetugas}}* untuk informasi lebih lanjut.\n\n_Ketik STOP untuk berhenti berlangganan._');
    setFooter('PT Pegadaian (Persero)');
    setButtonsStr('Saya Tertarik, Hubungi Sales');
    setModalOpen(true);
  };

  const openEditModal = (tpl: MessageTemplate) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setCategory(tpl.category);
    setLanguage(tpl.language);
    setHeaderType(tpl.headerType);
    setHeaderContent(tpl.headerContent || '');
    setBody(tpl.body);
    setFooter(tpl.footer || '');
    setButtonsStr(tpl.buttons.map(b => b.text).join(', '));
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const variables = extractVariables(body);
    const buttons = buttonsStr.split(',').map(s => s.trim()).filter(Boolean).map(text => ({
      type: 'QUICK_REPLY' as const,
      text
    }));

    if (editingTemplate) {
      editTemplate(editingTemplate.id, {
        name: name.toLowerCase().replace(/\s+/g, '_'),
        category,
        language,
        headerType,
        headerContent,
        body,
        footer,
        buttons,
        variables
      });
    } else {
      createTemplate({
        name: name.toLowerCase().replace(/\s+/g, '_'),
        category,
        language,
        headerType,
        headerContent,
        body,
        footer,
        buttons,
        variables,
        approvalStatus: 'APPROVED',
        qualityRating: 'GREEN'
      });
    }
    setModalOpen(false);
  };

  const insertVariable = (varName: string) => {
    setBody(prev => `${prev} {{${varName}}}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WhatsApp Message Templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Template resmi yang disetujui oleh Meta Business Platform dengan dukungan parameter dinamis dan tombol interaktif.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Template Baru</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => {
          return (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition-all"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{tpl.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">
                      {tpl.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Bahasa: {tpl.language} • {tpl.variables.length} variabel
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicateTemplate(tpl.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    title="Duplikasi"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(tpl)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTemplateToDelete(tpl)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Realistic WhatsApp Bubble Mockup */}
              <div className="p-4 flex-1 bg-slate-100/70 flex items-center justify-center">
                <div className="w-full bg-[#E7FFDB] p-3.5 rounded-2xl rounded-tl-xs shadow-xs border border-emerald-100 text-xs text-slate-900 space-y-2">
                  {tpl.headerContent && (
                    <div className="font-bold text-slate-900 pb-1 border-b border-emerald-200/50">
                      {tpl.headerContent}
                    </div>
                  )}

                  <div className="whitespace-pre-line text-slate-800 leading-relaxed font-sans">
                    {tpl.body}
                  </div>

                  {tpl.footer && (
                    <div className="text-[10px] text-slate-500 pt-1">
                      {tpl.footer}
                    </div>
                  )}

                  {/* WhatsApp Quick Reply Buttons */}
                  {tpl.buttons && tpl.buttons.length > 0 && (
                    <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                      {tpl.buttons.map((btn, bIdx) => (
                        <div
                          key={bIdx}
                          className="bg-white/90 hover:bg-white text-emerald-800 text-[11px] font-semibold text-center py-1.5 rounded-lg shadow-2xs border border-emerald-200 cursor-pointer"
                        >
                          {btn.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Approval & Test Button Footer */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">
                    {tpl.approvalStatus} (Meta)
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTestTemplate(tpl);
                    setTestResult(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Kirim Tes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTemplate ? 'Edit Template WhatsApp' : 'Buat Template WhatsApp Resmi'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Template (Snake_case)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="promo_emas_berkah"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Meta</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  >
                    <option value="MARKETING">MARKETING (Promosi & Penawaran)</option>
                    <option value="UTILITY">UTILITY (Pemberitahuan Transaksi)</option>
                    <option value="AUTHENTICATION">AUTHENTICATION (OTP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Header Teks (Opsional)</label>
                <input
                  type="text"
                  value={headerContent}
                  onChange={(e) => {
                    setHeaderContent(e.target.value);
                    setHeaderType(e.target.value ? 'TEXT' : 'NONE');
                  }}
                  placeholder="Spesial Penawaran Hari Ini ✨"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Body Pesan (Wajib)</label>
                  <span className="text-[11px] text-slate-400">{body.length} / 1024 karakter</span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 border rounded-lg font-sans focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                {/* Variable quick buttons */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Sisipkan Variabel:</span>
                  {['nama', 'produk', 'wilayah', 'namaPetugas', 'tanggal', 'namaUsaha'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-[10px] border border-emerald-200"
                    >
                      +{`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Footer Teks (Opsional)</label>
                <input
                  type="text"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="PT Pegadaian (Persero) - Terdaftar & Diawasi OJK"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tombol Quick Reply (Pisahkan koma)</label>
                <input
                  type="text"
                  value={buttonsStr}
                  onChange={(e) => setButtonsStr(e.target.value)}
                  placeholder="Saya Tertarik, Konsultasi PIC"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
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
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Message Modal */}
      {activeTestTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Tes Template "{activeTestTemplate.name}"</h3>
              <button onClick={() => setActiveTestTemplate(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Penerima</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                  placeholder="0812xxxxxxxx"
                />
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-lg ${testResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  {testResult.message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setActiveTestTemplate(null)} className="px-3 py-1.5 text-slate-600">
                  Tutup
                </button>
                <button
                  onClick={async () => {
                    const res = await sendTestMessage(testPhone, activeTestTemplate.id);
                    setTestResult(res);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Kirim Uji Coba
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => {
          if (templateToDelete) {
            deleteTemplate(templateToDelete.id);
            setTemplateToDelete(null);
          }
        }}
        title="Hapus Template Pesan WhatsApp?"
        message={`Apakah Anda yakin ingin menghapus template "${templateToDelete?.name}"? Template ini tidak akan dapat digunakan lagi untuk broadcast blast baru.`}
        itemName={templateToDelete?.name}
        confirmText="Hapus Template"
      />
    </div>
  );
};
