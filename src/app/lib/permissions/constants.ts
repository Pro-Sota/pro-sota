
import type {
    Permission,
    SystemRole,
} from "./types";

/* -------------------------------------------------------------------------- */
/* All available permissions                                                  */
/* -------------------------------------------------------------------------- */

export const ALL_PERMISSIONS: Permission[] = [
    "dashboard.view",

    // Leads
    "leads.view",
    "leads.create",
    "leads.edit",
    "leads.delete",

    // Projects
    "projects.view",
    "projects.create",
    "projects.edit",
    "projects.delete",

    // Tasks
    "tasks.view",
    "tasks.create",
    "tasks.edit",
    "tasks.delete",
    "tasks.assign",

    // Calendar
    "calendar.view",
    "calendar.create",
    "calendar.edit",
    "calendar.delete",

    // Messages
    "messages.view",
    "messages.create",

    // Clients
    "clients.view",
    "clients.create",
    "clients.edit",
    "clients.delete",

    // Team
    "team.view",
    "team.create",
    "team.edit",
    "team.delete",

    // Attendance
    "attendance.view",
    "attendance.manage",

    // Work resources
    "work_resources.view",
    "work_resources.create",
    "work_resources.edit",
    "work_resources.delete",
    "work_resources.move",

    // Suppliers
    "suppliers.view",
    "suppliers.create",
    "suppliers.edit",
    "suppliers.delete",

    // Project briefing
    "project_briefing.view",
    "project_briefing.create",
    "project_briefing.delete",

    // Documents
    "documents.view",
    "documents.upload",
    "documents.create",
    "documents.edit",
    "documents.delete",
    "documents.approve",

    // Submissions
    "submissions.view",
    "submissions.create",
    "submissions.edit",
    "submissions.delete",
    "submissions.review",
    "submissions.approve",

    // Notifications
    "notifications.view",

    // Profile
    "profile.view",
    "profile.edit",

    // Settings
    "settings.view",
    "settings.edit",
    "settings.roles.view",
    "settings.roles.manage",
    "settings.notifications.view",
    "settings.notifications.manage",
    "settings.operational.view",
    "settings.operational.manage",
    "settings.audit.view",
];

/* -------------------------------------------------------------------------- */
/* Admin permissions                                                          */
/* -------------------------------------------------------------------------- */

export const ADMIN_PERMISSIONS: Permission[] = [
    ...ALL_PERMISSIONS,
];

/* -------------------------------------------------------------------------- */
/* Director permissions                                                       */
/* -------------------------------------------------------------------------- */

export const DIRECTOR_PERMISSIONS: Permission[] = [
    "dashboard.view",

    // Leads
    "leads.view",

    // Projects
    "projects.view",
    "projects.create",
    "projects.edit",

    // Tasks
    "tasks.view",
    "tasks.create",
    "tasks.edit",
    "tasks.assign",

    // Calendar
    "calendar.view",
    "calendar.create",
    "calendar.edit",

    // Messages
    "messages.view",
    "messages.create",

    // Clients
    "clients.view",

    // Team
    "team.view",

    // Attendance
    "attendance.view",

    // Work resources
    "work_resources.view",

    // Suppliers
    "suppliers.view",

    // Project briefing
    "project_briefing.view",
    "project_briefing.create",

    // Documents
    "documents.view",
    "documents.upload",
    "documents.edit",

    // Submissions
    "submissions.view",
    "submissions.create",
    "submissions.edit",
    "submissions.review",

    // Notifications
    "notifications.view",

    // Profile
    "profile.view",
    "profile.edit",

    // Settings
    "settings.view",
    "settings.notifications.view",
    "settings.operational.view",
];

/* -------------------------------------------------------------------------- */
/* Normal user permissions                                                    */
/* -------------------------------------------------------------------------- */

export const USER_PERMISSIONS: Permission[] = [
    "dashboard.view",

    // Projects
    "projects.view",

    // Tasks
    "tasks.view",
    "tasks.create",
    "tasks.edit",

    // Calendar
    "calendar.view",

    // Messages
    "messages.view",
    "messages.create",

    // Project briefing
    "project_briefing.view",
    "project_briefing.create",

    // Documents
    "documents.view",
    "documents.upload",

    // Submissions
    "submissions.view",
    "submissions.create",

    // Notifications
    "notifications.view",

    // Profile
    "profile.view",
    "profile.edit",

    // Personal Settings
    "settings.view",
];

/* -------------------------------------------------------------------------- */
/* Role permission mapping                                                    */
/* -------------------------------------------------------------------------- */

export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
    Admin: ADMIN_PERMISSIONS,
    Director: DIRECTOR_PERMISSIONS,
    Utilizador: USER_PERMISSIONS,
};
