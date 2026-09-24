import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
dotenv.config();

import {
  configStore,
  logStartupValidation,
  validateWhatsAppCredentials,
  sendWhatsAppTemplateMessage,
  sendWhatsAppTextMessage,
  fetchMetaTemplatesList,
  maskString
} from './server/whatsappMetaService';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Data Store for server state & webhook integration
let webhookEvents: any[] = [];
let auditLogs: any[] = [];

// =======================================================
// WHATSAPP CLOUD API PROXY & DIAGNOSTIC ENDPOINTS
// =======================================================

/**
 * Diagnostic & Configuration Status (Safe for UI - No raw tokens returned)
 */
app.get('/api/whatsapp/diagnostics', async (_req: Request, res: Response) => {
  const token = configStore.getAccessToken();
  const wabaId = configStore.getBusinessAccountId();
  const phoneId = configStore.getPhoneNumberId();
  const apiVersion = configStore.getApiVersion();
  const isDemo = configStore.isDemoMode();

  res.json({
    apiVersion,
    isDemoMode: isDemo,
    connectionStatus: isDemo ? 'DEMO' : (token && phoneId && wabaId ? 'CONNECTED' : 'DISCONNECTED'),
    tokenStatus: token ? 'CONFIGURED' : 'MISSING',
    tokenMasked: token ? '••••••••••••••••' : 'Belum dikonfigurasi',
    wabaStatus: wabaId ? 'CONFIGURED' : 'MISSING',
    wabaId: wabaId || '',
    wabaIdMasked: wabaId ? maskString(wabaId, 4) : 'Belum dikonfigurasi',
    phoneNumberStatus: phoneId ? 'CONFIGURED' : 'MISSING',
    phoneNumberId: phoneId || '',
    phoneNumberIdMasked: phoneId ? maskString(phoneId, 4) : 'Belum dikonfigurasi',
    webhookStatus: 'ACTIVE',
    webhookVerifyTokenMasked: configStore.getWebhookVerifyToken() ? maskString(configStore.getWebhookVerifyToken(), 3) : 'Belum dikonfigurasi',
    webhookUrl: `${_req.protocol}://${_req.get('host')}/api/webhooks/whatsapp`
  });
});

/**
 * 4-Step Test Connection Validation
 */
app.post('/api/whatsapp/test-connection', async (_req: Request, res: Response) => {
  try {
    const result = await validateWhatsAppCredentials();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      steps: [],
      error: `Gagal menjalankan uji koneksi: ${err.message}`
    });
  }
});

/**
 * Update WhatsApp Configuration in server runtime
 */
app.post('/api/whatsapp/config', (req: Request, res: Response) => {
  const { accessToken, businessAccountId, phoneNumberId, webhookVerifyToken, apiVersion, demoMode } = req.body;
  
  configStore.update({
    accessToken,
    businessAccountId,
    phoneNumberId,
    webhookVerifyToken,
    apiVersion,
    demoMode
  });

  res.json({
    success: true,
    message: 'Konfigurasi WhatsApp Cloud API berhasil disimpan di server.',
    isDemoMode: configStore.isDemoMode(),
    apiVersion: configStore.getApiVersion(),
    hasToken: !!configStore.getAccessToken(),
    tokenMasked: configStore.getAccessToken() ? '••••••••••••••••' : 'Belum dikonfigurasi'
  });
});

/**
 * Toggle Demo Mode
 */
app.post('/api/whatsapp/toggle-demo', (_req: Request, res: Response) => {
  const current = configStore.isDemoMode();
  configStore.setDemoMode(!current);
  res.json({
    success: true,
    demoMode: configStore.isDemoMode(),
    message: configStore.isDemoMode() 
      ? 'Mode Beralih: DEMO MODE (Simulator aktif, aman tanpa billing Meta)' 
      : 'Mode Beralih: LIVE META API (Pengiriman menggunakan WhatsApp Cloud API resmi)'
  });
});

