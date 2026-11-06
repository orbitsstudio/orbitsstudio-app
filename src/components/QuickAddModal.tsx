import React, { useState } from 'react';
import {
  X,
  Users,
  FolderKanban,
  FileText,
  CreditCard,
  Receipt,
  Target,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Client, Project, UserProfile, BusinessCategory } from '../types/nexus';
import { formatINR } from '../utils/format';
import { NexusDatabase } from '../services/db';

export type QuickActionType =
  | 'client'
  | 'project'
  | 'invoice'
  | 'payment'
  | 'expense'
  | 'lead'
  | 'task';

interface QuickAddModalProps {
  isOpen: boolean;
  initialAction?: QuickActionType;
  onClose: () => void;
  clients: Client[];
  projects: Project[];
  users: UserProfile[];
  currentUser: UserProfile;
  onSuccess: (title: string, description?: string) => void;
  onNavigateToTab: (tab: string) => void;
}

const CATEGORIES: BusinessCategory[] = [
  'E-commerce & Retail',
  'Healthcare & Medical',
  'Real Estate & Property',
  'Corporate & Legal',
  'Hospitality & Dining',
  'SaaS & Technology',
  'Education & Coaching',
  'Architecture & Design',
  'Other',
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  initialAction = 'client',
  onClose,
  clients,
  projects,
  users,
  currentUser,
  onSuccess,
  onNavigateToTab,
}) => {
  const [selectedAction, setSelectedAction] = useState<QuickActionType>(initialAction);

  // Form states for each action
  // 1. Client
  const [clientData, setClientData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    businessCategory: 'Corporate & Legal' as BusinessCategory,
    budget: 85000,
    websiteRequirements: '',
    notes: '',
  });

  // 2. Project
  const [projectData, setProjectData] = useState({
    name: '',
    clientId: clients[0]?.id || '',
    packageSelected: 'Corporate Business Portal' as Project['packageSelected'],
    projectPrice: 85000,
    advancePayment: 42500,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requirements: '',
  });

  // 3. Invoice
  const [invoiceData, setInvoiceData] = useState({
    clientId: clients[0]?.id || '',
    projectId: projects[0]?.id || '',
    description: 'Corporate Website Platform Development — Milestone Advance',
    amount: 42500,
    advancePaid: 0,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // 4. Payment
  const [paymentData, setPaymentData] = useState({
    clientId: clients[0]?.id || '',
    amount: 42500,
    paymentMethod: 'UPI (GPay / PhonePe)',
    description: 'Client milestone advance payment received',
    date: new Date().toISOString().split('T')[0],
  });

  // 5. Expense
  const [expenseData, setExpenseData] = useState({
    category: 'hosting_infrastructure' as any,
    amount: 2500,
    description: 'Hostinger Cloud Hosting & SSL Renewal',
    paymentMethod: 'Corporate UPI / Net Banking',
    date: new Date().toISOString().split('T')[0],
  });

  // 6. Lead
  const [leadData, setLeadData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessCategory: 'Corporate & Legal' as BusinessCategory,
    potentialRequirements: '',
    priority: 'high' as const,
  });

  // 7. Task
  const [taskData, setTaskData] = useState({
    title: '',
    assignedToName: currentUser.name,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high' as const,
    relatedProject: projects[0]?.name || 'General Business',
    category: 'development' as const,
  });

  if (!isOpen) return null;

  const actions = [
    { id: 'client', label: 'Add Client', icon: Users, color: 'text-cyan-400' },
    { id: 'project', label: 'Create Project', icon: FolderKanban, color: 'text-blue-400' },
    { id: 'invoice', label: 'Create Invoice', icon: FileText, color: 'text-purple-400' },
    { id: 'payment', label: 'Record Payment', icon: CreditCard, color: 'text-emerald-400' },
    { id: 'expense', label: 'Add Expense', icon: Receipt, color: 'text-rose-400' },
    { id: 'lead', label: 'Add Lead', icon: Target, color: 'text-amber-400' },
    { id: 'task', label: 'Create Task', icon: CheckSquare, color: 'text-teal-400' },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAction === 'client') {
      NexusDatabase.saveClient({
        name: clientData.name,
        businessName: clientData.businessName,
        email: clientData.email,
        phone: clientData.phone,
        businessCategory: clientData.businessCategory,
        websiteRequirements: clientData.websiteRequirements,
        budget: clientData.budget,
        status: 'active',
        notes: clientData.notes,
      });
      onSuccess('Client Saved', `${clientData.businessName} has been added to your CRM.`);
      onClose();
    } else if (selectedAction === 'project') {
      const client = clients.find((c) => c.id === projectData.clientId) || clients[0];
      NexusDatabase.saveProject({
        name: projectData.name,
        clientId: client.id,
        clientName: client.name,
        clientBusiness: client.businessName,
        packageSelected: projectData.packageSelected,
        projectPrice: projectData.projectPrice,
        advancePayment: projectData.advancePayment,
        remainingBalance: Math.max(0, projectData.projectPrice - projectData.advancePayment),
        assignedMemberIds: [currentUser.id],
        assignedMembers: [currentUser.name],
        deadline: projectData.deadline,
        status: 'planning',
        requirements: projectData.requirements,
        progressChecklist: [
          { id: 'm1', title: 'Scope & Architecture Approval', completed: true, phase: 'Planning' },
          { id: 'm2', title: 'High-Fidelity Wireframes & Figma UI', completed: false, phase: 'Designing' },
          { id: 'm3', title: 'Full Responsive Development & API Connectors', completed: false, phase: 'Development' },
          { id: 'm4', title: 'Client Feedback & Revisions Round', completed: false, phase: 'Review' },
          { id: 'm5', title: 'Production DNS, SSL & Delivery Signoff', completed: false, phase: 'Delivered' },
        ],
        deliveryStatus: 'on_track',
      });
      onSuccess('Project Created', `${projectData.name} has been launched.`);
      onClose();
    } else if (selectedAction === 'invoice') {
      const client = clients.find((c) => c.id === invoiceData.clientId) || clients[0];
      const project = projects.find((p) => p.id === invoiceData.projectId);
      const invoiceNumber = `INV-2026-0${Date.now().toString().slice(-3)}`;
      NexusDatabase.saveInvoice({
        invoiceNumber,
        clientId: client.id,
        clientName: client.name,
        clientBusiness: client.businessName,
        clientEmail: client.email,
        projectId: project?.id,
        projectName: project?.name,
        items: [
          {
            id: `i-${Date.now()}`,
            description: invoiceData.description,
            quantity: 1,
            unitPrice: invoiceData.amount,
            total: invoiceData.amount,
          },
        ],
        subtotal: invoiceData.amount,
        taxRate: 0,
        taxAmount: 0,
        discountAmount: 0,
        advancePaid: invoiceData.advancePaid,
        balanceDue: Math.max(0, invoiceData.amount - invoiceData.advancePaid),
        status: invoiceData.advancePaid >= invoiceData.amount ? 'paid' : 'pending',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate,
        approvedByFounder: currentUser.role === 'FOUNDER',
        notes: 'Payment terms: Net 14 days. Settle via UPI (orbitsstudio@okhdfcbank) or NEFT to Orbits Studio.',
      });
      onSuccess('Invoice Generated', `${invoiceNumber} generated for ${client.businessName}.`);
      onClose();
    } else if (selectedAction === 'payment') {
      const client = clients.find((c) => c.id === paymentData.clientId);
      NexusDatabase.addTransaction({
        type: 'income',
        category: 'client_advance',
        amount: paymentData.amount,
        description: `${paymentData.description} — ${client?.businessName || 'Client'}`,
        paymentMethod: paymentData.paymentMethod,
        date: paymentData.date,
        recordedByName: currentUser.name,
      });
      onSuccess('Payment Recorded', `${formatINR(paymentData.amount)} recorded into business ledger.`);
      onClose();
    } else if (selectedAction === 'expense') {
      NexusDatabase.addTransaction({
        type: 'expense',
        category: expenseData.category,
        amount: expenseData.amount,
        description: expenseData.description,
        paymentMethod: expenseData.paymentMethod,
        date: expenseData.date,
        recordedByName: currentUser.name,
      });
      onSuccess('Expense Logged', `${formatINR(expenseData.amount)} logged under ${expenseData.category}.`);
      onClose();
    } else if (selectedAction === 'lead') {
      NexusDatabase.saveLead({
        businessName: leadData.businessName,
        contactName: leadData.contactName,
        email: leadData.email,
        phone: leadData.phone,
        businessCategory: leadData.businessCategory,
        websiteStatus: 'outdated_website',
        potentialRequirements: leadData.potentialRequirements,
        leadSource: 'Outreach',
        assignedRepId: currentUser.id,
        assignedRepName: currentUser.name,
        priority: leadData.priority,
        status: 'new',
        score: 75,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Added via Quick Action.',
      });
      onSuccess('Prospect Added', `${leadData.businessName} added to sales pipeline.`);
      onClose();
    } else if (selectedAction === 'task') {
      NexusDatabase.saveTask({
        title: taskData.title,
        assignedToName: taskData.assignedToName,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: 'todo',
        relatedProject: taskData.relatedProject,
        category: taskData.category,
      });
      onSuccess('Task Created', `Task assigned to ${taskData.assignedToName}.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">Quick Action Center</h2>
              <p className="text-[11px] text-slate-400">Add anything instantly from any screen</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Picker Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-800/80 no-scrollbar">
          {actions.map((act) => {
            const Icon = act.icon;
            const isSelected = selectedAction === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedAction(act.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${act.color}`} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Action Forms */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* TAB 1: ADD CLIENT */}
          {selectedAction === 'client' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Business / Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health Clinic"
                    value={clientData.businessName}
                    onChange={(e) => setClientData({ ...clientData, businessName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aryan Mehta"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@apexhealth.in"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={clientData.phone}
                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-mono">Project Budget (₹ INR) *</label>
                  <span className="text-cyan-400 font-mono font-bold">{formatINR(clientData.budget)}</span>
                </div>
                <input
                  type="number"
                  required
                  value={clientData.budget}
                  onChange={(e) => setClientData({ ...clientData, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[35000, 75000, 150000, 250000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setClientData({ ...clientData, budget: val })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono cursor-pointer"
                    >
                      {formatINR(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Website Requirements</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Modern responsive medical portal with appointment booking..."
                  value={clientData.websiteRequirements}
                  onChange={(e) => setClientData({ ...clientData, websiteRequirements: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CREATE PROJECT */}
          {selectedAction === 'project' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Aesthetics Web Overhaul"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Select Client *</label>
                  <select
                    value={projectData.clientId}
                    onChange={(e) => setProjectData({ ...projectData, clientId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Package Selected</label>
                  <select
                    value={projectData.packageSelected}
                    onChange={(e) => setProjectData({ ...projectData, packageSelected: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Starter Web Presence">Starter Web Presence</option>
                    <option value="Corporate Business Portal">Corporate Business Portal</option>
                    <option value="Custom E-Commerce Engine">Custom E-Commerce Engine</option>
                    <option value="Full Web App & CMS">Full Web App & CMS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Total Price (₹ INR) *</label>
                    <span className="text-cyan-400 font-mono font-bold">{formatINR(projectData.projectPrice)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={projectData.projectPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setProjectData({
                        ...projectData,
                        projectPrice: val,
                        advancePayment: Math.round(val * 0.5),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Target Deadline</label>
                  <input
                    type="date"
                    value={projectData.deadline}
                    onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CREATE INVOICE */}
          {selectedAction === 'invoice' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Client Account *</label>
                  <select
                    value={invoiceData.clientId}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Payment Due Date</label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Invoice Line Description *</label>
                <input
                  type="text"
                  required
                  value={invoiceData.description}
                  onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Total Invoice Amount (₹) *</label>
                    <span className="text-cyan-400 font-mono font-bold">{formatINR(invoiceData.amount)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={invoiceData.amount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Advance Already Paid (₹)</label>
                    <span className="text-emerald-400 font-mono font-bold">{formatINR(invoiceData.advancePaid)}</span>
                  </div>
                  <input
                    type="number"
                    value={invoiceData.advancePaid}
                    onChange={(e) => setInvoiceData({ ...invoiceData, advancePaid: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECORD PAYMENT */}
          {selectedAction === 'payment' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">From Client Account</label>
                  <select
                    value={paymentData.clientId}
                    onChange={(e) => setPaymentData({ ...paymentData, clientId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Received Amount (₹ INR) *</label>
                    <span className="text-emerald-400 font-mono font-bold">{formatINR(paymentData.amount)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Payment Mode</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="UPI (GPay / PhonePe / Paytm)">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="NEFT / RTGS Bank Transfer">NEFT / RTGS Bank Transfer</option>
                    <option value="IMPS Direct Settlement">IMPS Direct Settlement</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Cheque / Cash">Cheque / Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Received Date</label>
                  <input
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Transaction Memo / Description</label>
                <input
                  type="text"
                  required
                  value={paymentData.description}
                  onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                  placeholder="e.g. 50% website advance milestone received"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 5: ADD EXPENSE */}
          {selectedAction === 'expense' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Expense Category</label>
                  <select
                    value={expenseData.category}
                    onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="hosting_infrastructure">Hosting & Servers (Hostinger, Cloud)</option>
                    <option value="software_tools">Software & SaaS (Figma, GitHub, Supabase)</option>
                    <option value="contractor_payout">Freelancer / Designer Payout</option>
                    <option value="marketing_ads">Marketing & Outreach</option>
                    <option value="office_equipment">Hardware & Office Tools</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Amount (₹ INR) *</label>
                    <span className="text-rose-400 font-mono font-bold">{formatINR(expenseData.amount)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData({ ...expenseData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canva Pro monthly team subscription"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Payment Method</label>
                  <input
                    type="text"
                    value={expenseData.paymentMethod}
                    onChange={(e) => setExpenseData({ ...expenseData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Date</label>
                  <input
                    type="date"
                    value={expenseData.date}
                    onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ADD LEAD */}
          {selectedAction === 'lead' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Dental Studio"
                    value={leadData.businessName}
                    onChange={(e) => setLeadData({ ...leadData, businessName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rohan Kapoor"
                    value={leadData.contactName}
                    onChange={(e) => setLeadData({ ...leadData, contactName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Email</label>
                  <input
                    type="email"
                    placeholder="dr.rohan@zenithdental.com"
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98110 54321"
                    value={leadData.phone}
                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Opportunity Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs complete mobile website redesign & appointment booking..."
                  value={leadData.potentialRequirements}
                  onChange={(e) => setLeadData({ ...leadData, potentialRequirements: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 7: CREATE TASK */}
          {selectedAction === 'task' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Review client mobile responsiveness on iPhone & Android"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Assign Team Member</label>
                  <select
                    value={taskData.assignedToName}
                    onChange={(e) => setTaskData({ ...taskData, assignedToName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Due Date</label>
                  <input
                    type="date"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Priority Level</label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Related Project</label>
                  <select
                    value={taskData.relatedProject}
                    onChange={(e) => setTaskData({ ...taskData, relatedProject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="General Business">General Business / Internal</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                const tabMap: Record<QuickActionType, string> = {
                  client: 'clients',
                  project: 'projects',
                  invoice: 'invoices',
                  payment: 'finances',
                  expense: 'finances',
                  lead: 'leads',
                  task: 'tasks',
                };
                onNavigateToTab(tabMap[selectedAction]);
              }}
              className="text-slate-400 hover:text-cyan-400 text-xs font-mono transition"
            >
              Open Full {selectedAction.toUpperCase()} View →
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-lg cursor-pointer"
              >
                Save {actions.find((a) => a.id === selectedAction)?.label.replace('Add ', '').replace('Create ', '').replace('Record ', '')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
