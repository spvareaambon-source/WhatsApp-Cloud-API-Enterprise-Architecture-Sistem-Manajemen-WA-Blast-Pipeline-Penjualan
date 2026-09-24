/**
 * Phone Number Normalization & Validation Utility
 * Adheres to WhatsApp Business Platform / Meta Cloud API requirements:
 * Standard international E.164 format without leading '+' (e.g. 6281234567890)
 */

export interface ValidationResult {
  isValid: boolean;
  normalized: string;
  original: string;
  error?: string;
  operator?: string;
}

export function normalizeWhatsAppNumber(rawPhone: string): ValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      original: rawPhone || '',
      error: 'Nomor telepon tidak boleh kosong'
    };
  }

  const original = rawPhone.trim();
  // Strip all non-digits except initial '+'
  let cleaned = original.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Indonesian local prefix normalization
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  // Final sanity validation for WhatsApp format
  // Indonesian numbers: 62 + 8xx + 7 to 11 digits (total 10-14 digits)
  // International: 10 to 15 digits
  if (!/^\d{10,15}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      original,
      error: `Panjang nomor tidak valid (${cleaned.length} digit, standar: 10-14 digit)`
    };
  }

  // Check specific Indonesian cellular operators for higher accuracy
  let operator = 'Internasional / Umum';
  if (cleaned.startsWith('628')) {
    const prefix = cleaned.substring(2, 5);
    if (['811', '812', '813', '821', '822', '823', '852', '853'].includes(prefix)) {
      operator = 'Telkomsel';
    } else if (['814', '815', '816', '855', '856', '857', '858'].includes(prefix)) {
      operator = 'Indosat Ooredoo';
    } else if (['817', '818', '819', '859', '877', '878', '879'].includes(prefix)) {
      operator = 'XL Axiata';
    } else if (['831', '832', '833', '838'].includes(prefix)) {
      operator = 'Axis';
    } else if (['895', '896', '897', '898', '899'].includes(prefix)) {
      operator = 'Tri (3)';
    } else if (['881', '882', '883', '884', '885', '886', '887', '888', '889'].includes(prefix)) {
      operator = 'Smartfren';
    } else {
      operator = 'Seluler Indonesia';
    }
  }

  return {
    isValid: true,
    normalized: cleaned,
    original,
    operator
  };
}

/**
 * Masks phone number for privacy protection (Data Privacy Compliance)
 * e.g., 6281234567890 -> 62812****7890
 */
export function maskPhoneNumber(phone: string, shouldMask: boolean = false): string {
  if (!shouldMask || !phone || phone.length < 8) return phone;
  const start = phone.substring(0, 5);
  const end = phone.substring(phone.length - 4);
  return `${start}****${end}`;
}

/**
 * Formats normalized number for Indonesian visual display
 * e.g., 628123456789 -> +62 812-3456-789
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  if (phone.startsWith('62')) {
    const rest = phone.substring(2);
    if (rest.length >= 10) {
      return `+62 ${rest.substring(0, 3)}-${rest.substring(3, 7)}-${rest.substring(7)}`;
    }
    return `+62 ${rest}`;
  }
  return phone;
}
