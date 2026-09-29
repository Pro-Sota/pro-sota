import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

import type { Database } from "@/app/lib/supabase/models";

export type TeamMemberProfile =
    Database["public"]["Tables"]["profiles"]["Row"] & {
        project_count: number;
        projects: {
            project_id: string;
            project_code: string;
            title: string;
            status: string | null;
        }[];
    };

export async function getTeamMemberProfile(
    profileId: string
): Promise<TeamMemberProfile | null> {
    const cookieStore = await cookies();
    const supabase =
        await createClient(cookieStore);

    const {
        data: profile,
        error: profileError,
    } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();

    if (profileError) {
        console.error(
            "getTeamMemberProfile:",
            profileError
        );

        return null;
    }

    if (!profile) {
        return null;
    }

    const {
        data: memberships,
        error: membershipsError,
    } = await supabase
        .from("project_members")
        .select(
            `
            project_id,
            projects (
                project_id,
                project_code,
                title,
                status
            )
            `
        )
        .eq("profile_id", profileId);

    if (membershipsError) {
        console.error(
            "getTeamMemberProfile projects:",
            membershipsError
        );
    }

    const projects =
        memberships
            ?.map((membership) => {
                const project =
                    membership.projects;

                if (!project) return null;

                if (Array.isArray(project)) {
                    return project[0] ?? null;
                }

                return project;
            })
            .filter(
                (
                    project
                ): project is {
                    project_id: string;
                    project_code: string;
                    title: string;
                    status: string | null;
                } => Boolean(project)
            ) ?? [];

    return {
        ...profile,
        project_count: projects.length,
        projects,
    };
}