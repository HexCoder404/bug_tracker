import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useBugs } from '../contexts/BugContext';
import type { Workspace } from '../types';
import {
  Bug,
  Plus,
  LogOut,
  Users,
  Hash,
  Copy,
  Check,
  ArrowRight,
  Trash2,
  X,
  Lock,
  Crown,
  AlertCircle,
  FolderOpen,
  Zap,
} from 'lucide-react';
import { cn } from '../utils/cn';

// Colour accent per workspace color name
const COLOR_TEXT: Record<string, string> = {
  indigo:  'text-indigo-400',
  violet:  'text-violet-400',
  sky:     'text-sky-400',
  emerald: 'text-emerald-400',
  rose:    'text-rose-400',
  amber:   'text-amber-400',
  teal:    'text-teal-400',
  fuchsia: 'text-fuchsia-400',
};
const COLOR_ICON_BG: Record<string, string> = {
  indigo:  'bg-indigo-500/20',
  violet:  'bg-violet-500/20',
  sky:     'bg-sky-500/20',
  emerald: 'bg-emerald-500/20',
  rose:    'bg-rose-500/20',
  amber:   'bg-amber-500/20',
  teal:    'bg-teal-500/20',
  fuchsia: 'bg-fuchsia-500/20',
};
const COLOR_DOT: Record<string, string> = {
  indigo:  'bg-indigo-500',
  violet:  'bg-violet-500',
  sky:     'bg-sky-500',
  emerald: 'bg-emerald-500',
  rose:    'bg-rose-500',
  amber:   'bg-amber-500',
  teal:    'bg-teal-500',
  fuchsia: 'bg-fuchsia-500',
};

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-violet-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';
  return (
    <div className={cn(sizeClass, color, 'rounded-full flex items-center justify-center text-white font-bold shrink-0')}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="p-1 rounded hover:bg-slate-700 transition cursor-pointer" title="Copy invite code">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />}
    </button>
  );
}

