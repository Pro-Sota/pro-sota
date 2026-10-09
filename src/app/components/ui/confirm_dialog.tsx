
"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
};

type ConfirmDialogProps = {
  open: boolean;
  options: ConfirmDialogOptions;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  options,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const destructive = options.variant === "destructive";

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start gap-4 p-6">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              destructive
                ? "bg-red-50 text-red-600"
                : "bg-[#BD9655]/15 text-[#002950]"
            }`}
          >
            {destructive ? (
              <AlertTriangle size={22} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={22} aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-[#002950]"
            >
              {options.title}
            </h2>

            <p
              id="confirm-dialog-description"
              className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600"
            >
              {options.message}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Fechar diálogo"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {options.cancelText ?? "Cancelar"}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
            className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#002950] hover:bg-[#003b70]"
            }`}
          >
            {loading ? "A processar..." : options.confirmText ?? "Confirmar"}
          </button>
        </div>
      </section>
    </div>
  );
}