import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  Mail,
  DollarSign,
  FileText,
  Calendar,
  AlertTriangle,
  User,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ApprovalItem, UserProfile } from '../types/nexus';
import { formatINR } from '../utils/format';

interface ApprovalsQueueProps {
  approvals: ApprovalItem[];
  currentUser: UserProfile;
  onProcessApproval: (approvalId: string, decision: 'approved' | 'rejected', comments?: string) => void;
}

export const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({
  approvals,
  currentUser,
  onProcessApproval,
}) => {
  const isFounder = currentUser.role === 'FOUNDER';
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);

  const filteredApprovals = approvals.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const getActionIcon = (type: ApprovalItem['actionType']) => {
    switch (type) {
      case 'send_email':
        return <Mail className="w-4 h-4 text-cyan-400" />;
      case 'send_whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'send_invoice':
      case 'confirm_quotation':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'confirm_appointment':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'financial_commitment':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      default:
        return <Send className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Governance Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Founder Approval Queue & Governance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mandatory human-in-the-loop gatekeeper. All prepared external actions require Founder verification before transmission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFounder ? (
            <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Founder Signing Authority Active</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
              Observer / Submitter Mode
            </span>
          )}
        </div>
      </div>

      {/* Critical Safety Protocol Card */}
      <div className="nexus-card rounded-2xl p-4 border border-amber-500/30 bg-amber-950/20 flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5 font-semibold">Strict External Action Policy</strong>
          NEXUS and team members may compose proposals, generate invoices, draft WhatsApp communications, or prepare financial disbursements. However, NO external packet is ever dispatched without Founder Alex Vance’s explicit sign-off.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pending Review ({approvals.filter((a) => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'approved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Approved History ({approvals.filter((a) => a.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'rejected'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Rejected ({approvals.filter((a) => a.status === 'rejected').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({approvals.length})
        </button>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="text-center py-16 nexus-card rounded-2xl border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No approval requests in this category</h3>
            <p className="text-xs text-slate-400 mt-1">All prepared operational actions have been reviewed.</p>
          </div>
        ) : (
          filteredApprovals.map((item) => (
            <div
              key={item.id}
              className={`nexus-card rounded-2xl p-5 border transition-all ${
                item.status === 'pending'
                  ? 'border-amber-500/40 shadow-lg shadow-amber-950/20'
                  : item.status === 'approved'
                  ? 'border-emerald-500/30'
                  : 'border-rose-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {getActionIcon(item.actionType)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {item.actionType.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                          item.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : item.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base mt-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-300 mt-1">{item.description}</p>

                    <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span>Requested by: <strong className="text-slate-200">{item.requestingMemberName}</strong> ({item.requestingMemberRole})</span>
                      <span>• {new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status or Controls */}
                {item.status === 'pending' ? (
                  isFounder ? (
                    <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Founder audit notes..."
                        value={reviewComments[item.id] || ''}
                        onChange={(e) =>
                          setReviewComments({ ...reviewComments, [item.id]: e.target.value })
                        }
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onProcessApproval(item.id, 'approved', reviewComments[item.id])}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onProcessApproval(item.id, 'rejected', reviewComments[item.id])}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold text-xs transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300 self-start">
                      Awaiting Founder Alex Vance Signature
                    </div>
                  )
                ) : (
                  <div className="text-right text-xs font-mono shrink-0">
                    <span className="text-slate-400">Reviewed at: {new Date(item.reviewedAt || item.createdAt).toLocaleDateString()}</span>
                    <div className="text-slate-300 text-[11px] mt-0.5">{item.reviewerComments}</div>
                  </div>
                )}
              </div>

              {/* Prepared Content Preview Box */}
              {item.preparedContent && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 uppercase tracking-wider mb-2">
                    <span>PREPARED PAYLOAD READY FOR DISPATCH:</span>
                    {item.preparedContent.amount && (
                      <span className="text-emerald-400 font-bold">
                        VALUE: {formatINR(item.preparedContent.amount)}
                      </span>
                    )}
                  </div>

                  {item.preparedContent.recipient && (
                    <div className="text-slate-400 mb-1">
                      Target Recipient: <span className="text-white">{item.preparedContent.recipient}</span>
                    </div>
                  )}
                  {item.preparedContent.subject && (
                    <div className="text-slate-400 mb-1">
                      Subject Line: <span className="text-white">{item.preparedContent.subject}</span>
                    </div>
                  )}
                  {item.preparedContent.body && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {item.preparedContent.body}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
