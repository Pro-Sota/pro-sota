"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import CancelConfirmDialog from "@/app/components/cancel_confirm_dialog";

import ClientTypeSection from "./client_type_section";
import IdentificationSection from "./identification_section";
import ContactSection from "./contact_section";
import LocationSection from "./location_section";
import NotesSection from "./notes_section";

import {
  INITIAL_STATE,
  PHONE_MAX_LENGTH,
} from "./client_form";

import {
  validateClient,
  buildClientPayload,
} from "./new_client_validation";

import type {
  ClientInsert,
  FieldChangeEvent,
} from "./client";

import { createClientAction } from "@/actions/clients";

export default function CreateClientForm() {
  const router = useRouter();

  const [client, setClient] =
    useState<ClientInsert>(INITIAL_STATE);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [showCancelConfirm, setShowCancelConfirm] =
    useState(false);

  const isOrg =
    client.client_type === "Company" ||
    client.client_type === "Government";

  const handleChange = (
    e: FieldChangeEvent
  ) => {
    const { name, value } = e.target;

    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };

        delete next[name];

        return next;
      });
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, PHONE_MAX_LENGTH);
  };

  const handlePhoneChange = (
    e: FieldChangeEvent
  ) => {
    e.target.value = formatPhone(
      e.target.value
    );

    handleChange(e);
  };

  const confirmCancel = () => {
    router.push("/management/clients");
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitError("");

    const validationErrors =
      validateClient(client, isOrg);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    const payload =
      buildClientPayload(client, isOrg);

    try {
      setSubmitting(true);

      const result =
        await createClientAction(
          payload as Parameters<typeof createClientAction>[0]
        );

      /*
       * Server Actions do not need to throw an error
       * for normal validation/database failures.
       *
       * They return ClientFormState instead.
       */
      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }

        setSubmitError(
          result.message ||
            "Não foi possível criar o cliente."
        );

        return;
      }

      /*
       * Only redirect after the Server Action
       * confirms that the client was created.
       */
      router.push("/management/clients");
      router.refresh();
    } catch (error: unknown) {
      console.error(
        "CREATE CLIENT ERROR:",
        error
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao guardar o cliente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    if (submitting) {
      return;
    }

    setShowCancelConfirm(true);
  };

  const handleReset = () => {
    if (submitting) {
      return;
    }

    setClient(INITIAL_STATE);
    setErrors({});
    setSubmitError("");
  };

  return (
    <div className="min-h-full px-5 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={submitting}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Novo registo
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Adicionar Cliente
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Preencha os campos obrigatórios
              marcados com{" "}
              <span className="font-semibold text-slate-900">
                *
              </span>
            </p>
          </div>
        </div>

        {/* Server / submission error */}
        {submitError && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
          >
            <AlertCircle
              size={18}
              className="shrink-0"
            />

            <span>{submitError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          <ClientTypeSection
            clientType={
              client.client_type ||
              "Individual"
            }
            onChange={handleChange}
          />

          <IdentificationSection
            client={client}
            isOrg={isOrg}
            errors={errors}
            onChange={handleChange}
          />

          <ContactSection
            client={client}
            errors={errors}
            onChange={handleChange}
            onPhoneChange={handlePhoneChange}
          />

          <LocationSection
            client={client}
            onChange={handleChange}
          />

          <NotesSection
            client={client}
            onChange={handleChange}
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={handleReset}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Repor
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "A guardar..."
                : "Guardar Cliente"}
            </button>
          </div>
        </form>

        {showCancelConfirm && (
          <CancelConfirmDialog
            onKeepEditing={() =>
              setShowCancelConfirm(false)
            }
            onDiscard={confirmCancel}
            title=""
          />
        )}
      </div>
    </div>
  );
}