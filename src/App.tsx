import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BugProvider } from "./contexts/BugContext";
import { LoginPage, RegisterPage } from "./components/AuthPages";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [authPage, setAuthPage] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authPage === "login") {
      return <LoginPage onSwitchToRegister={() => setAuthPage("register")} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthPage("login")} />;
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
