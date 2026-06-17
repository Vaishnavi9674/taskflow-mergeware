import React, { useState, useEffect } from "react";
import { apiService, Task } from "../../api/apiService";
import { Modal } from "./Modal";
import { 
  Search, Plus, LogOut, CheckCircle2, Circle, 
  Trash2, Edit2, LayoutGrid, CheckSquare, Clock, 
  TrendingUp, Calendar
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, showToast }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "completed">("all");

  // Create Task Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTasks();
      setTasks(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Task title is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiService.createTask(newTitle, newDescription);
      setTasks((prev) => [created, ...prev]);
      showToast("Task created successfully!", "success");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
    } catch (err: any) {
      showToast(err.message || "Failed to create task", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updated = await apiService.updateTask(task._id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      showToast(
        updated.completed ? "Task marked as completed!" : "Task marked as pending",
        "info"
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update task", "error");
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    if (!editTitle.trim()) {
      showToast("Task title is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await apiService.updateTask(editingTask._id, {
        title: editTitle,
        description: editDescription,
      });
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? updated : t)));
      showToast("Task updated successfully!", "success");
      setEditingTask(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update task", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await apiService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast("Task deleted successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete task", "error");
    }
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filtering & Search
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "completed") return matchesSearch && task.completed;
    if (activeFilter === "pending") return matchesSearch && !task.completed;
    return matchesSearch;
  });

  return (
    <div className="relative min-h-[90vh] pb-12">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-meta-blue/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-meta-blue-dark/10 blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Header bar */}
      <header className="flex items-center justify-between py-5 mb-8 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-meta-blue-dark to-meta-blue flex items-center justify-center text-white font-black shadow-md shadow-meta-blue/15">
            TF
          </div>
          <span className="font-extrabold tracking-tight text-xl text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-meta-blue">
            taskflow
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* Statistics dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
        {/* KPI 1 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-meta-blue/15 text-meta-blue flex items-center justify-center">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{totalTasks}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{completedTasks}</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-600/15 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{pendingTasks}</h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</p>
            <span className="text-sm font-bold text-meta-blue flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> {completionRate}%
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-meta-blue-dark to-meta-blue h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Workspace Controllers */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-white"
          />
        </div>

        {/* Filtering & Creation */}
        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
          <div className="flex p-0.5 rounded-xl bg-white/5 border border-white/5 flex-1 md:flex-initial">
            {(["all", "pending", "completed"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-200 flex-1 md:flex-initial ${
                  activeFilter === filter
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-meta-blue-dark to-meta-blue hover:brightness-110 shadow-md shadow-meta-blue/10 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </section>

      {/* Tasks List */}
      <section className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-meta-blue/20 border-t-meta-blue rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Retrieving secure workspace tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-dashed border-white/10">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">No Tasks Found</h4>
            <p className="text-sm text-slate-400 max-w-sm font-light">
              {searchTerm 
                ? "No tasks match your search criteria. Try refining your query."
                : activeFilter === "all"
                  ? "Your workspace is empty. Create a task to get started!"
                  : `You don't have any ${activeFilter} tasks in this workspace.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all duration-300 relative group overflow-hidden ${
                  task.completed ? "opacity-75" : ""
                }`}
                style={{
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                }}
              >
                {/* Glow bar for completed vs pending */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                    task.completed ? "bg-emerald-500" : "bg-meta-blue"
                  }`} 
                />

                {/* Completion Toggle checkbox */}
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="flex-shrink-0 mt-0.5 text-slate-500 hover:text-slate-200 transition-colors duration-150"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 hover:text-meta-blue" />
                  )}
                </button>

                {/* Info and text */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-bold text-base leading-snug truncate text-white transition-all duration-200 ${
                      task.completed ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p
                    className={`text-xs mt-1 text-slate-300 font-light leading-relaxed break-words line-clamp-3 ${
                      task.completed ? "text-slate-400" : ""
                    }`}
                  >
                    {task.description || "No description provided."}
                  </p>
                </div>

                {/* Action controls */}
                <div className="flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Workspace Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design app mockup"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description (Optional)
            </label>
            <textarea
              placeholder="e.g. Create a landing page draft in Figma with dark theme support..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-meta-blue-dark to-meta-blue hover:brightness-110 transition-all duration-200 shadow-md shadow-meta-blue/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" /> Create Task
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Modify Workspace Task">
        <form onSubmit={handleUpdateTask} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design app mockup"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description (Optional)
            </label>
            <textarea
              placeholder="e.g. Create a landing page draft in Figma..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-meta-blue-dark to-meta-blue hover:brightness-110 transition-all duration-200 shadow-md shadow-meta-blue/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Edit2 className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};
