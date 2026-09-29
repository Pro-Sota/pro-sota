"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createClientAction,
  updateClientAction,
  type ClientFormData,
} from "@/actions/clients";

import type { ClientDetails } from "@/services/clients";

import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  CONTACT_METHODS,
  getClientDisplayName,
} from "./constants";

interface Props {
  mode: "create" | "edit";
  client?: ClientDetails;
}

export default function ClientForm({
  mode,
  client,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  const [form, setForm] = useState<ClientFormData>(() => ({
    client_type:
      client?.client_type === "Individual" ||
      client?.client_type === "Company" ||
      client?.client_type === "Government"
        ? client.client_type
        : "Company",

    first_name: client?.first_name ?? "",
    last_name: client?.last_name ?? "",
    organization_name:
      client?.organization_name ?? "",
    contact_person:
      client?.contact_person ?? "",

    email: client?.email ?? "",
    phone: client?.phone ?? "",

    preferred_contact_method:
      client?.preferred_contact_method === "Email" ||
      client?.preferred_contact_method === "Phone" ||
      client?.preferred_contact_method ===
        "WhatsApp"
        ? client.preferred_contact_method
        : "Email",

    status:
      client?.status === "Active" ||
      client?.status === "Inactive" ||
      client?.status === "Prospective"
        ? client.status
        : "Active",

    nif: client?.nif ?? "",
    website: client?.website ?? "",

    address_line_1:
      client?.address_line_1 ?? "",
    neighborhood:
      client?.neighborhood ?? "",
    city: client?.city ?? "",
    province: client?.province ?? "",
    country: client?.country ?? "Angola",

    notes: client?.notes ?? "",
  }));

  function update<K extends keyof ClientFormData>(
    field: K,
    value: ClientFormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function submit() {
    setError("");
    setFieldErrors({});

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createClientAction(form)
          : await updateClientAction(
              client!.client_id,
              form
            );

      if (!result.success) {
        setError(result.message);
        setFieldErrors(
          result.fieldErrors ?? {}
        );
        return;
      }

      router.push(
        `/management/clients/${result.clientId}`
      );
      router.refresh();
    });
  }

  const isOrganization =
    form.client_type === "Company" ||
    form.client_type === "Government";

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create"
              ? "Novo Cliente"
              : "Editar Cliente"}
          </h1>

          <p className="mt-1 text-gray-500">
            {mode === "create"
              ? "Registe um novo cliente na carteira da Sota."
              : `Actualizar os dados de ${getClientDisplayName(
                  client!
                )}.`}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle
            title="Informação principal"
            description="Identificação e classificação do cliente."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Tipo de cliente" required>
              <select
                value={form.client_type}
                onChange={(event) =>
                  update(
                    "client_type",
                    event.target.value as ClientFormData["client_type"]
                  )
                }
                className={inputClass(
                  fieldErrors.client_type
                )}
              >
                {CLIENT_TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>

              <FieldError
                message={fieldErrors.client_type}
              />
            </Field>

            <Field label="Estado">
              <select
                value={form.status}
                onChange={(event) =>
                  update(
                    "status",
                    event.target.value as ClientFormData["status"]
                  )
                }
                className={inputClass()}
              >
                {CLIENT_STATUSES.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </Field>

            {isOrganization ? (
              <>
                <Field
                  label="Nome da organização"
                  required
                >
                  <input
                    value={form.organization_name ?? ""}
                    onChange={(event) =>
                      update(
                        "organization_name",
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Sota Arquitectura, Lda."
                    className={inputClass(
                      fieldErrors.organization_name
                    )}
                  />

                  <FieldError
                    message={
                      fieldErrors.organization_name
                    }
                  />
                </Field>

                <Field label="Pessoa de contacto">
                  <input
                    value={form.contact_person ?? ""}
                    onChange={(event) =>
                      update(
                        "contact_person",
                        event.target.value
                      )
                    }
                    placeholder="Nome do contacto principal"
                    className={inputClass()}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field
                  label="Primeiro nome"
                  required
                >
                  <input
                    value={form.first_name ?? ""}
                    onChange={(event) =>
                      update(
                        "first_name",
                        event.target.value
                      )
                    }
                    placeholder="Primeiro nome"
                    className={inputClass(
                      fieldErrors.first_name
                    )}
                  />

                  <FieldError
                    message={fieldErrors.first_name}
                  />
                </Field>

                <Field label="Apelido">
                  <input
                    value={form.last_name ?? ""}
                    onChange={(event) =>
                      update(
                        "last_name",
                        event.target.value
                      )
                    }
                    placeholder="Apelido"
                    className={inputClass()}
                  />
                </Field>
              </>
            )}

            <Field label="NIF">
              <input
                value={form.nif ?? ""}
                onChange={(event) =>
                  update("nif", event.target.value)
                }
                placeholder="Número de Identificação Fiscal"
                className={inputClass()}
              />
            </Field>

            <Field label="Website">
              <input
                value={form.website ?? ""}
                onChange={(event) =>
                  update(
                    "website",
                    event.target.value
                  )
                }
                placeholder="https://..."
                className={inputClass()}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle
            title="Contactos"
            description="Como contactar este cliente."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field
              label="Email"
              error={fieldErrors.email}
            >
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value
                  )
                }
                placeholder="cliente@email.com"
                className={inputClass(
                  fieldErrors.email
                )}
              />

              <FieldError
                message={fieldErrors.email}
              />
            </Field>

            <Field
              label="Telefone"
              error={fieldErrors.phone}
            >
              <input
                value={form.phone ?? ""}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="+244 923 000 000"
                className={inputClass(
                  fieldErrors.phone
                )}
              />

              <FieldError
                message={fieldErrors.phone}
              />
            </Field>

            <Field label="Contacto preferencial">
              <select
                value={
                  form.preferred_contact_method ?? ""
                }
                onChange={(event) =>
                  update(
                    "preferred_contact_method",
                    event.target
                      .value as ClientFormData["preferred_contact_method"]
                  )
                }
                className={inputClass()}
              >
                {CONTACT_METHODS.map((method) => (
                  <option
                    key={method.value}
                    value={method.value}
                  >
                    {method.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle
            title="Morada"
            description="Localização e endereço do cliente."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field
              label="Morada"
              className="md:col-span-2"
            >
              <input
                value={form.address_line_1 ?? ""}
                onChange={(event) =>
                  update(
                    "address_line_1",
                    event.target.value
                  )
                }
                placeholder="Rua, número, edifício..."
                className={inputClass()}
              />
            </Field>

            <Field label="Bairro">
              <input
                value={form.neighborhood ?? ""}
                onChange={(event) =>
                  update(
                    "neighborhood",
                    event.target.value
                  )
                }
                placeholder="Bairro"
                className={inputClass()}
              />
            </Field>

            <Field label="Cidade / Município">
              <input
                value={form.city ?? ""}
                onChange={(event) =>
                  update(
                    "city",
                    event.target.value
                  )
                }
                placeholder="Luanda"
                className={inputClass()}
              />
            </Field>

            <Field label="Província">
              <input
                value={form.province ?? ""}
                onChange={(event) =>
                  update(
                    "province",
                    event.target.value
                  )
                }
                placeholder="Luanda"
                className={inputClass()}
              />
            </Field>

            <Field label="País">
              <input
                value={form.country ?? ""}
                onChange={(event) =>
                  update(
                    "country",
                    event.target.value
                  )
                }
                className={inputClass()}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SectionTitle
            title="Notas"
            description="Informação adicional sobre o cliente."
          />

          <textarea
            value={form.notes ?? ""}
            onChange={(event) =>
              update("notes", event.target.value)
            }
            rows={5}
            placeholder="Notas internas..."
            className="mt-6 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
          />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={pending}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-5 py-2.5 text-sm font-medium text-[#002950] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />

            {pending
              ? "A guardar..."
              : mode === "create"
                ? "Criar Cliente"
                : "Guardar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  error,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
    error
      ? "border-red-300 focus:border-red-500"
      : "border-gray-200 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
  }`;
}