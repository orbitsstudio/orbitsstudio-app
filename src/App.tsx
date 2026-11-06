/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { LeadsView } from './components/LeadsView';
import { ProjectsView } from './components/ProjectsView';
import { FinancesView } from './components/FinancesView';
import { InvoicesView } from './components/InvoicesView';
import { ApprovalsQueue } from './components/ApprovalsQueue';
import { AppointmentsCommsView } from './components/AppointmentsCommsView';
import { TeamView } from './components/TeamView';
import { TasksView } from './components/TasksView';
import { ReportsView } from './components/ReportsView';
import { QuickAddModal, QuickActionType } from './components/QuickAddModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { NexusAIAssistant } from './components/NexusAIAssistant';
import { OfflineIndicator } from './components/OfflineIndicator';

import { NexusDatabase } from './services/db';
import { SupabaseService, SupabaseConfig } from './services/supabase';
import {
  UserProfile,
  Client,
  Lead,
  Project,
  Invoice,
  Transaction,
  CommissionRecord,
  Appointment,
  ApprovalItem,
  ActivityLog,
  BusinessSummary,
  BusinessTask,
} from './types/nexus';

export default function App() {
  // Database States
  const [users, setUsers] = useState<UserProfile[]>(() => NexusDatabase.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => NexusDatabase.getCurrentUser());
  const [clients, setClients] = useState<Client[]>(() => NexusDatabase.getClients());
  const [leads, setLeads] = useState<Lead[]>(() => NexusDatabase.getLeads());
  const [projects, setProjects] = useState<Project[]>(() => NexusDatabase.getProjects());
  const [invoices, setInvoices] = useState<Invoice[]>(() => NexusDatabase.getInvoices());
  const [transactions, setTransactions] = useState<Transaction[]>(() => NexusDatabase.getTransactions());
  const [commissions, setCommissions] = useState<CommissionRecord[]>(() => NexusDatabase.getCommissions());
  const [appointments, setAppointments] = useState<Appointment[]>(() => NexusDatabase.getAppointments());
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => NexusDatabase.getApprovals());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => NexusDatabase.getActivityLogs());
  const [tasks, setTasks] = useState<BusinessTask[]>(() => NexusDatabase.getTasks());
  const [summary, setSummary] = useState<BusinessSummary>(() => NexusDatabase.getBusinessSummary());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => SupabaseService.getConfig());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddAction, setQuickAddAction] = useState<QuickActionType>('client');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Voice recognition state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Refresh data from NexusDatabase
  const refreshAllData = useCallback(() => {
    setUsers(NexusDatabase.getUsers());
    setCurrentUser(NexusDatabase.getCurrentUser());
    setClients(NexusDatabase.getClients());
    setLeads(NexusDatabase.getLeads());
    setProjects(NexusDatabase.getProjects());
    setInvoices(NexusDatabase.getInvoices());
    setTransactions(NexusDatabase.getTransactions());
    setCommissions(NexusDatabase.getCommissions());
    setAppointments(NexusDatabase.getAppointments());
    setApprovals(NexusDatabase.getApprovals());
    setActivityLogs(NexusDatabase.getActivityLogs());
    setTasks(NexusDatabase.getTasks());
    setSummary(NexusDatabase.getBusinessSummary());
    setSupabaseConfig(SupabaseService.getConfig());
  }, []);

  // Handle switching active user account / role
  const handleSwitchUser = (userId: string) => {
    const updated = NexusDatabase.setCurrentUser(userId);
    setCurrentUser(updated);
    refreshAllData();
  };

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsVoiceListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          console.log('[NEXUS Voice]', transcript);

          // Handle voice navigation or open AI assistant
          if (transcript.includes('lead')) {
            setActiveTab('leads');
          } else if (transcript.includes('client')) {
            setActiveTab('clients');
          } else if (transcript.includes('project')) {
            setActiveTab('projects');
          } else if (transcript.includes('finance') || transcript.includes('profit')) {
            setActiveTab('finances');
          } else if (transcript.includes('invoice') || transcript.includes('quote')) {
            setActiveTab('invoices');
          } else if (transcript.includes('approval')) {
            setActiveTab('approvals');
          } else {
            // General query - launch AI Assistant drawer
            setIsAIOpen(true);
          }
          setIsVoiceListening(false);
        };

        recognition.onerror = (e: any) => {
          console.warn('[NEXUS Voice Error]', e);
          setIsVoiceListening(false);
        };

        recognition.onend = () => {
          setIsVoiceListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert(
        'Speech Recognition is not supported by your current browser. Voice push-to-talk works best in Chrome on Android and Desktop.'
      );
      return;
    }

    if (isVoiceListening) {
      recognitionRef.current.stop();
      setIsVoiceListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsVoiceListening(true);
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  };

  // Client CRUD Handlers
  const handleSaveClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    NexusDatabase.saveClient(client);
    refreshAllData();
  };

  const handleArchiveClient = (clientId: string) => {
    NexusDatabase.archiveClient(clientId);
    refreshAllData();
  };

  // Lead CRUD & Conversion Handlers
  const handleSaveLead = (lead: Omit<Lead, 'id' | 'createdAt'> & { id?: string }) => {
    NexusDatabase.saveLead(lead);
    refreshAllData();
  };

  const handleConvertLead = (leadId: string, budget: number) => {
    NexusDatabase.convertLeadToClient(leadId, budget);
    refreshAllData();
    setActiveTab('projects');
  };

  // Project CRUD Handlers
  const handleSaveProject = (project: Omit<Project, 'id' | 'createdAt'> & { id?: string }) => {
    NexusDatabase.saveProject(project);
    refreshAllData();
  };

  const handleToggleChecklist = (projectId: string, itemId: string) => {
    NexusDatabase.toggleProjectChecklistItem(projectId, itemId);
    refreshAllData();
  };

  // Finance Handlers
  const handleAddTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    NexusDatabase.addTransaction(tx);
    refreshAllData();
  };

  const handleUpdateCommissionRate = (userId: string, rate: number) => {
    NexusDatabase.updateCommissionRate(userId, rate);
    refreshAllData();
  };

  const handlePayCommission = (commId: string) => {
    NexusDatabase.markCommissionPaid(commId);
    refreshAllData();
  };

  // Invoices Handlers
  const handleSaveInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'> & { id?: string }) => {
    NexusDatabase.saveInvoice(invoice);
    refreshAllData();
  };

  const handleMarkInvoicePaid = (invoiceId: string, paymentMethod?: string) => {
    NexusDatabase.markInvoicePaid(invoiceId, paymentMethod);
    refreshAllData();
  };

  const handleQueueInvoiceApproval = (invoice: Invoice) => {
    NexusDatabase.queueApproval({
      actionType: 'send_invoice',
      title: `Send Invoice ${invoice.invoiceNumber} to ${invoice.clientBusiness}`,
      description: `Formal invoice of ₹${invoice.subtotal.toLocaleString('en-IN')} prepared for client delivery. Requires Founder sign-off.`,
      preparedContent: {
        recipient: invoice.clientEmail,
        recipientName: invoice.clientName,
        subject: `Invoice ${invoice.invoiceNumber} — Orbits Studio`,
        amount: invoice.subtotal,
        body: `Dear ${invoice.clientName},\n\nPlease find attached invoice ${invoice.invoiceNumber} for your project milestone with Orbits Studio.\nTotal balance due: ₹${invoice.balanceDue.toLocaleString('en-IN')} by ${invoice.dueDate}.`,
      },
    });
    refreshAllData();
    showToast('Queued for Approval', `Invoice ${invoice.invoiceNumber} submitted for Founder review.`);
    setActiveTab('approvals');
  };

  // Task Handlers
  const handleSaveTask = (task: Omit<BusinessTask, 'id' | 'createdAt'> & { id?: string }) => {
    NexusDatabase.saveTask(task);
    refreshAllData();
    showToast('Task Saved', task.title);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = NexusDatabase.toggleTaskStatus(taskId);
    refreshAllData();
    if (updated) {
      showToast(updated.status === 'completed' ? 'Task Completed' : 'Task Reopened', updated.title);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    NexusDatabase.deleteTask(taskId);
    refreshAllData();
    showToast('Task Removed', undefined, 'info');
  };

  // Appointments & Communications Handlers
  const handleSaveAppointment = (apt: Omit<Appointment, 'id' | 'createdAt'> & { id?: string }) => {
    NexusDatabase.saveAppointment(apt);
    refreshAllData();
  };

  const handleQueueApproval = (
    item: Omit<ApprovalItem, 'id' | 'status' | 'createdAt' | 'requestingMemberId' | 'requestingMemberName' | 'requestingMemberRole'>
  ) => {
    NexusDatabase.queueApproval(item);
    refreshAllData();
  };

  const handleProcessApproval = (approvalId: string, decision: 'approved' | 'rejected', comments?: string) => {
    NexusDatabase.processApproval(approvalId, decision, comments);
    refreshAllData();
  };

  // Direct AI action queuing
  const handleDraftActionFromAI = (
    title: string,
    body: string,
    type: 'send_email' | 'send_whatsapp' | 'confirm_quotation'
  ) => {
    NexusDatabase.queueApproval({
      actionType: type,
      title,
      description: `Generated by NEXUS AI assistant for ${currentUser.name}. Requires Founder review.`,
      preparedContent: {
        body,
      },
    });
    refreshAllData();
    setActiveTab('approvals');
    setIsAIOpen(false);
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const newLeadsCount = leads.filter((l) => l.status === 'new' || l.status === 'contacted').length;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenApprovals={() => setActiveTab('approvals')}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenQuickAdd={() => {
          setQuickAddAction('client');
          setIsQuickAddOpen(true);
        }}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        supabaseConfig={supabaseConfig}
        isVoiceListening={isVoiceListening}
        onToggleVoice={toggleVoice}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar & Mobile Bar */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          userRole={currentUser.role}
          pendingApprovalsCount={pendingApprovalsCount}
          newLeadsCount={newLeadsCount}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              projects={projects}
              appointments={appointments}
              activityLogs={activityLogs}
              currentUser={currentUser}
              users={users}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAI={() => setIsAIOpen(true)}
              onNewLead={() => setActiveTab('leads')}
              onNewClient={() => setActiveTab('clients')}
              onNewInvoice={() => setActiveTab('invoices')}
              onNewProject={() => {
                setQuickAddAction('project');
                setIsQuickAddOpen(true);
              }}
              onNewTask={() => {
                setQuickAddAction('task');
                setIsQuickAddOpen(true);
              }}
              onOpenQuickAction={() => {
                setQuickAddAction('client');
                setIsQuickAddOpen(true);
              }}
              onScheduleAppointment={() => setActiveTab('comms')}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              leads={leads}
              users={users}
              currentUser={currentUser}
              onSaveLead={handleSaveLead}
              onConvertLead={handleConvertLead}
              onQueueProposalApproval={(lead) => {
                NexusDatabase.queueApproval({
                  actionType: 'confirm_quotation',
                  title: `Approve Proposal for ${lead.businessName}`,
                  description: `Proposal for ${lead.businessName} prepared by ${lead.assignedRepName}.`,
                  preparedContent: {
                    recipient: lead.email,
                    recipientName: lead.contactName,
                    subject: `Orbits Studio Website Specification — ${lead.businessName}`,
                    body: `Dear ${lead.contactName},\n\nFollowing up on our discussions, here is the proposal for ${lead.businessName}.`,
                  },
                });
                refreshAllData();
                setActiveTab('approvals');
              }}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              projects={projects}
              invoices={invoices}
              onSaveClient={handleSaveClient}
              onArchiveClient={handleArchiveClient}
              onOpenNewInvoiceForClient={(clientId) => {
                setActiveTab('invoices');
              }}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              clients={clients}
              users={users}
              onSaveProject={handleSaveProject}
              onToggleChecklistItem={handleToggleChecklist}
            />
          )}

          {activeTab === 'finances' && (
            <FinancesView
              transactions={transactions}
              commissions={commissions}
              projects={projects}
              users={users}
              summary={summary}
              currentUser={currentUser}
              onAddTransaction={handleAddTransaction}
              onUpdateCommissionRate={handleUpdateCommissionRate}
              onPayCommission={handlePayCommission}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              clients={clients}
              projects={projects}
              currentUser={currentUser}
              onSaveInvoice={handleSaveInvoice}
              onMarkInvoicePaid={handleMarkInvoicePaid}
              onQueueForApproval={handleQueueInvoiceApproval}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              users={users}
              projects={projects}
              currentUser={currentUser}
              onSaveTask={handleSaveTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              summary={summary}
              projects={projects}
              transactions={transactions}
              users={users}
              clients={clients}
              leads={leads}
              invoices={invoices}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsQueue
              approvals={approvals}
              currentUser={currentUser}
              onProcessApproval={handleProcessApproval}
            />
          )}

          {activeTab === 'comms' && (
            <AppointmentsCommsView
              appointments={appointments}
              clients={clients}
              currentUser={currentUser}
              onSaveAppointment={handleSaveAppointment}
              onQueueApproval={handleQueueApproval}
            />
          )}

          {activeTab === 'team' && (
            <TeamView
              users={users}
              projects={projects}
              leads={leads}
              commissions={commissions}
              currentUser={currentUser}
              onUpdateCommissionRate={handleUpdateCommissionRate}
            />
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                    Database, Supabase & Deployment Center
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Manage PostgreSQL schema migrations, Hostinger configuration, and cloud persistence.
                  </p>
                </div>
                <button
                  onClick={() => setIsDatabaseModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Open Supabase Config
                </button>
              </div>

              {/* Directly embed database management options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="nexus-card rounded-2xl p-6 border border-slate-800">
                  <h3 className="font-bold text-white text-base mb-2">Supabase Cloud Sync Status</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {supabaseConfig.isConnected
                      ? `Connected to Supabase endpoint: ${supabaseConfig.supabaseUrl}`
                      : 'Running in Local Storage Active Database mode with complete RLS structure and JSON export capabilities.'}
                  </p>
                  <button
                    onClick={() => setIsDatabaseModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white text-xs font-mono font-semibold"
                  >
                    Configure Supabase API Keys →
                  </button>
                </div>

                <div className="nexus-card rounded-2xl p-6 border border-slate-800">
                  <h3 className="font-bold text-white text-base mb-2">Hostinger Subdomain Deployment</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Ready for static and Node.js deployment to <code>nexus.orbitsstudio.com</code> without overwriting Orbit Studio's main marketing site.
                  </p>
                  <button
                    onClick={() => setIsDatabaseModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white text-xs font-mono font-semibold"
                  >
                    View Hostinger Guide & .htaccess →
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* NEXUS AI Assistant Drawer */}
      <NexusAIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        currentUser={currentUser}
        summary={summary}
        projects={projects}
        leads={leads}
        invoices={invoices}
        isVoiceListening={isVoiceListening}
        onToggleVoice={toggleVoice}
        onDraftActionForApproval={handleDraftActionFromAI}
      />

      {/* Supabase & Database Settings Modal */}
      <DatabaseSettingsModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        supabaseConfig={supabaseConfig}
        onConfigUpdated={(cfg) => {
          setSupabaseConfig(cfg);
          refreshAllData();
        }}
        onDataReset={() => {
          NexusDatabase.resetToDefaults();
          refreshAllData();
        }}
      />

      {/* Universal Quick Action Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        initialAction={quickAddAction}
        onClose={() => setIsQuickAddOpen(false)}
        clients={clients}
        projects={projects}
        users={users}
        currentUser={currentUser}
        onSuccess={(title, desc) => {
          refreshAllData();
          showToast(title, desc);
        }}
        onNavigateToTab={(tab) => {
          setActiveTab(tab as ActiveTab);
        }}
      />

      {/* Interactive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Offline PWA Status Banner */}
      <OfflineIndicator />
    </div>
  );
}
