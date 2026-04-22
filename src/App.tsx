import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BugProvider } from './contexts/BugContext';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import { LoginPage, RegisterPage } from './components/AuthPages';
import LandingPage from './components/LandingPage';
import WorkspacesPage from './components/WorkspacesPage';
import Dashboard from './components/Dashboard';

type AppView = 'landing' | 'login' | 'register' | 'workspaces' | 'dashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [view, setView] = useState<AppView>('landing');

  // If authenticated and on landing/auth pages, redirect to workspaces
  if (isAuthenticated) {
    if (view === 'landing' || view === 'login' || view === 'register') {
      // Auto-advance to workspaces on first auth 
    }

    if (activeWorkspace && (view === 'workspaces' || view === 'dashboard')) {
      return (
        <Dashboard
          onBackToWorkspaces={() => {
            setActiveWorkspace(null);
            setView('workspaces');
          }}
        />
      );
    }

    if (view === 'dashboard' && !activeWorkspace) {
      // fallback: no workspace selected
      return (
        <WorkspacesPage onEnterWorkspace={() => setView('dashboard')} />
      );
    }

    // Default authenticated view
    return (
      <WorkspacesPage onEnterWorkspace={() => setView('dashboard')} />
    );
  }

  // Not authenticated
  if (view === 'login') {
    return <LoginPage onSwitchToRegister={() => setView('register')} />;
  }
  if (view === 'register') {
    return <RegisterPage onSwitchToLogin={() => setView('login')} />;
  }

  // Default: landing
  return (
    <LandingPage
      onGetStarted={() => setView('register')}
      onSignIn={() => setView('login')}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <BugProvider>
          <AppContent />
        </BugProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
