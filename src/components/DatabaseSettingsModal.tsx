import React, { useState } from 'react';
import {
  Database,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Copy,
  ExternalLink,
  X,
  Server,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { SupabaseConfig, SupabaseService } from '../services/supabase';
import { NexusDatabase } from '../services/db';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseConfig: SupabaseConfig;
  onConfigUpdated: (config: SupabaseConfig) => void;
  onDataReset: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  supabaseConfig,
  onConfigUpdated,
  onDataReset,
}) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'hostinger' | 'backup' | 'sql'>('supabase');
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.supabaseAnonKey);
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingStatus('Pinging Supabase REST API and testing credentials...');
    setIsSuccess(null);
    const res = await SupabaseService.testConnection(supabaseUrl, supabaseAnonKey);
    setTestingStatus(res.message);
    setIsSuccess(res.success);
    if (res.success) {
      onConfigUpdated(SupabaseService.getConfig());
    }
  };

  const handleDisconnect = () => {
    SupabaseService.disconnect();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestingStatus('Disconnected from Supabase.');
    setIsSuccess(false);
    onConfigUpdated(SupabaseService.getConfig());
  };

  const handleExportBackup = () => {
    const jsonStr = NexusDatabase.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-orbits-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = NexusDatabase.restoreFromBackup(content);
      if (ok) {
        setTestingStatus('NEXUS Database restored successfully! Reloading session...');
        setIsSuccess(true);
        setTimeout(() => window.location.reload(), 800);
      } else {
        setTestingStatus('Failed to parse backup JSON file. Please ensure valid NEXUS backup format.');
        setIsSuccess(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(
      `-- Run this in your Supabase SQL Editor\n-- Full schema is available at /supabase-schema.sql in the repo`
    );
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Database, Supabase & Hostinger Deployment</h2>
              <div className="text-xs text-slate-400">
                Manage persistent PostgreSQL schemas, RLS security, backups, and cloud hosting.
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 py-3">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'supabase'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supabase Connection
          </button>
          <button
            onClick={() => setActiveTab('hostinger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'hostinger'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hostinger Web Hosting Guide
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sql'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PostgreSQL Schema DDL
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'backup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Backup & Recovery
          </button>
        </div>

        {/* TAB 1: Supabase Connection */}
        {activeTab === 'supabase' && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <div className="font-semibold text-white mb-1">Dual-Mode Persistence Architecture:</div>
              <p className="leading-relaxed">
                NEXUS automatically persists all records (clients, leads, projects, invoices, approvals) in the active local storage database with full CRUD capability. To sync directly with your cloud PostgreSQL Supabase database, enter your credentials below.
              </p>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Supabase Anon Public API Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            {testingStatus && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2 ${
                  isSuccess
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{testingStatus}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {supabaseConfig.isConnected ? (
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-2 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900 text-xs"
                >
                  Disconnect Supabase
                </button>
              ) : (
                <span className="text-slate-500 font-mono text-[11px]">Local Database Active</span>
              )}

              <button
                onClick={handleTestConnection}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md hover:from-cyan-400 hover:to-blue-500"
              >
                <Cloud className="w-4 h-4" />
                <span>Test & Save Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Hostinger Web Hosting Guide */}
        {activeTab === 'hostinger' && (
          <div className="mt-4 space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Hostinger Subdomain Isolation Protocol</span>
              </h3>
              <p className="mt-1 text-slate-400 leading-relaxed">
                As required, NEXUS is configured to run on a dedicated subdomain (e.g. <code>nexus.orbitsstudio.com</code> or <code>app.orbitsstudio.com</code>) without modifying Orbit Studio's main public website.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-white mb-1 font-mono">1. Create Subdomain in Hostinger hPanel</div>
                <p className="text-slate-400">
                  Navigate to <strong>Domains → Subdomains</strong> → enter <code>nexus</code> → set directory to <code>public_html/nexus</code>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-white mb-1 font-mono">2. Build Production Static / PWA Bundle</div>
                <p className="text-slate-400 font-mono">
                  npm run build → Upload contents of /dist directory into public_html/nexus/
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-white mb-1 font-mono">3. Issue Free Let's Encrypt SSL & Force HTTPS</div>
                <p className="text-slate-400">
                  In hPanel Security → SSL → select <code>nexus.orbitsstudio.com</code> and enable Force HTTPS.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-white mb-1 font-mono">4. Complete Deployment Documentation Available</div>
                <p className="text-slate-400">
                  Refer to <code>HOSTINGER_DEPLOYMENT.md</code> in this project for the full .htaccess configuration and Node.js backend proxy instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PostgreSQL Schema */}
        {activeTab === 'sql' && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono">Full production DDL available in /supabase-schema.sql:</span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#080c14] border border-slate-800 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-72">
{`-- 11 PostgreSQL Tables with Row Level Security:
-- 1. profiles (id, name, email, role, avatar_url, commission_rate)
-- 2. clients (id, name, business_name, email, budget, status, notes)
-- 3. leads (id, business_name, contact_name, status, score, priority)
-- 4. projects (id, name, client_id, package_selected, price, balance)
-- 5. tasks (id, title, project_id, assigned_to, completed)
-- 6. invoices (id, invoice_number, client_id, subtotal, balance_due, status)
-- 7. transactions (id, type, category, amount, description, date)
-- 8. commissions (id, sales_rep_id, project_id, commission_amount, status)
-- 9. appointments (id, title, client_name, date, time, duration, status)
-- 10. approvals (id, action_type, title, prepared_content, status)
-- 11. activity_logs (id, actor_name, actor_role, action, module)`}
            </pre>
          </div>
        )}

        {/* TAB 4: Backup & Reset */}
        {activeTab === 'backup' && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-semibold text-white mb-1">Full Database Export & Disaster Recovery</div>
              <p className="text-slate-400 leading-relaxed">
                Download a complete, timestamped JSON snapshot of all clients, projects, financial ledgers, and audit trails. You can safely store or restore it on any device.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Database Backup (JSON)</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Restore from JSON File</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="font-semibold text-rose-400 mb-1">Factory Reset</div>
              <p className="text-slate-400 mb-2">
                Reset local operational database to Orbits Studio's initial seed data.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all records to default factory seed data?')) {
                    onDataReset();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Database to Defaults</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
