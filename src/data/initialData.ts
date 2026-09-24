import { 
  Contact, 
  Tag, 
  Segment, 
  MessageTemplate, 
  Campaign, 
  MessageLog, 
  Conversation, 
  FollowUp, 
  SuppressionItem, 
  AuditLog, 
  User, 
  WhatsAppConfig 
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    email: 'spvareaambon@gmail.com',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '6281211223344',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_2',
    username: 'siti',
    password: 'password123',
    name: 'Siti Rahmawati',
    email: 'siti.manager@company.co.id',
    role: 'MANAGER',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '6281255667788',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_3',
    username: 'bagus',
    password: 'password123',
    name: 'Bagus Pratama',
    email: 'bagus.sales@company.co.id',
    role: 'SALES',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '6281399887766',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag_1', name: 'HOT LEAD', color: '#ef4444', category: 'Priority', count: 24, createdAt: '2026-01-10T08:00:00Z' },
  { id: 'tag_2', name: 'WARM LEAD', color: '#f59e0b', category: 'Priority', count: 35, createdAt: '2026-01-10T08:00:00Z' },
  { id: 'tag_3', name: 'COLD LEAD', color: '#3b82f6', category: 'Priority', count: 18, createdAt: '2026-01-10T08:00:00Z' },
  { id: 'tag_4', name: 'CICIL EMAS', color: '#eab308', category: 'Product', count: 42, createdAt: '2026-01-12T08:00:00Z' },
  { id: 'tag_5', name: 'AMANAH', color: '#10b981', category: 'Product', count: 29, createdAt: '2026-01-12T08:00:00Z' },
  { id: 'tag_6', name: 'GADAI', color: '#8b5cf6', category: 'Product', count: 31, createdAt: '2026-01-12T08:00:00Z' },
  { id: 'tag_7', name: 'NON GADAI', color: '#64748b', category: 'Product', count: 16, createdAt: '2026-01-12T08:00:00Z' },
  { id: 'tag_8', name: 'TOP UP', color: '#06b6d4', category: 'Lifecycle', count: 20, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'tag_9', name: 'FOLLOW UP', color: '#ec4899', category: 'Action', count: 38, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'tag_10', name: 'PRIORITAS', color: '#14b8a6', category: 'Tier', count: 19, createdAt: '2026-01-15T08:00:00Z' },
];

export const INITIAL_SUPPRESSION: SuppressionItem[] = [
  {
    id: 'sup_1',
    phone: '62811990011',
    contactName: 'Doni Iskandar',
    reason: 'OPT_OUT',
    addedAt: '2026-02-10T14:20:00Z',
    notes: 'Pelanggan mengirim kata STOP via WhatsApp'
  },
  {
    id: 'sup_2',
    phone: '62812000000',
    contactName: 'Nomor Hangus Tes',
    reason: 'INVALID_NUMBER',
    addedAt: '2026-02-15T11:00:00Z',
    notes: 'Meta Cloud API return 131026 (Unregistered WhatsApp user)'
  },
  {
    id: 'sup_3',
    phone: '628131234432',
    contactName: 'Irwan Setiawan',
    reason: 'BLOCKED',
    addedAt: '2026-02-18T09:45:00Z',
    notes: 'Permintaan tertulis penghapusan data (Privacy Law)'
  }
];

