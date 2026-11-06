import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  Transaction,
  CommissionRecord,
  UserProfile,
  Project,
  BusinessSummary,
  UserRole,
} from '../types/nexus';
import { formatINR } from '../utils/format';

interface FinancesViewProps {
  transactions: Transaction[];
  commissions: CommissionRecord[];
  projects: Project[];
  users: UserProfile[];
  summary: BusinessSummary;
  currentUser: UserProfile;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdateCommissionRate: (userId: string, rate: number) => void;
  onPayCommission: (commId: string) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  transactions,
  commissions,
  projects,
  users,
  summary,
  currentUser,
  onAddTransaction,
  onUpdateCommissionRate,
  onPayCommission,
}) => {
  const isFounder = currentUser.role === 'FOUNDER';
  const isPartner = currentUser.role === 'BUSINESS_PARTNER';
  const isSales = currentUser.role === 'SALES_REPRESENTATIVE';

  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'commissions' | 'projects'>('overview');
  const [isAddingTx, setIsAddingTx] = useState(false);

  // Form State for new transaction
  const [txFormData, setTxFormData] = useState({
    type: 'expense' as Transaction['type'],
    category: 'software_tools' as Transaction['category'],
    amount: 2500,
    description: '',
    paymentMethod: 'UPI / Corporate Net Banking',
    date: new Date().toISOString().split('T')[0],
  });

  // Commission rate edit state
  const [editingRates, setEditingRates] = useState<Record<string, number>>({});

  const handleRateChange = (userId: string, val: number) => {
    setEditingRates({ ...editingRates, [userId]: val });
  };

  const handleSaveRate = (userId: string) => {
    const rate = editingRates[userId];
    if (rate !== undefined && !isNaN(rate)) {
      onUpdateCommissionRate(userId, rate);
      const copy = { ...editingRates };
      delete copy[userId];
      setEditingRates(copy);
    }
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      ...txFormData,
      recordedByName: currentUser.name,
    });
    setIsAddingTx(false);
    setTxFormData({
      type: 'expense',
      category: 'software_tools',
      amount: 2500,
      description: '',
      paymentMethod: 'UPI / Corporate Net Banking',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // If user is sales rep, filter commissions to only their own
  const visibleCommissions = isSales
    ? commissions.filter((c) => c.salesRepId === currentUser.id)
    : commissions;

  const totalCommissionsEarned = visibleCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidCommissions = visibleCommissions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0);
  const pendingCommissions = visibleCommissions.filter((c) => c.status === 'pending_clearance').reduce((sum, c) => sum + c.commissionAmount, 0);

  // If Sales Rep, show restricted personal finance view
  if (isSales) {
    return (
      <div className="space-y-6 pb-20 lg:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <span>Sales Commission & Earnings Portal</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Personal sales record, deal commissions, and clearance status for {currentUser.name}.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono">
            Company Ledger Restricted (Sales Clearance)
          </div>
        </div>

        {/* Sales Rep Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="nexus-card rounded-2xl p-5 border border-emerald-500/30">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Earned</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {formatINR(totalCommissionsEarned)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Across all converted website deals</p>
          </div>

          <div className="nexus-card rounded-2xl p-5 border border-cyan-500/30">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Paid Out (Direct Deposit)</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {formatINR(paidCommissions)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Settled to your personal account via IMPS/NEFT</p>
          </div>

          <div className="nexus-card rounded-2xl p-5 border border-amber-500/30">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Pending Milestone Clearance</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {formatINR(pendingCommissions)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Clears upon client advance receipt</p>
          </div>
        </div>

        {/* Commission Table */}
        <div className="nexus-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Personal Commission Ledger</h3>
            <span className="text-xs font-mono text-cyan-400">Commission Rate: {currentUser.commissionRate}%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080c14] border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="p-3.5">Project Name</th>
                  <th className="p-3.5">Deal Value</th>
                  <th className="p-3.5">Commission Rate</th>
                  <th className="p-3.5">Your Payout</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Payout Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {visibleCommissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-semibold text-white">{comm.projectName}</td>
                    <td className="p-3.5 font-mono">{formatINR(comm.dealValue)}</td>
                    <td className="p-3.5 font-mono">{comm.commissionRate}%</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {formatINR(comm.commissionAmount)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                          comm.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {comm.status === 'paid' ? 'Paid' : 'Pending Clearance'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{comm.payoutDate || 'Awaiting Final Advance'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Founder & Partner Full View
  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-cyan-400" />
            <span>Financial Command & P&L Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time cash flow verification, project profitability, commissions, and expense ledger.
          </p>
        </div>

        {isFounder && (
          <button
            onClick={() => setIsAddingTx(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        )}
      </div>

      {/* Strict Accounting Rule Notice */}
      <div className="p-3 rounded-xl bg-[#0c1527] border border-cyan-500/20 flex items-start gap-2.5 text-xs text-slate-300">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-cyan-300">NEXUS Accounting Discipline:</strong> Projected pipeline revenue is strictly separated from verified cash income. Income figures reflect only funds settled into Orbits Studio bank accounts.
        </p>
      </div>

      {/* 4 Financial Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nexus-card rounded-2xl p-5 border border-emerald-500/30">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Received Revenue</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatINR(summary.monthlyRevenue)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Verified cash advances & final settlements</p>
        </div>

        <div className="nexus-card rounded-2xl p-5 border border-rose-500/30">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Operating Expenses</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {formatINR(summary.totalExpenses)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Hosting, software, 3D assets & payouts</p>
        </div>

        <div className="nexus-card rounded-2xl p-5 border border-cyan-500/30">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Net Realized Profit</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            {formatINR(summary.netProfit)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Profit margin: {summary.profitMarginPercent}%</p>
        </div>

        <div className="nexus-card rounded-2xl p-5 border border-amber-500/30">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Pending Invoiced Balance</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {formatINR(summary.pendingPayments)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting delivery milestone signoffs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          P&L Overview & Profitability
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'ledger'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Transaction Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'commissions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Team Commissions Matrix
        </button>
      </div>

      {/* TAB 1: P&L Overview & Project Profitability */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="nexus-card rounded-2xl p-5 border border-slate-800">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Project-Wise Realized Profitability Breakdown</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080c14] border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Project & Client</th>
                    <th className="p-3">Contract Price</th>
                    <th className="p-3">Advance Received</th>
                    <th className="p-3">Direct Expenses</th>
                    <th className="p-3">Commissions</th>
                    <th className="p-3">Net Profit Contribution</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {projects.map((p) => {
                    // Calculate expenses tagged to this project
                    const directExpenses = transactions
                      .filter((tx) => tx.type === 'expense' && tx.relatedProjectId === p.id)
                      .reduce((sum, tx) => sum + tx.amount, 0);

                    const comms = commissions
                      .filter((c) => c.projectId === p.id)
                      .reduce((sum, c) => sum + c.commissionAmount, 0);

                    const realizedNet = p.advancePayment - directExpenses - comms;

                    return (
                      <tr key={p.id} className="hover:bg-slate-900/40">
                        <td className="p-3">
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.clientBusiness}</div>
                        </td>
                        <td className="p-3 font-mono">{formatINR(p.projectPrice)}</td>
                        <td className="p-3 font-mono text-emerald-400">{formatINR(p.advancePayment)}</td>
                        <td className="p-3 font-mono text-rose-400">{formatINR(directExpenses)}</td>
                        <td className="p-3 font-mono text-amber-400">{formatINR(comms)}</td>
                        <td className="p-3 font-mono font-bold text-cyan-300">
                          {formatINR(realizedNet)}
                        </td>
                        <td className="p-3">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Transaction Ledger */}
      {activeTab === 'ledger' && (
        <div className="nexus-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Audited Financial Transactions</h3>
            <span className="text-xs font-mono text-slate-400">Recorded By Authenticated Officers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080c14] border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-mono text-slate-400">{tx.date}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          tx.type === 'income'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300 capitalize">{tx.category.replace('_', ' ')}</td>
                    <td className="p-3.5 text-white">{tx.description}</td>
                    <td className={`p-3.5 font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{tx.paymentMethod}</td>
                    <td className="p-3.5 text-cyan-300 font-mono">{tx.recordedByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Team Commissions & Rate Management */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {/* Rate Configuration (Founder Only) */}
          <div className="nexus-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-cyan-400" />
                  <span>Configurable Sales Commission Rates</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isFounder
                    ? 'Founder authorization active: You can adjust individual deal commissions.'
                    : 'Commission percentages configured by Founder Alex Vance.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {users.map((u) => (
                <div key={u.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-cyan-500/30" />
                    <div>
                      <div className="font-bold text-white text-xs">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.role}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Commission Percentage</span>
                    {isFounder ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          defaultValue={u.commissionRate}
                          onChange={(e) => handleRateChange(u.id, parseFloat(e.target.value) || 0)}
                          className="w-20 p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs text-center"
                        />
                        <span className="text-xs text-slate-400 font-mono">%</span>
                        {editingRates[u.id] !== undefined && (
                          <button
                            onClick={() => handleSaveRate(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">{u.commissionRate}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commissions Records */}
          <div className="nexus-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Deal Commission Payout Records</h3>
              <span className="text-xs font-mono text-emerald-400">Total: {formatINR(commissions.reduce((s, c) => s + c.commissionAmount, 0))}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080c14] border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                  <tr>
                    <th className="p-3.5">Representative</th>
                    <th className="p-3.5">Project</th>
                    <th className="p-3.5">Deal Value</th>
                    <th className="p-3.5">Rate</th>
                    <th className="p-3.5">Commission Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5 font-semibold text-white">{comm.salesRepName}</td>
                      <td className="p-3.5 text-slate-300">{comm.projectName}</td>
                      <td className="p-3.5 font-mono">{formatINR(comm.dealValue)}</td>
                      <td className="p-3.5 font-mono">{comm.commissionRate}%</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {formatINR(comm.commissionAmount)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                            comm.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {comm.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isFounder && comm.status !== 'paid' && (
                          <button
                            onClick={() => onPayCommission(comm.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 font-semibold cursor-pointer"
                          >
                            Disburse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      {isAddingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span>Record Financial Transaction</span>
              </h2>
              <button onClick={() => setIsAddingTx(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Type</label>
                  <select
                    value={txFormData.type}
                    onChange={(e) => setTxFormData({ ...txFormData, type: e.target.value as Transaction['type'] })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="expense">Expense (Outgoing)</option>
                    <option value="income">Income (Incoming)</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Amount (₹ INR) *</label>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">{formatINR(txFormData.amount)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={txFormData.amount}
                    onChange={(e) => setTxFormData({ ...txFormData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                  {/* Quick expense presets */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {[
                      { label: 'Domain', val: 1200 },
                      { label: 'Hosting', val: 2400 },
                      { label: 'Software', val: 4500 },
                      { label: 'Contractor', val: 15000 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setTxFormData({ ...txFormData, amount: p.val })}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono transition"
                      >
                        {p.label}: {formatINR(p.val)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Accounting Category</label>
                <select
                  value={txFormData.category}
                  onChange={(e) => setTxFormData({ ...txFormData, category: e.target.value as Transaction['category'] })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="software_tools">Software & Subscriptions (Figma, GitHub, Supabase)</option>
                  <option value="hosting_infrastructure">Hosting & Servers (Hostinger, Cloud Run)</option>
                  <option value="contractor_payout">Freelance / Contractor Payout</option>
                  <option value="client_advance">Client Advance Payment</option>
                  <option value="client_final_payment">Client Final Settlement</option>
                  <option value="sales_commission">Sales Commission</option>
                  <option value="marketing_ads">Marketing & Outreach</option>
                  <option value="office_equipment">Hardware & Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Description *</label>
                <input
                  type="text"
                  required
                  value={txFormData.description}
                  onChange={(e) => setTxFormData({ ...txFormData, description: e.target.value })}
                  placeholder="e.g. Hostinger Web Hosting & CDN Renewal"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Payment Method</label>
                  <input
                    type="text"
                    value={txFormData.paymentMethod}
                    onChange={(e) => setTxFormData({ ...txFormData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Transaction Date</label>
                  <input
                    type="date"
                    value={txFormData.date}
                    onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTx(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
