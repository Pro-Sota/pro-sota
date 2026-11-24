
"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Flag,
  Handshake,
  Inbox,
  Package,
  Plus,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Database } from "../lib/supabase/models";
import CreateMeetingModal from "./calendar/components/create_meeting_modal";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];
type ProjectBrief = Database["public"]["Tables"]["project_briefs"]["Row"];
type AttendanceRecord =
  Database["public"]["Tables"]["attendance_records"]["Row"];
type Resource = Database["public"]["Tables"]["resources"]["Row"];
type CalendarEvent =
  Database["public"]["Tables"]["calendar_events"]["Row"];
type ProjectPhase =
  Database["public"]["Tables"]["project_phases"]["Row"];
type PhaseStage =
  Database["public"]["Tables"]["phase_stages"]["Row"];

export type TeamWorkload = {
  user_id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  estimated_hours: number;
  actual_hours: number;
  hours_remaining: number;
  workload_percentage: number;
};

export interface AdminDashboardData {
  currentUser: Profile | null;
  users: Profile[];
  projects: Project[];
  clients: Client[];
  documents: DocumentRow[];
  suppliers: Supplier[];
  tasks: Task[];
  deadlines: Task[];
  activities: Activity[];
  teamWorkload: TeamWorkload[];
  leads: Lead[];
  projectBriefs: ProjectBrief[];
  attendance: AttendanceRecord[];
  resources: Resource[];
  calendarEvents: CalendarEvent[];
  projectPhases: ProjectPhase[];
  phaseStages: PhaseStage[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const DONE = ["completed", "concluído", "concluido", "done"];

const CANCELLED = [
  "cancelled",
  "canceled",
  "cancelado",
  "cancelada",
  "archived",
  "arquivado",
  "arquivada",
];

const INACTIVE = [...DONE, ...CANCELLED];

const MAX_PROJECTS = 6;
const DAY = 86_400_000;

const isDone = (task: Task) =>
  DONE.includes(task.status?.toLowerCase().trim() ?? "");

const isCancelled = (task: Task) =>
  CANCELLED.includes(task.status?.toLowerCase().trim() ?? "");

const isActive = (project: Project) =>
  !INACTIVE.includes(project.status?.toLowerCase().trim() ?? "");

type ProfileLike = Profile & {
  id?: string;
  user_id?: string;
  last_name?: string | null;
};

const profileId = (profile: Profile) =>
  (profile as ProfileLike).user_id ??
  (profile as ProfileLike).id ??
  null;

const profileName = (profile: Profile) =>
  [profile.first_name, (profile as ProfileLike).last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fmt = (value: string | null, year = true) =>
  value
    ? new Date(value).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        ...(year ? { year: "numeric" as const } : {}),
      })
    : null;

const fmtDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const daysUntil = (value: string | null) =>
  value
    ? Math.round(
        (new Date(value).setHours(0, 0, 0, 0) - startOfToday()) / DAY,
      )
    : null;

function dueLabel(days: number | null) {
  if (days === null) {
    return { text: "Sem data", tone: "text-slate-400" };
  }

  if (days < 0) {
    return { text: `Atrasado ${-days}d`, tone: "text-slate-900" };
  }

  if (days === 0) {
    return { text: "Hoje", tone: "text-slate-900" };
  }

  if (days === 1) {
    return { text: "Amanhã", tone: "text-slate-700" };
  }

  if (days <= 7) {
    return { text: `Em ${days} dias`, tone: "text-slate-700" };
  }

  return { text: `Em ${days} dias`, tone: "text-slate-400" };
}

const STATUS = {
  active: {
    label: "Em curso",
    dot: "bg-slate-700",
    pill: "bg-slate-100 text-slate-700",
  },
  "on track": {
    label: "Em curso",
    dot: "bg-slate-700",
    pill: "bg-slate-100 text-slate-700",
  },
  "at risk": {
    label: "Em risco",
    dot: "bg-slate-500",
    pill: "bg-slate-100 text-slate-700",
  },
  delayed: {
    label: "Atrasado",
    dot: "bg-black",
    pill: "bg-slate-200 text-slate-900",
  },
};

const projectStatus = (status: string | null) =>
  STATUS[status?.toLowerCase().trim() as keyof typeof STATUS] ?? {
    label: status || "Sem estado",
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600",
  };

const projectHref = (id: string) => `/management/projects/${id}`;

const taskHref = (task: Task) =>
  task.project_id
    ? projectHref(task.project_id)
    : "/management/tasks";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

/* -------------------------------------------------------------------------- */
/* UI primitives                                                              */
/* -------------------------------------------------------------------------- */

function Panel({
  title,
  subtitle,
  href,
  hrefLabel = "Ver todos",
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
        <div className="min-w-0">
          <h2 className="truncate text-[14px] text-black">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {href && (
          <Link
            href={href}
            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-black ${focusRing}`}
          >
            {hrefLabel}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {children}
      </div>
    </section>
  );
}

function Empty({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-sm text-black">{title}</p>

      <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Bar({
  value,
  tone = "bg-black",
}: {
  value: number;
  tone?: string;
}) {
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${tone}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700"
      title={name}
      aria-label={name}
    >
      {initials(name) || "?"}
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  href,
  description,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 transition-colors hover:border-slate-400 hover:bg-slate-50 ${focusRing}`}
    >
      <div className="min-w-0">
        <p className="truncate text-[11px] text-slate-500">
          {label}
        </p>

        <p className="mt-1.5 text-2xl tabular-nums text-black">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-[10px] text-slate-400">
            {description}
          </p>
        )}
      </div>

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200 group-hover:text-black">
        <Icon className="h-4 w-4" />
      </span>
    </Link>
  );
}

