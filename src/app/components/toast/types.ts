export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

export type ToastOptions = {
  type?: ToastType;
  message: string;
  duration?: number;
};

export type ToastContainerProps = {
  toasts: Toast[];
  onDismissAction: (id: string) => void;
};
