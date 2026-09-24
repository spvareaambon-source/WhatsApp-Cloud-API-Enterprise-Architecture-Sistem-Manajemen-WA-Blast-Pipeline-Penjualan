import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { UserRole, User } from '../../types';
import { 
  Search, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Zap, 
  CheckCircle2, 
  X,
  LogOut,
  User as UserIcon,
  Check,
  Edit2,
  ChevronDown,
  SlidersHorizontal,
  ArrowRightLeft,
  Users,
  Mail,
  Phone,
  Shield,
  Trash2,
  FileSpreadsheet,
  Database
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
];

export const Header: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    users,
    updateUser,
    renamePicGlobal,
    whatsAppConfig, 
    toggleDemoMode, 
    globalSearch, 
    setGlobalSearch,
    sendTestMessage,
    resetToSampleData,
    clearContactsDatabase,
    templates,
    contacts,
    campaigns,
    setActiveView,
    setSelectedCampaignId,
    logout,
    addToast
  } = useApp();

  const [showTestModal, setShowTestModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [testPhone, setTestPhone] = useState('081288990011');
  const [testTemplateId, setTestTemplateId] = useState(templates[0]?.id || '');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Inline editing state for active Sales/PIC name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);

  // Interactive profile & role switcher drawer state
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(currentUser.name);
  const [drawerEmail, setDrawerEmail] = useState(currentUser.email);
  const [drawerPhone, setDrawerPhone] = useState(currentUser.phone || '');
  const [drawerAvatar, setDrawerAvatar] = useState(currentUser.avatar || '');

  // Synchronize when currentUser updates
  useEffect(() => {
    setEditedName(currentUser.name);
    setDrawerName(currentUser.name);
    setDrawerEmail(currentUser.email);
    setDrawerPhone(currentUser.phone || '');
    setDrawerAvatar(currentUser.avatar || '');
  }, [currentUser]);

  // Keyboard navigation (Escape to close modals/inline edit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingName) {
          setIsEditingName(false);
          setEditedName(currentUser.name);
        } else if (isProfileDrawerOpen) {
          setIsProfileDrawerOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingName, isProfileDrawerOpen, currentUser.name]);

  // Save inline name
  const handleSaveInlineName = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== currentUser.name) {
      const oldName = currentUser.name;
      updateUser(currentUser.id, { name: trimmed });
      renamePicGlobal(oldName, trimmed);
      addToast({
        type: 'success',
        title: 'Nama Sales / PIC Diperbarui',
        message: `Nama aktif Sales / PIC telah diubah menjadi "${trimmed}".`
      });
    }
    setIsEditingName(false);
  };

  // Save drawer profile updates
  const handleSaveDrawerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = drawerName.trim();
    if (!trimmedName) return;

    const oldName = currentUser.name;
    updateUser(currentUser.id, {
      name: trimmedName,
      email: drawerEmail.trim(),
      phone: drawerPhone.trim(),
      avatar: drawerAvatar.trim()
    });

    if (trimmedName !== oldName) {
      renamePicGlobal(oldName, trimmedName);
    }

    addToast({
      type: 'success',
      title: 'Profil Berhasil Disimpan',
      message: 'Pembaruan profil Sales / PIC tersimpan ke database sistem.'
    });
    setIsProfileDrawerOpen(false);
  };

  // Switch role handler
  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === currentUser.role) return;
    updateUser(currentUser.id, { role: newRole });
    addToast({
      type: 'info',
      title: 'Peran Akun Diperbarui',
      message: `Peran aktif akun telah dialihkan ke "${newRole}".`
    });
  };

  // Switch active user account
  const handleSwitchUser = (targetUser: User) => {
    setCurrentUser(targetUser);
    addToast({
      type: 'success',
      title: 'Beralih Akun Berhasil',
      message: `Sekarang aktif sebagai ${targetUser.name} (${targetUser.role}).`
    });
    setIsProfileDrawerOpen(false);
  };

  // Count assigned contacts for current user / PIC
  const assignedContactsCount = contacts.filter(c => 
    c.pic && c.pic.toLowerCase() === currentUser.name.toLowerCase()
  ).length;

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSending(true);
    setTestResult(null);
    const res = await sendTestMessage(testPhone, testTemplateId);
    setTestResult(res);
    setTestSending(false);
  };

  // Filter global search items
  const filteredContacts = globalSearch.trim() ? contacts.filter(c => 
    c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    c.phone.includes(globalSearch) ||
    c.product.toLowerCase().includes(globalSearch.toLowerCase())
  ).slice(0, 4) : [];

  const filteredCampaigns = globalSearch.trim() ? campaigns.filter(c => 
    c.name.toLowerCase().includes(globalSearch.toLowerCase())
  ).slice(0, 3) : [];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
      {/* Search Bar with Autocomplete */}
      <div className="relative w-96 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kontak, nomor WA, campaign, produk..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {globalSearch && (
            <button 
              onClick={() => { setGlobalSearch(''); setShowSearchDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Popup */}
        {showSearchDropdown && globalSearch.trim().length > 1 && (
          <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
            <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Kontak</div>
            {filteredContacts.length > 0 ? (
              filteredContacts.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => {
                    setActiveView('contacts');
                    setShowSearchDropdown(false);
                  }}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs border-b border-slate-100 last:border-0"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    <span className="text-slate-500 ml-2">({c.phone})</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">{c.product}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-1.5 text-xs text-slate-400">Tidak ada kontak cocok</div>
            )}

            <div className="px-3 py-1 mt-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Campaign</div>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(cmp => (
                <div 
                  key={cmp.id}
                  onClick={() => {
                    setSelectedCampaignId(cmp.id);
                    setActiveView('campaigns');
                    setShowSearchDropdown(false);
                  }}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800">{cmp.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{cmp.status}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-1.5 text-xs text-slate-400">Tidak ada campaign cocok</div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Switcher Pill */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
          <button
            onClick={toggleDemoMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              whatsAppConfig.isDemoMode 
                ? 'bg-amber-500 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Klik untuk beralih mode simulasi / live WhatsApp Cloud API"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>DEMO MODE</span>
          </button>
          <button
            onClick={toggleDemoMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !whatsAppConfig.isDemoMode 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Live WhatsApp Business Platform Cloud API"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LIVE API</span>
          </button>
        </div>

        {/* Quick Test Message Button */}
        <button
          onClick={() => setShowTestModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim Pesan Tes</span>
        </button>

        {/* Reset Database / Restore Sample Data Button */}
        <button
          onClick={() => setShowResetModal(true)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Manajemen Reset Database / Pulihkan Data Contoh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User Profile & Real Logout Button */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div 
            onClick={() => {
              if (!isEditingName) {
                setIsProfileDrawerOpen(true);
              }
            }}
            className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs cursor-pointer transition-all group select-none"
            title="Klik untuk buka profil & pengaturan akun Sales / PIC"
          >
            <img 
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-lg object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-emerald-500/40 transition-all shrink-0" 
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-extrabold text-slate-800 leading-tight">
                {isEditingName ? (
                  <span 
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInlineName(e);
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setEditedName(currentUser.name);
                          setIsEditingName(false);
                        }
                      }}
                      autoFocus
                      className="px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-emerald-500 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs w-32"
                      placeholder="Nama Sales / PIC"
                    />
                    <button
                      type="button"
                      onClick={handleSaveInlineName}
                      className="p-0.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded cursor-pointer"
                      title="Simpan Nama (Enter)"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditedName(currentUser.name);
                        setIsEditingName(false);
                      }}
                      className="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                      title="Batal (Esc)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingName(true);
                    }}
                    className="inline-flex items-center gap-1 hover:text-emerald-700 transition-colors cursor-pointer group/name"
                    title="Klik untuk sunting langsung nama Sales / PIC"
                  >
                    <span>{currentUser.name}</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/name:opacity-100 text-slate-400 group-hover/name:text-emerald-600 transition-opacity" />
                  </span>
                )}
              </div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{currentUser.role}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 hidden sm:block" />
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Keluar dari akun Anda"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Interactive Drawer for Sales/PIC Profile & Account Roles */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsProfileDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Profil Sales / PIC & Peran</h3>
                    <p className="text-[11px] text-slate-500">Kelola identitas aktif, penugasan, & ganti peran sistem</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">

                {/* 1. Active User Card */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3.5 relative z-10">
                    <img
                      src={drawerAvatar || currentUser.avatar}
                      alt={currentUser.name}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold truncate">{currentUser.name}</span>
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500 text-white tracking-wider">
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">@{currentUser.username} &bull; {currentUser.email}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-emerald-300">
                        <span className="flex items-center gap-1 font-semibold">
                          <Users className="w-3.5 h-3.5" />
                          {assignedContactsCount} Kontak Ditugaskan
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('contacts');
                        setIsProfileDrawerOpen(false);
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Buka Database Nasabah PIC Saya &rarr;
                    </button>
                    <span className="text-[10px] text-slate-400">ID: {currentUser.id}</span>
                  </div>
                </div>

                {/* 2. Switch Role (RBAC) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Ganti Peran Akun (Role Switcher)
                    </span>
                    <span className="text-[10px] text-slate-500">Klik untuk langsung beralih</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        role: 'SUPER_ADMIN' as UserRole,
                        title: 'SUPER_ADMIN',
                        desc: 'Akses penuh API, webhook, & audit log',
                        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
                      },
                      {
                        role: 'ADMIN' as UserRole,
                        title: 'ADMIN',
                        desc: 'Manajemen kontak, segmentasi, & template',
                        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      },
                      {
                        role: 'MANAGER' as UserRole,
                        title: 'MANAGER',
                        desc: 'Supervisi kampanye & eskalasi chat nasabah',
                        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
                      },
                      {
                        role: 'SALES' as UserRole,
                        title: 'SALES / PIC',
                        desc: 'Follow-up leads, chat nasabah, & pipeline',
                        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
                      }
                    ].map(r => {
                      const isActive = currentUser.role === r.role;
                      return (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => handleSwitchRole(r.role)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                            isActive 
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${r.badgeColor}`}>
                              {r.title}
                            </span>
                            {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">{r.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Switch User (Switch between system accounts) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                      Beralih ke Akun Pengguna Lain
                    </span>
                    <span className="text-[10px] text-slate-500">{users.length} akun tersedia</span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {users.map(u => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <div
                          key={u.id}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold truncate leading-tight">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">@{u.username} &bull; {u.role}</p>
                            </div>
                          </div>

                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold shrink-0">
                              Aktif
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSwitchUser(u)}
                              className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                              Gunakan Akun
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Edit Profile Form */}
                <form onSubmit={handleSaveDrawerProfile} className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4 text-emerald-600" />
                      Sunting Profil Sales / PIC
                    </span>
                    <span className="text-[10px] text-slate-400">Sinkron ke database PIC</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Lengkap Sales / PIC:
                    </label>
                    <input
                      type="text"
                      required
                      value={drawerName}
                      onChange={(e) => setDrawerName(e.target.value)}
                      placeholder="Contoh: Bagus Pratama, S.E."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email PIC:
                      </label>
                      <input
                        type="email"
                        value={drawerEmail}
                        onChange={(e) => setDrawerEmail(e.target.value)}
                        placeholder="email@perusahaan.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nomor WA PIC:
                      </label>
                      <input
                        type="text"
                        value={drawerPhone}
                        onChange={(e) => setDrawerPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Avatar Presets Selection */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pilih Foto Profil Avatar:
                    </label>
                    <div className="flex items-center gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDrawerAvatar(preset)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            drawerAvatar === preset ? 'border-emerald-600 scale-105 ring-2 ring-emerald-400/30' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={preset} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!drawerName.trim()}
                      className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan Profil PIC</span>
                    </button>
                  </div>
                </form>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsProfileDrawerOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDrawerOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        title="Keluar dari Sistem?"
        message={`Apakah Anda yakin ingin keluar dari akun "${currentUser.name}"? Sesi aktif Anda akan diakhiri dan dialihkan ke halaman login.`}
        confirmText="Ya, Keluar"
        cancelText="Batal"
      />

      {/* Test Message Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kirim Pesan Uji Coba WhatsApp</h3>
                  <p className="text-xs text-slate-500">Kirim 1 pesan via Meta Cloud API / Simulator</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunTest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Penerima (Tes)
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Nomor otomatis dinormalisasi ke format E.164 resmi (628...)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Template WhatsApp Resmi
                </label>
                <select
                  value={testTemplateId}
                  onChange={(e) => setTestTemplateId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category}) - {t.approvalStatus}
                    </option>
                  ))}
                </select>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={testSending}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {testSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Database / Restore Sample Data Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Database Kontak</h3>
                  <p className="text-[11px] text-slate-500">Pilih tindakan database yang ingin Anda lakukan</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-5 space-y-3">
              {/* Option 1: Kosongkan Database */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Reset Database (Tampilan Kosong)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Menghapus semua ({contacts.length}) data kontak nasabah yang telah diunggah dari file Excel/CSV. Sistem akan kembali ke tampilan awal yang bersih tanpa data.
                </p>
                <button
                  type="button"
                  disabled={contacts.length === 0}
                  onClick={() => {
                    clearContactsDatabase();
                    setShowResetModal(false);
                  }}
                  className="w-full mt-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                >
                  {contacts.length === 0 ? 'Database Sudah Kosong' : `Kosongkan Seluruh Database (${contacts.length})`}
                </button>
              </div>

              {/* Option 2: Pulihkan Data Contoh */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <span>Pulihkan Data Contoh Simulasi</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Muat kembali dataset 12 kontak contoh bawaan Pegadaian (Cicil Emas, Gadai, Tabungan Emas) untuk simulasi demonstrasi.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetToSampleData();
                    setShowResetModal(false);
                  }}
                  className="w-full mt-1 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer text-center"
                >
                  Muat Data Contoh Bawaan
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
