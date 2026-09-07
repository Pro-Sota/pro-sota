"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, Check, X } from "lucide-react";
import { INPUT_STYLE } from "../types";

/**
 * Breadcrumb component
 */
export function Breadcrumb({
  items,
  onNavigate,
}: {
  items: { label: string; href?: string }[];
  onNavigate?: (href: string) => void;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const href = item.href;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {href ? (
              <button
                type="button"
                onClick={() => onNavigate?.(href)}
                className="cursor-pointer text-slate-500 transition hover:text-[#1B3A5C] hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-medium text-slate-800">{item.label}</span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
          </span>
        );
      })}
    </nav>
  );
}

/**
 * Select component with styled dropdown indicator
 */
export function Select({
  children,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative">
        <select
          {...props}
          className={`${INPUT_STYLE} appearance-none pr-10 ${
            error ? "border-rose-200 bg-rose-50" : ""
          }`}
          onMouseDown={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setOpen(false);
            props.onChange?.(e);
          }}
        >
          {children}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-[180deg]" : ""
          }`}
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

/**
 * Input component with optional error display
 */
export function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <input
        {...props}
        className={`${INPUT_STYLE} ${error ? "border-rose-200 bg-rose-50" : ""}`}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

/**
 * Textarea component with optional error display
 */
export function Textarea({
  error,
  maxLength,
  value,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  maxLength?: number;
  value?: string;
}) {
  const currentLength = String(value || "").length;
  const remaining = maxLength ? maxLength - currentLength : 0;

  return (
    <div className="space-y-1">
      <textarea
        {...props}
        value={value}
        maxLength={maxLength}
        className={`${INPUT_STYLE} ${error ? "border-rose-200 bg-rose-50" : ""}`}
      />
      <div className="flex items-center justify-between">
        {error && <ErrorMessage message={error} />}
        {maxLength && (
          <span
            className={`ml-auto text-xs font-mono ${
              currentLength >= maxLength ? "text-rose-500" : "text-slate-400"
            }`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Currency input component
 */
export function CurrencyInputField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Only allow digits
    const digits = raw.replace(/\D/g, "");
    onChange(digits);
  };

  // Format for display
  const formatted =
    value === ""
      ? ""
      : new Intl.NumberFormat("pt-AO", {
          style: "currency",
          currency: "AOA",
          maximumFractionDigits: 0,
        }).format(Number(value));

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={formatted}
        onChange={handleChange}
        placeholder="0 Kz"
        className={`${INPUT_STYLE} ${error ? "border-rose-200 bg-rose-50" : ""}`}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

/**
 * Date input component
 */
export function DateInput({
  value,
  onChange,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={`${INPUT_STYLE} font-mono ${
          error ? "border-rose-200 bg-rose-50" : ""
        }`}
        {...props}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

/**
 * Error message component
 */
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-rose-600">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Success message component
 */
export function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      <Check className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Info message component
 */
export function InfoMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#1B3A5C]/10 bg-[#1B3A5C]/5 px-4 py-3 text-sm text-[#1B3A5C]">
      <span>{message}</span>
    </div>
  );
}

/**
 * Cancel confirmation dialog
 */
export function CancelConfirmDialog({
  onKeepEditing,
  onDiscard,
}: {
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Descartar este projecto?
        </h3>
        <p className="mt-1.5 text-sm text-slate-500">
          As informações que preencheu não foram guardadas e serão perdidas.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onKeepEditing}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Continuar a editar
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="cursor-pointer rounded-lg bg-rose-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Success screen
 */
export function SuccessScreen({
  projectName,
  projectId,
  onViewProject,
  onCreateAnother,
}: {
  projectName: string;
  projectId: string | null;
  onViewProject: () => void;
  onCreateAnother: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          Projecto criado com sucesso
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">
            {projectName || "O seu projecto"}
          </span>{" "}
          {projectId && (
            <>
              foi criado com o código{" "}
              <span className="font-mono text-slate-700">{projectId}</span>
            </>
          )}
          .
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreateAnother}
            className="flex-1 cursor-pointer rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Criar outro projecto
          </button>
          <button
            type="button"
            onClick={onViewProject}
            className="flex-1 cursor-pointer rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Ver projecto
          </button>
        </div>
      </div>
    </div>
  );
}