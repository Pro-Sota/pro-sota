import type {
  Permission,
  SystemRole,
} from "./types";

export const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",

  "leads.view",
  "leads.create",
  "leads.edit",
  "leads.delete",

  "projects.view",
  "projects.create",
  "projects.edit",
  "projects.delete",

  "tasks.view",
  "tasks.create",
  "tasks.edit",
  "tasks.delete",
  "tasks.assign",

  "calendar.view",
  "calendar.create",
  "calendar.edit",
  "calendar.delete",

  "messages.view",
  "messages.create",

  "clients.view",
  "clients.create",
  "clients.edit",
  "clients.delete",

  "team.view",
  "team.create",
  "team.edit",
  "team.delete",

  "attendance.view",
  "attendance.manage",

  "work_resources.view",
  "work_resources.create",
  "work_resources.edit",
  "work_resources.delete",
  "work_resources.move",

  "suppliers.view",
  "suppliers.create",
  "suppliers.edit",
  "suppliers.delete",

  "documents.view",
  "documents.upload",
  "documents.edit",
  "documents.delete",

  "submissions.view",
  "submissions.create",
  "submissions.edit",
  "submissions.delete",
  "submissions.review",

  "notifications.view",

  "profile.view",
  "profile.edit",
];

/*
 * ============================================================
 * ROLE DEFAULT PERMISSIONS
 * ============================================================
 *
 * These are defaults only.
 *
 * Later, these can come from:
 *
 * roles
 * role_permissions
 * user_permissions
 *
 * in Supabase.
 */

/*
 * Superadmin
 *
 * Full access.
 */
export const SUPERADMIN_PERMISSIONS: Permission[] = [
  ...ALL_PERMISSIONS,
];

/*
 * Admin
 *
 * Administrative access.
 */
export const ADMIN_PERMISSIONS: Permission[] = [
  "dashboard.view",

  "leads.view",
  "leads.create",
  "leads.edit",
  "leads.delete",

  "projects.view",
  "projects.create",
  "projects.edit",
  "projects.delete",

  "tasks.view",
  "tasks.create",
  "tasks.edit",
  "tasks.delete",
  "tasks.assign",

  "calendar.view",
  "calendar.create",
  "calendar.edit",
  "calendar.delete",

  "messages.view",
  "messages.create",

  "clients.view",
  "clients.create",
  "clients.edit",
  "clients.delete",

  "team.view",
  "team.create",
  "team.edit",
  "team.delete",

  "attendance.view",
  "attendance.manage",

  "work_resources.view",
  "work_resources.create",
  "work_resources.edit",
  "work_resources.delete",
  "work_resources.move",

  "suppliers.view",
  "suppliers.create",
  "suppliers.edit",
  "suppliers.delete",

  "documents.view",
  "documents.upload",
  "documents.edit",
  "documents.delete",

  "submissions.view",
  "submissions.create",
  "submissions.edit",
  "submissions.delete",
  "submissions.review",

  "notifications.view",

  "profile.view",
  "profile.edit",
];

/*
 * Director
 */
export const DIRECTOR_PERMISSIONS: Permission[] = [
  "dashboard.view",

  "leads.view",

  "projects.view",
  "projects.create",
  "projects.edit",

  "tasks.view",
  "tasks.create",
  "tasks.edit",
  "tasks.assign",

  "calendar.view",
  "calendar.create",
  "calendar.edit",

  "messages.view",
  "messages.create",

  "clients.view",

  "team.view",

  "attendance.view",

  "work_resources.view",

  "suppliers.view",

  "documents.view",
  "documents.upload",
  "documents.edit",

  "submissions.view",
  "submissions.create",
  "submissions.edit",
  "submissions.review",

  "notifications.view",

  "profile.view",
  "profile.edit",
];

/*
 * Normal Utilizador
 */
export const USER_PERMISSIONS: Permission[] = [
  "dashboard.view",

  "projects.view",

  "tasks.view",
  "tasks.create",
  "tasks.edit",

  "calendar.view",

  "messages.view",
  "messages.create",

  "documents.view",
  "documents.upload",

  "submissions.view",
  "submissions.create",

  "notifications.view",

  "profile.view",
  "profile.edit",
];

export const ROLE_PERMISSIONS: Record<
  SystemRole,
  Permission[]
> = {
  Superadmin: SUPERADMIN_PERMISSIONS,
  Admin: ADMIN_PERMISSIONS,
  Director: DIRECTOR_PERMISSIONS,
  Utilizador: USER_PERMISSIONS,
};