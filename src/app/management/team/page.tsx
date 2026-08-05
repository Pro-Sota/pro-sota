import { getAllUsers, getProfile } from "@/services/auth_server";
import TeamPage from "./team";
import { Database } from "@/app/lib/supabase/models";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function Page() {

    const team = await getAllUsers() as Profile[];

  return <TeamPage team={team || null} />;
}