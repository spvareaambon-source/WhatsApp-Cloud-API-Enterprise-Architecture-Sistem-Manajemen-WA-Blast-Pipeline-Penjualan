export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  createdAt?: string;
}

export type CustomerStatus = 'AKTIF' | 'PROSPEK' | 'DORMANT';
export type OptInStatus = 'OPTED_IN' | 'OPTED_OUT' | 'UNKNOWN';

export interface Contact {
  id: string;
  name: string;
  phone: string; // E.164 normalized without '+' e.g. '628123456789'
  email: string;
  city: string;
  region: string;
  category: string; // e.g., 'Retail', 'Korporasi', 'Prioritas', 'UMKM'
  product: string; // e.g., 'Cicil Emas', 'Gadai', 'Tabungan Emas', 'Mulia', 'Amanah'
  customerStatus: CustomerStatus;
  segment?: string;
  tags: string[];
  pic: string; // Sales PIC name
  optInStatus: OptInStatus;
  optInDate?: string;
  optInSource?: string;
  consentNote?: string;
  optOutDate?: string;
  lastContact?: string;
  lastReply?: string;
  customFields?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentRule {
  id: string;
  field: 'product' | 'region' | 'city' | 'category' | 'customerStatus' | 'optInStatus' | 'tag' | 'pic';
  operator: 'equals' | 'not_equals' | 'contains' | 'in';
  value: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  matchType: 'ALL' | 'ANY'; // AND or OR
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: string;
  count: number;
  createdAt: string;
}

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type TemplateQuality = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
export type HeaderType = 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT';

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  language: string; // e.g., 'id'
  headerType: HeaderType;
  headerContent?: string;
  body: string; // contains {{1}}, {{nama}}, {{produk}}, etc.
  footer?: string;
  buttons: TemplateButton[];
  variables: string[]; // ['nama', 'produk', 'namaPetugas', 'wilayah']
  approvalStatus: TemplateApprovalStatus;
  status?: TemplateApprovalStatus; // Meta Graph API alias
  qualityRating: TemplateQuality;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 
  | 'DRAFT' 
  | 'SCHEDULED' 
  | 'RUNNING' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'FAILED';

export interface CampaignStats {
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  replied: number;
  conversion: number;
  converted?: number; // Alias for conversion
}

export interface SendingStrategy {
  batchSize: number; // e.g. 50 messages per batch
  delayBetweenBatchesSeconds: number; // e.g. 5 seconds
  dailyLimit?: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  segmentId: string;
  segmentName: string;
  templateId: string;
  templateName: string;
  senderPhoneId: string;
  scheduleType: 'NOW' | 'SCHEDULED';
  scheduledAt?: string;
  timezone: string;
  sendingStrategy: SendingStrategy;
  variableMappings: Record<string, string>; // e.g. { 'nama': 'name', 'produk': 'product', 'wilayah': 'region', 'namaPetugas': 'pic' }
  status: CampaignStatus;
  stats: CampaignStats;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
}

export type MessageStatus = 'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface MessageLog {
  id: string;
  wamid?: string; // WhatsApp Message ID from Meta
  campaignId: string;
  campaignName: string;
  contactId: string;
  contactName: string;
  phone: string;
  contactPhone?: string; // Alias for phone
  templateName: string;
  renderedBody: string;
  status: MessageStatus;
  queuedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  repliedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  sender: 'CUSTOMER' | 'AGENT' | 'SYSTEM' | 'USER';
  senderName?: string;
  text: string;
  timestamp: string;
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  wamid?: string;
}

export type ChatMessage = ConversationMessage;

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  contactPhone?: string; // Alias for phone
  avatar: string;
  status: 'OPEN' | 'FOLLOW-UP' | 'CLOSED' | 'FOLLOW_UP';
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  assignedPic: string;
  tags: string[];
  productInterest?: string;
  notes: string[];
  messages: ConversationMessage[];
}

export type FollowUpStage = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'INTERESTED' 
  | 'FOLLOW-UP' 
  | 'FOLLOW_UP'
  | 'NEGOTIATION' 
  | 'CLOSED' 
  | 'NOT INTERESTED';

export type LeadStage = FollowUpStage;

export interface FollowUp {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  contactPhone?: string; // Alias
  pic: string;
  stage: FollowUpStage;
  followUpDate: string;
  notes: string;
  nextAction: string;
  productInterest: string;
  product?: string; // Alias for productInterest
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  potentialValue: number; // IDR
  updatedAt: string;
}

export type FollowUpItem = FollowUp;

export type SuppressionReason = 'OPT_OUT' | 'INVALID_NUMBER' | 'BLOCKED' | 'MANUAL' | 'SPAM_COMPLAINT';

export interface SuppressionItem {
  id: string;
  phone: string;
  contactName?: string;
  reason: SuppressionReason;
  addedAt: string;
  notes?: string;
}

export interface WebhookEvent {
  id: string;
  eventType: 'messages' | 'message_status' | 'template_status_update';
  wamid?: string;
  status?: string;
  from?: string;
  timestamp: string;
  rawPayload: any;
  processed: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  objectType: string;
  objectId: string;
  entity?: string; // Alias for objectType
  details: string;
  timestamp: string;
  ip: string;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  wabaId?: string; // Alias for businessAccountId
  accessToken?: string; // masked / write-only
  tokenMasked?: string;
  hasToken?: boolean;
  webhookVerifyToken: string;
  apiVersion: string;
  isDemoMode: boolean;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'DEMO';
  dailyLimit: number;
  qualityScore: string;
}
