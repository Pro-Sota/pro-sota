"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "neutral",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h3 className="mt-2 truncate text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </h3>

          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Icon size={20} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs">
          {trendType === "up" && (
            <ArrowUpRight size={14} className="text-green-600" />
          )}

          {trendType === "down" && (
            <ArrowDownRight size={14} className="text-red-500" />
          )}

          <span
            className={
              trendType === "up"
                ? "text-green-600"
                : trendType === "down"
                  ? "text-red-500"
                  : "text-gray-500"
            }
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

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

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 h-32" />
      ))}
    </div>
  );
}