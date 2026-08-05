import { getProfile } from "@/services/auth_server";
import { getUserProjects } from "@/services/projects";
import { redirect } from "next/navigation";
import ProfileClient from "./profile_page";


export default async function ProfilePage() {

  const profile = (await getProfile());

  if (!profile) {
    redirect("/login");
  }

  const projects = await getUserProjects(profile.profile_id) ;

  return (
    <ProfileClient
      profile={profile}
      projects={projects}
    />
  );
}