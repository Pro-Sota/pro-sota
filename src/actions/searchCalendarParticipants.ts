export type CalendarParticipant = {
    profile_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    profile_picture: string | null;
};

export async function searchCalendarParticipants(
    query: string,
): Promise<CalendarParticipant[]> {
    const search = query.trim();

    if (search.length < 2) {
        return [];
    }

    try {
        const { createClient } = await import(
            "@/app/lib/supabase/server"
        );
        const { cookies } = await import("next/headers");

        const supabase = await createClient(await cookies());

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return [];
        }

        const { data, error } = await supabase
            .from("profiles")
            .select(
                "profile_id, first_name, last_name, email, profile_picture",
            )
            .or(
                `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
            )
            .limit(10);

        if (error) {
            console.error(
                "Erro ao pesquisar participantes:",
                error,
            );
            return [];
        }

        return (data ?? []) as CalendarParticipant[];
    } catch (error) {
        console.error(
            "Erro ao pesquisar participantes:",
            error,
        );
        return [];
    }
}