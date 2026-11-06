import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  User,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  List,
} from 'lucide-react';
import {
  Lead,
  LeadStatus,
  LeadPriority,
  WebsiteStatus,
  BusinessCategory,
  UserProfile,
} from '../types/nexus';
import { formatINR } from '../utils/format';

interface LeadsViewProps {
  leads: Lead[];
  users: UserProfile[];
  currentUser: UserProfile;
  onSaveLead: (lead: Omit<Lead, 'id' | 'createdAt'> & { id?: string }) => void;
  onConvertLead: (leadId: string, budget: number) => void;
  onQueueProposalApproval: (lead: Lead) => void;
}

const STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: '1. New Prospect', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'contacted', label: '2. Contacted', color: 'border-blue-500/30 bg-blue-950/20' },
  { id: 'interested', label: '3. Interested', color: 'border-cyan-500/30 bg-cyan-950/20' },
  { id: 'negotiation', label: '4. Negotiation', color: 'border-purple-500/30 bg-purple-950/20' },
  { id: 'converted', label: '5. Converted', color: 'border-emerald-500/30 bg-emerald-950/20' },
  { id: 'lost', label: 'Lost / Closed', color: 'border-rose-500/20 bg-rose-950/10' },
];

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

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  users,
  currentUser,
  onSaveLead,
  onConvertLead,
  onQueueProposalApproval,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [repFilter, setRepFilter] = useState<string>('ALL');

  // Modal states
  const [isCreating, setIsCreating] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [conversionBudget, setConversionBudget] = useState<number>(85000);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessCategory: 'Corporate & Legal' as BusinessCategory,
    websiteStatus: 'outdated_website' as WebsiteStatus,
    potentialRequirements: '',
    leadSource: 'Referral' as Lead['leadSource'],
    assignedRepId: currentUser.id,
    assignedRepName: currentUser.name,
    priority: 'high' as LeadPriority,
    status: 'new' as LeadStatus,
    score: 75,
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingLead(null);
    setFormData({
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      businessCategory: 'Corporate & Legal',
      websiteStatus: 'outdated_website',
      potentialRequirements: '',
      leadSource: 'Outreach',
      assignedRepId: currentUser.id,
      assignedRepName: currentUser.name,
      priority: 'high',
      status: 'new',
      score: 70,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      businessName: lead.businessName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      businessCategory: lead.businessCategory,
      websiteStatus: lead.websiteStatus,
      potentialRequirements: lead.potentialRequirements,
      leadSource: lead.leadSource,
      assignedRepId: lead.assignedRepId,
      assignedRepName: lead.assignedRepName,
      priority: lead.priority,
      status: lead.status,
      score: lead.score,
      followUpDate: lead.followUpDate,
      notes: lead.notes,
    });
    setIsCreating(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rep = users.find((u) => u.id === formData.assignedRepId) || currentUser;

    // Calculate dynamic lead score (0-100)
    let calculatedScore = 50;
    if (formData.priority === 'high') calculatedScore += 25;
    if (formData.priority === 'medium') calculatedScore += 10;
    if (formData.websiteStatus === 'no_website') calculatedScore += 15;
    if (formData.websiteStatus === 'ecommerce_upgrade') calculatedScore += 15;
    if (formData.email && formData.phone) calculatedScore += 10;
    calculatedScore = Math.min(100, Math.max(20, calculatedScore));

    onSaveLead({
      ...(editingLead ? { id: editingLead.id } : {}),
      ...formData,
      assignedRepName: rep.name,
      score: calculatedScore,
    });
    setIsCreating(false);
    setEditingLead(null);
  };

  const handleStageChange = (lead: Lead, newStatus: LeadStatus) => {
    onSaveLead({
      ...lead,
      status: newStatus,
    });
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.businessName.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;
    const matchesRep = repFilter === 'ALL' || l.assignedRepId === repFilter;

    // Under RBAC: if user is Sales Rep, only show leads assigned to them or unassigned
    if (currentUser.role === 'SALES_REPRESENTATIVE') {
      const isAssignedToUser = l.assignedRepId === currentUser.id || !l.assignedRepId;
      return matchesSearch && matchesPriority && matchesRep && isAssignedToUser;
    }

    return matchesSearch && matchesPriority && matchesRep;
  });

  const getWebsiteStatusBadge = (ws: WebsiteStatus) => {
    switch (ws) {
      case 'no_website':
        return <span className="text-[10px] text-rose-400 font-mono">No Website (Urgent)</span>;
      case 'outdated_website':
        return <span className="text-[10px] text-amber-400 font-mono">Outdated Legacy Site</span>;
      case 'redesign_needed':
        return <span className="text-[10px] text-cyan-400 font-mono">Brand Redesign Required</span>;
      case 'ecommerce_upgrade':
        return <span className="text-[10px] text-purple-400 font-mono">E-Commerce Upgrade</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            <span>Lead Intelligence & Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track business prospects, automated lead scoring, and pipeline progression.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'kanban' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prospect</span>
          </button>
        </div>
      </div>

      {/* Anti-Spam Policy Warning Box */}
      <div className="p-3 rounded-xl bg-[#0c1527] border border-cyan-500/20 flex items-start gap-2.5 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-cyan-300">Ethical Outreach Protocol:</strong> NEXUS operates under Orbits Studio's strict non-spam standard. All outreach records use publicly accessible business contact information. Automated bulk blasting is strictly prohibited; all tailored proposals require Founder review.
        </p>
      </div>

      {/* Filter Matrix */}
      <div className="nexus-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, businesses, contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {currentUser.role !== 'SALES_REPRESENTATIVE' && (
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Assigned Reps</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KANBAN PIPELINE VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            return (
              <div
                key={stage.id}
                className={`rounded-2xl p-3 border flex flex-col min-w-[240px] ${stage.color}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
                  <h3 className="font-semibold text-xs text-white font-mono uppercase">{stage.label}</h3>
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-300 flex items-center justify-center font-bold">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-500 font-mono">No leads in stage</div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3.5 rounded-xl bg-[#0c1527] border border-slate-800 hover:border-cyan-500/50 shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-xs text-white leading-tight">{lead.businessName}</h4>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                lead.priority === 'high'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                  : lead.priority === 'medium'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {lead.priority.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-300 mt-1">{lead.contactName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.businessCategory}</div>

                          <div className="mt-2 pt-2 border-t border-slate-800/80">
                            {getWebsiteStatusBadge(lead.websiteStatus)}
                          </div>

                          {/* Score and Rep */}
                          <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Score:</span>
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded ${
                                lead.score >= 80
                                  ? 'text-emerald-400 bg-emerald-950/60'
                                  : lead.score >= 60
                                  ? 'text-cyan-400 bg-cyan-950/60'
                                  : 'text-amber-400 bg-amber-950/60'
                              }`}
                            >
                              {lead.score}/100
                            </span>
                          </div>

                          <div className="mt-1 text-[10px] text-slate-400 truncate">
                            Rep: <span className="text-slate-300">{lead.assignedRepName}</span>
                          </div>
                        </div>

                        {/* Card bottom actions */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1">
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="text-[10px] text-slate-400 hover:text-white"
                          >
                            Edit
                          </button>

                          {lead.status !== 'converted' && (
                            <button
                              onClick={() => {
                                setConvertingLead(lead);
                                setConversionBudget(85000);
                              }}
                              className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                              title="Convert directly to Client and create initial project"
                            >
                              <span>Convert</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Stage quick advancement buttons */}
                        <div className="mt-2 pt-1 flex items-center justify-between text-[9px] font-mono text-slate-400">
                          {lead.status === 'new' && (
                            <button
                              onClick={() => handleStageChange(lead, 'contacted')}
                              className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-center"
                            >
                              Move to Contacted →
                            </button>
                          )}
                          {lead.status === 'contacted' && (
                            <button
                              onClick={() => handleStageChange(lead, 'interested')}
                              className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-center"
                            >
                              Move to Interested →
                            </button>
                          )}
                          {lead.status === 'interested' && (
                            <button
                              onClick={() => handleStageChange(lead, 'negotiation')}
                              className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 text-center"
                            >
                              Move to Negotiation →
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="nexus-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080c14] border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="p-3.5">Business & Contact</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Website Status</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Assigned Rep</th>
                  <th className="p-3.5">Follow-up</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{lead.businessName}</div>
                      <div className="text-[11px] text-slate-400">{lead.contactName} • {lead.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{lead.businessCategory}</td>
                    <td className="p-3.5">{getWebsiteStatusBadge(lead.websiteStatus)}</td>
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{lead.score}/100</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">{lead.assignedRepName}</td>
                    <td className="p-3.5 text-cyan-300 font-mono text-[11px]">{lead.followUpDate}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                        >
                          Edit
                        </button>
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => {
                              setConvertingLead(lead);
                              setConversionBudget(85000);
                            }}
                            className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold"
                          >
                            Convert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Convert Lead to Client & Project Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1527] border border-emerald-500/40 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Convert Lead to Active Client</span>
              </h2>
              <button onClick={() => setConvertingLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-300">
                Converting <strong>{convertingLead.businessName}</strong> ({convertingLead.contactName}) will:
              </p>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li>Create an official Client Profile in the CRM</li>
                <li>Launch a new Website Development Project in Planning stage</li>
                <li>Assign sales commission to <strong>{convertingLead.assignedRepName}</strong></li>
                <li>Update pipeline stage to Converted</li>
              </ul>

              <div className="mt-4 pt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-mono">Agreed Project Value (₹ INR) *</label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">{formatINR(conversionBudget)}</span>
                </div>
                <input
                  type="number"
                  value={conversionBudget}
                  onChange={(e) => setConversionBudget(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-400"
                />
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[45000, 85000, 150000, 250000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setConversionBudget(preset)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[10px] font-mono transition cursor-pointer"
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>50% Advance Milestone: <strong className="text-white">{formatINR(Math.round(conversionBudget * 0.5))}</strong></span>
                  <span className="text-emerald-400">Rep Comm (10%): <strong>{formatINR(Math.round(conversionBudget * 0.1))}</strong></span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConvertLead(convertingLead.id, conversionBudget);
                    setConvertingLead(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-500 transition shadow-lg cursor-pointer"
                >
                  Confirm Conversion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {(isCreating || editingLead) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>{editingLead ? 'Edit Lead Record' : 'Add New Prospect'}</span>
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingLead(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. AeroZen Aviation"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Capt. Arthur Vance"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Business Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Business Category</label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value as BusinessCategory })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Website Audit Status</label>
                  <select
                    value={formData.websiteStatus}
                    onChange={(e) => setFormData({ ...formData, websiteStatus: e.target.value as WebsiteStatus })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="no_website">No Website (Needs New Launch)</option>
                    <option value="outdated_website">Outdated Legacy Site</option>
                    <option value="redesign_needed">Redesign Needed</option>
                    <option value="ecommerce_upgrade">E-Commerce Upgrade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Lead Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as LeadPriority })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Lead Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Assigned Rep</label>
                  <select
                    value={formData.assignedRepId}
                    onChange={(e) => setFormData({ ...formData, assignedRepId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Potential Requirements & Opportunity Scope</label>
                <textarea
                  rows={2}
                  value={formData.potentialRequirements}
                  onChange={(e) => setFormData({ ...formData, potentialRequirements: e.target.value })}
                  placeholder="e.g. Modern landing page with charter quote calculator and mobile booking..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Research Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Meeting outcomes, client pain points, timeline..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingLead(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-md"
                >
                  {editingLead ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
