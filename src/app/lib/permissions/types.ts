// src/app/lib/permissions/types.ts

export type Permission =
  // Dashboard
  | "dashboard.view"

  // Leads
  | "leads.view"
  | "leads.create"
  | "leads.edit"
  | "leads.delete"

  // Projects
  | "projects.view"
  | "projects.create"
  | "projects.edit"
  | "projects.delete"

  // Tasks
  | "tasks.view"
  | "tasks.create"
  | "tasks.edit"
  | "tasks.delete"
  | "tasks.assign"

  // Calendar
  | "calendar.view"
  | "calendar.create"
  | "calendar.edit"
  | "calendar.delete"

  // Messages
  | "messages.view"
  | "messages.create"

  // Clients
  | "clients.view"
  | "clients.create"
  | "clients.edit"
  | "clients.delete"

  // Team
  | "team.view"
  | "team.create"
  | "team.edit"
  | "team.delete"

  // Attendance
  | "attendance.view"
  | "attendance.manage"

  // Work resources
  | "work_resources.view"
  | "work_resources.create"
  | "work_resources.edit"
  | "work_resources.delete"
  | "work_resources.move"

  // Suppliers
  | "suppliers.view"
  | "suppliers.create"
  | "suppliers.edit"
  | "suppliers.delete"

  // Project Briefing
  | "project_briefing.view"
  |"project_briefing.create"
  |"project_briefing.delete"

  // Documents
  | "documents.view"
  | "documents.upload"
  | "documents.create"
  | "documents.edit"
  | "documents.delete"
  | "documents.approve"

  // Submissions
  | "submissions.view"
  | "submissions.create"
  | "submissions.edit"
  | "submissions.delete"
  | "submissions.review"
  | "submissions.approve"

  // Notifications
  | "notifications.view"

  // Profile
  | "profile.view"
  | "profile.edit";

export type PermissionEffect = "allow" | "deny";

export type PermissionOverride = {
  permissionKey: Permission;
  effect: PermissionEffect;
  reason?: string | null;
};

export type SystemRole = "Admin" | "Utilizador";

export type PermissionContextValue = {
  permissions: ReadonlySet<Permission>;
  can: (permission: Permission) => boolean;
  canAny: (permissions: readonly Permission[]) => boolean;
  canAll: (permissions: readonly Permission[]) => boolean;
};
export type PermissionSet = ReadonlySet<Permission>;

