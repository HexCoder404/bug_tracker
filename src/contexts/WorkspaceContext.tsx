import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Workspace } from '../types';
import { supabase } from '../lib/supabase';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace | null) => void;
  createWorkspace: (name: string, description: string, ownerId: string, ownerName: string) => Promise<Workspace | null>;
  joinWorkspace: (code: string, userId: string) => Promise<{ success: boolean; error?: string; workspace?: Workspace }>;
  leaveWorkspace: (workspaceId: string, userId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  getUserWorkspaces: (userId: string) => Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const ACTIVE_WS_KEY = 'bughive_active_workspace';

const WORKSPACE_COLORS = [
  'indigo', 'violet', 'sky', 'emerald', 'rose', 'amber', 'teal', 'fuchsia',
];

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);

  // Fetch all workspaces and their members
  useEffect(() => {
    const fetchWorkspaces = async () => {
      const { data: wsData, error: wsError } = await supabase.from('workspaces').select('*');
      const { data: memberData, error: memberError } = await supabase.from('workspace_members').select('*');

      if (wsError || memberError) {
        console.error('Error fetching workspaces:', wsError, memberError);
        return;
      }

      if (wsData) {
        const assembledWorkspaces: Workspace[] = wsData.map((w: any) => {
          const members = memberData ? memberData.filter((m: any) => m.workspaceId === w.id).map((m: any) => m.userId) : [];
          return { ...w, memberIds: members };
        });
        
        setWorkspaces(assembledWorkspaces);

        // Restore active workspace from localStorage after workspaces are loaded
        const storedId = localStorage.getItem(ACTIVE_WS_KEY);
        if (storedId) {
          const found = assembledWorkspaces.find(ws => ws.id === storedId);
          if (found) setActiveWorkspaceState(found);
        }
      }
    };
    fetchWorkspaces();
  }, []);

  // Sync active workspace to localStorage
  const setActiveWorkspace = useCallback((ws: Workspace | null) => {
    setActiveWorkspaceState(ws);
    if (ws) {
      localStorage.setItem(ACTIVE_WS_KEY, ws.id);
    } else {
      localStorage.removeItem(ACTIVE_WS_KEY);
    }
  }, []);

  const createWorkspace = useCallback(async (name: string, description: string, ownerId: string, ownerName: string): Promise<Workspace | null> => {
    const colorIdx = Math.floor(Math.random() * WORKSPACE_COLORS.length);
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      description,
      ownerId,
      ownerName,
      memberIds: [ownerId],
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
      color: WORKSPACE_COLORS[colorIdx],
    };

    // Optimistic UI
    setWorkspaces(prev => [...prev, newWs]);

    // Supabase Sync
    const { memberIds, ...wsDbData } = newWs;
    const { error: wsError } = await supabase.from('workspaces').insert(wsDbData);
    if (wsError) {
      console.error('Failed to create workspace:', wsError);
      return null;
    }

    // Insert owner as a member
    const { error: memberError } = await supabase.from('workspace_members').insert({
      workspaceId: newWs.id,
      userId: ownerId
    });
    
    if (memberError) console.error('Failed to add workspace member:', memberError);

    return newWs;
  }, []);

  const joinWorkspace = useCallback(async (code: string, userId: string): Promise<{ success: boolean; error?: string; workspace?: Workspace }> => {
    const ws = workspaces.find(w => w.inviteCode === code.toUpperCase().trim());
    if (!ws) return { success: false, error: 'Invalid invite code. Please check and try again.' };
    
    if (ws.memberIds.includes(userId)) {
      return { success: false, error: 'You are already a member of this workspace.', workspace: ws };
    }

    // Optimistic UI
    setWorkspaces(prev => prev.map(w =>
      w.id === ws.id ? { ...w, memberIds: [...w.memberIds, userId] } : w
    ));

    // Supabase Sync
    const { error } = await supabase.from('workspace_members').insert({
      workspaceId: ws.id,
      userId
    });

    if (error) {
      console.error('Failed to join workspace:', error);
      return { success: false, error: 'Failed to join workspace' };
    }

    return { success: true, workspace: ws };
  }, [workspaces]);

  const leaveWorkspace = useCallback(async (workspaceId: string, userId: string) => {
    // Optimistic UI
    setWorkspaces(prev => prev.map(w =>
      w.id === workspaceId ? { ...w, memberIds: w.memberIds.filter(id => id !== userId) } : w
    ));

    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace(null);
    }

    // Supabase Sync
    const { error } = await supabase.from('workspace_members').delete().match({ workspaceId, userId });
    if (error) console.error('Failed to leave workspace:', error);
  }, [activeWorkspace, setActiveWorkspace]);

  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    // Optimistic UI
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));

    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace(null);
    }

    // Supabase Sync (Cascades will handle members and bugs)
    const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId);
    if (error) console.error('Failed to delete workspace:', error);
  }, [activeWorkspace, setActiveWorkspace]);

  const getUserWorkspaces = useCallback((userId: string): Workspace[] => {
    return workspaces.filter(w => w.memberIds.includes(userId));
  }, [workspaces]);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      setActiveWorkspace,
      createWorkspace,
      joinWorkspace,
      leaveWorkspace,
      deleteWorkspace,
      getUserWorkspaces,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
}
