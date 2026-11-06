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
  UserRole,
  BusinessTask,
} from '../types/nexus';
import { formatINR } from '../utils/format';
import { safeStorage } from '../utils/storage';

const STORAGE_KEYS = {
  USERS: 'nexus_inr_users_v2',
  CURRENT_USER_ID: 'nexus_inr_current_user_id_v2',
  CLIENTS: 'nexus_inr_clients_v2',
  LEADS: 'nexus_inr_leads_v2',
  PROJECTS: 'nexus_inr_projects_v2',
  INVOICES: 'nexus_inr_invoices_v2',
  TRANSACTIONS: 'nexus_inr_transactions_v2',
  COMMISSIONS: 'nexus_inr_commissions_v2',
  APPOINTMENTS: 'nexus_inr_appointments_v2',
  APPROVALS: 'nexus_inr_approvals_v2',
  ACTIVITY_LOGS: 'nexus_inr_activity_logs_v2',
  TASKS: 'nexus_inr_tasks_v2',
  SETTINGS: 'nexus_inr_settings_v2',
};

// Default Team Profiles (with realistic INR commissions)
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-founder',
    name: 'Alex Vance',
    email: 'orbitstudio982@gmail.com',
    role: 'FOUNDER',
    title: 'Founder & Managing Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 92831',
    commissionRate: 15,
    assignedLeadsCount: 4,
    activeProjectsCount: 5,
    totalDealsClosed: 14,
    totalCommissionEarned: 185000, // ₹1,85,000
  },
  {
    id: 'user-partner',
    name: 'Elena Rostova',
    email: 'elena@orbitsstudio.com',
    role: 'BUSINESS_PARTNER',
    title: 'Operations & Technical Partner',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 94820',
    commissionRate: 12,
    assignedLeadsCount: 3,
    activeProjectsCount: 4,
    totalDealsClosed: 9,
    totalCommissionEarned: 112000, // ₹1,12,000
  },
  {
    id: 'user-sales',
    name: 'Marcus Chen',
    email: 'marcus@orbitsstudio.com',
    role: 'SALES_REPRESENTATIVE',
    title: 'Senior Business Development Rep',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98201 97341',
    commissionRate: 10,
    assignedLeadsCount: 8,
    activeProjectsCount: 1,
    totalDealsClosed: 6,
    totalCommissionEarned: 58000, // ₹58,000
  },
];

// Initial Realistic Seed Clients (amounts in INR - ₹)
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Sarah Jenkins',
    businessName: 'Lumina Aesthetic Clinic',
    email: 'sarah@luminaaesthetic.com',
    phone: '+91 98234 89012',
    businessCategory: 'Healthcare & Medical',
    websiteRequirements: 'High-converting medical clinic portal with online doctor appointments, treatments catalogue & WhatsApp chat widget.',
    budget: 85000, // ₹85,000
    status: 'active',
    notes: 'Approved the initial Figma wireframe. Advance 50% received via UPI / IMPS.',
    followUpDate: '2026-11-12',
    createdAt: '2026-10-04T10:00:00Z',
    updatedAt: '2026-11-01T14:30:00Z',
  },
  {
    id: 'client-2',
    name: 'David Thorne',
    businessName: 'Vanguard Logistics Group',
    email: 'dthorne@vanguardlog.com',
    phone: '+91 98345 67123',
    businessCategory: 'Corporate & Legal',
    websiteRequirements: 'Enterprise supply chain tracking website with fleet calculator and customer shipment API tracking.',
    budget: 140000, // ₹1,40,000
    status: 'active',
    notes: 'Advance invoice paid. Elena coordinating backend database setup.',
    followUpDate: '2026-11-15',
    createdAt: '2026-09-22T08:15:00Z',
    updatedAt: '2026-11-03T11:20:00Z',
  },
  {
    id: 'client-3',
    name: 'Mia Sterling',
    businessName: 'Aura Fine Dining & Lounge',
    email: 'mia@auradining.co',
    phone: '+91 98456 78901',
    businessCategory: 'Hospitality & Dining',
    websiteRequirements: 'Luxury restaurant website with interactive food & cocktail menu, table reservation widget and banquet booking builder.',
    budget: 62000, // ₹62,000
    status: 'active',
    notes: 'Photoshoot assets delivered. Review stage currently in progress.',
    followUpDate: '2026-11-08',
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-11-04T16:00:00Z',
  },
  {
    id: 'client-4',
    name: 'Kenji Sato',
    businessName: 'Kuro Artisan Watches',
    email: 'k.sato@kurohorology.com',
    phone: '+91 98567 89012',
    businessCategory: 'E-commerce & Retail',
    websiteRequirements: 'Custom Shopify Plus storefront, product 3D view, Razorpay & UPI gateway, and limited edition drops.',
    budget: 185000, // ₹1,85,000
    status: 'in_negotiation',
    notes: 'Contract proposal submitted. Final deposit payment pending founder confirmation.',
    followUpDate: '2026-11-06',
    createdAt: '2026-10-28T12:00:00Z',
    updatedAt: '2026-11-04T09:40:00Z',
  },
  {
    id: 'client-5',
    name: 'Rachel Adams',
    businessName: 'Apex Capital Partners',
    email: 'radams@apexcap.org',
    phone: '+91 98678 90123',
    businessCategory: 'Corporate & Legal',
    websiteRequirements: 'Institutional finance portal with corporate governance showcase and investor relations newsroom.',
    budget: 110000, // ₹1,10,000
    status: 'completed',
    notes: 'Delivered last month. Monthly maintenance agreement active.',
    followUpDate: '2026-12-01',
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-10-14T10:00:00Z',
  },
];

