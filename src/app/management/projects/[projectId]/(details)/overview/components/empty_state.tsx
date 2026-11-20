import type { ComponentType } from "react";

import { LABELS } from "../constants";

type EmptyStateProps = {
  icon: ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  title: string;
  message?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  message = LABELS.dataWillAppear,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        <Icon size={20} className="text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
    </div>
  );
}