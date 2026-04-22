import React from 'react';
import {
  Bug,
  Shield,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Code2,
  Lock,
  GitBranch,
  Star,
  ChevronRight,
  Hash,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Private Workspaces',
    desc: 'Each team gets a fully isolated workspace. No cross-team data leakage — ever.',
    color: 'indigo',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Invite by Code',
    desc: 'Share a unique 8-character code with teammates. They join instantly, no email needed.',
    color: 'violet',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Real-time Bug Tracking',
    desc: 'Report, assign, and resolve bugs with priority levels and full comment threads.',
    color: 'amber',
  },
  {
    icon: <GitBranch className="w-5 h-5" />,
    title: 'Status Workflows',
    desc: 'Move bugs from Open → In Progress → Resolved → Closed with one click.',
    color: 'emerald',
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    title: 'Tag & Filter',
    desc: 'Organize with custom tags and filter by priority, status, or assignee instantly.',
    color: 'sky',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Role-based Access',
    desc: 'Workspace owners control membership. Only members can view and manage bugs.',
    color: 'red',
  },
];

const STATS = [
  { value: '10x', label: 'Faster bug resolution' },
  { value: '∞', label: 'Workspaces per user' },
  { value: '100%', label: 'Private & secure' },
  { value: '0', label: 'Setup required' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  indigo:  { bg: 'bg-indigo-500/20',  text: 'text-indigo-400',  border: 'border-indigo-500/20',  icon: 'bg-indigo-500/20' },
  violet:  { bg: 'bg-violet-500/20',  text: 'text-violet-400',  border: 'border-violet-500/20',  icon: 'bg-violet-500/20' },
  amber:   { bg: 'bg-amber-500/20',   text: 'text-amber-400',   border: 'border-amber-500/20',   icon: 'bg-amber-500/20' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20' },
  sky:     { bg: 'bg-sky-500/20',     text: 'text-sky-400',     border: 'border-sky-500/20',     icon: 'bg-sky-500/20' },
  red:     { bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/20',     icon: 'bg-red-500/20' },
};

export default function LandingPage({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar — matches dashboard header exactly */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">BugHive</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-slate-400 hover:text-white text-sm font-medium transition px-4 py-2 cursor-pointer hover:bg-slate-800 rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm">
            <Star className="w-3.5 h-3.5 fill-current" />
            Private workspaces with invite codes — now live
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-5">
            Track bugs.<br />
            <span className="text-indigo-400">Ship faster.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            BugHive brings teams together in private workspaces. Report, assign, and kill bugs with precision — joined by a single invite code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="group w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-lg transition cursor-pointer hover:bg-slate-800"
            >
              Sign in to your account
            </button>
          </div>
        </div>

        {/* Hero preview — matches dashboard bug list cards */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden max-w-2xl mx-auto shadow-2xl">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700/50">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Bug className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Frontend Team</span>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Hash className="w-3 h-3 text-indigo-400" />
              <span className="text-xs font-mono text-indigo-400">XK7P2MQR</span>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {[
              { title: 'Login page crashes on mobile', priority: 'Critical', status: 'Open', dot: 'bg-red-400 animate-pulse' },
              { title: 'Dashboard charts not rendering', priority: 'Medium', status: 'In Progress', dot: 'bg-yellow-400' },
              { title: 'Email sent twice on signup', priority: 'High', status: 'Resolved', dot: 'bg-orange-400' },
            ].map((bug, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${bug.dot}`} />
                <span className="text-sm text-white flex-1">{bug.title}</span>
                <span className={`text-xs font-medium ${i === 0 ? 'text-red-400' : i === 1 ? 'text-yellow-400' : 'text-orange-400'}`}>{bug.priority}</span>
                <span className="text-xs text-slate-400">{bug.status}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-700/50 flex items-center gap-2">
            <div className="flex -space-x-2">
              {['A', 'R', 'S'].map((l, i) => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold ${['bg-indigo-500', 'bg-violet-500', 'bg-sky-500'][i]}`}>{l}</div>
              ))}
            </div>
            <span className="text-xs text-slate-500">3 members · Invite code copied with one click</span>
          </div>
        </div>
      </section>

      {/* Stats — matches stat cards from dashboard */}
      <section className="border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 text-center">
                <p className="text-3xl font-extrabold text-indigo-400 mb-1">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Everything your team needs</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Purpose-built for developer teams who want clarity, not complexity.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/80 hover:border-slate-600/50 transition group">
                <div className={`w-9 h-9 rounded-lg ${c.icon} flex items-center justify-center ${c.text} mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Up and running in 3 steps</h2>
            <p className="text-slate-400">No configuration. No DevOps. Just sign up and go.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Create your workspace', desc: 'Sign up and create a named workspace for your project or team. You\'re the owner instantly.' },
              { step: '02', title: 'Share the invite code', desc: 'Copy the unique 8-character code and share it with teammates. They join with one click.' },
              { step: '03', title: 'Track & squash bugs', desc: 'Report bugs with priority & tags, assign them, discuss in comments, and mark resolved.' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <span className="text-4xl font-black text-slate-700 block mb-4">{item.step}</span>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <h3 className="text-white font-semibold">{item.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
            <Bug className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to squash bugs?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join thousands of developers using BugHive to ship cleaner software, faster.
          </p>
          <button
            onClick={onGetStarted}
            className="group bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-lg flex items-center gap-2 mx-auto transition shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            Create Your Free Workspace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Bug className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-400 text-sm">BugHive — Track, assign, and squash bugs.</span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 BugHive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