// Initial Realistic Seed Leads
const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    businessName: 'AeroZen Aviation Services',
    contactName: 'Captain Arthur Vance',
    email: 'arthur@aerozenjets.com',
    phone: '+91 98789 01234',
    businessCategory: 'Corporate & Legal',
    websiteStatus: 'outdated_website',
    potentialRequirements: 'Private charter booking portal with fleet gallery and real-time charter quote calculator.',
    leadSource: 'Referral',
    assignedRepId: 'user-sales',
    assignedRepName: 'Marcus Chen',
    priority: 'high',
    status: 'negotiation',
    score: 88,
    followUpDate: '2026-11-07',
    notes: 'Spoke yesterday on Zoom. Highly enthusiastic. Waiting for proposal quotation approval (₹1,65,000) from Alex.',
    createdAt: '2026-10-25T14:00:00Z',
  },
  {
    id: 'lead-2',
    businessName: 'Botanica Organics',
    contactName: 'Chloe Dupond',
    email: 'chloe@botanicaorganic.store',
    phone: '+91 98890 12345',
    businessCategory: 'E-commerce & Retail',
    websiteStatus: 'ecommerce_upgrade',
    potentialRequirements: 'Migrate from slow WooCommerce to Headless Shopify architecture with UPI & COD checkout.',
    leadSource: 'Instagram',
    assignedRepId: 'user-sales',
    assignedRepName: 'Marcus Chen',
    priority: 'high',
    status: 'interested',
    score: 82,
    followUpDate: '2026-11-09',
    notes: 'Doing ₹3,50,000/month currently on basic shop. Ready to invest ₹90,000 in professional upgrade.',
    createdAt: '2026-10-30T16:20:00Z',
  },
  {
    id: 'lead-3',
    businessName: 'Horizon Dental Specialists',
    contactName: 'Dr. Raymond Holt',
    email: 'dr.holt@horizondental.clinic',
    phone: '+91 98901 23456',
    businessCategory: 'Healthcare & Medical',
    websiteStatus: 'no_website',
    potentialRequirements: 'Brand new multi-location clinic website with online booking and patient WhatsApp enquiry.',
    leadSource: 'Google Search',
    assignedRepId: 'user-founder',
    assignedRepName: 'Alex Vance',
    priority: 'medium',
    status: 'contacted',
    score: 65,
    followUpDate: '2026-11-10',
    notes: 'Opening second clinic branch next month. Needs launch by mid-December. Budget ₹65,000.',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'lead-4',
    businessName: 'Solstice Urban Architecture',
    contactName: 'Marcus Bennett',
    email: 'm.bennett@solsticearch.studio',
    phone: '+91 98012 34567',
    businessCategory: 'Architecture & Design',
    websiteStatus: 'redesign_needed',
    potentialRequirements: 'Minimalist editorial portfolio site featuring full-screen project case studies. Budget ₹60,000.',
    leadSource: 'LinkedIn',
    assignedRepId: 'user-partner',
    assignedRepName: 'Elena Rostova',
    priority: 'medium',
    status: 'new',
    score: 60,
    followUpDate: '2026-11-08',
    notes: 'Inquired on LinkedIn about custom portfolio. Sent initial questionnaire.',
    createdAt: '2026-11-03T11:15:00Z',
  },
  {
    id: 'lead-5',
    businessName: 'Nexus Cloud Analytics',
    contactName: 'Priya Patel',
    email: 'priya@nexuscloud.io',
    phone: '+91 98123 45678',
    businessCategory: 'SaaS & Technology',
    websiteStatus: 'outdated_website',
    potentialRequirements: 'Product marketing website with interactive live demo, pricing calculator and lead capture. Budget ₹2,20,000.',
    leadSource: 'Inbound',
    assignedRepId: 'user-sales',
    assignedRepName: 'Marcus Chen',
    priority: 'high',
    status: 'contacted',
    score: 92,
    followUpDate: '2026-11-06',
    notes: 'Recently raised seed funding. Looking for premier agency partner.',
    createdAt: '2026-11-02T15:45:00Z',
  },
];

// Initial Realistic Seed Projects (Amounts in INR - ₹)
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Lumina Aesthetic Medical Portal',
    clientId: 'client-1',
    clientName: 'Sarah Jenkins',
    clientBusiness: 'Lumina Aesthetic Clinic',
    packageSelected: 'Corporate Business Portal',
    projectPrice: 85000, // ₹85,000
    advancePayment: 42500, // ₹42,500
    remainingBalance: 42500,
    assignedMemberIds: ['user-founder', 'user-partner'],
    assignedMembers: ['Alex Vance', 'Elena Rostova'],
    deadline: '2026-11-25',
    status: 'development',
    requirements: 'React/Next.js dynamic website with WhatsApp booking, treatment booking engine and doctor biographies.',
    progressChecklist: [
      { id: 'c1', title: 'Brand Identity & Color Palette Signoff', completed: true, phase: 'Planning' },
      { id: 'c2', title: 'Figma UX Wireframes & Prototype', completed: true, phase: 'Designing' },
      { id: 'c3', title: 'Responsive Frontend Component Coding', completed: true, phase: 'Development' },
      { id: 'c4', title: 'Appointment Booking Engine Integration', completed: false, phase: 'Development' },
      { id: 'c5', title: 'Security Audit & Speed Optimization', completed: false, phase: 'Review' },
      { id: 'c6', title: 'Production Domain DNS & Launch', completed: false, phase: 'Delivered' },
    ],
    deliveryStatus: 'on_track',
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'Vanguard Global Fleet Logistics System',
    clientId: 'client-2',
    clientName: 'David Thorne',
    clientBusiness: 'Vanguard Logistics Group',
    packageSelected: 'Full Web App & CMS',
    projectPrice: 140000, // ₹1,40,000
    advancePayment: 70000, // ₹70,000
    remainingBalance: 70000,
    assignedMemberIds: ['user-partner'],
    assignedMembers: ['Elena Rostova'],
    deadline: '2026-12-10',
    status: 'designing',
    requirements: 'Enterprise portal with tracking calculator, multilingual architecture and CRM integration.',
    progressChecklist: [
      { id: 'c1', title: 'Technical Architecture Specification', completed: true, phase: 'Planning' },
      { id: 'c2', title: 'High-Fidelity Dashboard Mockups', completed: false, phase: 'Designing' },
      { id: 'c3', title: 'API Integration Proof-of-Concept', completed: false, phase: 'Development' },
      { id: 'c4', title: 'Quality Assurance Testing', completed: false, phase: 'Review' },
      { id: 'c5', title: 'Staff Training & Handover', completed: false, phase: 'Delivered' },
    ],
    deliveryStatus: 'on_track',
    createdAt: '2026-09-25T09:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'Aura Fine Dining Luxury Experience',
    clientId: 'client-3',
    clientName: 'Mia Sterling',
    clientBusiness: 'Aura Fine Dining & Lounge',
    packageSelected: 'Starter Web Presence',
    projectPrice: 62000, // ₹62,000
    advancePayment: 31000, // ₹31,000
    remainingBalance: 31000,
    assignedMemberIds: ['user-founder', 'user-sales'],
    assignedMembers: ['Alex Vance', 'Marcus Chen'],
    deadline: '2026-11-18',
    status: 'review',
    requirements: 'Editorial luxury design with digital food & cocktail menus, table reservation and culinary video background.',
    progressChecklist: [
      { id: 'c1', title: 'Client Creative Direction Alignment', completed: true, phase: 'Planning' },
      { id: 'c2', title: 'Interactive Menu UI Design', completed: true, phase: 'Designing' },
      { id: 'c3', title: 'Mobile Viewport Touch Tuning', completed: true, phase: 'Development' },
      { id: 'c4', title: 'Client Review & Revisions Round 1', completed: true, phase: 'Review' },
      { id: 'c5', title: 'Final Balance Payment & Deployment', completed: false, phase: 'Delivered' },
    ],
    deliveryStatus: 'on_track',
    createdAt: '2026-10-18T14:30:00Z',
  },
];