// Helper to generate 100 Indonesian contacts
const firstNames = ['Agus', 'Budi', 'Chandra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hendra', 'Indah', 'Joko', 'Kartika', 'Lestari', 'Muhammad', 'Nur', 'Oki', 'Pratiwi', 'Rian', 'Sari', 'Tri', 'Untung', 'Vina', 'Wahyu', 'Yudi', 'Zainal', 'Andi', 'Rina', 'Fajar', 'Maya', 'Denny', 'Ratna'];
const lastNames = ['Prasetyo', 'Kusuma', 'Santoso', 'Wijaya', 'Siregar', 'Wibowo', 'Hidayat', 'Saputra', 'Permana', 'Nugroho', 'Gunawan', 'Sutrisno', 'Purnomo', 'Utami', 'Lubis', 'Halim', 'Subekti', 'Kurniawan', 'Firmansyah', 'Simanjuntak'];
const cities = [
  { city: 'Jakarta Selatan', region: 'DKI Jakarta' },
  { city: 'Jakarta Pusat', region: 'DKI Jakarta' },
  { city: 'Bandung', region: 'Jawa Barat' },
  { city: 'Surabaya', region: 'Jawa Timur' },
  { city: 'Semarang', region: 'Jawa Tengah' },
  { city: 'Medan', region: 'Sumatera Utara' },
  { city: 'Makassar', region: 'Sulawesi Selatan' },
  { city: 'Denpasar', region: 'Bali' },
  { city: 'Yogyakarta', region: 'DI Yogyakarta' },
  { city: 'Palembang', region: 'Sumatera Selatan' },
  { city: 'Malang', region: 'Jawa Timur' },
  { city: 'Ambon', region: 'Maluku' },
];
const products = ['Cicil Emas', 'Gadai', 'Tabungan Emas', 'Mulia', 'Amanah', 'Non Gadai'];
const pics = ['Bagus Pratama', 'Siti Rahmawati', 'Rudi Hartono', 'Dewi Lestari'];
const categories = ['Retail', 'Prioritas', 'UMKM', 'Korporasi'];

