import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";
import {
    getManagementSettings,
    requireSettingsAdmin,
} from "@/services/settings";

import SettingsTabs from "./settings_tabs";
import { requireUser } from "@/app/lib/supabase/auth";

export const metadata = {
    title: "Definições | Pro-Sota",
    description: "Configurações do sistema de gestão Pro-Sota.",
};

export default async function SettingsPage() {
    
    const {user} = await requireUser();
    if (!user) {
        redirect("/login");
    }

    const initialSettings = await getManagementSettings();

    let canManage = false;

    try {
        await requireSettingsAdmin();
        canManage = true;
    } catch {
        canManage = false;
    }

    return (
        <SettingsTabs
            initialSettings={initialSettings}
            canManage={canManage}
        />
    );
}