"use client";

import React, { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createProject } from "@/services/projects";
import { Breadcrumb, CancelConfirmDialog, SuccessScreen } from "./components/form_components"
import { SummaryPanel } from "./summary_panel";
import {
  ProjectInfoSection,
  LocationSection,
  TimelineSection,
  TeamSection,
  FinancialSection,
} from "./components/form_section";
import {
  INITIAL_PROJECT,
  BREADCRUMB_ITEMS,
  ProjectFormState,
} from "./types";
import {
  calculateProgress,
  calculateDuration,
  isFormComplete,
  prepareProjectPayload,
} from "./utils";

export default function NewProjectPage() {
  const router = useRouter();

  // Form state
  const [form, setForm] = useState<ProjectFormState>(INITIAL_PROJECT);
  const [submitted, setSubmitted] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Form errors
  const [formError, setFormError] = useState<string | null>(null);

  // Refs for section tracking
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Calculate progress and duration
  const progress = useMemo(
    () => calculateProgress(form),
    [form]
  );

  const duration = useMemo(
    () => calculateDuration(form.start_date!, form.end_date!),
    [form.start_date, form.end_date]
  );

  const isComplete = isFormComplete(progress, duration);

  // Handle form field changes
  function handleFormChange(changes: Partial<ProjectFormState>) {
    setForm((prev) => ({ ...prev, ...changes }));
    setFormError(null); // Clear error when user makes changes
  }

  // Submit project
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isComplete || submitting) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const payload = prepareProjectPayload(form);
      const [data, error] = await createProject(payload);

      if (error) {
        throw new Error(error.message || "Erro ao criar projeto");
      }

      setCreatedProjectId(data.project_id);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro desconhecido ao criar projeto";
      setFormError(message);
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Save draft
  async function handleSaveDraft() {
    setSavingDraft(true);
    try {
      // TODO: Implement draft saving
      await new Promise((resolve) => setTimeout(resolve, 900));
    } finally {
      setSavingDraft(false);
    }
  }

  // Cancel form
  function handleCancelClick() {
    setShowCancelConfirm(true);
  }

  function confirmCancel() {
    router.push("/management/projects");
  }

  function resetForCreateAnother() {
    setForm(INITIAL_PROJECT);
    setCreatedProjectId(null);
    setSubmitted(false);
    setFormError(null);
  }

  // Success screen
  if (submitted) {
    return (
      <SuccessScreen
        projectName={form.title}
        projectId={createdProjectId}
        onViewProject={() =>
          router.push(`/management/projects/${createdProjectId}`)
        }
        onCreateAnother={resetForCreateAnother}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        {/* ===== Back + Breadcrumb ===== */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <Breadcrumb
            items={BREADCRUMB_ITEMS}
            onNavigate={(href) => router.push(href)}
          />
        </div>

        {/* ===== Title Block ===== */}
        <div className="mb-8 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-neutral-900 px-6 py-3 text-white">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-yellow-500">
              <span>📋 Novo Projecto</span>
            </div>
            <div className="font-mono text-xs text-yellow-500">
              {new Date().toLocaleDateString("pt-AO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1.6fr_1fr]">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400" htmlFor="title">
                Nome do projecto
              </label>
              <input
                name="title"
                id="title"
                value={form.title}
                onChange={(e) => handleFormChange({ title: e.target.value })}
                required
                placeholder="e.g. Miradouro da Ilha Complexo Residencial"
                className="mt-1 w-full border-b-2 border-slate-200 bg-transparent pb-2 text-2xl font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#1B3A5C]"
              />
            </div>
          </div>
        </div>

        {/* ===== Form Content + Sticky Panel ===== */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left: Form sections */}
          <div className="space-y-6">
            <ProjectInfoSection
              form={form}
              onChange={handleFormChange}
              sectionRefs={sectionRefs}
            />

            <LocationSection
              form={form}
              onChange={handleFormChange}
              sectionRefs={sectionRefs}
            />

            <TimelineSection
              form={form}
              onChange={handleFormChange}
              sectionRefs={sectionRefs}
            />

            <TeamSection
              form={form}
              onChange={handleFormChange}
              sectionRefs={sectionRefs}
            />

            <FinancialSection
              form={form}
              onChange={handleFormChange}
              sectionRefs={sectionRefs}
            />

            {/* Error message */}
            {formError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <p className="font-medium">Erro ao criar projeto</p>
                <p className="mt-1">{formError}</p>
              </div>
            )}
          </div>

          {/* Right: Sticky Summary Panel */}
          <div className="hidden lg:block">
            <SummaryPanel form={form} progress={progress} duration={duration} />
          </div>
        </div>

        {/* ===== Action Buttons ===== */}
        <div className="sticky bottom-4 z-10 mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1 text-xs font-medium text-slate-500">
                Progresso
              </div>
              <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-[#1B3A5C] to-[#1B3A5C]/80 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-600">
              {progress}%
            </span>
          </div>

          <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={submitting || savingDraft}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting || savingDraft}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingDraft ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savingDraft ? "A guardar..." : "Rascunho"}
            </button>

            <button
              type="submit"
              disabled={!isComplete || submitting}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${
                isComplete && !submitting
                  ? "cursor-pointer bg-slate-700 hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "A criar..." : "Criar Projecto"}
            </button>
          </div>
        </div>
      </form>

      {/* Dialogs */}
      {showCancelConfirm && (
        <CancelConfirmDialog
          onKeepEditing={() => setShowCancelConfirm(false)}
          onDiscard={confirmCancel}
        />
      )}
    </div>
  );
}