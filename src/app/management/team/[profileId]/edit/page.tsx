import { notFound } from "next/navigation";

import { getTeamMemberProfile } from "@/services/team_profile";

import EditMemberPage from "./edit_member_page";

type PageProps = {
    params: Promise<{
        profileId: string;
    }>;
};

export default async function Page({
    params,
}: PageProps) {
    const { profileId } = await params;

    const member =
        await getTeamMemberProfile(profileId);

    if (!member) {
        notFound();
    }

    return (
        <EditMemberPage
            member={member}
        />
    );
}