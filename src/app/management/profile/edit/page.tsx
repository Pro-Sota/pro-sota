export const dynamic = "force-dynamic";
import EditForm from "./edit_form";
import { getProfile } from "@/services/auth_server";


export default async function EditProfilePage() {
    const profile = await getProfile();
    return (<EditForm profile={profile || null} />)
}
