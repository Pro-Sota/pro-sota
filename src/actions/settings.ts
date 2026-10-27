"use server";

import { revalidatePath } from "next/cache";

import {
    saveManagementSettings,
    type SettingsSection,
    type SettingsValue,
} from "@/services/settings";

const VALID_SECTIONS: SettingsSection[] = [
    "company",
    "projects",
    "team",
    "attendance",
    "calendar",
    "notifications",
    "system",
];

export async function saveSettingsAction(
    section: SettingsSection,
    values: SettingsValue
) {
    try {
        if (!VALID_SECTIONS.includes(section)) {
            return {
                success: false,
                message: "Secção inválida.",
            };
        }

        await saveManagementSettings(section, values);

        revalidatePath("/management/settings");

        return {
            success: true,
            message: "Definições guardadas com sucesso.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao guardar as definições.",
        };
    }
}