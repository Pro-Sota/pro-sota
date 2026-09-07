"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectFormState } from "./types";
import { ProgressBar } from "./progress_bar";
import { SummaryRow } from "./summary_row";

/**
 * Improved SummaryPanel with true sticky behavior using Intersection Observer
 * Keeps the same layout but adds advanced sticky functionality
 */
export function SummaryPanel({
  form,
  progress,
  duration,
}: {
  form: ProjectFormState;
  progress: number;
  duration: { invalid: boolean; label?: string } | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Setup Intersection Observer for true sticky behavior
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !panelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is NOT visible, the panel should be sticky
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 0px 0px",
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  const currencyFormatter = new Intl.NumberFormat("pt-PT");
  const budgetDisplay = form.budget
    ? `Kz ${currencyFormatter.format(Number(form.budget))}`
    : "—";

  const location = [form.municipality, form.state_province]
    .filter(Boolean)
    .join(", ");

  const teamMembers: string[] = []; // TODO: Connect to actual team members

  // Determine status indicator color based on progress
  const getStatusColor = () => {
    if (progress === 100) return "emerald";
    if (progress >= 75) return "amber";
    if (progress >= 50) return "blue";
    return "slate";
  };

  const statusColor = getStatusColor();
  const statusColorClasses: Record<
    string,
    { bg: string; text: string; indicator: string }
  > = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      indicator: "bg-emerald-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      indicator: "bg-amber-500",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      indicator: "bg-blue-500",
    },
    slate: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      indicator: "bg-slate-400",
    },
  };

  const colors = statusColorClasses[statusColor];

  return (
    <>
      {/* Sentinel - invisible element to track when panel leaves viewport */}
      <div ref={sentinelRef} className="h-0" />

      {/* Panel with dynamic positioning */}
      <div
        ref={panelRef}
        className={`transition-all duration-300 ${
          isSticky
            ? "fixed right-4 top-4 z-40 w-80 shadow-2xl"
            : "relative w-full shadow-sm"
        }`}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {/* Header with progress */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Resumo
            </h3>
            <span className="font-mono text-xs font-medium text-slate-500">
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <ProgressBar value={progress} />

          {/* Status indicator */}
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            <div
              className={`h-2 w-2 rounded-full ${colors.indicator} animate-pulse`}
            />
            <span>
              {progress === 100
                ? "Pronto para criar"
                : progress >= 75
                  ? "Quase completo"
                  : progress >= 50
                    ? "Meio do caminho"
                    : "Comece a preencher"}
            </span>
          </div>

          {/* Summary rows */}
          <dl className="mt-6 space-y-3.5 text-sm">
            <SummaryRow
              label="Nome"
              value={form.title || "—"}
              filled={!!form.title}
            />
            <SummaryRow
              label="Cliente"
              value={form.client_id || "—"}
              filled={!!form.client_id}
            />
            <SummaryRow
              label="Tipo"
              value={form.type || "—"}
              filled={!!form.type}
            />
            <SummaryRow
              label="Localização"
              value={location || "—"}
              filled={!!location}
            />
            <SummaryRow
              label="Duração"
              value={
                duration && !duration.invalid ? (duration.label as string) : "—"
              }
              filled={!!(duration && !duration.invalid)}
            />
            <SummaryRow label="Gestor" value={"—"} filled={false} />
            <SummaryRow
              label="Equipa"
              value={
                teamMembers.length > 0
                  ? `${teamMembers.length} membro${teamMembers.length !== 1 ? "s" : ""}`
                  : "—"
              }
              filled={teamMembers.length > 0}
            />

            {/* Budget section with border */}
            <div className="border-t border-slate-100 pt-3.5">
              <SummaryRow
                label="Orçamento"
                value={budgetDisplay}
                emphasize
                filled={!!form.budget}
              />
            </div>
          </dl>

          {/* Footer note */}
          {isSticky && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">
                Barra lateral fixa aderida ao topo
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}