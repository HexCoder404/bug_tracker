import React, { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBugs } from "../contexts/BugContext";
import { cn } from "../utils/cn";
import type { Bug, BugPriority, BugStatus } from "../types";
import {
  Bug as BugIcon,
  Plus,
  LogOut,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Tag,
  User,
  Calendar,
  Trash2,
  Edit3,
  X,
  Send,
  AlertCircle,
  Zap,
} from "lucide-react";

const priorityConfig: Record<
  BugPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: "Low",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  high: {
    label: "High",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
};

const statusConfig: Record<
  BugStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  open: {
    label: "Open",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  resolved: {
    label: "Resolved",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  closed: {
    label: "Closed",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const colors = [
    "bg-indigo-500",
    "bg-pink-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  const sizeClass = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <div
      className={cn(
        sizeClass,
        color,
        "rounded-full flex items-center justify-center text-white font-medium shrink-0",
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">{label}</span>
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            color,
          )}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function BugFormModal({
  onClose,
  editBug,
}: {
  onClose: () => void;
  editBug?: Bug;
}) {
  const { user } = useAuth();
  const { addBug, updateBug } = useBugs();
  const [title, setTitle] = useState(editBug?.title || "");
  const [description, setDescription] = useState(editBug?.description || "");
  const [priority, setPriority] = useState<BugPriority>(
    editBug?.priority || "medium",
  );
  const [status, setStatus] = useState<BugStatus>(editBug?.status || "open");
  const [assignee, setAssignee] = useState(editBug?.assignee || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(editBug?.tags || []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      if (editBug) {
        await updateBug(editBug.id, {
          title,
          description,
          priority,
          status,
          assignee,
          tags,
        });
      } else {
        await addBug({
          title,
          description,
          priority,
          status,
          assignee,
          reporter: user.id,
          reporterName: user.username,
          tags,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">
            {editBug ? "Edit Bug" : "Report New Bug"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Brief description of the bug"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              placeholder="Detailed description, steps to reproduce..."
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as BugPriority)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BugStatus)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Assignee
            </label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Username of assignee"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Add tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition cursor-pointer"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-white transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white rounded-lg transition shadow-lg shadow-indigo-500/25 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading
                ? editBug
                  ? "Updating..."
                  : "Creating..."
                : editBug
                  ? "Update Bug"
                  : "Create Bug"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BugDetailModal({ bug, onClose }: { bug: Bug; onClose: () => void }) {
  const { user } = useAuth();
  const { addComment, updateBug, deleteBug } = useBugs();
  const [commentText, setCommentText] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setLoading(true);
    try {
      await addComment(bug.id, {
        bugId: bug.id,
        userId: user.id,
        username: user.username,
        text: commentText.trim(),
      });
      setCommentText("");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bug?")) {
      setLoading(true);
      try {
        await deleteBug(bug.id);
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (status: BugStatus) => {
    setLoading(true);
    try {
      await updateBug(bug.id, { status });
    } finally {
      setLoading(false);
    }
  };

  if (showEdit) {
    return (
      <BugFormModal
        onClose={() => {
          setShowEdit(false);
          onClose();
        }}
        editBug={bug}
      />
    );
  }

  const pri = priorityConfig[bug.priority];
  const sta = statusConfig[bug.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    pri.bg,
                    pri.color,
                    pri.border,
                  )}
                >
                  {pri.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    sta.bg,
                    sta.color,
                  )}
                >
                  {sta.icon}
                  {sta.label}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-white">{bug.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-slate-300 whitespace-pre-wrap">
              {bug.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Reporter</p>
              <div className="flex items-center gap-2">
                <Avatar name={bug.reporterName} size="sm" />
                <span className="text-sm text-white">{bug.reporterName}</span>
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Assignee</p>
              <div className="flex items-center gap-2">
                {bug.assignee ? (
                  <>
                    <Avatar name={bug.assignee} size="sm" />
                    <span className="text-sm text-white">{bug.assignee}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">Unassigned</span>
                )}
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Created</p>
              <p className="text-sm text-white">
                {new Date(bug.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Updated</p>
              <p className="text-sm text-white">
                {new Date(bug.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {bug.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {bug.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quick Status Update
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusConfig) as BugStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border",
                    bug.status === s
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700",
                  )}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({bug.comments.length})
            </h3>

            {bug.comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {bug.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-slate-700/30 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar name={comment.username} size="sm" />
                      <span className="text-sm font-medium text-white">
                        {comment.username}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 pl-8">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={loading}
                placeholder="Add a comment..."
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || loading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { bugs, getStats } = useBugs();
  const [showNewBug, setShowNewBug] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">(
    "newest",
  );

  const stats = getStats();

  const filteredBugs = useMemo(() => {
    let result = [...bugs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some((t) => t.includes(q)) ||
          b.assignee.toLowerCase().includes(q),
      );
    }

    if (filterPriority !== "all") {
      result = result.filter((b) => b.priority === filterPriority);
    }

    if (filterStatus !== "all") {
      result = result.filter((b) => b.status === filterStatus);
    }

    const priorityOrder: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sortBy === "priority") {
      result.sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
      );
    }

    return result;
  }, [bugs, searchQuery, filterPriority, filterStatus, sortBy]);

  // Re-fetch selectedBug from bugs list so comments/status updates are reflected
  const activeBug = selectedBug
    ? bugs.find((b) => b.id === selectedBug.id) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BugIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              BugHive
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewBug(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Bug</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <Avatar name={user?.username || "U"} />
              <span className="text-sm text-slate-300 hidden sm:block">
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          <StatCard
            label="Total Bugs"
            value={stats.total}
            icon={<BugIcon className="w-4 h-4 text-white" />}
            color="bg-indigo-500/20"
          />
          <StatCard
            label="Open"
            value={stats.open}
            icon={<AlertCircle className="w-4 h-4 text-blue-400" />}
            color="bg-blue-500/20"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Clock className="w-4 h-4 text-amber-400" />}
            color="bg-amber-500/20"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
            color="bg-emerald-500/20"
          />
          <StatCard
            label="Closed"
            value={stats.closed}
            icon={<XCircle className="w-4 h-4 text-slate-400" />}
            color="bg-slate-500/20"
          />
          <StatCard
            label="Critical"
            value={stats.critical}
            icon={<Zap className="w-4 h-4 text-red-400" />}
            color="bg-red-500/20"
          />
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bugs by title, description, tags, or assignee..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "priority")
                }
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bug List */}
        <div className="space-y-3">
          {filteredBugs.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
              <BugIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                No bugs found
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery ||
                filterPriority !== "all" ||
                filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : 'Click "New Bug" to report your first bug'}
              </p>
              {!searchQuery &&
                filterPriority === "all" &&
                filterStatus === "all" && (
                  <button
                    onClick={() => setShowNewBug(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                  >
                    Report a Bug
                  </button>
                )}
            </div>
          ) : (
            filteredBugs.map((bug) => {
              const pri = priorityConfig[bug.priority];
              const sta = statusConfig[bug.status];
              return (
                <div
                  key={bug.id}
                  onClick={() => setSelectedBug(bug)}
                  className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600/50 rounded-xl p-4 md:p-5 cursor-pointer transition group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        bug.priority === "critical"
                          ? "bg-red-400 animate-pulse"
                          : bug.priority === "high"
                            ? "bg-orange-400"
                            : bug.priority === "medium"
                              ? "bg-yellow-400"
                              : "bg-emerald-400",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="text-white font-medium group-hover:text-indigo-300 transition truncate">
                          {bug.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                              pri.bg,
                              pri.color,
                              pri.border,
                            )}
                          >
                            {pri.label}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                              sta.bg,
                              sta.color,
                            )}
                          >
                            {sta.icon}
                            <span className="hidden sm:inline">
                              {sta.label}
                            </span>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1 mb-2">
                        {bug.description}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {bug.assignee && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <User className="w-3 h-3" />
                            {bug.assignee}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(bug.createdAt).toLocaleDateString()}
                        </div>
                        {bug.comments.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MessageSquare className="w-3 h-3" />
                            {bug.comments.length}
                          </div>
                        )}
                        {bug.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {bug.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {bug.tags.length > 3 && (
                              <span className="text-xs text-slate-500">
                                +{bug.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-center text-sm text-slate-500 py-4">
          Showing {filteredBugs.length} of {bugs.length} bugs
        </div>
      </main>

      {/* Modals */}
      {showNewBug && <BugFormModal onClose={() => setShowNewBug(false)} />}
      {activeBug && (
        <BugDetailModal bug={activeBug} onClose={() => setSelectedBug(null)} />
      )}
    </div>
  );
}
