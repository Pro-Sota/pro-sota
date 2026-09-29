import { notFound } from "next/navigation";

import { getTeamMemberProjects } from "@/services/team_project";

import MemberProjectsPage from "./member_projects_page";

type PageProps = {
    params: Promise<{
        profileId: string;
    }>;
};

export default async function Page({
    params,
}: PageProps) {
    const { profileId } = await params;

    const data =
        await getTeamMemberProjects(profileId);

    if (!data) {
        notFound();
    }

    return (
        <MemberProjectsPage
            member={data.member}
            projects={data.projects}
        />
    );
}