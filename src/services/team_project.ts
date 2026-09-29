import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

import type { Database } from "@/app/lib/supabase/models";

type Profile =
    Database["public"]["Tables"]["profiles"]["Row"];

export type TeamProject = {
    project_id: string;
    project_code: string;
    name: string;
    status: string | null;
    municipality: string | null;
    country: string | null;
};

export async function getTeamMemberProjects(
    profileId: string
): Promise<{
    member: Profile;
    projects: TeamProject[];
} | null> {
    const cookieStore = await cookies();
    const supabase =
        await createClient(cookieStore);

    const {
        data: member,
        error: memberError,
    } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();

    if (memberError || !member) {
        console.error(
            "getTeamMemberProjects member:",
            memberError
        );

        return null;
    }

    const {
        data: memberships,
        error: membershipsError,
    } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("profile_id", profileId);

    if (membershipsError) {
        console.error(
            "getTeamMemberProjects memberships:",
            membershipsError
        );

        return {
            member,
            projects: [],
        };
    }

    const projectIds =
        memberships
            ?.map(
                (membership) =>
                    membership.project_id
            )
            .filter(Boolean) ?? [];

    if (projectIds.length === 0) {
        return {
            member,
            projects: [],
        };
    }

    const {
        data: projects,
        error: projectsError,
    } = await supabase
        .from("projects")
        .select(
            `
            project_id,
            project_code,
            name,
            status,
            municipality,
            country
            `
        )
        .in("project_id", projectIds)
        .order("name", {
            ascending: true,
        });

    if (projectsError) {
        console.error(
            "getTeamMemberProjects projects:",
            projectsError
        );

        return {
            member,
            projects: [],
        };
    }

    return {
        member,
        projects: projects ?? [],
    };
}