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
  UploadCloud,
  X,
  FileText,
  Loader2,
  Check,
  Search,
  AlertTriangle,
  Save,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

type TeamMember = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isCustom?: boolean; // true when typed manually instead of picked from Supabase
};

type FormState = {
  name: string;
  client: string;
  projectType: string;
  description: string;
  status: string;
  country: string;
  province: string;
  municipality: string;
  address: string;
  startDate: string;
  endDate: string;
  projectManager: string;
  teamMembers: TeamMember[];
  budget: string; // raw digits only, formatted on display
  contractValue: string; // raw digits only, formatted on display
  drawings: File[];
  documents: File[];
};

const REQUIRED_FOR_PROGRESS: (keyof FormState)[] = [
  "name",
  "client",
  "projectType",
  "province",
  "municipality",
  "address",
  "startDate",
  "endDate",
  "projectManager",
  "budget",
];

const DESCRIPTION_MAX = 500;

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormState>({
    name: "",
    client: "",
    projectType: "",
    description: "",
    status: "Planning",
    country: "Angola",
    province: "",
    municipality: "",
    address: "",
    startDate: "",
    endDate: "",
    projectManager: "",
    teamMembers: [],
    budget: "",
    contractValue: "",
    drawings: [],
    documents: [],
  });

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

  function handleCurrencyChange(
    field: "budget" | "contractValue",
    rawInput: string,
  ) {
    const digitsOnly = rawInput.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, [field]: digitsOnly }));
  }

  const progress = useMemo(() => {
    const filled = REQUIRED_FOR_PROGRESS.filter((key) => {
      const val = form[key];
      return typeof val === "string" && val.trim().length > 0;
    }).length;
    return Math.round((filled / REQUIRED_FOR_PROGRESS.length) * 100);
  }, [form]);

  const isComplete = progress === 100;

  // ---- Duration calculation ----
  const duration = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffMs = end.getTime() - start.getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return { invalid: true } as const;
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    let label = `${totalDays} dia${totalDays !== 1 ? "s" : ""}`;
    if (months > 0) {
      label = `${months} ${months === 1 ? "mês" : "meses"}${
        days > 0 ? ` e ${days} dia${days !== 1 ? "s" : ""}` : ""
      }`;
    }
    return { invalid: false, totalDays, label } as const;
  }, [form.startDate, form.endDate]);

  async function submitProject() {
    setSubmitting(true);
    try {
      // Replace with your real create-project request.
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const fakeId = `PRJ-${Math.floor(Math.random() * 90000 + 10000)}`;
      setCreatedProjectId(fakeId);
      setSubmitted(true);
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
    submitProject();
  }

  function handleCancelClick() {
    setShowCancelConfirm(true);
  }

  function confirmCancel() {
    router.push("/management/projects");
  }

  function resetForCreateAnother() {
    setForm({
      name: "",
      client: "",
      projectType: "",
      description: "",
      status: "Planning",
      country: "Angola",
      province: "",
      municipality: "",
      address: "",
      startDate: "",
      endDate: "",
      projectManager: "",
      teamMembers: [],
      budget: "",
      contractValue: "",
      drawings: [],
      documents: [],
    });
    setCreatedProjectId(null);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <SuccessScreen
        projectName={form.name}
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
              { label: "Gestão", href: "/management" },
              { label: "Projectos", href: "/management/projects" },
              { label: "Novo Projecto" },
            ]}
          />
        </div>

        {/* ================= Title block ================= */}
        <div className="mb-8 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-800 px-6 py-3 text-white">
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
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Nome do projecto
              </label>
              <input
                name="name"
                value={form.name}
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
                <Field label="Cliente" required>
                  <input
                    name="client"
                    value={form.client}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                    placeholder="Cliente ou nome da empresa"
                  />
                </Field>

                <Field label="Tipo de projecto">
                  <Select
                    name="projectType"
                    value={form.projectType}
                    onChange={handleChange}
                  >
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
                    trailing={
                      <span
                        className={`text-xs font-mono ${
                          form.description.length >= DESCRIPTION_MAX
                            ? "text-rose-500"
                            : "text-slate-400"
                        }`}
                      >
                        {form.description.length}/{DESCRIPTION_MAX}
                      </span>
                    }
                  >
                    <textarea
                      rows={4}
                      name="description"
                      value={form.description}
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
                <Field label="País">
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Província" required>
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Município" required>
                  <input
                    name="municipality"
                    value={form.municipality}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Rua" required>
                  <input
                    name="address"
                    value={form.address}
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
                <Field label="Data de inicio" required>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={`${inputStyle} font-mono`}
                  />
                </Field>
                <Field label="Data de término" required>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={`${inputStyle} font-mono`}
                  />
                </Field>
              </div>

              {duration && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
                    duration.invalid
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
                <Field label="Gestor do projecto" required>
                  <input
                    name="projectManager"
                    value={form.projectManager}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>

                <Field label="Membros da equipa">
                  <TeamMemberSelector
                    members={form.teamMembers}
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
                <Field label="Estimativa de orçamento" required>
                  <CurrencyInput
                    value={form.budget}
                    onChange={(v) => handleCurrencyChange("budget", v)}
                  />
                </Field>
                <Field label="Valor de contracto">
                  <CurrencyInput
                    value={form.contractValue}
                    onChange={(v) => handleCurrencyChange("contractValue", v)}
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

      {showCancelConfirm && (
        <CancelConfirmDialog
          onKeepEditing={() => setShowCancelConfirm(false)}
          onDiscard={confirmCancel}
        />
      )}
    </div>
  );
}

