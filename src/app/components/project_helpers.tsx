import { ProjectListItem } from "../management/projects/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Optional fields the list may or may not already return. If your
 * ProjectListItem already has them, this intersection is harmless.
 * If not, add them to the select in the server query and to the type.
 */
export type ProjectWithMeta = ProjectListItem & {
  updated_at?: string | null;
  start_date?: string | null;
};

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  Residential: "Residencial",
  Commercial: "Comercial",
  Industrial: "Industrial",
  Institutional: "Institucional",
  "Mixed Use": "Uso misto",
  Renovation: "Reabilitação",
  "Interior Design": "Design de interiores",
  Landscape: "Paisagismo",
  Other: "Outro",
};

/* -------------------------------------------------------------------------- */
/* Normalisation                                                              */
/* -------------------------------------------------------------------------- */

/** Lowercase, trimmed, accent-free text so "Reabilitação" matches "reabilitacao". */
export function normalizeText(value: string | null | undefined) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") ?? ""
  );
}

/** "Em Curso", "em-curso", "EM CURSO", "em_curso" all become "em-curso". */
export function normalizeStatus(value: string | null | undefined) {
  return normalizeText(value).replace(/[\s_]+/g, "-");
}

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Single place to adjust project sub-routes. Only `open` is known to exist;
 * check the others against your app folder and edit here if they differ.
 */
export function projectRoutes(projectId: string | number) {
  const base = `/management/projects/${projectId}`;

  return {
    open: base,
    tasks: `${base}/tasks`,
    documents: `${base}/documents`,
    team: `${base}/team`,
    edit: `${base}/edit`,
  };
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Matches title, code, location, client and type (raw and Portuguese label).
 * Every word typed must match somewhere, so "villa luanda" narrows results.
 */
export function matchesSearch(project: ProjectListItem, term: string) {
  const words = normalizeText(term).split(/\s+/).filter(Boolean);

  if (words.length === 0) return true;

  const typeLabel = project.type ? PROJECT_TYPE_LABELS[project.type] : null;

  const haystack = normalizeText(
    [
      project.title,
      project.project_code,
      project.location,
      project.municipality,
      project.province,
      project.client_name,
      project.type,
      typeLabel,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return words.every((word) => haystack.includes(word));
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

export const SORT_OPTIONS = [
  { value: "updated", label: "Última actualização" },
  { value: "start", label: "Data de início" },
  { value: "deadline", label: "Prazo" },
  { value: "name", label: "Nome" },
  { value: "code", label: "Código" },
  { value: "urgency", label: "Urgência" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "updated";

const collator = new Intl.Collator("pt", {
  numeric: true,
  sensitivity: "base",
});

function toTime(value?: string | null) {
  if (!value) return null;

  const time = Date.parse(value);

  return Number.isNaN(time) ? null : time;
}

/** Missing dates always go last, in either direction. */
function compareDates(
  a: number | null,
  b: number | null,
  direction: "asc" | "desc",
) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  return direction === "asc" ? a - b : b - a;
}

function compareText(a?: string | null, b?: string | null) {
  const x = a?.trim() ?? "";
  const y = b?.trim() ?? "";

  if (!x && !y) return 0;
  if (!x) return 1;
  if (!y) return -1;

  return collator.compare(x, y);
}

function urgencyRank(urgency: string | null | undefined) {
  switch (normalizeText(urgency)) {
    case "critical":
    case "critico":
    case "critica":
      return 4;
    case "high":
    case "alta":
      return 3;
    case "medium":
    case "media":
      return 2;
    case "low":
    case "baixa":
      return 1;
    default:
      return 0;
  }
}

/**
 * Returns a sorted copy. Array.sort is stable, so if no project has the
 * field being sorted on, the server's original order is kept.
 *
 * updated   newest first
 * start     newest first
 * deadline  soonest first
 * name/code A to Z (numeric aware)
 * urgency   Crítica first
 */
export function sortProjects<T extends ProjectListItem>(
  projects: T[],
  sort: SortValue,
): T[] {
  const list = [...projects];

  list.sort((a, b) => {
    const metaA = a as ProjectWithMeta;
    const metaB = b as ProjectWithMeta;

    switch (sort) {
      case "updated":
        return compareDates(
          toTime(metaA.updated_at),
          toTime(metaB.updated_at),
          "desc",
        );

      case "start":
        return compareDates(
          toTime(metaA.start_date),
          toTime(metaB.start_date),
          "desc",
        );

      case "deadline":
        return compareDates(
          toTime(a.next_deadline ?? a.end_date),
          toTime(b.next_deadline ?? b.end_date),
          "asc",
        );

      case "name":
        return compareText(a.title, b.title);

      case "code":
        return compareText(a.project_code, b.project_code);

      case "urgency":
        return urgencyRank(b.urgency) - urgencyRank(a.urgency);

      default:
        return 0;
    }
  });

  return list;
}

/* -------------------------------------------------------------------------- */
/* Last updated                                                               */
/* -------------------------------------------------------------------------- */

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function getProjectUpdatedAt(project: ProjectListItem) {
  return (project as ProjectWithMeta).updated_at ?? null;
}

/**
 * "Atualizado há 5 min" / "há 2h" / "ontem" / "em 02 Out 2026".
 * Returns null when there is no usable date, so callers can skip rendering.
 */
export function formatUpdatedAt(date: string | null, now = new Date()) {
  if (!date) return null;

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return null;

  const minutes = Math.floor((now.getTime() - value.getTime()) / 60000);

  if (minutes < 1) return "Atualizado agora";
  if (minutes < 60) return `Atualizado há ${minutes} min`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `Atualizado há ${hours}h`;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfValue = new Date(value);
  startOfValue.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfValue.getTime()) / 86400000,
  );

  if (dayDiff === 1) return "Atualizado ontem";

  const day = String(value.getDate()).padStart(2, "0");

  return `Atualizado em ${day} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
}