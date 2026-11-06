import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  DollarSign,
  FileText,
  ShieldCheck,
  Calendar,
  UserCheck,
  Database,
  Lock,
  CheckSquare,
  BarChart3,
  Plus,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { UserRole } from '../types/nexus';

export type ActiveTab =
  | 'dashboard'
  | 'leads'
  | 'clients'
  | 'projects'
  | 'finances'
  | 'invoices'
  | 'tasks'
  | 'reports'
  | 'approvals'
  | 'comms'
  | 'team'
  | 'database';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  pendingApprovalsCount: number;
  newLeadsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  pendingApprovalsCount,
  newLeadsCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFounder = userRole === 'FOUNDER';
  const isPartner = userRole === 'BUSINESS_PARTNER';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard (Overview)',
      icon: LayoutDashboard,
      badge: null,
      allowed: true,
    },
    {
      id: 'leads' as ActiveTab,
      label: 'Leads & Inquiries',
      icon: Target,
      badge: newLeadsCount > 0 ? `${newLeadsCount} New` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      allowed: true,
    },
    {
      id: 'clients' as ActiveTab,
      label: 'Clients & Accounts',
      icon: Users,
      badge: null,
      allowed: true,
    },
    {
      id: 'projects' as ActiveTab,
      label: 'Website Projects',
      icon: FolderKanban,
      badge: null,
      allowed: true,
    },
    {
      id: 'finances' as ActiveTab,
      label: 'Finances & Profit (₹)',
      icon: DollarSign,
      badge: userRole === 'SALES_REPRESENTATIVE' ? 'Restricted' : null,
      badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
      allowed: true,
    },
    {
      id: 'invoices' as ActiveTab,
      label: 'Invoices & Bills (₹)',
      icon: FileText,
      badge: null,
      allowed: true,
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'Tasks & Deadlines',
      icon: CheckSquare,
      badge: null,
      allowed: true,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Business Reports',
      icon: BarChart3,
      badge: null,
      allowed: true,
    },
    {
      id: 'approvals' as ActiveTab,
      label: 'Founder Approvals',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action Required` : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      allowed: true,
    },
    {
      id: 'comms' as ActiveTab,
      label: 'Meetings & Messages',
      icon: Calendar,
      badge: null,
      allowed: true,
    },
    {
      id: 'team' as ActiveTab,
      label: 'Team & Permissions',
      icon: UserCheck,
      badge: null,
      allowed: true,
    },
    {
      id: 'database' as ActiveTab,
      label: 'Settings & Cloud DB',
      icon: Database,
      badge: null,
      allowed: true,
    },
  ];

  const handleMobileSelect = (id: ActiveTab) => {
    onSelectTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#080c14] border-r border-slate-800/80 p-3 shrink-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">
          Operations Matrix
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Security & RLS Status Box */}
        <div className="mt-auto p-3 rounded-xl bg-[#0d1527] border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NEXUS GOVERNANCE</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            {isFounder
              ? 'Full Founder clearance active. External dispatches require your final signature.'
              : isPartner
              ? 'Partner clearance. Operations and client management unlocked.'
              : 'Sales rep profile. Leads assigned to you are visible. Private financials restricted.'}
          </p>
        </div>
      </aside>

      {/* Mobile Top Horizontal Scroll Bar */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar bg-[#0b111e] border-b border-slate-800/80 px-2 py-1.5 flex items-center gap-1.5 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/20 text-cyan-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile More Drawer / Bottom Sheet */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in">
          <div className="bg-[#0b111e] border-t border-cyan-500/30 rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-sm font-semibold text-white">All NEXUS Operations</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileSelect(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left text-xs font-medium transition cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Mobile Fixed Bottom Touch Bar (Optimized for Android / Mobile devices) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c14]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onSelectTab('leads')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'leads' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>Leads</span>
          {newLeadsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('projects')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'projects' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => onSelectTab('tasks')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'tasks' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => onSelectTab('invoices')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
            activeTab === 'invoices' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Invoices</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition cursor-pointer ${
            isMobileMenuOpen ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
