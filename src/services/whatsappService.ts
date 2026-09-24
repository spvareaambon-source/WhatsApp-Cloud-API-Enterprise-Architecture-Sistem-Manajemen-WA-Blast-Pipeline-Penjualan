import { 
  WhatsAppConfig, 
  MessageTemplate, 
  Contact 
} from '../types';
import { normalizeWhatsAppNumber } from '../utils/phoneNormalizer';
import { renderPersonalizedMessage, getVariableValue } from '../utils/personalization';

export interface SendMessageOptions {
  contact: Contact;
  template: MessageTemplate;
  campaignId?: string;
  campaignName?: string;
  variableMappings?: Record<string, string>;
}

export interface SendResult {
  success: boolean;
  messageId: string;
  wamid?: string;
  renderedText: string;
  error?: string;
  errorCategory?: string;
  statusCode?: number;
}

export interface DiagnosticStep {
  step: number;
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

export interface TestConnectionResponse {
  success: boolean;
  demoMode: boolean;
  apiVersion: string;
  steps: DiagnosticStep[];
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

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<WhatsAppConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): WhatsAppConfig {
    return { ...this.config };
  }

  /**
   * Validates target phone number according to WhatsApp E.164 requirements
   */
  public validatePhone(phone: string) {
    return normalizeWhatsAppNumber(phone);
  }

  /**
   * Test Connection with 4-Step Validation against Meta Graph API
   */
  public static async testConnection(): Promise<TestConnectionResponse> {
    try {
      const response = await fetch('/api/whatsapp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        demoMode: false,
        apiVersion: 'v21.0',
        steps: [
          { step: 1, name: 'Validate Access Token', passed: false, message: 'Gagal terhubung ke backend server lokal.' }
        ],
        errorCategory: 'NETWORK_ERROR',
        error: `Koneksi backend gagal: ${err.message}`
      };
    }
  }

  /**
   * Get Diagnostic Status from backend (No raw token exposed)
   */
  public static async getDiagnostics(): Promise<any> {
    try {
      const response = await fetch('/api/whatsapp/diagnostics');
      return await response.json();
    } catch (err: any) {
      return {
        apiVersion: 'v21.0',
        connectionStatus: 'ERROR',
        tokenStatus: 'UNKNOWN',
        tokenMasked: '••••••••••••••••',
        error: err.message
      };
    }
  }

