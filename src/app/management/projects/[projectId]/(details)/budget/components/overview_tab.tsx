import { ChevronRight, FileCheck2 } from "lucide-react";
import React from "react";

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p>
    </div>
  );
}

export function CardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <SectionHeader title={title} description={description} />
      {children}
    </div>
  );
}

export function ActivityItem({
  title,
  description,
  value,
  date,
}: {
  title: string;
  description: string;
  value: string;
  date: string;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <FileCheck2 />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {title}
          </p>

          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <span className="text-xs text-gray-400">{date}</span>

        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

export function DocumentCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-300 hover:shadow"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>

      <ChevronRight
        size={17}
        className="ml-auto shrink-0 text-gray-400"
      />
    </button>
  );
}

export function SiteCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-300 hover:shadow"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        <Icon size={20} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>

      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500 transition group-hover:text-gray-900">
        Ver registos
        <ChevronRight size={14} />
      </div>
    </button>
  );
}

type AlertCardProps = {
  icon: React.ElementType;
  color: "green" | "orange" | "blue";
  title: string;
  description: string;
};

const colorMap = {
  green: { bg: "bg-green-50", text: "text-green-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
};

export function AlertCard({
  icon: Icon,
  color,
  title,
  description,
}: AlertCardProps) {
  const colors = colorMap[color];

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon size={18} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>

          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}