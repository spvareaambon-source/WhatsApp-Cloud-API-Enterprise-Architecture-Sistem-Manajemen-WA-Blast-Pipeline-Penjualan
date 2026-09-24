import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  WhatsAppConfig,
  ConversationMessage
} from '../types';
import { 
  INITIAL_CONTACTS, 
  INITIAL_TAGS, 
  INITIAL_SEGMENTS, 
  INITIAL_TEMPLATES, 
  INITIAL_CAMPAIGNS, 
  INITIAL_MESSAGE_LOGS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_FOLLOWUPS, 
  INITIAL_SUPPRESSION, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_USERS, 
  INITIAL_WHATSAPP_CONFIG 
} from '../data/initialData';
import { normalizeWhatsAppNumber } from '../utils/phoneNormalizer';
import { renderPersonalizedMessage } from '../utils/personalization';
import { WhatsAppService } from '../services/whatsappService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Auth & RBAC
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => { success: boolean; message: string };
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; message: string };
  
  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
  
  // Global search
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  
  // Entities
  contacts: Contact[];
  tags: Tag[];
  segments: Segment[];
  templates: MessageTemplate[];
  campaigns: Campaign[];
  messageLogs: MessageLog[];
  conversations: Conversation[];
  followUps: FollowUp[];
  suppressionList: SuppressionItem[];
  auditLogs: AuditLog[];
  whatsAppConfig: WhatsAppConfig;
  
  // Actions - Contacts
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  bulkDeleteContacts: (ids: string[]) => void;
  bulkTagContacts: (ids: string[], tagName: string) => void;
  bulkAssignPic: (ids: string[], picName: string) => void;
  renamePicGlobal: (oldPic: string, newPic: string) => void;
  clearContactsDatabase: () => void;
  importContacts: (newContacts: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>) => { imported: number; skipped: number; invalid: number };
  
  // Actions - Segments & Tags
  createSegment: (segment: Omit<Segment, 'id' | 'contactCount' | 'createdAt' | 'updatedAt'>) => void;
  editSegment: (id: string, segment: Partial<Segment>) => void;
  deleteSegment: (id: string) => void;
  duplicateSegment: (id: string) => void;
  filterContactsBySegment: (rules: Segment['rules'], matchType: 'ALL' | 'ANY') => Contact[];
  createTag: (tag: Omit<Tag, 'id' | 'count' | 'createdAt'>) => void;
  deleteTag: (id: string) => void;

  // Actions - Templates
  createTemplate: (tpl: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  duplicateTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  
  // Actions - Campaigns & Queue
  createCampaign: (campaign: Omit<Campaign, 'id' | 'stats' | 'status' | 'createdAt' | 'createdBy'>) => string;
  sendCampaign: (campaignId: string) => Promise<void>;
  pauseCampaign: (campaignId: string) => void;
  resumeCampaign: (campaignId: string) => void;
  cancelCampaign: (campaignId: string) => void;
  deleteCampaign: (campaignId: string) => void;
  duplicateCampaign: (campaignId: string) => void;
  resendFailedMessages: (campaignId: string) => void;
  retryFailedMessages: (campaignId: string) => void;
  
  // Actions - Inbox & Followups
  replyConversation: (convId: string, text: string) => Promise<void>;
  sendMessageInConversation: (convId: string, text: string) => Promise<void>;
  markConversationAsRead: (convId: string) => void;
  updateConversationStatus: (convId: string, status: Conversation['status']) => void;
  addConversationNote: (convId: string, note: string) => void;
  deleteConversation: (convId: string) => void;
  updateFollowUpStage: (id: string, stage: FollowUp['stage']) => void;
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'updatedAt'>) => void;
  editFollowUp: (id: string, updates: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  
  // Actions - Logs
  deleteMessageLog: (id: string) => void;
  clearMessageLogs: () => void;
  clearAuditLogs: () => void;

  // Actions - Suppression & Config
  addSuppressionItem: (item: Omit<SuppressionItem, 'id' | 'addedAt'>) => void;
  removeSuppressionItem: (id: string) => void;
  addToSuppressionList: (phone: string, reason?: SuppressionItem['reason'], notes?: string) => void;
  removeFromSuppressionList: (phone: string) => void;
  updateWhatsAppConfig: (updates: Partial<WhatsAppConfig>) => void;
  toggleDemoMode: () => void;
  sendTestMessage: (phone: string, templateId: string) => Promise<{ success: boolean; message: string }>;
  
  // System
  logAction: (action: string, objectType: string, objectId: string, details: string) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Users state with local persistence & auto-ensure admin user exists
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('wb_system_users');
    let loaded: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    
    // Ensure default admin (admin / admin123) is always present
    const hasAdmin = loaded.some(u => (u.username || '').toLowerCase() === 'admin');
    if (!hasAdmin) {
      loaded = [INITIAL_USERS[0], ...loaded];
    } else {
      // Ensure admin has password and username set
      loaded = loaded.map(u => {
        if ((u.username || '').toLowerCase() === 'admin') {
          return { ...u, username: 'admin', password: u.password || 'admin123', role: 'SUPER_ADMIN' };
        }
        return u;
      });
    }
    return loaded;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('wb_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('wb_is_authenticated');
    return saved === 'true';
  });

  // Views & active selection
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Sync users & auth to localStorage
  useEffect(() => {
    localStorage.setItem('wb_system_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('wb_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('wb_is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // State entities with local persistence
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('wb_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [tags, setTags] = useState<Tag[]>(() => {
    const saved = localStorage.getItem('wb_tags');
    return saved ? JSON.parse(saved) : INITIAL_TAGS;
  });

  const [segments, setSegments] = useState<Segment[]>(() => {
    const saved = localStorage.getItem('wb_segments');
    return saved ? JSON.parse(saved) : INITIAL_SEGMENTS;
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem('wb_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('wb_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(() => {
    const saved = localStorage.getItem('wb_messageLogs');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGE_LOGS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('wb_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem('wb_followUps');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS;
  });

  const [suppressionList, setSuppressionList] = useState<SuppressionItem[]>(() => {
    const saved = localStorage.getItem('wb_suppression');
    return saved ? JSON.parse(saved) : INITIAL_SUPPRESSION;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('wb_auditLogs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    const saved = localStorage.getItem('wb_config');
    return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_CONFIG;
  });

  // Sync to local storage (Ensuring raw accessToken is NEVER stored in browser localStorage)
  useEffect(() => { localStorage.setItem('wb_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('wb_tags', JSON.stringify(tags)); }, [tags]);
  useEffect(() => { localStorage.setItem('wb_segments', JSON.stringify(segments)); }, [segments]);
  useEffect(() => { localStorage.setItem('wb_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('wb_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('wb_messageLogs', JSON.stringify(messageLogs)); }, [messageLogs]);
  useEffect(() => { localStorage.setItem('wb_conversations', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('wb_followUps', JSON.stringify(followUps)); }, [followUps]);
  useEffect(() => { localStorage.setItem('wb_suppression', JSON.stringify(suppressionList)); }, [suppressionList]);
  useEffect(() => { localStorage.setItem('wb_auditLogs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { 
    const { accessToken, ...safeConfig } = whatsAppConfig;
    localStorage.setItem('wb_config', JSON.stringify(safeConfig)); 
  }, [whatsAppConfig]);

  // Load live server WhatsApp configuration & diagnostics on mount
  useEffect(() => {
    WhatsAppService.getDiagnostics().then(diag => {
      if (diag && diag.apiVersion) {
        setWhatsAppConfig(prev => ({
          ...prev,
          apiVersion: diag.apiVersion || prev.apiVersion,
          isDemoMode: diag.isDemoMode !== undefined ? diag.isDemoMode : prev.isDemoMode,
          connectionStatus: diag.connectionStatus || prev.connectionStatus,
          tokenMasked: diag.tokenMasked || prev.tokenMasked,
          hasToken: diag.tokenStatus === 'CONFIGURED',
          phoneNumberId: diag.phoneNumberId || prev.phoneNumberId,
          businessAccountId: diag.wabaId || prev.businessAccountId,
          wabaId: diag.wabaId || prev.wabaId
        }));
      }
    }).catch(() => {});
  }, []);

  // Audit Logging
  const logAction = (action: string, objectType: string, objectId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: `${currentUser.name} (${currentUser.role})`,
      action,
      objectType,
      objectId,
      details,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1 (Web Portal)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Contacts Actions
  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const norm = normalizeWhatsAppNumber(contactData.phone);
    const newContact: Contact = {
      ...contactData,
      id: `ct_${Date.now()}`,
      phone: norm.isValid ? norm.normalized : contactData.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContacts(prev => [newContact, ...prev]);
    logAction('CREATE_CONTACT', 'CONTACT', newContact.id, `Menambahkan kontak baru: ${newContact.name} (${newContact.phone})`);
    addToast({ type: 'success', title: 'Kontak Ditambahkan', message: `Kontak ${newContact.name} berhasil disimpan.` });
  };

  const editContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const phone = updates.phone ? normalizeWhatsAppNumber(updates.phone).normalized : c.phone;
        return { ...c, ...updates, phone, updatedAt: new Date().toISOString() };
      }
      return c;
    }));
    logAction('EDIT_CONTACT', 'CONTACT', id, `Memperbarui data kontak ID: ${id}`);
    addToast({ type: 'info', title: 'Kontak Diperbarui', message: 'Perubahan data kontak berhasil disimpan.' });
  };

  const deleteContact = (id: string) => {
    const target = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (target) {
      logAction('DELETE_CONTACT', 'CONTACT', id, `Menghapus kontak: ${target.name}`);
    }
    addToast({ type: 'warning', title: 'Kontak Dihapus', message: 'Kontak berhasil dihapus dari database.' });
  };

  const bulkDeleteContacts = (ids: string[]) => {
    setContacts(prev => prev.filter(c => !ids.includes(c.id)));
    logAction('BULK_DELETE_CONTACTS', 'CONTACT', `${ids.length} items`, `Menghapus ${ids.length} kontak secara massal.`);
    addToast({ type: 'warning', title: 'Bulk Delete Selesai', message: `${ids.length} kontak telah dihapus.` });
  };

  const clearContactsDatabase = () => {
    const deletedCount = contacts.length;
    setContacts([]);
    localStorage.setItem('wb_contacts', JSON.stringify([]));
    setSegments(prev => prev.map(s => ({ ...s, contactCount: 0 })));
    logAction('RESET_DATABASE', 'CONTACTS', 'all', `Mereset database kontak Excel: ${deletedCount} kontak nasabah dihapus permanen. Database kosong.`);
    addToast({ 
      type: 'warning', 
      title: 'Database Kontak Dikosongkan', 
      message: `Seluruh (${deletedCount}) data kontak Excel berhasil dihapus. Database sekarang kosong tanpa data.` 
    });
  };

  const bulkTagContacts = (ids: string[], tagName: string) => {
    setContacts(prev => prev.map(c => {
      if (ids.includes(c.id)) {
        const set = new Set([...c.tags, tagName]);
        return { ...c, tags: Array.from(set), updatedAt: new Date().toISOString() };
      }
      return c;
    }));
    logAction('BULK_TAG_CONTACTS', 'CONTACT', tagName, `Memberikan tag "${tagName}" ke ${ids.length} kontak.`);
    addToast({ type: 'success', title: 'Tag Diberikan', message: `Tag "${tagName}" berhasil diberikan ke ${ids.length} kontak.` });
  };

  const bulkAssignPic = (ids: string[], picName: string) => {
    setContacts(prev => prev.map(c => {
      if (ids.includes(c.id)) {
        return { ...c, pic: picName, updatedAt: new Date().toISOString() };
      }
      return c;
    }));
    logAction('BULK_ASSIGN_PIC', 'CONTACT', picName, `Assign PIC ${picName} ke ${ids.length} kontak.`);
    addToast({ type: 'success', title: 'PIC Ditugaskan', message: `Sales PIC ${picName} berhasil ditugaskan ke ${ids.length} kontak.` });
  };

  const renamePicGlobal = (oldPic: string, newPic: string) => {
    const trimmedNew = newPic.trim();
    if (!trimmedNew) return;
    
    let affectedContacts = 0;
    setContacts(prev => prev.map(c => {
      if (c.pic.trim().toLowerCase() === oldPic.trim().toLowerCase()) {
        affectedContacts++;
        return { ...c, pic: trimmedNew, updatedAt: new Date().toISOString() };
      }
      return c;
    }));

    setConversations(prev => prev.map(conv => {
      if (conv.assignedPic.trim().toLowerCase() === oldPic.trim().toLowerCase()) {
        return { ...conv, assignedPic: trimmedNew };
      }
      return conv;
    }));

    setFollowUps(prev => prev.map(f => {
      if (f.pic.trim().toLowerCase() === oldPic.trim().toLowerCase()) {
        return { ...f, pic: trimmedNew, updatedAt: new Date().toISOString() };
      }
      return f;
    }));

    logAction('RENAME_PIC', 'CONTACT', `${oldPic} -> ${trimmedNew}`, `Mengganti nama Sales/PIC dari "${oldPic}" menjadi "${trimmedNew}" (${affectedContacts} kontak).`);
    addToast({
      type: 'success',
      title: 'Nama Sales/PIC Diperbarui',
      message: `Nama PIC "${oldPic}" berhasil diubah menjadi "${trimmedNew}" pada ${affectedContacts} kontak nasabah.`
    });
  };

  const importContacts = (newItems: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>) => {
    let imported = 0;
    let skipped = 0;
    let invalid = 0;

    const existingPhones = new Set(contacts.map(c => c.phone));
    const suppressedPhones = new Set(suppressionList.map(s => s.phone));

    const validNewList: Contact[] = [];

    newItems.forEach(item => {
      const norm = normalizeWhatsAppNumber(item.phone);
      if (!norm.isValid) {
        invalid++;
        return;
      }
      if (existingPhones.has(norm.normalized) || suppressedPhones.has(norm.normalized)) {
        skipped++;
        return;
      }
      existingPhones.add(norm.normalized);

      validNewList.push({
        ...item,
        id: `ct_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        phone: norm.normalized,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      imported++;
    });

    if (validNewList.length > 0) {
      setContacts(prev => [...validNewList, ...prev]);
      logAction('IMPORT_CONTACTS', 'CONTACT', `${imported} items`, `Impor database: ${imported} berhasil, ${skipped} duplikat/suppressed, ${invalid} tidak valid.`);
      addToast({
        type: 'success',
        title: 'Impor Selesai',
        message: `${imported} kontak berhasil diimpor (${skipped} dilewati, ${invalid} tidak valid).`
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Tidak Ada Kontak Baru',
        message: `Seluruh kontak (${skipped} duplikat/suppressed, ${invalid} invalid) dilewati.`
      });
    }

    return { imported, skipped, invalid };
  };

  // Segments Filtering & Actions
  const filterContactsBySegment = (rules: Segment['rules'], matchType: 'ALL' | 'ANY'): Contact[] => {
    if (!rules || rules.length === 0) return contacts;

    return contacts.filter(contact => {
      const results = rules.map(rule => {
        let contactValue: any = '';
        if (rule.field === 'tag') {
          return contact.tags.some(t => t.toLowerCase() === rule.value.toLowerCase());
        }
        contactValue = (contact as any)[rule.field] || '';

        const strContactVal = String(contactValue).toLowerCase();
        const strRuleVal = String(rule.value).toLowerCase();

        switch (rule.operator) {
          case 'equals':
            return strContactVal === strRuleVal;
          case 'not_equals':
            return strContactVal !== strRuleVal;
          case 'contains':
            return strContactVal.includes(strRuleVal);
          default:
            return true;
        }
      });

      return matchType === 'ALL' ? results.every(Boolean) : results.some(Boolean);
    });
  };

  const createSegment = (segData: Omit<Segment, 'id' | 'contactCount' | 'createdAt' | 'updatedAt'>) => {
    const matched = filterContactsBySegment(segData.rules, segData.matchType);
    const newSeg: Segment = {
      ...segData,
      id: `seg_${Date.now()}`,
      contactCount: matched.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSegments(prev => [newSeg, ...prev]);
    logAction('CREATE_SEGMENT', 'SEGMENT', newSeg.id, `Membuat segmentasi: ${newSeg.name} (${matched.length} audiens)`);
    addToast({ type: 'success', title: 'Segment Dibuat', message: `Segment ${newSeg.name} dengan ${matched.length} kontak disimpan.` });
  };

  const editSegment = (id: string, updates: Partial<Segment>) => {
    setSegments(prev => prev.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...updates };
        const matched = filterContactsBySegment(merged.rules, merged.matchType);
        return { ...merged, contactCount: matched.length, updatedAt: new Date().toISOString() };
      }
      return s;
    }));
    logAction('EDIT_SEGMENT', 'SEGMENT', id, `Memperbarui segmentasi ID ${id}`);
    addToast({ type: 'info', title: 'Segment Diperbarui', message: 'Kriteria segmentasi berhasil diupdate.' });
  };

  const deleteSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_SEGMENT', 'SEGMENT', id, `Menghapus segmentasi ID ${id}`);
    addToast({ type: 'warning', title: 'Segment Dihapus', message: 'Segmentasi telah dihapus.' });
  };

  const duplicateSegment = (id: string) => {
    const source = segments.find(s => s.id === id);
    if (!source) return;
    const duplicated: Segment = {
      ...source,
      id: `seg_${Date.now()}`,
      name: `${source.name} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSegments(prev => [duplicated, ...prev]);
    addToast({ type: 'success', title: 'Segment Diduplikasi', message: `Salinan segment berhasil dibuat.` });
  };

  // Tags Actions
  const createTag = (tagData: Omit<Tag, 'id' | 'count' | 'createdAt'>) => {
    const newTag: Tag = {
      ...tagData,
      id: `tag_${Date.now()}`,
      count: 0,
      createdAt: new Date().toISOString()
    };
    setTags(prev => [...prev, newTag]);
    addToast({ type: 'success', title: 'Tag Dibuat', message: `Tag "${newTag.name}" berhasil ditambahkan.` });
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    addToast({ type: 'info', title: 'Tag Dihapus', message: 'Tag telah dihapus dari sistem.' });
  };

  // Templates Actions
  const createTemplate = (tpl: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTpl: MessageTemplate = {
      ...tpl,
      id: `tpl_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => [newTpl, ...prev]);
    logAction('CREATE_TEMPLATE', 'TEMPLATE', newTpl.id, `Membuat WhatsApp template: ${newTpl.name}`);
    addToast({ type: 'success', title: 'Template Dibuat', message: `Template "${newTpl.name}" siap diajukan ke Meta.` });
  };

  const editTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    logAction('EDIT_TEMPLATE', 'TEMPLATE', id, `Mengedit template ID ${id}`);
    addToast({ type: 'info', title: 'Template Diperbarui', message: 'Perubahan template disimpan.' });
  };

  const duplicateTemplate = (id: string) => {
    const target = templates.find(t => t.id === id);
    if (!target) return;
    const duplicated: MessageTemplate = {
      ...target,
      id: `tpl_${Date.now()}`,
      name: `${target.name}_copy`,
      approvalStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => [duplicated, ...prev]);
    addToast({ type: 'success', title: 'Template Diduplikasi', message: `Salinan template berhasil dibuat.` });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    addToast({ type: 'warning', title: 'Template Dihapus', message: 'Template telah dihapus.' });
  };

  // Campaigns & Queue Actions
  const createCampaign = (cData: Omit<Campaign, 'id' | 'stats' | 'status' | 'createdAt' | 'createdBy'>): string => {
    const targetSegment = segments.find(s => s.id === cData.segmentId);
    let audienceCount = 0;
    if (targetSegment) {
      const matched = filterContactsBySegment(targetSegment.rules, targetSegment.matchType);
      const suppressedSet = new Set(suppressionList.map(s => s.phone));
      audienceCount = matched.filter(c => c.optInStatus !== 'OPTED_OUT' && !suppressedSet.has(c.phone)).length;
    }

    const newCampaignId = `cmp_${Date.now()}`;
    const newCampaign: Campaign = {
      ...cData,
      id: newCampaignId,
      status: cData.scheduleType === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT',
      stats: {
        total: audienceCount,
        queued: cData.scheduleType === 'SCHEDULED' ? audienceCount : 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        replied: 0,
        conversion: 0
      },
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    logAction('CREATE_CAMPAIGN', 'CAMPAIGN', newCampaign.id, `Membuat kampanye blast "${newCampaign.name}" (${audienceCount} target)`);
    addToast({ 
      type: 'success', 
      title: 'Campaign Dibuat', 
      message: `Campaign "${newCampaign.name}" berhasil dibuat (${newCampaign.status}).` 
    });
    return newCampaignId;
  };

  /**
   * Real Execution / Demo Simulation WhatsApp Blast Dispatcher
   * Processes in batches with rate limiting, exponential backoff, and event tracking
   */
  const sendCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const segment = segments.find(s => s.id === campaign.segmentId);
    const template = templates.find(t => t.id === campaign.templateId);

    if (!template) {
      addToast({ type: 'error', title: 'Gagal Mengirim', message: 'Template pesan tidak ditemukan.' });
      return;
    }

    if (template.approvalStatus !== 'APPROVED') {
      addToast({ type: 'error', title: 'Template Belum Disetujui', message: 'Pesan WhatsApp hanya dapat dikirim menggunakan template APPROVED dari Meta.' });
      return;
    }

    const matchedContacts = segment ? filterContactsBySegment(segment.rules, segment.matchType) : contacts;
    const suppressedPhones = new Set(suppressionList.map(s => s.phone));

    // Filter eligible audience
    const targetContacts = matchedContacts.filter(c => {
      if (c.optInStatus === 'OPTED_OUT') return false;
      if (suppressedPhones.has(c.phone)) return false;
      return true;
    });

    if (targetContacts.length === 0) {
      addToast({ type: 'error', title: 'Audiens Kosong', message: 'Tidak ada kontak valid atau memenuhi syarat opt-in pada segmen ini.' });
      return;
    }

    // Update campaign status to RUNNING
    setCampaigns(prev => prev.map(c => c.id === campaignId ? {
      ...c,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      stats: { ...c.stats, total: targetContacts.length, queued: targetContacts.length }
    } : c));

    logAction('SEND_CAMPAIGN', 'CAMPAIGN', campaignId, `Memulai blast campaign "${campaign.name}" ke ${targetContacts.length} target kontak.`);
    addToast({ 
      type: 'info', 
      title: 'Campaign Dimulai', 
      message: whatsAppConfig.isDemoMode 
        ? 'DEMO MODE: Memulai simulasi antrean pengiriman pesan massal...' 
        : 'Menghubungkan ke WhatsApp Cloud API...' 
    });

    const waService = new WhatsAppService(whatsAppConfig);

    // Create initial message logs with QUEUED status
    const newLogs: MessageLog[] = targetContacts.map((contact, idx) => {
      const renderRes = renderPersonalizedMessage(template.body, contact, campaign.variableMappings);
      return {
        id: `log_${Date.now()}_${idx}`,
        campaignId,
        campaignName: campaign.name,
        contactId: contact.id,
        contactName: contact.name,
        phone: contact.phone,
        templateName: template.name,
        renderedBody: renderRes.renderedText,
        status: 'QUEUED',
        queuedAt: new Date().toISOString(),
        retryCount: 0
      };
    });

    setMessageLogs(prev => [...newLogs, ...prev]);

    // Batch and Rate Limiting processing
    const batchSize = campaign.sendingStrategy?.batchSize || 10;
    const delayMs = (campaign.sendingStrategy?.delayBetweenBatchesSeconds || 2) * 1000;

    let processedCount = 0;
    let sentCount = 0;
    let deliveredCount = 0;
    let readCount = 0;
    let failedCount = 0;

    for (let i = 0; i < targetContacts.length; i += batchSize) {
      const batch = targetContacts.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (contact, batchIdx) => {
        const logId = newLogs[i + batchIdx].id;
        
        try {
          const res = await waService.sendTemplateMessage({
            contact,
            template,
            campaignId,
            campaignName: campaign.name,
            variableMappings: campaign.variableMappings
          });

          if (res.success) {
            sentCount++;
            // Update message log to SENT
            setMessageLogs(prev => prev.map(l => l.id === logId ? {
              ...l,
              status: 'SENT',
              wamid: res.wamid,
              sentAt: new Date().toISOString()
            } : l));

            // In Demo mode or Meta async simulation, trigger DELIVERED and READ status progression
            setTimeout(() => {
              deliveredCount++;
              setMessageLogs(prev => prev.map(l => l.id === logId ? {
                ...l,
                status: 'DELIVERED',
                deliveredAt: new Date().toISOString()
              } : l));

              // Progress some to READ
              if (Math.random() > 0.15) {
                setTimeout(() => {
                  readCount++;
                  setMessageLogs(prev => prev.map(l => l.id === logId ? {
                    ...l,
                    status: 'READ',
                    readAt: new Date().toISOString()
                  } : l));

                  // Simulate a realistic incoming customer reply for top contacts
                  if (Math.random() > 0.65) {
                    simulateCustomerReply(contact, template);
                  }
                }, 2500 + Math.random() * 4000);
              }
            }, 1500 + Math.random() * 2000);

          } else {
            failedCount++;
            setMessageLogs(prev => prev.map(l => l.id === logId ? {
              ...l,
              status: 'FAILED',
              errorMessage: res.error,
              errorCode: 'META_API_ERR'
            } : l));
          }
        } catch (err: any) {
          failedCount++;
          setMessageLogs(prev => prev.map(l => l.id === logId ? {
            ...l,
            status: 'FAILED',
            errorMessage: err.message || 'Network error'
          } : l));
        }

        processedCount++;
      }));

      // Update campaign stats progressively
      setCampaigns(prev => prev.map(c => c.id === campaignId ? {
        ...c,
        stats: {
          ...c.stats,
          queued: Math.max(0, targetContacts.length - processedCount),
          sent: sentCount,
          failed: failedCount
        }
      } : c));

      // Rate limit throttle pause before next batch
      if (i + batchSize < targetContacts.length) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    // Complete Campaign
    setTimeout(() => {
      setCampaigns(prev => prev.map(c => c.id === campaignId ? {
        ...c,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        stats: {
          ...c.stats,
          queued: 0,
          sent: sentCount,
          delivered: Math.max(sentCount - 1, 0),
          read: Math.max(Math.floor(sentCount * 0.8), 0),
          failed: failedCount,
          replied: Math.floor(sentCount * 0.35),
          conversion: Math.floor(sentCount * 0.15)
        }
      } : c));

      addToast({
        type: 'success',
        title: 'Campaign Selesai',
        message: `Pengiriman blast "${campaign.name}" selesai. ${sentCount} terkirim, ${failedCount} gagal.`
      });
      logAction('CAMPAIGN_COMPLETED', 'CAMPAIGN', campaignId, `Campaign "${campaign.name}" selesai dengan ${sentCount} terkirim.`);
    }, 4000);
  };

  const simulateCustomerReply = (contact: Contact, template: MessageTemplate) => {
    const sampleReplies = [
      'Halo, saya tertarik dengan penawaran ini. Boleh minta rincian simulasinya?',
      'Apakah persyaratannya cukup KTP saja atau perlu slip gaji?',
      'Bisa dijadwalkan konsultasi dengan PIC di kantor cabang terdekat?',
      'Terima kasih infonya, saya mau tanya promo angsuran untuk tenor 3 tahun.'
    ];
    const replyText = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

    setConversations(prev => {
      const existing = prev.find(c => c.contactId === contact.id);
      const newMsg: ConversationMessage = {
        id: `cm_${Date.now()}`,
        conversationId: existing ? existing.id : `conv_${Date.now()}`,
        sender: 'CUSTOMER',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c,
          lastMessage: replyText,
          lastMessageAt: 'Baru saja',
          unreadCount: c.unreadCount + 1,
          messages: [...c.messages, newMsg]
        } : c);
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          contactId: contact.id,
          contactName: contact.name,
          phone: contact.phone,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          status: 'OPEN',
          unreadCount: 1,
          lastMessage: replyText,
          lastMessageAt: 'Baru saja',
          assignedPic: contact.pic,
          tags: ['HOT LEAD', contact.product.toUpperCase()],
          notes: ['Merespon campaign blast WhatsApp'],
          messages: [
            {
              id: `cm_sys_${Date.now()}`,
              conversationId: `conv_${Date.now()}`,
              sender: 'SYSTEM',
              text: `Pesan template [${template.name}] berhasil diterima pelanggan.`,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            },
            newMsg
          ]
        };
        return [newConv, ...prev];
      }
    });

    addToast({
      type: 'info',
      title: 'Balasan WhatsApp Baru!',
      message: `${contact.name}: "${replyText.substring(0, 45)}..."`
    });
  };

  const pauseCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'PAUSED' } : c));
    logAction('PAUSE_CAMPAIGN', 'CAMPAIGN', campaignId, `Menghentikan sementara (Pause) campaign.`);
    addToast({ type: 'warning', title: 'Campaign Dijeda', message: 'Antrean pengiriman pesan telah dijeda.' });
  };

  const resumeCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'RUNNING' } : c));
    logAction('RESUME_CAMPAIGN', 'CAMPAIGN', campaignId, `Melanjutkan (Resume) campaign.`);
    addToast({ type: 'info', title: 'Campaign Dilanjutkan', message: 'Pengiriman pesan massal dilanjutkan.' });
  };

  const cancelCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'CANCELLED' } : c));
    logAction('CANCEL_CAMPAIGN', 'CAMPAIGN', campaignId, `Membatalkan campaign.`);
    addToast({ type: 'error', title: 'Campaign Dibatalkan', message: 'Campaign telah dibatalkan.' });
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    logAction('DELETE_CAMPAIGN', 'CAMPAIGN', campaignId, `Menghapus campaign ID ${campaignId}`);
    addToast({ type: 'warning', title: 'Campaign Dihapus', message: 'Data campaign telah dihapus.' });
  };

  const duplicateCampaign = (campaignId: string) => {
    const target = campaigns.find(c => c.id === campaignId);
    if (!target) return;
    const duplicated: Campaign = {
      ...target,
      id: `cmp_${Date.now()}`,
      name: `${target.name} (Copy)`,
      status: 'DRAFT',
      stats: { total: target.stats.total, queued: 0, sent: 0, delivered: 0, read: 0, failed: 0, replied: 0, conversion: 0 },
      createdAt: new Date().toISOString(),
      startedAt: undefined,
      completedAt: undefined,
      createdBy: currentUser.name
    };
    setCampaigns(prev => [duplicated, ...prev]);
    addToast({ type: 'success', title: 'Campaign Diduplikasi', message: 'Draft salinan kampanye siap diedit.' });
  };

  const resendFailedMessages = (campaignId: string) => {
    const failedLogs = messageLogs.filter(l => l.campaignId === campaignId && l.status === 'FAILED');
    if (failedLogs.length === 0) {
      addToast({ type: 'info', title: 'Tidak Ada Pesan Gagal', message: 'Semua pesan pada campaign ini berhasil.' });
      return;
    }
    setMessageLogs(prev => prev.map(l => (l.campaignId === campaignId && l.status === 'FAILED') ? {
      ...l,
      status: 'QUEUED',
      errorMessage: undefined,
      retryCount: l.retryCount + 1
    } : l));
    addToast({ type: 'success', title: 'Mencoba Kirim Ulang', message: `${failedLogs.length} pesan gagal dimasukkan ke antrean kirim ulang.` });
  };

  // Inbox & Conversation
  const replyConversation = async (convId: string, text: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;

    const waService = new WhatsAppService(whatsAppConfig);
    const sendRes = await waService.sendTextMessage(conv.phone, text);

    const newMsg: ConversationMessage = {
      id: `cm_${Date.now()}`,
      conversationId: convId,
      sender: 'AGENT',
      senderName: currentUser.name,
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: sendRes.success ? 'DELIVERED' : 'FAILED',
      wamid: sendRes.wamid
    };

    setConversations(prev => prev.map(c => c.id === convId ? {
      ...c,
      lastMessage: text,
      lastMessageAt: 'Baru saja',
      unreadCount: 0,
      messages: [...c.messages, newMsg]
    } : c));

    logAction('REPLY_MESSAGE', 'CONVERSATION', convId, `Membalas pesan ke ${conv.contactName} (${conv.phone})`);
  };

  const updateConversationStatus = (convId: string, status: Conversation['status']) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, status } : c));
    addToast({ type: 'info', title: 'Status Diperbarui', message: `Status percakapan diubah menjadi ${status}` });
  };

  const addConversationNote = (convId: string, note: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? {
      ...c,
      notes: [...c.notes, note]
    } : c));
    addToast({ type: 'success', title: 'Catatan Ditambahkan', message: 'Catatan internal berhasil disimpan.' });
  };

  // Follow-Up & Sales Pipeline
  const updateFollowUpStage = (id: string, stage: FollowUp['stage']) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, stage, updatedAt: new Date().toISOString() } : f));
    logAction('UPDATE_STAGE', 'FOLLOWUP', id, `Memindahkan deal ke tahap: ${stage}`);
    addToast({ type: 'success', title: 'Pipeline Diperbarui', message: `Status deal dipindahkan ke ${stage}.` });
  };

  const addFollowUp = (data: Omit<FollowUp, 'id' | 'updatedAt'>) => {
    const newFlw: FollowUp = {
      ...data,
      id: `flw_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setFollowUps(prev => [newFlw, ...prev]);
    logAction('CREATE_FOLLOWUP', 'FOLLOWUP', newFlw.id, `Membuat jadwal follow-up untuk ${newFlw.contactName}`);
    addToast({ type: 'success', title: 'Follow-Up Ditambahkan', message: `Jadwal follow-up berhasil dicatat.` });
  };

  const editFollowUp = (id: string, updates: Partial<FollowUp>) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
    addToast({ type: 'info', title: 'Follow-Up Diperbarui', message: 'Data follow-up berhasil diupdate.' });
  };

  // Suppression
  const addSuppressionItem = (item: Omit<SuppressionItem, 'id' | 'addedAt'>) => {
    const norm = normalizeWhatsAppNumber(item.phone);
    const phone = norm.isValid ? norm.normalized : item.phone;
    const newItem: SuppressionItem = {
      ...item,
      phone,
      id: `sup_${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    setSuppressionList(prev => [newItem, ...prev]);
    // Also mark contact as OPTED_OUT
    setContacts(prev => prev.map(c => c.phone === phone ? { ...c, optInStatus: 'OPTED_OUT' } : c));
    logAction('ADD_SUPPRESSION', 'SUPPRESSION', phone, `Menambahkan nomor ${phone} ke Suppression List (${item.reason})`);
    addToast({ type: 'warning', title: 'Nomor Ditekan (Suppressed)', message: `${phone} tidak akan menerima pesan blast berikutnya.` });
  };

  const removeSuppressionItem = (id: string) => {
    const item = suppressionList.find(s => s.id === id);
    setSuppressionList(prev => prev.filter(s => s.id !== id));
    if (item) {
      logAction('REMOVE_SUPPRESSION', 'SUPPRESSION', item.phone, `Menghapus nomor ${item.phone} dari Suppression List.`);
    }
    addToast({ type: 'info', title: 'Dihapus dari Suppression', message: 'Nomor telah dipulihkan dari daftar blokir.' });
  };

  const retryFailedMessages = (campaignId: string) => {
    resendFailedMessages(campaignId);
  };

  const sendMessageInConversation = async (convId: string, text: string) => {
    await replyConversation(convId, text);
  };

  const markConversationAsRead = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
  };

  const addToSuppressionList = (phone: string, reason: SuppressionItem['reason'] = 'MANUAL', notes: string = '') => {
    addSuppressionItem({ phone, reason, notes });
  };

  const removeFromSuppressionList = (phone: string) => {
    const item = suppressionList.find(s => s.phone === phone);
    if (item) {
      removeSuppressionItem(item.id);
    }
  };

  // Config & Test Message
  const updateWhatsAppConfig = async (updates: Partial<WhatsAppConfig>) => {
    const rawToken = updates.accessToken;
    const isNewTokenProvided = rawToken !== undefined && rawToken.trim() !== '' && !rawToken.includes('••••');
    const sanitizedToken = isNewTokenProvided
      ? rawToken.trim().replace(/^Bearer\s+/i, '').replace(/[\r\n\t\s]/g, '')
      : undefined;

    const sanitizedPhoneId = updates.phoneNumberId !== undefined
      ? updates.phoneNumberId.trim().replace(/[^\w-]/g, '')
      : (whatsAppConfig.phoneNumberId || '');
    const sanitizedWabaId = updates.businessAccountId !== undefined || updates.wabaId !== undefined
      ? (updates.businessAccountId || updates.wabaId || '').trim().replace(/[^\w-]/g, '')
      : (whatsAppConfig.businessAccountId || whatsAppConfig.wabaId || '');

    // Securely persist to backend server
    await WhatsAppService.saveServerConfig({
      phoneNumberId: sanitizedPhoneId,
      businessAccountId: sanitizedWabaId,
      accessToken: sanitizedToken,
      webhookVerifyToken: updates.webhookVerifyToken || whatsAppConfig.webhookVerifyToken,
      apiVersion: updates.apiVersion || whatsAppConfig.apiVersion,
      demoMode: updates.isDemoMode !== undefined ? updates.isDemoMode : whatsAppConfig.isDemoMode
    });

    setWhatsAppConfig(prev => {
      const hasTok = isNewTokenProvided ? true : (prev.hasToken || Boolean(prev.tokenMasked && !prev.tokenMasked.includes('Belum')));
      return {
        ...prev,
        ...updates,
        accessToken: undefined, // NEVER store raw token in client state!
        tokenMasked: hasTok ? '••••••••••••••••' : 'Belum dikonfigurasi',
        hasToken: hasTok,
        phoneNumberId: sanitizedPhoneId,
        businessAccountId: sanitizedWabaId,
        wabaId: sanitizedWabaId
      };
    });

    logAction('UPDATE_CONFIG', 'WHATSAPP_CONFIG', 'config', 'Memperbarui konfigurasi Meta WhatsApp Business API di server.');
    addToast({ type: 'success', title: 'Pengaturan Disimpan', message: 'Kredensial WhatsApp Cloud API aman tersimpan di backend server.' });
  };

  const toggleDemoMode = async () => {
    const res = await WhatsAppService.toggleDemoMode();
    const newDemo = res.demoMode;
    setWhatsAppConfig(prev => ({
      ...prev,
      isDemoMode: newDemo,
      connectionStatus: newDemo ? 'DEMO' : (prev.hasToken ? 'CONNECTED' : 'DISCONNECTED')
    }));

    addToast({
      type: 'info',
      title: 'Mode Beralih',
      message: newDemo 
        ? 'DEMO MODE AKTIF — NO REAL MESSAGE SENT (Simulasi pesan aman tanpa billing).' 
        : 'LIVE MODE AKTIF — Pengiriman resmi WhatsApp Cloud API diaktifkan.'
    });
  };

  const sendTestMessage = async (phone: string, templateId: string): Promise<{ success: boolean; message: string; errorCategory?: string }> => {
    const tpl = templates.find(t => t.id === templateId) || templates[0];
    const norm = normalizeWhatsAppNumber(phone);
    if (!norm.isValid) {
      return { success: false, message: `Nomor telepon tidak valid: ${norm.error}`, errorCategory: 'PHONE_NUMBER_ERROR' };
    }

    // Validation Requirements 7 & 10:
    // If not in demo mode, verify prerequisites before attempting send
    if (!whatsAppConfig.isDemoMode) {
      if (!whatsAppConfig.hasToken && (!whatsAppConfig.tokenMasked || whatsAppConfig.tokenMasked.includes('Belum'))) {
        return {
          success: false,
          errorCategory: 'AUTHENTICATION_ERROR',
          message: 'WHATSAPP_ACCESS_TOKEN belum dikonfigurasi. Masukkan Access Token di Pengaturan atau konfigurasi .env server.'
        };
      }
      if (!whatsAppConfig.businessAccountId && !whatsAppConfig.wabaId) {
        return {
          success: false,
          errorCategory: 'WABA_ERROR',
          message: 'WHATSAPP_BUSINESS_ACCOUNT_ID belum dikonfigurasi.'
        };
      }
      if (!whatsAppConfig.phoneNumberId) {
        return {
          success: false,
          errorCategory: 'PHONE_NUMBER_ERROR',
          message: 'WHATSAPP_PHONE_NUMBER_ID belum dikonfigurasi.'
        };
      }
      const tplStatus = tpl.approvalStatus || tpl.status;
      if (tplStatus && tplStatus !== 'APPROVED') {
        return {
          success: false,
          errorCategory: 'TEMPLATE_ERROR',
          message: 'Template WhatsApp tidak dapat digunakan. Periksa status approval, language code, dan parameter template.'
        };
      }
    }

    const dummyContact: Contact = {
      id: 'ct_test',
      name: 'Penguji Sistem WhatsApp',
      phone: norm.normalized,
      email: 'test@example.com',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      category: 'Prioritas',
      product: 'Cicil Emas',
      customerStatus: 'AKTIF',
      tags: ['TEST'],
      pic: currentUser.name,
      optInStatus: 'OPTED_IN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const waService = new WhatsAppService(whatsAppConfig);
    const res = await waService.sendTemplateMessage({
      contact: dummyContact,
      template: tpl
    });

    if (res.success) {
      logAction('SEND_TEST_MESSAGE', 'TEST', norm.normalized, `Kirim tes template ${tpl.name} ke ${norm.normalized}`);
      return { 
        success: true, 
        message: whatsAppConfig.isDemoMode 
          ? `[DEMO MODE — NO REAL MESSAGE SENT] Pesan simulasi berhasil dikirim ke ${norm.normalized}!`
          : `Pesan test resmi WhatsApp Cloud API berhasil dikirim ke ${norm.normalized}! WAMID: ${res.wamid}`
      };
    } else {
      return { 
        success: false, 
        message: res.error || 'Gagal mengirim pesan test.',
        errorCategory: res.errorCategory
      };
    }
  };

  // Auth & RBAC Actions
  const login = (usernameInput: string, passwordInput: string): { success: boolean; message: string } => {
    const trimmedUser = usernameInput.trim().toLowerCase();
    const matched = users.find(u => (u.username || '').toLowerCase() === trimmedUser);

    if (!matched) {
      return { success: false, message: 'Username tidak ditemukan di sistem.' };
    }

    if (matched.password && matched.password !== passwordInput) {
      return { success: false, message: 'Password salah. Silakan coba kembali.' };
    }

    setCurrentUser(matched);
    setIsAuthenticated(true);
    logAction('LOGIN', 'AUTH', matched.id, `Pengguna ${matched.name} (${matched.username}) berhasil masuk.`);
    addToast({
      type: 'success',
      title: 'Login Berhasil',
      message: `Selamat datang, ${matched.name}! Masuk sebagai ${matched.role}.`
    });
    return { success: true, message: 'Login berhasil.' };
  };

  const logout = () => {
    logAction('LOGOUT', 'AUTH', currentUser.id, `Pengguna ${currentUser.name} keluar dari sistem.`);
    setIsAuthenticated(false);
    addToast({
      type: 'info',
      title: 'Telah Keluar',
      message: 'Anda telah berhasil keluar dari sistem.'
    });
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): { success: boolean; message: string } => {
    const exists = users.some(u => (u.username || '').toLowerCase() === userData.username.trim().toLowerCase());
    if (exists) {
      return { success: false, message: `Username "${userData.username}" sudah digunakan!` };
    }

    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      username: userData.username.trim(),
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    logAction('CREATE_USER', 'USER', newUser.id, `Menambahkan pengguna baru: ${newUser.name} (${newUser.username}) [${newUser.role}]`);
    addToast({
      type: 'success',
      title: 'Pengguna Ditambahkan',
      message: `Akun "${newUser.username}" berhasil dibuat.`
    });
    return { success: true, message: 'Pengguna berhasil ditambahkan.' };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    logAction('UPDATE_USER', 'USER', id, `Memperbarui akun pengguna ID ${id}`);
    addToast({
      type: 'info',
      title: 'Pengguna Diperbarui',
      message: 'Perubahan akun berhasil disimpan.'
    });
  };

  const deleteUser = (id: string): { success: boolean; message: string } => {
    if (currentUser.id === id) {
      return { success: false, message: 'Tidak dapat menghapus akun yang sedang aktif digunakan!' };
    }
    const target = users.find(u => u.id === id);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };

    setUsers(prev => prev.filter(u => u.id !== id));
    logAction('DELETE_USER', 'USER', id, `Menghapus akun pengguna: ${target.name} (${target.username})`);
    addToast({
      type: 'warning',
      title: 'Pengguna Dihapus',
      message: `Akun "${target.username}" telah dihapus dari sistem web.`
    });
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  };

  // Additional Delete Functions for complete entity coverage
  const deleteFollowUp = (id: string) => {
    setFollowUps(prev => prev.filter(f => f.id !== id));
    logAction('DELETE_FOLLOWUP', 'FOLLOWUP', id, `Menghapus lead follow-up ID ${id}`);
    addToast({ type: 'warning', title: 'Lead Dihapus', message: 'Lead telah dihapus dari pipeline.' });
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    logAction('DELETE_CONVERSATION', 'INBOX', id, `Menghapus percakapan ID ${id}`);
    addToast({ type: 'warning', title: 'Percakapan Dihapus', message: 'Percakapan telah dihapus dari inbox.' });
  };

  const deleteMessageLog = (id: string) => {
    setMessageLogs(prev => prev.filter(m => m.id !== id));
    addToast({ type: 'warning', title: 'Log Dihapus', message: 'Log pesan telah dihapus.' });
  };

  const clearMessageLogs = () => {
    setMessageLogs([]);
    logAction('CLEAR_LOGS', 'LOG', 'all', 'Membersihkan seluruh log pengiriman pesan WhatsApp.');
    addToast({ type: 'warning', title: 'Log Dibersihkan', message: 'Seluruh log pesan berhasil dihapus.' });
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    addToast({ type: 'warning', title: 'Audit Trail Dibersihkan', message: 'Seluruh riwayat audit log telah dihapus.' });
  };

  const resetToSampleData = () => {
    setContacts(INITIAL_CONTACTS);
    setTags(INITIAL_TAGS);
    setSegments(INITIAL_SEGMENTS);
    setTemplates(INITIAL_TEMPLATES);
    setCampaigns(INITIAL_CAMPAIGNS);
    setMessageLogs(INITIAL_MESSAGE_LOGS);
    setConversations(INITIAL_CONVERSATIONS);
    setFollowUps(INITIAL_FOLLOWUPS);
    setSuppressionList(INITIAL_SUPPRESSION);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setWhatsAppConfig(INITIAL_WHATSAPP_CONFIG);
    addToast({ type: 'info', title: 'Data Direset', message: 'Semua data contoh operasional telah dipulihkan.' });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      isAuthenticated,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      activeView,
      setActiveView,
      selectedCampaignId,
      setSelectedCampaignId,
      globalSearch,
      setGlobalSearch,
      contacts,
      tags,
      segments,
      templates,
      campaigns,
      messageLogs,
      conversations,
      followUps,
      suppressionList,
      auditLogs,
      whatsAppConfig,
      addContact,
      editContact,
      deleteContact,
      bulkDeleteContacts,
      bulkTagContacts,
      bulkAssignPic,
      renamePicGlobal,
      clearContactsDatabase,
      importContacts,
      createSegment,
      editSegment,
      deleteSegment,
      duplicateSegment,
      filterContactsBySegment,
      createTag,
      deleteTag,
      createTemplate,
      editTemplate,
      duplicateTemplate,
      deleteTemplate,
      createCampaign,
      sendCampaign,
      pauseCampaign,
      resumeCampaign,
      cancelCampaign,
      deleteCampaign,
      duplicateCampaign,
      resendFailedMessages,
      retryFailedMessages,
      replyConversation,
      sendMessageInConversation,
      markConversationAsRead,
      updateConversationStatus,
      addConversationNote,
      deleteConversation,
      updateFollowUpStage,
      addFollowUp,
      editFollowUp,
      deleteFollowUp,
      deleteMessageLog,
      clearMessageLogs,
      clearAuditLogs,
      addSuppressionItem,
      removeSuppressionItem,
      addToSuppressionList,
      removeFromSuppressionList,
      updateWhatsAppConfig,
      toggleDemoMode,
      sendTestMessage,
      logAction,
      toasts,
      addToast,
      removeToast,
      resetToSampleData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
