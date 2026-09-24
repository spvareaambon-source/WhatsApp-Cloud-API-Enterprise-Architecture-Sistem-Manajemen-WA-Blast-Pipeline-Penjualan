import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { normalizeWhatsAppNumber } from '../../utils/phoneNormalizer';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Check, 
  Info,
  Download,
  FileText,
  Layers,
  Sparkles,
  Trash2
} from 'lucide-react';

interface ParsedRow {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  region?: string;
  product?: string;
  category?: string;
  pic?: string;
  optIn?: string;
  isValidPhone: boolean;
  normalizedPhone: string;
  isDuplicate: boolean;
  isSuppressed: boolean;
  validationError?: string;
}

export const ImportWizard: React.FC = () => {
  const { contacts, suppressionList, importContacts, clearContactsDatabase, setActiveView, addToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  
  // Wipe database before import state
  const [wipeBeforeImport, setWipeBeforeImport] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Excel Sheet Selection for workbooks with multiple worksheets
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbookRef, setWorkbookRef] = useState<XLSX.WorkBook | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column mapping
  const [mapping, setMapping] = useState<{
    nameCol: string;
    phoneCol: string;
    emailCol: string;
    cityCol: string;
    productCol: string;
    picCol: string;
  }>({
    nameCol: '',
    phoneCol: '',
    emailCol: '',
    cityCol: '',
    productCol: '',
    picCol: ''
  });

  // Validated results
  const [processedRows, setProcessedRows] = useState<ParsedRow[]>([]);
  const [importSummary, setImportSummary] = useState<{
    totalRows: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
    suppressedCount: number;
  } | null>(null);

  // Auto-detect and populate mapping based on detected headers
  const autoDetectColumns = (headers: string[], rows: any[]) => {
    setFileHeaders(headers);
    setRawRows(rows);

    const nameCol = headers.find(h => /^(nama|name|nama\s*nasabah|nama\s*lengkap|customer|nama_nasabah)$/i.test(h)) ||
                    headers.find(h => /nama|name/i.test(h)) || headers[0] || '';

    const phoneCol = headers.find(h => /^(nomor_whatsapp|no_wa|whatsapp|wa|nomor\s*wa|nomor\s*whatsapp|no\s*hp|nomor\s*hp|phone|telepon|handphone|mobile|telp)$/i.test(h)) ||
                     headers.find(h => /phone|wa|whatsapp|nomor|telepon|hp|telp/i.test(h)) || headers[1] || '';

    const emailCol = headers.find(h => /^(email|e-mail|mail|surel)$/i.test(h)) ||
                     headers.find(h => /email|mail/i.test(h)) || '';

    const cityCol = headers.find(h => /^(kota|city|domisili|kabupaten|wilayah)$/i.test(h)) ||
                    headers.find(h => /kota|city|domisili/i.test(h)) || '';

    const productCol = headers.find(h => /^(produk|product|layanan|minat\s*produk|produk\s*minat)$/i.test(h)) ||
                       headers.find(h => /produk|product|layanan/i.test(h)) || '';

    const picCol = headers.find(h => /^(pic|sales|petugas|sales\s*pic|account\s*officer|ao)$/i.test(h)) ||
                   headers.find(h => /pic|sales|petugas/i.test(h)) || '';

    setMapping({
      nameCol,
      phoneCol,
      emailCol,
      cityCol,
      productCol,
      picCol
    });
  };

  // Process data from a selected worksheet
  const processWorksheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet) return;

    // Convert sheet to array of objects with raw strings preserved (to keep leading 0s on phone numbers)
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { 
      raw: false,
      defval: '' 
    });

    if (jsonRows.length === 0) {
      addToast({ type: 'warning', title: 'Worksheet Kosong', message: `Sheet "${sheetName}" tidak memiliki baris data.` });
      return;
    }

    // Extract headers from the keys of the first row or sheet range
    const headers = Object.keys(jsonRows[0] || {});
    autoDetectColumns(headers, jsonRows);
    setSelectedSheet(sheetName);
    setStep(2);
  };

  // Handler for file reading (supports .xlsx, .xls, .csv, .txt)
  const handleFile = (file: File) => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv') || file.name.endsWith('.txt');

    if (!isExcel && !isCsv) {
      addToast({ 
        type: 'error', 
        title: 'Format File Tidak Didukung', 
        message: 'Mohon upload file dengan format Excel (.xlsx, .xls) atau CSV (.csv).' 
      });
      return;
    }

    setFileName(file.name);
    const sizeInKB = (file.size / 1024).toFixed(1);
    setFileSize(`${sizeInKB} KB`);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: true,
          cellNF: false,
          cellText: true
        });

        setWorkbookRef(workbook);
        setSheetNames(workbook.SheetNames);

        if (workbook.SheetNames.length === 0) {
          addToast({ type: 'error', title: 'File Kosong', message: 'File tidak memiliki sheet data.' });
          return;
        }

        // Process the first sheet by default
        const initialSheet = workbook.SheetNames[0];
        processWorksheet(workbook, initialSheet);

        addToast({ 
          type: 'success', 
          title: 'File Berhasil Dibaca', 
          message: `${file.name} (${workbook.SheetNames.length} sheet terdeteksi)` 
        });
      } catch (err: any) {
        console.error('Error parsing Excel/CSV:', err);
        addToast({ 
          type: 'error', 
          title: 'Gagal Membaca File', 
          message: err?.message || 'Pastikan file tidak rusak atau terproteksi password.' 
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Download official pre-formatted Excel template (.xlsx)
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'Nama_Nasabah': 'Bambang Soediro',
        'Nomor_WhatsApp': '081233445566',
        'Email': 'bambang.soediro@gmail.com',
        'Kota': 'Surabaya',
        'Produk_Minat': 'Cicil Emas',
        'Sales_PIC': 'Bagus Pratama'
      },
      {
        'Nama_Nasabah': 'Fajar Nugraha',
        'Nomor_WhatsApp': '081299887766',
        'Email': 'fajar.nugraha@gmail.com',
        'Kota': 'Bandung',
        'Produk_Minat': 'Gadai Tabungan Emas',
        'Sales_PIC': 'Siti Rahmawati'
      },
      {
        'Nama_Nasabah': 'Yulia Putri',
        'Nomor_WhatsApp': '085611223344',
        'Email': 'yulia.putri@yahoo.com',
        'Kota': 'Jakarta Selatan',
        'Produk_Minat': 'Amanah',
        'Sales_PIC': 'Rudi Hartono'
      },
      {
        'Nama_Nasabah': 'Hendra Setiawan',
        'Nomor_WhatsApp': '087812345678',
        'Email': 'hendra.setiawan@corp.com',
        'Kota': 'Semarang',
        'Produk_Minat': 'Cicil Emas',
        'Sales_PIC': 'Bagus Pratama'
      },
      {
        'Nama_Nasabah': 'Dewi Lestari',
        'Nomor_WhatsApp': '081398765432',
        'Email': 'dewi.lestari@gmail.com',
        'Kota': 'Medan',
        'Produk_Minat': 'Tabungan Emas',
        'Sales_PIC': 'Siti Rahmawati'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set auto column widths
    const colWidths = [
      { wch: 20 }, // Nama_Nasabah
      { wch: 18 }, // Nomor_WhatsApp
      { wch: 28 }, // Email
      { wch: 16 }, // Kota
      { wch: 22 }, // Produk_Minat
      { wch: 18 }  // Sales_PIC
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Database Kontak');
    XLSX.writeFile(wb, 'Template_Import_Nasabah_WABlast.xlsx');

    addToast({ 
      type: 'success', 
      title: 'Template Excel Diunduh', 
      message: 'File Template_Import_Nasabah_WABlast.xlsx berhasil didownload.' 
    });
  };

  // Load sample dummy contacts for instant testing
  const handleLoadSample = () => {
    const sampleRows = [
      {
        Nama: 'Bambang Soediro',
        Nomor_WhatsApp: '081233445566',
        Email: 'bambang@gmail.com',
        Kota: 'Surabaya',
        Produk: 'Cicil Emas',
        PIC: 'Bagus Pratama'
      },
      {
        Nama: 'Fajar Nugraha',
        Nomor_WhatsApp: '+6281299887766',
        Email: 'fajar@gmail.com',
        Kota: 'Bandung',
        Produk: 'Gadai',
        PIC: 'Siti Rahmawati'
      },
      {
        Nama: 'Yulia Putri',
        Nomor_WhatsApp: '085611223344',
        Email: 'yulia@yahoo.com',
        Kota: 'Jakarta Selatan',
        Produk: 'Amanah',
        PIC: 'Rudi Hartono'
      },
      {
        Nama: 'Nomor Salah (Format Invalid)',
        Nomor_WhatsApp: '12345',
        Email: 'invalid@test.com',
        Kota: 'Semarang',
        Produk: 'Tabungan Emas',
        PIC: 'Bagus Pratama'
      },
      {
        Nama: 'Agus Prasetyo (Duplikat)',
        Nomor_WhatsApp: '081210000000',
        Email: 'agus.prasetyo1@gmail.com',
        Kota: 'Jakarta',
        Produk: 'Cicil Emas',
        PIC: 'Bagus Pratama'
      },
      {
        Nama: 'Doni Iskandar (Suppressed)',
        Nomor_WhatsApp: '0811990011',
        Email: 'doni@test.com',
        Kota: 'Jakarta',
        Produk: 'Gadai',
        PIC: 'Siti Rahmawati'
      }
    ];

    setFileName('contoh_data_prospek_nasabah.xlsx');
    setFileSize('14.2 KB');
    setSheetNames(['Data Nasabah']);
    setSelectedSheet('Data Nasabah');
    autoDetectColumns(Object.keys(sampleRows[0]), sampleRows);
    setStep(2);
  };

  const runValidation = () => {
    const existingPhones = new Set(contacts.map(c => c.phone));
    const suppressedPhones = new Set(suppressionList.map(s => s.phone));

    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let suppressedCount = 0;

    const results: ParsedRow[] = rawRows.map(row => {
      const rawName = String(row[mapping.nameCol] || 'Nasabah Prospek').trim();
      const rawPhone = String(row[mapping.phoneCol] || '').trim();
      const email = mapping.emailCol ? String(row[mapping.emailCol] || '').trim() : '';
      const city = mapping.cityCol ? String(row[mapping.cityCol] || 'Jakarta').trim() : 'Jakarta';
      const product = mapping.productCol ? String(row[mapping.productCol] || 'Cicil Emas').trim() : 'Cicil Emas';
      const pic = mapping.picCol ? String(row[mapping.picCol] || 'Bagus Pratama').trim() : 'Bagus Pratama';

      const norm = normalizeWhatsAppNumber(rawPhone);

      let isDuplicate = false;
      let isSuppressed = false;
      let validationError: string | undefined = undefined;

      if (!norm.isValid) {
        invalidCount++;
        validationError = norm.error;
      } else {
        if (existingPhones.has(norm.normalized)) {
          isDuplicate = true;
          duplicateCount++;
          validationError = 'Nomor sudah ada di database (Duplikat)';
        } else if (suppressedPhones.has(norm.normalized)) {
          isSuppressed = true;
          suppressedCount++;
          validationError = 'Nomor terdaftar di Suppression List (Opt-out)';
        } else {
          validCount++;
        }
      }

      return {
        name: rawName,
        phone: rawPhone,
        email,
        city,
        region: 'Nasional',
        product,
        category: 'Retail',
        pic,
        isValidPhone: norm.isValid,
        normalizedPhone: norm.normalized,
        isDuplicate,
        isSuppressed,
        validationError
      };
    });

    setProcessedRows(results);
    setImportSummary({
      totalRows: rawRows.length,
      validCount,
      invalidCount,
      duplicateCount,
      suppressedCount
    });

    setStep(3);
  };

  const handleConfirmImport = () => {
    if (wipeBeforeImport) {
      clearContactsDatabase();
    }

    const toImport = processedRows.filter(r => r.isValidPhone && !r.isDuplicate && !r.isSuppressed).map(r => ({
      name: r.name,
      phone: r.normalizedPhone,
      email: r.email || `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@client.com`,
      city: r.city || 'Jakarta',
      region: 'DKI Jakarta',
      category: 'Retail',
      product: r.product || 'Cicil Emas',
      customerStatus: 'PROSPEK' as const,
      tags: ['EXCEL IMPORT', (r.product || 'PROSPEK').toUpperCase()],
      pic: r.pic || 'Bagus Pratama',
      optInStatus: 'OPTED_IN' as const,
      optInDate: new Date().toISOString(),
      optInSource: `Excel/CSV Import: ${fileName} (${selectedSheet || 'Sheet1'})`,
      consentNote: 'Diimpor via Microsoft Excel Worksheet dengan status opt-in terverifikasi'
    }));

    importContacts(toImport);
    setStep(4);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header & Stepper */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Import Database Kontak (Excel / CSV)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dukungan penuh file Microsoft Excel Worksheet (<strong>.xlsx</strong>, <strong>.xls</strong>) dan CSV (<strong>.csv</strong>).
            </p>
          </div>

          <button
            onClick={handleDownloadExcelTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
            title="Download template Excel resmi berformat .xlsx"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Download Template Excel (.xlsx)</span>
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>1</span>
            <span>1. Upload File (.xlsx / .csv)</span>
          </div>
          <span className="text-slate-300">———</span>

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>2</span>
            <span>2. Mapping Kolom</span>
          </div>
          <span className="text-slate-300">———</span>

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>3</span>
            <span>3. Audit Validasi</span>
          </div>
          <span className="text-slate-300">———</span>

          <div className={`flex items-center gap-2 ${step === 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>4</span>
            <span>4. Selesai</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Upload File */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Current Database Info & Reset Option */}
          {contacts.length > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Database Saat Ini: {contacts.length} Kontak Nasabah</span>
                  <p className="text-[11px] text-slate-500">Anda dapat mengimpor file untuk menambah data, atau mereset database ke tampilan kosong terlebih dahulu.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                title="Kosongkan seluruh database kontak dan kembali ke tampilan kosong tanpa data"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Database ({contacts.length})</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center gap-2.5 text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span>Database kontak saat ini sedang kosong (tampilan bersih tanpa data). File Excel yang Anda unggah akan menjadi basis data baru.</span>
            </div>
          )}

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]' 
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-1">
              Drop file Microsoft Excel (.xlsx, .xls) atau CSV di sini
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Mendukung file spreadsheet <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>. Sistem akan membaca nomor WhatsApp secara presisi tanpa merusak format angka.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Pilih File Excel dari Komputer</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Template Format Excel (.xlsx)</div>
                  <div className="text-slate-500 text-[11px]">Download template siap isi dengan kolom standar</div>
                </div>
              </div>

              <button
                onClick={handleDownloadExcelTemplate}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg shadow-2xs cursor-pointer shrink-0"
              >
                Unduh
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Coba Data Contoh</div>
                  <div className="text-slate-500 text-[11px]">Muat 6 kontak uji coba untuk preview instan</div>
                </div>
              </div>

              <button
                onClick={handleLoadSample}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg shadow-2xs cursor-pointer shrink-0"
              >
                Muat Contoh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping & Sheet Selector */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Petakan Kolom Data (Column Mapping)
              </h3>
              <p className="text-xs text-slate-500">
                File: <strong className="text-slate-800">{fileName}</strong> {fileSize && `(${fileSize})`} • <strong className="text-emerald-700">{rawRows.length} baris</strong> terdeteksi
              </p>
            </div>

            <button 
              onClick={() => {
                setStep(1);
                setWorkbookRef(null);
                setSheetNames([]);
              }} 
              className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer self-start sm:self-auto"
            >
              Ganti File
            </button>
          </div>

          {/* Worksheet Tab Selector (if multiple sheets exist in Excel) */}
          {sheetNames.length > 1 && workbookRef && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Pilih Worksheet / Tab Excel:
              </label>
              <div className="flex flex-wrap gap-2">
                {sheetNames.map((sheet) => (
                  <button
                    key={sheet}
                    type="button"
                    onClick={() => processWorksheet(workbookRef, sheet)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedSheet === sheet
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sheet}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Column Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kolom Nama Nasabah <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.nameCol}
                onChange={(e) => setMapping(m => ({ ...m, nameCol: e.target.value }))}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium"
              >
                <option value="">-- Pilih Kolom --</option>
                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kolom Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.phoneCol}
                onChange={(e) => setMapping(m => ({ ...m, phoneCol: e.target.value }))}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium"
              >
                <option value="">-- Pilih Kolom --</option>
                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kolom Email</label>
              <select
                value={mapping.emailCol}
                onChange={(e) => setMapping(m => ({ ...m, emailCol: e.target.value }))}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium"
              >
                <option value="">-- Opsional --</option>
                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kolom Kota / Domisili</label>
              <select
                value={mapping.cityCol}
                onChange={(e) => setMapping(m => ({ ...m, cityCol: e.target.value }))}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium"
              >
                <option value="">-- Opsional --</option>
                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kolom Minat Produk</label>
              <select
                value={mapping.productCol}
                onChange={(e) => setMapping(m => ({ ...m, productCol: e.target.value }))}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium"
              >
                <option value="">-- Opsional --</option>
                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kolom Petugas PIC / Sales</label>
              <select
                value={mapping.picCol}
                onChange={(e) => setMapping(m => ({ ...m, picCol: e.target.value }))}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium"
              >
                <option value="">-- Opsional --</option>
                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <button
              disabled={!mapping.nameCol || !mapping.phoneCol}
              onClick={runValidation}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>Lanjutkan ke Validasi & Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview, Validation & Duplicate Detection */}
      {step === 3 && importSummary && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hasil Audit & Validasi Database</h3>
            <p className="text-xs text-slate-500">
              Pemeriksaan format nomor WhatsApp E.164, deteksi duplikat, dan pengecekan suppression list selesai.
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Baris</span>
              <strong className="text-lg text-slate-800">{importSummary.totalRows}</strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Siap Diimpor (Valid)</span>
              <strong className="text-lg text-emerald-800">{importSummary.validCount}</strong>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Nomor Invalid</span>
              <strong className="text-lg text-rose-800">{importSummary.invalidCount}</strong>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Duplikat</span>
              <strong className="text-lg text-amber-800">{importSummary.duplicateCount}</strong>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">Suppression (Opt-out)</span>
              <strong className="text-lg text-purple-800">{importSummary.suppressedCount}</strong>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b text-xs font-bold text-slate-700">
              Preview Baris Data (Status Validasi Per Baris)
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b text-slate-600 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Nama</th>
                    <th className="p-2.5">Nomor Asli</th>
                    <th className="p-2.5">Hasil Normalisasi E.164</th>
                    <th className="p-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedRows.map((r, i) => (
                    <tr key={i} className={!r.isValidPhone || r.isDuplicate || r.isSuppressed ? 'bg-amber-50/30' : ''}>
                      <td className="p-2.5">
                        {r.isValidPhone && !r.isDuplicate && !r.isSuppressed ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            VALID
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            LEWATI
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900">{r.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{r.phone}</td>
                      <td className="p-2.5 font-mono text-emerald-700 font-bold">{r.normalizedPhone || '-'}</td>
                      <td className="p-2.5 text-[11px] text-slate-500">
                        {r.validationError || 'Format internasional valid'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Option to clear existing database before importing */}
          {contacts.length > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={wipeBeforeImport}
                  onChange={(e) => setWipeBeforeImport(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-slate-900">
                  Kosongkan database sebelumnya ({contacts.length} kontak) sebelum menyimpan hasil impor ini
                </span>
              </label>
              {wipeBeforeImport && (
                <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full shrink-0 border border-rose-200">
                  Reset & Ganti Total
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Ubah Mapping
            </button>
            <button
              disabled={importSummary.validCount === 0}
              onClick={handleConfirmImport}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Konfirmasi & Impor {importSummary.validCount} Kontak Valid
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success Summary */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Database Berhasil Diimpor!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Semua kontak valid dari file <strong>{fileName}</strong> telah dinormalisasi ke standar resmi WhatsApp E.164 (+62...) dan siap digunakan untuk blast campaign.
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setStep(1);
                setFileName('');
                setFileSize('');
                setWorkbookRef(null);
                setSheetNames([]);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Import File Lain
            </button>
            <button
              onClick={() => setActiveView('contacts')}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
            >
              Buka Database Kontak
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => {
          clearContactsDatabase();
          setShowResetModal(false);
        }}
        title="Reset Seluruh Database Kontak Excel?"
        message={`Apakah Anda yakin ingin menghapus seluruh (${contacts.length}) data kontak nasabah dari sistem? Database kontak akan dikosongkan dan kembali ke tampilan kosong tanpa data.`}
        confirmText="Ya, Kosongkan Database"
        cancelText="Batal"
      />
    </div>
  );
};
