import { getTeamMembers } from "@/services/team";

import TeamPage from "./team";

export default async function Page() {
    const team = await getTeamMembers();

    return <TeamPage team={team} />;
}