// Initial Realistic Seed Invoices (Amounts in INR - ₹)
const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-081',
    clientId: 'client-1',
    clientName: 'Sarah Jenkins',
    clientBusiness: 'Lumina Aesthetic Clinic',
    clientEmail: 'sarah@luminaaesthetic.com',
    projectId: 'proj-1',
    projectName: 'Lumina Aesthetic Medical Portal',
    items: [
      { id: 'i1', description: 'Corporate Business Portal - 50% Project Advance', quantity: 1, unitPrice: 42500, total: 42500 },
    ],
    subtotal: 42500,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    advancePaid: 42500,
    balanceDue: 0,
    status: 'paid',
    issueDate: '2026-10-06',
    dueDate: '2026-10-13',
    approvedByFounder: true,
    notes: 'Paid via UPI / Bank Transfer. Thank you for partnering with Orbits Studio.',
    createdAt: '2026-10-06T10:30:00Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-082',
    clientId: 'client-2',
    clientName: 'David Thorne',
    clientBusiness: 'Vanguard Logistics Group',
    clientEmail: 'dthorne@vanguardlog.com',
    projectId: 'proj-2',
    projectName: 'Vanguard Global Fleet Logistics System',
    items: [
      { id: 'i1', description: 'Enterprise Web Portal & CMS - 50% Milestone Advance', quantity: 1, unitPrice: 70000, total: 70000 },
    ],
    subtotal: 70000,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    advancePaid: 70000,
    balanceDue: 0,
    status: 'paid',
    issueDate: '2026-09-25',
    dueDate: '2026-10-02',
    approvedByFounder: true,
    notes: 'Direct corporate NEFT/RTGS settlement.',
    createdAt: '2026-09-25T09:30:00Z',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-083',
    clientId: 'client-3',
    clientName: 'Mia Sterling',
    clientBusiness: 'Aura Fine Dining & Lounge',
    clientEmail: 'mia@auradining.co',
    projectId: 'proj-3',
    projectName: 'Aura Fine Dining Luxury Experience',
    items: [
      { id: 'i1', description: 'Starter Web Presence - 50% Project Advance', quantity: 1, unitPrice: 31000, total: 31000 },
    ],
    subtotal: 31000,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    advancePaid: 31000,
    balanceDue: 0,
    status: 'paid',
    issueDate: '2026-10-18',
    dueDate: '2026-10-25',
    approvedByFounder: true,
    notes: 'Online payment received via UPI.',
    createdAt: '2026-10-18T15:00:00Z',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-084',
    clientId: 'client-1',
    clientName: 'Sarah Jenkins',
    clientBusiness: 'Lumina Aesthetic Clinic',
    clientEmail: 'sarah@luminaaesthetic.com',
    projectId: 'proj-1',
    projectName: 'Lumina Aesthetic Medical Portal',
    items: [
      { id: 'i1', description: 'Corporate Business Portal - Final Completion Milestone (50%)', quantity: 1, unitPrice: 42500, total: 42500 },
    ],
    subtotal: 42500,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    advancePaid: 0,
    balanceDue: 42500,
    status: 'pending',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    approvedByFounder: true,
    notes: 'Due upon completion of review stage. Bank Transfer / UPI accepted.',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-085',
    clientId: 'client-3',
    clientName: 'Mia Sterling',
    clientBusiness: 'Aura Fine Dining & Lounge',
    clientEmail: 'mia@auradining.co',
    projectId: 'proj-3',
    projectName: 'Aura Fine Dining Luxury Experience',
    items: [
      { id: 'i1', description: 'Starter Web Presence - Final Delivery Balance (50%)', quantity: 1, unitPrice: 31000, total: 31000 },
    ],
    subtotal: 31000,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    advancePaid: 0,
    balanceDue: 31000,
    status: 'pending',
    issueDate: '2026-11-04',
    dueDate: '2026-11-18',
    approvedByFounder: true,
    notes: 'Scheduled for release upon final staging approval.',
    createdAt: '2026-11-04T12:00:00Z',
  },
];

