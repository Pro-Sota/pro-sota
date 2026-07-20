"use client";

import { useMemo, useRef, useState } from "react";
import {
  Building2,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  Paperclip,
  Check,
  ChevronDown,
  UploadCloud,
  X,
  FileText,
} from "lucide-react";

/* -------------------------------------------------------------------------
   Design tokens (blueprint / drawing-set inspired)
   ink      – deep drafting blue, used for headings & the active state
   paper    – warm off-white page background
   line     – hairline borders, like ruled drawing sheets
   accent   – safety-orange, used sparingly for primary actions only
   mono     – IBM Plex Mono for anything numeric or date-like, echoing
              the dimension labels on a technical drawing
------------------------------------------------------------------------- */

const SECTIONS = [
  { id: "info", label: "Project Information", icon: Building2 },
  { id: "location", label: "Location", icon: MapPin },
  { id: "timeline", label: "Timeline", icon: CalendarDays },
  { id: "team", label: "Team", icon: Users },
  { id: "financial", label: "Financial", icon: Wallet },
  { id: "attachments", label: "Attachments", icon: Paperclip },
] as const;

const STATUS_STYLES: Record<string, string> = {
  Planning: "bg-slate-100 text-slate-700 ring-slate-300",
  "In Progress": "bg-blue-50 text-[#1B3A5C] ring-blue-200",
  "On Hold": "bg-amber-50 text-amber-700 ring-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
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
  teamMembers: string;
  budget: string;
  contractValue: string;
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

export default function NewProjectPage() {
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
    teamMembers: "",
    budget: "",
    contractValue: "",
    drawings: [],
    documents: [],
  });

  const [activeSection, setActiveSection] = useState<string>("info");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function addFiles(field: "drawings" | "documents", files: FileList | null) {
    if (!files) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ...Array.from(files)] }));
  }

  function removeFile(field: "drawings" | "documents", index: number) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(form);
    // TODO: Insert into Supabase
  }

  function scrollToSection(id: string) {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const progress = useMemo(() => {
    const filled = REQUIRED_FOR_PROGRESS.filter((key) => String(form[key]).trim().length > 0).length;
    return Math.round((filled / REQUIRED_FOR_PROGRESS.length) * 100);
  }, [form]);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        {/* ================= Title block ================= */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#1B3A5C] px-6 py-3 text-white">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-100">
              <Building2 className="h-4 w-4" />
              New Project
            </div>
            <div className="font-mono text-xs text-blue-100">
              {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1.6fr_1fr]">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Project Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Miradouro da Ilha Residential Complex"
                className="mt-1 w-full border-b-2 border-slate-200 bg-transparent pb-2 text-2xl font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#1B3A5C]"
              />
            </div>

            <div className="flex flex-col justify-between gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.keys(STATUS_STYLES).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                        form.status === s
                          ? STATUS_STYLES[s]
                          : "bg-white text-slate-400 ring-slate-200 hover:text-slate-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Progress
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#E8871E] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-500">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* ================= Stepper nav ================= */}
          <nav className="hidden lg:block">
            <div className="sticky top-8 space-y-1 rounded-2xl border border-slate-200 bg-white p-3">
              {SECTIONS.map((s, i) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-[#1B3A5C] text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                        active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ================= Sections ================= */}
          <div className="space-y-6">
            <SectionCard
              id="info"
              refCb={(el) => (sectionRefs.current.info = el)}
              icon={Building2}
              title="Project Information"
              description="The basics — what this project is and who it's for."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Client" required>
                  <input
                    name="client"
                    value={form.client}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                    placeholder="Client or company name"
                  />
                </Field>

                <Field label="Project Type">
                  <Select name="projectType" value={form.projectType} onChange={handleChange}>
                    <option value="">Select type</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                    <option>Interior Design</option>
                    <option>Landscape</option>
                    <option>Urban Planning</option>
                    <option>Renovation</option>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea
                      rows={4}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Scope, objectives, and any context worth noting..."
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
              title="Location"
              description="Where the work is happening."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Country">
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Province" required>
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Municipality" required>
                  <input
                    name="municipality"
                    value={form.municipality}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Address" required>
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
              title="Timeline"
              description="Key dates for planning and reporting."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Start Date" required>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={`${inputStyle} font-mono`}
                  />
                </Field>
                <Field label="End Date" required>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={`${inputStyle} font-mono`}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              id="team"
              refCb={(el) => (sectionRefs.current.team = el)}
              icon={Users}
              title="Team Assignment"
              description="Who's responsible for delivering this project."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Project Manager" required>
                  <input
                    name="projectManager"
                    value={form.projectManager}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
                <Field label="Team Members">
                  <input
                    name="teamMembers"
                    placeholder="John, Sarah, Mike..."
                    value={form.teamMembers}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              id="financial"
              refCb={(el) => (sectionRefs.current.financial = el)}
              icon={Wallet}
              title="Financial"
              description="Budget and contract figures, in Kwanza."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Estimated Budget" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
                      Kz
                    </span>
                    <input
                      type="number"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      className={`${inputStyle} pl-10 font-mono`}
                      placeholder="0.00"
                    />
                  </div>
                </Field>
                <Field label="Contract Value">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
                      Kz
                    </span>
                    <input
                      type="number"
                      name="contractValue"
                      value={form.contractValue}
                      onChange={handleChange}
                      className={`${inputStyle} pl-10 font-mono`}
                      placeholder="0.00"
                    />
                  </div>
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              id="attachments"
              refCb={(el) => (sectionRefs.current.attachments = el)}
              icon={Paperclip}
              title="Attachments"
              description="Drawings and supporting documents."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FileDropzone
                  label="Drawings"
                  files={form.drawings}
                  onAdd={(files) => addFiles("drawings", files)}
                  onRemove={(i) => removeFile("drawings", i)}
                />
                <FileDropzone
                  label="Documents"
                  files={form.documents}
                  onAdd={(files) => addFiles("documents", files)}
                  onRemove={(i) => removeFile("documents", i)}
                />
              </div>
            </SectionCard>

            {/* ================= Actions ================= */}
            <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 backdrop-blur">
              <span className="hidden text-sm text-slate-500 sm:block">
                <span className="font-mono font-medium text-slate-700">{progress}%</span> of required fields complete
              </span>
              <div className="ml-auto flex gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1B3A5C] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#16304C]"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------- primitives ------------------------------ */

const inputStyle =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-[#E8871E]">*</span>}
      </label>
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
      className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B3A5C]/5 text-[#1B3A5C]">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

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
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
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
          <span className="font-medium text-[#1B3A5C]">Click to upload</span> or drag and drop
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