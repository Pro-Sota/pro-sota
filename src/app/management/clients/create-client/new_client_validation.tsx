import { EMAIL_REGEX } from "./client_form";
import type { ClientInsert } from "./client";

export const validateClient = (
  client: ClientInsert,
  isOrg: boolean
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Individual
  if (!isOrg && !client.first_name?.trim()) {
    errors.first_name = "O primeiro nome é obrigatório.";
  }

  if (!isOrg && !client.last_name?.trim()) {
    errors.last_name = "O último nome é obrigatório.";
  }

  // Company / Government
  if (isOrg && !client.organization_name?.trim()) {
    errors.organization_name =
      "O nome da empresa ou organização é obrigatório.";
  }

  // Contact person is optional because the database column is nullable.
  // If you want it required, add this validation back.
  //
  // if (isOrg && !client.contact_person?.trim()) {
  //   errors.contact_person = "A pessoa de contacto é obrigatória.";
  // }

  // Email is optional in the database.
  // Only validate it when the user actually provides one.
  if (client.email?.trim()) {
    if (!EMAIL_REGEX.test(client.email.trim())) {
      errors.email = "Introduza um endereço de email válido.";
    }
  }

  return errors;
};

export const toNullable = (
  value?: string | null
): string | null => {
  return value?.trim() || null;
};

export const buildClientPayload = (
  client: ClientInsert,
  isOrg: boolean
): ClientInsert => {
  const firstName = toNullable(client.first_name);
  const lastName = toNullable(client.last_name);
  const organizationName = toNullable(client.organization_name);

  const name = isOrg
    ? organizationName
    : [firstName, lastName].filter(Boolean).join(" ") || null;

  return {
    ...client,

    // Automatically generated display name
    name,

    // Individual
    first_name: isOrg ? null : firstName,
    last_name: isOrg ? null : lastName,

    // Organization
    organization_name: isOrg ? organizationName : null,
    contact_person: isOrg
      ? toNullable(client.contact_person)
      : null,

    // Contact
    email: client.email?.trim().toLowerCase() || null,
    phone: toNullable(client.phone),
    preferred_contact_method:
      client.preferred_contact_method || null,

    // Location
    address_line_1: toNullable(client.address_line_1),
    neighborhood: toNullable(client.neighborhood),
    province: toNullable(client.province),
    city: toNullable(client.city),
    country: toNullable(client.country) || "Angola",

    // Identification
    nif: toNullable(client.nif),

    // Other
    notes: toNullable(client.notes),

    // New clients
    status: "Prospective",
  };
};