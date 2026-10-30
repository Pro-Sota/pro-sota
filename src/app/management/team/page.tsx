import { getTeamMembers } from "@/services/team";

import TeamPage from "./team";
import { requireUser } from "@/app/lib/supabase/auth";
import { getCurrentUserPermissions } from "@/app/lib/permissions";

export default async function Page() {
    const team = await getTeamMembers();
    const auth = await getCurrentUserPermissions();

    const isAdmin = auth.role === "Admin";

    const canManagePermissions =
        isAdmin || auth.permissions.has("team.permissions.manage");

    return (
        <TeamPage
            team={team}
            isAdmin={isAdmin}
            canManagePermissions={canManagePermissions}
        />
    );
}