// Initial Realistic Financial Transactions (Amounts in INR - ₹)
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    category: 'client_advance',
    amount: 42500, // ₹42,500
    description: 'Advance payment (50%) - Lumina Aesthetic Clinic Website',
    relatedProjectId: 'proj-1',
    relatedProjectName: 'Lumina Aesthetic Medical Portal',
    relatedClientId: 'client-1',
    relatedInvoiceId: 'inv-1',
    date: '2026-10-06',
    paymentMethod: 'Bank Transfer / UPI',
    recordedByName: 'Alex Vance',
    createdAt: '2026-10-06T11:00:00Z',
  },
  {
    id: 'tx-2',
    type: 'income',
    category: 'client_advance',
    amount: 70000, // ₹70,000
    description: 'Advance payment (50%) - Vanguard Logistics Enterprise System',
    relatedProjectId: 'proj-2',
    relatedProjectName: 'Vanguard Global Fleet Logistics System',
    relatedClientId: 'client-2',
    relatedInvoiceId: 'inv-2',
    date: '2026-09-25',
    paymentMethod: 'NEFT / RTGS',
    recordedByName: 'Alex Vance',
    createdAt: '2026-09-25T10:00:00Z',
  },
  {
    id: 'tx-3',
    type: 'income',
    category: 'client_advance',
    amount: 31000, // ₹31,000
    description: 'Advance payment (50%) - Aura Fine Dining Experience',
    relatedProjectId: 'proj-3',
    relatedProjectName: 'Aura Fine Dining Luxury Experience',
    relatedClientId: 'client-3',
    relatedInvoiceId: 'inv-3',
    date: '2026-10-18',
    paymentMethod: 'UPI Payment',
    recordedByName: 'Alex Vance',
    createdAt: '2026-10-18T16:00:00Z',
  },
  {
    id: 'tx-4',
    type: 'expense',
    category: 'hosting_infrastructure',
    amount: 3499, // ₹3,499
    description: 'Hostinger Cloud Web Hosting & CDN Renewal',
    date: '2026-10-01',
    paymentMethod: 'Company Card',
    recordedByName: 'Alex Vance',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'tx-5',
    type: 'expense',
    category: 'software_tools',
    amount: 4800, // ₹4,800
    description: 'Figma Pro, GitHub Team & Supabase Database Subscription',
    date: '2026-10-15',
    paymentMethod: 'Company Card',
    recordedByName: 'Elena Rostova',
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'tx-6',
    type: 'expense',
    category: 'contractor_payout',
    amount: 12500, // ₹12,500
    description: '3D Spline Asset Modeling - Lumina Aesthetic Clinic',
    relatedProjectId: 'proj-1',
    date: '2026-10-22',
    paymentMethod: 'UPI Transfer',
    recordedByName: 'Elena Rostova',
    createdAt: '2026-10-22T14:00:00Z',
  },
  {
    id: 'tx-7',
    type: 'expense',
    category: 'sales_commission',
    amount: 6200, // ₹6,200
    description: 'Sales Commission Payout - Marcus Chen (Aura Dining)',
    date: '2026-10-25',
    paymentMethod: 'Bank IMPS',
    recordedByName: 'Alex Vance',
    createdAt: '2026-10-25T11:00:00Z',
  },
];

// Initial Realistic Commissions (Amounts in INR - ₹)
const INITIAL_COMMISSIONS: CommissionRecord[] = [
  {
    id: 'comm-1',
    salesRepId: 'user-sales',
    salesRepName: 'Marcus Chen',
    projectId: 'proj-3',
    projectName: 'Aura Fine Dining Luxury Experience',
    dealValue: 62000, // ₹62,000
    commissionRate: 10,
    commissionAmount: 6200, // ₹6,200
    status: 'paid',
    payoutDate: '2026-10-25',
    createdAt: '2026-10-18T15:30:00Z',
  },
  {
    id: 'comm-2',
    salesRepId: 'user-sales',
    salesRepName: 'Marcus Chen',
    projectId: 'proj-1',
    projectName: 'Lumina Aesthetic Medical Portal',
    dealValue: 85000, // ₹85,000
    commissionRate: 10,
    commissionAmount: 8500, // ₹8,500
    status: 'pending_clearance',
    createdAt: '2026-10-06T11:00:00Z',
  },
];

// Initial Realistic Appointments
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    title: 'Lumina Clinic - Mid-Sprint Interactive Demo',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah@luminaaesthetic.com',
    clientPhone: '+91 98234 89012',
    date: '2026-11-06',
    time: '14:00',
    durationMinutes: 45,
    meetingType: 'video_call',
    meetingLink: 'https://meet.google.com/orb-lum-dem',
    status: 'scheduled',
    notes: 'Walkthrough of mobile responsive booking system and treatment galleries.',
    assignedToName: 'Alex Vance',
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'apt-2',
    title: 'AeroZen Aviation - Executive Pitch & Scope Clarification',
    clientName: 'Captain Arthur Vance',
    clientEmail: 'arthur@aerozenjets.com',
    clientPhone: '+91 98789 01234',
    date: '2026-11-07',
    time: '11:00',
    durationMinutes: 60,
    meetingType: 'video_call',
    meetingLink: 'https://meet.google.com/orb-aer-pit',
    status: 'scheduled',
    notes: 'Review pricing tiers and expected launch schedule before contract signing.',
    assignedToName: 'Marcus Chen',
    createdAt: '2026-11-03T14:00:00Z',
  },
  {
    id: 'apt-3',
    title: 'Vanguard Logistics - Weekly Architecture Sync',
    clientName: 'David Thorne',
    clientEmail: 'dthorne@vanguardlog.com',
    clientPhone: '+91 98345 67123',
    date: '2026-11-09',
    time: '15:30',
    durationMinutes: 30,
    meetingType: 'video_call',
    meetingLink: 'https://meet.google.com/orb-van-arc',
    status: 'scheduled',
    notes: 'Review API schemas and shipment tracking data connectors.',
    assignedToName: 'Elena Rostova',
    createdAt: '2026-11-04T09:00:00Z',
  },
];

