// src/services/settings.ts

import "server-only";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SettingsSection =
    | "company"
    | "projects"
    | "team"
    | "attendance"
    | "calendar"
    | "notifications"
    | "system";

export type SettingsValue = Record<
    string,
    string | number | boolean | string[]
>;

export type ManagementSettings = Record<
    SettingsSection,
    SettingsValue
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

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SETTINGS: ManagementSettings = {
    company: {
        company_name: "PRO SOTA",
        country: "Angola",
        currency: "AOA",
        timezone: "Africa/Luanda",
    },

    projects: {
        default_urgency: "Medium",
        default_status: "Em curso",
        default_task_priority: "Medium",
    },

    team: {
        default_role: "Utilizador",
    },

    attendance: {
        work_start: "08:00",
        work_end: "17:00",
        grace_period_minutes: 15,
    },

    calendar: {
        default_meeting_duration: 60,
        reminder_minutes: 15,
        default_view: "month",
    },

    notifications: {
        task_assignments: true,
        deadlines: true,
        messages: true,
        mentions: true,
        approvals: true,
        project_updates: true,
        attendance: true,
        email: false,
    },

    system: {
        maintenance_mode: false,
    },
};

/* -------------------------------------------------------------------------- */
/* Field allowlists                                                           */
/* -------------------------------------------------------------------------- */

const ALLOWED_FIELDS: Record<SettingsSection, string[]> = {
    company: [
        "company_name",
        "country",
        "currency",
        "timezone",
    ],

    projects: [
        "default_urgency",
        "default_status",
        "default_task_priority",
    ],

    team: ["default_role"],

    attendance: [
        "work_start",
        "work_end",
        "grace_period_minutes",
    ],

    calendar: [
        "default_meeting_duration",
        "reminder_minutes",
        "default_view",
    ],

    notifications: [
        "task_assignments",
        "deadlines",
        "messages",
        "mentions",
        "approvals",
        "project_updates",
        "attendance",
        "email",
    ],

    system: ["maintenance_mode"],
};

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

async function getAuthenticatedUser() {
    const supabase = await createClient(await cookies());

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error(
            "Sessão inválida ou utilizador não autenticado."
        );
    }

    return { supabase, user };
}

/**
 * Retained for compatibility with existing settings pages/actions.
 *
 * User preferences are personal, so every authenticated user can manage
 * their own settings. This function does not grant access to company-wide
 * operational configuration.
 */
export async function requireSettingsAdmin() {
    return getAuthenticatedUser();
}

