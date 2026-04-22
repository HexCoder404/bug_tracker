import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Workspace } from '../types';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace | null) => void;
  createWorkspace: (name: string, description: string, ownerId: string, ownerName: string) => Workspace;
  joinWorkspace: (code: string, userId: string) => { success: boolean; error?: string; workspace?: Workspace };
  leaveWorkspace: (workspaceId: string, userId: string) => void;
  deleteWorkspace: (workspaceId: string) => void;
  getUserWorkspaces: (userId: string) => Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const WORKSPACES_KEY = 'bughive_workspaces';
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const stored = localStorage.getItem(WORKSPACES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(() => {
    const storedId = localStorage.getItem(ACTIVE_WS_KEY);
    if (!storedId) return null;
    const stored = localStorage.getItem(WORKSPACES_KEY);
    if (!stored) return null;
    const wsList: Workspace[] = JSON.parse(stored);
    return wsList.find(w => w.id === storedId) || null;
  });

  useEffect(() => {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    // Keep activeWorkspace in sync if it was updated
    if (activeWorkspace) {
      const updated = workspaces.find(w => w.id === activeWorkspace.id);
      if (updated) setActiveWorkspaceState(updated);
    }
  }, [workspaces]);

  const setActiveWorkspace = useCallback((ws: Workspace | null) => {
    setActiveWorkspaceState(ws);
    if (ws) {
      localStorage.setItem(ACTIVE_WS_KEY, ws.id);
    } else {
      localStorage.removeItem(ACTIVE_WS_KEY);
    }
  }, []);

  const createWorkspace = useCallback((name: string, description: string, ownerId: string, ownerName: string): Workspace => {
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
    setWorkspaces(prev => [...prev, newWs]);
    return newWs;
  }, []);

  const joinWorkspace = useCallback((code: string, userId: string): { success: boolean; error?: string; workspace?: Workspace } => {
    const ws = workspaces.find(w => w.inviteCode === code.toUpperCase().trim());
    if (!ws) return { success: false, error: 'Invalid invite code. Please check and try again.' };
    if (ws.memberIds.includes(userId)) {
      return { success: false, error: 'You are already a member of this workspace.', workspace: ws };
    }
    setWorkspaces(prev => prev.map(w =>
      w.id === ws.id ? { ...w, memberIds: [...w.memberIds, userId] } : w
    ));
    return { success: true, workspace: ws };
  }, [workspaces]);

  const leaveWorkspace = useCallback((workspaceId: string, userId: string) => {
    setWorkspaces(prev => prev.map(w =>
      w.id === workspaceId ? { ...w, memberIds: w.memberIds.filter(id => id !== userId) } : w
    ));
    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace(null);
    }
  }, [activeWorkspace, setActiveWorkspace]);

  const deleteWorkspace = useCallback((workspaceId: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace(null);
    }
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
