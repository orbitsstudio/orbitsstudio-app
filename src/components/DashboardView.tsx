import React, { useState } from 'react';
import {
  Users,
  FolderKanban,
  DollarSign,
  TrendingUp,
  CreditCard,
  Target,
  CheckSquare,
  ShieldAlert,
  Calendar,
  Sparkles,
  Clock,
  ChevronRight,
  PlusCircle,
  FilePlus,
  Zap,
  Info,
  CheckCircle2,
  X,
  IndianRupee,
  HelpCircle,
} from 'lucide-react';
import {
  BusinessSummary,
  Project,
  Appointment,
  ActivityLog,
  UserProfile,
} from '../types/nexus';
import { ActiveTab } from './Navigation';
import { formatINR, formatINRLakh } from '../utils/format';

interface DashboardViewProps {
  summary: BusinessSummary;
  projects: Project[];
  appointments: Appointment[];
  activityLogs: ActivityLog[];
  currentUser: UserProfile;
  users: UserProfile[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAI: () => void;
  onNewLead: () => void;
  onNewClient: () => void;
  onNewInvoice: () => void;
  onNewProject?: () => void;
  onNewTask?: () => void;
  onOpenQuickAction?: () => void;
  onScheduleAppointment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  projects,
  appointments,
  activityLogs,
  currentUser,
  users,
  onNavigate,
  onOpenAI,
  onNewLead,
  onNewClient,
  onNewInvoice,
  onNewProject,
  onNewTask,
  onOpenQuickAction,
  onScheduleAppointment,
}) => {
  const isFounder = currentUser.role === 'FOUNDER';
  const isPartner = currentUser.role === 'BUSINESS_PARTNER';
  const canViewFinances = isFounder || isPartner;
  const [showQuickGuide, setShowQuickGuide] = useState(true);

  // Real KPI cards with INR (₹) formatting and simple beginner explanations
  const kpiCards = [
    {
      title: 'Active Clients',
      value: summary.totalClients.toString(),
      sub: 'Total ongoing client accounts',
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50',
      actionTab: 'clients' as ActiveTab,
    },
    {
      title: 'Website Projects',
      value: summary.activeProjects.toString(),
      sub: 'Websites currently in design/dev',
      icon: FolderKanban,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
      actionTab: 'projects' as ActiveTab,
    },
    {
      title: 'Monthly Cash In (₹)',
      value: canViewFinances ? formatINR(summary.monthlyRevenue) : 'Confidential',
      sub: canViewFinances ? 'Verified bank deposits this month' : 'Founder / Partner access only',
      icon: IndianRupee,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
      actionTab: 'finances' as ActiveTab,
    },
    {
      title: 'Total Expenses (₹)',
      value: canViewFinances ? formatINR(summary.totalExpenses) : 'Confidential',
      sub: canViewFinances ? 'Hosting, tools & designer payouts' : 'Restricted accounting record',
      icon: TrendingUp,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50',
      actionTab: 'finances' as ActiveTab,
    },
    {
      title: 'Net Profit (₹)',
      value: canViewFinances ? formatINR(summary.netProfit) : 'Confidential',
      sub: canViewFinances ? `${summary.profitMarginPercent}% realized profit margin` : 'Restricted accounting record',
      icon: DollarSign,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50',
      actionTab: 'finances' as ActiveTab,
    },
    {
      title: 'Pending Client Due (₹)',
      value: canViewFinances ? formatINR(summary.pendingPayments) : '₹—',
      sub: 'Unpaid milestone balances on invoices',
      icon: CreditCard,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50',
      actionTab: 'invoices' as ActiveTab,
    },
    {
      title: 'New Inquiries & Leads',
      value: summary.newLeads.toString(),
      sub: 'Prospects ready for follow-up',
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50',
      actionTab: 'leads' as ActiveTab,
    },
    {
      title: 'Pending Sprint Tasks',
      value: summary.pendingTasks.toString(),
      sub: 'Milestones remaining across projects',
      icon: CheckSquare,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/20 hover:border-sky-500/50',
      actionTab: 'projects' as ActiveTab,
    },
    {
      title: 'Founder Approvals',
      value: summary.pendingApprovals.toString(),
      sub: summary.pendingApprovals > 0 ? 'Messages & bills awaiting sign-off' : 'All clear. No pending items',
      icon: ShieldAlert,
      color: summary.pendingApprovals > 0 ? 'text-amber-400' : 'text-slate-400',
      bgColor: summary.pendingApprovals > 0 ? 'bg-amber-500/15 border-amber-500/40' : 'bg-slate-900 border-slate-800',
      actionTab: 'approvals' as ActiveTab,
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Easy Start Guide Banner (Dismissible) */}
      {showQuickGuide && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c1c38] to-[#09152b] border border-cyan-500/30 shadow-lg relative">
          <button
            onClick={() => setShowQuickGuide(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
            title="Dismiss Guide"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Quick Easy Guide: Running Orbits Studio in INR (₹)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                NEXUS gives you 3 simple steps to manage your website development agency smoothly:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
                <div
                  onClick={() => onNavigate('leads')}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition"
                >
                  <span className="font-mono text-cyan-400 font-bold block mb-0.5">1. Leads & Prospects</span>
                  <span className="text-slate-300 text-[11px]">Add inquiries, track follow-ups, and convert to clients with 1-click.</span>
                </div>
                <div
                  onClick={() => onNavigate('projects')}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition"
                >
                  <span className="font-mono text-purple-400 font-bold block mb-0.5">2. Website Sprints</span>
                  <span className="text-slate-300 text-[11px]">Check off milestones from Design to DNS launch on Hostinger.</span>
                </div>
                <div
                  onClick={() => onNavigate('invoices')}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition"
                >
                  <span className="font-mono text-emerald-400 font-bold block mb-0.5">3. Invoices in ₹ (INR)</span>
                  <span className="text-slate-300 text-[11px]">Generate clean invoices with UPI/Bank details and print/export PDF.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome & Fast Quick Actions */}
      <div className="nexus-card rounded-2xl p-4 sm:p-6 border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                ● System Ready • Operating Currency: Indian Rupee (₹)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">
              Namaste, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Orbits Studio website operations command center. Everything you need in one place.
            </p>
          </div>

          {/* Quick Action Matrix (Big & Easy Touch Buttons) */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenQuickAction && (
              <button
                onClick={onOpenQuickAction}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-slate-950" />
                <span>+ Quick Action</span>
              </button>
            )}
            <button
              onClick={onNewClient}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500/60 text-slate-100 text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Client</span>
            </button>
            <button
              onClick={onNewProject || (() => onNavigate('projects'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-blue-500/60 text-slate-100 text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Project</span>
            </button>
            <button
              onClick={onNewInvoice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500/60 text-slate-100 text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Bill (₹)</span>
            </button>
            <button
              onClick={onNewTask || (() => onNavigate('tasks'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-teal-500/60 text-slate-100 text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
              <span>+ Task</span>
            </button>
            <button
              onClick={onNewLead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/60 text-slate-100 text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Lead</span>
            </button>
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid (8 Key Metrics in INR) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(kpi.actionTab)}
              className={`nexus-card rounded-2xl p-4 border transition-all cursor-pointer hover:scale-[1.01] ${kpi.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {kpi.value}
              </div>
              <p className="mt-1 text-[10px] text-slate-400 truncate">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Financial Flow Chart & Active Projects Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Flow / Revenue Chart (in INR) */}
        <div className="lg:col-span-2 nexus-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Financial Flow & Cash Profitability (in ₹ INR)</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Verified received payments vs actual operating expenses. Real bank records only.
              </p>
            </div>
            <button
              onClick={() => onNavigate('finances')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <span>View Full Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {canViewFinances ? (
            <div className="space-y-4">
              {/* Visual SVG Bar Comparison in INR */}
              <div className="h-44 w-full bg-[#080c14]/70 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-end">
                <div className="flex items-end justify-around h-32 gap-6 pt-4">
                  {/* Income Bar */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[95px]">
                    <div className="text-[11px] font-mono text-emerald-400 font-semibold truncate">
                      {formatINR(summary.monthlyRevenue)}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 shadow-lg shadow-emerald-950"
                      style={{
                        height: `${Math.min(
                          100,
                          Math.max(25, (summary.monthlyRevenue / Math.max(summary.monthlyRevenue + summary.totalExpenses, 1)) * 110)
                        )}%`,
                      }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">Total Income</span>
                  </div>

                  {/* Expense Bar */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[95px]">
                    <div className="text-[11px] font-mono text-rose-400 font-semibold truncate">
                      {formatINR(summary.totalExpenses)}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 shadow-lg shadow-rose-950"
                      style={{
                        height: `${Math.min(
                          100,
                          Math.max(15, (summary.totalExpenses / Math.max(summary.monthlyRevenue + summary.totalExpenses, 1)) * 110)
                        )}%`,
                      }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">Total Expenses</span>
                  </div>

                  {/* Net Profit Bar */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[95px]">
                    <div className="text-[11px] font-mono text-cyan-400 font-semibold truncate">
                      {formatINR(summary.netProfit)}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all duration-500 shadow-lg shadow-cyan-950"
                      style={{
                        height: `${Math.min(
                          100,
                          Math.max(20, (summary.netProfit / Math.max(summary.monthlyRevenue, 1)) * 95)
                        )}%`,
                      }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">Net Profit</span>
                  </div>

                  {/* Pending Invoices Bar */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[95px]">
                    <div className="text-[11px] font-mono text-amber-400 font-semibold truncate">
                      {formatINR(summary.pendingPayments)}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-amber-600/80 to-amber-400/80 rounded-t-md border border-dashed border-amber-300 transition-all duration-500"
                      style={{
                        height: `${Math.min(
                          100,
                          Math.max(15, (summary.pendingPayments / Math.max(summary.monthlyRevenue, 1)) * 95)
                        )}%`,
                      }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">Pending Due</span>
                  </div>
                </div>
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Net Profit Margin</span>
                  <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                    {summary.profitMarginPercent}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Cash Multiple</span>
                  <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                    {(summary.monthlyRevenue / Math.max(summary.totalExpenses, 1)).toFixed(1)}x
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Contract Value</span>
                  <div className="text-lg font-bold font-mono text-purple-300 mt-0.5">
                    {formatINR(projects.reduce((acc, p) => acc + p.projectPrice, 0))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800/60 text-center p-4">
              <ShieldAlert className="w-8 h-8 text-amber-400 mb-2" />
              <div className="text-xs font-semibold text-white">Financial Details Protected</div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Under NEXUS Role-Based Access Control, company ledger totals are restricted to Founder & Business Partner accounts.
              </p>
            </div>
          )}
        </div>

        {/* Project Pipeline & Progress Tracker */}
        <div className="nexus-card rounded-2xl p-5 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              <span>Website Deliverables</span>
            </h2>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <span>View All ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[310px] pr-1">
            {projects.slice(0, 4).map((p) => {
              const completedTasks = p.progressChecklist.filter((c) => c.completed).length;
              const totalTasks = p.progressChecklist.length;
              const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => onNavigate('projects')}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.clientBusiness}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase shrink-0">
                      {p.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Milestones: {completedTasks}/{totalTasks}</span>
                      <span className="font-mono text-cyan-400 font-semibold">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Deadline: {p.deadline}</span>
                    <span className="text-emerald-400 font-semibold">{formatINR(p.projectPrice)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Appointments, Team Performance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Client Appointments */}
        <div className="nexus-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Upcoming Appointments</span>
            </h2>
            <button
              onClick={() => onNavigate('comms')}
              className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer"
            >
              <span>+ Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming appointments scheduled.</p>
            ) : (
              appointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/30 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono text-purple-300 leading-tight">
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xs font-bold text-white leading-tight">
                      {new Date(apt.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{apt.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{apt.time} ({apt.durationMinutes}m)</span>
                      <span>• {apt.clientName}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Performance Matrix */}
        <div className="nexus-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Team Performance</span>
            </h2>
            <button
              onClick={() => onNavigate('team')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {users.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-lg object-cover ring-1 ring-cyan-500/30"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{member.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{member.title}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    {member.totalDealsClosed || 0} Deals
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Rate: {member.commissionRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit & Activity Stream */}
        <div className="nexus-card rounded-2xl p-5 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Audit & Activity Stream</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[220px] pr-1">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="text-cyan-400">{log.actorName}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="font-medium text-slate-200 mt-0.5">{log.action}</div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
