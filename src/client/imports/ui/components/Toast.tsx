import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const config = {
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      title: "Success",
    },
    error: {
      bg: "bg-rose-500/10 border-rose-500/20 text-rose-300",
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      title: "Error",
    },
    info: {
      bg: "bg-blue-500/10 border-blue-500/20 text-blue-300",
      icon: <Info className="w-5 h-5 text-blue-400" />,
      title: "Information",
    },
  }[toast.type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 max-w-sm w-full animate-slide-in ${config.bg}`}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm tracking-wide text-white/90">{config.title}</h4>
        <p className="text-xs mt-1 text-slate-300 leading-relaxed font-light">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors duration-150 p-0.5 rounded-lg hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
