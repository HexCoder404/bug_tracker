import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'bughive_users';
const CURRENT_USER_KEY = 'bughive_current_user';

const avatarColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
    // Create default demo user
    const demoUser: User = {
      id: 'user-1',
      username: 'demo',
      email: 'demo@example.com',
      password: 'demo123',
      avatar: getAvatarColor('demo'),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]));
    return [demoUser];
  });

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  }, [users]);

  const register = useCallback((username: string, email: string, password: string) => {
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      avatar: getAvatarColor(username),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
