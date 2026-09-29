export const CLIENT_TYPES = [
  {
    value: "Individual",
    label: "Particular",
  },
  {
    value: "Company",
    label: "Empresa",
  },
  {
    value: "Government",
    label: "Governo",
  },
] as const;

export const CLIENT_STATUSES = [
  {
    value: "Active",
    label: "Ativo",
  },
  {
    value: "Prospective",
    label: "Potencial",
  },
  {
    value: "Inactive",
    label: "Inativo",
  },
] as const;

export const CONTACT_METHODS = [
  {
    value: "Email",
    label: "Email",
  },
  {
    value: "Phone",
    label: "Telefone",
  },
  {
    value: "WhatsApp",
    label: "WhatsApp",
  },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  Active: "Ativo",
  Inactive: "Inativo",
  Prospective: "Potencial",
};

export const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Prospective: "bg-amber-100 text-amber-700",
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  Individual: "Particular",
  Company: "Empresa",
  Government: "Governo",
};

export function getClientDisplayName(client: {
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  organization_name?: string | null;
}) {
  if (client.name?.trim()) {
    return client.name.trim();
  }

  const fullName = [
    client.first_name,
    client.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  if (client.organization_name?.trim()) {
    return client.organization_name.trim();
  }

  return "Cliente sem nome";
}

export function getClientInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "?";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}