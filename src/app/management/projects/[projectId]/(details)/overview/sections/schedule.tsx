
"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

import GanttChart from "@/app/components/gant_chart/gantt";
import type { OverviewData } from "@/services/project_overview";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { FOCUS_RING, LABELS, ROUTES, SECTION_IDS } from "../constants";
import { clampPercent } from "../components/format";

interface ScheduleSectionProps {
  projectBase: string;
  phases: OverviewData["phases"];
  tasks: OverviewData["tasks"];
  deliverables: OverviewData["deliverables"];
}

export default function ScheduleSection({
  projectBase,
  phases,
  tasks,
  deliverables,
}: ScheduleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const contentId = "schedule-content";

  const hasPhases = phases.length > 0;

  const chartPhases = useMemo(
    () =>
      isOpen
        ? phases.map((phase) => ({
            id: phase.id,
            name: phase.name,
            sortOrder: phase.sortOrder ?? 0,
            startDate: phase.startDate ?? null,
            endDate: phase.endDate ?? null,
            progress: clampPercent(phase.progress),
          }))
        : [],
    [isOpen, phases],
  );

  const chartStages = useMemo(
    () =>
      isOpen
        ? tasks.map((task) => ({
            id: task.id,
            name: task.name,
            phaseId: task.phaseId,
            startDate: task.startDate,
            endDate: task.endDate,
            progress: clampPercent(task.progress),
          }))
        : [],
    [isOpen, tasks],
  );

  const chartDeliverables = useMemo(
    () =>
      isOpen
        ? deliverables.map((deliverable) => ({
            id: deliverable.id,
            name: deliverable.title,
            phaseId: deliverable.phase_id,
            startDate: deliverable.start_date,
            endDate: deliverable.due_date,
            progress: clampPercent(deliverable.progress),
            sortOrder: deliverable.sort_order,
          }))
        : [],
    [isOpen, deliverables],
  );

  return (
    <SectionCard
      id={SECTION_IDS.schedule}
      title={LABELS.schedule}
      height="auto"
      scrollable={false}
      action={{
        label: LABELS.viewTasks,
        href: `${projectBase}/${ROUTES.tasks}`,
      }}
      headerExtra={
        hasPhases ? (
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls={contentId}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-950 ${FOCUS_RING}`}
          >
            {isOpen ? LABELS.collapse : LABELS.expand}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : null
      }
    >
      <div id={contentId} hidden={!isOpen}>
        {isOpen &&
          (hasPhases ? (
            <GanttChart
              phases={chartPhases}
              steps={chartStages}
              deliverables={chartDeliverables}
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={LABELS.emptySchedule}
              message={LABELS.emptyScheduleMessage}
            />
          ))}
      </div>
    </SectionCard>
  );
}
