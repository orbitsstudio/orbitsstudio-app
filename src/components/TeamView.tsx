import React from 'react';
import {
  UserCheck,
  Shield,
  Percent,
  FolderKanban,
  Target,
  Award,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, Project, Lead, CommissionRecord } from '../types/nexus';
import { formatINR } from '../utils/format';

interface TeamViewProps {
  users: UserProfile[];
  projects: Project[];
  leads: Lead[];
  commissions: CommissionRecord[];
  currentUser: UserProfile;
  onUpdateCommissionRate: (userId: string, rate: number) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  users,
  projects,
  leads,
  commissions,
  currentUser,
  onUpdateCommissionRate,
}) => {
  const isFounder = currentUser.role === 'FOUNDER';

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-cyan-400" />
            <span>Team Architecture & Role Permissions (RBAC)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Individual team profiles, operational performance, and PostgreSQL Row-Level Security privileges.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
          {isFounder ? 'Founder Governance Active' : 'Read-Only Matrix'}
        </div>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {users.map((member) => {
          const assignedProjects = projects.filter((p) => p.assignedMemberIds.includes(member.id));
          const handledLeads = leads.filter((l) => l.assignedRepId === member.id);
          const memberComms = commissions.filter((c) => c.salesRepId === member.id);
          const totalEarned = memberComms.reduce((sum, c) => sum + c.commissionAmount, 0);

          return (
            <div
              key={member.id}
              className={`nexus-card rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                member.id === currentUser.id ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/40' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/30 shadow-md"
                  />
                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg uppercase font-bold border ${
                      member.role === 'FOUNDER'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                        : member.role === 'BUSINESS_PARTNER'
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {member.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-white text-base">{member.name}</h3>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5">{member.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{member.email}</div>
                  <div className="text-xs text-slate-400 font-mono">{member.phone}</div>
                </div>

                {/* Performance Figures */}
                <div className="mt-4 grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">HANDLED LEADS</span>
                    <span className="font-bold text-white">{handledLeads.length} Leads</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ACTIVE PROJECTS</span>
                    <span className="font-bold text-cyan-300">{assignedProjects.length} Projects</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">COMMISSION RATE</span>
                    <span className="font-bold text-purple-300">{member.commissionRate}%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">COMMISSIONS EARNED</span>
                    <span className="font-bold text-emerald-400">{formatINR(totalEarned)}</span>
                  </div>
                </div>
              </div>

              {/* Security Privileges Box */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-mono text-slate-400 uppercase text-[10px] block mb-1">Row Level Security Rights:</span>
                <ul className="space-y-1">
                  {member.role === 'FOUNDER' && (
                    <>
                      <li className="flex items-center gap-1.5 text-cyan-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Total Access: Full Bank Ledger & P&L
                      </li>
                      <li className="flex items-center gap-1.5 text-cyan-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Sole Approval Authority for Outbound Actions
                      </li>
                      <li className="flex items-center gap-1.5 text-cyan-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Manage Staff Commission Percentages
                      </li>
                    </>
                  )}
                  {member.role === 'BUSINESS_PARTNER' && (
                    <>
                      <li className="flex items-center gap-1.5 text-indigo-300">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Manage All Clients & Project Sprints
                      </li>
                      <li className="flex items-center gap-1.5 text-indigo-300">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400" /> View Project-level Financials
                      </li>
                      <li className="flex items-center gap-1.5 text-amber-400">
                        <Lock className="w-3 h-3 text-amber-400" /> External Dispatches require Founder sign-off
                      </li>
                    </>
                  )}
                  {member.role === 'SALES_REPRESENTATIVE' && (
                    <>
                      <li className="flex items-center gap-1.5 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Add & Research Business Prospects
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> View Assigned Leads & Personal Commission
                      </li>
                      <li className="flex items-center gap-1.5 text-rose-400">
                        <Lock className="w-3 h-3 text-rose-400" /> Unrestricted Finances & Private Settings Blocked
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role-Based Access Control Permissions Matrix Table */}
      <div className="nexus-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm">PostgreSQL Row-Level Security (RLS) Permissions Matrix</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically enforced at the database layer (not just hidden frontend buttons).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-[#080c14] border-b border-slate-800 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="p-3.5">Capability / Table</th>
                <th className="p-3.5 text-cyan-300">Founder (Alex)</th>
                <th className="p-3.5 text-indigo-300">Business Partner (Elena)</th>
                <th className="p-3.5 text-emerald-300">Sales Rep (Marcus)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-[11px]">
              <tr className="hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-white">Company Bank Balance & P&L</td>
                <td className="p-3.5 text-emerald-400 font-bold">FULL (Read/Write)</td>
                <td className="p-3.5 text-cyan-300">READ ONLY</td>
                <td className="p-3.5 text-rose-400 font-bold">BLOCKED (403)</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-white">Approve Outbound Action Dispatches</td>
                <td className="p-3.5 text-emerald-400 font-bold">EXCLUSIVE AUTHORITY</td>
                <td className="p-3.5 text-slate-400">Queue Only</td>
                <td className="p-3.5 text-slate-400">Queue Only</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-white">Client Management & CRM</td>
                <td className="p-3.5 text-emerald-400">FULL (All Clients)</td>
                <td className="p-3.5 text-emerald-400">FULL (All Clients)</td>
                <td className="p-3.5 text-cyan-300">Create & View</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-white">Lead Pipeline & Scoring</td>
                <td className="p-3.5 text-emerald-400">FULL (All Leads)</td>
                <td className="p-3.5 text-emerald-400">FULL (All Leads)</td>
                <td className="p-3.5 text-cyan-300">Assigned Leads Only</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-white">Commission Payout Records</td>
                <td className="p-3.5 text-emerald-400 font-bold">Configure & Disburse</td>
                <td className="p-3.5 text-cyan-300">View Team Records</td>
                <td className="p-3.5 text-emerald-400">View Own Records Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