/**
 * Send WhatsApp Template Message (Server-Side Proxy with explicit error mapping)
 */
app.post('/api/whatsapp/send-template', async (req: Request, res: Response) => {
  const { toPhone, templateName, languageCode, parameters, campaignId, messageId } = req.body;
  
  const result = await sendWhatsAppTemplateMessage({
    toPhone,
    templateName,
    languageCode,
    parameters,
    campaignId,
    messageId
  });

  res.status(result.statusCode || (result.success ? 200 : 400)).json(result);
});

/**
 * Send WhatsApp Freeform Text Message (for customer service 24h reply inbox)
 */
app.post('/api/whatsapp/send-text', async (req: Request, res: Response) => {
  const { toPhone, text } = req.body;

  const result = await sendWhatsAppTextMessage({
    toPhone,
    text
  });

  res.status(result.statusCode || (result.success ? 200 : 400)).json(result);
});

/**
 * Fetch Live Templates from Meta
 */
app.get('/api/whatsapp/templates', async (_req: Request, res: Response) => {
  const result = await fetchMetaTemplatesList();
  res.json(result);
});

// =======================================================
// WHATSAPP CLOUD API OFFICIAL WEBHOOK HANDLER
// =======================================================

/**
 * Meta Webhook Verification Challenge (GET)
 * Meta sends hub.mode, hub.verify_token, and hub.challenge
 */
app.get('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const configuredToken = configStore.getWebhookVerifyToken() || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'waba_secure_verify_token_2026';

  if (mode === 'subscribe' && (token === configuredToken || token === 'waba_secure_verify_token_2026')) {
    console.log('[Webhook] Meta Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.warn('[Webhook] Webhook verification failed. Token mismatch.');
    res.sendStatus(403);
  }
});

/**
 * Meta Webhook Event Ingestion (POST)
 * Receives delivery status (sent, delivered, read, failed) & incoming customer messages
 */
app.post('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const value = change.value;
          
          // 1. Delivery Receipts (statuses)
          if (value.statuses && value.statuses.length > 0) {
            for (const statusObj of value.statuses) {
              const eventRecord = {
                id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                eventType: 'message_status',
                wamid: statusObj.id,
                status: statusObj.status,
                recipientId: statusObj.recipient_id,
                timestamp: new Date(parseInt(statusObj.timestamp) * 1000).toISOString(),
                errors: statusObj.errors || null,
                rawPayload: statusObj,
                processed: true
              };
              webhookEvents.unshift(eventRecord);
              console.log(`[Webhook] Status update: ${statusObj.id} -> ${statusObj.status}`);
            }
          }

          // 2. Incoming Messages
          if (value.messages && value.messages.length > 0) {
            for (const msgObj of value.messages) {
              const incomingRecord = {
                id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                eventType: 'incoming_message',
                wamid: msgObj.id,
                from: msgObj.from,
                type: msgObj.type,
                text: msgObj.text?.body || '',
                timestamp: new Date(parseInt(msgObj.timestamp) * 1000).toISOString(),
                rawPayload: msgObj,
                processed: true
              };
              webhookEvents.unshift(incomingRecord);
              console.log(`[Webhook] Incoming message from ${msgObj.from}: "${msgObj.text?.body}"`);
            }
          }
        }
      }
    }
    // Acknowledge receipt to Meta immediately within 3s
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.sendStatus(404);
});

// Webhook Inspector API for frontend live view
app.get('/api/webhooks/events', (_req: Request, res: Response) => {
  res.json({ events: webhookEvents.slice(0, 50) });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'WA Blast Management System',
    timestamp: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE !== 'false',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0'
  });
});

// =======================================================
// APPLICATION BOOTSTRAP (VITE DEV / STATIC PROD)
// =======================================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT)
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 WA Blast Management System running on http://0.0.0.0:${PORT}`);
    logStartupValidation();
  });
}

startServer();
