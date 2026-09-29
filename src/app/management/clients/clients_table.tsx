"use client";

"use client";

import {
  Ellipsis,
  Eye,
  FolderKanban,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function ClientsTable({
  clients,
}: Props) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Cliente
              </th>

              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Categoria
              </th>

              <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Projectos
              </th>

              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Contacto
              </th>

              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Localização
              </th>

              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Estado
              </th>

              <th className="w-16 px-4 py-3.5" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => {
              const displayName =
                getClientDisplayName(client);

              return (
                <tr
                  key={client.client_id}
                  className="group bg-white transition-colors hover:bg-[#FAFAF8]"
                >
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/management/clients/${client.client_id}`
                        )
                      }
                      className="flex cursor-pointer items-center gap-3.5 text-left"
                    >
                      {client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950]/5 text-xs font-bold text-[#002950]">
                          {getClientInitials(displayName)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="max-w-[230px] truncate font-semibold text-gray-900 group-hover:text-[#002950]">
                          {displayName}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          #{client.client_id.slice(0, 8)}
                        </p>
                      </div>
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {CLIENT_TYPE_LABELS[
                        client.client_type
                      ] ?? client.client_type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-800 shadow-sm">
                      {client.projectCount}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="max-w-[220px]">
                      <p className="truncate text-sm font-medium text-gray-700">
                        {client.phone ??
                          client.email ??
                          "Sem contacto"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {client.phone && client.email
                          ? client.email
                          : client.contact_person ??
                            "—"}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="max-w-[160px]">
                      <p className="truncate text-sm text-gray-700">
                        {client.city ?? "—"}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        {client.province ??
                          client.country ??
                          ""}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        STATUS_STYLES[
                          client.status
                        ] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          client.status === "Active"
                            ? "bg-green-600"
                            : client.status ===
                              "Prospective"
                            ? "bg-amber-500"
                            : "bg-gray-400"
                        }`}
                      />

                      {STATUS_LABELS[
                        client.status
                      ] ?? client.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="relative flex justify-end">
                      <ClientActions
                        clientId={client.client_id}
                        onView={() =>
                          router.push(
                            `/management/clients/${client.client_id}`
                          )
                        }
                        onEdit={() =>
                          router.push(
                            `/management/clients/${client.client_id}/edit`
                          )
                        }
                        onProjects={() =>
                          router.push(
                            `/management/projects?client=${client.client_id}`
                          )
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientActions({
  clientId,
  onView,
  onEdit,
  onProjects,
}: {
  clientId: string;
  onView: () => void;
  onEdit: () => void;
  onProjects: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Acções do cliente"
        aria-expanded={open}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      >
        <Ellipsis size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye size={16} />
            Ver cliente
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil size={16} />
            Editar
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onProjects();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <FolderKanban size={16} />
            Ver projectos
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";