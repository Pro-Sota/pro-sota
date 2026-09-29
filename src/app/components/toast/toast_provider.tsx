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

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
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

  const timers = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
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
    (message: string, duration = DEFAULT_DURATION) => {
      return toast({
        type: "success",
        message,
        duration,
      });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, duration = DEFAULT_DURATION) => {
      return toast({
        type: "error",
        message,
        duration,
      });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, duration = DEFAULT_DURATION) => {
      return toast({
        type: "info",
        message,
        duration,
      });
    },
    [toast]
  );

  const dismissAll = useCallback(() => {
    timers.current.forEach((timer) => {
      clearTimeout(timer);
    });

    timers.current.clear();

    setToasts([]);
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => {
        clearTimeout(timer);
      });

      timers.current.clear();
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
    }),
    [
      toast,
      success,
      error,
      info,
      dismiss,
      dismissAll,
    ]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <ToastContainer
        toasts={toasts}
        onDismissAction={dismiss}
      />
    </ToastContext.Provider>
  );
}
