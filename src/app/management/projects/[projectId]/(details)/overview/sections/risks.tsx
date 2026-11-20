import { CircleAlert } from "lucide-react";

import type { OverviewData } from "@/services/project_overview";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { LABELS, ROUTES, SECTION_IDS } from "../constants";

type RiskItem = OverviewData["risks"][number];
type Severity = "high" | "medium" | "low";

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

const SEVERITY_META: Record<
  Severity,
  { label: string; plural: string; dot: string; badge: string }
> = {
  high: {
    label: "Alta",
    plural: "altos",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
  medium: {
    label: "Média",
    plural: "médios",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  low: {
    label: "Baixa",
    plural: "baixos",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700",
  },
};

function normalizeSeverity(value: RiskItem["severity"]): Severity {
  return value === "high" || value === "medium" ? value : "low";
}

export default function RisksSection({
  data,
  projectBase,
}: {
  data: OverviewData;
  projectBase: string;
}) {
  const risks = [...data.risks].sort(
    (a, b) =>
      SEVERITY_ORDER[normalizeSeverity(a.severity)] -
      SEVERITY_ORDER[normalizeSeverity(b.severity)],
  );

  const counts = risks.reduce<Record<Severity, number>>(
    (acc, risk) => {
      acc[normalizeSeverity(risk.severity)] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );

  const subtitle =
    risks.length > 0
      ? (["high", "medium", "low"] as const)
          .filter((severity) => counts[severity] > 0)
          .map(
            (severity) =>
              `${counts[severity]} ${SEVERITY_META[severity].plural}`,
          )
          .join(" · ")
      : undefined;

  return (
    <SectionCard
      id={SECTION_IDS.risks}
      title={LABELS.projectRisks}
      subtitle={subtitle}
      action={{
        label: LABELS.viewAll,
        href: `${projectBase}/${ROUTES.risks}`,
      }}
    >
      {risks.length > 0 ? (
        <ul className="space-y-2">
          {risks.map((risk) => {
            const meta = SEVERITY_META[normalizeSeverity(risk.severity)];

            return (
              <li
                key={risk.id}
                className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
                  aria-hidden="true"
                />
                <p className="min-w-0 flex-1 text-sm text-gray-700">
                  {risk.text}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}
                >
                  <span className="sr-only">{LABELS.severity}: </span>
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={CircleAlert} title={LABELS.emptyRisks} />
      )}
    </SectionCard>
  );
}