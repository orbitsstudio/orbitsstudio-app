export type UserRole = 'FOUNDER' | 'BUSINESS_PARTNER' | 'SALES_REPRESENTATIVE';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  title: string;
  commissionRate: number; // e.g. 12%
  assignedLeadsCount?: number;
  activeProjectsCount?: number;
  totalDealsClosed?: number;
  totalCommissionEarned?: number;
}

export type BusinessCategory =
  | 'E-commerce & Retail'
  | 'Healthcare & Medical'
  | 'Real Estate & Property'
  | 'Corporate & Legal'
  | 'Hospitality & Dining'
  | 'SaaS & Technology'
  | 'Education & Coaching'
  | 'Architecture & Design'
  | 'Other';

export interface Client {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  businessCategory: BusinessCategory;
  websiteRequirements: string;
  budget: number;
  status: 'active' | 'in_negotiation' | 'completed' | 'archived';
  notes: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'negotiation' | 'converted' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';
export type WebsiteStatus = 'no_website' | 'outdated_website' | 'redesign_needed' | 'ecommerce_upgrade';

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessCategory: BusinessCategory;
  websiteStatus: WebsiteStatus;
  potentialRequirements: string;
  leadSource: 'Inbound' | 'Referral' | 'Outreach' | 'Google Search' | 'LinkedIn' | 'Instagram';
  assignedRepId: string;
  assignedRepName: string;
  priority: LeadPriority;
  status: LeadStatus;
  score: number; // 0 - 100
  followUpDate: string;
  notes: string;
  convertedClientId?: string;
  createdAt: string;
}

export type ProjectStatus = 'planning' | 'designing' | 'development' | 'review' | 'completed' | 'delivered';

export interface ProjectChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  phase: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  clientBusiness: string;
  packageSelected: 'Starter Web Presence' | 'Corporate Business Portal' | 'Custom E-Commerce Engine' | 'Full Web App & CMS';
  projectPrice: number;
  advancePayment: number;
  remainingBalance: number;
  assignedMemberIds: string[];
  assignedMembers: string[];
  deadline: string;
  status: ProjectStatus;
  requirements: string;
  progressChecklist: ProjectChecklistItem[];
  deliveryStatus: 'on_track' | 'at_risk' | 'delayed' | 'delivered';
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientBusiness: string;
  clientEmail: string;
  projectId?: string;
  projectName?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // % e.g. 5
  taxAmount: number;
  discountAmount: number;
  advancePaid: number;
  balanceDue: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  issueDate: string;
  dueDate: string;
  approvedByFounder: boolean;
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory =
  | 'client_advance'
  | 'client_final_payment'
  | 'hosting_infrastructure'
  | 'software_tools'
  | 'contractor_payout'
  | 'sales_commission'
  | 'marketing_ads'
  | 'office_equipment';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  relatedProjectId?: string;
  relatedProjectName?: string;
  relatedClientId?: string;
  relatedInvoiceId?: string;
  date: string;
  paymentMethod: string;
  recordedByName: string;
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  salesRepId: string;
  salesRepName: string;
  projectId: string;
  projectName: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending_clearance' | 'paid';
  payoutDate?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  meetingType: 'video_call' | 'in_person' | 'phone_consultation';
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending_approval';
  notes: string;
  assignedToName: string;
  createdAt: string;
}

export type ActionType =
  | 'send_email'
  | 'send_whatsapp'
  | 'confirm_appointment'
  | 'send_invoice'
  | 'confirm_quotation'
  | 'financial_commitment'
  | 'external_dispatch';

export interface ApprovalItem {
  id: string;
  actionType: ActionType;
  title: string;
  description: string;
  preparedContent: {
    recipient?: string;
    recipientName?: string;
    subject?: string;
    body?: string;
    amount?: number;
    meta?: Record<string, any>;
  };
  requestingMemberId: string;
  requestingMemberName: string;
  requestingMemberRole: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewerComments?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  module: 'CRM' | 'LEADS' | 'PROJECTS' | 'FINANCE' | 'INVOICES' | 'APPROVALS' | 'AI' | 'SYSTEM' | 'COMMS';
  details: string;
}

export interface BusinessSummary {
  totalClients: number;
  activeProjects: number;
  monthlyRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  pendingPayments: number;
  newLeads: number;
  pendingTasks: number;
  pendingApprovals: number;
}

export interface BusinessTask {
  id: string;
  title: string;
  assignedToName: string;
  assignedToId?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  relatedProject?: string;
  category?: 'development' | 'design' | 'client' | 'finance' | 'admin';
  createdAt: string;
}
