import { requireUser } from "@/app/lib/supabase/auth";
import EditForm from "./edit_form";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const { user, profile, isAdmin } = await requireUser();

  return (
    <EditForm
      profile={profile}
      isAdmin={isAdmin}
      isOwnProfile={user.id === profile.profile_id}
    />
  );
}