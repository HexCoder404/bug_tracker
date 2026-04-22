import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Bug, Comment } from '../types';

interface BugContextType {
  bugs: Bug[];
  addBug: (bug: Omit<Bug, 'id' | 'comments' | 'createdAt' | 'updatedAt'>) => void;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  deleteBug: (id: string) => void;
  addComment: (bugId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getBugById: (id: string) => Bug | undefined;
  getWorkspaceBugs: (workspaceId: string) => Bug[];
  getWorkspaceStats: (workspaceId: string) => { open: number; inProgress: number; resolved: number; closed: number; total: number; critical: number };
}

const BugContext = createContext<BugContextType | null>(null);

const BUGS_KEY = 'bughive_bugs';

export function BugProvider({ children }: { children: React.ReactNode }) {
  const [bugs, setBugs] = useState<Bug[]>(() => {
    const stored = localStorage.getItem(BUGS_KEY);
    if (stored) {
      const parsed: Bug[] = JSON.parse(stored);
      // Migrate old bugs that lack workspaceId
      return parsed.map(b => ({ ...b, workspaceId: b.workspaceId || '' }));
    }
    return [];
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

  const getWorkspaceBugs = useCallback((workspaceId: string) => {
    return bugs.filter(b => b.workspaceId === workspaceId);
  }, [bugs]);

  const getWorkspaceStats = useCallback((workspaceId: string) => {
    const wsBugs = bugs.filter(b => b.workspaceId === workspaceId);
    return {
      open: wsBugs.filter(b => b.status === 'open').length,
      inProgress: wsBugs.filter(b => b.status === 'in-progress').length,
      resolved: wsBugs.filter(b => b.status === 'resolved').length,
      closed: wsBugs.filter(b => b.status === 'closed').length,
      total: wsBugs.length,
      critical: wsBugs.filter(b => b.priority === 'critical' && b.status !== 'closed').length,
    };
  }, [bugs]);

  return (
    <BugContext.Provider value={{ bugs, addBug, updateBug, deleteBug, addComment, getBugById, getWorkspaceBugs, getWorkspaceStats }}>
      {children}
    </BugContext.Provider>
  );
}

export function useBugs() {
  const context = useContext(BugContext);
  if (!context) throw new Error('useBugs must be used within BugProvider');
  return context;
}
