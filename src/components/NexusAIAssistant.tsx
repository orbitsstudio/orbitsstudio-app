import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import {
  UserProfile,
  BusinessSummary,
  Project,
  Lead,
  Invoice,
} from '../types/nexus';

interface NexusAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  summary: BusinessSummary;
  projects: Project[];
  leads: Lead[];
  invoices: Invoice[];
  isVoiceListening: boolean;
  onToggleVoice: () => void;
  onDraftActionForApproval: (title: string, body: string, type: 'send_email' | 'send_whatsapp' | 'confirm_quotation') => void;
}

interface Message {
  id: string;
  sender: 'user' | 'nexus';
  text: string;
  timestamp: string;
  source?: string;
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}

export const NexusAIAssistant: React.FC<NexusAIAssistantProps> = ({
  isOpen,
  onClose,
  currentUser,
  summary,
  projects,
  leads,
  invoices,
  isVoiceListening,
  onToggleVoice,
  onDraftActionForApproval,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'nexus',
      text: `NEXUS Central Intelligence online. Authorized as **${currentUser.name}** (${currentUser.role}). Live database synchronized. How may I direct Orbits Studio operations?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'nexus-core',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Text to speech helper
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown symbols for cleaner pronunciation
      const clean = text.replace(/[*_#`]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Gather authorized context based on current user role
      const businessData = {
        clientsCount: summary.totalClients,
        activeProjectsCount: summary.activeProjects,
        monthlyRevenue: currentUser.role === 'SALES_REPRESENTATIVE' ? 'RESTRICTED' : summary.monthlyRevenue,
        totalExpenses: currentUser.role === 'SALES_REPRESENTATIVE' ? 'RESTRICTED' : summary.totalExpenses,
        netProfit: currentUser.role === 'SALES_REPRESENTATIVE' ? 'RESTRICTED' : summary.netProfit,
        pendingPayments: summary.pendingPayments,
        pendingApprovalsCount: summary.pendingApprovals,
        unpaidInvoices: invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').map((i) => ({
          number: i.invoiceNumber,
          business: i.clientBusiness,
          balance: i.balanceDue,
          due: i.dueDate,
        })),
        priorityLeads: leads.filter((l) => l.priority === 'high').map((l) => ({
          business: l.businessName,
          score: l.score,
          rep: l.assignedRepName,
          status: l.status,
        })),
        projects: projects.map((p) => ({
          name: p.name,
          client: p.clientBusiness,
          status: p.status,
          price: p.projectPrice,
        })),
      };

      const response = await fetch('/api/nexus/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          userRole: currentUser.role,
          businessData,
        }),
      });

      const data = await response.json();
      const reply = data.response || 'NEXUS could not generate a response.';

      let suggestedAction: Message['suggestedAction'] | undefined = undefined;
      const lower = promptText.toLowerCase();

      if (lower.includes('follow-up') || lower.includes('draft') || lower.includes('message')) {
        suggestedAction = {
          label: 'Queue Draft for Founder Approval',
          action: () => {
            onDraftActionForApproval(
              'Follow-up message to priority lead',
              reply,
              'send_email'
            );
          },
        };
      }

      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'nexus',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
        suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(reply);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'nexus',
          text: `Communication fault: ${err.message || 'Server connection error'}. Local offline fallbacks engaged.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_COMMANDS = [
    "Show today's business overview.",
    'How many active projects do we have?',
    'Show unpaid invoices.',
    'Find my highest-priority leads.',
    'Calculate this month’s profit.',
    'Draft a client follow-up message.',
    'Which projects are overdue?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#080c14]/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl flex flex-col text-slate-100">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0c1527] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-1.5 font-mono">
              NEXUS INTELLIGENCE
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-sans">
                v1.0
              </span>
            </h2>
            <div className="text-[10px] text-slate-400 font-mono">
              Orbits Studio Autonomous Assistant
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Mute Toggle */}
          <button
            onClick={() => {
              setSpeechEnabled(!speechEnabled);
              if (speechEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
              speechEnabled
                ? 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title={speechEnabled ? 'Voice Spoken Output ON' : 'Voice Spoken Output OFF'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RLS Security context pill */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Clearances: {currentUser.role}</span>
        </span>
        <span>Model: Gemini 3.8 Flash</span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1">
              {m.sender === 'nexus' ? (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold">NEXUS</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-300 font-semibold">{currentUser.name}</span>
                </>
              )}
              <span>• {m.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-medium rounded-br-xs shadow-md'
                  : 'bg-[#0d1527] border border-cyan-500/20 text-slate-200 rounded-bl-xs shadow-sm font-sans'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.suggestedAction && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={m.suggestedAction.action}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold cursor-pointer"
                  >
                    <span>{m.suggestedAction.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-cyan-400 text-xs font-mono animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>NEXUS querying database records...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Commands */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 whitespace-nowrap">
          {QUICK_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(cmd)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-cyan-300 font-mono transition cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form & Push to Talk */}
      <div className="p-3 bg-[#0c1527] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              isVoiceListening
                ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-md shadow-rose-500/30'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40'
            }`}
            title="Push to Talk / Voice Command"
          >
            {isVoiceListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak a business command..."
            className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold disabled:opacity-40 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
          <span>Say "Hey NEXUS" or use push-to-talk</span>
          <span>Security: Zero-Client API Key Exposure</span>
        </div>
      </div>
    </div>
  );
};
