"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Edit3,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteClientAction,
} from "@/actions/clients";

import type { ClientDetails } from "@/services/clients";

import {
  CLIENT_TYPE_LABELS,
  getClientDisplayName,
  getClientInitials,
  STATUS_LABELS,
  STATUS_STYLES,
} from "../constants";

interface Props {
  client: ClientDetails;
}

export default function ClientView({
  client,
}: Props) {
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [pending, startTransition] =
    useTransition();

  const displayName =
    getClientDisplayName(client);

  function removeClient() {
    startTransition(async () => {
      const result =
        await deleteClientAction(
          client.client_id
        );

      if (!result.success) {
        return;
      }

      router.push("/management/clients");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Voltar aos clientes
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/management/clients/${client.client_id}/edit`
              )
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit3 size={16} />
            Editar
          </button>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Remover
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {client.logo_url ? (
              <img
                src={client.logo_url}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#002950]/5 text-xl font-bold text-[#002950]">
                {getClientInitials(
                  displayName
                )}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    STATUS_STYLES[
                      client.status
                    ] ??
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {STATUS_LABELS[
                    client.status
                  ] ?? client.status}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                <span>
                  {CLIENT_TYPE_LABELS[
                    client.client_type
                  ] ?? client.client_type}
                </span>

                <span>
                  ID #{client.client_id.slice(0, 8)}
                </span>

                {client.nif && (
                  <span>NIF {client.nif}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-4 md:p-8">
          <SummaryCard
            icon={<BriefcaseBusiness size={18} />}
            label="Projectos"
            value={String(
              client.projects.length
            )}
          />

          <SummaryCard
            icon={<CalendarDays size={18} />}
            label="Criado em"
            value={formatDate(
              client.created_at
            )}
          />

          <SummaryCard
            icon={<CalendarDays size={18} />}
            label="Último contacto"
            value={
              client.last_contacted_at
                ? formatDate(
                    client.last_contacted_at
                  )
                : "Nunca"
            }
          />

          <SummaryCard
            icon={<Building2 size={18} />}
            label="Categoria"
            value={
              CLIENT_TYPE_LABELS[
                client.client_type
              ] ?? client.client_type
            }
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<BriefcaseBusiness size={18} />}
              title="Projectos"
            />

            {client.projects.length ? (
              <div className="mt-5 divide-y divide-gray-100">
                {client.projects.map(
                  (project) => (
                    <button
                      key={project.project_id}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/management/projects/${project.project_id}`
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {project.title ??
                            project.project_code ??
                            "Projecto sem nome"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {project.project_code ??
                            "Sem código"}
                          {project.municipality
                            ? ` · ${project.municipality}`
                            : ""}
                        </p>
                      </div>

                      <span className="text-xs text-gray-400">
                        {project.status ??
                          "—"}
                      </span>
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="py-10 text-center">
                <BriefcaseBusiness
                  size={28}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-medium text-gray-800">
                  Nenhum projecto
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Este cliente ainda não está
                  associado a projectos.
                </p>
              </div>
            )}
          </section>

          {client.notes && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <SectionHeader
                icon={<User size={18} />}
                title="Notas"
              />

              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                {client.notes}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<User size={18} />}
              title="Contactos"
            />

            <div className="mt-5 space-y-4">
              {client.email && (
                <ContactRow
                  icon={<Mail size={17} />}
                  label="Email"
                  value={client.email}
                  href={`mailto:${client.email}`}
                />
              )}

              {client.phone && (
                <ContactRow
                  icon={<Phone size={17} />}
                  label="Telefone"
                  value={client.phone}
                  href={`tel:${client.phone}`}
                />
              )}

              {client.website && (
                <ContactRow
                  icon={
                    <ExternalLink size={17} />
                  }
                  label="Website"
                  value={client.website}
                  href={client.website}
                />
              )}

              {client.contact_person && (
                <ContactRow
                  icon={<User size={17} />}
                  label="Pessoa de contacto"
                  value={client.contact_person}
                />
              )}

              <ContactRow
                icon={<Mail size={17} />}
                label="Contacto preferencial"
                value={
                  client.preferred_contact_method ??
                  "—"
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={<MapPin size={18} />}
              title="Morada"
            />

            <div className="mt-5 text-sm leading-6 text-gray-600">
              {client.address_line_1 && (
                <p>{client.address_line_1}</p>
              )}

              {client.neighborhood && (
                <p>{client.neighborhood}</p>
              )}

              {(client.city ||
                client.province) && (
                <p>
                  {[
                    client.city,
                    client.province,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              {client.country && (
                <p>{client.country}</p>
              )}

              {!client.address_line_1 &&
                !client.neighborhood &&
                !client.city &&
                !client.province &&
                !client.country && (
                  <p className="text-gray-400">
                    Sem morada registada.
                  </p>
                )}
            </div>
          </section>
        </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Remover cliente?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              O cliente será removido da listagem, mas
              os dados serão mantidos através do
              histórico de eliminação.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteOpen(false)
                }
                disabled={pending}
                className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={removeClient}
                disabled={pending}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pending
                  ? "A remover..."
                  : "Remover cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#002950]">
        {icon}
      </span>

      <h2 className="font-semibold text-gray-900">
        {title}
      </h2>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a
      href={href}
      target={
        href.startsWith("http")
          ? "_blank"
          : undefined
      }
      rel={
        href.startsWith("http")
          ? "noreferrer"
          : undefined
      }
      className="block rounded-lg hover:bg-gray-50"
    >
      {content}
    </a>
  );
}

function formatDate(
  value: string | null
) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(
    "pt-AO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}