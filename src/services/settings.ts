
import "server-only";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { getCurrentUserPermissions } from "@/app/lib/permissions/server";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SettingsSection =
    | "company"
    | "calendar"
    | "notifications";

export type SettingsValue = Record<
    string,
    string | number | boolean | string[]
>;

export type ManagementSettings = Record<
    SettingsSection,
    SettingsValue
>;

export type OrganisationNotificationSettings = {
    id: 1;
    notify_messages: boolean;
    notify_mentions: boolean;
    notify_task_assignments: boolean;
    notify_deadlines: boolean;
    notify_approvals: boolean;
    notify_project_updates: boolean;
    notify_attendance: boolean;
    channel_in_app: boolean;
    channel_email: boolean;
    updated_by: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type OrganisationNotificationValues = Pick<
    OrganisationNotificationSettings,
    | "notify_messages"
    | "notify_mentions"
    | "notify_task_assignments"
    | "notify_deadlines"
    | "notify_approvals"
    | "notify_project_updates"
    | "notify_attendance"
    | "channel_in_app"
    | "channel_email"
>;

type UserSettingsRow = {
    profile_id: string;
    language: "pt-PT" | "pt-AO" | "en";
    theme: "light" | "dark" | "system";
    timezone: string;
    compact_mode: boolean;
    notify_messages: boolean;
    notify_mentions: boolean;
    notify_task_assignments: boolean;
    notify_deadlines: boolean;
    notify_approvals: boolean;
    notify_project_updates: boolean;
    notify_attendance: boolean;
    notify_email: boolean;
    calendar_default_view: "day" | "week" | "month" | "agenda";
    calendar_default_meeting_duration: number;
    calendar_reminder_minutes: number;
    created_at: string;
    updated_at: string;
};

type UserSettingsUpdate = {
    profile_id: string;
    updated_at: string;
    language?: UserSettingsRow["language"];
    theme?: UserSettingsRow["theme"];
    timezone?: string;
    compact_mode?: boolean;
    notify_messages?: boolean;
    notify_mentions?: boolean;
    notify_task_assignments?: boolean;
    notify_deadlines?: boolean;
    notify_approvals?: boolean;
    notify_project_updates?: boolean;
    notify_attendance?: boolean;
    notify_email?: boolean;
    calendar_default_view?: UserSettingsRow["calendar_default_view"];
    calendar_default_meeting_duration?: number;
    calendar_reminder_minutes?: number;
};

type OrganisationNotificationRow = {
    id: number;
    notify_messages: boolean;
    notify_mentions: boolean;
    notify_task_assignments: boolean;
    notify_deadlines: boolean;
    notify_approvals: boolean;
    notify_project_updates: boolean;
    notify_attendance: boolean;
    channel_in_app: boolean;
    channel_email: boolean;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
};

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SETTINGS: ManagementSettings = {
    company: {
        language: "pt-AO",
        theme: "light",
        timezone: "Africa/Luanda",
        compact_mode: false,
    },

    calendar: {
        calendar_default_view: "month",
        calendar_default_meeting_duration: 60,
        calendar_reminder_minutes: 15,
    },

    notifications: {
        notify_messages: true,
        notify_mentions: true,
        notify_task_assignments: true,
        notify_deadlines: true,
        notify_approvals: true,
        notify_project_updates: true,
        notify_attendance: true,
        notify_email: false,
    },
};

export const DEFAULT_ORGANISATION_NOTIFICATIONS: OrganisationNotificationSettings = {
    id: 1,
    notify_messages: true,
    notify_mentions: true,
    notify_task_assignments: true,
    notify_deadlines: true,
    notify_approvals: true,
    notify_project_updates: true,
    notify_attendance: true,
    channel_in_app: true,
    channel_email: false,
    updated_by: null,
    created_at: null,
    updated_at: null,
};

/* -------------------------------------------------------------------------- */
/* Field allowlists                                                           */
/* -------------------------------------------------------------------------- */

const ALLOWED_FIELDS: Record<SettingsSection, readonly string[]> = {
    company: [
        "language",
        "theme",
        "timezone",
        "compact_mode",
    ],

    calendar: [
        "calendar_default_view",
        "calendar_default_meeting_duration",
        "calendar_reminder_minutes",
    ],

    notifications: [
        "notify_messages",
        "notify_mentions",
        "notify_task_assignments",
        "notify_deadlines",
        "notify_approvals",
        "notify_project_updates",
        "notify_attendance",
        "notify_email",
    ],
};

const ORGANISATION_NOTIFICATION_FIELDS = [
    "notify_messages",
    "notify_mentions",
    "notify_task_assignments",
    "notify_deadlines",
    "notify_approvals",
    "notify_project_updates",
    "notify_attendance",
    "channel_in_app",
    "channel_email",
] as const;

const VALID_LANGUAGES = ["pt-PT", "pt-AO", "en"] as const;
const VALID_THEMES = ["light", "dark", "system"] as const;
const VALID_CALENDAR_VIEWS = ["day", "week", "month", "agenda"] as const;

const VALID_TIMEZONES = [
    "Africa/Luanda",
    "Europe/Lisbon",
    "Europe/London",
] as const;

const BOOLEAN_FIELDS = new Set([
    "compact_mode",
    "notify_messages",
    "notify_mentions",
    "notify_task_assignments",
    "notify_deadlines",
    "notify_approvals",
    "notify_project_updates",
    "notify_attendance",
    "notify_email",
]);

const NUMERIC_RANGES: Record<string, [number, number]> = {
    calendar_default_meeting_duration: [5, 480],
    calendar_reminder_minutes: [0, 10080],
};

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error(
            "Sessão inválida ou utilizador não autenticado.",
        );
    }

    return { supabase, user };
}

