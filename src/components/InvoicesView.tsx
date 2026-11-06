import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send,
  X,
  Trash2,
  Building,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Invoice, InvoiceItem, Client, Project, UserProfile } from '../types/nexus';
import { formatINR } from '../utils/format';

interface InvoicesViewProps {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  currentUser: UserProfile;
  onSaveInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'> & { id?: string }) => void;
  onMarkInvoicePaid: (invoiceId: string, paymentMethod?: string) => void;
  onQueueForApproval: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  clients,
  projects,
  currentUser,
  onSaveInvoice,
  onMarkInvoicePaid,
  onQueueForApproval,
}) => {
  const isFounder = currentUser.role === 'FOUNDER';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Create / Edit Modal
  const [isCreating, setIsCreating] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-0${invoices.length + 86}`);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [notes, setNotes] = useState('Payment terms: Net 14 days. Settle via UPI (orbitsstudio@okhdfcbank) or NEFT/IMPS to Orbits Studio.');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Corporate Website Platform Architecture & UI/UX Development',
      quantity: 1,
      unitPrice: 42500,
      total: 42500,
    },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: 'Responsive Component System & API Integration',
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'unitPrice', value: any) => {
    setItems(
      items.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (parseFloat(updated.quantity as any) || 0) * (parseFloat(updated.unitPrice as any) || 0);
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;
  const balanceDue = Math.max(0, totalAmount - advancePaid);

  const handleOpenCreate = () => {
    setEditingInvoice(null);
    setInvoiceNumber(`INV-2026-0${invoices.length + 86}`);
    setSelectedClientId(clients[0]?.id || '');
    setSelectedProjectId(projects[0]?.id || '');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setTaxRate(0);
    setDiscountAmount(0);
    setAdvancePaid(0);
    setNotes('Payment terms: Net 14 days. Settle via UPI (orbitsstudio@okhdfcbank) or NEFT/IMPS to Orbits Studio.');
    setItems([
      {
        id: 'item-1',
        description: 'Corporate Website Platform Architecture & Development',
        quantity: 1,
        unitPrice: 42500,
        total: 42500,
      },
    ]);
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    const project = projects.find((p) => p.id === selectedProjectId);

    onSaveInvoice({
      ...(editingInvoice ? { id: editingInvoice.id } : {}),
      invoiceNumber,
      clientId: selectedClientId,
      clientName: client?.name || 'Client',
      clientBusiness: client?.businessName || 'Business',
      clientEmail: client?.email || 'client@example.com',
      projectId: selectedProjectId || undefined,
      projectName: project?.name,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      advancePaid,
      balanceDue,
      status: editingInvoice ? editingInvoice.status : 'pending',
      issueDate,
      dueDate,
      approvedByFounder: isFounder,
      notes,
    });

    setIsCreating(false);
    setEditingInvoice(null);
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.clientBusiness.toLowerCase().includes(search.toLowerCase()) ||
      i.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Quotations & Invoicing System</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bespoke Orbit Studio branded invoice generator, balance settlement, and PDF export.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Prepare Invoice / Quote</span>
        </button>
      </div>

      {/* Filter Matrix */}
      <div className="nexus-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              statusFilter === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Invoices
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              statusFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Pending Balance
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              statusFilter === 'paid'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Paid & Settled
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="nexus-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#080c14] border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Client & Project</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Balance Due</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5 font-mono font-bold text-cyan-400">{inv.invoiceNumber}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{inv.clientBusiness}</div>
                    <div className="text-[11px] text-slate-400">{inv.clientName}</div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{inv.issueDate}</td>
                  <td className="p-3.5 font-mono text-slate-300">{inv.dueDate}</td>
                  <td className="p-3.5 font-mono font-bold text-white">{formatINR(inv.subtotal)}</td>
                  <td className="p-3.5 font-mono font-bold text-amber-400">
                    {formatINR(inv.balanceDue)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : inv.status === 'overdue'
                          ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                        title="Preview & Export"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {inv.status !== 'paid' && isFounder && (
                        <button
                          onClick={() => onMarkInvoicePaid(inv.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 font-semibold cursor-pointer text-[10px]"
                          title="Record Client Payment"
                        >
                          Mark Paid
                        </button>
                      )}

                      {!inv.approvedByFounder && (
                        <button
                          onClick={() => onQueueForApproval(inv)}
                          className="px-2 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/30 font-semibold cursor-pointer text-[10px]"
                          title="Request Founder Approval to Send"
                        >
                          Queue
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

      {/* Invoice Generator / Editor Modal */}
      {(isCreating || editingInvoice) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Prepare Invoice / Commercial Quotation</span>
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingInvoice(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Recipient Client *</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Linked Project (Optional)</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="">None / Standalone</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-cyan-400 uppercase text-[11px] font-semibold">
                    Service Line Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Service description..."
                          className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          placeholder="Price"
                          className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Calculation */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white font-bold">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Advance Received (₹):</span>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                    className="w-32 p-1 rounded bg-slate-950 border border-slate-700 text-white text-right"
                  />
                </div>
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                  <span className="text-cyan-400">Balance Due:</span>
                  <span className="text-cyan-400">{formatINR(balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Invoice Notes & Wire Settlement Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingInvoice(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Full Visual Preview & Print Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white text-slate-900 p-8 shadow-2xl my-8 relative">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Orbit Studio Invoice Document */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-cyan-400 font-bold font-mono">
                      Ø
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-950 font-mono">ORBITS STUDIO</h2>
                      <span className="text-[10px] font-mono tracking-wider text-cyan-600 uppercase">
                        Orbit Studio Intelligence
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-mono">
                    Website Development & Digital Architecture<br />
                    hello@orbitsstudio.com • orbitsstudio.com
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-mono font-extrabold text-slate-900">
                    {previewInvoice.status === 'draft' ? 'COMMERCIAL QUOTATION' : 'INVOICE'}
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-700 mt-1">
                    {previewInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Issue Date: {previewInvoice.issueDate}<br />
                    Due Date: {previewInvoice.dueDate}
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  BILLED TO:
                </span>
                <div className="font-bold text-gray-900 text-sm">{previewInvoice.clientBusiness}</div>
                <div className="text-xs text-gray-600">{previewInvoice.clientName}</div>
                <div className="text-xs text-gray-600 font-mono">{previewInvoice.clientEmail}</div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 text-[10px] font-mono uppercase text-gray-600">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewInvoice.items.map((i) => (
                    <tr key={i.id}>
                      <td className="p-3 font-medium text-gray-900">{i.description}</td>
                      <td className="p-3 text-center font-mono">{i.quantity}</td>
                      <td className="p-3 text-right font-mono">{formatINR(i.unitPrice)}</td>
                      <td className="p-3 text-right font-mono font-semibold">{formatINR(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatINR(previewInvoice.subtotal)}</span>
                  </div>
                  {previewInvoice.advancePaid > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Advance Received:</span>
                      <span>-{formatINR(previewInvoice.advancePaid)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-sm pt-2 border-t border-gray-300">
                    <span>Balance Due:</span>
                    <span className="text-cyan-700">{formatINR(previewInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Indian Banking & UPI Details */}
              <div className="pt-4 border-t border-gray-200 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-bold text-gray-900 mb-1 font-mono uppercase text-[10px]">
                    Bank Wire Details (NEFT / IMPS / RTGS)
                  </div>
                  <div className="font-mono text-[11px] space-y-0.5">
                    <div>Beneficiary: <strong className="text-gray-900">Orbits Studio LLP</strong></div>
                    <div>Bank: <strong className="text-gray-900">HDFC Bank Ltd.</strong></div>
                    <div>Account No: <strong className="text-gray-900">50200084729102</strong></div>
                    <div>IFSC Code: <strong className="text-gray-900">HDFC0001234</strong></div>
                    <div>Branch: Cyber City, Gurugram</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200">
                  <div className="font-bold text-cyan-950 mb-1 font-mono uppercase text-[10px]">
                    Instant UPI Transfer
                  </div>
                  <div className="font-mono text-[11px] space-y-0.5 text-cyan-900">
                    <div>VPA / UPI ID: <strong className="text-cyan-950">orbitsstudio@okhdfcbank</strong></div>
                    <div>Accepted Apps: Google Pay, PhonePe, Paytm, BHIM</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {previewInvoice.notes || 'Please share transaction screenshot after settlement.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
