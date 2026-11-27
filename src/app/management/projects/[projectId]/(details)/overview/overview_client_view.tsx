"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  CalendarDays,
  Clock3,
  CircleAlert,
  TrendingUp,
} from "lucide-react";

import type { OverviewData } from "@/services/project_overview";

import KpiCard from "./components/kpi_card";
import {
  FOCUS_RING,
  LABELS,
  PAGE_BG,
  REMAINING_DAYS_WARNING_THRESHOLD,
  SECTION_IDS,
} from "./constants";
import { formatPercentage } from "./components/format";

import ScheduleSection from "./sections/schedule";
import { UpcomingSection, OverdueSection } from "./sections/deadlines";
import ApprovalsSection from "./sections/approvals";
import RequestsSection from "./sections/requests";
import IssuesSection from "./sections/issues";
import RisksSection from "./sections/risks";
import ActivitiesSection from "./sections/activities";
import ProjectHeader from "./sections/header";

interface OverviewPageProps {
  data: OverviewData;
  isAdmin: boolean;
}

type KpiTone = "default" | "warning" | "danger";

interface KpiItem {
  icon: ComponentType<{
    size?: number;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  title: string;
  value: string;
  href: string;
  tone: KpiTone;
}

const TONE_RING: Record<KpiTone, string> = {
  default: "",
  warning: "ring-1 ring-amber-400",
  danger: "ring-1 ring-red-400",
};

function getRemainingDays(days: number | null): {
  value: string;
  tone: KpiTone;
} {
  if (days === null) {
    return { value: "—", tone: "default" };
  }

  if (days < 0) {
    return {
      value: `${LABELS.overdue} ${Math.abs(days)} ${LABELS.daysShort}`,
      tone: "danger",
    };
  }

  return {
    value: String(days),
    tone: days <= REMAINING_DAYS_WARNING_THRESHOLD ? "warning" : "default",
  };
}

/** Real tasks (not stages) that are unfinished and past their end date. */
function countOverdueTasks(tasks: OverviewData["tasks"]): number {
  const today = new Date().toISOString().slice(0, 10);

  return tasks.filter(
    (task) =>
      task.id.startsWith("task:") &&
      task.progress < 100 &&
      task.endDate !== null &&
      task.endDate.slice(0, 10) < today,
  ).length;
}

function SectionHeading({
  label,
  href,
  linkLabel,
}: {
  label: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </h2>

      <div className="h-px min-w-0 flex-1 bg-gray-200/80" />

      {href && linkLabel && (
        <Link
          href={href}
          className={`shrink-0 text-xs font-medium text-[#002950] hover:underline ${FOCUS_RING}`}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export default function OverviewPage({ data, isAdmin }: OverviewPageProps) {
  const { project, kpis } = data;

  const projectBase = `/management/projects/${project.id}`;

  const remaining = getRemainingDays(kpis.remainingDays);
  const overdueTasks = countOverdueTasks(data.tasks);

  const approvalIds = new Set(data.approvalIds);
  const approvals = data.submittals.filter((s) =>
    approvalIds.has(s.submission_id),
  );

  const kpiItems: KpiItem[] = [
    {
      icon: TrendingUp,
      title: LABELS.progress,
      value: formatPercentage(kpis.progress),
      href: `#${SECTION_IDS.schedule}`,
      tone: "default",
    },
    {
      icon: CalendarDays,
      title: LABELS.remainingDays,
      value: remaining.value,
      href: `#${SECTION_IDS.schedule}`,
      tone: remaining.tone,
    },
    {
      icon: CircleAlert,
      title: "Tarefas em atraso",
      value: String(overdueTasks),
      href: `#${SECTION_IDS.schedule}`,
      tone: overdueTasks > 0 ? "danger" : "default",
    },
    {
      icon: Clock3,
      title: LABELS.pendingApprovals,
      value: String(kpis.pendingApprovals),
      href: `#${SECTION_IDS.approvals}`,
      tone: kpis.pendingApprovals > 0 ? "warning" : "default",
    },
  ];

  return (
    <main className={`min-h-0 ${PAGE_BG}`}>
      <div className="mx-auto w-full max-w-[1440px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Project identity */}
        <ProjectHeader
          project={project}
          projectBase={projectBase}
          isAdmin={isAdmin}
        />

        {/* Project performance */}
        <section
          aria-label={LABELS.kpiAria}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {kpiItems.map(({ icon: Icon, title, value, href, tone }) => (
            <Link
              key={title}
              href={href}
              className={[
                "block min-w-0 rounded-lg transition-shadow hover:shadow-sm",
                "focus-visible:outline-none",
                FOCUS_RING,
                TONE_RING[tone],
              ].join(" ")}
            >
              <KpiCard
                icon={<Icon size={19} aria-hidden="true" />}
                title={title}
                value={value}
              />
            </Link>
          ))}
        </section>

        {/* 01 — Planning */}
        <section id={SECTION_IDS.schedule} className="min-w-0 space-y-5">
          <SectionHeading label="Planeamento e execução" />

          <ScheduleSection
            projectBase={projectBase}
            phases={data.phases}
            tasks={data.tasks}
            deliverables={data.deliverables}
          />

          <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <UpcomingSection items={data.upcomingDeadlines} />
            <OverdueSection items={data.overdueDeadlines} />
          </div>
        </section>

        {/* 02 — Attention required */}
        <section id={SECTION_IDS.approvals} className="min-w-0 space-y-5">
          <SectionHeading label="Atenção necessária" />

          <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <ApprovalsSection approvals={approvals} />
            <RequestsSection
              rfis={data.rfis}
              submittals={data.submittals}
              projectBase={projectBase}
            />
            <IssuesSection items={data.issues} />
            <RisksSection risks={data.risks} projectBase={projectBase} />
          </div>
        </section>

        {/* 03 — Recent activity */}
        <section className="min-w-0 space-y-5">
          <SectionHeading label="Actividade recente" />

          <ActivitiesSection activities={data.activities} />
        </section>
      </div>
    </main>
  );
}