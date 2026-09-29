"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function deactivateTeamMember(
    profileId: string
) {
    if (!profileId) {
        return {
            success: false,
            error: "Colaborador inválido.",
        };
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase
        .from("profiles")
        .update({
            status: "Inactive",
        })
        .eq("profile_id", profileId);

    if (error) {
        console.error(
            "deactivateTeamMember error:",
            error
        );

        return {
            success: false,
            error: "Não foi possível desactivar o colaborador.",
        };
    }

    revalidatePath("/management/team");

    return {
        success: true,
    };
}