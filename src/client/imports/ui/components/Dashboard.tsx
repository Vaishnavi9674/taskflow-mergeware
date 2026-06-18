import React, { useState, useEffect } from "react";
import { apiService, Task } from "../../api/apiService";
import { Modal } from "./Modal";
import { 
  Search, Plus, LogOut, CheckCircle2, Circle, 
  Trash2, Edit2, LayoutGrid, CheckSquare, Clock, 
  TrendingUp, Calendar, GripVertical
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
  const [newCategory, setNewCategory] = useState<string>("None");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<string>("None");

  // Category filter and Drag state
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      const created = await apiService.createTask(newTitle, newDescription, newCategory);
      setTasks((prev) => [created, ...prev]);
      showToast("Task created successfully!", "success");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewCategory("None");
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
    setEditCategory(task.category || "None");
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
        category: editCategory,
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

  // Drag and Drop event handlers
  const isDragEnabled = activeFilter === "all" && categoryFilter === "All" && !searchTerm.trim();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isDragEnabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !isDragEnabled) return;

    const newTasks = [...tasks];
    const draggedItem = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setTasks(newTasks);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    if (!isDragEnabled) return;
    try {
      const taskIds = tasks.map((t) => t._id);
      await apiService.reorderTasks(taskIds);
      showToast("Tasks reordered successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save reordered tasks", "error");
      fetchTasks();
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
    
    const matchesStatus =
      activeFilter === "all"
        ? true
        : activeFilter === "completed"
        ? task.completed
        : !task.completed;

    const matchesCategory =
      categoryFilter === "All"
        ? true
        : (task.category || "None") === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const renderCategoryBadge = (category?: string) => {
    if (!category || category === "None") return null;

    let styles = "";
    if (category === "Work") {
      styles = "bg-meta-blue/15 text-meta-blue border-meta-blue/10";
    } else if (category === "Personal") {
      styles = "bg-emerald-500/15 text-emerald-400 border-emerald-500/10";
    } else if (category === "Urgent") {
      styles = "bg-rose-500/15 text-rose-400 border-rose-500/10";
    }

    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${styles}`}>
        {category}
      </span>
    );
  };

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

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1.5 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2 flex-shrink-0">
          Categories:
        </span>
        {([
          { name: "All", label: "All Categories", emoji: "📁" },
          { name: "Work", label: "Work", emoji: "💼" },
          { name: "Personal", label: "Personal", emoji: "🏠" },
          { name: "Urgent", label: "Urgent", emoji: "⚠️" },
          { name: "None", label: "Uncategorized", emoji: "📄" },
        ] as const).map((cat) => (
          <button
            key={cat.name}
            onClick={() => setCategoryFilter(cat.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 border flex-shrink-0 ${
              categoryFilter === cat.name
                ? "bg-white/10 border-white/20 text-white shadow-sm shadow-black/10"
                : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 hover:border-white/10"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

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
            {filteredTasks.map((task) => {
              const originalIndex = tasks.findIndex((t) => t._id === task._id);
              return (
                <div
                  key={task._id}
                  draggable={isDragEnabled}
                  onDragStart={(e) => handleDragStart(e, originalIndex)}
                  onDragOver={(e) => handleDragOver(e, originalIndex)}
                  onDragEnd={handleDragEnd}
                  className={`glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all duration-300 relative group overflow-hidden ${
                    task.completed ? "opacity-75" : ""
                  } ${draggedIndex === originalIndex ? "opacity-40 border border-dashed border-meta-blue" : ""}`}
                  style={{
                    boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                    cursor: isDragEnabled ? "grab" : "default",
                  }}
                >
                  {/* Glow bar for completed vs pending */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                      task.completed ? "bg-emerald-500" : "bg-meta-blue"
                    }`} 
                  />

                  {/* Drag handle */}
                  {isDragEnabled && (
                    <div 
                      className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-0.5"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`font-bold text-base leading-snug truncate text-white transition-all duration-200 ${
                          task.completed ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      {renderCategoryBadge(task.category)}
                    </div>
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
              );
            })}
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white bg-slate-900 border border-white/10 focus:border-meta-blue outline-none appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.2em",
              }}
            >
              <option value="None">None (Uncategorized)</option>
              <option value="Work">💼 Work</option>
              <option value="Personal">🏠 Personal</option>
              <option value="Urgent">⚠️ Urgent</option>
            </select>
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white bg-slate-900 border border-white/10 focus:border-meta-blue outline-none appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.2em",
              }}
            >
              <option value="None">None (Uncategorized)</option>
              <option value="Work">💼 Work</option>
              <option value="Personal">🏠 Personal</option>
              <option value="Urgent">⚠️ Urgent</option>
            </select>
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
