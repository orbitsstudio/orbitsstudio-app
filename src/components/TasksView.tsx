import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  Clock,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { BusinessTask, UserProfile, Project } from '../types/nexus';

interface TasksViewProps {
  tasks: BusinessTask[];
  users: UserProfile[];
  projects: Project[];
  currentUser: UserProfile;
  onSaveTask: (task: Omit<BusinessTask, 'id' | 'createdAt'> & { id?: string }) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  users,
  projects,
  currentUser,
  onSaveTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    assignedToName: currentUser.name,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high' as BusinessTask['priority'],
    status: 'todo' as BusinessTask['status'],
    relatedProject: projects[0]?.name || 'General Operations',
    category: 'development' as BusinessTask['category'],
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      assignedToName: currentUser.name,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'high',
      status: 'todo',
      relatedProject: projects[0]?.name || 'General Operations',
      category: 'development',
    });
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTask(formData);
    setIsCreating(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(search.toLowerCase()) ||
      (t.relatedProject && t.relatedProject.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'pending'
        ? t.status !== 'completed'
        : t.status === filterStatus;

    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            <span>Tasks & Operational Deadlines</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize sprints, client delivery items, follow-ups, and developer to-dos in one place.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="nexus-card rounded-2xl p-4 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Tasks</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{totalCount}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Across all agency operations</p>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-amber-500/30">
          <span className="text-[10px] font-mono text-amber-300 uppercase">Pending / In Progress</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingCount}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Active deliverables to complete</p>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-emerald-500/30">
          <span className="text-[10px] font-mono text-emerald-300 uppercase">Completed</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{completedCount}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Successfully finished</p>
        </div>

        <div className="nexus-card rounded-2xl p-4 border border-rose-500/30">
          <span className="text-[10px] font-mono text-rose-300 uppercase">High Priority Urgent</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{highPriorityCount}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Requires immediate attention</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="nexus-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, assignees, projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterStatus === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Done
            </button>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 nexus-card rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No tasks match your filter criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Add a new operational task or adjust your search.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`nexus-card rounded-2xl p-4 border transition-all flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
                    : isOverdue
                    ? 'border-rose-500/30 bg-[#160b0e]'
                    : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer shrink-0"
                    title={isCompleted ? 'Mark as to-do' : 'Mark as done'}
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-medium leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Priority tag */}
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          task.priority === 'high'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : task.priority === 'medium'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {isOverdue && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Overdue</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap font-mono">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{task.assignedToName}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Due: {task.dueDate}</span>
                      </span>

                      {task.relatedProject && (
                        <span className="text-slate-500 truncate max-w-[200px]">
                          • {task.relatedProject}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1527] border border-cyan-500/40 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <span>Create Operational Task</span>
              </h2>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct Google Lighthouse Speed Audit for Client Site"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Assign Team Member</label>
                  <select
                    value={formData.assignedToName}
                    onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Related Project</label>
                  <select
                    value={formData.relatedProject}
                    onChange={(e) => setFormData({ ...formData, relatedProject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="General Operations">General Operations</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
