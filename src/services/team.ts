import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

import type { Database } from "@/app/lib/supabase/models";

export type Profile =
    Database["public"]["Tables"]["profiles"]["Row"];

export type TeamMember = Profile & {
    project_count: number;
    job_title: string | null;
    profile_picture: string | null;
};

export async function getTeamMembers(): Promise<TeamMember[]> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name", { ascending: true });

    if (profilesError) {
        console.error("getTeamMembers profiles error:", profilesError);
        return [];
    }

    if (!profiles || profiles.length === 0) {
        return [];
    }

    const profileIds = profiles.map(
        (profile) => profile.profile_id
    );

    const { data: memberships, error: membershipsError } =
        await supabase
            .from("project_members")
            .select("profile_id")
            .in("profile_id", profileIds);

    if (membershipsError) {
        console.error(
            "getTeamMembers project memberships error:",
            membershipsError
        );
    }

    const projectCounts = new Map<string, number>();

    for (const membership of memberships ?? []) {
        const profileId = membership.profile_id;

        if (!profileId) continue;

        projectCounts.set(
            profileId,
            (projectCounts.get(profileId) ?? 0) + 1
        );
    }

    return profiles.map((profile) => {
        const extendedProfile = profile as Profile & {
            job_title?: string | null;
            profile_picture?: string | null;
        };

        return {
            ...profile,

            project_count:
                projectCounts.get(profile.profile_id) ?? 0,

            job_title:
                extendedProfile.job_title ?? null,

            profile_picture:
                extendedProfile.profile_picture ?? null,
        };
    });
}

export async function getUserById(userId: string): Promise<Profile | null> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_id", userId)
        .single();

    if (error) {
        console.error("getUserById error:", error);
        return null;
    }

    return profile;
}