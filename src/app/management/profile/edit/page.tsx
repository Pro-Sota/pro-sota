import { Database } from "@/app/lib/supabase/models";
import EditForm from "./edit_form";
import { getProfile } from "@/services/auth_server";


type Profile = Database["public"]["Tables"]["profiles"]["Row"];



export default async function EditProfilePage() {
    const profile = await getProfile();
    return (<EditForm profile={profile || null} />)
}
