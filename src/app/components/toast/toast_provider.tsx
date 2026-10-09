
"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ToastContainer } from "./toast_container";

import type {
  Toast,
  ToastOptions,
} from "./types";
import ConfirmDialog, { ConfirmDialogOptions } from "../ui/confirm_dialog";

type PendingConfirmation = {
  options: ConfirmDialogOptions;
  resolve: (confirmed: boolean) => void;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export const ToastContext =
  createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmation, setConfirmation] =
    useState<PendingConfirmation | null>(null);

  const confirmationRef =
    useRef<PendingConfirmation | null>(null);

  const confirmationQueue =
    useRef<PendingConfirmation[]>([]);

  const timers = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.filter((item) => item.id !== id)
    );

    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({
      type = "info",
      message,
      duration = DEFAULT_DURATION,
    }: ToastOptions) => {
      const id = crypto.randomUUID();

      const newToast: Toast = {
        id,
        type,
        message,
        duration,
      };

      setToasts((current) => [...current, newToast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);

        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, duration = DEFAULT_DURATION) =>
      toast({ type: "success", message, duration }),
    [toast]
  );

  const error = useCallback(
    (message: string, duration = DEFAULT_DURATION) =>
      toast({ type: "error", message, duration }),
    [toast]
  );

  const info = useCallback(
    (message: string, duration = DEFAULT_DURATION) =>
      toast({ type: "info", message, duration }),
    [toast]
  );

  const dismissAll = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  const confirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const request: PendingConfirmation = {
          options,
          resolve,
        };

        if (!confirmationRef.current) {
          confirmationRef.current = request;
          setConfirmation(request);
        } else {
          confirmationQueue.current.push(request);
        }
      });
    },
    []
  );

  const resolveConfirmation = useCallback(
    (confirmed: boolean) => {
      const current = confirmationRef.current;

      if (!current) return;

      confirmationRef.current = null;
      setConfirmation(null);
      current.resolve(confirmed);

      const next = confirmationQueue.current.shift();

      if (next) {
        confirmationRef.current = next;
        setConfirmation(next);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();

      confirmationRef.current?.resolve(false);
      confirmationRef.current = null;

      confirmationQueue.current.forEach((item) => {
        item.resolve(false);
      });
      confirmationQueue.current = [];
    };
  }, []);

  const value = useMemo(
    () => ({
      toast,
      success,
      error,
      info,
      dismiss,
      dismissAll,
      confirm,
    }),
    [
      toast,
      success,
      error,
      info,
      dismiss,
      dismissAll,
      confirm,
    ]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <ToastContainer
        toasts={toasts}
        onDismissAction={dismiss}
      />

      <ConfirmDialog
        open={confirmation !== null}
        options={
          confirmation?.options ?? {
            title: "",
            message: "",
          }
        }
        onConfirm={() => resolveConfirmation(true)}
        onCancel={() => resolveConfirmation(false)}
      />
    </ToastContext.Provider>
  );
}