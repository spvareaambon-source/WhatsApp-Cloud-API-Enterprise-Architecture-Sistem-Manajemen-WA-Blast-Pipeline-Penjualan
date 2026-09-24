import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Contact, CustomerStatus, OptInStatus } from '../../types';
import { normalizeWhatsAppNumber, formatPhoneDisplay } from '../../utils/phoneNormalizer';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Tag as TagIcon, 
  UserCheck, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  MoreHorizontal, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  X,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Database
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { 
    contacts, 
    tags, 
    addContact, 
    editContact, 
    deleteContact, 
    bulkDeleteContacts, 
    bulkTagContacts, 
    bulkAssignPic,
    renamePicGlobal,
    clearContactsDatabase,
    resetToSampleData,
    setActiveView 
  } = useApp();

  // Reset Database Modal State
  const [showResetDatabaseModal, setShowResetDatabaseModal] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [optInFilter, setOptInFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState<keyof Contact>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTagModal, setBulkTagModal] = useState(false);
  const [selectedTagToApply, setSelectedTagToApply] = useState('');
  const [bulkPicModal, setBulkPicModal] = useState(false);
  const [selectedPicToApply, setSelectedPicToApply] = useState('Bagus Pratama');
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Sales / PIC Management & Inline Edit State
  const [showPicManagerModal, setShowPicManagerModal] = useState(false);
  const [inlineEditingPicId, setInlineEditingPicId] = useState<string | null>(null);
  const [inlinePicValue, setInlinePicValue] = useState('');
  const [selectedOldPicToRename, setSelectedOldPicToRename] = useState('');
  const [newPicName, setNewPicName] = useState('');

  // Delete Contact State
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Add / Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Detail Drawer
  const [activeDrawerContact, setActiveDrawerContact] = useState<Contact | null>(null);

  // Unique dropdown options
  const uniqueProducts = useMemo(() => Array.from(new Set(contacts.map(c => c.product))), [contacts]);
  const uniqueRegions = useMemo(() => Array.from(new Set(contacts.map(c => c.region))), [contacts]);

  // Unique PICs and Stats
  const uniquePics = useMemo(() => {
    const list = Array.from(new Set(contacts.map(c => c.pic?.trim()).filter(Boolean)));
    return list.length > 0 ? list : ['Bagus Pratama', 'Siti Rahmawati', 'Rudi Hartono', 'Dewi Lestari'];
  }, [contacts]);

  const picStats = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach(c => {
      const p = c.pic?.trim() || 'Tanpa PIC';
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [contacts]);

  // Filtered and Sorted list
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.pic.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProduct = productFilter === 'ALL' || c.product === productFilter;
      const matchesStatus = statusFilter === 'ALL' || c.customerStatus === statusFilter;
      const matchesOptIn = optInFilter === 'ALL' || c.optInStatus === optInFilter;
      const matchesRegion = regionFilter === 'ALL' || c.region === regionFilter;
      const matchesTag = tagFilter === 'ALL' || c.tags.includes(tagFilter);

      return matchesSearch && matchesProduct && matchesStatus && matchesOptIn && matchesRegion && matchesTag;
    }).sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [contacts, searchTerm, productFilter, statusFilter, optInFilter, regionFilter, tagFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const paginatedContacts = filteredContacts.slice((page - 1) * pageSize, page * pageSize);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedContacts.map(c => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nama', 'Nomor_WA', 'Email', 'Kota', 'Wilayah', 'Produk', 'Status', 'OptIn', 'Tags', 'PIC', 'LastContact'];
    const rows = filteredContacts.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.phone}"`,
      c.email,
      `"${c.city}"`,
      `"${c.region}"`,
      `"${c.product}"`,
      c.customerStatus,
      c.optInStatus,
      `"${c.tags.join(';')}"`,
      `"${c.pic}"`,
      c.lastContact || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `database_kontak_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const excelRows = filteredContacts.map(c => ({
      'ID Kontak': c.id,
      'Nama Nasabah': c.name,
      'Nomor WhatsApp': c.phone,
      'Email': c.email,
      'Kota': c.city,
      'Wilayah': c.region,
      'Kategori': c.category,
      'Produk Minat': c.product,
      'Status Nasabah': c.customerStatus,
      'Status Consent': c.optInStatus,
      'Tags': c.tags.join(', '),
      'Sales PIC': c.pic,
      'Kontak Terakhir': c.lastContact || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelRows);

    // Set custom column widths
    ws['!cols'] = [
      { wch: 15 }, // ID Kontak
      { wch: 22 }, // Nama Nasabah
      { wch: 18 }, // Nomor WhatsApp
      { wch: 25 }, // Email
      { wch: 16 }, // Kota
      { wch: 16 }, // Wilayah
      { wch: 14 }, // Kategori
      { wch: 18 }, // Produk Minat
      { wch: 14 }, // Status Nasabah
      { wch: 14 }, // Status Consent
      { wch: 22 }, // Tags
      { wch: 18 }, // Sales PIC
      { wch: 16 }  // Kontak Terakhir
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Database Nasabah');
    XLSX.writeFile(wb, `database_kontak_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Database Kontak Pelanggan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola database nasabah, validasi format nomor WhatsApp internasional, dan status opt-in resmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {contacts.length > 0 && (
            <button
              onClick={() => setShowResetDatabaseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-xl shadow-xs cursor-pointer transition-colors"
              title="Reset database: Hapus seluruh data Excel yang telah di-upload dan kembali ke tampilan kosong tanpa data"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Reset Database ({contacts.length})</span>
            </button>
          )}

          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer transition-colors animate-in fade-in"
              title={`Hapus ${selectedIds.length} kontak terpilih sekaligus`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          )}
          <button
            onClick={() => setActiveView('import')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel (.xlsx)</span>
          </button>
          {contacts.length > 0 && (
            <>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer transition-colors"
                title="Export ke Microsoft Excel Worksheet (.xlsx)"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </>
          )}
          <button
            onClick={() => {
              setEditingContact(null);
              setEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kontak</span>
          </button>
        </div>
      </div>

      {/* When Database is Empty: Dedicated Clean Empty State */}
      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-10 sm:p-14 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5 text-emerald-600 shadow-xs">
            <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Database Bersih & Kosong (0 Data)
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
            Tampilan Kosong Tanpa Data
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mb-8">
            Database kontak saat ini bersih dan tidak memuat data apa pun. Seluruh database Excel yang di-upload sebelumnya telah berhasil dihapus/direset. Anda dapat mengunggah file spreadsheet Excel (.xlsx / .csv) baru atau menambah kontak secara manual.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveView('import')}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import File Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => {
                setEditingContact(null);
                setEditModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Tambah Kontak Manual</span>
            </button>

            <button
              onClick={resetToSampleData}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Muat kembali data contoh nasabah untuk simulasi pengujian"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Muat Data Contoh Bawaan</span>
            </button>
          </div>
        </div>
      ) : (
        <>

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, nomor WhatsApp, email, kota, PIC..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={productFilter}
              onChange={(e) => { setProductFilter(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Produk</option>
              {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Customer Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">Status Nasabah: Semua</option>
              <option value="AKTIF">Aktif</option>
              <option value="PROSPEK">Prospek</option>
              <option value="DORMANT">Dormant</option>
            </select>
          </div>

          {/* Opt-In Status */}
          <div>
            <select
              value={optInFilter}
              onChange={(e) => { setOptInFilter(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">Consent: Semua</option>
              <option value="OPTED_IN">OPTED_IN (Consent)</option>
              <option value="OPTED_OUT">OPTED_OUT (Stop)</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <select
              value={tagFilter}
              onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Tag</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-rose-950">
              <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                {selectedIds.length}
              </div>
              <div>
                <span>{selectedIds.length} kontak terpilih</span>
                {selectedIds.length < filteredContacts.length && (
                  <button
                    onClick={() => setSelectedIds(filteredContacts.map(c => c.id))}
                    className="ml-2 text-[11px] text-rose-700 hover:text-rose-900 underline font-medium cursor-pointer"
                  >
                    (Pilih seluruh {filteredContacts.length} kontak hasil filter)
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkTagModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs cursor-pointer"
              >
                <TagIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bulk Tag</span>
              </button>

              <button
                onClick={() => setBulkPicModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assign PIC</span>
              </button>

              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs cursor-pointer transition-colors"
                title="Hapus seluruh kontak yang dipilih secara massal"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete ({selectedIds.length})</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-white/60 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="cursor-pointer">
                    {selectedIds.length === paginatedContacts.length && paginatedContacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Nama Nasabah</th>
                <th className="py-3 px-3">Nomor WhatsApp</th>
                <th className="py-3 px-3">Kota & Wilayah</th>
                <th className="py-3 px-3">Produk</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Consent / Opt-in</th>
                <th className="py-3 px-3">Tag</th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1.5 group">
                    <span 
                      onClick={() => {
                        if (sortField === 'pic') {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortField('pic');
                          setSortAsc(true);
                        }
                      }}
                      className="cursor-pointer hover:text-slate-900 select-none flex items-center gap-1"
                      title="Klik untuk urutkan berdasarkan Sales / PIC"
                    >
                      Sales / PIC
                      {sortField === 'pic' && (
                        <span className="text-emerald-600 font-bold">{sortAsc ? '▲' : '▼'}</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const initialPic = uniquePics[0] || 'Bagus Pratama';
                        setSelectedOldPicToRename(initialPic);
                        setNewPicName(initialPic);
                        setShowPicManagerModal(true);
                      }}
                      className="p-1 hover:bg-emerald-100 text-slate-400 hover:text-emerald-700 rounded transition-colors cursor-pointer inline-flex items-center"
                      title="Sunting / Ganti Nama Sales PIC"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact) => {
                  const isSelected = selectedIds.includes(contact.id);
                  const norm = normalizeWhatsAppNumber(contact.phone);

                  return (
                    <tr 
                      key={contact.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <button onClick={() => handleToggleSelect(contact.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {contact.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{contact.name}</div>
                            <div className="text-[10px] text-slate-400">{contact.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-xs text-slate-800">
                        <div>{formatPhoneDisplay(contact.phone)}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {norm.isValid ? (
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-sans font-medium">
                              ✓ {norm.operator}
                            </span>
                          ) : (
                            <span className="text-[9px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-sans font-medium">
                              ⚠ Format Salah
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-800">{contact.city}</div>
                        <div className="text-[10px] text-slate-400">{contact.region}</div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {contact.product}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          contact.customerStatus === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' :
                          contact.customerStatus === 'PROSPEK' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {contact.customerStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                          contact.optInStatus === 'OPTED_IN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          contact.optInStatus === 'OPTED_OUT' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {contact.optInStatus === 'OPTED_IN' && <ShieldCheck className="w-3 h-3" />}
                          {contact.optInStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                              {t}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{contact.tags.length - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700">
                        {inlineEditingPicId === contact.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              list="pic-datalist"
                              value={inlinePicValue}
                              onChange={(e) => setInlinePicValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (inlinePicValue.trim()) {
                                    editContact(contact.id, { pic: inlinePicValue.trim() });
                                  }
                                  setInlineEditingPicId(null);
                                } else if (e.key === 'Escape') {
                                  setInlineEditingPicId(null);
                                }
                              }}
                              className="w-28 px-2 py-1 text-xs border border-emerald-500 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              onClick={() => {
                                if (inlinePicValue.trim()) {
                                  editContact(contact.id, { pic: inlinePicValue.trim() });
                                }
                                setInlineEditingPicId(null);
                              }}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setInlineEditingPicId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group/pic">
                            <span className="truncate max-w-[120px]">{contact.pic}</span>
                            <button
                              onClick={() => {
                                setInlineEditingPicId(contact.id);
                                setInlinePicValue(contact.pic);
                              }}
                              className="opacity-0 group-hover/pic:opacity-100 p-1 hover:bg-slate-200/80 rounded text-slate-400 hover:text-emerald-700 transition-all cursor-pointer ml-1"
                              title="Sunting nama Sales/PIC untuk nasabah ini"
                            >
                              <Edit3 className="w-3 h-3 text-emerald-600" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveDrawerContact(contact)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingContact(contact);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                            title="Edit Kontak"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setContactToDelete(contact)}
                            className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Hapus Kontak"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Tidak ada kontak yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan <strong className="text-slate-800">{Math.min(filteredContacts.length, (page - 1) * pageSize + 1)}</strong> - <strong className="text-slate-800">{Math.min(filteredContacts.length, page * pageSize)}</strong> dari <strong className="text-slate-800">{filteredContacts.length}</strong> kontak
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-50 hover:bg-slate-100"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 text-slate-800 font-semibold">
              Halaman {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-50 hover:bg-slate-100"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </>
  )}

      {/* Add / Edit Contact Modal */}
      {editModalOpen && (
        <ContactFormModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          contact={editingContact}
          onSave={(data) => {
            if (editingContact) {
              editContact(editingContact.id, data);
            } else {
              addContact(data as any);
            }
            setEditModalOpen(false);
          }}
        />
      )}

      {/* Bulk Tag Modal */}
      {bulkTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Pilih Tag untuk {selectedIds.length} Kontak</h3>
            <select
              value={selectedTagToApply}
              onChange={(e) => setSelectedTagToApply(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg mb-4"
            >
              <option value="">-- Pilih Tag --</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setBulkTagModal(false)} className="px-3 py-1.5 text-slate-600">Batal</button>
              <button
                disabled={!selectedTagToApply}
                onClick={() => {
                  bulkTagContacts(selectedIds, selectedTagToApply);
                  setBulkTagModal(false);
                  setSelectedIds([]);
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg disabled:opacity-50"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign PIC Modal */}
      {bulkPicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Tugaskan Sales PIC ({selectedIds.length} Kontak)</h3>
            <select
              value={selectedPicToApply}
              onChange={(e) => setSelectedPicToApply(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg mb-4"
            >
              {uniquePics.map(pic => (
                <option key={pic} value={pic}>{pic}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={() => setBulkPicModal(false)} className="px-3 py-1.5 text-slate-600">Batal</button>
              <button
                onClick={() => {
                  bulkAssignPic(selectedIds, selectedPicToApply);
                  setBulkPicModal(false);
                  setSelectedIds([]);
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {activeDrawerContact && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {activeDrawerContact.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeDrawerContact.name}</h3>
                  <p className="text-[11px] text-slate-500">{activeDrawerContact.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveDrawerContact(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
              {/* WhatsApp & Contact Info Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-900">{activeDrawerContact.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-medium text-slate-800">{activeDrawerContact.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Domisili:</span>
                  <span className="text-slate-800">{activeDrawerContact.city}, {activeDrawerContact.region}</span>
                </div>
              </div>

              {/* Consent Opt-in Badge */}
              <div>
                <div className="font-semibold text-slate-700 mb-1.5">WhatsApp Consent Compliance</div>
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">{activeDrawerContact.optInStatus}</span>
                    <span className="text-[10px] text-slate-500">{activeDrawerContact.optInDate ? new Date(activeDrawerContact.optInDate).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Sumber: {activeDrawerContact.optInSource || 'Formulir Pendaftaran Nasabah'}
                  </p>
                  {activeDrawerContact.consentNote && (
                    <p className="text-[10px] text-slate-500 italic mt-1">"{activeDrawerContact.consentNote}"</p>
                  )}
                </div>
              </div>

              {/* Product & Sales Info */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-700">Detail Produk & Sales</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="p-2.5 rounded-lg bg-slate-50 border">
                    <span className="text-[10px] text-slate-400 block">Produk Minat</span>
                    <strong className="text-slate-900">{activeDrawerContact.product}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border">
                    <span className="text-[10px] text-slate-400 block">Sales PIC</span>
                    <strong className="text-slate-900">{activeDrawerContact.pic}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border">
                    <span className="text-[10px] text-slate-400 block">Kategori</span>
                    <strong className="text-slate-900">{activeDrawerContact.category}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border">
                    <span className="text-[10px] text-slate-400 block">Status Nasabah</span>
                    <strong className="text-slate-900">{activeDrawerContact.customerStatus}</strong>
                  </div>
                </div>
              </div>

              {/* Custom Personalization Fields */}
              {activeDrawerContact.customFields && Object.keys(activeDrawerContact.customFields).length > 0 && (
                <div>
                  <div className="font-semibold text-slate-700 mb-1.5">Custom Personalization Fields</div>
                  <div className="p-3 rounded-lg bg-slate-50 border space-y-1.5">
                    {Object.entries(activeDrawerContact.customFields).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="font-mono text-slate-500">{`{{${k}}}`}:</span>
                        <span className="font-semibold text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveDrawerContact(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Contact Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!contactToDelete}
        onClose={() => setContactToDelete(null)}
        onConfirm={() => {
          if (contactToDelete) {
            deleteContact(contactToDelete.id);
            setContactToDelete(null);
          }
        }}
        title="Hapus Data Kontak Nasabah?"
        message={`Apakah Anda yakin ingin menghapus nasabah "${contactToDelete?.name}" (${contactToDelete?.phone})? Data ini akan dihapus dari web secara permanen.`}
        itemName={contactToDelete ? `${contactToDelete.name} - ${contactToDelete.phone}` : undefined}
        confirmText="Hapus Kontak"
      />

      {/* Bulk Delete Contacts Modal */}
      <ConfirmDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={() => {
          bulkDeleteContacts(selectedIds);
          setSelectedIds([]);
        }}
        title={`Bulk Delete: Hapus ${selectedIds.length} Kontak Terpilih?`}
        message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} kontak nasabah terpilih secara massal? Seluruh data profil nasabah, riwayat, dan nomor WhatsApp ini akan segera dihapus permanen dari database web.`}
        itemName={
          selectedIds.length > 0
            ? (() => {
                const selected = contacts.filter(c => selectedIds.includes(c.id));
                const preview = selected.slice(0, 3).map(c => `${c.name} (${c.phone})`).join(', ');
                const remaining = selected.length - 3;
                return remaining > 0 ? `${preview} ...dan +${remaining} kontak lainnya` : preview;
              })()
            : undefined
        }
        confirmText={`Konfirmasi Bulk Delete (${selectedIds.length} Kontak)`}
      />

      {/* Datalist for PIC Autocomplete */}
      <datalist id="pic-datalist">
        {uniquePics.map(pic => (
          <option key={pic} value={pic} />
        ))}
      </datalist>

      {/* Modal: Sunting & Ganti Nama Sales / PIC */}
      {showPicManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sunting Nama Sales / PIC</h3>
                  <p className="text-[11px] text-slate-500">Ubah nama PIC di database nasabah, chat, & pipeline</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPicManagerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedOldPicToRename && newPicName.trim()) {
                  renamePicGlobal(selectedOldPicToRename, newPicName.trim());
                  setShowPicManagerModal(false);
                }
              }}
              className="mt-4 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Sales / PIC yang Ingin Diganti:
                </label>
                <select
                  value={selectedOldPicToRename}
                  onChange={(e) => {
                    setSelectedOldPicToRename(e.target.value);
                    setNewPicName(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                >
                  {uniquePics.map(pic => (
                    <option key={pic} value={pic}>
                      {pic} ({picStats[pic] || 0} nasabah)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Masukkan Nama Baru Sales / PIC:
                </label>
                <input
                  type="text"
                  required
                  value={newPicName}
                  onChange={(e) => setNewPicName(e.target.value)}
                  placeholder="Contoh: Bagus Pratama, S.E."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1.5 bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200">
                  Seluruh <strong className="font-bold">{picStats[selectedOldPicToRename] || 0} kontak nasabah</strong> yang saat ini ditugaskan ke <strong className="font-bold">"{selectedOldPicToRename}"</strong> akan otomatis diperbarui ke nama baru.
                </p>
              </div>

              {/* Quick List of all PICs */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  Daftar Sales PIC Aktif ({uniquePics.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {uniquePics.map(pic => (
                    <div 
                      key={pic}
                      onClick={() => {
                        setSelectedOldPicToRename(pic);
                        setNewPicName(pic);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedOldPicToRename === pic 
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                          {pic.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs">{pic}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                        {picStats[pic] || 0} kontak
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPicManagerModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newPicName.trim() || newPicName.trim() === selectedOldPicToRename}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Nama Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Entire Contacts Database Modal */}
      <ConfirmDeleteModal
        isOpen={showResetDatabaseModal}
        onClose={() => setShowResetDatabaseModal(false)}
        onConfirm={() => {
          clearContactsDatabase();
          setSelectedIds([]);
          setShowResetDatabaseModal(false);
        }}
        title="Reset Seluruh Database Kontak Excel?"
        message={`Apakah Anda yakin ingin menghapus seluruh (${contacts.length}) data kontak nasabah yang telah diunggah dari file Excel/CSV? Tindakan ini akan mengosongkan database kontak dan mengembalikan aplikasi ke tampilan kosong tanpa data.`}
        confirmText="Ya, Hapus & Kosongkan Database"
        cancelText="Batal"
      />
    </div>
  );
};

// Subcomponent: Add / Edit Contact Modal Form
const ContactFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSave: (data: Partial<Contact>) => void;
}> = ({ isOpen, onClose, contact, onSave }) => {
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [city, setCity] = useState(contact?.city || 'Jakarta Selatan');
  const [region, setRegion] = useState(contact?.region || 'DKI Jakarta');
  const [product, setProduct] = useState(contact?.product || 'Cicil Emas');
  const [category, setCategory] = useState(contact?.category || 'Retail');
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus>(contact?.customerStatus || 'AKTIF');
  const [optInStatus, setOptInStatus] = useState<OptInStatus>(contact?.optInStatus || 'OPTED_IN');
  const [pic, setPic] = useState(contact?.pic || 'Bagus Pratama');
  const [tagsStr, setTagsStr] = useState(contact?.tags.join(', ') || 'WARM LEAD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    onSave({
      name,
      phone,
      email,
      city,
      region,
      product,
      category,
      customerStatus,
      optInStatus,
      pic,
      tags: tagArray,
      optInSource: 'Admin Input Manual',
      optInDate: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            {contact ? 'Edit Kontak Nasabah' : 'Tambah Kontak Baru'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kota</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Wilayah / Provinsi</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Produk</label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Cicil Emas">Cicil Emas</option>
                <option value="Gadai">Gadai</option>
                <option value="Tabungan Emas">Tabungan Emas</option>
                <option value="Mulia">Mulia</option>
                <option value="Amanah">Amanah</option>
                <option value="Non Gadai">Non Gadai</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Nasabah</label>
              <select
                value={customerStatus}
                onChange={(e) => setCustomerStatus(e.target.value as CustomerStatus)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="AKTIF">Aktif</option>
                <option value="PROSPEK">Prospek</option>
                <option value="DORMANT">Dormant</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Consent (Opt-in)</label>
              <select
                value={optInStatus}
                onChange={(e) => setOptInStatus(e.target.value as OptInStatus)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="OPTED_IN">OPTED_IN</option>
                <option value="OPTED_OUT">OPTED_OUT</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sales / PIC</label>
              <input
                type="text"
                list="pic-datalist"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Pilih atau ketik nama PIC"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tags (pisahkan koma)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="HOT LEAD, CICIL EMAS"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              Simpan Kontak
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
