import { createClient } from "@/app/lib/supabase/client";
import { Database } from "@/app/lib/supabase/models";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

export type ClientWithProjectCount = Client & {
  projectCount: number;
};

export async function getClients(): Promise<ClientWithProjectCount[]> {
  const supabase = createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("SUPABASE GET CLIENTS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message);
  }

  if (!clients) {
    return [];
  }

  const clientsWithProjects = await Promise.all(
    clients.map(async (client) => {
      const { count, error: projectError } = await supabase
        .from("projects")
        .select("project_id", {
          count: "exact",
          head: true,
        })
        .eq("client_id", client.client_id);

      if (projectError) {
        console.error(
          `SUPABASE CLIENT PROJECT COUNT ERROR [${client.client_id}]:`,
          {
            message: projectError.message,
            details: projectError.details,
            hint: projectError.hint,
            code: projectError.code,
          }
        );
      }

      return {
        ...client,
        projectCount: count ?? 0,
      };
    })
  );

  return clientsWithProjects;
}

export async function createClientRecord(
  client: ClientInsert
): Promise<Client> {
  const supabase = createClient();

  const payload: ClientInsert = {
    client_type: client.client_type,

    name: client.name ?? null,

    first_name: client.first_name ?? null,
    last_name: client.last_name ?? null,

    organization_name: client.organization_name ?? null,
    contact_person: client.contact_person ?? null,

    nif: client.nif ?? null,

    email: client.email ?? null,
    phone: client.phone ?? null,
    preferred_contact_method:
      client.preferred_contact_method ?? null,

    website: client.website ?? null,

    address_line_1: client.address_line_1 ?? null,
    neighborhood: client.neighborhood ?? null,
    province: client.province ?? null,
    city: client.city ?? null,
    country: client.country ?? "Angola",

    notes: client.notes ?? null,

    status: client.status ?? "Prospective",

    logo_url: client.logo_url ?? null,
  };

  console.log("CREATE CLIENT PAYLOAD:", payload);

  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("SUPABASE CREATE CLIENT ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    console.error("SUPABASE CREATE CLIENT PAYLOAD:", payload);

    throw new Error(
      `Não foi possível criar o cliente: ${error.message}`
    );
  }

  if (!data) {
    throw new Error("O cliente foi criado, mas nenhum registo foi retornado.");
  }

  return data;
}