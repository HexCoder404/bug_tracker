import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BugProvider } from './contexts/BugContext';
import { LoginPage, RegisterPage } from './components/AuthPages';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    if (authPage === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthPage('register')} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BugProvider>
        <AppContent />
      </BugProvider>
    </AuthProvider>
  );
}
