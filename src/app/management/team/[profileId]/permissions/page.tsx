import { notFound } from "next/navigation";
import PermissionsPage from "./permissions_page";
import { getUserById } from "@/services/team";

type PageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { profileId } = await params;
  const profile = await getUserById(profileId);

  if(!profile) {
    notFound();
  }

  return (
    <PermissionsPage
      profile={{
        profileId: profile.profile_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        roleId: profile.role_id,
        department: profile.department,
      }}
    />
  );
}