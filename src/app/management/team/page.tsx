import { getTeamMembers } from "@/services/team";

import TeamPage from "./team";
import { requireUser } from "@/app/lib/supabase/auth";

export default async function Page() {
    const team = await getTeamMembers();
    const {userRole} = await requireUser();

    return <TeamPage team={team} isAdmin= {userRole?.toLowerCase() == "admin"} />;
}