export const INITIAL_CONTACTS: Contact[] = Array.from({ length: 100 }).map((_, i) => {
  const fName = firstNames[i % firstNames.length];
  const lName = lastNames[(i * 3) % lastNames.length];
  const fullName = `${fName} ${lName}`;
  const loc = cities[i % cities.length];
  const prod = products[i % products.length];
  const pic = pics[i % pics.length];
  const cat = categories[i % categories.length];
  
  // Normalization sample: 62812...
  const phoneSuffix = (10000000 + i * 83421).toString().slice(0, 8);
  const phone = `62812${phoneSuffix}`;

  const isOptedOut = i === 12 || i === 38;
  const isUnknown = i % 15 === 0;
  const optInStatus = isOptedOut ? 'OPTED_OUT' : (isUnknown ? 'UNKNOWN' : 'OPTED_IN');
  
  const tags = [
    i % 3 === 0 ? 'HOT LEAD' : i % 3 === 1 ? 'WARM LEAD' : 'COLD LEAD',
    prod.toUpperCase(),
    i % 4 === 0 ? 'PRIORITAS' : 'FOLLOW UP'
  ];

  const status: 'AKTIF' | 'PROSPEK' | 'DORMANT' = i % 5 === 0 ? 'DORMANT' : (i % 2 === 0 ? 'AKTIF' : 'PROSPEK');

  return {
    id: `ct_${i + 1}`,
    name: fullName,
    phone,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i + 1}@gmail.com`,
    city: loc.city,
    region: loc.region,
    category: cat,
    product: prod,
    customerStatus: status,
    tags,
    pic,
    optInStatus,
    optInDate: optInStatus === 'OPTED_IN' ? '2026-01-15T10:00:00Z' : undefined,
    optInSource: optInStatus === 'OPTED_IN' ? 'Formulir Aplikasi Cabang / CS' : undefined,
    consentNote: optInStatus === 'OPTED_IN' ? 'Nasabah menyetujui komunikasi penawaran produk via WhatsApp' : undefined,
    optOutDate: isOptedOut ? '2026-02-10T14:20:00Z' : undefined,
    lastContact: `2026-02-${(10 + (i % 15)).toString().padStart(2, '0')}T09:30:00Z`,
    lastReply: i % 4 === 0 ? `2026-02-${(12 + (i % 12)).toString().padStart(2, '0')}T14:20:00Z` : undefined,
    customFields: {
      namaUsaha: `${fullName} Mandiri Store`,
      plafonGadai: `Rp ${(15 + (i % 80)) * 1000000}`
    },
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z'
  };
});

export const INITIAL_SEGMENTS: Segment[] = [
  {
    id: 'seg_1',
    name: 'Nasabah Potensial Cicil Emas',
    description: 'Kontak dengan minat produk Cicil Emas dan status Opt-in aktif',
    rules: [
      { id: 'r1', field: 'product', operator: 'equals', value: 'Cicil Emas' },
      { id: 'r2', field: 'optInStatus', operator: 'equals', value: 'OPTED_IN' }
    ],
    matchType: 'ALL',
    contactCount: 22,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-18T14:00:00Z'
  },
  {
    id: 'seg_2',
    name: 'Prioritas Jabodetabek & Jawa',
    description: 'Kategori Prioritas di wilayah DKI Jakarta dan Jawa Barat',
    rules: [
      { id: 'r3', field: 'category', operator: 'equals', value: 'Prioritas' },
      { id: 'r4', field: 'optInStatus', operator: 'equals', value: 'OPTED_IN' }
    ],
    matchType: 'ALL',
    contactCount: 28,
    createdAt: '2026-01-20T10:30:00Z',
    updatedAt: '2026-02-19T08:15:00Z'
  },
  {
    id: 'seg_3',
    name: 'Nasabah Gadai & Top Up Siap Follow-up',
    description: 'Nasabah produk Gadai yang siap untuk penawaran top up plafond',
    rules: [
      { id: 'r5', field: 'product', operator: 'equals', value: 'Gadai' },
      { id: 'r6', field: 'customerStatus', operator: 'equals', value: 'AKTIF' }
    ],
    matchType: 'ALL',
    contactCount: 19,
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-20T16:00:00Z'
  }
];

export const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl_1',
    name: 'promo_cicil_emas_berkah',
    category: 'MARKETING',
    language: 'id',
    headerType: 'TEXT',
    headerContent: 'Spesial Investasi Masa Depan ✨',
    body: 'Halo Bapak/Ibu *{{nama}}*,\n\nKabar gembira! Kini Anda dapat memiliki portofolio logam mulia melalui program *{{produk}}* dengan margin ringan mulai 0.75% flat per bulan di wilayah *{{wilayah}}*.\n\nDapatkan souvenir eksklusif untuk akad investasi bulan ini. Hubungi petugas representatif kami *{{namaPetugas}}* untuk simulasi angsuran resmi.\n\n_Ketik STOP untuk berhenti menerima pesan info promo._',
    footer: 'PT Pegadaian (Persero) - Terdaftar & Diawasi OJK',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Saya Tertarik' },
      { type: 'QUICK_REPLY', text: 'Minta Simulasi' }
    ],
    variables: ['nama', 'produk', 'wilayah', 'namaPetugas'],
    approvalStatus: 'APPROVED',
    qualityRating: 'GREEN',
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-01-09T10:00:00Z'
  },
  {
    id: 'tpl_2',
    name: 'informasi_topup_gadai_fleksibel',
    category: 'MARKETING',
    language: 'id',
    headerType: 'NONE',
    body: 'Yth. Nasabah Terhormat *{{nama}}*,\n\nTerima kasih atas kepercayaan Anda menggunakan layanan *{{produk}}* kami. Kami informasikan bahwa nomor agunan Anda memiliki peluang estimasi kenaikan plafon hingga 25%.\n\nSegera hubungi PIC Anda, *{{namaPetugas}}*, atau kunjungi outlet cabang kami di kota *{{wilayah}}* untuk proses approval instan tanpa taksir ulang.\n\nTerima kasih,\nUnit Layanan Bisnis',
    footer: 'Layanan Resmi Terpercaya',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Cek Plafon Saya' },
      { type: 'QUICK_REPLY', text: 'Konsultasi PIC' }
    ],
    variables: ['nama', 'produk', 'namaPetugas', 'wilayah'],
    approvalStatus: 'APPROVED',
    qualityRating: 'GREEN',
    createdAt: '2026-01-12T14:00:00Z',
    updatedAt: '2026-01-12T17:00:00Z'
  },
  {
    id: 'tpl_3',
    name: 'undangan_webinar_literasi_keuangan',
    category: 'MARKETING',
    language: 'id',
    headerType: 'TEXT',
    headerContent: 'Undangan Edukasi Finansial 📈',
    body: 'Selamat siang Bapak/Ibu *{{nama}}*,\n\nKami mengundang Anda menghadiri Seminar Eksklusif Perencanaan Keuangan Syariah dengan bahasan produk *{{produk}}* dan mitigasi inflasi bersama pakar finansial nasional.\n\nTanggal: *{{tanggal}}*\nWaktu: 14:00 - 16:00 WIB\nMedia: Zoom Meeting (Akses VIP)\n\nKonfirmasi kehadiran Anda bersama Sales Officer kami *{{namaPetugas}}*.',
    footer: 'Edukasi Keuangan Berkelanjutan',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Daftar Webinar' }
    ],
    variables: ['nama', 'produk', 'tanggal', 'namaPetugas'],
    approvalStatus: 'APPROVED',
    qualityRating: 'GREEN',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-01-21T08:30:00Z'
  },
  {
    id: 'tpl_4',
    name: 'pengingat_jatuh_tempo_akad',
    category: 'UTILITY',
    language: 'id',
    headerType: 'NONE',
    body: 'Pemberitahuan Layanan *{{produk}}*:\n\nHalo *{{nama}}*, kami mengingatkan bahwa tanggal jatuh tempo transaksi Anda adalah pada *{{tanggal}}*.\n\nSilakan lakukan perpanjangan atau penyelesaian secara online melalui aplikasi atau menghubungi petugas *{{namaPetugas}}* untuk bantuan.',
    footer: 'Official Notification',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Konfirmasi Bayar' }
    ],
    variables: ['produk', 'nama', 'tanggal', 'namaPetugas'],
    approvalStatus: 'APPROVED',
    qualityRating: 'GREEN',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T15:00:00Z'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_1',
    name: 'Blast Promo Cicil Emas Ramadhan Berkah',
    description: 'Pengiriman massal penawaran investasi logam mulia untuk nasabah prioritas',
    segmentId: 'seg_1',
    segmentName: 'Nasabah Potensial Cicil Emas',
    templateId: 'tpl_1',
    templateName: 'promo_cicil_emas_berkah',
    senderPhoneId: 'PHONE_ID_OFFICIAL_1',
    scheduleType: 'NOW',
    timezone: 'Asia/Jakarta (WIB)',
    sendingStrategy: {
      batchSize: 20,
      delayBetweenBatchesSeconds: 3,
      dailyLimit: 1000
    },
    variableMappings: {
      'nama': 'name',
      'produk': 'product',
      'wilayah': 'city',
      'namaPetugas': 'pic'
    },
    status: 'COMPLETED',
    stats: {
      total: 22,
      queued: 0,
      sent: 22,
      delivered: 21,
      read: 19,
      failed: 1,
      replied: 8,
      conversion: 4
    },
    createdAt: '2026-02-18T09:00:00Z',
    startedAt: '2026-02-18T09:05:00Z',
    completedAt: '2026-02-18T09:12:00Z',
    createdBy: 'Dimas Wicaksono'
  },
  {
    id: 'cmp_2',
    name: 'Penaikan Plafon Gadai Nasabah Aktif',
    description: 'Pemberitahuan pre-approved top up plafond agunan untuk nasabah lancar',
    segmentId: 'seg_3',
    segmentName: 'Nasabah Gadai & Top Up Siap Follow-up',
    templateId: 'tpl_2',
    templateName: 'informasi_topup_gadai_fleksibel',
    senderPhoneId: 'PHONE_ID_OFFICIAL_1',
    scheduleType: 'NOW',
    timezone: 'Asia/Jakarta (WIB)',
    sendingStrategy: {
      batchSize: 15,
      delayBetweenBatchesSeconds: 4,
      dailyLimit: 800
    },
    variableMappings: {
      'nama': 'name',
      'produk': 'product',
      'wilayah': 'city',
      'namaPetugas': 'pic'
    },
    status: 'RUNNING',
    stats: {
      total: 19,
      queued: 5,
      sent: 14,
      delivered: 13,
      read: 11,
      failed: 0,
      replied: 4,
      conversion: 2
    },
    createdAt: '2026-02-21T10:00:00Z',
    startedAt: '2026-02-21T10:15:00Z',
    createdBy: 'Siti Rahmawati'
  },
  {
    id: 'cmp_3',
    name: 'Edukasi Perencanaan Finansial Syariah Amanah',
    description: 'Undangan webinar literasi investasi berkah untuk segmen umum',
    segmentId: 'seg_2',
    segmentName: 'Prioritas Jabodetabek & Jawa',
    templateId: 'tpl_3',
    templateName: 'undangan_webinar_literasi_keuangan',
    senderPhoneId: 'PHONE_ID_OFFICIAL_1',
    scheduleType: 'SCHEDULED',
    scheduledAt: '2026-09-25T14:00:00Z',
    timezone: 'Asia/Jakarta (WIB)',
    sendingStrategy: {
      batchSize: 25,
      delayBetweenBatchesSeconds: 5,
      dailyLimit: 1000
    },
    variableMappings: {
      'nama': 'name',
      'produk': 'product',
      'tanggal': 'date',
      'namaPetugas': 'pic'
    },
    status: 'SCHEDULED',
    stats: {
      total: 28,
      queued: 28,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      replied: 0,
      conversion: 0
    },
    createdAt: '2026-02-22T08:00:00Z',
    createdBy: 'Dimas Wicaksono'
  },
  {
    id: 'cmp_4',
    name: 'Draft Kampanye Tabungan Emas Gajian',
    description: 'Rencana blast akhir bulan untuk nasabah payroll',
    segmentId: 'seg_1',
    segmentName: 'Nasabah Potensial Cicil Emas',
    templateId: 'tpl_1',
    templateName: 'promo_cicil_emas_berkah',
    senderPhoneId: 'PHONE_ID_OFFICIAL_1',
    scheduleType: 'NOW',
    timezone: 'Asia/Jakarta (WIB)',
    sendingStrategy: {
      batchSize: 10,
      delayBetweenBatchesSeconds: 3
    },
    variableMappings: {
      'nama': 'name',
      'produk': 'product',
      'wilayah': 'city',
      'namaPetugas': 'pic'
    },
    status: 'DRAFT',
    stats: {
      total: 22,
      queued: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      replied: 0,
      conversion: 0
    },
    createdAt: '2026-02-22T13:45:00Z',
    createdBy: 'Bagus Pratama'
  }
];

export const INITIAL_MESSAGE_LOGS: MessageLog[] = [
  {
    id: 'log_1',
    wamid: 'wamid.HBgNNjI4MTIxMTAwOTk5VjACAhIAKhAkQUJDMDEyMzQ1Njc4OTA=',
    campaignId: 'cmp_1',
    campaignName: 'Blast Promo Cicil Emas Ramadhan Berkah',
    contactId: 'ct_1',
    contactName: 'Agus Prasetyo',
    phone: '6281210000000',
    templateName: 'promo_cicil_emas_berkah',
    renderedBody: 'Halo Bapak/Ibu Agus Prasetyo,\nKabar gembira! Kini Anda dapat memiliki portofolio logam mulia melalui program Cicil Emas...',
    status: 'READ',
    queuedAt: '2026-02-18T09:05:00Z',
    sentAt: '2026-02-18T09:05:03Z',
    deliveredAt: '2026-02-18T09:05:06Z',
    readAt: '2026-02-18T09:08:22Z',
    repliedAt: '2026-02-18T09:12:15Z',
    retryCount: 0
  },
  {
    id: 'log_2',
    wamid: 'wamid.HBgNNjI4MTIyMDA4ODg4VjACAhIAKhAkREVGMDEyMzQ1Njc4OTA=',
    campaignId: 'cmp_1',
    campaignName: 'Blast Promo Cicil Emas Ramadhan Berkah',
    contactId: 'ct_2',
    contactName: 'Budi Kusuma',
    phone: '6281210083421',
    templateName: 'promo_cicil_emas_berkah',
    renderedBody: 'Halo Bapak/Ibu Budi Kusuma,\nKabar gembira! Kini Anda dapat memiliki portofolio logam mulia melalui program Cicil Emas...',
    status: 'READ',
    queuedAt: '2026-02-18T09:05:00Z',
    sentAt: '2026-02-18T09:05:04Z',
    deliveredAt: '2026-02-18T09:05:08Z',
    readAt: '2026-02-18T09:15:30Z',
    repliedAt: '2026-02-18T09:20:00Z',
    retryCount: 0
  },
  {
    id: 'log_3',
    wamid: 'wamid.HBgNNjI4MTIzMDA3Nzc3VjACAhIAKhAkR0hJMDEyMzQ1Njc4OTA=',
    campaignId: 'cmp_1',
    campaignName: 'Blast Promo Cicil Emas Ramadhan Berkah',
    contactId: 'ct_3',
    contactName: 'Chandra Santoso',
    phone: '6281210166842',
    templateName: 'promo_cicil_emas_berkah',
    renderedBody: 'Halo Bapak/Ibu Chandra Santoso,\nKabar gembira! Kini Anda dapat memiliki portofolio logam mulia melalui program Cicil Emas...',
    status: 'DELIVERED',
    queuedAt: '2026-02-18T09:05:00Z',
    sentAt: '2026-02-18T09:05:06Z',
    deliveredAt: '2026-02-18T09:05:12Z',
    retryCount: 0
  },
  {
    id: 'log_4',
    campaignId: 'cmp_1',
    campaignName: 'Blast Promo Cicil Emas Ramadhan Berkah',
    contactId: 'ct_13',
    contactName: 'Muhammad Lubis',
    phone: '6281211001053',
    templateName: 'promo_cicil_emas_berkah',
    renderedBody: 'Halo Bapak/Ibu Muhammad Lubis,\nKabar gembira! Kini Anda dapat memiliki portofolio logam mulia...',
    status: 'FAILED',
    queuedAt: '2026-02-18T09:05:00Z',
    sentAt: '2026-02-18T09:05:10Z',
    errorCode: '131026',
    errorMessage: 'Penerima tidak terdaftar pada WhatsApp Business Directory',
    retryCount: 2
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    contactId: 'ct_1',
    contactName: 'Agus Prasetyo',
    phone: '6281210000000',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'OPEN',
    unreadCount: 1,
    lastMessage: 'Apakah promo cicil emas ini bisa dengan DP 10% Mas?',
    lastMessageAt: '10:45 AM',
    assignedPic: 'Bagus Pratama',
    tags: ['HOT LEAD', 'CICIL EMAS', 'PRIORITAS'],
    productInterest: 'Cicil Emas 50 Gram',
    notes: ['Nasabah prospek kuat, ingin simulasi tenor 24 bulan', 'Telah menerima brosur resmi'],
    messages: [
      {
        id: 'cm_1',
        conversationId: 'conv_1',
        sender: 'SYSTEM',
        text: 'Blast Campaign [Blast Promo Cicil Emas Ramadhan Berkah] berhasil terkirim via WhatsApp Cloud API.',
        timestamp: '2026-02-18 09:05'
      },
      {
        id: 'cm_2',
        conversationId: 'conv_1',
        sender: 'CUSTOMER',
        text: 'Halo Pak Bagus, saya terima pesan WhatsApp terkait promo cicil emas.',
        timestamp: '2026-02-18 09:12'
      },
      {
        id: 'cm_3',
        conversationId: 'conv_1',
        sender: 'AGENT',
        senderName: 'Bagus Pratama',
        text: 'Selamat pagi Bapak Agus! Benar sekali Pak, kami sedang ada program margin spesial 0.75% untuk akad bulan ini. Rencana tertarik berat berapa gram Pak?',
        timestamp: '2026-02-18 09:15',
        status: 'READ'
      },
      {
        id: 'cm_4',
        conversationId: 'conv_1',
        sender: 'CUSTOMER',
        text: 'Apakah promo cicil emas ini bisa dengan DP 10% Mas?',
        timestamp: '2026-02-18 10:45'
      }
    ]
  },
  {
    id: 'conv_2',
    contactId: 'ct_2',
    contactName: 'Budi Kusuma',
    phone: '6281210083421',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'FOLLOW-UP',
    unreadCount: 0,
    lastMessage: 'Baik, saya tunggu draft simulasinya via WhatsApp ya.',
    lastMessageAt: 'Kemarin',
    assignedPic: 'Bagus Pratama',
    tags: ['WARM LEAD', 'CICIL EMAS'],
    productInterest: 'Cicil Emas 25 Gram',
    notes: ['Jadwalkan telepon follow-up hari Kamis sore'],
    messages: [
      {
        id: 'cm_21',
        conversationId: 'conv_2',
        sender: 'CUSTOMER',
        text: 'Saya Tertarik',
        timestamp: '2026-02-18 09:20'
      },
      {
        id: 'cm_22',
        conversationId: 'conv_2',
        sender: 'AGENT',
        senderName: 'Bagus Pratama',
        text: 'Halo Pak Budi, terima kasih responnya. Saya kirimkan tabel simulasi angsuran untuk pecahan 10g dan 25g ya Pak.',
        timestamp: '2026-02-18 09:30',
        status: 'READ'
      },
      {
        id: 'cm_23',
        conversationId: 'conv_2',
        sender: 'CUSTOMER',
        text: 'Baik, saya tunggu draft simulasinya via WhatsApp ya.',
        timestamp: '2026-02-18 14:10'
      }
    ]
  },
  {
    id: 'conv_3',
    contactId: 'ct_5',
    contactName: 'Eko Santoso',
    phone: '6281210333684',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'CLOSED',
    unreadCount: 0,
    lastMessage: 'Terima kasih Mas, akad sudah selesai di cabang Thamrin.',
    lastMessageAt: '19 Feb',
    assignedPic: 'Siti Rahmawati',
    tags: ['HOT LEAD', 'CLOSED', 'PRIORITAS'],
    productInterest: 'Cicil Emas 100 Gram',
    notes: ['Closing deal Rp 135.000.000, nasabah sangat puas'],
    messages: [
      {
        id: 'cm_31',
        conversationId: 'conv_3',
        sender: 'CUSTOMER',
        text: 'Terima kasih Mas, akad sudah selesai di cabang Thamrin.',
        timestamp: '2026-02-19 15:30'
      },
      {
        id: 'cm_32',
        conversationId: 'conv_3',
        sender: 'AGENT',
        senderName: 'Siti Rahmawati',
        text: 'Sama-sama Bapak Eko! Selamat atas portofolio emas batangan barunya. Jika ada pertanyaan jangan ragu hubungi kami kembali.',
        timestamp: '2026-02-19 15:35',
        status: 'READ'
      }
    ]
  }
];

export const INITIAL_FOLLOWUPS: FollowUp[] = [
  {
    id: 'flw_1',
    contactId: 'ct_1',
    contactName: 'Agus Prasetyo',
    phone: '6281210000000',
    pic: 'Bagus Pratama',
    stage: 'INTERESTED',
    followUpDate: '2026-02-23T14:00:00Z',
    notes: 'Ingin simulasi DP 10% tenor 24 bulan untuk 50 gram emas mulia.',
    nextAction: 'Kirimkan PDF tabel simulasi resmi & kontak via telepon',
    productInterest: 'Cicil Emas 50 Gram',
    potentialValue: 68500000,
    updatedAt: '2026-02-21T10:45:00Z'
  },
  {
    id: 'flw_2',
    contactId: 'ct_2',
    contactName: 'Budi Kusuma',
    phone: '6281210083421',
    pic: 'Bagus Pratama',
    stage: 'FOLLOW-UP',
    followUpDate: '2026-02-24T10:00:00Z',
    notes: 'Sudah terima brosur, sedang berdiskusi dengan pasangan.',
    nextAction: 'Konfirmasi kunjungan ke galeri cabang',
    productInterest: 'Cicil Emas 25 Gram',
    potentialValue: 34250000,
    updatedAt: '2026-02-20T14:15:00Z'
  },
  {
    id: 'flw_3',
    contactId: 'ct_5',
    contactName: 'Eko Santoso',
    phone: '6281210333684',
    pic: 'Siti Rahmawati',
    stage: 'CLOSED',
    followUpDate: '2026-02-19T15:30:00Z',
    notes: 'Akad sukses di outlet Thamrin. Nilai akad Rp 137.000.000.',
    nextAction: 'Pengiriman kartu garansi sertifikat Antam',
    productInterest: 'Cicil Emas 100 Gram',
    potentialValue: 137000000,
    updatedAt: '2026-02-19T16:00:00Z'
  },
  {
    id: 'flw_4',
    contactId: 'ct_4',
    contactName: 'Dewi Wijaya',
    phone: '6281210250263',
    pic: 'Dewi Lestari',
    stage: 'NEGOTIATION',
    followUpDate: '2026-02-23T11:00:00Z',
    notes: 'Negosiasi plafon gadai perhiasan berlian & emas putih.',
    nextAction: 'Janji temu dengan penaksir senior di cabang Bandung',
    productInterest: 'Gadai Luxury',
    potentialValue: 85000000,
    updatedAt: '2026-02-21T16:30:00Z'
  },
  {
    id: 'flw_5',
    contactId: 'ct_7',
    contactName: 'Gita Permana',
    phone: '6281210501105',
    pic: 'Rudi Hartono',
    stage: 'CONTACTED',
    followUpDate: '2026-02-25T09:00:00Z',
    notes: 'Merespon pesan blast promo top-up agunan.',
    nextAction: 'Verifikasi kesiapan berkas KTP dan SBG',
    productInterest: 'Top Up Plafon Gadai',
    potentialValue: 25000000,
    updatedAt: '2026-02-22T08:20:00Z'
  },
  {
    id: 'flw_6',
    contactId: 'ct_9',
    contactName: 'Indah Utami',
    phone: '6281210668526',
    pic: 'Bagus Pratama',
    stage: 'NEW',
    followUpDate: '2026-02-23T15:00:00Z',
    notes: 'Lead masuk dari form website & opt-in WA blast.',
    nextAction: 'Hubungi via WhatsApp untuk perkenalan layanan Amanah',
    productInterest: 'Pembiayaan Usaha Amanah',
    potentialValue: 50000000,
    updatedAt: '2026-02-22T11:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    userId: 'usr_1',
    userName: 'Dimas Wicaksono (Admin)',
    action: 'SEND_CAMPAIGN',
    objectType: 'CAMPAIGN',
    objectId: 'cmp_1',
    details: 'Meluncurkan blast campaign "Blast Promo Cicil Emas Ramadhan Berkah" ke 22 kontak valid',
    timestamp: '2026-02-18T09:05:00Z',
    ip: '180.252.164.22'
  },
  {
    id: 'aud_2',
    userId: 'usr_2',
    userName: 'Siti Rahmawati (Manager)',
    action: 'CREATE_SEGMENT',
    objectType: 'SEGMENT',
    objectId: 'seg_3',
    details: 'Membuat segmentasi dinamis baru "Nasabah Gadai & Top Up Siap Follow-up" dengan 2 kriteria',
    timestamp: '2026-02-01T11:00:00Z',
    ip: '180.252.164.45'
  },
  {
    id: 'aud_3',
    userId: 'usr_1',
    userName: 'Dimas Wicaksono (Admin)',
    action: 'IMPORT_CONTACTS',
    objectType: 'CONTACT',
    objectId: 'bulk_import_20260115',
    details: 'Berhasil mengimpor 100 data nasabah dari file nasabah_pegadaian_januari.xlsx (98 valid, 2 opt-out)',
    timestamp: '2026-01-15T10:00:00Z',
    ip: '180.252.164.22'
  },
  {
    id: 'aud_4',
    userId: 'usr_1',
    userName: 'Dimas Wicaksono (Admin)',
    action: 'UPDATE_CONFIG',
    objectType: 'WHATSAPP_CONFIG',
    objectId: 'cfg_meta_cloud',
    details: 'Menghubungkan WhatsApp Cloud API Phone Number ID 109283746501928 (Tier 2 verified)',
    timestamp: '2026-01-05T08:30:00Z',
    ip: '180.252.164.22'
  },
  {
    id: 'aud_5',
    userId: 'usr_3',
    userName: 'Bagus Pratama (Sales)',
    action: 'UPDATE_FOLLOWUP',
    objectType: 'FOLLOWUP',
    objectId: 'flw_1',
    details: 'Mengubah status lead Agus Prasetyo menjadi INTERESTED dengan potensi Rp 68.500.000',
    timestamp: '2026-02-21T10:45:00Z',
    ip: '114.122.42.18'
  }
];

export const INITIAL_WHATSAPP_CONFIG: WhatsAppConfig = {
  phoneNumberId: '109283746501928',
  businessAccountId: '204918273645019',
  tokenMasked: '••••••••••••••••',
  hasToken: false,
  webhookVerifyToken: 'waba_secure_verify_token_2026',
  apiVersion: 'v21.0',
  isDemoMode: true,
  connectionStatus: 'DEMO',
  dailyLimit: 1000,
  qualityScore: 'HIGH (GREEN)'
};