/* ------------------------------- primitives ------------------------------ */

const inputStyle =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10";

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

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100 sm:w-56">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          value === 100 ? "bg-emerald-500" : "bg-[#1B3A5C]"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Field({
  label,
  required,
  trailing,
  children,
}: {
  label: string;
  required?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-[#E8871E]">*</span>}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${inputStyle} appearance-none pr-10`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function SectionCard({
  id,
  refCb,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  refCb: (el: HTMLDivElement | null) => void;
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      ref={refCb}
      className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-7"
    >
      <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B3A5C]/5 text-[#1B3A5C]">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------------------------- currency input ----------------------------- */

const currencyFormatter = new Intl.NumberFormat("pt-PT");

function CurrencyInput({
  value,
  onChange,
}: {
  value: string; // raw digits
  onChange: (rawDigits: string) => void;
}) {
  const display = value ? currencyFormatter.format(Number(value)) : "";
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
        Kz
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputStyle} pl-10 font-mono`}
        placeholder="0"
      />
    </div>
  );
}

/* ---------------------------- team selector ------------------------------ */

function TeamMemberSelector({
  members,
  onChange,
}: {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
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
          .from("users")
          .select("id,name,email,avatar_url")
          .ilike("name", `%${trimmed}%`)
          .limit(8);

        if (!error && data) {
          setResults(
            data.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              avatarUrl: u.avatar_url,
            })),
          );
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
    if (members.some((m) => m.id === member.id)) return;
    onChange([...members, member]);
    setQuery("");
    setResults([]);
  }

  function addCustomFromQuery() {
    const parts = query
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const newOnes = parts.map((name) => ({
      id: `custom-${name.toLowerCase()}-${Date.now()}-${Math.random()}`,
      name,
      isCustom: true,
    }));
    const merged = [...members];
    for (const m of newOnes) {
      if (!merged.some((existing) => existing.name.toLowerCase() === m.name.toLowerCase())) {
        merged.push(m);
      }
    }
    onChange(merged);
    setQuery("");
    setResults([]);
  }

  function removeMember(id: string) {
    onChange(members.filter((m) => m.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addCustomFromQuery();
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // slight delay so a click on a dropdown item registers first
            setTimeout(() => {
              if (query.trim()) addCustomFromQuery();
            }, 120);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Procurar utilizadores ou escrever nomes separados por vírgula..."
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
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={addCustomFromQuery}
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              Adicionar &ldquo;{query.trim()}&rdquo; manualmente
            </button>
          )}

          {!loading &&
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addMember(user)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B3A5C]/10 text-xs font-semibold text-[#1B3A5C]">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{user.name}</p>
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
              key={member.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                member.isCustom
                  ? "border-slate-200 bg-slate-50 text-slate-600"
                  : "border-[#1B3A5C]/15 bg-[#1B3A5C]/5 text-[#1B3A5C]"
              }`}
            >
              {member.name}
              <button
                type="button"
                onClick={() => removeMember(member.id)}
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

/* ------------------------------ summary panel ----------------------------- */

function SummaryPanel({
  form,
  progress,
  duration,
}: {
  form: FormState;
  progress: number;
  duration: { invalid: boolean; label?: string } | null;
}) {
  const budgetDisplay = form.budget
    ? `Kz ${currencyFormatter.format(Number(form.budget))}`
    : "—";
  const contractDisplay = form.contractValue
    ? `Kz ${currencyFormatter.format(Number(form.contractValue))}`
    : "—";
  const location = [form.municipality, form.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Resumo
        </h3>
        <span className="font-mono text-xs font-medium text-slate-500">
          {progress}%
        </span>
      </div>

      <ProgressBar value={progress} />

      <dl className="mt-5 space-y-3.5 text-sm">
        <SummaryRow label="Nome" value={form.name || "—"} />
        <SummaryRow label="Cliente" value={form.client || "—"} />
        <SummaryRow label="Tipo" value={form.projectType || "—"} />
        <SummaryRow label="Localização" value={location || "—"} />
        <SummaryRow
          label="Duração"
          value={
            duration && !duration.invalid ? (duration.label as string) : "—"
          }
        />
        <SummaryRow label="Gestor" value={form.projectManager || "—"} />
        <SummaryRow
          label="Equipa"
          value={
            form.teamMembers.length > 0
              ? `${form.teamMembers.length} membro${
                  form.teamMembers.length !== 1 ? "s" : ""
                }`
              : "—"
          }
        />
        <div className="border-t border-slate-100 pt-3.5">
          <SummaryRow label="Orçamento" value={budgetDisplay} emphasize />
          <SummaryRow label="Contracto" value={contractDisplay} />
        </div>
      </dl>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd
        className={`truncate text-right ${
          emphasize
            ? "font-mono font-semibold text-[#1B3A5C]"
            : "font-medium text-slate-700"
        }`}
      >
        {value}
      </dd>
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
            className="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
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

/* ------------------------------ file dropzone ------------------------------ */

function FileDropzone({
  label,
  files,
  onAdd,
  onRemove,
}: {
  label: string;
  files: File[];
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onAdd(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
          dragging
            ? "border-[#1B3A5C] bg-[#1B3A5C]/5"
            : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }`}
      >
        <UploadCloud className="mb-1.5 h-5 w-5 text-slate-400" />
        <p className="text-xs text-slate-500">
          <span className="font-medium text-[#1B3A5C]">Click to upload</span>{" "}
          or drag and drop
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onAdd(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-xs text-slate-600"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-slate-400 transition hover:text-rose-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}