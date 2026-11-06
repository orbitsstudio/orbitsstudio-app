import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Video,
  Phone,
  Users,
  MessageSquare,
  Mail,
  Send,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Appointment, Client, UserProfile, ApprovalItem } from '../types/nexus';

interface AppointmentsCommsViewProps {
  appointments: Appointment[];
  clients: Client[];
  currentUser: UserProfile;
  onSaveAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'> & { id?: string }) => void;
  onQueueApproval: (
    item: Omit<ApprovalItem, 'id' | 'status' | 'createdAt' | 'requestingMemberId' | 'requestingMemberName' | 'requestingMemberRole'>
  ) => void;
}

export const AppointmentsCommsView: React.FC<AppointmentsCommsViewProps> = ({
  appointments,
  clients,
  currentUser,
  onSaveAppointment,
  onQueueApproval,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'email_drafter' | 'whatsapp_drafter'>('calendar');
  const [isScheduling, setIsScheduling] = useState(false);

  // Appointment Form
  const [aptForm, setAptForm] = useState({
    title: '',
    clientName: clients[0]?.name || '',
    clientEmail: clients[0]?.email || '',
    clientPhone: clients[0]?.phone || '',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    durationMinutes: 45,
    meetingType: 'video_call' as Appointment['meetingType'],
    meetingLink: 'https://meet.google.com/orb-stu-crm',
    notes: '',
  });

  // Message Drafter States
  const [draftRecipient, setDraftRecipient] = useState(clients[0]?.email || '');
  const [draftSubject, setDraftSubject] = useState('Orbits Studio — Website Development Sprint Update');
  const [draftBody, setDraftBody] = useState(
    'Hi,\n\nWe have made significant progress on your website design wireframes. The interactive prototype is now available on our staging server for your feedback.\n\nPlease let us know if you have any questions.\n\nWarm regards,\nOrbits Studio Team'
  );
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  // Template pre-fill helper
  const handleSelectTemplate = (type: 'proposal' | 'milestone' | 'invoice_reminder') => {
    if (type === 'proposal') {
      setDraftSubject('Orbits Studio Proposal & Technical Scope Agreement');
      setDraftBody(
        'Dear Client,\n\nFollowing our architectural discovery meeting, we have prepared your complete website project specification and milestone schedule. Please find the agreement attached for your review.\n\nBest regards,\nOrbits Studio Team'
      );
    } else if (type === 'milestone') {
      setDraftSubject('Website Sprint Milestone Ready For Staging Review');
      setDraftBody(
        'Hello,\n\nOur engineering team has completed the latest development milestone including responsive mobile layouts and API connectors. Please test the staging URL and share any refinements!\n\nBest regards,\nOrbits Studio Team'
      );
    } else {
      setDraftSubject('Orbits Studio — Milestone Settlement Invoice Reminder');
      setDraftBody(
        'Hello,\n\nThis is a friendly reminder that the milestone settlement invoice for your website project is scheduled for completion. You can review and settle directly via wire transfer.\n\nThank you,\nOrbits Studio Accounts'
      );
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAppointment({
      ...aptForm,
      status: 'scheduled',
      assignedToName: currentUser.name,
    });
    setIsScheduling(false);
  };

  const handleQueueCommunication = (commType: 'send_email' | 'send_whatsapp') => {
    onQueueApproval({
      actionType: commType,
      title: `${commType === 'send_email' ? 'Email Dispatch' : 'WhatsApp Message'} to ${draftRecipient}`,
      description: `Prepared external message awaiting Founder Alex Vance approval before sending.`,
      preparedContent: {
        recipient: draftRecipient,
        subject: commType === 'send_email' ? draftSubject : undefined,
        body: draftBody,
      },
    });

    setMessageSentSuccess(true);
    setTimeout(() => setMessageSentSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            <span>Appointments & Communications Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Client scheduling, video conferences, email & WhatsApp drafting with Founder Approval gates.
          </p>
        </div>

        <button
          onClick={() => setIsScheduling(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold shadow-lg hover:from-purple-400 hover:to-indigo-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Client Meeting</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'calendar'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Meetings Calendar ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('email_drafter')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'email_drafter'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Drafter (Approval Queued)</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp_drafter')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'whatsapp_drafter'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp Drafter (Approval Queued)</span>
        </button>
      </div>

      {/* TAB 1: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="nexus-card rounded-2xl p-5 border border-slate-800 hover:border-purple-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                    {apt.meetingType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">{apt.status}</span>
                </div>

                <h3 className="font-bold text-white text-sm mt-2">{apt.title}</h3>
                <div className="text-xs text-slate-300 mt-1">{apt.clientName}</div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{apt.time} ({apt.durationMinutes} min)</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  {apt.notes || 'Routine project progress sync.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Host: {apt.assignedToName}</span>
                {apt.meetingLink && (
                  <a
                    href={apt.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline font-mono text-[11px]"
                  >
                    <span>Google Meet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2 & 3: EMAIL / WHATSAPP DRAFTER */}
      {(activeTab === 'email_drafter' || activeTab === 'whatsapp_drafter') && (
        <div className="nexus-card rounded-2xl p-6 border border-slate-800 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              {activeTab === 'email_drafter' ? (
                <>
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <span>Prepared Email Dispatcher</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>Prepared WhatsApp Messenger</span>
                </>
              )}
            </h2>

            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              Requires Founder Approval
            </span>
          </div>

          {/* Quick template pickers */}
          <div className="mb-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
              Quick Templates
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectTemplate('proposal')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 cursor-pointer"
              >
                Website Proposal
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('milestone')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 cursor-pointer"
              >
                Sprint Ready
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('invoice_reminder')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 cursor-pointer"
              >
                Invoice Reminder
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono">
                {activeTab === 'email_drafter' ? 'Recipient Email Address' : 'Recipient Phone Number'}
              </label>
              <input
                type="text"
                value={draftRecipient}
                onChange={(e) => setDraftRecipient(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            {activeTab === 'email_drafter' && (
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Subject Line</label>
                <input
                  type="text"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Message Content</label>
              <textarea
                rows={6}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white leading-relaxed"
              />
            </div>

            {messageSentSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Message submitted to Founder Approval Queue! It will be dispatched once Alex Vance signs off.</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Sender: {currentUser.name} ({currentUser.role})
              </span>
              <button
                onClick={() =>
                  handleQueueCommunication(activeTab === 'email_drafter' ? 'send_email' : 'send_whatsapp')
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Queue for Founder Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1527] border border-purple-500/40 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Schedule Client Appointment</span>
              </h2>
              <button onClick={() => setIsScheduling(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={aptForm.title}
                  onChange={(e) => setAptForm({ ...aptForm, title: e.target.value })}
                  placeholder="e.g. Lumina Clinic - Sprint Demo"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Date</label>
                  <input
                    type="date"
                    required
                    value={aptForm.date}
                    onChange={(e) => setAptForm({ ...aptForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Time</label>
                  <input
                    type="time"
                    required
                    value={aptForm.time}
                    onChange={(e) => setAptForm({ ...aptForm, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={aptForm.durationMinutes}
                    onChange={(e) => setAptForm({ ...aptForm, durationMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Format</label>
                  <select
                    value={aptForm.meetingType}
                    onChange={(e) => setAptForm({ ...aptForm, meetingType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="video_call">Google Meet Video</option>
                    <option value="phone_consultation">Phone Call</option>
                    <option value="in_person">In-Person Studio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Client Name *</label>
                <input
                  type="text"
                  required
                  value={aptForm.clientName}
                  onChange={(e) => setAptForm({ ...aptForm, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Meeting Notes / Agenda</label>
                <textarea
                  rows={2}
                  value={aptForm.notes}
                  onChange={(e) => setAptForm({ ...aptForm, notes: e.target.value })}
                  placeholder="Key discussion points, prototype link..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
