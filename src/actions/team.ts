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

type UpdateTeamMemberInput = {
    profileId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    jobTitle: string;
    status: string;
};

export async function updateTeamMember(
    input: UpdateTeamMemberInput
) {
    if (!input.profileId) {
        return {
            success: false,
            error: "Colaborador inválido.",
        };
    }

    if (!input.firstName.trim()) {
        return {
            success: false,
            error: "O nome é obrigatório.",
        };
    }

    if (!input.lastName.trim()) {
        return {
            success: false,
            error: "O apelido é obrigatório.",
        };
    }

    const cookieStore = await cookies();
    const supabase =
        await createClient(cookieStore);

    const { error } = await supabase
        .from("profiles")
        .update({
            first_name: input.firstName.trim(),
            last_name: input.lastName.trim(),
            email: input.email.trim() || null,
            phone_number:
                input.phone.trim() || null,
            department:
                input.department || null,
            job_title:
                input.jobTitle.trim() || null,
            status: input.status,
        })
        .eq(
            "profile_id",
            input.profileId
        );

    if (error) {
        console.error(
            "updateTeamMember:",
            error
        );

        return {
            success: false,
            error: "Não foi possível actualizar o colaborador.",
        };
    }

    revalidatePath("/management/team");
    revalidatePath(
        `/management/team/${input.profileId}`
    );

    return {
        success: true,
    };
}