/* ── Create Workspace Modal ─────────────────────────────── */
function CreateWorkspaceModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { createWorkspace, setActiveWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    const ws = await createWorkspace(name.trim(), description.trim(), user.id, user.username);
    if (ws) {
      setActiveWorkspace(ws);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">New Workspace</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Workspace Name *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} autoFocus required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="e.g. Frontend Team, API Squad..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              placeholder="What is this workspace for?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg transition cursor-pointer">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-lg shadow-indigo-500/25 font-medium cursor-pointer flex items-center justify-center gap-2">
              Create Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Join Workspace Modal ───────────────────────────────── */
function JoinWorkspaceModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { joinWorkspace, setActiveWorkspace } = useWorkspace();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    const result = await joinWorkspace(code, user.id);
    if (result.success && result.workspace) {
      setActiveWorkspace(result.workspace);
      onClose();
    } else if (result.error === 'You are already a member of this workspace.' && result.workspace) {
      setActiveWorkspace(result.workspace);
      onClose();
    } else {
      setError(result.error || 'Failed to join workspace');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Join Workspace</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Invite Code</label>
            <input
              type="text" autoFocus required maxLength={8}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono text-xl tracking-widest text-center uppercase"
              placeholder="XXXXXXXX"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">Enter the 8-character code shared by your workspace owner</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg transition cursor-pointer">Cancel</button>
            <button
              type="submit" disabled={code.length !== 8}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition shadow-lg shadow-indigo-500/25 font-medium cursor-pointer"
            >
              Join Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Workspace Card ─────────────────────────────────────── */
function WorkspaceCard({ workspace, onEnter }: { workspace: Workspace; onEnter: () => void }) {
  const { user } = useAuth();
  const { getWorkspaceStats } = useBugs();
  const { leaveWorkspace, deleteWorkspace } = useWorkspace();

  const stats = getWorkspaceStats(workspace.id);
  const isOwner = workspace.ownerId === user?.id;
  const iconBg = COLOR_ICON_BG[workspace.color] || COLOR_ICON_BG.indigo;
  const dotBg  = COLOR_DOT[workspace.color]    || COLOR_DOT.indigo;
  const textC  = COLOR_TEXT[workspace.color]   || COLOR_TEXT.indigo;

  const handleLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Leave workspace "${workspace.name}"?`)) leaveWorkspace(workspace.id, user!.id);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete workspace "${workspace.name}"? This removes all bugs.`)) deleteWorkspace(workspace.id);
  };

  return (
    <div
      onClick={onEnter}
      className="group bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600/50 rounded-xl p-5 cursor-pointer transition"
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          <Lock className={cn('w-4 h-4', textC)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-medium group-hover:text-indigo-300 transition truncate">{workspace.name}</h3>
            {isOwner && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs">
                <Crown className="w-3 h-3" />Owner
              </span>
            )}
          </div>
          {workspace.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{workspace.description}</p>
          )}
        </div>
        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          {isOwner ? (
            <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition cursor-pointer" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={handleLeave} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition cursor-pointer" title="Leave">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <div className={cn('w-1.5 h-1.5 rounded-full', dotBg)} />
          {stats.total} bug{stats.total !== 1 ? 's' : ''}
        </div>
        {stats.open > 0 && <span className="text-xs text-blue-400">{stats.open} open</span>}
        {stats.inProgress > 0 && <span className="text-xs text-amber-400">{stats.inProgress} in progress</span>}
        {stats.critical > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-red-400">
            <Zap className="w-3 h-3" />{stats.critical} critical
          </span>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="w-3.5 h-3.5" />
          {workspace.memberIds.length} member{workspace.memberIds.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1">
          <Hash className={cn('w-3 h-3', textC)} />
          <span className={cn('font-mono text-xs', textC)}>{workspace.inviteCode}</span>
          <CopyButton text={workspace.inviteCode} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function WorkspacesPage({ onEnterWorkspace }: { onEnterWorkspace: () => void }) {
  const { user, logout } = useAuth();
  const { getUserWorkspaces, setActiveWorkspace } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin,   setShowJoin]   = useState(false);

  const userWorkspaces = user ? getUserWorkspaces(user.id) : [];

  const handleEnter = (ws: Workspace) => {
    setActiveWorkspace(ws);
    onEnterWorkspace();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header — identical to dashboard */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">BugHive</h1>
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={user?.username || 'U'} />
            <span className="text-sm text-slate-300 hidden sm:block">{user?.username}</span>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">My Workspaces</h2>
            <p className="text-slate-400 text-sm mt-0.5">Select a workspace to start tracking bugs</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition text-sm font-medium cursor-pointer"
            >
              <Hash className="w-4 h-4" />
              Join with Code
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-sm font-medium shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Workspace
            </button>
          </div>
        </div>

        {/* Workspace grid or empty state */}
        {userWorkspaces.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No workspaces yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Create your first workspace to start tracking bugs, or join one using an invite code.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowJoin(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition text-sm font-medium cursor-pointer"
              >
                <Hash className="w-4 h-4" />Join with Code
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-sm font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4" />Create Workspace
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {userWorkspaces.map(ws => (
              <WorkspaceCard key={ws.id} workspace={ws} onEnter={() => handleEnter(ws)} />
            ))}

            {/* Add workspace card */}
            <button
              onClick={() => setShowCreate(true)}
              className="group border border-dashed border-slate-700 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[160px] transition cursor-pointer hover:bg-indigo-500/5"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-700/50 group-hover:bg-indigo-500/10 flex items-center justify-center transition">
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
              </div>
              <span className="text-slate-500 group-hover:text-slate-300 text-sm font-medium transition">New workspace</span>
            </button>
          </div>
        )}
      </main>

      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinWorkspaceModal   onClose={() => setShowJoin(false)} />}
    </div>
  );
}
