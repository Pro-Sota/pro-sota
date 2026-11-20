
export type Status =
  | "Concluído"
  | "Respondido"
  | "Aberto"
  | "Atrasado"
  | "Pendente"
  | "Para revisão";

/* -------------------------------------------------------------------------- */
/* Dashboard extras                                                           */
/* -------------------------------------------------------------------------- */

export interface ChangeOrder {
  id: string;
  title: string;
  value: number;
  status: string;
  date?: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string | null;
  openRfis: number;
  openTasks: number;
  overdueTasks: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  revision?: string | null;
  uploadedBy?: string | null;
  uploadedAt: string;
  href?: string;
}

export interface IssueItem {
  id: string;
  title: string;
  status: string;
  location?: string | null;
  due?: string | null;
}

export interface SiteReport {
  id: string;
  date: string;
  summary: string;
  headcount?: number | null;
  weatherDelay?: boolean;
}

export interface SitePhoto {
  id: string;
  url: string;
  caption?: string | null;
  takenAt?: string | null;
}

export interface SafetyIncident {
  id: string;
  title: string;
  date: string;
  status: string;
}

export interface SafetySummary {
  daysSinceIncident: number;
  openActions: number;
  incidents: SafetyIncident[];
}

export interface ProcurementItem {
  id: string;
  name: string;
  status: string;
  expectedDelivery?: string | null;
  requiredBy?: string | null;
  longLead?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Deadlines                                                                  */
/* -------------------------------------------------------------------------- */

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  status: string;
  kind?: string;
}

/* -------------------------------------------------------------------------- */
/* Optional dashboard data                                                    */
/* -------------------------------------------------------------------------- */

export interface OverviewExtras {
  upcomingDeadlines?: DeadlineItem[];
  overdueDeadlines?: DeadlineItem[];
  changeOrders?: ChangeOrder[];
  team?: TeamMember[];
  documents?: DocumentItem[];
  issues?: IssueItem[];
  siteReports?: SiteReport[];
  sitePhotos?: SitePhoto[];
  safety?: SafetySummary;
  procurement?: ProcurementItem[];
}
