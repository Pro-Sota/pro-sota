import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "@/app/lib/supabase/models";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export type ClientType = "Individual" | "Company" | "Government";

export type ClientStatus =
  | "Active"
  | "Inactive"
  | "Prospective";

export type PreferredContactMethod =
  | "Email"
  | "Phone"
  | "WhatsApp";

export type ClientWithProjectCount = ClientRow & {
  projectCount: number;
};

export type ClientProject = {
  project_id: string;
  project_code: string | null;
  title: string | null;
  status: string | null;
  municipality: string | null;
};

export type ClientDetails = ClientRow & {
  projects: ClientProject[];
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function getClients(): Promise<ClientWithProjectCount[]> {
  const supabase = await getSupabase();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getClients:", error);
    throw new Error("Não foi possível carregar os clientes.");
  }

  if (!clients?.length) {
    return [];
  }

  const clientIds = clients.map((client) => client.client_id);

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("project_id, client_id")
    .in("client_id", clientIds);

  if (projectsError) {
    console.error("getClients projects:", projectsError);

    return clients.map((client) => ({
      ...client,
      projectCount: 0,
    }));
  }

  const projectCounts = new Map<string, number>();

  for (const project of projects ?? []) {
    if (!project.client_id) continue;

    projectCounts.set(
      project.client_id,
      (projectCounts.get(project.client_id) ?? 0) + 1
    );
  }

  return clients.map((client) => ({
    ...client,
    projectCount: projectCounts.get(client.client_id) ?? 0,
  }));
}

export async function getClient(
  clientId: string
): Promise<ClientDetails | null> {
  const supabase = await getSupabase();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getClient:", error);
    throw new Error("Não foi possível carregar o cliente.");
  }

  if (!client) {
    return null;
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(
      `
        project_id,
        project_code,
        title,
        status,
        municipality
      `
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("getClient projects:", projectsError);
  }

  return {
    ...client,
    projects: projects ?? [],
  };
}

export async function clientExists(
  clientId: string
): Promise<boolean> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("clients")
    .select("client_id")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("clientExists:", error);
    return false;
  }

  return Boolean(data);
}


import type { ClientOption } from "@/app/management/clients/types";

export async function getClientOptions(): Promise<ClientOption[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("clients")
    .select(
      `
        client_id,
        client_type,
        first_name,
        last_name,
        organization_name
      `
    )
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("getClientOptions:", error);
    throw new Error(
      "Não foi possível carregar os clientes."
    );
  }

  return (data ?? []).map((client) => {
    const label =
      client.client_type === "Individual"
        ? [
            client.first_name,
            client.last_name,
          ]
            .filter(Boolean)
            .join(" ")
        : client.organization_name ?? "";

    return {
      client_id: client.client_id,
      label: label || "Cliente sem nome",
    };
  });
}