function DashboardSection({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-lg text-black">
          {title}
        </h2>
      </div>

      <p className="text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminDashboard({
  data,
}: {
  data: AdminDashboardData;
}) {
  const [meetingOpen, setMeetingOpen] = useState(false);

  const {
    currentUser,
    users,
    projects,
    clients,
    documents,
    suppliers,
    tasks,
    deadlines,
    activities,
    teamWorkload,
    leads,
    projectBriefs,
    attendance,
    resources,
    calendarEvents,
    projectPhases,
    phaseStages,
  } = data;

  /* Aggregations */

  const projectTitleById = useMemo(
    () =>
      Object.fromEntries(
        projects.map((project) => [
          project.project_id,
          project.title,
        ]),
      ) as Record<string, string>,
    [projects],
  );

  const userNameById = useMemo(() => {
    const map: Record<string, string> = {};

    users.forEach((user) => {
      const id = profileId(user);
      const name = profileName(user);

      if (id && name) map[id] = name;
    });

    return map;
  }, [users]);

  const activeProjects = useMemo(
    () => projects.filter(isActive),
    [projects],
  );

  const completedProjects = useMemo(
    () =>
      projects.filter((project) =>
        DONE.includes(project.status?.toLowerCase().trim() ?? ""),
      ),
    [projects],
  );

  const trackedTasks = useMemo(
    () => tasks.filter((task) => !isCancelled(task)),
    [tasks],
  );

  const pendingTasks = useMemo(
    () => trackedTasks.filter((task) => !isDone(task)),
    [trackedTasks],
  );

  const completedTasks = useMemo(
    () => trackedTasks.filter(isDone),
    [trackedTasks],
  );

  const progressByProject = useMemo(() => {
    const totals: Record<string, { total: number; done: number }> = {};

    trackedTasks.forEach((task) => {
      if (!task.project_id) return;

      const entry = (totals[task.project_id] ??= {
        total: 0,
        done: 0,
      });

      entry.total += 1;

      if (isDone(task)) entry.done += 1;
    });

    return Object.fromEntries(
      Object.entries(totals).map(([id, { total, done }]) => [
        id,
        Math.round((done / total) * 100),
      ]),
    ) as Record<string, number>;
  }, [trackedTasks]);

  const overdue = useMemo(
    () =>
      pendingTasks.filter((task) => {
        const days = daysUntil(task.due_date);
        return days !== null && days < 0;
      }),
    [pendingTasks],
  );

  const dueThisWeek = useMemo(
    () =>
      pendingTasks.filter((task) => {
        const days = daysUntil(task.due_date);
        return days !== null && days >= 0 && days <= 7;
      }),
    [pendingTasks],
  );

  const flaggedProjects = useMemo(
    () =>
      activeProjects.filter((project) =>
        ["at risk", "delayed"].includes(
          project.status?.toLowerCase().trim() ?? "",
        ),
      ),
    [activeProjects],
  );

  const completion = trackedTasks.length
    ? Math.round(
        (completedTasks.length / trackedTasks.length) * 100,
      )
    : 0;

  const statusMix = useMemo(() => {
    const counts = new Map<string, { n: number; dot: string }>();

    activeProjects.forEach((project) => {
      const status = projectStatus(project.status);
      const current = counts.get(status.label) ?? {
        n: 0,
        dot: status.dot,
      };

      counts.set(status.label, {
        n: current.n + 1,
        dot: current.dot,
      });
    });

    return [...counts.entries()];
  }, [activeProjects]);

  const projectPerformance = useMemo(() => {
    const atRisk = activeProjects.filter(
      (project) => project.status?.toLowerCase().trim() === "at risk",
    ).length;

    const delayed = activeProjects.filter(
      (project) => project.status?.toLowerCase().trim() === "delayed",
    ).length;

    return {
      onTrack: activeProjects.length - atRisk - delayed,
      atRisk,
      delayed,
    };
  }, [activeProjects]);

  const visibleProjects = activeProjects.slice(0, MAX_PROJECTS);

  const visibleDeadlines = useMemo(
    () =>
      deadlines
        .filter((task) => !isDone(task) && !isCancelled(task))
        .slice(0, 8),
    [deadlines],
  );

  /* Commercial pipeline */

  const leadStats = useMemo(() => {
    const count = (status: string) =>
      leads.filter((lead) => lead.status === status).length;

    return {
      total: leads.length,
      new: count("new"),
      contacted: count("contacted"),
      qualified: count("qualified"),
      proposal: count("proposal"),
      negotiation: count("negotiation"),
      won: count("won"),
      active: leads.filter((lead) =>
        ["new", "contacted", "qualified", "proposal", "negotiation"].includes(
          lead.status,
        ),
      ).length,
    };
  }, [leads]);

  const pendingBriefs = useMemo(
    () =>
      projectBriefs.filter((brief) =>
        ["pending", "in_review", "contacted"].includes(brief.status),
      ),
    [projectBriefs],
  );

  const recentLeads = leads.slice(0, 5);
  const recentBriefs = pendingBriefs.slice(0, 5);

  /* Attendance */

  const attendanceStats = useMemo(
    () => ({
      present: attendance.filter((record) => record.status === "Presente").length,
      absent: attendance.filter((record) => record.status === "Ausente").length,
      late: attendance.filter((record) => record.status === "Atrasado").length,
      missing: attendance.filter((record) => record.status === "Em falta").length,
      total: attendance.length,
    }),
    [attendance],
  );

  const attendanceByProfile = useMemo(() => {
    const names: Record<string, string> = {};

    users.forEach((user) => {
      const id = profileId(user);
      if (id) names[id] = profileName(user) || "Colaborador";
    });

    return names;
  }, [users]);

  const attendanceAlerts = useMemo(
    () =>
      attendance
        .filter((record) =>
          ["Ausente", "Atrasado", "Em falta"].includes(record.status),
        )
        .slice(0, 5),
    [attendance],
  );

  /* Resources */

  const resourceStats = useMemo(
    () => ({
      total: resources.length,
      available: resources.filter(
        (resource) => resource.operational_status === "available",
      ).length,
      inUse: resources.filter(
        (resource) => resource.operational_status === "in_use",
      ).length,
      overdue: resources.filter(
        (resource) => resource.operational_status === "overdue",
      ).length,
      missing: resources.filter(
        (resource) => resource.operational_status === "missing",
      ).length,
      maintenance: resources.filter(
        (resource) =>
          resource.condition_status === "maintenance" ||
          resource.condition_status === "damaged",
      ).length,
    }),
    [resources],
  );

  /* Suppliers */

  const supplierStats = useMemo(
    () => ({
      total: suppliers.length,
      active: suppliers.filter((supplier) => supplier.status === "Active").length,
      prospective: suppliers.filter(
        (supplier) => supplier.status === "Prospective",
      ).length,
      inactive: suppliers.filter(
        (supplier) => supplier.status === "Inactive",
      ).length,
    }),
    [suppliers],
  );

  /* Calendar */

  const upcomingEvents = calendarEvents.slice(0, 6);

  const eventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: "Reunião",
      site_visit: "Visita à obra",
      deadline: "Prazo",
      project: "Projecto",
      task: "Tarefa",
    };

    return labels[type] ?? type;
  };

  /* Project phases and milestones */

  const upcomingPhases = useMemo(
    () =>
      projectPhases
        .filter((phase) => phase.status !== "completed")
        .slice(0, 5),
    [projectPhases],
  );

  const upcomingStages = useMemo(
    () =>
      phaseStages
        .filter((stage) => stage.status !== "completed")
        .slice(0, 5),
    [phaseStages],
  );

  const phaseNameById = useMemo(
    () =>
      Object.fromEntries(
        projectPhases.map((phase) => [phase.phase_id, phase.name]),
      ) as Record<string, string>,
    [projectPhases],
  );

  const delayedMilestones = useMemo(
    () =>
      [...projectPhases, ...phaseStages].filter((item) => {
        if (item.status === "completed" || !item.planned_end) return false;

        const days = daysUntil(item.planned_end);
        return days !== null && days < 0;
      }),
    [projectPhases, phaseStages],
  );

  /* Header */

  const today = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const attention = [
    {
      label: "Tarefas atrasadas",
      value: overdue.length,
      icon: AlertTriangle,
      href: "/management/tasks",
      tone: overdue.length
        ? "text-black bg-slate-200"
        : "text-slate-500 bg-slate-100",
    },
    {
      label: "Projectos em risco",
      value: flaggedProjects.length,
      icon: Briefcase,
      href: "/management/projects",
      tone: flaggedProjects.length
        ? "text-black bg-slate-200"
        : "text-slate-500 bg-slate-100",
    },
    {
      label: "Prazos nos próximos 7 dias",
      value: dueThisWeek.length,
      icon: Clock,
      href: "/management/tasks",
      tone: "text-slate-700 bg-slate-100",
    },
  ];

  const stats = [
    {
      title: "Projectos activos",
      value: activeProjects.length,
      icon: Briefcase,
      href: "/management/projects",
    },
    {
      title: "Clientes",
      value: clients.length,
      icon: Building2,
      href: "/management/clients",
    },
    {
      title: "Equipa",
      value: users.length,
      icon: Users,
      href: "/management/team",
    },
    {
      title: "Tarefas pendentes",
      value: pendingTasks.length,
      icon: ClipboardList,
      href: "/management/tasks",
    },
    {
      title: "Leads activos",
      value: leadStats.active,
      icon: Handshake,
      href: "/management/leads",
    },
    {
      title: "Briefings por acompanhar",
      value: pendingBriefs.length,
      icon: FileText,
      href: "/management/project-briefing",
    },
  ];

  const actions = [
    {
      label: "Novo projecto",
      icon: Plus,
      href: "/management/projects/create-project",
      primary: true,
    },
    {
      label: "Adicionar cliente",
      icon: UserPlus,
      href: "/management/clients/create-client",
    },
    {
      label: "Adicionar colaborador",
      icon: Users,
      href: "/management/team/create-member",
    },
    {
      label: "Agendar reunião",
      icon: CalendarPlus,
      onClick: () => setMeetingOpen(true),
    },
  ];

  const greeting =
    overdue.length > 0
      ? `Existem ${overdue.length} ${
          overdue.length === 1 ? "tarefa atrasada" : "tarefas atrasadas"
        } que requerem atenção.`
      : flaggedProjects.length > 0
        ? `${flaggedProjects.length} ${
            flaggedProjects.length === 1
              ? "projecto necessita"
              : "projectos necessitam"
          } de acompanhamento.`
        : "Tudo em dia. Eis a actividade do gabinete.";

  /* Render */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-7 lg:px-9 lg:py-8">

        {/* Header */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs capitalize text-slate-400">
              {today}
            </p>

            <h1 className="mt-1.5 text-3xl tracking-tight text-black sm:text-4xl">
              Olá, {currentUser?.first_name || "Administrador"}
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              {greeting}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const className = `inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs transition-colors ${focusRing} ${
                action.primary
                  ? "bg-black text-white hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-black"
              }`;

              const content = (
                <>
                  <action.icon className="h-4 w-4" strokeWidth={1.6} />
                  {action.label}
                </>
              );

              return action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </header>

        {/* Attention */}

        <section
          aria-label="Requer atenção"
          className="grid gap-3 sm:grid-cols-3"
        >
          {attention.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-slate-400 ${focusRing}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.6} />
              </span>

              <span className="min-w-0">
                <span className="block text-2xl leading-none tabular-nums text-black">
                  {item.value}
                </span>

                <span className="mt-1.5 block text-xs text-slate-500">
                  {item.label}
                </span>
              </span>

              <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </section>

        {/* Key indicators */}

        <section
          aria-label="Indicadores principais"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        >
          {stats.map((stat) => (
            <Metric
              key={stat.title}
              label={stat.title}
              value={stat.value}
              icon={stat.icon}
              href={stat.href}
            />
          ))}
        </section>

        {/* Commercial and team */}

        <DashboardSection
          eyebrow="Desenvolvimento comercial"
          title="Oportunidades e equipa"
          description="Leads, pedidos de projecto e assiduidade"
        />

        <div className="grid min-w-0 gap-4 xl:grid-cols-3">
          <Panel
            title="Pipeline comercial"
            subtitle="Acompanhamento das oportunidades comerciais"
            href="/management/leads"
          >
            <div className="grid grid-cols-2 gap-4 px-3 pb-4">
              <div>
                <p className="text-xs text-slate-400">Total de leads</p>
                <p className="mt-1 text-2xl tabular-nums text-black">
                  {leadStats.total}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Em acompanhamento</p>
                <p className="mt-1 text-2xl tabular-nums text-black">
                  {leadStats.active}
                </p>
              </div>
            </div>

            <div className="space-y-3 px-3 pb-4">
              {[
                { label: "Novos", value: leadStats.new, tone: "bg-black" },
                {
                  label: "Contactados",
                  value: leadStats.contacted,
                  tone: "bg-slate-700",
                },
                {
                  label: "Qualificados",
                  value: leadStats.qualified,
                  tone: "bg-slate-600",
                },
                {
                  label: "Propostas",
                  value: leadStats.proposal,
                  tone: "bg-slate-500",
                },
                {
                  label: "Negociação",
                  value: leadStats.negotiation,
                  tone: "bg-slate-400",
                },
                {
                  label: "Ganhos",
                  value: leadStats.won,
                  tone: "bg-slate-300",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="tabular-nums text-black">
                      {item.value}
                    </span>
                  </div>

                  <Bar
                    value={
                      leadStats.total
                        ? (item.value / leadStats.total) * 100
                        : 0
                    }
                    tone={item.tone}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-3 pt-3">
              <p className="mb-2 text-xs text-slate-400">Leads recentes</p>

              {recentLeads.length === 0 ? (
                <Empty
                  icon={Handshake}
                  title="Sem leads registados"
                  description="As novas oportunidades comerciais aparecerão aqui."
                />
              ) : (
                <ul>
                  {recentLeads.map((lead) => (
                    <li
                      key={lead.lead_id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-black">
                          {lead.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {lead.project_name}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {lead.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel
            title="Briefings de projecto"
            subtitle="Pedidos que necessitam de acompanhamento"
            href="/management/project-briefs"
          >
            <div className="grid grid-cols-2 gap-4 px-3 pb-4">
              <div>
                <p className="text-xs text-slate-400">Total recebido</p>
                <p className="mt-1 text-2xl tabular-nums text-black">
                  {projectBriefs.length}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Por acompanhar</p>
                <p className="mt-1 text-2xl tabular-nums text-black">
                  {pendingBriefs.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-3 pb-4">
              {[
                {
                  label: "Pendentes",
                  value: projectBriefs.filter(
                    (brief) => brief.status === "pending",
                  ).length,
                },
                {
                  label: "Em análise",
                  value: projectBriefs.filter(
                    (brief) => brief.status === "in_review",
                  ).length,
                },
                {
                  label: "Contactados",
                  value: projectBriefs.filter(
                    (brief) => brief.status === "contacted",
                  ).length,
                },
                {
                  label: "Aprovados",
                  value: projectBriefs.filter(
                    (brief) => brief.status === "approved",
                  ).length,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-1 text-xl tabular-nums text-black">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-3 pt-3">
              <p className="mb-2 text-xs text-slate-400">Pedidos recentes</p>

              {recentBriefs.length === 0 ? (
                <Empty
                  icon={FileText}
                  title="Sem pedidos pendentes"
                  description="Não existem briefings a aguardar acompanhamento."
                />
              ) : (
                <ul>
                  {recentBriefs.map((brief) => (
                    <li
                      key={brief.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-black">
                          {brief.full_name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {brief.location_city ||
                            brief.location_address ||
                            "Localização não indicada"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {brief.status === "in_review"
                          ? "Em análise"
                          : brief.status === "pending"
                            ? "Pendente"
                            : "Contactado"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel
            title="Presença da equipa"
            subtitle="Registos de assiduidade"
            href="/management/attendance"
          >
            <div className="grid grid-cols-2 gap-3 px-3 pb-4">
              {[
                {
                  label: "Presentes",
                  value: attendanceStats.present,
                  icon: UserCheck,
                  tone: "text-slate-700 bg-slate-100",
                },
                {
                  label: "Atrasados",
                  value: attendanceStats.late,
                  icon: Clock,
                  tone: "text-slate-700 bg-slate-100",
                },
                {
                  label: "Ausentes",
                  value: attendanceStats.absent,
                  icon: UserX,
                  tone: "text-slate-700 bg-slate-100",
                },
                {
                  label: "Em falta",
                  value: attendanceStats.missing,
                  icon: AlertTriangle,
                  tone: "text-slate-700 bg-slate-100",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.tone}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-xl tabular-nums text-black">
                      {item.value}
                    </p>
                    <p className="text-xs text-slate-400">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-3 pt-3">
              <p className="mb-2 text-xs text-slate-400">
                Ocorrências de hoje
              </p>

              {attendanceAlerts.length === 0 ? (
                <Empty
                  icon={CheckCircle2}
                  title="Sem ocorrências"
                  description="Não existem ausências ou atrasos registados."
                />
              ) : (
                <ul>
                  {attendanceAlerts.map((record) => (
                    <li
                      key={record.attendance_id}
                      className="flex items-center justify-between gap-3 px-2 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-black">
                          {attendanceByProfile[record.profile_id] ||
                            "Colaborador"}
                        </p>
                        {record.check_in && (
                          <p className="text-xs text-slate-400">
                            Entrada: {fmtDateTime(record.check_in)}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-xs text-slate-500">
                        {record.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </div>

        {/* Project execution */}

        <DashboardSection
          eyebrow="Execução e planeamento"
          title="Desempenho e agenda"
          description="Estado dos projectos, fases e compromissos"
        />

        <div className="grid min-w-0 gap-4 xl:grid-cols-3">
          <Panel
            title="Desempenho dos projectos"
            subtitle="Distribuição do estado dos projectos activos"
            href="/management/projects"
            className="xl:col-span-2"
          >
            {activeProjects.length === 0 ? (
              <Empty
                icon={Briefcase}
                title="Sem projectos activos"
                description="Os indicadores de desempenho aparecerão quando existirem projectos em curso."
              />
            ) : (
              <div className="px-3 pb-3">
                <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">Total activos</p>
                    <p className="mt-1.5 text-2xl tabular-nums text-black">
                      {activeProjects.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Em curso</p>
                    <p className="mt-1.5 text-2xl tabular-nums text-slate-700">
                      {projectPerformance.onTrack}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Em risco</p>
                    <p className="mt-1.5 text-2xl tabular-nums text-slate-600">
                      {projectPerformance.atRisk}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Atrasados</p>
                    <p className="mt-1.5 text-2xl tabular-nums text-black">
                      {projectPerformance.delayed}
                    </p>
                  </div>
                </div>

                <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                  {statusMix.map(([label, { n, dot }]) => (
                    <div
                      key={label}
                      className={dot}
                      style={{
                        width: `${(n / activeProjects.length) * 100}%`,
                      }}
                      title={`${label}: ${n}`}
                    />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {statusMix.map(([label, { n, dot }]) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 text-xs text-slate-500"
                    >
                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                      {label}
                      <span className="tabular-nums text-black">{n}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Conclusão global de tarefas
                    </p>

                    <p className="text-sm tabular-nums text-black">
                      {completion}%
                    </p>
                  </div>

                  <Bar value={completion} tone="bg-black" />

                  <p className="mt-2 text-xs text-slate-400">
                    {completedTasks.length} de {trackedTasks.length} tarefas concluídas
                  </p>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Fases e marcos"
            subtitle="Acompanhamento da execução dos projectos"
            href="/management/projects"
            className="max-h-[480px]"
          >
            {delayedMilestones.length > 0 && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-100 p-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-black" />
                <div>
                  <p className="text-sm text-black">
                    {delayedMilestones.length} marcos atrasados
                  </p>
                  <p className="text-xs text-slate-500">
                    Necessitam de acompanhamento
                  </p>
                </div>
              </div>
            )}

            {upcomingPhases.length === 0 && upcomingStages.length === 0 ? (
              <Empty
                icon={Flag}
                title="Sem marcos planeados"
                description="As fases e etapas dos projectos aparecerão aqui."
              />
            ) : (
              <div className="space-y-5 px-3">
                {upcomingPhases.map((phase) => {
                  const progress = Number(phase.progress ?? 0);
                  const days = daysUntil(phase.planned_end);
                  const delayed = days !== null && days < 0;

                  return (
                    <div key={phase.phase_id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-black">
                            {phase.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Fase do projecto
                          </p>
                        </div>

                        <span
                          className={`shrink-0 text-xs ${
                            delayed ? "text-black" : "text-slate-500"
                          }`}
                        >
                          {phase.planned_end
                            ? fmt(phase.planned_end, false)
                            : "Sem data"}
                        </span>
                      </div>

                      <div className="mt-2">
                        <Bar
                          value={progress}
                          tone="bg-black"
                        />
                      </div>

                      <p className="mt-1 text-right text-xs tabular-nums text-slate-400">
                        {progress}%
                      </p>
                    </div>
                  );
                })}

                {upcomingStages.map((stage) => {
                  const days = daysUntil(stage.planned_end);
                  const delayed = days !== null && days < 0;

                  return (
                    <div
                      key={stage.stage_id}
                      className="border-t border-slate-100 pt-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-black">
                            {stage.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {phaseNameById[stage.phase_id] ||
                              "Etapa do projecto"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 text-xs ${
                            delayed ? "text-black" : "text-slate-500"
                          }`}
                        >
                          {stage.planned_end
                            ? fmt(stage.planned_end, false)
                            : "Sem data"}
                        </span>
                      </div>

                      <div className="mt-2">
                        <Bar
                          value={Number(stage.progress ?? 0)}
                          tone="bg-black"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* Resources and suppliers */}

        <DashboardSection
          eyebrow="Meios e logística"
          title="Recursos operacionais"
          description="Disponibilidade de equipamentos e rede de fornecedores"
        />

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel
            title="Recursos de obra"
            subtitle="Disponibilidade e estado dos recursos"
            href="/management/resources"
          >
            <div className="grid grid-cols-2 gap-4 px-3 pb-5 sm:grid-cols-3">
              {[
                { label: "Total", value: resourceStats.total },
                { label: "Disponíveis", value: resourceStats.available },
                { label: "Em utilização", value: resourceStats.inUse },
                { label: "Em atraso", value: resourceStats.overdue },
                { label: "Em falta", value: resourceStats.missing },
                { label: "Manutenção", value: resourceStats.maintenance },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-1 text-xl tabular-nums text-black">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-3 pt-4">
              <p className="mb-3 text-xs text-slate-400">
                Recursos registados
              </p>

              {resources.length === 0 ? (
                <Empty
                  icon={Package}
                  title="Sem recursos registados"
                  description="Os recursos de obra aparecerão aqui."
                />
              ) : (
                <ul>
                  {resources.slice(0, 6).map((resource) => (
                    <li
                      key={resource.resource_id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                          {resource.condition_status === "maintenance" ||
                          resource.condition_status === "damaged" ? (
                            <Wrench className="h-4 w-4" />
                          ) : (
                            <Package className="h-4 w-4" />
                          )}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm text-black">
                            {resource.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {resource.resource_code} · {resource.resource_type}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {{
                          available: "Disponível",
                          in_use: "Em utilização",
                          overdue: "Em atraso",
                          missing: "Em falta",
                        }[resource.operational_status] ||
                          resource.operational_status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel
            title="Fornecedores"
            subtitle="Estado da rede de fornecedores"
            href="/management/suppliers"
          >
            <div className="grid grid-cols-2 gap-4 px-3 pb-5 sm:grid-cols-4">
              {[
                { label: "Total", value: supplierStats.total },
                { label: "Activos", value: supplierStats.active },
                { label: "Prospectivos", value: supplierStats.prospective },
                { label: "Inactivos", value: supplierStats.inactive },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-1 text-xl tabular-nums text-black">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {suppliers.length === 0 ? (
              <Empty
                icon={Handshake}
                title="Sem fornecedores"
                description="Os fornecedores registados aparecerão aqui."
              />
            ) : (
              <ul className="border-t border-slate-100 pt-2">
                {suppliers.slice(0, 6).map((supplier) => (
                  <li
                    key={supplier.supplier_id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-black">
                        {supplier.supplier_name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {supplier.category || "Sem categoria"}
                        {supplier.city ? ` · ${supplier.city}` : ""}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {{
                        Active: "Activo",
                        Inactive: "Inactivo",
                        Prospective: "Prospectivo",
                      }[supplier.status] || supplier.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Projects and deadlines */}

        <DashboardSection
          eyebrow="Gestão de projectos"
          title="Acompanhamento da execução"
          description="Projectos activos e tarefas com prazo"
        />

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <Panel
            title="Projectos activos"
            subtitle={`${activeProjects.length} em curso`}
            href="/management/projects"
            className="max-h-[560px] lg:col-span-2"
          >
            {visibleProjects.length === 0 ? (
              <Empty
                icon={Briefcase}
                title="Nenhum projecto activo"
                description="Os projectos em curso aparecerão aqui."
              />
            ) : (
              <ul>
                {visibleProjects.map((project) => {
                  const progress =
                    progressByProject[project.project_id] ?? null;
                  const status = projectStatus(project.status);
                  const due = dueLabel(daysUntil(project.end_date));

                  return (
                    <li key={project.project_id}>
                      <Link
                        href={projectHref(project.project_id)}
                        className={`grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50 md:grid-cols-[minmax(0,2fr)_auto_minmax(0,1fr)_auto] ${focusRing}`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-black">
                            {project.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {project.project_code}
                            {project.address_line_1 &&
                              ` · ${project.address_line_1}`}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 justify-self-end whitespace-nowrap rounded-full px-2.5 py-1 text-xs md:justify-self-start ${status.pill}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />
                          {status.label}
                        </span>

                        <div className="col-span-2 flex items-center gap-2 md:col-span-1">
                          {progress === null ? (
                            <span className="text-xs text-slate-400">
                              Sem tarefas
                            </span>
                          ) : (
                            <>
                              <div className="flex-1">
                                <Bar value={progress} />
                              </div>

                              <span className="w-8 text-right text-xs tabular-nums text-slate-500">
                                {progress}%
                              </span>
                            </>
                          )}
                        </div>

                        <span
                          className={`hidden whitespace-nowrap text-right text-xs md:block ${due.tone}`}
                        >
                          {project.end_date
                            ? fmt(project.end_date, false)
                            : "—"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {activeProjects.length > MAX_PROJECTS && (
              <Link
                href="/management/projects"
                className={`mt-2 flex items-center justify-center gap-2 rounded-lg py-3 text-xs text-black transition-colors hover:bg-slate-50 ${focusRing}`}
              >
                Ver todos os {activeProjects.length} projectos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}

            {completedProjects.length > 0 && (
              <div className="mx-3 mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-600" />
                  <span className="text-xs text-slate-500">
                    Projectos concluídos
                  </span>
                </div>

                <span className="text-sm tabular-nums text-black">
                  {completedProjects.length}
                </span>
              </div>
            )}
          </Panel>

          <Panel
            title="Próximos prazos"
            subtitle={`${visibleDeadlines.length} apresentados`}
            href="/management/tasks"
            className="max-h-[560px]"
          >
            {visibleDeadlines.length === 0 ? (
              <Empty
                icon={CalendarDays}
                title="Sem prazos agendados"
                description="Os prazos aparecerão aqui quando forem atribuídos."
              />
            ) : (
              <ul>
                {visibleDeadlines.map((task) => {
                  const due = dueLabel(daysUntil(task.due_date));

                  return (
                    <li key={task.task_id}>
                      <Link
                        href={taskHref(task)}
                        className={`flex items-start justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50 ${focusRing}`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-black">
                            {task.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {(task.project_id &&
                              projectTitleById[task.project_id]) ||
                              "Sem projecto"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className={`text-xs ${due.tone}`}>
                            {due.text}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {fmt(task.due_date, false)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* Calendar */}

        <DashboardSection
          eyebrow="Planeamento"
          title="Agenda do gabinete"
          description="Reuniões, visitas e compromissos próximos"
        />

        <Panel
          title="Agenda próxima"
          subtitle="Compromissos agendados"
          href="/management/calendar"
          className="max-h-[440px]"
        >
          {upcomingEvents.length === 0 ? (
            <Empty
              icon={CalendarDays}
              title="Sem eventos próximos"
              description="As próximas reuniões e visitas aparecerão aqui."
            />
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.map((event) => (
                <li
                  key={event.event_id}
                  className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <CalendarDays className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-black">
                      {event.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {eventTypeLabel(event.event_type)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {fmtDateTime(event.start_at)}
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Internal management */}

        <DashboardSection
          eyebrow="Controlo interno"
          title="Equipa e informação"
          description="Actividade recente, carga de trabalho e documentação"
        />

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <Panel
            title="Actividades recentes"
            subtitle="Últimas actualizações do gabinete"
            href="/management/activity"
            className="max-h-[480px]"
          >
            {activities.length === 0 ? (
              <Empty
                icon={Inbox}
                title="Sem actividade"
                description="A actividade da equipa aparecerá aqui."
              />
            ) : (
              <ul>
                {activities.map((activity) => {
                  const user = activity.user_id
                    ? userNameById[activity.user_id]
                    : undefined;

                  const project = activity.project_id
                    ? projectTitleById[activity.project_id]
                    : undefined;

                  return (
                    <li
                      key={activity.activity_id}
                      className="flex gap-3 rounded-lg px-3 py-2.5"
                    >
                      <Avatar name={user || "?"} />

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm leading-6 text-slate-600">
                          {user && (
                            <span className="text-black">
                              {user}{" "}
                            </span>
                          )}

                          {activity.description}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {[project, fmtDateTime(activity.created_at)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Carga da equipa"
            subtitle="Distribuição de trabalho por colaborador"
            href="/management/team"
            hrefLabel="Ver equipa"
            className="max-h-[480px]"
          >
            {teamWorkload.length === 0 ? (
              <Empty
                icon={Users}
                title="Sem dados da equipa"
                description="A distribuição de trabalho aparecerá aqui."
              />
            ) : (
              <ul className="space-y-5 px-3 py-3">
                {teamWorkload.map((member) => (
                  <li key={member.user_id}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={member.name} />

                        <div className="min-w-0">
                          <p className="truncate text-sm text-black">
                            {member.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {member.completed_tasks} concluídas ·{" "}
                            {member.pending_tasks} pendentes
                          </p>
                        </div>
                      </div>

                      <span className="text-xs tabular-nums text-slate-600">
                        {member.workload_percentage}%
                      </span>
                    </div>

                    <Bar
                      value={member.workload_percentage}
                      tone="bg-black"
                    />

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        {member.actual_hours}h realizadas
                      </span>

                      <span className="text-xs text-slate-400">
                        {member.hours_remaining}h restantes
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Documentos recentes"
            subtitle="Últimos documentos adicionados"
            href="/management/documents"
            className="max-h-[480px]"
          >
            {documents.length === 0 ? (
              <Empty
                icon={Upload}
                title="Sem documentos"
                description="Os documentos aparecerão aqui após o envio."
              />
            ) : (
              <ul>
                {documents.map((document) => (
                  <li key={document.document_id}>
                    <Link
                      href={`/management/documents/${document.document_id}`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 ${focusRing}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <FileText
                          className="h-4 w-4"
                          strokeWidth={1.5}
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-black">
                          {document.name || document.file_path}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {[
                            (document.project_id &&
                              projectTitleById[document.project_id]) ||
                              "Sem projecto",
                            fmt(document.created_at),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <CreateMeetingModal
        open={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        participants={users}
        clients={clients.map((client) => ({
          ...client,
          name: client.name ?? "",
          first_name: client.first_name ?? "",
          last_name: client.last_name ?? "",
        }))}
        suppliers={suppliers.map((supplier) => ({
          ...supplier,
          id: supplier.supplier_id,
          name: supplier.supplier_name,
        }))}
      />
    </div>
  );
}
