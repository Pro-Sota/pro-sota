
import Link from "next/link";
import type { ComponentType } from "react";
import {
  CalendarDays,
  CircleAlert,
  Clock3,
  ListChecks,
  TrendingUp,
} from "lucide-react";

import type { OverviewData } from "@/services/project_overview";

import KpiCard from "./components/kpi_card";
import {
  FOCUS_RING,
  LABELS,
  PAGE_BG,
  REMAINING_DAYS_WARNING_THRESHOLD,
  ROUTES,
  SECTION_IDS,
} from "./constants";
import { formatPercentage } from "./components/format";

import ActivitiesSection from "./sections/activities";
import ActualVSPlanSection from "./sections/actual_vs_plan";
import ApprovalsSection from "./sections/approvals";
import ChangeOrdersSection from "./sections/change_orders";
import DocumentsSection from "./sections/documents";
import {
  UpcomingSection,
  OverdueSection,
} from "./sections/deadlines";
import IssuesSection from "./sections/issues";
import ProcurementSection from "./sections/procurement";
import ProjectHeader from "./sections/header";
import RequestsSection from "./sections/requests";
import RisksSection from "./sections/risks";
import SafetySection from "./sections/safety";
import ScheduleSection from "./sections/schedule";
import SitePhotosSection from "./sections/site_photos";
import SiteReportsSection from "./sections/site_reports";
import TeamSection from "./sections/team";

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

function getRemainingDays(
  days: number | null,
): { value: string; tone: KpiTone } {
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
    tone:
      days <= REMAINING_DAYS_WARNING_THRESHOLD
        ? "warning"
        : "default",
  };
}

function SectionGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          {label}
        </h2>
        <div className="h-px flex-1 bg-gray-200/80" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

export default function OverviewPage({
  data,
  isAdmin,
}: OverviewPageProps) {
  const { project, kpis } = data;

  const projectBase = `/management/projects/${project.id}`;
  const remaining = getRemainingDays(kpis.remainingDays);

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
      title: LABELS.openQuestions,
      value: String(kpis.openQuestions),
      href: `#${SECTION_IDS.rfis}`,
      tone: "default",
    },
    {
      icon: ListChecks,
      title: LABELS.completedTasks,
      value: `${kpis.completedTasks} / ${kpis.totalTasks}`,
      href: `${projectBase}/${ROUTES.tasks}`,
      tone: "default",
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
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {kpiItems.map(
            ({ icon: Icon, title, value, href, tone }, index) => (
              <Link
                key={title}
                href={href}
                className={[
                  "block min-w-0 rounded-lg transition-shadow hover:shadow-sm",
                  "focus-visible:outline-none",
                  FOCUS_RING,
                  TONE_RING[tone],
                  index === kpiItems.length - 1
                    ? "col-span-2 sm:col-span-1"
                    : "",
                ].join(" ")}
              >
                <KpiCard
                  icon={<Icon size={19} aria-hidden="true" />}
                  title={title}
                  value={value}
                />
              </Link>
            ),
          )}
        </section>

        {/* 01 — Planning and schedule */}
        <section
          id={SECTION_IDS.schedule}
          className="min-w-0 space-y-5"
        >
          <ScheduleSection
            projectBase={projectBase}
            phases={data.phases}
            tasks={data.tasks}
            deliverables={data.deliverables}
          />

          <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <ActualVSPlanSection data={data} />

            <div className="min-w-0 space-y-5">
              <UpcomingSection
                items={data.upcomingDeadlines ?? []}
              />
              <OverdueSection
                items={data.overdueDeadlines ?? []}
              />
            </div>
          </div>
        </section>

        {/* 02 — Project control */}
        <SectionGroup label="Controlo do projecto">
          <ApprovalsSection data={data} />
          <RequestsSection
            data={data}
            projectBase={projectBase}
          />
          <IssuesSection items={data.issues ?? []} />
          <ChangeOrdersSection
            items={data.changeOrders ?? []}
          />
        </SectionGroup>

        {/* 03 — Site operations */}
        <SectionGroup label="Gestão de obra">
          <SiteReportsSection
            items={data.siteReports ?? []}
          />
          <SafetySection
            summary={data.safety ?? {
              daysSinceIncident: 0,
              openActions: 0,
              incidents: [],
            }}
          />
          <SitePhotosSection
            items={data.sitePhotos ?? []}
          />
          <DocumentsSection
            items={data.documents ?? []}
          />
        </SectionGroup>

        {/* 04 — Team and resources */}
        <SectionGroup label="Equipa e recursos">
          <TeamSection
            members={data.teamMembers ?? []}
          />
          <ProcurementSection
            items={data.procurement ?? []}
          />
        </SectionGroup>

        {/* 05 — Monitoring */}
        <SectionGroup label="Acompanhamento">
          <RisksSection
            data={data}
            projectBase={projectBase}
          />
          <ActivitiesSection data={data} />
        </SectionGroup>

      </div>
    </main>
  );
}
