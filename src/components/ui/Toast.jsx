"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, Sparkles, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = "info", duration = 4000, action }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const toast = { id, title, message, type, action };
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, message, options) => addToast({ title, message, type: "success", ...options }),
    error: (title, message, options) => addToast({ title, message, type: "error", ...options }),
    warning: (title, message, options) => addToast({ title, message, type: "warning", ...options }),
    info: (title, message, options) => addToast({ title, message, type: "info", ...options }),
    ai: (title, message, options) => addToast({ title, message, type: "ai", ...options }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
            ai: <Sparkles className="w-5 h-5 text-purple-500 shrink-0 animate-pulse" />,
          };

          const borders = {
            success: "border-emerald-200/80 dark:border-emerald-900/50 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100",
            error: "border-rose-200/80 dark:border-rose-900/50 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100",
            warning: "border-amber-200/80 dark:border-amber-900/50 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100",
            info: "border-indigo-200/80 dark:border-indigo-900/50 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100",
            ai: "border-purple-200/80 dark:border-purple-900/50 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100",
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-xl flex items-start gap-3.5 animate-scale-in transition-all ${borders[t.type] || borders.info}`}
            >
              <div className="mt-0.5">{icons[t.type] || icons.info}</div>
              <div className="flex-1 min-w-0">
                {t.title && <h5 className="text-xs font-black">{t.title}</h5>}
                {t.message && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">{t.message}</p>}
                {t.action && (
                  <button
                    onClick={() => {
                      t.action.onClick?.();
                      removeToast(t.id);
                    }}
                    className="mt-2 text-[10px] font-black text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline cursor-pointer"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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
    return {
      success: console.log,
      error: console.error,
      warning: console.warn,
      info: console.info,
      ai: console.log,
      dismiss: () => {},
    };
  }
  return context;
}
