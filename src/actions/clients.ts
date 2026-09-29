"use server";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import type {
  ClientStatus,
  ClientType,
  PreferredContactMethod,
} from "@/app/management/clients/types";

export type ClientFormState = {
  success: boolean;
  message: string;
  clientId?: string;
  fieldErrors?: Record<string, string>;
};

export type ClientFormData = {
  client_type: ClientType;

  first_name: string | null;
  last_name: string | null;

  organization_name: string | null;
  contact_person: string | null;

  email: string | null;
  phone: string | null;

  preferred_contact_method:
    | PreferredContactMethod
    | null;

  status: ClientStatus;

  nif: string | null;
  website: string | null;

  address_line_1: string | null;
  neighborhood: string | null;
  city: string | null;
  province: string | null;
  country: string | null;

  notes: string | null;
};

/**
 * Converts empty strings and null/undefined values
 * into a consistent database value.
 */
function clean(
  value: string | null | undefined
): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

/**
 * Converts the incoming Server Action payload into
 * a predictable form before validation.
 */
function normalizeClientData(
  data: ClientFormData
): ClientFormData {
  return {
    client_type: data.client_type,

    first_name: clean(data.first_name),
    last_name: clean(data.last_name),

    organization_name: clean(
      data.organization_name
    ),

    contact_person: clean(
      data.contact_person
    ),

    email: clean(data.email),
    phone: clean(data.phone),

    preferred_contact_method:
      data.preferred_contact_method ?? "Email",

    status: data.status,

    nif: clean(data.nif),
    website: clean(data.website),

    address_line_1: clean(
      data.address_line_1
    ),

    neighborhood: clean(
      data.neighborhood
    ),

    city: clean(data.city),
    province: clean(data.province),
    country: clean(data.country),

    notes: clean(data.notes),
  };
}

function validate(
  data: ClientFormData
) {
  const errors: Record<string, string> = {};

  if (!data.client_type) {
    errors.client_type =
      "Seleccione o tipo de cliente.";
  }

  if (
    data.client_type === "Individual" &&
    !data.first_name
  ) {
    errors.first_name =
      "Indique o primeiro nome.";
  }

  if (
    data.client_type === "Company" ||
    data.client_type === "Government"
  ) {
    if (!data.organization_name) {
      errors.organization_name =
        "Indique o nome da organização.";
    }
  }

  if (
    data.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      data.email
    )
  ) {
    errors.email =
      "Indique um email válido.";
  }

  if (
    !data.phone &&
    !data.email
  ) {
    errors.phone =
      "Indique pelo menos um contacto: telefone ou email.";
  }

  return errors;
}

async function getCurrentUserId() {
  const cookieStore = await cookies();

  const supabase =
    await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    userId: user?.id ?? null,
  };
}

export async function createClientAction(
  rawData: ClientFormData
): Promise<ClientFormState> {
  const data =
    normalizeClientData(rawData);

  const errors = validate(data);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message:
        "Verifique os campos assinalados.",
      fieldErrors: errors,
    };
  }

  const {
    supabase,
    userId,
  } = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      message:
        "Sessão expirada. Inicie sessão novamente.",
    };
  }

  const displayName =
    data.client_type === "Individual"
      ? [
          data.first_name,
          data.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
      : data.organization_name?.trim() ?? "";

  const { data: client, error } =
    await supabase
      .from("clients")
      .insert({
        client_type:
          data.client_type,

        name:
          displayName || null,

        first_name:
          data.first_name,

        last_name:
          data.last_name,

        organization_name:
          data.organization_name,

        contact_person:
          data.contact_person,

        email:
          data.email,

        phone:
          data.phone,

        preferred_contact_method:
          data.preferred_contact_method,

        status:
          data.status,

        nif:
          data.nif,

        website:
          data.website,

        address_line_1:
          data.address_line_1,

        neighborhood:
          data.neighborhood,

        city:
          data.city,

        province:
          data.province,

        country:
          data.country,

        notes:
          data.notes,

        created_by:
          userId,

        updated_by:
          userId,
      })
      .select("client_id")
      .single();

  if (error) {
    console.error(
      "createClientAction:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível criar o cliente.",
    };
  }

  revalidatePath(
    "/management/clients"
  );

  return {
    success: true,
    message:
      "Cliente criado com sucesso.",
    clientId:
      client.client_id,
  };
}

export async function updateClientAction(
  clientId: string,
  rawData: ClientFormData
): Promise<ClientFormState> {
  const data =
    normalizeClientData(rawData);

  const errors = validate(data);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message:
        "Verifique os campos assinalados.",
      fieldErrors: errors,
    };
  }

  const {
    supabase,
    userId,
  } = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      message:
        "Sessão expirada. Inicie sessão novamente.",
    };
  }

  const displayName =
    data.client_type === "Individual"
      ? [
          data.first_name,
          data.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
      : data.organization_name?.trim() ?? "";

  const { error } =
    await supabase
      .from("clients")
      .update({
        client_type:
          data.client_type,

        name:
          displayName || null,

        first_name:
          data.first_name,

        last_name:
          data.last_name,

        organization_name:
          data.organization_name,

        contact_person:
          data.contact_person,

        email:
          data.email,

        phone:
          data.phone,

        preferred_contact_method:
          data.preferred_contact_method,

        status:
          data.status,

        nif:
          data.nif,

        website:
          data.website,

        address_line_1:
          data.address_line_1,

        neighborhood:
          data.neighborhood,

        city:
          data.city,

        province:
          data.province,

        country:
          data.country,

        notes:
          data.notes,

        updated_by:
          userId,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "client_id",
        clientId
      )
      .is(
        "deleted_at",
        null
      );

  if (error) {
    console.error(
      "updateClientAction:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o cliente.",
    };
  }

  revalidatePath(
    "/management/clients"
  );

  revalidatePath(
    `/management/clients/${clientId}`
  );

  return {
    success: true,
    message:
      "Cliente atualizado com sucesso.",
    clientId,
  };
}

export async function deleteClientAction(
  clientId: string
): Promise<ClientFormState> {
  const {
    supabase,
    userId,
  } = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      message:
        "Sessão expirada. Inicie sessão novamente.",
    };
  }

  const now =
    new Date().toISOString();

  const { error } =
    await supabase
      .from("clients")
      .update({
        deleted_at: now,
        updated_by: userId,
        updated_at: now,
      })
      .eq(
        "client_id",
        clientId
      )
      .is(
        "deleted_at",
        null
      );

  if (error) {
    console.error(
      "deleteClientAction:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível remover o cliente.",
    };
  }

  revalidatePath(
    "/management/clients"
  );

  return {
    success: true,
    message:
      "Cliente removido com sucesso.",
  };
}