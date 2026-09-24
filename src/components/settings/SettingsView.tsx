import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { User, UserRole } from '../../types';
import { WhatsAppService, TestConnectionResponse } from '../../services/whatsappService';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Link, 
  Copy, 
  Check, 
  RefreshCw, 
  Users, 
  History, 
  Globe, 
  Zap, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  AlertCircle,
  Server,
  Plus,
  Trash2,
  X,
  Lock,
  User as UserIcon,
  UserPlus,
  Database,
  FileSpreadsheet,
  Send,
  Radio,
  Terminal,
  Activity,
  CheckSquare
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    whatsAppConfig, 
    updateWhatsAppConfig, 
    toggleDemoMode, 
    auditLogs, 
    users, 
    currentUser,
    contacts,
    segments,
    messageLogs,
    templates,
    clearContactsDatabase,
    resetToSampleData,
    sendTestMessage,
    addToast,
    addUser,
    deleteUser,
    clearAuditLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<'API' | 'WEBHOOK' | 'RBAC' | 'AUDIT' | 'DATABASE'>('API');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);

  // Send Test Message State
  const [testPhone, setTestPhone] = useState('+6281288990011');
  const [testTemplateId, setTestTemplateId] = useState<string>(templates[0]?.id || '');
  const [sendingTestMsg, setSendingTestMsg] = useState(false);
  const [testMsgFeedback, setTestMsgFeedback] = useState<{ success: boolean; message: string; errorCategory?: string } | null>(null);

  // Database Management State
  const [showResetDbModal, setShowResetDbModal] = useState(false);
  const [showRestoreSampleModal, setShowRestoreSampleModal] = useState(false);

  // User Management State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SALES');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Clear Audit Logs Modal State
  const [showClearAuditModal, setShowClearAuditModal] = useState(false);

  // Form states for API credentials (write-only for secret access token)
  const [phoneNumberId, setPhoneNumberId] = useState(whatsAppConfig.phoneNumberId || '');
  const [wabaId, setWabaId] = useState(whatsAppConfig.businessAccountId || whatsAppConfig.wabaId || '');
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState(whatsAppConfig.webhookVerifyToken || 'waba_secure_verify_token_2026');
  const [apiVersion, setApiVersion] = useState(whatsAppConfig.apiVersion || 'v21.0');

  // Sync with incoming config
  useEffect(() => {
    if (whatsAppConfig.phoneNumberId) setPhoneNumberId(whatsAppConfig.phoneNumberId);
    if (whatsAppConfig.businessAccountId || whatsAppConfig.wabaId) {
      setWabaId(whatsAppConfig.businessAccountId || whatsAppConfig.wabaId || '');
    }
    if (whatsAppConfig.apiVersion) setApiVersion(whatsAppConfig.apiVersion);
    if (whatsAppConfig.webhookVerifyToken) setWebhookVerifyToken(whatsAppConfig.webhookVerifyToken);
  }, [whatsAppConfig]);

  const webhookUrl = `${window.location.origin}/api/webhooks/whatsapp`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSaveApi = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWhatsAppConfig({
      phoneNumberId: phoneNumberId.trim(),
      businessAccountId: wabaId.trim(),
      wabaId: wabaId.trim(),
      accessToken: accessTokenInput ? accessTokenInput.trim() : undefined,
      webhookVerifyToken: webhookVerifyToken.trim(),
      apiVersion: apiVersion.trim()
    });
    setAccessTokenInput(''); // Clear plain text input immediately
    addToast({ type: 'success', title: 'Berhasil', message: 'Konfigurasi WhatsApp Cloud API aman tersimpan di backend server!' });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    setTestMsgFeedback(null);
    try {
      const res = await WhatsAppService.testConnection();
      setTestResult(res);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Koneksi Meta Berhasil',
          message: 'Seluruh tahap verifikasi Access Token, WABA ID, Phone Number, dan Template berhasil!'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Uji Koneksi Gagal',
          message: res.error || 'Sistem menemukan ketidakcocokan kredensial Meta.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        demoMode: whatsAppConfig.isDemoMode,
        apiVersion: whatsAppConfig.apiVersion,
        steps: [
          { step: 1, name: 'Validate Access Token', passed: false, message: `Gagal memanggil backend: ${err.message}` }
        ],
        errorCategory: 'NETWORK_ERROR',
        error: err.message
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      addToast({ type: 'error', title: 'Nomor Kosong', message: 'Nomor WhatsApp pengujian wajib diisi.' });
      return;
    }

    setSendingTestMsg(true);
    setTestMsgFeedback(null);
    try {
      const res = await sendTestMessage(testPhone.trim(), testTemplateId || templates[0]?.id);
      setTestMsgFeedback(res);
      if (res.success) {
        addToast({
          type: 'success',
          title: whatsAppConfig.isDemoMode ? 'Simulasi Test Sukses' : 'Pesan Test Terkirim',
          message: res.message
        });
      } else {
        addToast({
          type: 'error',
          title: 'Pesan Test Gagal',
          message: res.message
        });
      }
    } catch (err: any) {
      setTestMsgFeedback({
        success: false,
        message: err.message || 'Gagal mengirim pesan test'
      });
    } finally {
      setSendingTestMsg(false);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      addToast({ type: 'error', title: 'Data Kurang', message: 'Nama, username, dan password wajib diisi!' });
      return;
    }

    const res = addUser({
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      password: newUserPassword.trim(),
      email: newUserEmail.trim() || `${newUserUsername.trim()}@company.co.id`,
      role: newUserRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '6281200000000'
    });

    if (res.success) {
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserEmail('');
      setNewUserRole('SALES');
    } else {
      addToast({ type: 'error', title: 'Gagal Tambah Pengguna', message: res.message });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pengaturan Sistem & Integrasi WhatsApp</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi resmi Meta WhatsApp Business Platform Cloud API, manajemen Webhook, RBAC, dan audit log.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'API', label: 'WhatsApp Cloud API', icon: Key },
          { id: 'WEBHOOK', label: 'Webhook Meta Gateway', icon: Server },
          { id: 'RBAC', label: 'Pengguna & Akses RBAC', icon: Users },
          { id: 'AUDIT', label: 'Audit Trail Aktivitas', icon: History },
          { id: 'DATABASE', label: 'Database & Reset', icon: Database }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 cursor-pointer transition-colors ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WhatsApp Cloud API Credentials & Diagnostics */}
      {activeTab === 'API' && (
        <div className="max-w-3xl space-y-6 text-xs">
          {/* Mode Switcher & Safety Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            whatsAppConfig.isDemoMode
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-start gap-3">
              <Zap className={`w-5 h-5 mt-0.5 shrink-0 ${whatsAppConfig.isDemoMode ? 'text-amber-600' : 'text-emerald-600'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold">
                    Mode Aktif: {whatsAppConfig.isDemoMode ? 'Simulator Demo Mode' : 'Live WhatsApp Cloud API'}
                  </strong>
                  {whatsAppConfig.isDemoMode ? (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-full tracking-wide">
                      DEMO MODE — NO REAL MESSAGE SENT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-extrabold rounded-full tracking-wide">
                      LIVE META CLOUD API
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                  {whatsAppConfig.isDemoMode
                    ? 'Panggilan API ke Meta tidak dilakukan. Semua pengiriman pesan, pembaruan status (sent/delivered/read), dan balasan nasabah disimulasikan secara realistis dan aman tanpa biaya billing Meta.'
                    : 'Panggilan API dikirim langsung ke server resmi Meta Graph API menggunakan kredensial System User WhatsApp Business Platform.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleDemoMode}
              className="px-4 py-2 bg-white border font-bold text-slate-800 rounded-xl shadow-2xs hover:bg-slate-50 cursor-pointer shrink-0 transition-colors"
            >
              Beralih ke {whatsAppConfig.isDemoMode ? 'Live API' : 'Demo Mode'}
            </button>
          </div>

          {/* DIAGNOSTIC PANEL (Requirement 9) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">WhatsApp Connection Diagnostics</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Centralized Graph API Base: https://graph.facebook.com/{apiVersion || whatsAppConfig.apiVersion || 'v21.0'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">API Version</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {apiVersion || whatsAppConfig.apiVersion || 'v21.0'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Connection Status</span>
                <span className={`font-bold text-xs ${
                  whatsAppConfig.isDemoMode 
                    ? 'text-amber-700' 
                    : (testResult?.success ? 'text-emerald-700' : 'text-slate-700')
                }`}>
                  {whatsAppConfig.isDemoMode 
                    ? 'DEMO (SIMULATOR)' 
                    : (testResult?.success ? 'CONNECTED' : (whatsAppConfig.hasToken ? 'CONFIGURED' : 'DISCONNECTED'))}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Token Status</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {whatsAppConfig.hasToken || whatsAppConfig.tokenMasked
                    ? (whatsAppConfig.tokenMasked || '••••••••••••••••')
                    : 'MISSING'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Demo Mode</span>
                <span className="font-bold text-slate-900 text-xs">
                  {whatsAppConfig.isDemoMode ? 'AKTIF (Simulator)' : 'NONAKTIF (Live Meta API)'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">WABA Status</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {wabaId 
                    ? `CONFIGURED (${wabaId.length > 8 ? `${wabaId.substring(0, 4)}••••${wabaId.substring(wabaId.length - 4)}` : wabaId})` 
                    : 'MISSING'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Phone Number Status</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {phoneNumberId 
                    ? `CONFIGURED (${phoneNumberId.length > 8 ? `${phoneNumberId.substring(0, 4)}••••${phoneNumberId.substring(phoneNumberId.length - 4)}` : phoneNumberId})` 
                    : 'MISSING'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Template Status</span>
                <span className="font-bold text-emerald-700 text-xs">
                  {testResult?.approvedTemplateCount !== undefined
                    ? `${testResult.approvedTemplateCount} APPROVED`
                    : `${templates.filter(t => (t.approvalStatus === 'APPROVED' || t.status === 'APPROVED')).length} APPROVED (${templates.length} Total)`}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Webhook Status</span>
                <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ACTIVE (/api/webhooks/whatsapp)
                </span>
              </div>
            </div>

            {/* Phone Metadata from Graph API if retrieved */}
            {testResult?.phoneMetadata && (
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-950 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Nomor Terverifikasi:</strong> {testResult.phoneMetadata.displayPhoneNumber} ({testResult.phoneMetadata.verifiedName})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-white/80 px-2 py-0.5 rounded-md font-semibold border border-indigo-200">
                    Quality: {testResult.phoneMetadata.qualityRating}
                  </span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-md font-semibold border border-indigo-200">
                    Status: {testResult.phoneMetadata.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CREDENTIALS FORM */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Kredensial Meta WhatsApp Cloud API (Server-Side)</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Kredensial disimpan dan digunakan secara eksklusif oleh backend server. Access Token tidak pernah dikirim ke browser atau disimpan di localStorage.
              </p>
            </div>

            <form onSubmit={handleSaveApi} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp Phone Number ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Contoh: 109823485728394"
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Ditemukan di Meta App Dashboard → WhatsApp → API Setup → Phone number ID
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp Business Account ID (WABA ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  placeholder="Contoh: 104829384758291"
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Ditemukan di Meta App Dashboard → WhatsApp → API Setup → WhatsApp Business Account ID
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Permanent System User Access Token <span className="text-rose-500">*</span>
                  </label>
                  {whatsAppConfig.hasToken && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Token Aktif Tersimpan di Server
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={accessTokenInput}
                  onChange={(e) => setAccessTokenInput(e.target.value)}
                  placeholder={whatsAppConfig.hasToken ? '•••••••••••••••• (Tersimpan aman di server - ketik untuk mengganti)' : 'EAABw...'}
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">
                  Gunakan Token Permanen System User dari Meta Business Manager dengan izin: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">whatsapp_business_messaging</code> & <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">whatsapp_business_management</code>. Input ini otomatis dibersihkan dari spasi/karakter newline liar.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Graph API Version</label>
                  <input
                    type="text"
                    value={apiVersion}
                    onChange={(e) => setApiVersion(e.target.value)}
                    placeholder="v21.0"
                    className="w-full p-2.5 border rounded-xl font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Terkonfigurasi terpusat (default: v21.0)</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Webhook Verify Token</label>
                  <input
                    type="text"
                    value={webhookVerifyToken}
                    onChange={(e) => setWebhookVerifyToken(e.target.value)}
                    placeholder="waba_secure_verify_token_2026"
                    className="w-full p-2.5 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Token verifikasi challenge webhook Meta</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Kredensial ke Server
                </button>
              </div>
            </form>
          </div>

          {/* 4-STEP TEST CONNECTION SECTION (Requirement 8) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Uji Koneksi Meta Cloud API (4 Tahap Validasi)</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Memvalidasi integritas Access Token, izin akun WABA, kesiapan nomor telepon, dan status persetujuan template di Meta.
                </p>
              </div>

              <button
                type="button"
                disabled={testingConnection}
                onClick={handleTestConnection}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors shrink-0"
              >
                {testingConnection ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <Zap className="w-4 h-4 text-amber-400" />}
                <span>{testingConnection ? 'Memverifikasi ke Meta...' : 'TEST CONNECTION'}</span>
              </button>
            </div>

            {/* Test Connection Results Card */}
            {testResult && (
              <div className={`p-4 rounded-2xl border space-y-4 ${
                testResult.success 
                  ? 'bg-emerald-50/60 border-emerald-200' 
                  : 'bg-rose-50/60 border-rose-200'
              }`}>
                {/* Summary Banner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span className="font-extrabold text-sm text-slate-900">
                      {testResult.success 
                        ? '✓ WhatsApp API Connected & Terverifikasi Penuh' 
                        : `Gagal: ${testResult.errorCategory || 'Meta API Error'}`}
                    </span>
                  </div>

                  {testResult.errorCategory && (
                    <span className="px-2.5 py-0.5 bg-rose-200 text-rose-900 text-[10px] font-extrabold rounded-full">
                      {testResult.errorCategory}
                    </span>
                  )}
                </div>

                {/* 4 Steps Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {testResult.steps.map((s) => (
                    <div 
                      key={s.step} 
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] ${
                        s.passed 
                          ? 'bg-white border-emerald-200 text-emerald-950' 
                          : 'bg-white border-rose-200 text-rose-950'
                      }`}
                    >
                      {s.passed ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-bold">
                          STEP {s.step}: {s.name}
                        </strong>
                        <p className={`mt-0.5 leading-relaxed opacity-90 ${s.passed ? 'text-slate-600' : 'text-rose-700 font-medium'}`}>
                          {s.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specific Error Guidance */}
                {!testResult.success && testResult.error && (
                  <div className="p-3 bg-white border border-rose-200 rounded-xl text-rose-900 text-[11px] space-y-1">
                    <strong className="block font-bold">Pesan Error Resmi:</strong>
                    <p className="leading-relaxed">{testResult.error}</p>
                    {testResult.errorCategory === 'AUTHENTICATION_ERROR' && (
                      <p className="text-[10px] text-slate-600 pt-1 border-t border-rose-100">
                        <strong>Solusi Code 190:</strong> Buka Meta Business Suite → Settings → System Users → Buat token permanen baru dengan izin <code>whatsapp_business_messaging</code> dan tempelkan di form di atas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SEND TEST MESSAGE SECTION (Requirement 10) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Kirim Pesan WhatsApp Uji Coba (Test Message)</h3>
                {whatsAppConfig.isDemoMode && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                    DEMO SIMULATOR
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Kirim pesan langsung ke nomor penguji menggunakan template WhatsApp resmi yang berstatus <strong>APPROVED</strong>.
              </p>
            </div>

            <form onSubmit={handleSendTestMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp Penerima Test <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+6281288990011"
                    className="w-full p-2.5 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Format: +62... atau 08...</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilih Template WhatsApp (APPROVED) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={testTemplateId}
                    onChange={(e) => setTestTemplateId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        [{tpl.approvalStatus || tpl.status || 'APPROVED'}] {tpl.name} ({tpl.language || 'id'})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Hanya template berstatus APPROVED yang dapat dikirim
                  </span>
                </div>
              </div>

              {/* Requirement 10: Validation Guard Notice when Live API is active */}
              {!whatsAppConfig.isDemoMode && (!whatsAppConfig.hasToken || !phoneNumberId || !wabaId) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Tombol Send Test Message dinonaktifkan hingga Access Token, WABA ID, dan Phone Number ID dikonfigurasi dan diverifikasi. Anda juga dapat mengaktifkan <strong>Simulator Demo Mode</strong> untuk pengujian instan tanpa billing.
                  </span>
                </div>
              )}

              {testMsgFeedback && (
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  testMsgFeedback.success 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200' 
                    : 'bg-rose-50 text-rose-950 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {testMsgFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold">
                      {testMsgFeedback.success ? 'Pesan Test Berhasil Dikirim!' : 'Pengiriman Pesan Test Gagal'}
                    </span>
                    {testMsgFeedback.errorCategory && (
                      <span className="ml-auto px-2 py-0.2 bg-rose-200 text-rose-900 text-[10px] font-bold rounded-md">
                        {testMsgFeedback.errorCategory}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 pl-6">{testMsgFeedback.message}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-[11px] text-slate-500">
                  {whatsAppConfig.isDemoMode ? (
                    <span className="font-bold text-amber-700">DEMO MODE — NO REAL MESSAGE SENT</span>
                  ) : (
                    <span>Mengirimkan pesan resmi via Meta Cloud API</span>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={
                    sendingTestMsg || 
                    (!whatsAppConfig.isDemoMode && (!whatsAppConfig.hasToken || !phoneNumberId || !wabaId))
                  }
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  {sendingTestMsg ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
                  <span>{sendingTestMsg ? 'Mengirim...' : 'SEND TEST MESSAGE'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Webhook Meta Gateway */}
      {activeTab === 'WEBHOOK' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Konfigurasi Webhook Meta Cloud API</h3>
            <p className="text-slate-500">
              Webhook endpoint ini memproses notifikasi status terkirim (sent), diterima (delivered), dibaca (read), dan balasan nasabah secara otomatis.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Callback URL (Webhook Endpoint)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-800 select-all"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWebhook ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Verify Token</label>
              <input
                type="text"
                readOnly
                value={whatsAppConfig.webhookVerifyToken}
                className="w-full p-2.5 bg-slate-50 border rounded-lg font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800">Langkah Konfigurasi di Meta Developer Portal:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
              <li>Buka Meta App Dashboard → WhatsApp → Configuration.</li>
              <li>Klik <strong>Edit</strong> pada bagian Callback URL.</li>
              <li>Tempelkan <strong>Callback URL</strong> di atas ke dalam input field Meta.</li>
              <li>Masukkan <strong>Verify Token</strong> persis seperti di atas.</li>
              <li>Klik <strong>Verify and Save</strong>.</li>
              <li>Buka Subscription Fields, centang webhook events: <code>messages</code>.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: RBAC Users */}
      {activeTab === 'RBAC' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Pengguna & Hak Akses Berjenjang (RBAC)</h3>
              <span className="text-slate-500">Kelola akun, hak akses, username, dan kata sandi login tim sales</span>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                <tr>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role / Jabatan</th>
                  <th className="p-3">Hak Akses Utama</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => {
                  const isCurrent = currentUser.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2.5">
                        <img 
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                          alt={u.name} 
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200" 
                        />
                        <div>
                          <div>{u.name}</div>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-600 font-semibold">(Akun Anda)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-800">
                        @{u.username || 'admin'}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'MANAGER' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">
                        {u.role === 'SUPER_ADMIN' ? 'Akses Penuh: API, Billing, Campaign, User, Export' :
                         u.role === 'ADMIN' ? 'Kelola Campaign, Template, Kontak, Import' :
                         u.role === 'MANAGER' ? 'Approval Campaign, Laporan Analitik, Monitoring Team' :
                         'Follow-up Sales, Live Chat Inbox, Update Pipeline'}
                      </td>
                      <td className="p-3 text-right">
                        {isCurrent ? (
                          <span className="text-[10px] text-slate-400 italic">Aktif Digunakan</span>
                        ) : (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={`Hapus pengguna ${u.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Audit Trail Aktivitas Sistem</h3>
              <span className="text-slate-500">{auditLogs.length} rekam jejak aktivitas tercatat</span>
            </div>

            {auditLogs.length > 0 && (
              <button
                onClick={() => setShowClearAuditModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat Audit</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Entitas / Modul</th>
                  <th className="p-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {auditLogs.length > 0 ? (
                  auditLogs.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(a.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{a.userName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                          {a.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{a.objectType || a.entity}</td>
                      <td className="p-3 text-slate-500">{a.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      Riwayat audit kosong.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Database & Reset Management */}
      {activeTab === 'DATABASE' && (
        <div className="space-y-6 text-xs max-w-4xl">
          {/* Status Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-bold">Total Database Kontak</span>
                <div className={`p-2 rounded-xl ${contacts.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">{contacts.length}</div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${contacts.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-slate-500">{contacts.length > 0 ? 'Database Berisi Data' : 'Tampilan Kosong Tanpa Data'}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-bold">Segmen Nasabah</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">{segments.length}</div>
              <div className="text-[11px] text-slate-500">Filter kelompok nasabah</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-bold">Log Riwayat Pesan</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <History className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">{messageLogs.length}</div>
              <div className="text-[11px] text-slate-500">Riwayat pengiriman broadcast</div>
            </div>
          </div>

          {/* Action 1: Reset Database Excel */}
          <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  Zona Bahaya
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Reset Seluruh Database Kontak Excel
                </h3>
                <p className="text-slate-500 leading-relaxed text-xs max-w-2xl">
                  Fitur ini berfungsi untuk menghapus seluruh data kontak nasabah yang telah diunggah dari file Excel/CSV atau dibuat manual, lalu mengembalikan sistem ke tampilan awal yang benar-benar kosong tanpa data. Semua kontak nasabah akan dihapus dari penyimpanan lokal browser (localStorage).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                {contacts.length > 0 ? (
                  <span>Terdapat <strong>{contacts.length} kontak</strong> yang akan dihapus jika Anda melakukan reset.</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">Database saat ini sudah dalam keadaan kosong tanpa data.</span>
                )}
              </div>

              <button
                type="button"
                disabled={contacts.length === 0}
                onClick={() => setShowResetDbModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Database Sekarang ({contacts.length})</span>
              </button>
            </div>
          </div>

          {/* Action 2: Restore Sample Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Pulihkan Dataset Contoh Bawaan (Simulasi Demo)
                </h3>
                <p className="text-slate-500 leading-relaxed text-xs max-w-2xl">
                  Jika Anda ingin mendemonstrasikan sistem atau mencoba fitur campaign blast, Anda dapat memuat kembali data contoh nasabah Pegadaian bawaan lengkap dengan format nomor WhatsApp valid, variasi produk (Cicil Emas, Gadai, Tabungan Emas), dan PIC Sales aktif.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Dataset contoh siap pakai untuk pengujian fitur tanpa perlu file Excel.
              </div>

              <button
                type="button"
                onClick={() => setShowRestoreSampleModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
                <span>Muat Data Contoh Bawaan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Tambah Pengguna Baru</h3>
                  <p className="text-[11px] text-slate-500">Buat username dan password sendiri untuk staf sales</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: budi123"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 karakter"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="budi@company.co.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Hak Akses</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="SALES">SALES - Follow-up nasabah, chat live WhatsApp & CRM</option>
                  <option value="MANAGER">MANAGER - Approval blast, analitik & monitoring tim</option>
                  <option value="ADMIN">ADMIN - Kelola kontak, template pesan & jadwal blast</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN - Hak akses penuh konfigurasi & tim</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        title="Hapus Akun Pengguna?"
        message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}" (@${userToDelete?.username})? Akun ini tidak akan dapat lagi masuk ke sistem web.`}
        itemName={userToDelete ? `${userToDelete.name} (@${userToDelete.username})` : undefined}
        confirmText="Hapus Pengguna"
      />

      {/* Clear Audit Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showClearAuditModal}
        onClose={() => setShowClearAuditModal(false)}
        onConfirm={clearAuditLogs}
        title="Bersihkan Semua Audit Trail?"
        message="Apakah Anda yakin ingin menghapus seluruh riwayat aktivitas audit trail? Tindakan ini akan mengosongkan seluruh catatan log riwayat."
        confirmText="Bersihkan Riwayat"
      />

      {/* Reset Entire Contacts Database Modal */}
      <ConfirmDeleteModal
        isOpen={showResetDbModal}
        onClose={() => setShowResetDbModal(false)}
        onConfirm={() => {
          clearContactsDatabase();
          setShowResetDbModal(false);
        }}
        title="Reset Seluruh Database Kontak Excel?"
        message={`Apakah Anda yakin ingin menghapus seluruh (${contacts.length}) data kontak nasabah dari sistem? Database kontak akan dikosongkan secara total dan aplikasi akan kembali ke tampilan awal yang bersih tanpa data.`}
        confirmText="Ya, Reset & Kosongkan Database"
        cancelText="Batal"
      />

      {/* Restore Sample Data Modal */}
      <ConfirmDeleteModal
        isOpen={showRestoreSampleModal}
        onClose={() => setShowRestoreSampleModal(false)}
        onConfirm={() => {
          resetToSampleData();
          setShowRestoreSampleModal(false);
        }}
        title="Pulihkan Data Contoh Bawaan?"
        message="Apakah Anda ingin memuat kembali 12 data contoh simulasi nasabah Pegadaian bawaan? Data kontak saat ini akan diganti dengan data contoh resmi."
        confirmText="Muat Data Contoh"
        cancelText="Batal"
      />
    </div>
  );
};
