import dotenv from 'dotenv';
dotenv.config();

export interface MetaErrorResponse {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface MetaDiagnosticStep {
  step: number;
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

export interface MetaDiagnosticResult {
  success: boolean;
  demoMode: boolean;
  apiVersion: string;
  steps: MetaDiagnosticStep[];
  phoneMetadata?: {
    displayPhoneNumber?: string;
    verifiedName?: string;
    qualityRating?: string;
    status?: string;
    codeVerificationStatus?: string;
  };
  approvedTemplateCount?: number;
  approvedTemplateNames?: string[];
  errorCategory?: string | null;
  error?: string | null;
}

export interface MetaSendResult {
  success: boolean;
  wamid?: string;
  errorCategory?: string;
  error?: string;
  statusCode?: number;
  metaTraceId?: string;
}

// In-Memory Runtime Config Store (falls back to process.env)
class WhatsAppConfigStore {
  private accessToken: string;
  private businessAccountId: string;
  private phoneNumberId: string;
  private webhookVerifyToken: string;
  private apiVersion: string;
  private demoMode: boolean;

  constructor() {
    this.accessToken = this.cleanToken(process.env.WHATSAPP_ACCESS_TOKEN || '');
    this.businessAccountId = this.cleanId(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '');
    this.phoneNumberId = this.cleanId(process.env.WHATSAPP_PHONE_NUMBER_ID || '');
    this.webhookVerifyToken = (process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'waba_secure_verify_token_2026').trim();
    this.apiVersion = this.cleanVersion(process.env.WHATSAPP_API_VERSION || 'v21.0');
    this.demoMode = process.env.DEMO_MODE !== 'false';
  }

