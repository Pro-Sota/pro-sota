export type SystemRole =
  | "Superadmin"
  | "Admin"
  | "Director"
  | "Utilizador";

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

  // Documents
  | "documents.view"
  | "documents.upload"
  | "documents.edit"
  | "documents.delete"

  // Submissions
  | "submissions.view"
  | "submissions.create"
  | "submissions.edit"
  | "submissions.delete"
  | "submissions.review"

  // Notifications
  | "notifications.view"

  // Profile
  | "profile.view"
  | "profile.edit";

export type PermissionSet = ReadonlySet<Permission>;

export type PermissionContextValue = {
  permissions: PermissionSet;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
};