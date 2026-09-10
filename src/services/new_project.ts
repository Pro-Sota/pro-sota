import { createClient } from "@/app/lib/supabase/client";
import { Database } from "@/app/lib/supabase/models";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const supabase = createClient();

export async function createProject(
    project: ProjectInsert
): Promise<[ProjectRow | null, { message: string } | null]> {
    try {
        const { data, error } = await supabase
            .from("projects")
            .insert(project)
            .select()
            .single();

            console.log("Creating project with payload:", JSON.stringify(project, null, 2));

        if (error) {
            console.error("Create project error - FULL:", error);
            console.error("Create project error - message:", error.message);
            console.error("Create project error - details:", error.details);
            console.error("Create project error - hint:", error.hint);
            console.error("Create project error - code:", error.code);

            throw new Error(
                error.message ||
                error.details ||
                error.hint ||
                "Failed to create project",
            );
        }

        if (!data) {
            return [
                null,
                {
                    message: "O projecto não foi criado.",
                },
            ];
        }

        return [data, null];
    } catch (error) {
        console.error("Unexpected create project error:", error);

        return [
            null,
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Erro inesperado ao criar o projecto.",
            },
        ];
    }
}