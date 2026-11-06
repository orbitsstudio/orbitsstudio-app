import React from 'react';
import { UserProfile, UserRole } from '../types/nexus';
import {
  ShieldAlert,
  Sparkles,
  Mic,
  MicOff,
  Database,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { SupabaseConfig } from '../services/supabase';

interface HeaderProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onSwitchUser: (userId: string) => void;
  pendingApprovalsCount: number;
  onOpenApprovals: () => void;
  onOpenAI: () => void;
  onOpenQuickAdd: () => void;
  onOpenDatabase: () => void;
  supabaseConfig: SupabaseConfig;
  isVoiceListening: boolean;
  onToggleVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSwitchUser,
  pendingApprovalsCount,
  onOpenApprovals,
  onOpenAI,
  onOpenQuickAdd,
  onOpenDatabase,
  supabaseConfig,
  isVoiceListening,
  onToggleVoice,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'FOUNDER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            FOUNDER (TOTAL CONTROL)
          </span>
        );
      case 'BUSINESS_PARTNER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
            BUSINESS PARTNER
          </span>
        );
      case 'SALES_REPRESENTATIVE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            SALES REP (RESTRICTED)
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c192e] to-[#080c14] border border-cyan-500/30 cyan-glow">
            {/* Orbital Node Symbol */}
            <svg className="w-6 h-6 text-cyan-400 animate-spin-slow" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <ellipse cx="12" cy="12" rx="9" ry="4" stroke="currentColor" strokeWidth="1.2" transform="rotate(-30 12 12)" opacity="0.8" />
              <circle cx="12" cy="12" r="3" fill="#00f2fe" />
              <circle cx="6" cy="7" r="1.5" fill="#38bdf8" />
              <circle cx="18" cy="17" r="1.5" fill="#38bdf8" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white font-mono flex items-center">
                NEXUS
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v1.0
                </span>
              </span>
              <span className="hidden md:inline-block text-xs text-slate-400 font-medium">
                — Orbit Studio Intelligence
              </span>
              {/* Active Currency Badge: INR (₹) */}
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold" title="Default Currency: Indian Rupee (INR)">
                <span>₹ INR</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              One system. Every operation. Total control.
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Supabase Connection Indicator */}
          <button
            onClick={onOpenDatabase}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
              supabaseConfig.isConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title="Database & Supabase Integration"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {supabaseConfig.isConnected ? 'Supabase Connected' : 'Local DB (Supabase Ready)'}
            </span>
          </button>

          {/* Voice Command Button */}
          <button
            onClick={onToggleVoice}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              isVoiceListening
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title="Voice Commands (Push to Talk / Hey NEXUS)"
          >
            {isVoiceListening ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden lg:inline">{isVoiceListening ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* Universal Smart Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-md cursor-pointer text-xs"
            title="Quick Action: Add Client, Project, Invoice, Payment, Expense, Lead, Task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {/* AI Assistant Toggle Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:text-white transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold">NEXUS AI</span>
          </button>

          {/* Founder Approvals Queue Button */}
          <button
            onClick={onOpenApprovals}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              pendingApprovalsCount > 0
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/50'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
            title="Founder Approval Queue"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          {/* Role Switcher & User Account Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-500/40"
              />
              <div className="hidden xl:block text-left pr-1">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-cyan-400 font-mono">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switching Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0c1527] border border-cyan-500/30 p-2 shadow-2xl z-50">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Account & RBAC</div>
                  <div className="text-xs font-bold text-white mt-0.5">{currentUser.name}</div>
                  <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 px-3 pt-2">Switch Active Role:</div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                        u.id === currentUser.id
                          ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                      </div>
                      {u.id === currentUser.id && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 px-3 pb-1 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Commission: {currentUser.commissionRate}%</span>
                  <span className="font-mono text-cyan-400">RLS Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