// Initial Founder Approval Queue Items (INR Values)
const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'appr-1',
    actionType: 'confirm_quotation',
    title: 'Approve ₹1,65,000 Official Quotation for AeroZen Aviation',
    description: 'Marcus Chen prepared the official contract proposal for AeroZen Aviation private charter portal. Requires Founder sign-off before email dispatch.',
    preparedContent: {
      recipient: 'arthur@aerozenjets.com',
      recipientName: 'Captain Arthur Vance',
      subject: 'Orbits Studio Proposal & Official Quotation — AeroZen Aviation Charter Web Platform',
      body: 'Dear Captain Vance,\n\nFollowing our discussion, please find attached the comprehensive technical specification and fixed-cost quotation of ₹1,65,000 for the AeroZen Aviation digital charter suite.\n\nIncluded:\n- Real-time charter rate estimator\n- Interactive fleet showcase with 360-degree cabin tours\n- Dedicated WhatsApp concierge booking channel\n- 4-week delivery guarantee\n\nLooking forward to partnering with your team.\n\nWarm regards,\nMarcus Chen\nOrbits Studio Business Development',
      amount: 165000,
    },
    requestingMemberId: 'user-sales',
    requestingMemberName: 'Marcus Chen',
    requestingMemberRole: 'SALES_REPRESENTATIVE',
    status: 'pending',
    createdAt: '2026-11-04T15:30:00Z',
  },
  {
    id: 'appr-2',
    actionType: 'send_whatsapp',
    title: 'Approve Milestone Follow-up WhatsApp to Mia Sterling',
    description: 'WhatsApp reminder for Aura Dining review sign-off and balance settlement.',
    preparedContent: {
      recipient: '+91 98456 78901',
      recipientName: 'Mia Sterling (Aura Dining)',
      body: 'Hi Mia! Alex and Elena here from Orbits Studio. We have completed the revised cocktail gallery and mobile reservation view for Aura Lounge. When you have a moment, take a look at the staging preview link. Once approved, we will schedule DNS deployment!',
    },
    requestingMemberId: 'user-partner',
    requestingMemberName: 'Elena Rostova',
    requestingMemberRole: 'BUSINESS_PARTNER',
    status: 'pending',
    createdAt: '2026-11-05T02:15:00Z',
  },
  {
    id: 'appr-3',
    actionType: 'financial_commitment',
    title: 'Approve ₹8,500 Freelance Motion Designer Engagement',
    description: 'Engage freelance motion designer for 3D orbital animation assets for Vanguard Logistics portal.',
    preparedContent: {
      recipient: 'billing@motioncraft.co',
      recipientName: 'MotionCraft Studio',
      amount: 8500,
      body: 'Statement of Work: 3D interactive delivery truck asset with transparent alpha channel for Vanguard Logistics hero section. Total fee: ₹8,500.',
    },
    requestingMemberId: 'user-partner',
    requestingMemberName: 'Elena Rostova',
    requestingMemberRole: 'BUSINESS_PARTNER',
    status: 'pending',
    createdAt: '2026-11-05T03:00:00Z',
  },
];

// Initial Activity Logs
const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-05T03:00:00Z',
    actorName: 'Elena Rostova',
    actorRole: 'BUSINESS_PARTNER',
    action: 'Submitted Approval Request',
    module: 'APPROVALS',
    details: 'Requested approval for ₹8,500 motion design commitment for Vanguard Logistics.',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-04T15:30:00Z',
    actorName: 'Marcus Chen',
    actorRole: 'SALES_REPRESENTATIVE',
    action: 'Prepared Quotation',
    module: 'APPROVALS',
    details: 'Queued ₹1,65,000 proposal for AeroZen Aviation awaiting Founder review.',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-04T12:00:00Z',
    actorName: 'Alex Vance',
    actorRole: 'FOUNDER',
    action: 'Generated Milestone Invoice',
    module: 'INVOICES',
    details: 'Created Invoice INV-2026-085 (₹31,000) for Aura Fine Dining final delivery.',
  },
  {
    id: 'log-4',
    timestamp: '2026-11-03T11:15:00Z',
    actorName: 'Marcus Chen',
    actorRole: 'SALES_REPRESENTATIVE',
    action: 'Added New Lead',
    module: 'LEADS',
    details: 'Logged new prospect Solstice Urban Architecture from LinkedIn inquiry.',
  },
];

