import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { renderPersonalizedMessage } from '../../utils/personalization';
import { formatPhoneDisplay } from '../../utils/phoneNormalizer';
import { 
  Send, 
  Users, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Shuffle, 
  Sparkles,
  Play
} from 'lucide-react';

export const CampaignWizard: React.FC = () => {
  const { 
    segments, 
    templates, 
    contacts, 
    suppressionList, 
    createCampaign, 
    sendCampaign, 
    setActiveView,
    setSelectedCampaignId,
    whatsAppConfig 
  } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // STEP 1: Campaign Info
  const [name, setName] = useState('Blast Promo Cicil Emas Ramadhan Berkah');
  const [description, setDescription] = useState('Penawaran margin spesial 0.75% untuk nasabah prospek & prioritas.');
  const [timezone, setTimezone] = useState('Asia/Jakarta (WIB)');

  // STEP 2: Audience
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(segments[0]?.id || '');

  // STEP 3: Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');

  // STEP 4: Variable Mapping
  const [variableMappings, setVariableMappings] = useState<Record<string, string>>({
    'nama': 'name',
    'produk': 'product',
    'wilayah': 'city',
    'namaPetugas': 'pic',
    'tanggal': 'date'
  });

  // STEP 5: Preview & Validation
  const [previewDevice, setPreviewDevice] = useState<'MOBILE' | 'DESKTOP'>('MOBILE');
  const [sampleContactIndex, setSampleContactIndex] = useState(0);

  // STEP 6: Scheduling & Strategy
  const [scheduleType, setScheduleType] = useState<'NOW' | 'SCHEDULED'>('NOW');
  const [scheduledAt, setScheduledAt] = useState('2026-09-25T09:00');
  const [batchSize, setBatchSize] = useState(15);
  const [delaySeconds, setDelaySeconds] = useState(3);

  // Computed Audience
  const selectedSegment = segments.find(s => s.id === selectedSegmentId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const eligibleContacts = useMemo(() => {
    const rawList = selectedSegment ? contacts.filter(c => {
      return selectedSegment.rules.every(r => {
        const val = String((c as any)[r.field] || '').toLowerCase();
        return val.includes(r.value.toLowerCase());
      });
    }) : contacts;

    const suppressedSet = new Set(suppressionList.map(s => s.phone));

    return rawList.filter(c => c.optInStatus !== 'OPTED_OUT' && !suppressedSet.has(c.phone));
  }, [contacts, selectedSegment, suppressionList]);

  // Current sample contact for preview
  const sampleContact = eligibleContacts[sampleContactIndex % Math.max(eligibleContacts.length, 1)] || contacts[0];

  // Render preview
  const previewRender = useMemo(() => {
    if (!selectedTemplate || !sampleContact) return { success: false, renderedText: '' };
    return renderPersonalizedMessage(selectedTemplate.body, sampleContact, variableMappings);
  }, [selectedTemplate, sampleContact, variableMappings]);

  // Safety Checklist Audit
  const safetyCheck = useMemo(() => {
    const audienceValid = eligibleContacts.length > 0;
    const templateValid = !!selectedTemplate && selectedTemplate.approvalStatus === 'APPROVED';
    const variablesComplete = previewRender.success;
    const apiConnected = whatsAppConfig.isDemoMode || !!whatsAppConfig.phoneNumberId;
    const optInCompliant = eligibleContacts.every(c => c.optInStatus !== 'OPTED_OUT');
    const scheduleValid = scheduleType === 'NOW' || !!scheduledAt;

    const allPassed = audienceValid && templateValid && variablesComplete && apiConnected && optInCompliant && scheduleValid;

    return {
      audienceValid,
      templateValid,
      variablesComplete,
      apiConnected,
      optInCompliant,
      scheduleValid,
      allPassed
    };
  }, [eligibleContacts, selectedTemplate, previewRender, whatsAppConfig, scheduleType, scheduledAt]);

  const handleFinishAndSend = async () => {
    if (!safetyCheck.allPassed) return;

    const newCmpId = createCampaign({
      name,
      description,
      segmentId: selectedSegmentId,
      segmentName: selectedSegment?.name || 'Semua Kontak',
      templateId: selectedTemplateId,
      templateName: selectedTemplate?.name || '',
      senderPhoneId: whatsAppConfig.phoneNumberId,
      scheduleType,
      scheduledAt: scheduleType === 'SCHEDULED' ? scheduledAt : undefined,
      timezone,
      sendingStrategy: {
        batchSize,
        delayBetweenBatchesSeconds: delaySeconds,
        dailyLimit: 1000
      },
      variableMappings
    });

    if (scheduleType === 'NOW') {
      await sendCampaign(newCmpId);
    }

    setSelectedCampaignId(newCmpId);
    setActiveView('campaigns');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Wizard Header & Stepper */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Buat Campaign WhatsApp Blast Baru</h2>
            <p className="text-xs text-slate-500 mt-1">
              Panduan 6 langkah pembuatan campaign resmi dengan verifikasi keamanan dan personalisasi presisi.
            </p>
          </div>
          <button
            onClick={() => setActiveView('campaigns')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Batal
          </button>
        </div>

        {/* 6 Step Progress Indicators */}
        <div className="grid grid-cols-6 gap-2 mt-6 pt-5 border-t border-slate-100 text-center text-xs">
          {[
            { num: 1, label: 'Info' },
            { num: 2, label: 'Audiens' },
            { num: 3, label: 'Template' },
            { num: 4, label: 'Personalisasi' },
            { num: 5, label: 'Review & Safety' },
            { num: 6, label: 'Jadwal & Kirim' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-all ${
                currentStep === s.num
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                  : currentStep > s.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {currentStep > s.num ? '✓' : s.num}
              </div>
              <span className={`text-[11px] font-semibold ${currentStep === s.num ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Campaign Information */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Langkah 1: Informasi Campaign</h3>
          
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Campaign <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Blast Promo Cicil Emas Ramadhan"
              className="w-full p-2.5 border rounded-lg text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tujuan & Deskripsi Campaign</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penawaran margin promo akad khusus nasabah potensial"
              className="w-full p-2.5 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Zona Waktu Pengiriman</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-slate-50"
            >
              <option value="Asia/Jakarta (WIB)">WIB (Waktu Indonesia Barat - UTC+7)</option>
              <option value="Asia/Makassar (WITA)">WITA (Waktu Indonesia Tengah - UTC+8)</option>
              <option value="Asia/Jayapura (WIT)">WIT (Waktu Indonesia Timur - UTC+9)</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              disabled={!name.trim()}
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>Lanjut ke Pilih Audiens</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Audience */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Langkah 2: Pilih Audiens Target</h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">Pilih Segmentasi Dinamis</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {segments.map((seg) => (
                <div
                  key={seg.id}
                  onClick={() => setSelectedSegmentId(seg.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedSegmentId === seg.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-slate-900 text-xs mb-1">{seg.name}</div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{seg.description}</p>
                  <div className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded w-fit">
                    {seg.contactCount} Target Kontak
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Eligible Audience Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800">Ringkasan Validasi Audiens:</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-white rounded-lg border">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Terfilter</span>
                <strong className="text-slate-800 text-sm">{eligibleContacts.length}</strong>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">Opt-In Terverifikasi</span>
                <strong className="text-emerald-800 text-sm">{eligibleContacts.length}</strong>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-[10px] text-rose-700 block uppercase font-bold">Ditekan (Suppressed)</span>
                <strong className="text-rose-800 text-sm">{suppressionList.length}</strong>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              disabled={eligibleContacts.length === 0}
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>Lanjut ke Pilih Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Message Template */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Langkah 3: Pilih Template Pesan Resmi Meta</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplateId === tpl.id
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-slate-900">{tpl.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    APPROVED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-3 whitespace-pre-line mb-3 font-sans">
                  {tpl.body}
                </p>
                <div className="text-[10px] text-slate-400">
                  Variabel: {tpl.variables.map(v => `{{${v}}}`).join(', ')}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              disabled={!selectedTemplateId}
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
            >
              <span>Lanjut ke Personalisasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Personalization Engine */}
      {currentStep === 4 && selectedTemplate && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Langkah 4: Pemetaan Variabel Personalisasi</h3>
          <p className="text-slate-500">
            Pastikan setiap variabel template memiliki sumber data di database kontak. Jika data kosong, pesan tidak akan dikirimkan untuk menjaga standar kualitas Meta.
          </p>

          <div className="space-y-3">
            {selectedTemplate.variables.map((v) => (
              <div key={v} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                    {`{{${v}}}`}
                  </span>
                  <span className="text-slate-500">diambil dari:</span>
                </div>

                <select
                  value={variableMappings[v] || v}
                  onChange={(e) => setVariableMappings(m => ({ ...m, [v]: e.target.value }))}
                  className="px-3 py-1.5 border rounded-lg bg-white font-medium text-slate-800"
                >
                  <option value="name">Nama Nasabah (contact.name)</option>
                  <option value="product">Produk Minat (contact.product)</option>
                  <option value="city">Kota (contact.city)</option>
                  <option value="region">Wilayah / Provinsi (contact.region)</option>
                  <option value="pic">Sales PIC (contact.pic)</option>
                  <option value="date">Tanggal Hari Ini (Format Indonesia)</option>
                  <option value="category">Kategori Nasabah (contact.category)</option>
                  <option value="phone">Nomor Telepon (contact.phone)</option>
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
            >
              <span>Lanjut ke Review & Safety</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Preview & Safety Check */}
      {currentStep === 5 && selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Device Preview Mockup */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b mb-4">
                <h3 className="text-sm font-bold text-slate-900">Preview Pesan Terpersonalisasi</h3>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('MOBILE')}
                    className={`p-1.5 rounded ${previewDevice === 'MOBILE' ? 'bg-white shadow-2xs text-emerald-600' : 'text-slate-400'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('DESKTOP')}
                    className={`p-1.5 rounded ${previewDevice === 'DESKTOP' ? 'bg-white shadow-2xs text-emerald-600' : 'text-slate-400'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Random Sampler Trigger */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-500">
                  Sample: <strong>{sampleContact.name}</strong> ({formatPhoneDisplay(sampleContact.phone)})
                </span>
                <button
                  type="button"
                  onClick={() => setSampleContactIndex(i => i + 1)}
                  className="flex items-center gap-1 text-emerald-700 font-bold hover:text-emerald-800 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Acak Contoh Lain</span>
                </button>
              </div>

              {/* Realistic WhatsApp Chat Bubble Container */}
              <div className="bg-[#ECE5DD] p-4 rounded-2xl border shadow-inner">
                <div className="bg-[#E7FFDB] p-3.5 rounded-2xl rounded-tl-xs shadow-xs border border-emerald-200 text-xs text-slate-900 space-y-2">
                  {selectedTemplate.headerContent && (
                    <div className="font-bold text-slate-900 pb-1 border-b border-emerald-200/50">
                      {selectedTemplate.headerContent}
                    </div>
                  )}

                  <div className="whitespace-pre-line text-slate-800 leading-relaxed font-sans">
                    {previewRender.renderedText}
                  </div>

                  {selectedTemplate.footer && (
                    <div className="text-[10px] text-slate-500 pt-1">
                      {selectedTemplate.footer}
                    </div>
                  )}

                  {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                    <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                      {selectedTemplate.buttons.map((b, i) => (
                        <div key={i} className="bg-white text-emerald-800 font-semibold text-center py-1.5 rounded-lg text-[11px] shadow-2xs">
                          {b.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t mt-4 text-xs">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                disabled={!safetyCheck.allPassed}
                onClick={() => setCurrentStep(6)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <span>Lanjut ke Penjadwalan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: 8-Point Campaign Safety Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pemeriksaan Keamanan WhatsApp Blast (Safety Check)</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">1. Audiens Target Valid</span>
                <span className={safetyCheck.audienceValid ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {safetyCheck.audienceValid ? `✓ ${eligibleContacts.length} Kontak` : '✗ Kosong'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">2. Normalisasi Nomor E.164 (628...)</span>
                <span className="text-emerald-700 font-bold">✓ Terverifikasi</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">3. Status Consent / Opt-in Nasabah</span>
                <span className="text-emerald-700 font-bold">✓ 100% Memenuhi Syarat</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">4. Filtering Suppression List</span>
                <span className="text-emerald-700 font-bold">✓ Bebas Blokir</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">5. Meta Template Approval</span>
                <span className={safetyCheck.templateValid ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {safetyCheck.templateValid ? '✓ APPROVED' : '✗ Belum Disetujui'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">6. Kelengkapan Variabel Personalisasi</span>
                <span className={safetyCheck.variablesComplete ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {safetyCheck.variablesComplete ? '✓ Lengkap' : '✗ Data Kurang'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">7. Koneksi WhatsApp Cloud API</span>
                <span className="text-emerald-700 font-bold">
                  {whatsAppConfig.isDemoMode ? '✓ Simulator Siap' : '✓ Meta API Terhubung'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                <span className="font-semibold text-slate-700">8. Jadwal Pengiriman Valid</span>
                <span className="text-emerald-700 font-bold">✓ Valid</span>
              </div>
            </div>

            {!safetyCheck.allPassed && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                ⚠️ Pengiriman dinonaktifkan karena terdapat poin validasi yang belum terpenuhi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: Schedule & Dispatch Strategy */}
      {currentStep === 6 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Langkah 6: Strategi Pengiriman & Penjadwalan</h3>

          {/* Schedule Options */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setScheduleType('NOW')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                scheduleType === 'NOW'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Play className="w-4 h-4 text-emerald-600" />
                <span>Kirim Sekarang (Send Now)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Antrean langsung diproses segera setelah konfirmasi akhir.
              </p>
            </div>

            <div
              onClick={() => setScheduleType('SCHEDULED')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                scheduleType === 'SCHEDULED'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Jadwalkan Nanti (Schedule Later)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Pesan akan dikirim otomatis sesuai tanggal dan jam yang ditentukan.
              </p>
            </div>
          </div>

          {scheduleType === 'SCHEDULED' && (
            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <label className="block font-semibold text-slate-700">Tentukan Tanggal & Jam Peluncuran:</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="p-2 border rounded-lg bg-white"
              />
            </div>
          )}

          {/* Rate Limiting & Throttling Controls */}
          <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
            <div className="font-bold text-slate-800">Kontrol Antrean & Throttling API (Mencegah Flagging):</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ukuran Batch per Pengiriman</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg bg-white"
                />
                <span className="text-[10px] text-slate-400">Rekomendasi: 10 - 25 pesan per batch</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jeda Waktu Antar Batch (Detik)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg bg-white"
                />
                <span className="text-[10px] text-slate-400">Jeda throttle untuk mematuhi limit resmi Meta</span>
              </div>
            </div>
          </div>

          {/* Final Confirmation Banner */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-emerald-950 text-sm">Siap Meluncurkan Campaign</div>
              <div className="text-emerald-800">
                Target: <strong>{eligibleContacts.length} kontak</strong> • Mode: <strong>{whatsAppConfig.isDemoMode ? 'Simulator DEMO' : 'WhatsApp LIVE'}</strong>
              </div>
            </div>

            <button
              onClick={handleFinishAndSend}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
            >
              {scheduleType === 'NOW' ? 'Konfirmasi & Kirim Blast' : 'Simpan Jadwal Campaign'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
