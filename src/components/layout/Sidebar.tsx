import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  Filter, 
  Tag as TagIcon, 
  Send, 
  FileText, 
  Activity, 
  MessageSquare, 
  Calendar, 
  Kanban, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  History, 
  PlusCircle,
  Radio,
  CheckCircle2,
  ChevronRight,
  Zap
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  badgeColor?: string;
  isAction?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    contacts, 
    campaigns, 
    conversations, 
    whatsAppConfig,
    currentUser
  } = useApp();

  const runningCampaignsCount = campaigns.filter(c => c.status === 'RUNNING').length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navGroups: NavGroup[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'DATABASE & AUDIENS',
      items: [
        { id: 'contacts', label: 'Database Kontak', icon: Users, badge: contacts.length },
        { id: 'import', label: 'Import Excel (.xlsx)', icon: UploadCloud },
        { id: 'segments', label: 'Segmentasi Dinamis', icon: Filter },
        { id: 'tags', label: 'Tag Management', icon: TagIcon },
        { id: 'suppression', label: 'Suppression List', icon: ShieldAlert }
      ]
    },
    {
      title: 'CAMPAIGN & ENGINE',
      items: [
        { id: 'campaigns', label: 'Campaigns', icon: Send, badge: runningCampaignsCount ? `${runningCampaignsCount} Active` : undefined, badgeColor: 'bg-emerald-500' },
        { id: 'campaign-wizard', label: 'Buat Campaign Baru', icon: PlusCircle, isAction: true },
        { id: 'templates', label: 'Message Templates', icon: FileText },
        { id: 'logs', label: 'Delivery Tracking', icon: Activity }
      ]
    },
    {
      title: 'SALES & ENGAGEMENT',
      items: [
        { id: 'inbox', label: 'WhatsApp Inbox', icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined, badgeColor: 'bg-emerald-500 animate-pulse' },
        { id: 'followup', label: 'Sales Follow-Up', icon: Calendar },
        { id: 'pipeline', label: 'Lead Pipeline', icon: Kanban }
      ]
    },
    {
      title: 'ANALYTICS & SYSTEM',
      items: [
        { id: 'analytics', label: 'Laporan & Analitik', icon: BarChart3 },
        { id: 'settings', label: 'Pengaturan & Webhook', icon: Settings },
        { id: 'audit', label: 'Audit Log Aktivitas', icon: History }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
            WA BLAST
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              PRO
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            Official Business Cloud API
          </p>
        </div>
      </div>

      {/* Cloud API Connection Status Indicator */}
      <div className="px-4 py-2.5 mx-3 mt-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${whatsAppConfig.isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`} />
          <span className="text-[11px] font-semibold text-slate-300">
            {whatsAppConfig.isDemoMode ? 'Mode Simulator Aktif' : 'WhatsApp API Online'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {whatsAppConfig.apiVersion}
        </span>
      </div>

      {/* Navigation Scrollable Area */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-5 text-xs">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {group.title}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer group ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : item.isAction
                            ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/50 font-semibold'
                            : 'hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : item.isAction ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeColor || (isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / Current Session User */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-full ring-1 ring-emerald-500 object-cover" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">{currentUser.role} ACCESS</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
