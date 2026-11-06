import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Edit2,
  Archive,
  ExternalLink,
  Briefcase,
  X,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Client, BusinessCategory, Project, Invoice } from '../types/nexus';
import { formatINR } from '../utils/format';

interface ClientsViewProps {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  onSaveClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onArchiveClient: (clientId: string) => void;
  onOpenNewInvoiceForClient: (clientId: string) => void;
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

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  projects,
  invoices,
  onSaveClient,
  onArchiveClient,
  onOpenNewInvoiceForClient,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProfileClient, setSelectedProfileClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    businessCategory: 'Corporate & Legal' as BusinessCategory,
    websiteRequirements: '',
    budget: 85000,
    status: 'active' as Client['status'],
    notes: '',
    followUpDate: '',
  });

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      businessName: client.businessName,
      email: client.email,
      phone: client.phone,
      businessCategory: client.businessCategory,
      websiteRequirements: client.websiteRequirements,
      budget: client.budget,
      status: client.status,
      notes: client.notes,
      followUpDate: client.followUpDate || '',
    });
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      businessName: '',
      email: '',
      phone: '',
      businessCategory: 'Corporate & Legal',
      websiteRequirements: '',
      budget: 85000,
      status: 'active',
      notes: '',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsCreating(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClient({
      ...(editingClient ? { id: editingClient.id } : {}),
      ...formData,
    });
    setIsCreating(false);
    setEditingClient(null);
  };

  // Filter logic
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || c.businessCategory === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Client Relationship Management (CRM)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain active enterprise accounts, project budgets, and communication history.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="nexus-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, businesses, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="in_negotiation">In Negotiation</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProjects = projects.filter((p) => p.clientId === client.id);
          const clientInvoices = invoices.filter((i) => i.clientId === client.id);
          const totalPaid = clientInvoices
            .filter((i) => i.status === 'paid')
            .reduce((sum, i) => sum + i.subtotal, 0);

          return (
            <div
              key={client.id}
              className={`nexus-card rounded-2xl p-5 border transition-all hover:border-cyan-500/40 flex flex-col justify-between ${
                client.status === 'archived' ? 'opacity-60 border-slate-800' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{client.businessName}</h3>
                    <div className="text-xs text-slate-300 mt-0.5">{client.name}</div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                      client.status === 'active'
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                        : client.status === 'in_negotiation'
                        ? 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                        : client.status === 'completed'
                        ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="mt-2 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-cyan-400" />
                  <span>{client.businessCategory}</span>
                </div>

                {/* Requirements / Notes Preview */}
                <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {client.websiteRequirements || client.notes || 'No project notes recorded.'}
                </p>

                {/* Contact info */}
                <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.followUpDate && (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Follow-up: {client.followUpDate}</span>
                    </div>
                  )}
                </div>

                {/* Budget & Payment summary */}
                <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">PROJECT BUDGET</span>
                    <div className="font-mono font-bold text-white">{formatINR(client.budget)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">SETTLED INVOICES</span>
                    <div className="font-mono font-bold text-emerald-400">{formatINR(totalPaid)}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProfileClient(client)}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                >
                  <span>Full Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
                    title="Edit Client"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {client.status !== 'archived' && (
                    <button
                      onClick={() => onArchiveClient(client.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                      title="Archive Client"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-16 nexus-card rounded-2xl border border-slate-800">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No clients match your filter criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or add a new client.</p>
        </div>
      )}

      {/* Create / Edit Client Modal */}
      {(isCreating || editingClient) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{editingClient ? 'Edit Client Record' : 'Register New Client'}</span>
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingClient(null);
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
                    placeholder="e.g. Lumina Clinic"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Primary Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@business.com"
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
                  <label className="block text-slate-400 mb-1 font-mono">Client Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Client['status'] })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="active">Active</option>
                    <option value="in_negotiation">In Negotiation</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Project Budget (₹ INR) *</label>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">{formatINR(formData.budget)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                  {/* Quick INR presets for ease of use */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {[35000, 65000, 125000, 250000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, budget: preset })}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono transition"
                      >
                        {formatINR(preset)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Website Requirements & Scope</label>
                <textarea
                  rows={3}
                  value={formData.websiteRequirements}
                  onChange={(e) => setFormData({ ...formData, websiteRequirements: e.target.value })}
                  placeholder="e.g. Next.js responsive website with 3D models, booking calendar and CRM integration"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Internal Operational Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Communication history, preferences, key stakeholders..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-md"
                >
                  {editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Full Profile Modal */}
      {selectedProfileClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedProfileClient.businessName}</h2>
                  <div className="text-xs text-slate-400">{selectedProfileClient.name} • {selectedProfileClient.businessCategory}</div>
                </div>
              </div>
              <button onClick={() => setSelectedProfileClient(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Linked Projects */}
              <div>
                <h3 className="font-semibold text-white mb-2 font-mono uppercase text-[11px] text-cyan-400">
                  Linked Website Projects
                </h3>
                {projects.filter((p) => p.clientId === selectedProfileClient.id).length === 0 ? (
                  <p className="text-slate-500 italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                    No active development projects linked to this client.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projects
                      .filter((p) => p.clientId === selectedProfileClient.id)
                      .map((p) => (
                        <div key={p.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Package: {p.packageSelected} • Due: {p.deadline}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            {p.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Invoices & Settlement History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white font-mono uppercase text-[11px] text-cyan-400">
                    Invoices & Payment Records
                  </h3>
                  <button
                    onClick={() => {
                      const cid = selectedProfileClient.id;
                      setSelectedProfileClient(null);
                      onOpenNewInvoiceForClient(cid);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    + Generate Invoice
                  </button>
                </div>

                {invoices.filter((i) => i.clientId === selectedProfileClient.id).length === 0 ? (
                  <p className="text-slate-500 italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                    No invoices prepared for this client yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {invoices
                      .filter((i) => i.clientId === selectedProfileClient.id)
                      .map((inv) => (
                        <div key={inv.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white font-mono">{inv.invoiceNumber}</div>
                            <div className="text-[10px] text-slate-400">Due: {inv.dueDate} • Balance: {formatINR(inv.balanceDue)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-white">{formatINR(inv.subtotal)}</div>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                  : 'bg-amber-950 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Requirements & Timeline */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Detailed Technical Brief</span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedProfileClient.websiteRequirements || 'No specific technical brief logged.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Communication & Relationship History</span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedProfileClient.notes || 'No notes on record.'}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedProfileClient(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
