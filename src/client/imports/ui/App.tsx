import React, { useState, useEffect } from "react";
import { getToken, setToken, removeToken } from "../api/apiService";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { ToastContainer, ToastData } from "./components/Toast";

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Function to enqueue a toast notification
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const newToast: ToastData = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  // Dismiss a toast by ID
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Check if user is already authenticated
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleAuthSuccess = (token: string) => {
    setToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    showToast("Successfully logged out.", "info");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-sm font-medium tracking-wide">Syncing workspace environment...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-meta-blue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-meta-blue-dark/10 blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {isAuthenticated ? (
          <Dashboard onLogout={handleLogout} showToast={showToast} />
        ) : (
          <AuthPage onAuthSuccess={handleAuthSuccess} showToast={showToast} />
        )}
      </main>

      {/* Global Notifications system */}
      <ToastContainer toasts={toasts} onClose={dismissToast} />
    </div>
  );
};
export default App;
