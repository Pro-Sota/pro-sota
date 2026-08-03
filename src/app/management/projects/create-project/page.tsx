"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  Check,
  Search,
  AlertTriangle,
  Save,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

import { Database } from "@/app/lib/supabase/models";
import { createProject } from "@/services/projects";
import { SummaryPanel } from "./SummaryPanel";
import { CurrencyInput } from "./CurrencyInput";
import { SectionCard } from "./SectionCard";
import { Field } from "./Field";
import { ProgressBar } from "./ProgressBar";

type ProjectInsert =
  Database["public"]["Tables"]["projects"]["Insert"];
type TeamMember = Database["public"]["Tables"]["profiles"]["Row"];

// The form needs a couple of client-only fields that aren't part of the
// `projects` table itself (project manager + ad-hoc team member picks).
// Keeping them typed separately makes it clear they need to be mapped
// onto real columns/relations before the payload is sent to the backend.

export type ProjectFormState = ProjectInsert;

type SelectableTeamMember = TeamMember & { isCustom?: boolean };

const initialProject: ProjectFormState = {
  budget: null,
  created_at: null,
  created_by: null,
  description: "",
  end_date: null,
  estimated_cost: null,
  location: null,
  project_code: "",
  start_date: null,
  status: null,
  title: "",
  type: null,
  updated_at: null,
  urgency: null,
  address_line_1: null,
  address_line_2: null,
  city: null,
  country: null,
  latitude: null,
  longitude: null,
  municipality: "",
  state_province: null,

};

const DESCRIPTION_MAX = 500;

// Only fields that actually have a corresponding input below. (The old
// list included `location` and `created_by`, neither of which has a field
// in this form, so progress could never reach 100%.)
const REQUIRED_FOR_PROGRESS = [
  "title",
  "type",
  "municipality",
  "address_line_1",
  "start_date",
  "end_date",
  "budget",
] as const;

const inputStyle =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10";

// Helper function to prepare project data for backend submission
function prepareProjectPayload(form: ProjectFormState): ProjectFormState & { 
} {
  return {
    // Required project information
    title: form.title.trim(),
    type: form.type || null,
    description: form.description?.trim(),
    
    // Location details
    country: form.country?.trim() || null,
    state_province: form.state_province?.trim() || null,
    municipality: form.municipality.trim(),
    address_line_1: form.address_line_1?.trim() || null,
    address_line_2: form.address_line_2?.trim() || null,
    city: form.city?.trim() || null,
    latitude: form.latitude,
    longitude: form.longitude,
    
    // Timeline
    start_date: form.start_date,
    end_date: form.end_date,
    
    // Financial
    budget: form.budget,
    estimated_cost: form.estimated_cost || form.budget, // Use budget as estimate if not set
    
    // Metadata
    project_code: form.project_code || "",
    status: form.status || "planning",
    urgency: form.urgency || null,
    location: form.location,
    created_at: form.created_at,
    created_by: form.created_by,
    updated_at: form.updated_at,
  };
}

export default function NewProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProjectFormState>(initialProject);

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(
    null,
  );

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    if (name === "description" && value.length > DESCRIPTION_MAX) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCurrencyChange(field: "budget", rawInput: string) {
    const digitsOnly = rawInput.replace(/\D/g, "");
    const numeric = digitsOnly === "" ? null : Number(digitsOnly);
    setForm((prev) => ({ ...prev, [field]: numeric }));
  }

  const progress = useMemo(() => {
    const filled = REQUIRED_FOR_PROGRESS.filter((key) => {
      const value = form[key];

      if (typeof value === "string")
        return value.trim() !== "";

      return value !== null && value !== undefined;
    });
    return Math.round((filled.length / REQUIRED_FOR_PROGRESS.length) * 100);
  }, [form]);

  // ---- Duration calculation ----
  const duration = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    const diffMs = end.getTime() - start.getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return { invalid: true } as const;
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    let label = `${totalDays} dia${totalDays !== 1 ? "s" : ""}`;
    if (months > 0) {
      label = `${months} ${months === 1 ? "mês" : "meses"}${days > 0 ? ` e ${days} dia${days !== 1 ? "s" : ""}` : ""
        }`;
    }
    return { invalid: false, totalDays, label } as const;
  }, [form.start_date, form.end_date]);

  // A form can be 100% "filled" but still invalid (e.g. end date before
  // start date), so completeness has to factor that in too.
  const isComplete = progress === 100 && !(duration && duration.invalid);
