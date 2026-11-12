"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { submitProjectBrief } from "@/actions/project_briefing";
import Nav from "../(client_pages)/components/nav";

import { MAX_TOTAL_SIZE, MAX_TOTAL_MB, STEPS } from "./constants";
import { clearDraft, hasContent, loadDraft, saveDraft } from "./draft";
import {
  InvestmentStep, LandStep, LifestyleStep, PersonalStep, PreferencesStep,
  ProgrammeStep, ReviewStep, ScopeStep,
} from "./components/steps";
import {
  btnPrimary, btnSecondary, eyebrowCls, focusOutline, pageCls,
} from "./styles";
import { ErrorFieldContext } from "./components/ui";
import { validateAll, validateStep, type Issue } from "./validation";
import { createInitialValues, type BriefValues, type Update } from "./values";

const LAST = STEPS.length - 1;

export default function ProjectBriefForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<BriefValues>(createInitialValues);
  const [landFiles, setLandFiles] = useState<File[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pending, startTransition] = useTransition();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submissionLock = useRef(false);
  const firstRender = useRef(true);
  const startedAt = useRef(0);

  const isLast = step === LAST;
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const hasUnsavedFiles = landFiles.length + referenceFiles.length > 0;

  /* ----------------------------- Typed update ---------------------------- */

  const update: Update = (name, value) => {
    setValues((current) => {
      const next = { ...current, [name]: value } as BriefValues;
      const list = Array.isArray(value) ? (value as string[]) : [];

      if (name === "domestic_workers" && value !== "yes") next.domestic_workers_count = "";
      if (name === "desired_spaces") {
        if (!list.includes("garage")) next.cars_count = "";
        if (!list.includes("other")) next.desired_spaces_other = "";
      }
      if (name === "floor_count" && value !== "other") next.floor_count_other = "";
      if (name === "architectural_style" && !list.includes("other")) {
        next.architectural_style_other = "";
      }
      return next;
    });
  };

  /* ------------------------------ Draft & guards ------------------------- */

  useEffect(() => {
    startedAt.current = Date.now();
    const draft = loadDraft();
    if (draft) {
      setValues(draft.values);
      setStep(draft.step);
      setRestored(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || success) return;
    const id = window.setTimeout(() => saveDraft(values, step), 400);
    return () => window.clearTimeout(id);
  }, [values, step, hydrated, success]);

  // Files are not persisted, so warn before losing them.
  useEffect(() => {
    if (!hasUnsavedFiles || success) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedFiles, success]);

  /* ------------------------------ Focus on step -------------------------- */

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [step]);

  /* ------------------------------ Errors --------------------------------- */

  function clearError() {
    setError("");
    setErrorField(null);
  }

  function fail(issue: Issue) {
    setError(issue.message);
    setErrorField(issue.field);
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(
        `#project-brief-form [name="${issue.field}"]:not([type="hidden"])`
      );
      (target ?? errorRef.current)?.focus();
    });
  }

  /* ------------------------------ Navigation ----------------------------- */

  function goNext() {
    clearError();
    const form = document.getElementById("project-brief-form") as HTMLFormElement | null;
    if (form && !form.reportValidity()) return;

    const issue = validateStep(step, values);
    if (issue) return fail(issue);

    setStep((s) => Math.min(s + 1, LAST));
  }

  function goBack(target: number) {
    clearError();
    setStep(Math.max(0, Math.min(target, step - 1)));
  }

  /* ------------------------------ Submission ----------------------------- */

  function submit(formData: FormData) {
    if (submissionLock.current) return;
    submissionLock.current = true;
    clearError();

    // Rebuild from state because earlier steps are unmounted.
    Object.entries(values).forEach(([key, value]) => {
      formData.delete(key);
      if (Array.isArray(value)) value.forEach((item) => formData.append(key, item));
      else formData.set(key, value);
    });

    formData.delete("land_attachments");
    formData.delete("reference_attachments");
    landFiles.forEach((f) => formData.append("land_attachments", f));
    referenceFiles.forEach((f) => formData.append("reference_attachments", f));
    formData.set("form_started_at", String(startedAt.current));

    startTransition(async () => {
      try {
        const result = await submitProjectBrief(formData);

        if (!result.success) {
          submissionLock.current = false;
          setError(result.error || "Não foi possível enviar o formulário. Tente novamente.");
          requestAnimationFrame(() => errorRef.current?.focus());
          return;
        }

        clearDraft();
        setReference((result as { reference?: string }).reference ?? null);
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        submissionLock.current = false;
        console.error("Erro ao submeter o brief:", err);
        setError("Ocorreu um erro de ligação. Verifique a internet e tente novamente.");
        requestAnimationFrame(() => errorRef.current?.focus());
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submissionLock.current) return;

    if (!isLast) return goNext();

    const issue = validateAll(values);
    if (issue) {
      setStep(issue.step);
      setError(issue.message);
      setErrorField(issue.field);
      return;
    }

    const total = [...landFiles, ...referenceFiles].reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_TOTAL_SIZE) {
      setError(`O tamanho total dos anexos excede ${MAX_TOTAL_MB} MB. Remova alguns ficheiros.`);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    submit(new FormData(event.currentTarget));
  }

  /* ------------------------------ Step switch ---------------------------- */

  function renderStep() {
    switch (step) {
      case 0: return <PersonalStep v={values} update={update} />;
      case 1: return <LandStep v={values} update={update} files={landFiles} setFiles={setLandFiles} />;
      case 2: return <LifestyleStep v={values} update={update} />;
      case 3: return <ProgrammeStep v={values} update={update} />;
      case 4: return <ScopeStep v={values} update={update} />;
      case 5: return <InvestmentStep v={values} update={update} />;
      case 6: return <PreferencesStep v={values} update={update} files={referenceFiles} setFiles={setReferenceFiles} />;
      case 7:
        return (
          <ReviewStep
            v={values}
            landFiles={landFiles}
            referenceFiles={referenceFiles}
            goTo={(s) => {
              clearError();
              setStep(s);
            }}
          />
        );
      default: return null;
    }
  }

  /* ------------------------------ Success -------------------------------- */

  if (success) {
    return (
      <main className={`${pageCls} flex min-h-[80vh] w-full items-center justify-center px-5 py-16`}>
        <section className="relative mx-auto flex w-full max-w-[660px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#e9e7e1] bg-white px-7 py-14 text-center shadow-[0_20px_70px_rgba(0,41,80,0.07)] sm:px-14 sm:py-16">
          <div className="absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-transparent via-[#BD9655] to-transparent" />

          <Link href="/" aria-label="PRO SOTA - Página inicial" className="mb-12 flex w-full justify-center">
            {/* Replace width/height with the real pixel size of the logo file */}
            <Image
              src="/images/logo-vertical.png"
              alt="PRO SOTA"
              width={310}
              height={310}
              priority
              className="mx-auto h-auto w-[155px] object-contain"
            />
          </Link>

          <div className="mb-7 flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border border-[#d9e8dc] bg-[#f0f6f1]" aria-hidden="true">
            <span className="text-[32px] font-medium text-[#39764c]">✓</span>
          </div>

          <h1 className="mb-5 w-full max-w-[480px] text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.12] tracking-[-0.035em] text-[#002950]">
            Obrigado pela sua confiança.
          </h1>

          <p className="mb-6 w-full max-w-[450px] text-[15px] leading-[1.9] text-[#697178]">
            Recebemos as informações do seu projecto. A nossa equipa irá analisar cuidadosamente o seu brief e entrará em contacto consigo através do meio indicado.
          </p>

          {reference && (
            <p className="mb-6 text-sm text-[#46515a]">
              Referência do pedido:{" "}
              <strong className="tabular-nums text-[#002950]">{reference}</strong>
            </p>
          )}

          <div className="mb-8 h-px w-12 shrink-0 bg-[#BD9655]" />

          <Link
            href="/"
            style={{ color: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
            className="!text-white inline-flex min-h-[52px] items-center justify-center gap-3 rounded-md bg-[#002950] px-9 py-4 text-center text-[13px] font-semibold tracking-[0.08em] transition-all duration-300 hover:!bg-[#BD9655] hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-4"
          >
            VOLTAR AO INÍCIO
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    );
  }

  /* ------------------------------ Page ----------------------------------- */

  return (
    <main className={pageCls}>
      <div className="mx-auto max-w-[980px]">
        <Nav />

        <section className="max-w-[680px] pb-[25px] pt-[38px] sm:pb-8 sm:pt-[52px]">
          <p className={`${eyebrowCls} mb-[13px] text-[#8b6a2f]`}>ARQUITECTURA</p>
          <h1 className="mb-4 text-[clamp(32px,5vw,48px)] font-semibold leading-[1.1] tracking-[-0.8px] text-[#002950] sm:tracking-[-1.6px]">
            Conte-nos o que idealiza.
          </h1>
          <p className="max-w-[640px] text-base leading-[1.75] text-[#62696e]">
            Este brief ajuda-nos a compreender o seu terreno, a sua família e a forma como imagina viver. Reserve alguns minutos para responder às perguntas.
          </p>
        </section>

        <section className="rounded-lg border border-[#e9e7e1] bg-white px-[17px] py-[22px] shadow-[0_8px_32px_rgba(0,41,80,0.035)] sm:p-[clamp(22px,4vw,42px)]">
          {restored && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded border border-[#e6dcc6] bg-[#fbf8f2] px-3.5 py-3 text-xs text-[#6b5a35]">
              <span>
                Recuperámos o seu rascunho. Os ficheiros anexados não são guardados e terão de ser adicionados novamente.
              </span>
              <button
                type="button"
                className={`${focusOutline} cursor-pointer border-0 bg-transparent font-semibold underline`}
                onClick={() => {
                  clearDraft();
                  setValues(createInitialValues());
                  setStep(0);
                  setRestored(false);
                }}
              >
                Começar de novo
              </button>
            </div>
          )}

          <div className="flex items-start justify-between gap-5">
            <div>
              <span className={`${eyebrowCls} text-[#6b6f72]`}>
                ETAPA {step + 1} DE {STEPS.length}
              </span>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="mb-[7px] mt-[9px] text-[22px] font-semibold text-[#002950] outline-none sm:text-[25px]"
              >
                {STEPS[step].title}
              </h2>
              <p className="text-sm leading-normal text-[#656b70]">{STEPS[step].description}</p>
            </div>

            <span className="pt-[3px] text-sm font-bold text-[#002950]" aria-hidden="true">
              {progress}%
            </span>
          </div>

          <div
            className="my-[25px] h-1 overflow-hidden rounded-lg bg-[#ecebe7]"
            role="progressbar"
            aria-label="Progresso do formulário"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full bg-[#BD9655] transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <nav
            className="mb-7 grid grid-cols-4 gap-2 sm:mb-[34px] sm:grid-cols-8"
            aria-label="Etapas do formulário"
          >
            {STEPS.map((item, index) => {
              const active = index === step;
              const done = index < step;

              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => done && goBack(index)}
                  disabled={index > step || pending}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Etapa ${index + 1}: ${item.title}`}
                  className={`flex flex-col items-center gap-2 border-0 bg-transparent p-0 disabled:cursor-default ${done ? "cursor-pointer" : ""} ${
                    active ? "font-bold text-[#002950]" : "text-[#6f7376]"
                  } ${focusOutline}`}
                >
                  <span
                    className={`grid h-[27px] w-[27px] place-items-center rounded-full border text-xs sm:h-[30px] sm:w-[30px] ${
                      active || done
                        ? "border-[#002950] bg-[#002950] text-white"
                        : "border-[#d9d9d4] bg-white"
                    }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <small className="text-center text-[10px] leading-[1.3] sm:text-[11px]">
                    {item.title}
                  </small>
                </button>
              );
            })}
          </nav>

          <form id="project-brief-form" onSubmit={handleSubmit} noValidate={false}>
            <ErrorFieldContext.Provider value={errorField}>
              <div className="flex flex-col gap-[25px]">{renderStep()}</div>
            </ErrorFieldContext.Provider>

            {error && (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="mt-[18px] rounded border border-[#e7b8b2] bg-[#fff2f0] px-3.5 py-3 text-[13px] leading-relaxed text-[#8d2f25] outline-none"
              >
                {error}
              </div>
            )}

            <div className="mt-[34px] flex flex-col items-start justify-between gap-4 border-t border-[#ecebe7] pt-[22px] sm:flex-row sm:items-center">
              <span className="text-[11px] text-[#6f757a]">
                <span className="text-[#8b6a2f]">*</span> Campos obrigatórios
              </span>

              <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
                {step > 0 && (
                  <button className={btnSecondary} type="button" onClick={() => goBack(step - 1)} disabled={pending}>
                    Anterior
                  </button>
                )}

                {isLast ? (
                  <button className={btnPrimary} type="submit" disabled={pending}>
                    {pending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                        A enviar...
                      </>
                    ) : (
                      <>
                        Enviar brief
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button className={btnPrimary} type="button" onClick={goNext} disabled={pending}>
                    Continuar
                    <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        <footer className="flex flex-col justify-between gap-3 pt-[25px] text-[11px] text-[#6f757a] sm:flex-row">
          <span className="font-extrabold tracking-[1.5px] text-[#002950]">PRO SOTA</span>
          <span>Arquitectura · Engenharia · Construção</span>
        </footer>
      </div>
    </main>
  );
}