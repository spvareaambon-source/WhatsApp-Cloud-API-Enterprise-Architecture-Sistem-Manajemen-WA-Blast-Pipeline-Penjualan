import { Contact } from '../types';

export interface RenderResult {
  success: boolean;
  renderedText: string;
  missingVariables: string[];
  errorMessage?: string;
}

export function extractVariables(templateBody: string): string[] {
  if (!templateBody) return [];
  const matches = templateBody.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  const unique = new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()));
  return Array.from(unique);
}

export function getVariableValue(
  varName: string,
  contact: Contact,
  mappingOverride?: Record<string, string>
): string | undefined {
  // If explicitly mapped
  if (mappingOverride && mappingOverride[varName]) {
    const targetField = mappingOverride[varName];
    // Check if custom field
    if (contact.customFields && contact.customFields[targetField]) {
      return contact.customFields[targetField];
    }
    // Check standard fields
    const val = (contact as any)[targetField];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val);
    }
  }

  // Standard Indonesian variable fallbacks
  const normalizedVar = varName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (normalizedVar === 'nama' || normalizedVar === 'name' || normalizedVar === 'namanasabah') {
    return contact.name;
  }
  if (normalizedVar === 'produk' || normalizedVar === 'product') {
    return contact.product;
  }
  if (normalizedVar === 'wilayah' || normalizedVar === 'region') {
    return contact.region;
  }
  if (normalizedVar === 'kota' || normalizedVar === 'city') {
    return contact.city;
  }
  if (normalizedVar === 'namapetugas' || normalizedVar === 'pic' || normalizedVar === 'sales') {
    return contact.pic;
  }
  if (normalizedVar === 'nomorpetugas' || normalizedVar === 'nomorsales') {
    return '0812-8899-0011';
  }
  if (normalizedVar === 'namausaha' || normalizedVar === 'perusahaan') {
    return contact.customFields?.namaUsaha || contact.category;
  }
  if (normalizedVar === 'tanggal' || normalizedVar === 'date') {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  if (normalizedVar === 'kategori' || normalizedVar === 'category') {
    return contact.category;
  }
  if (normalizedVar === 'nomor' || normalizedVar === 'phone') {
    return contact.phone;
  }

  // Check customFields directly
  if (contact.customFields && contact.customFields[varName]) {
    return contact.customFields[varName];
  }

  return undefined;
}

/**
 * Renders template body with contact variables.
 * Enforces rule: If any variable cannot be resolved, fail and flag missing variables!
 */
export function renderPersonalizedMessage(
  templateBody: string,
  contact: Contact,
  mappingOverride?: Record<string, string>
): RenderResult {
  const variables = extractVariables(templateBody);
  const missingVariables: string[] = [];

  let rendered = templateBody;

  for (const v of variables) {
    const val = getVariableValue(v, contact, mappingOverride);
    if (val === undefined || val.trim() === '') {
      missingVariables.push(v);
    } else {
      const regex = new RegExp(`\\{\\{${v}\\}\\}`, 'g');
      rendered = rendered.replace(regex, val);
    }
  }

  if (missingVariables.length > 0) {
    return {
      success: false,
      renderedText: rendered,
      missingVariables,
      errorMessage: `Data personalisasi tidak tersedia untuk variabel: ${missingVariables.map(v => `{{${v}}}`).join(', ')}`
    };
  }

  return {
    success: true,
    renderedText: rendered,
    missingVariables: []
  };
}