const cleanUuid = (value?: string) =>
  value && value.trim() !== "" ? value : null;
  async function submitProject() {
    setSubmitting(true);

    try {
      // Build the complete project payload with all fields
      const payload: ProjectInsert = {
        title: form.title.trim(),

        type: form.type,
        description: form.description?.trim() || null,

        client_id: cleanUuid(form.client_id || undefined),

        country: form.country?.trim() || null,
        state_province: form.state_province?.trim() || null,
        municipality: form.municipality.trim(),
        address_line_1: form.address_line_1?.trim() || null,
        address_line_2: form.address_line_2?.trim() || null,
        city: form.city?.trim() || null,

        latitude: form.latitude,
        longitude: form.longitude,

        start_date: form.start_date,
        end_date: form.end_date,

        budget: form.budget,
        estimated_cost: form.estimated_cost ?? form.budget,

        status: form.status || "planning",
        urgency: form.urgency ?? null,

        location: form.location ?? null,

        created_by: form.created_by ?? null,
        project_code: ""
      };

      const [data, error] = await createProject(payload);

      if (error) {
        console.error("Project creation error:", error);
        throw new Error(error.message ?? JSON.stringify(error));
      }

      setCreatedProjectId(data.project_id);
      setSubmitted(true);

    } catch (err) {
      console.error("Submit failed:", err);
      // TODO: Add error notification/toast to user
    } finally {
      setSubmitting(false);
    }
  }

  async function saveDraft() {
    setSavingDraft(true);
    try {
      // Replace with your real save-draft request.
      await new Promise((resolve) => setTimeout(resolve, 900));
    } finally {
      setSavingDraft(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;
    console.log("Project payload:", prepareProjectPayload(form));
    submitProject();
  }

  function handleCancelClick() {
    setShowCancelConfirm(true);
  }

  function confirmCancel() {
    router.push("/management/projects");
  }

  function resetForCreateAnother() {
    setForm(initialProject);
    setCreatedProjectId(null);
    setSubmitted(false);
  }

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
        {/* ================= Back + breadcrumb ================= */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/management" },
              { label: "Projectos", href: "/management/projects" },
              { label: "Novo Projecto" },
            ]}
          />
        </div>

        {/* ================= Title block ================= */}
        <div className="mb-8 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-neutral-900 px-6 py-3 text-white">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-yellow-500">
              <Building2 className="h-4 w-4" />
              Novo Projecto
            </div>
            <div className="font-mono text-xs text-yellow-500">
              {new Date().toLocaleDateString("en-GB", {
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
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Miradouro da Ilha Complexo Residencial "
                className="mt-1 w-full border-b-2 border-slate-200 bg-transparent pb-2 text-2xl font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#1B3A5C]"
              />
            </div>
          </div>
        </div>

        {/* ================= Body: form + summary ================= */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ---- Left: sections ---- */}
          <div className="space-y-6">
            <SectionCard
              id="info"
              refCb={(el) => (sectionRefs.current.info = el)}
              icon={Building2}
              title="Informação do projecto"
              description="O necessário — o que é este projecto e para quem é."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Cliente" for="client_id">
                  <input
                    name="client_id"
                    value={form.client_id || ""}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Cliente ou nome da empresa"
                  />
                </Field>

                <Field label="Tipo de projecto" for="type" required>
                  <Select name="type" value={form.type || ""} onChange={handleChange} className="appearance-none pr-10">
                    <option value="">Tipo..</option>
                    <option>Residencial</option>
                    <option>Comercial</option>
                    <option>Industrial</option>
                    <option>Interior Desigin</option>
                    <option>Planeamento Urbano</option>
                    <option>Renovação</option>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Descrição"
                    for="description"
                    trailing={
                      <span
                        className={`text-xs font-mono ${(form.description ?? "").length >= DESCRIPTION_MAX
                          ? "text-rose-500"
                          : "text-slate-400"
                          }`}
                      >
                        {(form.description ?? "").length}/{DESCRIPTION_MAX}
                      </span>
                    }
                  >
                    <textarea
                      rows={4}
                      name="description"
                      value={form.description ?? ""}
                      onChange={handleChange}
                      maxLength={DESCRIPTION_MAX}
                      placeholder="Escopo, objectivos, e qualquer contexto que vale apontar..."
                      className={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              id="location"
              refCb={(el) => (sectionRefs.current.location = el)}
              icon={MapPin}
              title="Localização"
              description="O lugar onde o trabalho será feito."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="País" for="country">
                  <input
                    name="country"
                    autoComplete="country-name"
                    value={form.country || ""}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Província" for="state_province" required>
                  <input
                    name="state_province"
                    value={form.state_province || ""}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Município" for="municipality" required>
                  <input
                    name="municipality"
                    value={form.municipality}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Rua" for="address_line_1"  required>
                  <input
                    name="address_line_1"
                    value={form.address_line_1 || ""}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              id="timeline"
              refCb={(el) => (sectionRefs.current.timeline = el)}
              icon={CalendarDays}
              title="Cronologia"
              description="Datas chaves para planejamento e relatório."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Data de inicio" for="start_date" required>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date || ""}
                    onChange={handleChange}
                    className={`${inputStyle} font-mono`}
                  />
                </Field>
                <Field label="Data de término" for="end_date" required>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date || ""}
                    onChange={handleChange}
                    className={`${inputStyle} font-mono`}
                  />
                </Field>
              </div>

              {duration && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${duration.invalid
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-[#1B3A5C]/10 bg-[#1B3A5C]/5 text-[#1B3A5C]"
                    }`}
                >
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  {duration.invalid ? (
                    <span>A data de término deve ser depois da data de início.</span>
                  ) : (
                    <span>
                      Duração do projecto:{" "}
                      <span className="font-semibold">{duration.label}</span>
                    </span>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard
              id="team"
              refCb={(el) => (sectionRefs.current.team = el)}
              icon={Users}
              title="Equipa para o projecto"
              description="Quem é o responsavel para a entrega deste projecto."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Gestor do projecto" required for="projectManagerId">
                  <input
                    name="projectManagerId"
                    value={""}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>

                <Field label="Membros da equipa" for="team_members">
                  <TeamMemberSelector
                    members={[]}
                    onChange={(teamMembers) =>
                      setForm((prev) => ({ ...prev, teamMembers }))
                    }
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              id="financial"
              refCb={(el) => (sectionRefs.current.financial = el)}
              icon={Wallet}
              title="Finanças"
              description="Orçamento e numéros do contracto."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Estimativa de orçamento" for="budget" required>
                  <CurrencyInput
                    value={form.budget?.toString() || "0"}
                    onChangeAction={(v) => handleCurrencyChange("budget", v)}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* ---- Right: summary ---- */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <SummaryPanel form={form} progress={progress} duration={duration} />
            </div>
          </div>
        </div>

        {/* ================= Actions ================= */}
        <div className="sticky bottom-4 z-10 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ProgressBar value={progress} />
            <span className="whitespace-nowrap font-mono text-sm font-medium text-slate-600">
              {progress}%
            </span>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={submitting || savingDraft}
              className="cursor-pointer rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={saveDraft}
              disabled={submitting || savingDraft}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingDraft ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savingDraft ? "A guardar..." : "Guardar Rascunho"}
            </button>

            <button
              type="submit"
              disabled={!isComplete || submitting}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${isComplete && !submitting
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

      {showCancelConfirm && (
        <CancelConfirmDialog
          onKeepEditing={() => setShowCancelConfirm(false)}
          onDiscard={confirmCancel}
        />
      )}
    </div>
  );
}

function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const router = useRouter();
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {item.href ? (
              <button
                type="button"
                onClick={() => router.push(item.href as string)}
                className="cursor-pointer text-slate-500 transition hover:text-[#1B3A5C] hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-medium text-slate-800">{item.label}</span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
          </span>
        );
      })}
    </nav>
  );
}

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <select {...props} className={`${inputStyle} appearance-none pr-10`}
        onMouseDown={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          setOpen(false);
          props.onChange?.(e);
        }}
      >
        {children}
      </select>
      <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform duration-300 ${open ? "rotate-[180deg]" : ""}`} />
    </div>
  );
}

/* ---------------------------- team selector ------------------------------ */

function TeamMemberSelector({
  members,
  onChange,
}: {
  members: SelectableTeamMember[];
  onChange: (members: SelectableTeamMember[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // debounce supabase search
  useEffect(() => {
    const trimmed = query.trim().replace(/,$/, "");
    if (!trimmed) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_id,first_name,last_name,email,avatar_url")
          .or(
            `first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`
          )
          .limit(8);

        if (!error && data) {
          setResults(data as unknown as TeamMember[]);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addMember(member: TeamMember) {
    if (members.some((m) => m.profile_id === member.profile_id)) return;
    onChange([...members, member]);
    setQuery("");
    setResults([]);
  }

  function removeMember(profile_id: string) {
    onChange(members.filter((m) => m.profile_id !== profile_id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          name="teamMemberSearch"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Procurar utilizadores..."
          className={`${inputStyle} pl-10`}
        />
      </div>

      {open && query.trim() && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              A procurar...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">
              Nenhum utilizador encontrado.
            </div>
          )}

          {!loading &&
            results.map((user) => (
              <button
                key={user.profile_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addMember(user)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B3A5C]/10 text-xs font-semibold text-[#1B3A5C]">
                  {(user.first_name || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.email && (
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}

      {members.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {members.map((member) => (
            <span
              key={member.profile_id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${member.isCustom
                ? "border-slate-200 bg-slate-50 text-slate-600"
                : "border-[#1B3A5C]/15 bg-[#1B3A5C]/5 text-[#1B3A5C]"
                }`}
            >
              {`${member.first_name} ${member.last_name}`}
              <button
                type="button"
                onClick={() => removeMember(member.profile_id)}
                className="cursor-pointer text-current opacity-60 transition hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------- cancel confirmation --------------------------- */

function CancelConfirmDialog({
  onKeepEditing,
  onDiscard,
}: {
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Descartar este projecto?
        </h3>
        <p className="mt-1.5 text-sm text-slate-500">
          As informações que preencheu não foram guardadas e serão perdidas.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onKeepEditing}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Continuar a editar
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="cursor-pointer rounded-lg bg-rose-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ success screen ----------------------------- */

function SuccessScreen({
  projectName,
  projectId,
  onViewProject,
  onCreateAnother,
}: {
  projectName: string;
  projectId: string | null;
  onViewProject: () => void;
  onCreateAnother: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          Projecto criado com sucesso
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">
            {projectName || "O seu projecto"}
          </span>{" "}
          {projectId && (
            <>
              foi criado com o código{" "}
              <span className="font-mono text-slate-700">{projectId}</span>
            </>
          )}
          .
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreateAnother}
            className="flex-1 cursor-pointer rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Criar outro projecto
          </button>
          <button
            type="button"
            onClick={onViewProject}
            className="flex-1 cursor-pointer rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Ver projecto
          </button>
        </div>
      </div>
    </div>
  );
}