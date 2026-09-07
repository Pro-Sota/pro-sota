"use client";

import {
  ArrowRight,
} from "lucide-react";

import { useRouter } from "next/navigation";


export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>

      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 max-w-xs text-sm text-gray-500 text-center">
        {description}
      </p>

      {action && (
        <button
          onClick={() => router.push(action.href)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}