  public cleanToken(token?: string | null): string {
    if (!token) return '';
    // Strip accidental newlines, carriage returns, leading/trailing whitespace, and optional "Bearer " prefix
    return token
      .trim()
      .replace(/^WHATSAPP_ACCESS_TOKEN\s*=\s*/i, '')
      .replace(/["']/g, '')
      .replace(/^Bearer\s+/i, '')
      .replace(/[\r\n\t]/g, '');
  }

  public cleanId(id?: string | null): string {
    if (!id) return '';
    return id.trim().replace(/^WHATSAPP_[A-Z_]+\s*=\s*/i, '').replace(/["']/g, '').replace(/[^\w-]/g, '');
  }

  public cleanVersion(version?: string | null): string {
    if (!version) return 'v21.0';
    let v = version.trim().replace(/^WHATSAPP_API_VERSION\s*=\s*/i, '').replace(/["']/g, '');
    if (!v.startsWith('v')) v = 'v' + v;
    return v;
  }

  public update(newConfig: {
    accessToken?: string;
    businessAccountId?: string;
    phoneNumberId?: string;
    webhookVerifyToken?: string;
    apiVersion?: string;
    demoMode?: boolean;
  }) {
    if (newConfig.accessToken !== undefined && newConfig.accessToken !== '••••••••••••••••') {
      this.accessToken = this.cleanToken(newConfig.accessToken);
    }
    if (newConfig.businessAccountId !== undefined) {
      this.businessAccountId = this.cleanId(newConfig.businessAccountId);
    }
    if (newConfig.phoneNumberId !== undefined) {
      this.phoneNumberId = this.cleanId(newConfig.phoneNumberId);
    }
    if (newConfig.webhookVerifyToken !== undefined) {
      this.webhookVerifyToken = newConfig.webhookVerifyToken.trim();
    }
    if (newConfig.apiVersion !== undefined) {
      this.apiVersion = this.cleanVersion(newConfig.apiVersion);
    }
    if (newConfig.demoMode !== undefined) {
      this.demoMode = Boolean(newConfig.demoMode);
    }
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  public getBusinessAccountId(): string {
    return this.businessAccountId;
  }

  public getPhoneNumberId(): string {
    return this.phoneNumberId;
  }

  public getWebhookVerifyToken(): string {
    return this.webhookVerifyToken;
  }

  public getApiVersion(): string {
    return this.apiVersion || 'v21.0';
  }

  public isDemoMode(): boolean {
    return this.demoMode;
  }

  public setDemoMode(val: boolean) {
    this.demoMode = val;
  }

  public getGraphApiBaseUrl(): string {
    const version = this.getApiVersion().startsWith('v') ? this.getApiVersion() : `v${this.getApiVersion()}`;
    return `https://graph.facebook.com/${version}`;
  }
}

export const configStore = new WhatsAppConfigStore();

/**
 * Startup Validation Logging
 * Validates environment configuration without leaking secrets
 */
export function logStartupValidation(): void {
  const token = configStore.getAccessToken();
  const wabaId = configStore.getBusinessAccountId();
  const phoneId = configStore.getPhoneNumberId();
  const webhookToken = configStore.getWebhookVerifyToken();
  const apiVersion = configStore.getApiVersion();
  const demo = configStore.isDemoMode();

  console.log('\n==================================================');
  console.log('  WHATSAPP CLOUD API CONFIGURATION STATUS');
  console.log('==================================================');
  console.log(`  WHATSAPP_ACCESS_TOKEN         = ${token ? 'configured' : 'missing'}`);
  console.log(`  WHATSAPP_BUSINESS_ACCOUNT_ID  = ${wabaId ? 'configured' : 'missing'}`);
  console.log(`  WHATSAPP_PHONE_NUMBER_ID      = ${phoneId ? 'configured' : 'missing'}`);
  console.log(`  WHATSAPP_WEBHOOK_VERIFY_TOKEN = ${webhookToken ? 'configured' : 'missing'}`);
  console.log(`  WHATSAPP_API_VERSION          = ${apiVersion} (${process.env.WHATSAPP_API_VERSION ? 'configured' : 'default'})`);
  console.log(`  DEMO_MODE                     = ${demo ? 'true (Simulator Active)' : 'false (Meta Graph API Connected)'}`);
  console.log('==================================================\n');
}

/**
 * Mask string for safe UI presentation (never leak access token)
 */
export function maskString(str?: string | null, keepChars = 4): string {
  if (!str) return 'belum dikonfigurasi';
  if (str.length <= keepChars * 2) return '••••••••';
  return `${str.substring(0, keepChars)}••••${str.substring(str.length - keepChars)}`;
}

/**
 * Categorize Meta API errors into explicit domains:
 * AUTHENTICATION_ERROR (Code 190) vs WABA_ERROR vs PHONE_NUMBER_ERROR vs TEMPLATE_ERROR etc.
 */
export function categorizeMetaError(
  metaError: MetaErrorResponse | null, 
  httpStatus: number, 
  context?: string
): { category: string; userMessage: string } {
  if (!metaError) {
    if (httpStatus === 401) {
      return {
        category: 'AUTHENTICATION_ERROR',
        userMessage: 'Access Token Meta tidak valid atau tidak memiliki izin akses (HTTP 401 Unauthorized).'
      };
    }
    if (httpStatus === 404) {
      return {
        category: 'NOT_FOUND_ERROR',
        userMessage: 'Endpoint Graph API atau Resource ID tidak ditemukan di server Meta (HTTP 404).'
      };
    }
    return {
      category: 'NETWORK_ERROR',
      userMessage: `Server Meta mengembalikan respons tidak terduga (HTTP ${httpStatus}).`
    };
  }

  const { code, type, message } = metaError;

  // 1. AUTHENTICATION ERROR: Code 190 (OAuthException)
  // CRITICAL: NEVER conflate Code 190 with JSON template errors!
  if (code === 190 || type === 'OAuthException') {
    return {
      category: 'AUTHENTICATION_ERROR',
      userMessage: 'Access Token Meta tidak valid atau tidak dapat digunakan oleh aplikasi ini (Meta Error Code 190: OAuthException). Pastikan Anda menggunakan Permanent System User Token dari Meta Business Manager dengan izin yang sesuai dan token belum kedaluwarsa.'
    };
  }

  // 2. PERMISSION ERROR: Code 200, 10, 298
  if (code === 200 || code === 10 || code === 298 || message.toLowerCase().includes('permission')) {
    return {
      category: 'PERMISSION_ERROR',
      userMessage: 'Access Token tidak memiliki izin yang dibutuhkan. Pastikan System User memiliki izin "whatsapp_business_messaging" dan "whatsapp_business_management".'
    };
  }

  // 3. WABA ERROR
  if (context === 'waba' || message.toLowerCase().includes('waba') || message.toLowerCase().includes('business account')) {
    return {
      category: 'WABA_ERROR',
      userMessage: 'WABA ID tidak dapat diakses oleh Access Token ini. Pastikan WABA ID benar dan System User telah diberikan akses ke akun WhatsApp Business tersebut di Meta Business Suite.'
    };
  }

  // 4. PHONE NUMBER ERROR
  if (context === 'phone' || message.toLowerCase().includes('phone number') || code === 133010) {
    return {
      category: 'PHONE_NUMBER_ERROR',
      userMessage: 'Phone Number ID tidak valid atau tidak dapat diakses. Pastikan Phone Number ID berasal dari WABA yang terdaftar dan nomor berstatus terhubung.'
    };
  }

  // 5. TEMPLATE ERROR
  if (
    context === 'template' || 
    code === 132000 || 
    code === 132001 || 
    code === 132005 || 
    code === 132012 ||
    message.toLowerCase().includes('template')
  ) {
    return {
      category: 'TEMPLATE_ERROR',
      userMessage: 'Template WhatsApp tidak dapat digunakan. Periksa status approval, language code, dan parameter template di Meta Business Manager.'
    };
  }

  // 6. RATE LIMIT ERROR
  if (code === 80007 || code === 4 || code === 17 || code === 130429) {
    return {
      category: 'RATE_LIMIT_ERROR',
      userMessage: 'Batas kuota pengiriman API (Rate Limit) Meta telah tercapai. Harap tunggu beberapa saat sebelum mengirim kembali.'
    };
  }

  // 7. MESSAGE DELIVERY / RECIPIENT ERROR
  if (code === 131009 || code === 131008 || code === 131026 || code === 131051) {
    return {
      category: 'MESSAGE_SEND_ERROR',
      userMessage: 'Pesan tidak dapat dikirim ke nomor penerima (nomor tidak terdaftar di WhatsApp atau berada di luar batas opt-in 24 jam).'
    };
  }

  // Fallback with original Meta message (without generic misleading postcard label)
  return {
    category: 'META_API_ERROR',
    userMessage: `Meta API Error (Code ${code}): ${message}`
  };
}

/**
 * Safe server-side error logging (never logs tokens)
 */
export function safeLogMetaError(
  endpoint: string, 
  httpStatus: number, 
  metaError: any, 
  context?: { campaignId?: string; messageId?: string; phone?: string }
): void {
  const timestamp = new Date().toISOString();
  const code = metaError?.code || 'N/A';
  const type = metaError?.type || 'N/A';
  const msg = metaError?.message || 'Unknown error';
  const ctxStr = context ? ` | Ctx: ${JSON.stringify(context)}` : '';

  console.error(`[Meta API Error] ${timestamp} | Endpoint: ${endpoint} | HTTP: ${httpStatus} | Code: ${code} | Type: ${type} | Msg: ${msg}${ctxStr}`);
}

/**
 * 4-Step Validation of WhatsApp Cloud API Credentials
 * Step 1: Validate Access Token
 * Step 2: Validate WABA ID
 * Step 3: Validate Phone Number ID
 * Step 4: Check Templates
 */
export async function validateWhatsAppCredentials(): Promise<MetaDiagnosticResult> {
  const token = configStore.getAccessToken();
  const wabaId = configStore.getBusinessAccountId();
  const phoneId = configStore.getPhoneNumberId();
  const baseUrl = configStore.getGraphApiBaseUrl();
  const isDemo = configStore.isDemoMode();

  const steps: MetaDiagnosticStep[] = [];

  // If in DEMO MODE and no real token provided
  if (isDemo && (!token || token === 'demo_token')) {
    return {
      success: true,
      demoMode: true,
      apiVersion: configStore.getApiVersion(),
      steps: [
        { step: 1, name: 'Validate Access Token', passed: true, message: 'DEMO MODE: Simulator token aktif (Aman tanpa billing Meta)' },
        { step: 2, name: 'Validate WABA', passed: true, message: `DEMO MODE: WABA ID simulasi (${wabaId || '204918273645019'}) siap digunakan` },
        { step: 3, name: 'Validate Phone Number', passed: true, message: `DEMO MODE: Phone Number ID simulasi (${phoneId || '109283746501928'}) siap digunakan` },
        { step: 4, name: 'Check Templates', passed: true, message: 'DEMO MODE: 5 Template APPROVED bawaan tersedia' }
      ],
      phoneMetadata: {
        displayPhoneNumber: '+62 812-8899-0011',
        verifiedName: 'Pegadaian Official (Demo)',
        qualityRating: 'GREEN (High Quality)',
        status: 'CONNECTED',
        codeVerificationStatus: 'VERIFIED'
      },
      approvedTemplateCount: 5,
      approvedTemplateNames: ['promo_cicil_emas_ramadhan', 'notifikasi_jatuh_tempo_gadai', 'verifikasi_transaksi_emas', 'welcome_nasabah_prioritas', 'survey_kepuasan_nasabah']
    };
  }

  // ==========================================
  // STEP 1: Validate Access Token
  // ==========================================
  if (!token) {
    const errorMsg = 'WHATSAPP_ACCESS_TOKEN belum dikonfigurasi.';
    steps.push({ step: 1, name: 'Validate Access Token', passed: false, message: errorMsg });
    return {
      success: false,
      demoMode: false,
      apiVersion: configStore.getApiVersion(),
      steps,
      errorCategory: 'AUTHENTICATION_ERROR',
      error: errorMsg
    };
  }

  try {
    // We check /me or /app with access token to verify signature and expiration
    const meRes = await fetch(`${baseUrl}/me?fields=id,name`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const meData = await meRes.json().catch(() => null);

    if (!meRes.ok) {
      safeLogMetaError(`${baseUrl}/me`, meRes.status, meData?.error);
      const { category, userMessage } = categorizeMetaError(meData?.error, meRes.status, 'token');
      steps.push({
        step: 1,
        name: 'Validate Access Token',
        passed: false,
        message: userMessage,
        details: { code: meData?.error?.code, subcode: meData?.error?.error_subcode }
      });

      return {
        success: false,
        demoMode: false,
        apiVersion: configStore.getApiVersion(),
        steps,
        errorCategory: category,
        error: userMessage
      };
    }

    steps.push({
      step: 1,
      name: 'Validate Access Token',
      passed: true,
      message: `Access Token Meta valid & terautentikasi (ID: ${meData?.id || 'OK'})`
    });
  } catch (err: any) {
    console.error('[Validation Step 1 Failed]', err);
    steps.push({
      step: 1,
      name: 'Validate Access Token',
      passed: false,
      message: `Gagal terhubung ke Meta Graph API: ${err.message || 'Koneksi jaringan terputus'}`
    });
    return {
      success: false,
      demoMode: false,
      apiVersion: configStore.getApiVersion(),
      steps,
      errorCategory: 'NETWORK_ERROR',
      error: 'Tidak dapat menjangkau server graph.facebook.com. Periksa koneksi internet server.'
    };
  }

  // ==========================================
  // STEP 2: Validate WABA ID
  // ==========================================
  if (!wabaId) {
    const errorMsg = 'WHATSAPP_BUSINESS_ACCOUNT_ID belum dikonfigurasi.';
    steps.push({ step: 2, name: 'Validate WABA', passed: false, message: errorMsg });
    return {
      success: false,
      demoMode: false,
      apiVersion: configStore.getApiVersion(),
      steps,
      errorCategory: 'WABA_ERROR',
      error: errorMsg
    };
  }

  try {
    const wabaRes = await fetch(`${baseUrl}/${wabaId}?fields=id,name,timezone_id,currency`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const wabaData = await wabaRes.json().catch(() => null);

    if (!wabaRes.ok) {
      safeLogMetaError(`${baseUrl}/${wabaId}`, wabaRes.status, wabaData?.error);
      const { category, userMessage } = categorizeMetaError(wabaData?.error, wabaRes.status, 'waba');
      steps.push({
        step: 2,
        name: 'Validate WABA',
        passed: false,
        message: userMessage,
        details: { code: wabaData?.error?.code }
      });

      return {
        success: false,
        demoMode: false,
        apiVersion: configStore.getApiVersion(),
        steps,
        errorCategory: category,
        error: userMessage
      };
    }

    steps.push({
      step: 2,
      name: 'Validate WABA',
      passed: true,
      message: `WABA (${wabaData?.name || maskString(wabaId, 4)}) berhasil diakses & terverifikasi`
    });
  } catch (err: any) {
    steps.push({
      step: 2,
      name: 'Validate WABA',
      passed: false,
      message: `Gagal mengakses WABA ID: ${err.message}`
    });
    return {
      success: false,
      demoMode: false,
      apiVersion: configStore.getApiVersion(),
      steps,
      errorCategory: 'NETWORK_ERROR',
      error: 'Gagal memvalidasi WABA ID.'
    };
  }

  // ==========================================
  // STEP 3: Validate Phone Number ID
  // ==========================================
  if (!phoneId) {
    const errorMsg = 'WHATSAPP_PHONE_NUMBER_ID belum dikonfigurasi.';
    steps.push({ step: 3, name: 'Validate Phone Number', passed: false, message: errorMsg });
    return {
      success: false,
      demoMode: false,
      apiVersion: configStore.getApiVersion(),
      steps,
      errorCategory: 'PHONE_NUMBER_ERROR',
      error: errorMsg
    };
  }

  let phoneMetadata: any = null;

  try {
    const phoneRes = await fetch(
      `${baseUrl}/${phoneId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const phoneData = await phoneRes.json().catch(() => null);

    if (!phoneRes.ok) {
      safeLogMetaError(`${baseUrl}/${phoneId}`, phoneRes.status, phoneData?.error);
      const { category, userMessage } = categorizeMetaError(phoneData?.error, phoneRes.status, 'phone');
      steps.push({
        step: 3,
        name: 'Validate Phone Number',
        passed: false,
        message: userMessage,
        details: { code: phoneData?.error?.code }
      });

      return {
        success: false,
        demoMode: false,
        apiVersion: configStore.getApiVersion(),
        steps,
        errorCategory: category,
        error: userMessage
      };
    }

    phoneMetadata = {
      displayPhoneNumber: phoneData?.display_phone_number || '-',
      verifiedName: phoneData?.verified_name || '-',
      qualityRating: phoneData?.quality_rating || 'GREEN',
      status: phoneData?.status || 'CONNECTED',
      codeVerificationStatus: phoneData?.code_verification_status || 'VERIFIED'
    };

    steps.push({
      step: 3,
      name: 'Validate Phone Number',
      passed: true,
      message: `Nomor WhatsApp (${phoneMetadata.displayPhoneNumber} - ${phoneMetadata.verifiedName}) aktif & status ${phoneMetadata.status}`
    });
  } catch (err: any) {
    steps.push({
      step: 3,
      name: 'Validate Phone Number',
      passed: false,
      message: `Gagal memvalidasi Phone Number ID: ${err.message}`
    });
    return {
      success: false,
      demoMode: false,
      apiVersion: configStore.getApiVersion(),
      steps,
      errorCategory: 'NETWORK_ERROR',
      error: 'Gagal memvalidasi Phone Number ID.'
    };
  }

  // ==========================================
  // STEP 4: Check Templates
  // ==========================================
  let approvedCount = 0;
  let approvedNames: string[] = [];

  try {
    const tplRes = await fetch(
      `${baseUrl}/${wabaId}/message_templates?fields=name,status,language,category,components&limit=100`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const tplData = await tplRes.json().catch(() => null);

    if (!tplRes.ok) {
      safeLogMetaError(`${baseUrl}/${wabaId}/message_templates`, tplRes.status, tplData?.error);
      const { category, userMessage } = categorizeMetaError(tplData?.error, tplRes.status, 'template');
      steps.push({
        step: 4,
        name: 'Check Templates',
        passed: false,
        message: userMessage
      });

      return {
        success: false,
        demoMode: false,
        apiVersion: configStore.getApiVersion(),
        steps,
        phoneMetadata,
        errorCategory: category,
        error: userMessage
      };
    }

    const allTemplates: any[] = tplData?.data || [];
    const approvedTemplates = allTemplates.filter(t => t.status === 'APPROVED');
    approvedCount = approvedTemplates.length;
    approvedNames = approvedTemplates.map(t => t.name);

    if (approvedCount === 0) {
      steps.push({
        step: 4,
        name: 'Check Templates',
        passed: false,
        message: 'Tidak ada template yang berstatus APPROVED di WABA ini. Buat dan ajukan template di Meta Business Manager terlebih dahulu.'
      });
      return {
        success: false,
        demoMode: false,
        apiVersion: configStore.getApiVersion(),
        steps,
        phoneMetadata,
        approvedTemplateCount: 0,
        approvedTemplateNames: [],
        errorCategory: 'TEMPLATE_ERROR',
        error: 'Tidak ditemukan template APPROVED di Meta Business Manager.'
      };
    }

    steps.push({
      step: 4,
      name: 'Check Templates',
      passed: true,
      message: `${approvedCount} template WhatsApp berstatus APPROVED siap digunakan`
    });
  } catch (err: any) {
    steps.push({
      step: 4,
      name: 'Check Templates',
      passed: false,
      message: `Gagal mengambil daftar template: ${err.message}`
    });
    return {
      success: false,
      demoMode: false,
      apiVersion: configStore.getApiVersion(),
      steps,
      phoneMetadata,
      errorCategory: 'NETWORK_ERROR',
      error: 'Gagal mengambil template dari Meta.'
    };
  }

  // All 4 steps passed!
  return {
    success: true,
    demoMode: false,
    apiVersion: configStore.getApiVersion(),
    steps,
    phoneMetadata,
    approvedTemplateCount: approvedCount,
    approvedTemplateNames: approvedNames
  };
}

/**
 * Send WhatsApp Template Message
 * Evaluates credentials, checks template parameters, and executes via Meta Graph API or simulator
 */
export async function sendWhatsAppTemplateMessage(params: {
  toPhone: string;
  templateName: string;
  languageCode?: string;
  parameters?: Array<{ type: 'text'; text: string }>;
  campaignId?: string;
  messageId?: string;
}): Promise<MetaSendResult> {
  const { toPhone, templateName, languageCode = 'id', parameters = [], campaignId, messageId } = params;
  const cleanTo = toPhone.replace(/\D/g, '');

  if (!cleanTo || cleanTo.length < 8) {
    return {
      success: false,
      errorCategory: 'PHONE_NUMBER_ERROR',
      error: `Nomor telepon tujuan tidak valid: "${toPhone}". Gunakan format standar E.164 (+62...).`
    };
  }

  // DEMO MODE EXECUTION
  if (configStore.isDemoMode()) {
    const simWamid = `wamid.HBgN${cleanTo}VjACAhIAKhAk${Math.random().toString(36).substring(2, 12).toUpperCase()}==`;
    return {
      success: true,
      wamid: simWamid,
      statusCode: 200
    };
  }

  // LIVE META CLOUD API CALL
  const token = configStore.getAccessToken();
  const phoneId = configStore.getPhoneNumberId();
  const baseUrl = configStore.getGraphApiBaseUrl();

  if (!token) {
    return {
      success: false,
      errorCategory: 'AUTHENTICATION_ERROR',
      error: 'WHATSAPP_ACCESS_TOKEN belum dikonfigurasi. Harap tentukan variabel lingkungan server atau simpan token di Pengaturan.'
    };
  }

  if (!phoneId) {
    return {
      success: false,
      errorCategory: 'PHONE_NUMBER_ERROR',
      error: 'WHATSAPP_PHONE_NUMBER_ID belum dikonfigurasi.'
    };
  }

  const cleanTemplateName = templateName.trim().toLowerCase().replace(/\s+/g, '_');
  const cleanLang = (languageCode || 'id').trim().toLowerCase();

  // Construct Meta Template Payload according to official Cloud API RFC specs
  // Meta rules:
  // 1. "components" array must only be included if parameters exist.
  // 2. Do not send empty "parameters: []".
  const components: any[] = [];
  if (parameters && parameters.length > 0) {
    components.push({
      type: 'body',
      parameters: parameters.map(p => ({
        type: 'text',
        text: String(p.text || '').substring(0, 1024)
      }))
    });
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanTo,
    type: 'template',
    template: {
      name: cleanTemplateName,
      language: {
        code: cleanLang
      }
    }
  };

  if (components.length > 0) {
    payload.template.components = components;
  }

  try {
    const url = `${baseUrl}/${phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json().catch(() => null);

    if (!response.ok) {
      safeLogMetaError(url, response.status, resData?.error, { campaignId, messageId, phone: cleanTo });
      const { category, userMessage } = categorizeMetaError(resData?.error, response.status, 'send');

      return {
        success: false,
        errorCategory: category,
        error: userMessage,
        statusCode: response.status,
        metaTraceId: resData?.error?.fbtrace_id
      };
    }

    const realWamid = resData?.messages?.[0]?.id || `wamid.${Date.now()}`;
    return {
      success: true,
      wamid: realWamid,
      statusCode: response.status
    };
  } catch (err: any) {
    console.error('[Meta API Send Message Network Error]', err);
    return {
      success: false,
      errorCategory: 'NETWORK_ERROR',
      error: `Gagal terhubung ke Meta Graph API: ${err.message || 'Koneksi terputus'}`,
      statusCode: 500
    };
  }
}

/**
 * Send WhatsApp Freeform Text Message (24-Hour Customer Window)
 */
export async function sendWhatsAppTextMessage(params: {
  toPhone: string;
  text: string;
}): Promise<MetaSendResult> {
  const { toPhone, text } = params;
  const cleanTo = toPhone.replace(/\D/g, '');

  if (!cleanTo || cleanTo.length < 8) {
    return {
      success: false,
      errorCategory: 'PHONE_NUMBER_ERROR',
      error: `Nomor telepon tujuan tidak valid: "${toPhone}".`
    };
  }

  if (configStore.isDemoMode()) {
    return {
      success: true,
      wamid: `wamid.HBgN${cleanTo}Vj${Date.now()}`,
      statusCode: 200
    };
  }

  const token = configStore.getAccessToken();
  const phoneId = configStore.getPhoneNumberId();
  const baseUrl = configStore.getGraphApiBaseUrl();

  if (!token) {
    return {
      success: false,
      errorCategory: 'AUTHENTICATION_ERROR',
      error: 'WHATSAPP_ACCESS_TOKEN belum dikonfigurasi.'
    };
  }

  if (!phoneId) {
    return {
      success: false,
      errorCategory: 'PHONE_NUMBER_ERROR',
      error: 'WHATSAPP_PHONE_NUMBER_ID belum dikonfigurasi.'
    };
  }

  try {
    const url = `${baseUrl}/${phoneId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: { body: text.substring(0, 4096) }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json().catch(() => null);

    if (!response.ok) {
      safeLogMetaError(url, response.status, resData?.error, { phone: cleanTo });
      const { category, userMessage } = categorizeMetaError(resData?.error, response.status, 'text');
      return {
        success: false,
        errorCategory: category,
        error: userMessage,
        statusCode: response.status
      };
    }

    return {
      success: true,
      wamid: resData?.messages?.[0]?.id || `wamid.${Date.now()}`,
      statusCode: response.status
    };
  } catch (err: any) {
    return {
      success: false,
      errorCategory: 'NETWORK_ERROR',
      error: `Gagal terhubung ke WhatsApp API: ${err.message}`,
      statusCode: 500
    };
  }
}

/**
 * Fetch live templates from Meta Graph API
 */
export async function fetchMetaTemplatesList(): Promise<{
  success: boolean;
  templates: any[];
  error?: string;
}> {
  if (configStore.isDemoMode()) {
    return {
      success: true,
      templates: []
    };
  }

  const token = configStore.getAccessToken();
  const wabaId = configStore.getBusinessAccountId();
  const baseUrl = configStore.getGraphApiBaseUrl();

  if (!token || !wabaId) {
    return {
      success: false,
      templates: [],
      error: 'Kredensial Token atau WABA ID belum dikonfigurasi.'
    };
  }

  try {
    const res = await fetch(
      `${baseUrl}/${wabaId}/message_templates?fields=name,status,language,category,components&limit=100`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      safeLogMetaError(`${baseUrl}/${wabaId}/message_templates`, res.status, data?.error);
      const { userMessage } = categorizeMetaError(data?.error, res.status, 'template');
      return {
        success: false,
        templates: [],
        error: userMessage
      };
    }

    return {
      success: true,
      templates: data?.data || []
    };
  } catch (err: any) {
    return {
      success: false,
      templates: [],
      error: `Koneksi gagal: ${err.message}`
    };
  }
}
