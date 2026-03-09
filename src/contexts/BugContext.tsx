import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Bug, Comment } from '../types';

interface BugContextType {
  bugs: Bug[];
  addBug: (bug: Omit<Bug, 'id' | 'comments' | 'createdAt' | 'updatedAt'>) => void;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  deleteBug: (id: string) => void;
  addComment: (bugId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getBugById: (id: string) => Bug | undefined;
  getStats: () => { open: number; inProgress: number; resolved: number; closed: number; total: number; critical: number };
}

const BugContext = createContext<BugContextType | null>(null);

const BUGS_KEY = 'bughive_bugs';

const defaultBugs: Bug[] = [
  {
    id: 'bug-1',
    title: 'Login page crashes on mobile devices',
    description: 'When users try to log in on mobile devices (both iOS and Android), the page crashes after entering credentials. This affects all mobile browsers.',
    priority: 'critical',
    status: 'open',
    assignee: 'demo',
    reporter: 'user-1',
    reporterName: 'demo',
    tags: ['mobile', 'auth', 'crash'],
    comments: [
      { id: 'c-1', bugId: 'bug-1', userId: 'user-1', username: 'demo', text: 'Reproduced on iPhone 14 with Safari', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'bug-2',
    title: 'Dashboard charts not rendering correctly',
    description: 'The pie charts on the analytics dashboard are overlapping with the legend when screen width is between 768px and 1024px.',
    priority: 'medium',
    status: 'in-progress',
    assignee: 'demo',
    reporter: 'user-1',
    reporterName: 'demo',
    tags: ['ui', 'charts', 'responsive'],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bug-3',
    title: 'Email notifications sent twice',
    description: 'Users are receiving duplicate email notifications for every event. The issue started after the last deployment.',
    priority: 'high',
    status: 'resolved',
    assignee: 'demo',
    reporter: 'user-1',
    reporterName: 'demo',
    tags: ['email', 'notifications', 'backend'],
    comments: [
      { id: 'c-2', bugId: 'bug-3', userId: 'user-1', username: 'demo', text: 'Fixed by removing duplicate event listener in notification service', createdAt: new Date(Date.now() - 7200000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'bug-4',
    title: 'Typo in footer copyright text',
    description: 'The footer shows "Copyrght 2024" instead of "Copyright 2024".',
    priority: 'low',
    status: 'closed',
    assignee: 'demo',
    reporter: 'user-1',
    reporterName: 'demo',
    tags: ['typo', 'ui'],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'bug-5',
    title: 'Search functionality returns incorrect results',
    description: 'When searching for items with special characters (e.g., &, <, >), the search returns no results even when matching items exist in the database.',
    priority: 'high',
    status: 'open',
    assignee: '',
    reporter: 'user-1',
    reporterName: 'demo',
    tags: ['search', 'backend', 'encoding'],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function BugProvider({ children }: { children: React.ReactNode }) {
  const [bugs, setBugs] = useState<Bug[]>(() => {
    const stored = localStorage.getItem(BUGS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(BUGS_KEY, JSON.stringify(defaultBugs));
    return defaultBugs;
  });

  useEffect(() => {
    localStorage.setItem(BUGS_KEY, JSON.stringify(bugs));
  }, [bugs]);

  const addBug = useCallback((bug: Omit<Bug, 'id' | 'comments' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBug: Bug = {
      ...bug,
      id: `bug-${Date.now()}`,
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    setBugs(prev => [newBug, ...prev]);
  }, []);

  const updateBug = useCallback((id: string, updates: Partial<Bug>) => {
    setBugs(prev => prev.map(b =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    ));
  }, []);

  const deleteBug = useCallback((id: string) => {
    setBugs(prev => prev.filter(b => b.id !== id));
  }, []);

  const addComment = useCallback((bugId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBugs(prev => prev.map(b =>
      b.id === bugId
        ? { ...b, comments: [...b.comments, newComment], updatedAt: new Date().toISOString() }
        : b
    ));
  }, []);

  const getBugById = useCallback((id: string) => {
    return bugs.find(b => b.id === id);
  }, [bugs]);

  const getStats = useCallback(() => {
    return {
      open: bugs.filter(b => b.status === 'open').length,
      inProgress: bugs.filter(b => b.status === 'in-progress').length,
      resolved: bugs.filter(b => b.status === 'resolved').length,
      closed: bugs.filter(b => b.status === 'closed').length,
      total: bugs.length,
      critical: bugs.filter(b => b.priority === 'critical' && b.status !== 'closed').length,
    };
  }, [bugs]);

  return (
    <BugContext.Provider value={{ bugs, addBug, updateBug, deleteBug, addComment, getBugById, getStats }}>
      {children}
    </BugContext.Provider>
  );
}

export function useBugs() {
  const context = useContext(BugContext);
  if (!context) throw new Error('useBugs must be used within BugProvider');
  return context;
}
