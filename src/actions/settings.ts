
"use server";

import { revalidatePath } from "next/cache";

import {
    saveManagementSettings,
    saveOrganisationNotificationSettings,
    type OrganisationNotificationValues,
    type SettingsSection,
    type SettingsValue,
} from "@/services/settings";

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const VALID_SECTIONS: readonly SettingsSection[] = [
    "company",
    "calendar",
    "notifications",
];

/* -------------------------------------------------------------------------- */
/* Save personal settings                                                     */
/* -------------------------------------------------------------------------- */

export async function saveSettingsAction(
    section: SettingsSection,
    values: SettingsValue,
) {
    try {
        if (
            typeof section !== "string" ||
            !VALID_SECTIONS.includes(section as SettingsSection)
        ) {
            return {
                success: false,
                message: "Secção de definições inválida.",
            };
        }

        if (
            !values ||
            typeof values !== "object" ||
            Array.isArray(values)
        ) {
            return {
                success: false,
                message: "Os dados enviados não são válidos.",
            };
        }

        const updatedSettings = await saveManagementSettings(
            section,
            values,
        );

        revalidatePath("/management/settings");

        return {
            success: true,
            message: "Preferências guardadas com sucesso.",
            data: updatedSettings,
        };
    } catch (error) {
        console.error("[saveSettingsAction]", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao guardar as preferências.",
        };
    }
}

/* -------------------------------------------------------------------------- */
/* Save organisation notification settings                                   */
/* -------------------------------------------------------------------------- */

export async function saveOrganisationNotificationSettingsAction(
    values: OrganisationNotificationValues,
) {
    try {
        if (
            !values ||
            typeof values !== "object" ||
            Array.isArray(values)
        ) {
            return {
                success: false,
                message: "Os dados das notificações não são válidos.",
            };
        }

        const updatedSettings =
            await saveOrganisationNotificationSettings(values);

        revalidatePath("/management/settings");

        return {
            success: true,
            message: "Definições globais guardadas com sucesso.",
            data: updatedSettings,
        };
    } catch (error) {
        console.error(
            "[saveOrganisationNotificationSettingsAction]",
            error,
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao guardar as definições globais.",
        };
    }
}