async function assertOrganisationNotificationPermission(
    permission: "settings.notifications.view" | "settings.notifications.manage",
) {
    const auth = await getCurrentUserPermissions();

    if (
        auth.role !== "Admin" &&
        !auth.permissions.has(permission)
    ) {
        throw new Error(
            "Não tem permissões para aceder a estas definições da organização.",
        );
    }
}

/* -------------------------------------------------------------------------- */
/* Personal settings validation                                               */
/* -------------------------------------------------------------------------- */

function validateSettings(
    section: SettingsSection,
    values: SettingsValue,
): void {
    if (
        !section ||
        !Object.prototype.hasOwnProperty.call(ALLOWED_FIELDS, section)
    ) {
        throw new Error("Secção de definições inválida.");
    }

    if (
        !values ||
        typeof values !== "object" ||
        Array.isArray(values)
    ) {
        throw new Error("Os valores enviados não são válidos.");
    }

    const entries = Object.entries(values);

    if (entries.length === 0) {
        throw new Error("Não existem alterações para guardar.");
    }

    const allowedFields = ALLOWED_FIELDS[section];

    for (const [key, value] of entries) {
        if (!allowedFields.includes(key)) {
            throw new Error(
                `O campo "${key}" não pode ser alterado nesta secção.`,
            );
        }

        if (BOOLEAN_FIELDS.has(key)) {
            if (typeof value !== "boolean") {
                throw new Error(`Valor inválido para ${key}.`);
            }

            continue;
        }

        if (Object.prototype.hasOwnProperty.call(NUMERIC_RANGES, key)) {
            const [min, max] = NUMERIC_RANGES[key];

            if (
                typeof value !== "number" ||
                !Number.isInteger(value) ||
                value < min ||
                value > max
            ) {
                throw new Error(`Valor numérico inválido para ${key}.`);
            }

            continue;
        }

        if (key === "language") {
            if (
                typeof value !== "string" ||
                !VALID_LANGUAGES.includes(
                    value as (typeof VALID_LANGUAGES)[number],
                )
            ) {
                throw new Error("Idioma inválido.");
            }

            continue;
        }

        if (key === "theme") {
            if (
                typeof value !== "string" ||
                !VALID_THEMES.includes(
                    value as (typeof VALID_THEMES)[number],
                )
            ) {
                throw new Error("Tema inválido.");
            }

            continue;
        }

        if (key === "timezone") {
            if (
                typeof value !== "string" ||
                !VALID_TIMEZONES.includes(
                    value as (typeof VALID_TIMEZONES)[number],
                )
            ) {
                throw new Error("Fuso horário inválido.");
            }

            continue;
        }

        if (key === "calendar_default_view") {
            if (
                typeof value !== "string" ||
                !VALID_CALENDAR_VIEWS.includes(
                    value as (typeof VALID_CALENDAR_VIEWS)[number],
                )
            ) {
                throw new Error(
                    "Vista predefinida do calendário inválida.",
                );
            }

            continue;
        }

        throw new Error(`Campo não suportado: ${key}.`);
    }
}

/* -------------------------------------------------------------------------- */
/* Read personal settings                                                     */
/* -------------------------------------------------------------------------- */

