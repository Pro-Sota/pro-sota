"use client";

import {
  Ellipsis,
  Eye,
  FolderKanban,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ClientWithProjectCount } from "@/services/clients";

import {
  CLIENT_TYPE_LABELS,
  getClientDisplayName,
  getClientInitials,
  STATUS_LABELS,
  STATUS_STYLES,
} from "./constants";

interface Props {
  clients: ClientWithProjectCount[];
}

export default function ClientsTable({ clients }: Props) {
  const router = useRouter();

  function goToClient(clientId: string) {
    router.push(`/management/clients/${clientId}`);
  }

  function goToEdit(clientId: string) {
    router.push(`/management/clients/${clientId}/edit`);
  }

  function goToProjects(clientId: string) {
    router.push(`/management/projects?client=${clientId}`);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-[#FAFAF8]">
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Categoria</TableHeader>
              <TableHeader align="center">Projectos</TableHeader>
              <TableHeader>Contacto</TableHeader>
              <TableHeader>Localização</TableHeader>
              <TableHeader>Estado</TableHeader>

              <th
                scope="col"
                className="w-14 px-4 py-3.5"
                aria-label="Acções"
              />
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => {
              const displayName =
                getClientDisplayName(client);

              return (
                <ClientRow
                  key={client.client_id}
                  client={client}
                  displayName={displayName}
                  onView={() =>
                    goToClient(client.client_id)
                  }
                  onEdit={() =>
                    goToEdit(client.client_id)
                  }
                  onProjects={() =>
                    goToProjects(client.client_id)
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientRow({
  client,
  displayName,
  onView,
  onEdit,
  onProjects,
}: {
  client: ClientWithProjectCount;
  displayName: string;
  onView: () => void;
  onEdit: () => void;
  onProjects: () => void;
}) {
  return (
    <tr className="group border-b border-gray-100 last:border-b-0 transition-colors duration-150 hover:bg-[#FAFAF8]">
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={onView}
          className="flex w-full cursor-pointer items-center gap-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
        >
          <ClientAvatar
            name={displayName}
            logoUrl={client.logo_url}
          />

          <div className="min-w-0">
            <p className="max-w-[250px] truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#002950]">
              {displayName}
            </p>

            <p className="mt-1 text-[11px] font-medium tracking-wide text-gray-400">
              #{client.client_id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </button>
      </td>

      <td className="px-6 py-4">
        <ClientTypeBadge
          type={client.client_type}
        />
      </td>

      <td className="px-6 py-4 text-center">
        <ProjectCount count={client.projectCount} />
      </td>

      <td className="px-6 py-4">
        <ContactInfo client={client} />
      </td>

      <td className="px-6 py-4">
        <LocationInfo client={client} />
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={client.status} />
      </td>

      <td className="px-4 py-4 text-right">
        <ClientActions
          onView={onView}
          onEdit={onEdit}
          onProjects={onProjects}
        />
      </td>
    </tr>
  );
}

function ClientAvatar({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  if (logoUrl) {
    return (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
        <img
          src={logoUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950]/[0.06] text-xs font-bold text-[#002950] ring-1 ring-[#002950]/5">
      {getClientInitials(name)}
    </div>
  );
}

function ClientTypeBadge({
  type,
}: {
  type: ClientWithProjectCount["client_type"];
}) {
  return (
    <span className="inline-flex items-center rounded-lg border border-gray-200/80 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
      {CLIENT_TYPE_LABELS[type] ?? type}
    </span>
  );
}

function ProjectCount({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="text-xs font-medium text-gray-400">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#002950]/[0.05] px-2 text-xs font-bold text-[#002950] ring-1 ring-[#002950]/5">
      {count}
    </span>
  );
}

function ContactInfo({
  client,
}: {
  client: ClientWithProjectCount;
}) {
  const primary =
    client.phone ??
    client.email ??
    "Sem contacto";

  const secondary =
    client.phone && client.email
      ? client.email
      : client.contact_person;

  return (
    <div className="max-w-[220px]">
      <p
        className={`truncate text-sm ${
          primary === "Sem contacto"
            ? "font-normal text-gray-400"
            : "font-medium text-gray-700"
        }`}
      >
        {primary}
      </p>

      {secondary && (
        <p className="mt-1 truncate text-xs text-gray-400">
          {secondary}
        </p>
      )}
    </div>
  );
}

function LocationInfo({
  client,
}: {
  client: ClientWithProjectCount;
}) {
  const city = client.city;
  const region = client.province ?? client.country;

  return (
    <div className="max-w-[170px]">
      <p
        className={`truncate text-sm ${
          city
            ? "text-gray-700"
            : "text-gray-400"
        }`}
      >
        {city ?? "Sem localização"}
      </p>

      {region && (
        <p className="mt-1 truncate text-xs text-gray-400">
          {region}
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ClientWithProjectCount["status"];
}) {
  const statusStyle =
    STATUS_STYLES[status] ??
    "bg-gray-100 text-gray-600";

  const dotClass =
    status === "Active"
      ? "bg-green-500"
      : status === "Prospective"
        ? "bg-amber-500"
        : "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
      />

      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function ClientActions({
  onView,
  onEdit,
  onProjects,
}: {
  onView: () => void;
  onEdit: () => void;
  onProjects: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Acções do cliente"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
      >
        <Ellipsis
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
          >
            <ActionItem
              icon={<Eye size={16} />}
              label="Ver cliente"
              onClick={() => {
                setOpen(false);
                onView();
              }}
            />

            <ActionItem
              icon={<Pencil size={16} />}
              label="Editar"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            />

            <div className="my-1 border-t border-gray-100" />

            <ActionItem
              icon={<FolderKanban size={16} />}
              label="Ver projectos"
              onClick={() => {
                setOpen(false);
                onProjects();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ActionItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:bg-gray-50 focus-visible:text-gray-900"
    >
      <span className="text-gray-400">
        {icon}
      </span>

      {label}
    </button>
  );
}

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <th
      scope="col"
      className={`px-6 py-3.5 text-${align} text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400`}
    >
      {children}
    </th>
  );
}