import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  CheckSquare,
  Square,
  Clock,
  Calendar,
  DollarSign,
  User,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Edit2,
  X,
  Sparkles,
} from 'lucide-react';
import { Project, ProjectStatus, Client, UserProfile } from '../types/nexus';
import { formatINR } from '../utils/format';

interface ProjectsViewProps {
  projects: Project[];
  clients: Client[];
  users: UserProfile[];
  onSaveProject: (project: Omit<Project, 'id' | 'createdAt'> & { id?: string }) => void;
  onToggleChecklistItem: (projectId: string, itemId: string) => void;
}

const STAGES: { id: ProjectStatus; label: string }[] = [
  { id: 'planning', label: 'Planning' },
  { id: 'designing', label: 'Designing' },
  { id: 'development', label: 'Development' },
  { id: 'review', label: 'Review' },
  { id: 'completed', label: 'Completed' },
  { id: 'delivered', label: 'Delivered' },
];

const PACKAGES = [
  'Starter Web Presence',
  'Corporate Business Portal',
  'Custom E-Commerce Engine',
  'Full Web App & CMS',
] as const;

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  clients,
  users,
  onSaveProject,
  onToggleChecklistItem,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Modal create/edit
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    clientId: clients[0]?.id || '',
    packageSelected: 'Corporate Business Portal' as Project['packageSelected'],
    projectPrice: 85000,
    advancePayment: 42500,
    remainingBalance: 42500,
    assignedMemberIds: [users[0]?.id || ''],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'planning' as ProjectStatus,
    requirements: '',
    deliveryStatus: 'on_track' as Project['deliveryStatus'],
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      clientId: clients[0]?.id || '',
      packageSelected: 'Corporate Business Portal',
      projectPrice: 85000,
      advancePayment: 42500,
      remainingBalance: 42500,
      assignedMemberIds: [users[0]?.id || ''],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planning',
      requirements: '',
      deliveryStatus: 'on_track',
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      name: p.name,
      clientId: p.clientId,
      packageSelected: p.packageSelected,
      projectPrice: p.projectPrice,
      advancePayment: p.advancePayment,
      remainingBalance: p.remainingBalance,
      assignedMemberIds: p.assignedMemberIds,
      deadline: p.deadline,
      status: p.status,
      requirements: p.requirements,
      deliveryStatus: p.deliveryStatus,
    });
    setIsCreating(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formData.clientId);
    const assignedNames = users
      .filter((u) => formData.assignedMemberIds.includes(u.id))
      .map((u) => u.name);

    const defaultChecklist = [
      { id: 'm1', title: 'Scope & Architecture Approval', completed: true, phase: 'Planning' },
      { id: 'm2', title: 'High-Fidelity Wireframes & Figma UI', completed: false, phase: 'Designing' },
      { id: 'm3', title: 'Full Responsive Development & API Connectors', completed: false, phase: 'Development' },
      { id: 'm4', title: 'Client Feedback & Revisions Round', completed: false, phase: 'Review' },
      { id: 'm5', title: 'Production DNS, SSL & Delivery Signoff', completed: false, phase: 'Delivered' },
    ];

    onSaveProject({
      ...(editingProject ? { id: editingProject.id } : {}),
      name: formData.name,
      clientId: formData.clientId,
      clientName: client?.name || 'Client',
      clientBusiness: client?.businessName || 'Business',
      packageSelected: formData.packageSelected,
      projectPrice: formData.projectPrice,
      advancePayment: formData.advancePayment,
      remainingBalance: formData.projectPrice - formData.advancePayment,
      assignedMemberIds: formData.assignedMemberIds,
      assignedMembers: assignedNames,
      deadline: formData.deadline,
      status: formData.status,
      requirements: formData.requirements,
      progressChecklist: editingProject ? editingProject.progressChecklist : defaultChecklist,
      deliveryStatus: formData.deliveryStatus,
    });

    setIsCreating(false);
    setEditingProject(null);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientBusiness.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            <span>Website Project Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track website development sprints, packages, team assignments, and milestone checklists.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Website Project</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="nexus-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              statusFilter === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Stages
          </button>
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                statusFilter === s.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredProjects.map((p) => {
          const completedCount = p.progressChecklist.filter((c) => c.completed).length;
          const totalCount = p.progressChecklist.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={p.id}
              className="nexus-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                      {p.packageSelected}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1.5">{p.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Client: <span className="text-slate-200">{p.clientBusiness}</span> ({p.clientName})
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg uppercase font-bold border ${
                      p.status === 'completed' || p.status === 'delivered'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : p.status === 'development'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Requirements */}
                <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                  {p.requirements || 'Standard development scope and deployment deliverables.'}
                </p>

                {/* Financial Milestone Split */}
                <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TOTAL PRICE</span>
                    <span className="font-bold text-white">{formatINR(p.projectPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ADVANCE (RECEIVED)</span>
                    <span className="font-bold text-emerald-400">{formatINR(p.advancePayment)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">BALANCE DUE</span>
                    <span className="font-bold text-amber-400">{formatINR(p.remainingBalance)}</span>
                  </div>
                </div>

                {/* Interactive Milestone Checklist */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-slate-400 text-[11px] uppercase">
                      Sprint Progress ({completedCount}/{totalCount})
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{progressPercent}%</span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-1.5">
                    {p.progressChecklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleChecklistItem(p.id, item.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs transition cursor-pointer select-none ${
                          item.completed
                            ? 'bg-cyan-950/30 text-slate-400 line-through border border-cyan-500/10'
                            : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="flex-1">{item.title}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{item.phase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {p.deadline}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    {p.assignedMembers.join(', ')}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                  title="Edit Project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Project Modal */}
      {(isCreating || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                <span>{editingProject ? 'Edit Website Project' : 'Initiate Website Project'}</span>
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingProject(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lumina Clinic Medical Portal"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Client Account *</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Website Package *</label>
                  <select
                    value={formData.packageSelected}
                    onChange={(e) =>
                      setFormData({ ...formData, packageSelected: e.target.value as Project['packageSelected'] })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {PACKAGES.map((pkg) => (
                      <option key={pkg} value={pkg}>
                        {pkg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">Agreed Total Price (₹ INR) *</label>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">{formatINR(formData.projectPrice)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={formData.projectPrice}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        projectPrice: price,
                        advancePayment: Math.round(price * 0.5),
                        remainingBalance: Math.round(price * 0.5),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                  {/* Quick Package Presets */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {[
                      { label: 'Starter', val: 35000 },
                      { label: 'Business', val: 85000 },
                      { label: 'eCommerce', val: 145000 },
                      { label: 'Full App', val: 260000 },
                    ].map((pkg) => (
                      <button
                        key={pkg.label}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            projectPrice: pkg.val,
                            advancePayment: Math.round(pkg.val * 0.5),
                            remainingBalance: Math.round(pkg.val * 0.5),
                          })
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono transition"
                      >
                        {pkg.label}: {formatINR(pkg.val)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-mono">50% Advance Milestone (₹ INR)</label>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">{formatINR(formData.advancePayment)}</span>
                  </div>
                  <input
                    type="number"
                    value={formData.advancePayment}
                    onChange={(e) => {
                      const adv = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        advancePayment: adv,
                        remainingBalance: formData.projectPrice - adv,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Remaining balance: {formatINR(formData.remainingBalance)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Project Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Target Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Technical Requirements & Deliverable Scope</label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="e.g. Next.js, Tailwind, Stripe checkout, mobile-first design, SEO schema..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-md"
                >
                  {editingProject ? 'Save Changes' : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
