import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Bug, Comment } from '../types';
import { supabase } from '../lib/supabase';

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

export function BugProvider({ children }: { children: React.ReactNode }) {
  const [bugs, setBugs] = useState<Bug[]>([]);

  useEffect(() => {
    const fetchBugs = async () => {
      const { data: bugsData, error: bugsError } = await supabase.from('bugs').select('*');
      const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*');

      if (bugsError || commentsError) {
        console.error('Error fetching bugs/comments:', bugsError, commentsError);
        return;
      }

      if (bugsData) {
        const assembledBugs: Bug[] = bugsData.map((b: any) => ({
          ...b,
          comments: commentsData ? commentsData.filter((c: any) => c.bugId === b.id) : []
        }));
        // Sort bugs by newest first
        assembledBugs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBugs(assembledBugs);
      }
    };
    fetchBugs();
  }, []);

  const addBug = useCallback(async (bug: Omit<Bug, 'id' | 'comments' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBug: Bug = {
      ...bug,
      id: `bug-${Date.now()}`,
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    
    // Optimistic UI update
    setBugs(prev => [newBug, ...prev]);

    // Supabase Sync
    const { comments, ...bugDataForDb } = newBug;
    const { error } = await supabase.from('bugs').insert(bugDataForDb);
    if (error) {
      console.error('Failed to add bug to Supabase:', error);
      // In a real app we might revert the optimistic update here
    }
  }, []);

  const updateBug = useCallback(async (id: string, updates: Partial<Bug>) => {
    const now = new Date().toISOString();
    // Optimistic UI update
    setBugs(prev => prev.map(b =>
      b.id === id ? { ...b, ...updates, updatedAt: now } : b
    ));

    // Supabase Sync
    const dbUpdates = { ...updates, updatedAt: now };
    delete dbUpdates.comments; // Don't try to update comments array in bugs table
    
    const { error } = await supabase.from('bugs').update(dbUpdates).eq('id', id);
    if (error) console.error('Failed to update bug in Supabase:', error);
  }, []);

  const deleteBug = useCallback(async (id: string) => {
    // Optimistic UI update
    setBugs(prev => prev.filter(b => b.id !== id));

    // Supabase Sync
    const { error } = await supabase.from('bugs').delete().eq('id', id);
    if (error) console.error('Failed to delete bug in Supabase:', error);
  }, []);

  const addComment = useCallback(async (bugId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    // Optimistic UI update
    setBugs(prev => prev.map(b =>
      b.id === bugId
        ? { ...b, comments: [...b.comments, newComment], updatedAt: new Date().toISOString() }
        : b
    ));

    // Supabase Sync
    const { error } = await supabase.from('comments').insert(newComment);
    if (error) console.error('Failed to add comment to Supabase:', error);
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