// Helper to load or initialize from storage safely
function loadData<T>(key: string, defaultData: T): T {
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) {
      safeStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultData;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    safeStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// Data Store Class
export class NexusDatabase {
  // Profiles & Current User
  static getUsers(): UserProfile[] {
    return loadData<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getCurrentUser(): UserProfile {
    try {
      const users = this.getUsers();
      const currentId = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-founder';
      return users.find((u) => u.id === currentId) || users[0] || INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  }

  static setCurrentUser(userId: string): UserProfile {
    try {
      const users = this.getUsers();
      const target = users.find((u) => u.id === userId) || users[0] || INITIAL_USERS[0];
      safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, target.id);
      this.logActivity(target.name, target.role, 'Switched Active Session', 'SYSTEM', `Active session switched to ${target.name} (${target.role})`);
      return target;
    } catch {
      return INITIAL_USERS[0];
    }
  }

  static updateCommissionRate(userId: string, newRate: number): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index].commissionRate = newRate;
      saveData(STORAGE_KEYS.USERS, users);
      const currentUser = this.getCurrentUser();
      this.logActivity(currentUser.name, currentUser.role, 'Updated Commission Rate', 'FINANCE', `Set commission rate for ${users[index].name} to ${newRate}%`);
    }
  }

  // Clients (CRM)
  static getClients(): Client[] {
    return loadData<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  }

  static saveClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Client {
    const clients = this.getClients();
    const now = new Date().toISOString();
    let saved: Client;

    if (client.id) {
      const idx = clients.findIndex((c) => c.id === client.id);
      if (idx !== -1) {
        saved = { ...clients[idx], ...client, updatedAt: now };
        clients[idx] = saved;
      } else {
        saved = { ...client, id: client.id, createdAt: now, updatedAt: now };
        clients.unshift(saved);
      }
    } else {
      saved = {
        ...client,
        id: `client-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      clients.unshift(saved);
    }

    saveData(STORAGE_KEYS.CLIENTS, clients);
    const currentUser = this.getCurrentUser();
    this.logActivity(currentUser.name, currentUser.role, client.id ? 'Updated Client' : 'Created Client', 'CRM', `${saved.businessName} (${saved.name})`);
    return saved;
  }

  static archiveClient(clientId: string): void {
    const clients = this.getClients();
    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx !== -1) {
      clients[idx].status = 'archived';
      clients[idx].updatedAt = new Date().toISOString();
      saveData(STORAGE_KEYS.CLIENTS, clients);
      const currentUser = this.getCurrentUser();
      this.logActivity(currentUser.name, currentUser.role, 'Archived Client', 'CRM', `Archived ${clients[idx].businessName}`);
    }
  }

  // Leads
  static getLeads(): Lead[] {
    return loadData<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  }

  static saveLead(lead: Omit<Lead, 'id' | 'createdAt'> & { id?: string }): Lead {
    const leads = this.getLeads();
    const now = new Date().toISOString();
    let saved: Lead;

    if (lead.id) {
      const idx = leads.findIndex((l) => l.id === lead.id);
      if (idx !== -1) {
        saved = { ...leads[idx], ...lead };
        leads[idx] = saved;
      } else {
        saved = { ...lead, id: lead.id, createdAt: now };
        leads.unshift(saved);
      }
    } else {
      saved = {
        ...lead,
        id: `lead-${Date.now()}`,
        createdAt: now,
      };
      leads.unshift(saved);
    }

    saveData(STORAGE_KEYS.LEADS, leads);
    const currentUser = this.getCurrentUser();
    this.logActivity(currentUser.name, currentUser.role, lead.id ? 'Updated Lead' : 'Added New Lead', 'LEADS', `${saved.businessName} — Status: ${saved.status}`);
    return saved;
  }

  static convertLeadToClient(leadId: string, initialBudget: number): { client: Client; project: Project } {
    const leads = this.getLeads();
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const currentUser = this.getCurrentUser();

    // 1. Create client
    const newClient = this.saveClient({
      name: lead.contactName,
      businessName: lead.businessName,
      email: lead.email,
      phone: lead.phone,
      businessCategory: lead.businessCategory,
      websiteRequirements: lead.potentialRequirements,
      budget: initialBudget,
      status: 'active',
      notes: `Converted from lead ${lead.businessName}. Source: ${lead.leadSource}`,
    });

    // 2. Create initial project
    const advance = Math.round(initialBudget * 0.5);
    const newProject = this.saveProject({
      name: `${lead.businessName} Website Platform`,
      clientId: newClient.id,
      clientName: newClient.name,
      clientBusiness: newClient.businessName,
      packageSelected: initialBudget >= 100000 ? 'Corporate Business Portal' : 'Starter Web Presence',
      projectPrice: initialBudget,
      advancePayment: advance,
      remainingBalance: initialBudget - advance,
      assignedMemberIds: [lead.assignedRepId || currentUser.id],
      assignedMembers: [lead.assignedRepName || currentUser.name],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planning',
      requirements: lead.potentialRequirements,
      progressChecklist: [
        { id: 'c1', title: 'Creative Discovery & Scope Lock', completed: true, phase: 'Planning' },
        { id: 'c2', title: 'Figma UI/UX Prototypes', completed: false, phase: 'Designing' },
        { id: 'c3', title: 'Full Responsive Development', completed: false, phase: 'Development' },
        { id: 'c4', title: 'Client Feedback & Staging Revisions', completed: false, phase: 'Review' },
        { id: 'c5', title: 'DNS Setup & Final Delivery', completed: false, phase: 'Delivered' },
      ],
      deliveryStatus: 'on_track',
    });

    // 3. Mark lead as converted
    const leadIdx = leads.findIndex((l) => l.id === leadId);
    if (leadIdx !== -1) {
      leads[leadIdx].status = 'converted';
      leads[leadIdx].convertedClientId = newClient.id;
      saveData(STORAGE_KEYS.LEADS, leads);
    }

    // 4. Record commission record for the assigned rep
    const repUser = this.getUsers().find((u) => u.id === lead.assignedRepId) || currentUser;
    const commRate = repUser.commissionRate || 10;
    const commAmount = Math.round((initialBudget * commRate) / 100);
    this.addCommission({
      salesRepId: repUser.id,
      salesRepName: repUser.name,
      projectId: newProject.id,
      projectName: newProject.name,
      dealValue: initialBudget,
      commissionRate: commRate,
      commissionAmount: commAmount,
      status: 'pending_clearance',
    });

    this.logActivity(
      currentUser.name,
      currentUser.role,
      'Converted Lead to Client & Project',
      'LEADS',
      `Converted ${lead.businessName} into Client (${newClient.name}) with ${formatINR(initialBudget)} Project`
    );

    return { client: newClient, project: newProject };
  }

  // Projects
  static getProjects(): Project[] {
    return loadData<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  static saveProject(project: Omit<Project, 'id' | 'createdAt'> & { id?: string }): Project {
    const projects = this.getProjects();
    const now = new Date().toISOString();
    let saved: Project;

    if (project.id) {
      const idx = projects.findIndex((p) => p.id === project.id);
      if (idx !== -1) {
        saved = { ...projects[idx], ...project };
        projects[idx] = saved;
      } else {
        saved = { ...project, id: project.id, createdAt: now };
        projects.unshift(saved);
      }
    } else {
      saved = {
        ...project,
        id: `proj-${Date.now()}`,
        createdAt: now,
      };
      projects.unshift(saved);
    }

    saveData(STORAGE_KEYS.PROJECTS, projects);
    const currentUser = this.getCurrentUser();
    this.logActivity(currentUser.name, currentUser.role, project.id ? 'Updated Project' : 'Created Project', 'PROJECTS', `${saved.name} [${saved.status}]`);
    return saved;
  }

  static toggleProjectChecklistItem(projectId: string, itemId: string): void {
    const projects = this.getProjects();
    const pIdx = projects.findIndex((p) => p.id === projectId);
    if (pIdx !== -1) {
      const item = projects[pIdx].progressChecklist.find((i) => i.id === itemId);
      if (item) {
        item.completed = !item.completed;
        saveData(STORAGE_KEYS.PROJECTS, projects);
      }
    }
  }

  // Invoices & Quotations
  static getInvoices(): Invoice[] {
    return loadData<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  }

  static saveInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'> & { id?: string }): Invoice {
    const invoices = this.getInvoices();
    const now = new Date().toISOString();
    let saved: Invoice;

    if (invoice.id) {
      const idx = invoices.findIndex((i) => i.id === invoice.id);
      if (idx !== -1) {
        saved = { ...invoices[idx], ...invoice };
        invoices[idx] = saved;
      } else {
        saved = { ...invoice, id: invoice.id, createdAt: now };
        invoices.unshift(saved);
      }
    } else {
      saved = {
        ...invoice,
        id: `inv-${Date.now()}`,
        createdAt: now,
      };
      invoices.unshift(saved);
    }

    saveData(STORAGE_KEYS.INVOICES, invoices);
    const currentUser = this.getCurrentUser();
    this.logActivity(currentUser.name, currentUser.role, invoice.id ? 'Updated Invoice' : 'Generated Invoice', 'INVOICES', `${saved.invoiceNumber} — ${formatINR(saved.subtotal)}`);
    return saved;
  }

  static markInvoicePaid(invoiceId: string, paymentMethod: string = 'UPI / Bank Transfer'): void {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex((i) => i.id === invoiceId);
    if (idx !== -1) {
      const inv = invoices[idx];
      inv.status = 'paid';
      inv.balanceDue = 0;
      saveData(STORAGE_KEYS.INVOICES, invoices);

      // Record financial income transaction
      this.addTransaction({
        type: 'income',
        category: 'client_final_payment',
        amount: inv.subtotal,
        description: `Settlement for Invoice ${inv.invoiceNumber} (${inv.clientBusiness})`,
        relatedClientId: inv.clientId,
        relatedProjectId: inv.projectId,
        relatedInvoiceId: inv.id,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        recordedByName: this.getCurrentUser().name,
      });

      this.logActivity(
        this.getCurrentUser().name,
        this.getCurrentUser().role,
        'Recorded Invoice Payment',
        'FINANCE',
        `Invoice ${inv.invoiceNumber} marked as Paid (${formatINR(inv.subtotal)}) via ${paymentMethod}`
      );
    }
  }

  // Transactions (Financial Management)
  static getTransactions(): Transaction[] {
    return loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  static addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions();
    const saved: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    transactions.unshift(saved);
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
    const currentUser = this.getCurrentUser();
    this.logActivity(
      currentUser.name,
      currentUser.role,
      `Recorded ${tx.type === 'income' ? 'Income' : 'Expense'}`,
      'FINANCE',
      `${formatINR(tx.amount)} — ${tx.description}`
    );
    return saved;
  }

  // Commissions
  static getCommissions(): CommissionRecord[] {
    return loadData<CommissionRecord[]>(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS);
  }

  static addCommission(comm: Omit<CommissionRecord, 'id' | 'createdAt'>): CommissionRecord {
    const comms = this.getCommissions();
    const saved: CommissionRecord = {
      ...comm,
      id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    comms.unshift(saved);
    saveData(STORAGE_KEYS.COMMISSIONS, comms);
    return saved;
  }

  static markCommissionPaid(commissionId: string): void {
    const comms = this.getCommissions();
    const idx = comms.findIndex((c) => c.id === commissionId);
    if (idx !== -1) {
      comms[idx].status = 'paid';
      comms[idx].payoutDate = new Date().toISOString().split('T')[0];
      saveData(STORAGE_KEYS.COMMISSIONS, comms);

      // Record transaction
      this.addTransaction({
        type: 'expense',
        category: 'sales_commission',
        amount: comms[idx].commissionAmount,
        description: `Commission Payout to ${comms[idx].salesRepName} (${comms[idx].projectName})`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer / IMPS',
        recordedByName: this.getCurrentUser().name,
      });
    }
  }

  // Appointments
  static getAppointments(): Appointment[] {
    return loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  static saveAppointment(apt: Omit<Appointment, 'id' | 'createdAt'> & { id?: string }): Appointment {
    const appointments = this.getAppointments();
    const now = new Date().toISOString();
    let saved: Appointment;

    if (apt.id) {
      const idx = appointments.findIndex((a) => a.id === apt.id);
      if (idx !== -1) {
        saved = { ...appointments[idx], ...apt };
        appointments[idx] = saved;
      } else {
        saved = { ...apt, id: apt.id, createdAt: now };
        appointments.unshift(saved);
      }
    } else {
      saved = {
        ...apt,
        id: `apt-${Date.now()}`,
        createdAt: now,
      };
      appointments.unshift(saved);
    }

    saveData(STORAGE_KEYS.APPOINTMENTS, appointments);
    const currentUser = this.getCurrentUser();
    this.logActivity(currentUser.name, currentUser.role, apt.id ? 'Updated Appointment' : 'Scheduled Appointment', 'COMMS', `${saved.title} with ${saved.clientName}`);
    return saved;
  }

  // Approvals Queue (CRITICAL FOUNDER GATEKEEPER)
  static getApprovals(): ApprovalItem[] {
    return loadData<ApprovalItem[]>(STORAGE_KEYS.APPROVALS, INITIAL_APPROVALS);
  }

  static queueApproval(
    item: Omit<ApprovalItem, 'id' | 'status' | 'createdAt' | 'requestingMemberId' | 'requestingMemberName' | 'requestingMemberRole'>
  ): ApprovalItem {
    const approvals = this.getApprovals();
    const currentUser = this.getCurrentUser();
    const saved: ApprovalItem = {
      ...item,
      id: `appr-${Date.now()}`,
      status: 'pending',
      requestingMemberId: currentUser.id,
      requestingMemberName: currentUser.name,
      requestingMemberRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    approvals.unshift(saved);
    saveData(STORAGE_KEYS.APPROVALS, approvals);
    this.logActivity(currentUser.name, currentUser.role, 'Queued Action for Founder Approval', 'APPROVALS', `${saved.title}`);
    return saved;
  }

  static processApproval(approvalId: string, decision: 'approved' | 'rejected', reviewerComments?: string): ApprovalItem {
    const approvals = this.getApprovals();
    const idx = approvals.findIndex((a) => a.id === approvalId);
    if (idx === -1) throw new Error('Approval item not found');

    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'FOUNDER') {
      throw new Error('Access Denied: Only Founder has authority to approve or reject external actions.');
    }

    const item = approvals[idx];
    item.status = decision;
    item.reviewedAt = new Date().toISOString();
    item.reviewerComments = reviewerComments || (decision === 'approved' ? 'Approved by Founder Alex Vance.' : 'Rejected by Founder.');

    saveData(STORAGE_KEYS.APPROVALS, approvals);

    this.logActivity(
      currentUser.name,
      currentUser.role,
      decision === 'approved' ? 'APPROVED External Action' : 'REJECTED External Action',
      'APPROVALS',
      `${item.title} — Decision: ${decision.toUpperCase()}`
    );

    return item;
  }

  // Activity Logs
  static getActivityLogs(): ActivityLog[] {
    return loadData<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
  }

  static logActivity(
    actorName: string,
    actorRole: UserRole,
    action: string,
    module: ActivityLog['module'],
    details: string
  ): void {
    const logs = this.getActivityLogs();
    const logItem: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      action,
      module,
      details,
    };
    logs.unshift(logItem);
    // Keep max 200 logs
    saveData(STORAGE_KEYS.ACTIVITY_LOGS, logs.slice(0, 200));
  }

  // Calculate True Business Summary in Indian Rupees (₹ - INR)
  static getBusinessSummary(): BusinessSummary {
    const clients = this.getClients();
    const projects = this.getProjects();
    const leads = this.getLeads();
    const invoices = this.getInvoices();
    const transactions = this.getTransactions();
    const approvals = this.getApprovals();

    // 1. Total active clients
    const totalClients = clients.filter((c) => c.status !== 'archived').length;

    // 2. Active projects (not delivered or completed)
    const activeProjects = projects.filter((p) => p.status !== 'completed' && p.status !== 'delivered').length;

    // 3. True Monthly Revenue from verified income transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncomeTx = transactions.filter((tx) => {
      if (tx.type !== 'income') return false;
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyIncomeTx.reduce((sum, tx) => sum + tx.amount, 0);

    // 4. Total expenses
    const totalExpenses = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // 5. Total all-time received revenue
    const allTimeRevenue = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const netProfit = allTimeRevenue - totalExpenses;
    const profitMarginPercent = allTimeRevenue > 0 ? Math.round((netProfit / allTimeRevenue) * 100) : 0;

    // 6. Pending payments from unpaid/pending invoices
    const pendingPayments = invoices
      .filter((i) => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.balanceDue, 0);

    // 7. New leads in current pipeline
    const newLeads = leads.filter((l) => l.status === 'new' || l.status === 'contacted').length;

    // 8. Pending tasks across all active projects
    let pendingTasks = 0;
    projects.forEach((p) => {
      p.progressChecklist.forEach((c) => {
        if (!c.completed) pendingTasks++;
      });
    });

    // 9. Pending founder approvals
    const pendingApprovals = approvals.filter((a) => a.status === 'pending').length;

    return {
      totalClients,
      activeProjects,
      monthlyRevenue: monthlyRevenue || allTimeRevenue,
      totalExpenses,
      netProfit,
      profitMarginPercent,
      pendingPayments,
      newLeads,
      pendingTasks,
      pendingApprovals,
    };
  }

  // Backup & Restore
  static exportFullBackup(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      currency: 'INR (₹)',
      version: '2.0.0',
      users: this.getUsers(),
      clients: this.getClients(),
      leads: this.getLeads(),
      projects: this.getProjects(),
      invoices: this.getInvoices(),
      transactions: this.getTransactions(),
      commissions: this.getCommissions(),
      appointments: this.getAppointments(),
      approvals: this.getApprovals(),
      activityLogs: this.getActivityLogs(),
    };
    return JSON.stringify(payload, null, 2);
  }

  static restoreFromBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.clients) saveData(STORAGE_KEYS.CLIENTS, data.clients);
      if (data.leads) saveData(STORAGE_KEYS.LEADS, data.leads);
      if (data.projects) saveData(STORAGE_KEYS.PROJECTS, data.projects);
      if (data.invoices) saveData(STORAGE_KEYS.INVOICES, data.invoices);
      if (data.transactions) saveData(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.commissions) saveData(STORAGE_KEYS.COMMISSIONS, data.commissions);
      if (data.appointments) saveData(STORAGE_KEYS.APPOINTMENTS, data.appointments);
      if (data.approvals) saveData(STORAGE_KEYS.APPROVALS, data.approvals);
      if (data.activityLogs) saveData(STORAGE_KEYS.ACTIVITY_LOGS, data.activityLogs);
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  }

  static resetToDefaults(): void {
    saveData(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveData(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    saveData(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    saveData(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    saveData(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    saveData(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    saveData(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS);
    saveData(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    saveData(STORAGE_KEYS.APPROVALS, INITIAL_APPROVALS);
    saveData(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    saveData(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-founder');
  }

  // Business Tasks
  static getTasks(): BusinessTask[] {
    return loadData<BusinessTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  static saveTask(task: Omit<BusinessTask, 'id' | 'createdAt'> & { id?: string }): BusinessTask {
    const tasks = this.getTasks();
    const now = new Date().toISOString();
    let saved: BusinessTask;

    if (task.id) {
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx !== -1) {
        saved = { ...tasks[idx], ...task };
        tasks[idx] = saved;
      } else {
        saved = { ...task, id: task.id, createdAt: now };
        tasks.unshift(saved);
      }
    } else {
      saved = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: now,
      };
      tasks.unshift(saved);
    }

    saveData(STORAGE_KEYS.TASKS, tasks);
    const currentUser = this.getCurrentUser();
    this.logActivity(currentUser.name, currentUser.role, task.id ? 'Updated Task' : 'Created Task', 'SYSTEM', saved.title);
    return saved;
  }

  static toggleTaskStatus(taskId: string): BusinessTask | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return null;

    const currentStatus = tasks[idx].status;
    const nextStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    tasks[idx].status = nextStatus;
    saveData(STORAGE_KEYS.TASKS, tasks);

    const currentUser = this.getCurrentUser();
    this.logActivity(currentUser.name, currentUser.role, nextStatus === 'completed' ? 'Completed Task' : 'Reopened Task', 'SYSTEM', tasks[idx].title);
    return tasks[idx];
  }

  static deleteTask(taskId: string): void {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);
    saveData(STORAGE_KEYS.TASKS, filtered);
  }
}

// Initial Tasks
const INITIAL_TASKS: BusinessTask[] = [
  {
    id: 'task-1',
    title: 'Deploy SSL certificates & verify DNS for Lumina Aesthetic Clinic',
    assignedToName: 'Alex Vance',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    status: 'in_progress',
    relatedProject: 'Lumina Aesthetic Medical Portal',
    category: 'development',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Follow up with Capt. Arthur Vance regarding AeroZen quote in ₹',
    assignedToName: 'Marcus Chen',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    status: 'todo',
    relatedProject: 'AeroZen Aviation',
    category: 'client',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Generate balance invoice for Aura Fine Dining final delivery',
    assignedToName: 'Elena Rostova',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    status: 'todo',
    relatedProject: 'Aura Fine Dining Luxury Experience',
    category: 'finance',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Review high-fidelity Figma UI design with Elena Rostova',
    assignedToName: 'Elena Rostova',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    status: 'in_progress',
    relatedProject: 'Vanguard Global Fleet Logistics System',
    category: 'design',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Disburse sales commission for Vanguard Logistics project',
    assignedToName: 'Alex Vance',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'high',
    status: 'completed',
    relatedProject: 'Vanguard Global Fleet Logistics System',
    category: 'admin',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