/* -------------------------------------------------------------------------- */
/* Read settings                                                              */
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
            `Não foi possível carregar as definições: ${error.message}`
        );
    }

    let row = data as UserSettingsRow | null;

    // Create default preferences if this user does not have a row yet.
    if (!row) {
        const { data: inserted, error: insertError } = await supabase
            .from("user_settings")
            .upsert(
                { profile_id: user.id },
                { onConflict: "profile_id" }
            )
            .select("*")
            .single();

        if (insertError || !inserted) {
            throw new Error(
                `Não foi possível inicializar as definições: ${
                    insertError?.message ?? "Erro desconhecido."
                }`
            );
        }

        row = inserted as UserSettingsRow;
    }

    return {
        ...DEFAULT_SETTINGS,

        // These values are defaults for the application UI, not columns
        // in user_settings. Keep them separate from personal preferences.
        company: {
            ...DEFAULT_SETTINGS.company,
        },

        projects: {
            ...DEFAULT_SETTINGS.projects,
        },

        team: {
            ...DEFAULT_SETTINGS.team,
        },

        attendance: {
            ...DEFAULT_SETTINGS.attendance,
        },

        calendar: {
            ...DEFAULT_SETTINGS.calendar,
            default_meeting_duration:
                row.calendar_default_meeting_duration,
            reminder_minutes: row.calendar_reminder_minutes,
            default_view: row.calendar_default_view,
        },

        notifications: {
            ...DEFAULT_SETTINGS.notifications,
            task_assignments: row.notify_task_assignments,
            deadlines: row.notify_deadlines,
            messages: row.notify_messages,
            mentions: row.notify_mentions,
            approvals: row.notify_approvals,
            project_updates: row.notify_project_updates,
            attendance: row.notify_attendance,
            email: row.notify_email,
        },

        system: {
            ...DEFAULT_SETTINGS.system,
        },
    };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateSettings(
    section: SettingsSection,
    values: SettingsValue
) {
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
    const allowedFields = ALLOWED_FIELDS[section];

    if (
        entries.length === 0 ||
        entries.some(([key]) => !allowedFields.includes(key))
    ) {
        throw new Error("Os campos enviados não são válidos.");
    }

    const booleanFields = new Set([
        "task_assignments",
        "deadlines",
        "messages",
        "mentions",
        "approvals",
        "project_updates",
        "attendance",
        "email",
        "maintenance_mode",
    ]);

    const numericRanges: Record<string, [number, number]> = {
        grace_period_minutes: [0, 1440],
        default_meeting_duration: [5, 480],
        reminder_minutes: [0, 10080],
    };

    const enumValues: Record<string, string[]> = {
        default_urgency: [
            "Low",
            "Medium",
            "High",
            "Critical",
        ],
        default_status: [
            "Em curso",
            "Em observação",
            "Concluído",
            "Em pausa",
        ],
        default_task_priority: [
            "Low",
            "Medium",
            "High",
            "Critical",
        ],
        default_role: ["Utilizador", "Director", "Admin"],
        default_view: ["day", "week", "month", "agenda"],
    };

    for (const [key, value] of entries) {
        if (booleanFields.has(key)) {
            if (typeof value !== "boolean") {
                throw new Error(`Valor inválido para ${key}.`);
            }

            continue;
        }

        if (Object.prototype.hasOwnProperty.call(numericRanges, key)) {
            const [min, max] = numericRanges[key];

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

        if (Object.prototype.hasOwnProperty.call(enumValues, key)) {
            if (
                typeof value !== "string" ||
                !enumValues[key].includes(value)
            ) {
                throw new Error(`Opção inválida para ${key}.`);
            }

            continue;
        }

        if (
            typeof value !== "string" ||
            value.trim().length === 0 ||
            value.length > 200
        ) {
            throw new Error(`Texto inválido para ${key}.`);
        }

        if (key === "work_start" || key === "work_end") {
            if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
                throw new Error(`Hora inválida para ${key}.`);
            }
        }

        if (key === "language" &&
            !["pt-PT", "pt-AO", "en"].includes(value)) {
            throw new Error("Idioma inválido.");
        }

        if (key === "theme" &&
            !["light", "dark", "system"].includes(value)) {
            throw new Error("Tema inválido.");
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Save settings                                                              */
/* -------------------------------------------------------------------------- */

export async function saveManagementSettings(
    section: SettingsSection,
    values: SettingsValue
) {
    const { supabase, user } = await getAuthenticatedUser();

    validateSettings(section, values);

    /*
     * Only preferences represented by columns in user_settings can be saved.
     * Company, project, team, attendance and system settings are not stored
     * in this table because they are not user-specific columns.
     */
    const databaseValues: Partial<UserSettingsRow> = {};

    if (section === "calendar") {
        if ("default_meeting_duration" in values) {
            databaseValues.calendar_default_meeting_duration =
                values.default_meeting_duration as number;
        }

        if ("reminder_minutes" in values) {
            databaseValues.calendar_reminder_minutes =
                values.reminder_minutes as number;
        }

        if ("default_view" in values) {
            databaseValues.calendar_default_view =
                values.default_view as UserSettingsRow["calendar_default_view"];
        }
    }

    if (section === "notifications") {
        const notificationMap = {
            task_assignments: "notify_task_assignments",
            deadlines: "notify_deadlines",
            messages: "notify_messages",
            mentions: "notify_mentions",
            approvals: "notify_approvals",
            project_updates: "notify_project_updates",
            attendance: "notify_attendance",
            email: "notify_email",
        } as const;

        for (const [key, column] of Object.entries(notificationMap)) {
            if (key in values) {
                databaseValues[column] = values[key] as never;
            }
        }
    }

    if (section === "system" ||
        section === "company" ||
        section === "projects" ||
        section === "team" ||
        section === "attendance") {
        throw new Error(
            "Esta secção contém definições organizacionais que não são guardadas em user_settings."
        );
    }

    if (Object.keys(databaseValues).length === 0) {
        throw new Error("Não existem preferências válidas para guardar.");
    }

    const { data, error } = await supabase
        .from("user_settings")
        .upsert(
            {
                profile_id: user.id,
                ...databaseValues,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "profile_id" }
        )
        .select("*")
        .single();

    if (error || !data) {
        throw new Error(
            `Não foi possível guardar as definições: ${
                error?.message ?? "Erro desconhecido."
            }`
        );
    }

    const row = data as UserSettingsRow;

    const updatedSection: SettingsValue =
        section === "calendar"
            ? {
                default_meeting_duration:
                    row.calendar_default_meeting_duration,
                reminder_minutes: row.calendar_reminder_minutes,
                default_view: row.calendar_default_view,
            }
            : {
                task_assignments: row.notify_task_assignments,
                deadlines: row.notify_deadlines,
                messages: row.notify_messages,
                mentions: row.notify_mentions,
                approvals: row.notify_approvals,
                project_updates: row.notify_project_updates,
                attendance: row.notify_attendance,
                email: row.notify_email,
            };

    return updatedSection;
}