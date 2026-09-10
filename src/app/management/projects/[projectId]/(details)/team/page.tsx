import Team from "./inner_project_members";
import { getProjectMembers } from "@/services/project_team";
import { getAllUsers } from "@/services/auth_server";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const team = (await getAllUsers()) as any;
  const projectMembers =await getProjectMembers(projectId);

  return (
    <Team
      projectId={projectId}
      projectMembers={projectMembers as any}
      team={team as any}
    />
  );
}