  /**
   * Saves updated configuration securely to server runtime
   */
  public static async saveServerConfig(config: {
    phoneNumberId: string;
    businessAccountId: string;
    accessToken?: string;
    webhookVerifyToken?: string;
    apiVersion?: string;
    demoMode?: boolean;
  }): Promise<{ success: boolean; message: string; isDemoMode: boolean }> {
    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menyimpan konfigurasi: ${err.message}`,
        isDemoMode: true
      };
    }
  }

  /**
   * Toggles Demo Mode on the server
   */
  public static async toggleDemoMode(): Promise<{ success: boolean; demoMode: boolean; message: string }> {
    try {
      const response = await fetch('/api/whatsapp/toggle-demo', {
        method: 'POST'
      });
      return await response.json();
    } catch (err: any) {
      return {
        success: false,
        demoMode: true,
        message: err.message
      };
    }
  }

  /**
   * Sends a template message through backend proxy
   * Strict validation before execution (Checks 1-9 per requirement 7)
   */
  public async sendTemplateMessage(options: SendMessageOptions): Promise<SendResult> {
    const { contact, template, campaignId, campaignName, variableMappings } = options;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Phone number validation
    const phoneCheck = this.validatePhone(contact.phone);
    if (!phoneCheck.isValid) {
      return {
        success: false,
        messageId,
        renderedText: '',
        errorCategory: 'PHONE_NUMBER_ERROR',
        error: `Nomor WhatsApp tidak valid: ${phoneCheck.error}`
      };
    }

    // 2. Personalization rendering
    const renderRes = renderPersonalizedMessage(template.body, contact, variableMappings);
    if (!renderRes.success) {
      return {
        success: false,
        messageId,
        renderedText: renderRes.renderedText,
        errorCategory: 'PARAMETER_ERROR',
        error: renderRes.errorMessage || 'Data personalisasi parameter tidak lengkap.'
      };
    }

    // 3. Opt-in verification
    if (contact.optInStatus === 'OPTED_OUT') {
      return {
        success: false,
        messageId,
        renderedText: renderRes.renderedText,
        errorCategory: 'OPT_OUT',
        error: 'Kontak telah Opt-out dari penerimaan pesan WhatsApp.'
      };
    }

    // 4. Template Availability & Approval Validation (Requirement 7)
    if (!template || !template.name) {
      return {
        success: false,
        messageId,
        renderedText: renderRes.renderedText,
        errorCategory: 'TEMPLATE_ERROR',
        error: 'Template WhatsApp tidak ditemukan.'
      };
    }

    // If template is NOT approved, block immediately with exact user message
    const templateStatus = template.approvalStatus || template.status;
    if (templateStatus && templateStatus !== 'APPROVED') {
      return {
        success: false,
        messageId,
        renderedText: renderRes.renderedText,
        errorCategory: 'TEMPLATE_ERROR',
        error: 'Template WhatsApp tidak dapat digunakan. Periksa status approval, language code, dan parameter template.'
      };
    }

    // 5. Language code check
    const langCode = (template.language || 'id').trim().toLowerCase();
    if (!langCode) {
      return {
        success: false,
        messageId,
        renderedText: renderRes.renderedText,
        errorCategory: 'TEMPLATE_ERROR',
        error: 'Template WhatsApp tidak dapat digunakan. Periksa status approval, language code, dan parameter template.'
      };
    }

    // 6. Map parameter values & check for empty parameter values
    const parameters: Array<{ type: 'text'; text: string }> = [];
    if (template.variables && template.variables.length > 0) {
      for (const v of template.variables) {
        const val = getVariableValue(v, contact, variableMappings);
        if (val === undefined || val === null || String(val).trim() === '') {
          return {
            success: false,
            messageId,
            renderedText: renderRes.renderedText,
            errorCategory: 'PARAMETER_ERROR',
            error: `Parameter template "${v}" untuk kontak ${contact.name} kosong atau tidak terpetakan.`
          };
        }
        parameters.push({ type: 'text', text: String(val).trim().substring(0, 1024) });
      }
    }

    // 7. Execute sending via backend proxy
    try {
      const response = await fetch('/api/whatsapp/send-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: phoneCheck.normalized,
          templateName: template.name,
          languageCode: langCode,
          parameters,
          campaignId,
          messageId
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        return {
          success: false,
          messageId,
          renderedText: renderRes.renderedText,
          errorCategory: resData.errorCategory || 'META_API_ERROR',
          error: resData.error || `HTTP ${response.status}: Gagal mengirim pesan ke Meta WhatsApp API`,
          statusCode: response.status
        };
      }

      return {
        success: true,
        messageId,
        wamid: resData.wamid,
        renderedText: renderRes.renderedText,
        statusCode: 200
      };
    } catch (err: any) {
      return {
        success: false,
        messageId,
        renderedText: renderRes.renderedText,
        errorCategory: 'NETWORK_ERROR',
        error: `Koneksi backend terputus: ${err.message}`,
        statusCode: 500
      };
    }
  }

  /**
   * Sends freeform 24-hour window text response (for customer reply inbox) via backend proxy
   */
  public async sendTextMessage(toPhone: string, text: string): Promise<SendResult> {
    const phoneCheck = this.validatePhone(toPhone);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (!phoneCheck.isValid) {
      return {
        success: false,
        messageId,
        renderedText: text,
        errorCategory: 'PHONE_NUMBER_ERROR',
        error: phoneCheck.error
      };
    }

    try {
      const response = await fetch('/api/whatsapp/send-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: phoneCheck.normalized,
          text
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        return {
          success: false,
          messageId,
          renderedText: text,
          errorCategory: resData.errorCategory || 'META_API_ERROR',
          error: resData.error || 'Gagal mengirim pesan teks',
          statusCode: response.status
        };
      }

      return {
        success: true,
        messageId,
        wamid: resData.wamid,
        renderedText: text,
        statusCode: 200
      };
    } catch (err: any) {
      return {
        success: false,
        messageId,
        renderedText: text,
        errorCategory: 'NETWORK_ERROR',
        error: err.message,
        statusCode: 500
      };
    }
  }
}
