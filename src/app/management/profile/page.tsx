import { getProfile } from "@/services/auth_server";
import { getProjects } from "@/services/projects_server";
import { redirect } from "next/navigation";
import ProfileClient from "./profile_page";


export default async function ProfilePage() {

  const profile = (await getProfile());

  if (!profile) {
    redirect("/login");
  }

  const projects = await getProjects();

  return (
    <ProfileClient
      profile={profile}
      projects={projects}
    />
  );
}