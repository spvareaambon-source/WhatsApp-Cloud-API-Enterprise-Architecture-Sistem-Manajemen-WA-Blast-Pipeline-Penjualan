import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/layout/ToastContainer';
import { LoginView } from './components/auth/LoginView';

// Page Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ContactsView } from './components/contacts/ContactsView';
import { ImportWizard } from './components/contacts/ImportWizard';
import { SegmentsView } from './components/segments/SegmentsView';
import { TagsView } from './components/tags/TagsView';
import { SuppressionView } from './components/suppression/SuppressionView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { CampaignWizard } from './components/campaigns/CampaignWizard';
import { TemplatesView } from './components/templates/TemplatesView';
import { MessageLogsView } from './components/logs/MessageLogsView';
import { InboxView } from './components/inbox/InboxView';
import { FollowUpView } from './components/pipeline/FollowUpView';
import { SalesPipelineView } from './components/pipeline/SalesPipelineView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppContent: React.FC = () => {
  const { activeView, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'contacts':
        return <ContactsView />;
      case 'import':
        return <ImportWizard />;
      case 'segments':
        return <SegmentsView />;
      case 'tags':
        return <TagsView />;
      case 'suppression':
        return <SuppressionView />;
      case 'campaigns':
        return <CampaignsView />;
      case 'campaign-wizard':
        return <CampaignWizard />;
      case 'templates':
        return <TemplatesView />;
      case 'logs':
        return <MessageLogsView />;
      case 'inbox':
        return <InboxView />;
      case 'followup':
        return <FollowUpView />;
      case 'pipeline':
        return <SalesPipelineView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
      case 'audit':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100/70 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
