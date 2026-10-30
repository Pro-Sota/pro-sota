
import { redirect } from "next/navigation";

import { requireUser } from "@/app/lib/supabase/auth";
import { getCurrentUserPermissions } from "@/app/lib/permissions/server";

import {
    getManagementSettings,
    getOrganisationNotificationSettings,
} from "@/services/settings";

import Settings from "./settings_page";

export const metadata = {
    title: "Definições | Pro-Sota",
    description: "Configurações do sistema de gestão Pro-Sota.",
};

export default async function SettingsPage() {
    /* ---------------------------------------------------------------------- */
    /* Authentication                                                         */
    /* ---------------------------------------------------------------------- */

    const { user } = await requireUser();

    if (!user) {
        redirect("/login");
    }

    /* ---------------------------------------------------------------------- */
    /* Effective permissions                                                  */
    /* ---------------------------------------------------------------------- */

    const auth = await getCurrentUserPermissions();
    const isAdmin = auth.role === "Admin";

    if (
        !isAdmin &&
        !auth.permissions.has("settings.view")
    ) {
        redirect("/management");
    }

    /* ---------------------------------------------------------------------- */
    /* Personal settings                                                      */
    /* ---------------------------------------------------------------------- */

    const initialSettings = await getManagementSettings();

    const canManagePersonal =
        isAdmin ||
        auth.permissions.has("settings.manage");

    /* ---------------------------------------------------------------------- */
    /* Organisation notification permissions                                 */
    /* ---------------------------------------------------------------------- */

    const canViewOrganisationNotifications =
        isAdmin ||
        auth.permissions.has("settings.notifications.view");

    const canManageOrganisationNotifications =
        isAdmin ||
        auth.permissions.has("settings.notifications.manage");

    /* ---------------------------------------------------------------------- */
    /* Organisation notification settings                                    */
    /* ---------------------------------------------------------------------- */

    const initialOrganisationNotifications =
        canViewOrganisationNotifications
            ? await getOrganisationNotificationSettings()
            : null;

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <Settings
            initialSettings={initialSettings}
            canManage={canManagePersonal}
            initialOrganisationNotifications={
                initialOrganisationNotifications
            }
            canViewOrganisationNotifications={
                canViewOrganisationNotifications
            }
            canManageOrganisationNotifications={
                canManageOrganisationNotifications
            }
        />
    );
}
