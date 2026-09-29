"use client";

import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from "lucide-react";

import type { ToastContainerProps } from "./types";

export function ToastContainer({
  toasts,
  onDismissAction,
}: ToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  const iconMap = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      border: "border-emerald-200",
    },
    error: {
      icon: AlertCircle,
      iconClass: "text-red-600",
      border: "border-red-200",
    },
    info: {
      icon: Info,
      iconClass: "text-gray-600",
      border: "border-gray-200",
    },
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const config = iconMap[toast.type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${config.border}`}
          >
            <Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`}
              aria-hidden="true"
            />

            <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-gray-800">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => onDismissAction(toast.id)}
              aria-label="Fechar notificação"
              className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
