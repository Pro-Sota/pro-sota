import { createClient } from "@/app/lib/supabase/client";
import { Database } from "@/app/lib/supabase/models";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

export type ClientWithProjectCount = Client & { projectCount: number };

export async function getClients(): Promise<ClientWithProjectCount[]> {
  const supabase = createClient();
  const [{ data: clients, error: clientsError }, { data: projects, error: projectsError }] =
    await Promise.all([
      supabase.from("clients").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("projects").select("client_id"),
    ]);

  if (clientsError) throw clientsError;
  if (projectsError) throw projectsError;

  const projectCounts = new Map<string, number>();
  for (const project of projects ?? []) {
    if (project.client_id) {
      projectCounts.set(project.client_id, (projectCounts.get(project.client_id) ?? 0) + 1);
    }
  }

  return (clients ?? []).map((client) => ({ ...client, projectCount: projectCounts.get(client.client_id) ?? 0 }));
}


export async function createClientRecord(
  client: ClientInsert,
): Promise<Client> {
  const supabase = createClient();

  console.log("CREATE CLIENT PAYLOAD:", client);

  const { data, error } = await supabase
    .from("clients")
    .insert(client)
    .select()
    .single();

  if (error) {
    console.error("SUPABASE CREATE CLIENT ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  if (!data) {
    throw new Error("O cliente foi criado, mas nenhum registo foi devolvido.");
  }

  return data;
}