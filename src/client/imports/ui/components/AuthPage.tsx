import React, { useState } from "react";
import { apiService, AuthResponse } from "../../api/apiService";
import { Mail, Lock, User as UserIcon, LogIn, UserPlus } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: (token: string) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setIsLoading(true);
    try {
      let res: AuthResponse;
      if (isLogin) {
        res = await apiService.login(email, password);
        showToast("Welcome back to TaskFlow!", "success");
      } else {
        res = await apiService.register(name, email, password);
        showToast("Account created successfully!", "success");
      }
      onAuthSuccess(res.token);
    } catch (err: any) {
      showToast(err.message || "An error occurred during authentication", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4">
      {/* Background Image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-25"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030014]/40 to-[#030014] pointer-events-none" />

      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-meta-blue/15 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-meta-blue-dark/15 blur-3xl pointer-events-none animate-float-reverse" />

      {/* Main glass panel */}
      <div
        className="w-full max-w-md rounded-2xl glass-panel p-8 relative z-10"
        style={{
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-meta-blue-dark to-meta-blue shadow-lg mb-4 text-white font-extrabold text-xl tracking-tight">
            TF
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-meta-blue">
            taskflow
          </h1>
          <p className="text-sm text-slate-400 font-light">
            {isLogin ? "Log in to your workspace dashboard" : "Create your collaborative workspace"}
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="flex p-1 mb-8 rounded-xl bg-white/5 border border-white/5 relative z-10">
          <button
            onClick={() => {
              setIsLogin(true);
              setName("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isLogin
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setName("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              !isLogin
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-meta-blue-dark via-meta-blue to-meta-blue-dark hover:brightness-110 transition-all duration-300 shadow-lg shadow-meta-blue/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
