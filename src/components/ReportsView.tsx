import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
  Calendar,
  Building,
  Target,
  DollarSign,
  PieChart,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { BusinessSummary, Project, Transaction, UserProfile, Client, Lead, Invoice } from '../types/nexus';
import { formatINR, formatINRLakh } from '../utils/format';

interface ReportsViewProps {
  summary: BusinessSummary;
  projects: Project[];
  transactions: Transaction[];
  users: UserProfile[];
  clients: Client[];
  leads: Lead[];
  invoices: Invoice[];
  currentUser: UserProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  projects,
  transactions,
  users,
  clients,
  leads,
  invoices,
  currentUser,
}) => {
  const isFounder = currentUser.role === 'FOUNDER';

  // Calculate metrics
  const totalReceivedRevenue = summary.monthlyRevenue;
  const totalExpenses = summary.totalExpenses;
  const netProfit = summary.netProfit;
  const pendingReceivables = summary.pendingPayments;
  const totalContractedValue = projects.reduce((sum, p) => sum + p.projectPrice, 0);
  const avgDealSize = projects.length > 0 ? Math.round(totalContractedValue / projects.length) : 0;

  // Converted leads rate
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Package distribution breakdown
  const packageStats: Record<string, { count: number; totalRevenue: number }> = {};
  projects.forEach((p) => {
    if (!packageStats[p.packageSelected]) {
      packageStats[p.packageSelected] = { count: 0, totalRevenue: 0 };
    }
    packageStats[p.packageSelected].count += 1;
    packageStats[p.packageSelected].totalRevenue += p.projectPrice;
  });

  // Recent 6 months sample chart data
  const monthlyData = [
    { month: 'Jun', rev: 45000, exp: 8000 },
    { month: 'Jul', rev: 68000, exp: 12000 },
    { month: 'Aug', rev: 95000, exp: 18000 },
    { month: 'Sep', rev: 140000, exp: 24000 },
    { month: 'Oct', rev: 185000, exp: 29000 },
    { month: 'Nov (Live)', rev: summary.monthlyRevenue || 126000, exp: summary.totalExpenses || 28000 },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.rev, d.exp)), 200000);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Business Performance & Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Executive financial summaries, project profitability, lead conversion velocity, and agency reports.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Primary KPI Highlight Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="nexus-card rounded-2xl p-4 border border-emerald-500/30">
          <span className="text-[10px] font-mono text-emerald-300 uppercase">Received Revenue</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{formatINR(totalReceivedRevenue)}</div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{formatINRLakh(totalReceivedRevenue)}</span>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-rose-500/30">
          <span className="text-[10px] font-mono text-rose-300 uppercase">Operating Expenses</span>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{formatINR(totalExpenses)}</div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{formatINRLakh(totalExpenses)}</span>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-cyan-500/30">
          <span className="text-[10px] font-mono text-cyan-300 uppercase">Net Profit Margin</span>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{summary.profitMarginPercent}%</div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Net: {formatINR(netProfit)}</span>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-amber-500/30">
          <span className="text-[10px] font-mono text-amber-300 uppercase">Pending Invoices</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{formatINR(pendingReceivables)}</div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Awaiting client clearance</span>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-blue-500/30">
          <span className="text-[10px] font-mono text-blue-300 uppercase">Avg Deal Value</span>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">{formatINR(avgDealSize)}</div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Across {projects.length} website builds</span>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-purple-500/30">
          <span className="text-[10px] font-mono text-purple-300 uppercase">Lead Conversion</span>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{conversionRate}%</div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{convertedLeads} won of {totalLeads}</span>
        </div>
      </div>

      {/* Revenue vs Expense Trend Chart */}
      <div className="nexus-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Monthly Cash Inflow vs Outflow Trend</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified incoming client settlements versus hosting and operational expenses.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Revenue (In)</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Expenses (Out)</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 h-56 pt-6 border-b border-slate-800 items-end px-2">
          {monthlyData.map((d, i) => {
            const revHeight = Math.max(12, Math.round((d.rev / maxVal) * 160));
            const expHeight = Math.max(8, Math.round((d.exp / maxVal) * 160));

            return (
              <div key={i} className="flex flex-col items-center justify-end h-full group">
                <div className="flex items-end gap-1 sm:gap-2 w-full justify-center">
                  {/* Revenue Bar */}
                  <div
                    style={{ height: `${revHeight}px` }}
                    className="w-4 sm:w-8 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all hover:brightness-110 relative"
                    title={`Revenue: ${formatINR(d.rev)}`}
                  />
                  {/* Expense Bar */}
                  <div
                    style={{ height: `${expHeight}px` }}
                    className="w-4 sm:w-8 rounded-t bg-gradient-to-t from-rose-600 to-rose-400 transition-all hover:brightness-110 relative"
                    title={`Expense: ${formatINR(d.exp)}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-3 truncate">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Analysis: Package Breakdown & Sales Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Package Revenue Share */}
        <div className="nexus-card rounded-2xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <span>Website Packages Sales Distribution</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(packageStats).map(([pkg, stat]) => {
              const percent = totalContractedValue > 0 ? Math.round((stat.totalRevenue / totalContractedValue) * 100) : 0;
              return (
                <div key={pkg} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{pkg}</span>
                    <span className="font-mono text-cyan-400 font-bold">{formatINR(stat.totalRevenue)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{stat.count} projects delivered or active</span>
                    <span>{percent}% of total sales</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="nexus-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Team Productivity & Deal Velocity</span>
            </h3>

            <div className="space-y-3">
              {users.map((member) => {
                const assignedProjects = projects.filter((p) => p.assignedMemberIds.includes(member.id));
                const handledLeads = leads.filter((l) => l.assignedRepId === member.id);

                return (
                  <div key={member.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-cyan-500/30" />
                      <div>
                        <div className="font-bold text-white text-xs">{member.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{member.role.replace('_', ' ')}</div>
                      </div>
                    </div>

                    <div className="text-right text-xs font-mono">
                      <div className="text-cyan-300 font-bold">{assignedProjects.length} Projects</div>
                      <div className="text-[10px] text-slate-400">{handledLeads.length} Leads Handled</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Orbits Studio Intelligence Operating System</span>
            <span className="font-mono text-cyan-400">Total Pipeline: {formatINR(totalContractedValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
