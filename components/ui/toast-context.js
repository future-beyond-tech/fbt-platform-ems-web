"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

const toastTypeConfig = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50",
    iconClass: "text-emerald-600",
  },
  error: {
    icon: CircleAlert,
    className: "border-red-200 bg-red-50",
    iconClass: "text-red-600",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50",
    iconClass: "text-blue-600",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, type = "info", duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);

      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  useEffect(() => {
    const handler = (event) => {
      if (!event.detail?.message) return;
      addToast({
        type: "error",
        title: event.detail.status ? `Request failed (${event.detail.status})` : "Request failed",
        description: event.detail.message,
      });
    };

    window.addEventListener("api:error", handler);
    return () => window.removeEventListener("api:error", handler);
  }, [addToast]);

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
    }),
    [addToast, removeToast, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const config = toastTypeConfig[toast.type] || toastTypeConfig.info;
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
                "animate-[slide-in_250ms_ease-out]",
                config.className,
              )}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className={cn("mt-0.5", config.iconClass)} />
                <div className="flex-1">
                  {toast.title ? <p className="text-sm font-semibold text-slate-900">{toast.title}</p> : null}
                  {toast.description ? <p className="mt-1 text-xs text-slate-700">{toast.description}</p> : null}
                </div>
                <button
                  aria-label="Dismiss notification"
                  className="text-slate-500 transition hover:text-slate-800"
                  onClick={() => removeToast(toast.id)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
