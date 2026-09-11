"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Save,
} from "lucide-react";

import { createProject } from "@/services/new_project";

import {
  Breadcrumb,
  CancelConfirmDialog,
  SuccessScreen,
} from "./components/form_components";

import {
  ProjectInfoSection,
  LocationSection,
  TimelineSection,
} from "./components/form_section";

import {
  INITIAL_PROJECT,
  BREADCRUMB_ITEMS,
  ProjectFormState,
} from "./types";

import {
  calculateProgress,
  calculateDuration,
  prepareProjectPayload,
} from "./utils";

const DRAFT_STORAGE_KEY = "pro-sota:new-project:draft";
const DRAFT_VERSION = 1;

type StoredProjectDraft = {
  version: number;
  form: ProjectFormState;
  savedAt: string;
};

type SectionKey =
  | "information"
  | "client"
  | "location"
  | "timeline";

export default function NewProjectPage() {
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // FORM
  // ---------------------------------------------------------------------------

  const [form, setForm] =
    useState<ProjectFormState>(INITIAL_PROJECT);

  // ---------------------------------------------------------------------------
  // PAGE STATE
  // ---------------------------------------------------------------------------

  const [submitted, setSubmitted] =
    useState(false);

  const [createdProjectId, setCreatedProjectId] =
    useState<string | null>(null);

  const [showCancelConfirm, setShowCancelConfirm] =
    useState(false);

  // ---------------------------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------------------------

  const [submitting, setSubmitting] =
    useState(false);

  const [savingDraft, setSavingDraft] =
    useState(false);

  // ---------------------------------------------------------------------------
  // DRAFT
  // ---------------------------------------------------------------------------

  const [draftLoaded, setDraftLoaded] =
    useState(false);

  const [hasDraft, setHasDraft] =
    useState(false);

  const [draftSavedAt, setDraftSavedAt] =
    useState<Date | null>(null);

  const [draftSaveError, setDraftSaveError] =
    useState<string | null>(null);

  const [isAutoSaving, setIsAutoSaving] =
    useState(false);

  const initialLoadRef =
    useRef(true);

  const autoSaveTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  // ---------------------------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------------------------

  const [formError, setFormError] =
    useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // SECTION REFS
  // ---------------------------------------------------------------------------

  const sectionRefs =
    useRef<Record<string, HTMLDivElement | null>>(
      {}
    );

  // ---------------------------------------------------------------------------
  // PROGRESS
  // ---------------------------------------------------------------------------

  const progress = useMemo(
    () => calculateProgress(form),
    [form]
  );

  // ---------------------------------------------------------------------------
  // DURATION
  // ---------------------------------------------------------------------------

  const duration = useMemo(() => {
    if (!form.start_date || !form.end_date) {
      return 0;
    }

    const durationInfo = calculateDuration(
      form.start_date,
      form.end_date
    );

    return durationInfo.invalid
      ? 0
      : durationInfo.totalDays ?? 0;
  }, [
    form.start_date,
    form.end_date,
  ]);

  // ---------------------------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------------------------

const isComplete = useMemo(() => {
  const title = String(form.title ?? "").trim();
  const projectCode = String(form.project_code ?? "").trim();
  const projectType = String(form.type ?? "").trim();
  const municipality = String(form.municipality ?? "").trim();
  const address = String(form.address_line_1 ?? "").trim();

  // Campos obrigatórios
  if (!title) return false;
  if (!projectCode) return false;
  if (!projectType) return false;
  if (!municipality) return false;
  if (!address) return false;
  if (!form.start_date) return false;
  if (!form.end_date) return false;

  // Validar datas
  const start = new Date(form.start_date);
  const end = new Date(form.end_date);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return false;
  }

  // A data final não pode ser anterior à inicial
  if (end < start) {
    return false;
  }

  return true;
}, [
  form.title,
  form.project_code,
  form.type,
  form.municipality,
  form.address_line_1,
  form.start_date,
  form.end_date,
]);


  // ---------------------------------------------------------------------------
  // LOAD DRAFT
  // ---------------------------------------------------------------------------

  useEffect(() => {
    try {
      const rawDraft =
        window.localStorage.getItem(
          DRAFT_STORAGE_KEY
        );

      if (!rawDraft) {
        setDraftLoaded(true);
        initialLoadRef.current = false;
        return;
      }

      const parsed =
        JSON.parse(
          rawDraft
        ) as StoredProjectDraft;

      if (
        !parsed ||
        parsed.version !== DRAFT_VERSION ||
        !parsed.form
      ) {
        window.localStorage.removeItem(
          DRAFT_STORAGE_KEY
        );

        setDraftLoaded(true);
        initialLoadRef.current = false;
        return;
      }

      setForm({
        ...INITIAL_PROJECT,
        ...parsed.form,
      });

      setHasDraft(true);

      if (parsed.savedAt) {
        const savedDate =
          new Date(parsed.savedAt);

        if (
          !Number.isNaN(
            savedDate.getTime()
          )
        ) {
          setDraftSavedAt(savedDate);
        }
      }
    } catch (error) {
      console.error(
        "[NewProject] Failed to load draft:",
        error
      );

      try {
        window.localStorage.removeItem(
          DRAFT_STORAGE_KEY
        );
      } catch {
        // Ignore.
      }
    } finally {
      setDraftLoaded(true);
      initialLoadRef.current = false;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // PERSIST DRAFT
  // ---------------------------------------------------------------------------

  const persistDraft = useCallback(
    (currentForm: ProjectFormState) => {
      const savedAt =
        new Date().toISOString();

      const draft: StoredProjectDraft = {
        version: DRAFT_VERSION,
        form: currentForm,
        savedAt,
      };

      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(draft)
      );

      setHasDraft(true);
      setDraftSavedAt(
        new Date(savedAt)
      );
      setDraftSaveError(null);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // MANUAL SAVE
  // ---------------------------------------------------------------------------

  const handleSaveDraft =
    useCallback(async () => {
      if (
        savingDraft ||
        submitting
      ) {
        return;
      }

      setSavingDraft(true);
      setDraftSaveError(null);
      setFormError(null);

      try {
        persistDraft(form);
      } catch (error) {
        console.error(
          "[NewProject] Save draft error:",
          error
        );

        setDraftSaveError(
          error instanceof Error
            ? error.message
            : "Não foi possível guardar o rascun2ho."
        );
      } finally {
        setSavingDraft(false);
      }
    }, [
      form,
      persistDraft,
      savingDraft,
      submitting,
    ]);

  // ---------------------------------------------------------------------------
  // AUTO SAVE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }

    if (initialLoadRef.current) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(
        autoSaveTimeoutRef.current
      );
    }

    const hasContent =
      Boolean(
        String(
          form.title ?? ""
        ).trim()
      ) ||
      Boolean(form.start_date) ||
      Boolean(form.end_date) ||
      Boolean(
        String(
          form.description ?? ""
        ).trim()
      );

    if (!hasContent) {
      return;
    }

    autoSaveTimeoutRef.current =
      setTimeout(() => {
        try {
          setIsAutoSaving(true);
          persistDraft(form);
        } catch (error) {
          console.error(
            "[NewProject] Auto-save error:",
            error
          );

          setDraftSaveError(
            "Não foi possível guardar automaticamente o rascunho."
          );
        } finally {
          setIsAutoSaving(false);
        }
      }, 1000);

    return () => {
      if (
        autoSaveTimeoutRef.current
      ) {
        clearTimeout(
          autoSaveTimeoutRef.current
        );
      }
    };
  }, [
    form,
    draftLoaded,
    persistDraft,
  ]);

  // ---------------------------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (
        autoSaveTimeoutRef.current
      ) {
        clearTimeout(
          autoSaveTimeoutRef.current
        );
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // FORM CHANGE
  // ---------------------------------------------------------------------------

  function handleFormChange(
    changes: Partial<ProjectFormState>
  ) {
    setForm((previous) => ({
      ...previous,
      ...changes,
    }));

    setFormError(null);
    setDraftSaveError(null);
  }

  // ---------------------------------------------------------------------------
  // SECTION NAVIGATION
  // ---------------------------------------------------------------------------

  const scrollToSection =
    useCallback(
      (section: SectionKey) => {
        const element =
          sectionRefs.current[
            section
          ];

        if (!element) {
          return;
        }

        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
      []
    );

  // ---------------------------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------------------------

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setFormError(null);

    if (!isComplete) {
      setFormError(
        "Preencha todos os campos obrigatórios antes de criar o projecto."
      );

      return;
    }

    setSubmitting(true);

    try {
      if (
        autoSaveTimeoutRef.current
      ) {
        clearTimeout(
          autoSaveTimeoutRef.current
        );

        autoSaveTimeoutRef.current =
          null;
      }

      const payload =
        prepareProjectPayload(form);

      console.log(
        "[NewProject] Creating project:",
        payload
      );

      const [data, error] =
        await createProject(
          payload
        );

      if (error) {
        throw new Error(
          error.message ||
            "Não foi possível criar o projecto."
        );
      }

      if (!data) {
        throw new Error(
          "O projecto não foi criado."
        );
      }

      if (!data.project_id) {
        throw new Error(
          "O projecto foi criado, mas o ID não foi retornado."
        );
      }

      try {
        window.localStorage.removeItem(
          DRAFT_STORAGE_KEY
        );
      } catch {
        // Ignore.
      }

      setHasDraft(false);
      setDraftSavedAt(null);

      setCreatedProjectId(
        data.project_id
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "[NewProject] Create project error:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o projecto."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // DISCARD DRAFT
  // ---------------------------------------------------------------------------

  function discardDraft() {
    try {
      window.localStorage.removeItem(
        DRAFT_STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "[NewProject] Failed to discard draft:",
        error
      );
    }

    setForm(INITIAL_PROJECT);
    setHasDraft(false);
    setDraftSavedAt(null);
    setDraftSaveError(null);
    setFormError(null);
  }

  // ---------------------------------------------------------------------------
  // CANCEL
  // ---------------------------------------------------------------------------

  function handleCancelClick() {
    if (
      submitting ||
      savingDraft
    ) {
      return;
    }

    setShowCancelConfirm(true);
  }

  function confirmCancel() {
    setShowCancelConfirm(false);

    router.push(
      "/management/projects"
    );
  }

  // ---------------------------------------------------------------------------
  // CREATE ANOTHER
  // ---------------------------------------------------------------------------

  function resetForCreateAnother() {
    try {
      window.localStorage.removeItem(
        DRAFT_STORAGE_KEY
      );
    } catch {
      // Ignore.
    }

    setForm(INITIAL_PROJECT);
    setCreatedProjectId(null);
    setSubmitted(false);
    setHasDraft(false);
    setDraftSavedAt(null);
    setFormError(null);
    setDraftSaveError(null);
  }

  // ---------------------------------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------------------------------

  if (
    submitted &&
    createdProjectId
  ) {
    return (
      <SuccessScreen
        projectName={form.title}
        projectId={createdProjectId}
        onViewProject={() =>
          router.push(
            `/management/projects/${createdProjectId}`
          )
        }
        onCreateAnother={
          resetForCreateAnother
        }
      />
    );
  }

  // ---------------------------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-4 py-8 lg:px-8"
      >
        {/* ----------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ----------------------------------------------------------------- */}

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={
                submitting ||
                savingDraft
              }
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <Breadcrumb
              items={BREADCRUMB_ITEMS}
              onNavigate={(href) =>
                router.push(href)
              }
            />
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Projectos
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Novo projecto
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Registe as informações principais
                do projecto, cliente, localização
                e planeamento.
              </p>
            </div>

            {/* DRAFT STATUS */}

            <div className="flex items-center gap-3 text-xs text-slate-400">
              {isAutoSaving && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  A guardar rascunho...
                </>
              )}

              {!isAutoSaving &&
                draftSavedAt && (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />

                    <span>
                      Guardado às{" "}
                      {draftSavedAt.toLocaleTimeString(
                        "pt-AO",
                        {
                          hour: "2-digit",
                          minute:
                            "2-digit",
                        }
                      )}
                    </span>
                  </>
                )}

              {!isAutoSaving &&
                !draftSavedAt &&
                hasDraft && (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Rascunho guardado
                  </>
                )}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* CONTENT                                                           */}
        {/* ----------------------------------------------------------------- */}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* ---------------------------------------------------------------- */}
          {/* MAIN FORM                                                        */}
          {/* ---------------------------------------------------------------- */}

          <div className="space-y-6">
            {/* -------------------------------------------------------------- */}
            {/* 01 — PROJECT INFORMATION                                      */}
            {/* -------------------------------------------------------------- */}

            <div
              ref={(element) => {
                sectionRefs.current.information =
                  element;
              }}
              className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    01
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Informações do projecto
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Identificação e informações
                      gerais do projecto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <ProjectInfoSection
                  form={form}
                  onChange={handleFormChange}
                  sectionRefs={sectionRefs}
                />
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* 02 — CLIENT                                                    */}
            {/* -------------------------------------------------------------- */}

            <div
              ref={(element) => {
                sectionRefs.current.client =
                  element;
              }}
              className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    02
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Cliente
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Associe o projecto a um cliente
                      existente ou registe um novo cliente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <label
                  htmlFor="client_id"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Cliente
                </label>

                <select
                  id="client_id"
                  name="client_id"
                  value={
                    (form as any)
                      .client_id ?? ""
                  }
                  onChange={(event) =>
                    handleFormChange({
                      client_id:
                        event.target.value ||
                        null,
                    } as Partial<ProjectFormState>)
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Seleccionar cliente
                  </option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/management/clients/create"
                    )
                  }
                  className="mt-3 text-sm font-medium text-slate-700 underline underline-offset-4 transition hover:text-slate-900"
                >
                  + Adicionar novo cliente
                </button>

                <p className="mt-2 text-xs text-slate-400">
                  Se o cliente ainda não estiver
                  registado, pode adicioná-lo e depois
                  associá-lo ao projecto.
                </p>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* 03 — LOCATION                                                  */}
            {/* -------------------------------------------------------------- */}

            <div
              ref={(element) => {
                sectionRefs.current.location =
                  element;
              }}
              className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    03
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Localização
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Defina a localização física do
                      projecto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <LocationSection
                  form={form}
                  onChange={handleFormChange}
                  sectionRefs={sectionRefs}
                />
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* 04 — TIMELINE                                                  */}
            {/* -------------------------------------------------------------- */}

            <div
              ref={(element) => {
                sectionRefs.current.timeline =
                  element;
              }}
              className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    04
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Planeamento
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Defina o período previsto para o
                      projecto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <TimelineSection
                  form={form}
                  onChange={handleFormChange}
                  sectionRefs={sectionRefs}
                />

                {duration > 0 && (
                  <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">
                      Duração prevista
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {duration}{" "}
                      {duration === 1
                        ? "dia"
                        : "dias"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* ERRORS                                                         */}
            {/* -------------------------------------------------------------- */}

            {formError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              >
                <p className="font-medium">
                  Não foi possível criar o projecto
                </p>

                <p className="mt-1">
                  {formError}
                </p>
              </div>
            )}

            {draftSaveError && (
              <div
                role="alert"
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
              >
                {draftSaveError}
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* RIGHT NAVIGATION                                                 */}
          {/* ---------------------------------------------------------------- */}

          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Novo projecto
                </p>

                <div className="mt-4 space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "information"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>
                      Informações
                    </span>

                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "client"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>
                      Cliente
                    </span>

                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "location"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>
                      Localização
                    </span>

                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "timeline"
                      )
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>
                      Planeamento
                    </span>

                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                </div>
              </div>

              {/* PROGRESS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Progresso
                  </span>

                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {progress}%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          progress
                        )
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Preencha as informações
                  obrigatórias para criar o
                  projecto.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* ACTION BAR                                                        */}
        {/* ----------------------------------------------------------------- */}

        <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-900/5 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-700">
                {isComplete
                  ? "O projecto está pronto para ser criado."
                  : "Preencha os campos obrigatórios."}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Pode guardar o progresso como
                rascunho a qualquer momento.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={
                  submitting ||
                  savingDraft
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              {hasDraft && (
                <button
                  type="button"
                  onClick={discardDraft}
                  disabled={
                    submitting ||
                    savingDraft
                  }
                  className="rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apagar rascunho
                </button>
              )}

              <button
                type="button"
                onClick={
                  handleSaveDraft
                }
                disabled={
                  submitting ||
                  savingDraft
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {savingDraft
                  ? "A guardar..."
                  : "Guardar rascunho"}
              </button>

              <button
                type="submit"
                disabled={
                  !isComplete ||
                  submitting ||
                  savingDraft
                }
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${
                  isComplete &&
                  !submitting &&
                  !savingDraft
                    ? "bg-slate-900 hover:bg-slate-800"
                    : "cursor-not-allowed bg-slate-300"
                }`}
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {submitting
                  ? "A criar..."
                  : "Criar projecto"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ------------------------------------------------------------------- */}
      {/* CANCEL DIALOG                                                       */}
      {/* ------------------------------------------------------------------- */}

      {showCancelConfirm && (
        <CancelConfirmDialog
          onKeepEditing={() =>
            setShowCancelConfirm(false)
          }
          onDiscard={confirmCancel}
        />
      )}
    </div>
  );
}
