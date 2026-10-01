"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
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

import { deleteClientAction } from "@/actions/clients";
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

export default function ClientView({ client }: Props) {
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const displayName = getClientDisplayName(client);

  function removeClient() {
    startTransition(async () => {
      const result = await deleteClientAction(client.client_id);

      if (!result.success) {
        return;
      }

      router.push("/management/clients");
      router.refresh();
    });
  }

  function goBack() {
    router.push("/management/clients");
  }

  function goToEdit() {
    router.push(
      `/management/clients/${client.client_id}/edit`,
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page actions */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="group inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg py-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#002950] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Voltar aos clientes
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToEdit}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
            >
              <Edit3 size={16} aria-hidden="true" />
              Editar
            </button>

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <Trash2 size={16} aria-hidden="true" />
              Remover
            </button>
          </div>
        </header>

        {/* Client hero */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="relative border-b border-gray-100 px-6 py-7 md:px-8 md:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <ClientAvatar
                name={displayName}
                logoUrl={client.logo_url}
                size="large"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                    {displayName}
                  </h1>

                  <StatusBadge status={client.status} />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
                  <span className="font-medium text-gray-600">
                    {CLIENT_TYPE_LABELS[client.client_type] ??
                      client.client_type}
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

                  <span>
                    ID #{client.client_id.slice(0, 8).toUpperCase()}
                  </span>

                  {client.nif && (
                    <>
                      <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />
                      <span>NIF {client.nif}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            <SummaryCard
              icon={<BriefcaseBusiness size={18} />}
              label="Projectos"
              value={String(client.projects.length)}
            />

            <SummaryCard
              icon={<CalendarDays size={18} />}
              label="Criado em"
              value={formatDate(client.created_at)}
            />

            <SummaryCard
              icon={<CalendarDays size={18} />}
              label="Último contacto"
              value={
                client.last_contacted_at
                  ? formatDate(client.last_contacted_at)
                  : "Nunca"
              }
            />

            <SummaryCard
              icon={<Building2 size={18} />}
              label="Categoria"
              value={
                CLIENT_TYPE_LABELS[client.client_type] ??
                client.client_type
              }
            />
          </div>
        </section>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {/* Projects */}
            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <SectionHeader
                icon={<BriefcaseBusiness size={18} />}
                title="Projectos"
                count={client.projects.length}
              />

              {client.projects.length > 0 ? (
                <div className="border-t border-gray-100">
                  {client.projects.map((project) => (
                    <button
                      key={project.project_id}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/management/projects/${project.project_id}`,
                        )
                      }
                      className="group flex w-full cursor-pointer items-center gap-4 border-b border-gray-100 px-6 py-4 text-left transition-colors last:border-b-0 hover:bg-[#FAFAF8] focus:outline-none focus-visible:bg-[#FAFAF8] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#002950]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950]/[0.05] text-[#002950]">
                        <BriefcaseBusiness
                          size={17}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#002950]">
                          {project.title ??
                            project.project_code ??
                            "Projecto sem nome"}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {project.project_code ?? "Sem código"}
                          {project.municipality
                            ? ` · ${project.municipality}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-xs font-medium text-gray-400 sm:block">
                          {project.status ?? "—"}
                        </span>

                        <ChevronRight
                          size={17}
                          className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#002950]"
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<BriefcaseBusiness size={26} />}
                  title="Nenhum projecto"
                  description="Este cliente ainda não está associado a projectos."
                />
              )}
            </section>

            {/* Notes */}
            {client.notes && (
              <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <SectionHeader
                  icon={<User size={18} />}
                  title="Notas"
                />

                <div className="mt-5 rounded-xl bg-[#FAFAF8] px-4 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {client.notes}
                  </p>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            {/* Contacts */}
            <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <SectionHeader
                icon={<User size={18} />}
                title="Contactos"
              />

              <div className="mt-5 space-y-1">
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
                    icon={<ExternalLink size={17} />}
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
                    client.preferred_contact_method ?? "—"
                  }
                />

                {!client.email &&
                  !client.phone &&
                  !client.website &&
                  !client.contact_person && (
                    <p className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-400">
                      Nenhum contacto adicional registado.
                    </p>
                  )}
              </div>
            </section>

            {/* Address */}
            <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <SectionHeader
                icon={<MapPin size={18} />}
                title="Morada"
              />

              <div className="mt-5 rounded-xl bg-[#FAFAF8] px-4 py-4 text-sm leading-6 text-gray-600">
                {client.address_line_1 && (
                  <p>{client.address_line_1}</p>
                )}

                {client.neighborhood && (
                  <p>{client.neighborhood}</p>
                )}

                {(client.city || client.province) && (
                  <p>
                    {[client.city, client.province]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                {client.country && <p>{client.country}</p>}

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
      </div>

      {/* Delete confirmation */}
      {deleteOpen && (
        <DeleteClientModal
          clientName={displayName}
          pending={pending}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={removeClient}
        />
      )}
    </>
  );
}

function ClientAvatar({
  name,
  logoUrl,
  size = "normal",
}: {
  name: string;
  logoUrl?: string | null;
  size?: "normal" | "large";
}) {
  const dimensions =
    size === "large"
      ? "h-20 w-20 rounded-2xl text-xl"
      : "h-10 w-10 rounded-xl text-xs";

  if (logoUrl) {
    return (
      <div
        className={`shrink-0 overflow-hidden border border-gray-100 bg-gray-50 ${dimensions}`}
      >
        <img
          src={logoUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-[#002950]/[0.06] font-bold text-[#002950] ring-1 ring-[#002950]/5 ${dimensions}`}
    >
      {getClientInitials(name)}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ClientDetails["status"];
}) {
  const style =
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
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
      />

      {STATUS_LABELS[status] ?? status}
    </span>
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
    <div className="flex items-center gap-3 px-6 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#002950]/[0.05] text-[#002950]">
          {icon}
        </span>

        <h2 className="font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      {typeof count === "number" && (
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
          {count}
        </span>
      )}
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
    <div className="flex items-start gap-3 px-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>

        <p className="mt-0.5 break-words text-sm font-medium text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="block rounded-xl transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-inset"
    >
      {content}
    </a>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-800">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}

function DeleteClientModal({
  clientName,
  pending,
  onCancel,
  onConfirm,
}: {
  clientName: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-client-title"
        aria-describedby="delete-client-description"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 size={19} aria-hidden="true" />
          </div>

          <h2
            id="delete-client-title"
            className="mt-4 text-lg font-semibold text-gray-900"
          >
            Remover cliente?
          </h2>

          <p
            id="delete-client-description"
            className="mt-2 text-sm leading-6 text-gray-500"
          >
            Tem a certeza de que pretende remover{" "}
            <span className="font-medium text-gray-700">
              {clientName}
            </span>
            ? O cliente será removido da listagem, mas os
            dados serão mantidos através do histórico de
            eliminação.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex min-w-[132px] cursor-pointer items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            {pending ? "A remover..." : "Remover cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}