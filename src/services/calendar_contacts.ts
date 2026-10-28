import "server-only";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export type CalendarParticipant = {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export type CalendarClientOption = {
  client_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  organization_name: string | null;
  client_type: string;
};

export type CalendarSupplierOption = {
  supplier_id: string;
  supplier_name: string;
};

export type CalendarContacts = {
  participants: CalendarParticipant[];
  clients: CalendarClientOption[];
  suppliers: CalendarSupplierOption[];
};

export async function getCalendarContacts(): Promise<CalendarContacts> {
  const supabase = await createClient(await cookies());

  const [profilesResult, clientsResult, suppliersResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("profile_id, first_name, last_name, email")
        .order("first_name", { ascending: true }),

      // The clients table has first_name / last_name, not "name".
      supabase
        .from("clients")
        .select(
          "client_id, client_type, first_name, last_name, email, organization_name",
        )
        .order("first_name", { ascending: true }),

      supabase
        .from("suppliers")
        .select("supplier_id, supplier_name")
        .order("supplier_name", { ascending: true }),
    ]);

  if (profilesResult.error) {
    throw new Error(
      `Erro ao carregar a equipa: ${profilesResult.error.message}`,
    );
  }

  if (clientsResult.error) {
    throw new Error(
      `Erro ao carregar os clientes: ${clientsResult.error.message}`,
    );
  }

  if (suppliersResult.error) {
    throw new Error(
      `Erro ao carregar os fornecedores: ${suppliersResult.error.message}`,
    );
  }

  return {
    participants: (profilesResult.data ?? []).map((profile) => ({
      profile_id: profile.profile_id,
      first_name: profile.first_name ?? null,
      last_name: profile.last_name ?? null,
      email: profile.email ?? null,
    })),

    clients: (clientsResult.data ?? []).map((client) => ({
      client_id: client.client_id,
      first_name: client.first_name ?? "",
      last_name: client.last_name ?? "",
      email: client.email ?? null,
      organization_name: client.organization_name ?? null,
      client_type: client.client_type,
    })),

    suppliers: (suppliersResult.data ?? []).map((supplier) => ({
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name,
    })),
  };
}