export async function getManagementSettings(): Promise<ManagementSettings> {
    const { supabase, user } = await getAuthenticatedUser();

    const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Não foi possível carregar as definições: ${error.message}`,
        );
    }

    let row = data as UserSettingsRow | null;

    if (!row) {
        const { data: inserted, error: insertError } = await supabase
            .from("user_settings")
            .upsert(
                { profile_id: user.id },
                { onConflict: "profile_id" },
            )
            .select("*")
            .single();

        if (insertError || !inserted) {
            throw new Error(
                `Não foi possível inicializar as definições: ${
                    insertError?.message ?? "Erro desconhecido."
                }`,
            );
        }

        row = inserted as UserSettingsRow;
    }

    return {
        company: {
            language: row.language ?? DEFAULT_SETTINGS.company.language,
            theme: row.theme ?? DEFAULT_SETTINGS.company.theme,
            timezone: row.timezone ?? DEFAULT_SETTINGS.company.timezone,
            compact_mode:
                row.compact_mode ?? DEFAULT_SETTINGS.company.compact_mode,
        },

        calendar: {
            calendar_default_view:
                row.calendar_default_view ??
                DEFAULT_SETTINGS.calendar.calendar_default_view,

            calendar_default_meeting_duration:
                row.calendar_default_meeting_duration ??
                DEFAULT_SETTINGS.calendar.calendar_default_meeting_duration,

            calendar_reminder_minutes:
                row.calendar_reminder_minutes ??
                DEFAULT_SETTINGS.calendar.calendar_reminder_minutes,
        },

        notifications: {
            notify_messages:
                row.notify_messages ??
                DEFAULT_SETTINGS.notifications.notify_messages,

            notify_mentions:
                row.notify_mentions ??
                DEFAULT_SETTINGS.notifications.notify_mentions,

            notify_task_assignments:
                row.notify_task_assignments ??
                DEFAULT_SETTINGS.notifications.notify_task_assignments,

            notify_deadlines:
                row.notify_deadlines ??
                DEFAULT_SETTINGS.notifications.notify_deadlines,

            notify_approvals:
                row.notify_approvals ??
                DEFAULT_SETTINGS.notifications.notify_approvals,

            notify_project_updates:
                row.notify_project_updates ??
                DEFAULT_SETTINGS.notifications.notify_project_updates,

            notify_attendance:
                row.notify_attendance ??
                DEFAULT_SETTINGS.notifications.notify_attendance,

            notify_email:
                row.notify_email ??
                DEFAULT_SETTINGS.notifications.notify_email,
        },
    };
}

/* -------------------------------------------------------------------------- */
/* Build personal database update                                             */
/* -------------------------------------------------------------------------- */

function buildDatabaseUpdate(
    section: SettingsSection,
    values: SettingsValue,
): Omit<UserSettingsUpdate, "profile_id" | "updated_at"> {
    const update: Omit<
        UserSettingsUpdate,
        "profile_id" | "updated_at"
    > = {};

    if (section === "company") {
        if ("language" in values) {
            update.language = values.language as UserSettingsRow["language"];
        }

        if ("theme" in values) {
            update.theme = values.theme as UserSettingsRow["theme"];
        }

        if ("timezone" in values) {
            update.timezone = values.timezone as string;
        }

        if ("compact_mode" in values) {
            update.compact_mode = values.compact_mode as boolean;
        }
    }

    if (section === "calendar") {
        if ("calendar_default_view" in values) {
            update.calendar_default_view =
                values.calendar_default_view as UserSettingsRow["calendar_default_view"];
        }

        if ("calendar_default_meeting_duration" in values) {
            update.calendar_default_meeting_duration =
                values.calendar_default_meeting_duration as number;
        }

        if ("calendar_reminder_minutes" in values) {
            update.calendar_reminder_minutes =
                values.calendar_reminder_minutes as number;
        }
    }

    if (section === "notifications") {
        if ("notify_messages" in values) {
            update.notify_messages = values.notify_messages as boolean;
        }

        if ("notify_mentions" in values) {
            update.notify_mentions = values.notify_mentions as boolean;
        }

        if ("notify_task_assignments" in values) {
            update.notify_task_assignments =
                values.notify_task_assignments as boolean;
        }

        if ("notify_deadlines" in values) {
            update.notify_deadlines = values.notify_deadlines as boolean;
        }

        if ("notify_approvals" in values) {
            update.notify_approvals = values.notify_approvals as boolean;
        }

        if ("notify_project_updates" in values) {
            update.notify_project_updates =
                values.notify_project_updates as boolean;
        }

        if ("notify_attendance" in values) {
            update.notify_attendance = values.notify_attendance as boolean;
        }

        if ("notify_email" in values) {
            update.notify_email = values.notify_email as boolean;
        }
    }

    return update;
}

/* -------------------------------------------------------------------------- */
/* Save personal settings                                                     */
/* -------------------------------------------------------------------------- */

export async function saveManagementSettings(
    section: SettingsSection,
    values: SettingsValue,
): Promise<SettingsValue> {
    const { supabase, user } = await getAuthenticatedUser();

    validateSettings(section, values);

    const databaseValues = buildDatabaseUpdate(section, values);

    if (Object.keys(databaseValues).length === 0) {
        throw new Error("Não existem preferências válidas para guardar.");
    }

    const update: UserSettingsUpdate = {
        profile_id: user.id,
        updated_at: new Date().toISOString(),
        ...databaseValues,
    };

    const { data, error } = await supabase
        .from("user_settings")
        .upsert(update, { onConflict: "profile_id" })
        .select("*")
        .single();

    if (error || !data) {
        throw new Error(
            `Não foi possível guardar as definições: ${
                error?.message ?? "Erro desconhecido."
            }`,
        );
    }

    const row = data as UserSettingsRow;

    if (section === "company") {
        return {
            language: row.language,
            theme: row.theme,
            timezone: row.timezone,
            compact_mode: row.compact_mode,
        };
    }

    if (section === "calendar") {
        return {
            calendar_default_view: row.calendar_default_view,
            calendar_default_meeting_duration:
                row.calendar_default_meeting_duration,
            calendar_reminder_minutes: row.calendar_reminder_minutes,
        };
    }

    return {
        notify_messages: row.notify_messages,
        notify_mentions: row.notify_mentions,
        notify_task_assignments: row.notify_task_assignments,
        notify_deadlines: row.notify_deadlines,
        notify_approvals: row.notify_approvals,
        notify_project_updates: row.notify_project_updates,
        notify_attendance: row.notify_attendance,
        notify_email: row.notify_email,
    };
}

/* -------------------------------------------------------------------------- */
/* Read organisation-wide notification settings                              */
/* -------------------------------------------------------------------------- */

export async function getOrganisationNotificationSettings(): Promise<OrganisationNotificationSettings> {
    await assertOrganisationNotificationPermission(
        "settings.notifications.view",
    );

    const { supabase } = await getAuthenticatedUser();

    const { data, error } = await supabase
        .from("organisation_notification_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Não foi possível carregar as notificações da organização: ${error.message}`,
        );
    }

    if (!data) {
        return DEFAULT_ORGANISATION_NOTIFICATIONS;
    }

    const row = data as OrganisationNotificationRow;

    return {
        id: 1,
        notify_messages: row.notify_messages,
        notify_mentions: row.notify_mentions,
        notify_task_assignments: row.notify_task_assignments,
        notify_deadlines: row.notify_deadlines,
        notify_approvals: row.notify_approvals,
        notify_project_updates: row.notify_project_updates,
        notify_attendance: row.notify_attendance,
        channel_in_app: row.channel_in_app,
        channel_email: row.channel_email,
        updated_by: row.updated_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

/* -------------------------------------------------------------------------- */
/* Validate organisation notification updates                                 */
/* -------------------------------------------------------------------------- */

function validateOrganisationNotificationValues(
    values: OrganisationNotificationValues,
): void {
    if (
        !values ||
        typeof values !== "object" ||
        Array.isArray(values)
    ) {
        throw new Error("Os dados das notificações não são válidos.");
    }

    const entries = Object.entries(values);

    if (entries.length === 0) {
        throw new Error("Não existem alterações para guardar.");
    }

    for (const [key, value] of entries) {
        if (
            !ORGANISATION_NOTIFICATION_FIELDS.includes(
                key as (typeof ORGANISATION_NOTIFICATION_FIELDS)[number],
            )
        ) {
            throw new Error(
                `O campo "${key}" não pode ser alterado.`,
            );
        }

        if (typeof value !== "boolean") {
            throw new Error(`Valor inválido para ${key}.`);
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Save organisation-wide notification settings                              */
/* -------------------------------------------------------------------------- */

export async function saveOrganisationNotificationSettings(
    values: OrganisationNotificationValues,
): Promise<OrganisationNotificationSettings> {
    await assertOrganisationNotificationPermission(
        "settings.notifications.manage",
    );

    const { supabase } = await getAuthenticatedUser();

    validateOrganisationNotificationValues(values);

    const update: Partial<OrganisationNotificationValues> & {
        id: 1;
    } = {
        id: 1,
    };

    for (const key of ORGANISATION_NOTIFICATION_FIELDS) {
        if (key in values) {
            update[key] = values[key];
        }
    }

    const { data, error } = await supabase
        .from("organisation_notification_settings")
        .upsert(update, { onConflict: "id" })
        .select("*")
        .single();

    if (error || !data) {
        throw new Error(
            `Não foi possível guardar as notificações da organização: ${
                error?.message ?? "Erro desconhecido."
            }`,
        );
    }

    const row = data as OrganisationNotificationRow;

    return {
        id: 1,
        notify_messages: row.notify_messages,
        notify_mentions: row.notify_mentions,
        notify_task_assignments: row.notify_task_assignments,
        notify_deadlines: row.notify_deadlines,
        notify_approvals: row.notify_approvals,
        notify_project_updates: row.notify_project_updates,
        notify_attendance: row.notify_attendance,
        channel_in_app: row.channel_in_app,
        channel_email: row.channel_email,
        updated_by: row.updated_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
