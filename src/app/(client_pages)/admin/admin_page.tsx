"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import defaultProjects from "../components/portfolioData";

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */

export type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  year: string;
  location: string;
  summary: string;
  description: string;
  images: string[];
};

type ProjectForm = Omit<PortfolioProject, "id" | "images">;

type AdminProps = {
  /** Projectos fornecidos pelo componente pai/server page. */
  initialProjects: PortfolioProject[];
  /** Persistência controlada pelo componente pai (por exemplo, Server Action). */
  onSaveProjects: (projects: PortfolioProject[]) => Promise<void>;
};
type FieldErrors = Partial<Record<keyof ProjectForm | "images", string>>;
type Notice = { type: "success" | "error"; text: string } | null;

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

const CATEGORIES = ["Arquitectura", "Engenharia", "Construção", "Fiscalização"];
const ALL = "Todas";

const MAX_IMAGES = 12;
const MAX_SOURCE_BYTES = 20_000_000; // ficheiro original, antes da compressão
const MAX_DIMENSION = 1600; // px — lado maior após redimensionar
const JPEG_QUALITY = 0.82;
const PAYLOAD_WARN_BYTES = 3_500_000; // aviso para conjuntos de imagens grandes

const NAME_MAX = 120;
const SUMMARY_MAX = 140;
const DESCRIPTION_MAX = 2000;

const emptyForm: ProjectForm = {
  name: "",
  category: "Construção",
  year: "",
  location: "",
  summary: "",
  description: "",
};

/* Tailwind class groups ----------------------------------------------------- */

const BTN = {
  base:
    "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-50",
  neutral: "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100",
  primary:
    "border-transparent bg-[var(--gold)] text-neutral-950 hover:brightness-110",
  danger: "border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost: "border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100",
};

const ICON_BTN =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 " +
  "transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] " +
  "disabled:cursor-not-allowed disabled:opacity-40";

const INPUT =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 " +
  "placeholder:text-neutral-400 transition-colors focus:border-[var(--gold)] focus:outline-none " +
  "focus:ring-2 focus:ring-[var(--gold)]/40 disabled:bg-neutral-100 aria-[invalid=true]:border-red-500";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function slugify(name: string): string {
  return (
    (name || "projecto")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "projecto"
  );
}


function isPortfolioProject(value: unknown): value is PortfolioProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Partial<PortfolioProject>;
  return typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.category === "string" &&
    typeof project.year === "string" &&
    typeof project.location === "string" &&
    typeof project.summary === "string" &&
    typeof project.description === "string" &&
    Array.isArray(project.images) &&
    project.images.every((image) => typeof image === "string");
}

function formatBytes(bytes: number): string {
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/** Redimensiona e comprime a imagem no browser (evita JSON gigante na API). */
async function fileToOptimizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("Canvas indisponível.");
  }

  // Fundo branco para PNGs com transparência.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Admin({ initialProjects, onSaveProjects }: AdminProps) {
  // Dados publicados
  const [projects, setProjects] = useState<PortfolioProject[]>(initialProjects);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // Avisos e confirmações
  const [notice, setNotice] = useState<Notice>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtros da lista
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);

  // Editor — null = novo projecto; undefined = fechado.
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [editorError, setEditorError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [dragging, setDragging] = useState(false);

  const importInput = useRef<HTMLInputElement>(null);
  const escapeHandler = useRef<() => void>(() => { });

  const editorOpen = editingId !== undefined;

  /* ---------------------------------- Avisos --------------------------------- */

  const showNotice = useCallback((type: "success" | "error", text: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);

    setNotice({ type, text });

    if (type === "success") {
      noticeTimer.current = setTimeout(() => setNotice(null), 2500);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  /* ------------------------------- Publicar ---------------------------------- */

  /** Guarda através do callback do componente pai, sem chamadas HTTP nesta página. */
  async function persist(
    next: PortfolioProject[],
    successText = "Alterações guardadas"
  ): Promise<string | null> {
    if (savingRef.current) return "Já existe uma gravação em curso.";

    savingRef.current = true;
    setSaving(true);

    try {
      await onSaveProjects(next);
      setProjects(next);
      showNotice("success", successText);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Não foi possível guardar as alterações.";
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  /* -------------------------------- Editor ----------------------------------- */

  function openEditor(project: PortfolioProject | null) {
    setEditorError("");
    setFieldErrors({});
    setDirty(false);

    if (project) {
      setEditingId(project.id);
      setForm({
        name: project.name,
        category: project.category,
        year: project.year,
        location: project.location,
        summary: project.summary,
        description: project.description,
      });
      setImages([...project.images]);
    } else {
      setEditingId(null);
      setForm({ ...emptyForm });
      setImages([]);
    }
  }

  function closeEditorNow() {
    setEditingId(undefined);
    setEditorError("");
    setFieldErrors({});
    setDirty(false);
  }

  function requestCloseEditor() {
    if (savingRef.current || processingImages) return;

    if (dirty) {
      setConfirm({
        title: "Descartar alterações?",
        message: "Tem alterações por guardar neste projecto. Se sair agora, serão perdidas.",
        confirmLabel: "Descartar",
        danger: true,
        onConfirm: closeEditorNow,
      });
      return;
    }

    closeEditorNow();
  }

  function updateField<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setDirty(true);
  }

  // Escape fecha primeiro a confirmação, depois o editor.
  escapeHandler.current = () => {
    if (confirm) {
      setConfirm(null);
    } else if (editorOpen) {
      requestCloseEditor();
    }
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") escapeHandler.current();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Bloqueia o scroll da página por trás do editor.
  useEffect(() => {
    if (!editorOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [editorOpen]);

  // Avisa antes de fechar o separador com alterações por guardar.
  useEffect(() => {
    if (!dirty) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  /* --------------------------------- Imagens --------------------------------- */

  function moveImage(index: number, direction: number) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
    setDirty(true);
  }

  function addImageUrl(url: string): string | null {
    const value = url.trim();

    if (!value) return "Introduza um caminho ou URL.";

    if (!/^(\/|https?:\/\/)/i.test(value)) {
      return "Use um caminho a começar por / ou um URL https://…";
    }

    if (images.length >= MAX_IMAGES) {
      return `Máximo de ${MAX_IMAGES} fotografias por projecto.`;
    }

    setImages((current) => [...current, value]);
    setFieldErrors((current) => ({ ...current, images: undefined }));
    setDirty(true);
    return null;
  }

  async function addImageFiles(fileList: FileList | File[] | null) {
    if (!fileList || processingImages) return;

    const files = Array.from(fileList);
    if (files.length === 0) return;

    const room = MAX_IMAGES - images.length;

    if (room <= 0) {
      setEditorError(`Máximo de ${MAX_IMAGES} fotografias por projecto.`);
      return;
    }

    setEditorError("");
    setProcessingImages(true);

    const errors: string[] = [];

    if (files.length > room) {
      errors.push(`Só foi possível adicionar ${room} das ${files.length} imagens (máximo ${MAX_IMAGES}).`);
    }

    const results = await Promise.all(
      files.slice(0, room).map(async (file) => {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
          errors.push(`${file.name}: use PNG, JPEG ou WebP.`);
          return null;
        }

        if (file.size > MAX_SOURCE_BYTES) {
          errors.push(`${file.name}: ficheiro superior a 20 MB.`);
          return null;
        }

        try {
          return await fileToOptimizedDataUrl(file);
        } catch {
          errors.push(`${file.name}: não foi possível processar a imagem.`);
          return null;
        }
      })
    );

    const added = results.filter((value): value is string => value !== null);

    if (added.length > 0) {
      setImages((current) => [...current, ...added].slice(0, MAX_IMAGES));
      setFieldErrors((current) => ({ ...current, images: undefined }));
      setDirty(true);
    }

    if (errors.length > 0) setEditorError(errors.join(" "));

    setProcessingImages(false);
  }

  /* ----------------------------- Guardar / eliminar -------------------------- */

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!form.name.trim()) errors.name = "Dê um nome ao projecto.";

    if (form.year.trim() && !/^\d{4}$/.test(form.year.trim())) {
      errors.year = "Use 4 dígitos, por exemplo 2026.";
    }

    if (images.length === 0) errors.images = "Adicione pelo menos uma fotografia.";

    return errors;
  }

  async function saveProject() {
    if (savingRef.current || processingImages) return;

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setEditorError("Corrija os campos assinalados.");
      return;
    }

    setEditorError("");

    const clean: ProjectForm = {
      name: form.name.trim(),
      category: form.category,
      year: form.year.trim(),
      location: form.location.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
    };

    let next: PortfolioProject[];

    if (editingId) {
      next = projects.map((project) =>
        project.id === editingId ? { ...project, ...clean, images: [...images] } : project
      );
    } else {
      const base = slugify(clean.name);
      let id = base;
      let counter = 1;

      while (projects.some((project) => project.id === id)) {
        id = `${base}-${++counter}`;
      }

      next = [...projects, { id, ...clean, images: [...images] }];
    }

    const error = await persist(
      next,
      editingId ? "Projecto actualizado e publicado" : "Projecto adicionado e publicado"
    );

    if (error) {
      setEditorError(error);
      return;
    }

    closeEditorNow();
  }

  function requestDelete() {
    if (!editingId || savingRef.current) return;

    const target = projects.find((project) => project.id === editingId);

    setConfirm({
      title: "Eliminar projecto?",
      message: `"${target?.name ?? "Este projecto"}" será removido do portefólio publicado no site.`,
      confirmLabel: "Eliminar",
      danger: true,
      onConfirm: async () => {
        const error = await persist(
          projects.filter((project) => project.id !== editingId),
          "Projecto eliminado"
        );

        if (error) {
          setEditorError(error);
          return;
        }

        closeEditorNow();
      },
    });
  }

  /* ----------------------------- Lista & backup ------------------------------ */

  async function move(id: string, direction: number) {
    const index = projects.findIndex((project) => project.id === id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= projects.length) return;

    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];

    const error = await persist(next, "Ordem actualizada");
    if (error) showNotice("error", error);
  }

  function requestReset() {
    if (savingRef.current) return;

    setConfirm({
      title: "Repor predefinições?",
      message: "Isto substitui todo o portefólio publicado no site pelos dados de fábrica.",
      confirmLabel: "Repor e publicar",
      danger: true,
      onConfirm: async () => {
        const defaults: unknown = JSON.parse(JSON.stringify(defaultProjects));

        if (!Array.isArray(defaults) || !defaults.every(isPortfolioProject)) {
          showNotice("error", "Os dados predefinidos têm um formato inválido.");
          return;
        }

        const error = await persist(defaults, "Predefinições repostas");
        if (error) showNotice("error", error);
      },
    });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `projectos-${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());

      if (!Array.isArray(parsed) || !parsed.every(isPortfolioProject)) {
        throw new Error("invalid");
      }

      const list: PortfolioProject[] = parsed;

      if (new Set(list.map((project) => project.id)).size !== list.length) {
        throw new Error("duplicate ids");
      }

      setConfirm({
        title: "Importar cópia de segurança?",
        message: `Isto substitui os ${projects.length} projectos publicados pelos ${list.length} do ficheiro.`,
        confirmLabel: "Importar e publicar",
        danger: true,
        onConfirm: async () => {
          const error = await persist(list, "Cópia importada e publicada");
          if (error) showNotice("error", error);
        },
      });
    } catch {
      showNotice("error", "Ficheiro inválido. Use uma cópia exportada por este painel.");
    }
  }

  async function runConfirm() {
    const action = confirm;
    if (!action) return;

    setConfirm(null);
    await action.onConfirm();
  }

  /* ---------------------------- Valores derivados ---------------------------- */

  const filtering = query.trim() !== "" || categoryFilter !== ALL;

  const filterCategories = [
    ALL,
    ...Array.from(new Set([...CATEGORIES, ...projects.map((project) => project.category)])),
  ];

  const normalizedQuery = query.trim().toLowerCase();

  const visibleProjects = projects.filter((project) => {
    if (categoryFilter !== ALL && project.category !== categoryFilter) return false;
    if (!normalizedQuery) return true;

    return [project.name, project.location, project.summary]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const totalPhotos = projects.reduce((sum, project) => sum + project.images.length, 0);

  const editorCategories = CATEGORIES.includes(form.category)
    ? CATEGORIES
    : [form.category, ...CATEGORIES];

  const uploadedBytes = images
    .filter((src) => src.startsWith("data:"))
    .reduce((sum, src) => sum + src.length, 0);

  const describe = (key: keyof FieldErrors) => ({
    "aria-invalid": fieldErrors[key] ? (true as const) : undefined,
    "aria-describedby": fieldErrors[key] ? `project-${key}-error` : undefined,
  });

  /* --------------------------------- Render ---------------------------------- */

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950 text-white">
        <div className="mx-auto flex w-full max-w-6xl justify-between items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="PRO SOTA"
              className="h-12 w-auto"
            />
          </Link>


          <Link
            href="/portfolio"
            target="_blank"
            rel="noreferrer"
            className={`${BTN.base} border-white/20 bg-transparent text-white hover:bg-white/10`}
          >
            Ver site ↗
          </Link>

        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">

        <fieldset
          disabled={saving}
          className="m-0 min-w-0 border-0 p-0"
        >
          {/* Barra de ferramentas */}
          <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-600" aria-live="polite">
                <>
                  <strong className="text-neutral-900">{projects.length}</strong>{" "}
                  {projects.length === 1 ? "projecto" : "projectos"} ·{" "}
                  <strong className="text-neutral-900">{totalPhotos}</strong>{" "}
                  {totalPhotos === 1 ? "fotografia" : "fotografias"}
                </>
              </p>

              <button
                type="button"
                className={`${BTN.base} ${BTN.primary}`}
                onClick={() => openEditor(null)}
              >
                + Adicionar projecto
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label htmlFor="filter-query" className="sr-only">
                  Procurar projectos
                </label>
                <input
                  id="filter-query"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Procurar por nome, local ou descrição…"
                  className={INPUT}
                />
              </div>

              <div className="sm:w-56">
                <label htmlFor="filter-category" className="sr-only">
                  Filtrar por categoria
                </label>
                <select
                  id="filter-category"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className={INPUT}
                >
                  {filterCategories.map((category) => (
                    <option key={category} value={category}>
                      {category === ALL ? "Todas as categorias" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
              <span className="mr-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Cópia de segurança
              </span>

              <button
                type="button"
                className={`${BTN.base} ${BTN.neutral}`}
                onClick={exportData}
                disabled={projects.length === 0}
              >
                ⬇ Exportar
              </button>

              <button
                type="button"
                className={`${BTN.base} ${BTN.neutral}`}
                onClick={() => importInput.current?.click()}
              >
                ⬆ Importar
              </button>

              <input
                ref={importInput}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(event) => void handleImportFile(event)}
              />

              <button
                type="button"
                className={`${BTN.base} ${BTN.danger} sm:ml-auto`}
                onClick={requestReset}
              >
                Repor predefinições
              </button>
            </div>
          </section>

          {/* Lista */}

          {projects.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
              <p className="text-base font-medium text-neutral-800">
                Ainda não há projectos no portefólio.
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Adicione o primeiro projecto para o mostrar aos visitantes do site.
              </p>
              <button
                type="button"
                className={`${BTN.base} ${BTN.primary} mt-5`}
                onClick={() => openEditor(null)}
              >
                + Adicionar projecto
              </button>
            </div>
          )}

          {projects.length > 0 && visibleProjects.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
              <p className="text-sm text-neutral-600">
                Nenhum projecto corresponde à pesquisa.
              </p>
              <button
                type="button"
                className={`${BTN.base} ${BTN.neutral} mt-4`}
                onClick={() => {
                  setQuery("");
                  setCategoryFilter(ALL);
                }}
              >
                Limpar filtros
              </button>
            </div>
          )}

          {visibleProjects.length > 0 && (
            <>
              {filtering && (
                <p className="mb-3 text-xs text-neutral-500">
                  A ordenação fica desactivada enquanto há filtros activos.
                </p>
              )}

              <ul className="space-y-3">
                {visibleProjects.map((project) => {
                  const position = projects.findIndex((item) => item.id === project.id);

                  return (
                    <li
                      key={project.id}
                      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm sm:gap-4"
                    >
                      <span className="hidden w-6 shrink-0 text-center text-sm font-semibold text-neutral-400 sm:block">
                        {position + 1}
                      </span>

                      {project.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.images[0]}
                          alt=""
                          loading="lazy"
                          className="h-16 w-24 shrink-0 rounded-md bg-neutral-200 object-cover sm:h-20 sm:w-32"
                        />
                      ) : (
                        <div className="h-16 w-24 shrink-0 rounded-md bg-neutral-200 sm:h-20 sm:w-32" />
                      )}

                      <div className="min-w-0 flex-1">
                        <b className="block truncate text-sm font-semibold sm:text-base">
                          {project.name}
                        </b>
                        <span className="block truncate text-xs text-neutral-500 sm:text-sm">
                          {[project.category, project.year, project.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-400">
                          {project.images.length} foto(s)
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          className={ICON_BTN}
                          title="Mover para cima"
                          aria-label={`Mover ${project.name} para cima`}
                          disabled={filtering || position === 0}
                          onClick={() => void move(project.id, -1)}
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className={ICON_BTN}
                          title="Mover para baixo"
                          aria-label={`Mover ${project.name} para baixo`}
                          disabled={filtering || position === projects.length - 1}
                          onClick={() => void move(project.id, 1)}
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className={`${BTN.base} ${BTN.neutral} h-9 px-3`}
                          aria-label={`Editar ${project.name}`}
                          onClick={() => openEditor(project)}
                        >
                          ✎ <span className="hidden sm:inline">Editar</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </fieldset>
      </main>

      {/* Editor */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={requestCloseEditor}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
            className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
              <h2 id="editor-title" className="text-lg font-semibold">
                {editingId ? "Editar projecto" : "Novo projecto"}
              </h2>

              <button
                type="button"
                className={ICON_BTN}
                aria-label="Fechar"
                onClick={requestCloseEditor}
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {editorError && (
                <p
                  role="alert"
                  className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {editorError}
                </p>
              )}

              <fieldset disabled={saving} className="m-0 min-w-0 border-0 p-0">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Dados */}
                  <div className="flex flex-col gap-4">
                    <Field id="project-name" label="Nome do projecto *" error={fieldErrors.name}>
                      <input
                        id="project-name"
                        type="text"
                        autoFocus
                        maxLength={NAME_MAX}
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        placeholder="Ex: Hotel Golden Park"
                        className={INPUT}
                        {...describe("name")}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field id="project-category" label="Categoria">
                        <select
                          id="project-category"
                          value={form.category}
                          onChange={(event) => updateField("category", event.target.value)}
                          className={INPUT}
                        >
                          {editorCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field id="project-year" label="Ano" error={fieldErrors.year}>
                        <input
                          id="project-year"
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={form.year}
                          onChange={(event) => updateField("year", event.target.value)}
                          placeholder="2026"
                          className={INPUT}
                          {...describe("year")}
                        />
                      </Field>
                    </div>

                    <Field id="project-location" label="Localização">
                      <input
                        id="project-location"
                        type="text"
                        maxLength={120}
                        value={form.location}
                        onChange={(event) => updateField("location", event.target.value)}
                        placeholder="Ex: Luanda"
                        className={INPUT}
                      />
                    </Field>

                    <Field
                      id="project-summary"
                      label="Frase curta (aparece no cartão)"
                      hint={`${form.summary.length}/${SUMMARY_MAX}`}
                    >
                      <input
                        id="project-summary"
                        type="text"
                        maxLength={SUMMARY_MAX}
                        value={form.summary}
                        onChange={(event) => updateField("summary", event.target.value)}
                        placeholder="Ex: Campus completo, 36 salas"
                        className={INPUT}
                      />
                    </Field>

                    <Field
                      id="project-description"
                      label="Descrição completa (aparece na galeria)"
                      hint={`${form.description.length}/${DESCRIPTION_MAX}`}
                    >
                      <textarea
                        id="project-description"
                        rows={5}
                        maxLength={DESCRIPTION_MAX}
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        placeholder="Descreva o projecto: o que foi feito, o cliente, os desafios…"
                        className={`${INPUT} resize-y`}
                      />
                    </Field>
                  </div>

                  {/* Fotografias */}
                  <div className="flex flex-col gap-3" role="group" aria-labelledby="images-label">
                    <div className="flex items-baseline justify-between">
                      <span id="images-label" className="text-sm font-medium text-neutral-800">
                        Fotografias do projecto *
                      </span>
                      <span className="text-xs text-neutral-500">
                        {images.length}/{MAX_IMAGES} · a primeira é a capa
                      </span>
                    </div>

                    {fieldErrors.images && (
                      <p id="project-images-error" className="text-xs font-medium text-red-600">
                        {fieldErrors.images}
                      </p>
                    )}

                    {images.length > 0 && (
                      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {images.map((src, index) => (
                          <li
                            key={`${index}-${src.slice(-24)}`}
                            className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`Fotografia ${index + 1}`}
                              className="aspect-[4/3] w-full object-cover"
                            />

                            {index === 0 && (
                              <span className="absolute left-2 top-2 rounded bg-[var(--gold)] px-2 py-0.5 text-xs font-semibold text-neutral-950">
                                Capa
                              </span>
                            )}

                            <div className="flex items-center justify-between gap-1 border-t border-neutral-200 bg-white p-1.5">
                              <button
                                type="button"
                                className={`${ICON_BTN} h-8 w-8`}
                                aria-label={`Mover fotografia ${index + 1} para trás`}
                                disabled={index === 0}
                                onClick={() => moveImage(index, -1)}
                              >
                                ←
                              </button>

                              <button
                                type="button"
                                className={`${ICON_BTN} h-8 w-8`}
                                aria-label={`Mover fotografia ${index + 1} para a frente`}
                                disabled={index === images.length - 1}
                                onClick={() => moveImage(index, 1)}
                              >
                                →
                              </button>

                              <button
                                type="button"
                                className={`${ICON_BTN} h-8 w-8 text-red-600`}
                                aria-label={`Remover fotografia ${index + 1}`}
                                onClick={() => removeImage(index)}
                              >
                                &times;
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <label
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        void addImageFiles(event.dataTransfer.files);
                      }}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition focus-within:ring-2 focus-within:ring-[var(--gold)] ${dragging
                        ? "border-[var(--gold)] bg-amber-50"
                        : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
                        } ${processingImages || images.length >= MAX_IMAGES ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <span className="font-medium text-neutral-800">
                        {processingImages
                          ? "A processar imagens…"
                          : "Arraste imagens para aqui ou clique para escolher"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        PNG, JPEG ou WebP · são redimensionadas e comprimidas automaticamente
                      </span>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="sr-only"
                        disabled={processingImages}
                        onChange={(event) => {
                          void addImageFiles(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>

                    <ImageUrlAdder onAdd={addImageUrl} disabled={processingImages} />

                    {uploadedBytes > 0 && (
                      <p
                        className={`text-xs ${uploadedBytes > PAYLOAD_WARN_BYTES ? "font-medium text-amber-700" : "text-neutral-500"
                          }`}
                      >
                        Imagens carregadas neste projecto: {formatBytes(uploadedBytes)}.
                        {uploadedBytes > PAYLOAD_WARN_BYTES &&
                          " É muito — a gravação pode falhar. Prefira guardar as imagens em /public/assets e usar o caminho."}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-5 py-4 sm:px-6">
              {editingId && (
                <button
                  type="button"
                  className={`${BTN.base} ${BTN.danger} mr-auto`}
                  disabled={saving}
                  onClick={requestDelete}
                >
                  Eliminar projecto
                </button>
              )}

              <button
                type="button"
                className={`${BTN.base} ${BTN.ghost}`}
                disabled={saving}
                onClick={requestCloseEditor}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={`${BTN.base} ${BTN.primary}`}
                disabled={saving || processingImages}
                onClick={() => void saveProject()}
              >
                {saving ? "A guardar…" : "Guardar e publicar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação */}
      {confirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setConfirm(null)}
            aria-hidden="true"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
          >
            <h3 id="confirm-title" className="text-lg font-semibold">
              {confirm.title}
            </h3>

            <p id="confirm-message" className="mt-2 text-sm text-neutral-600">
              {confirm.message}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                className={`${BTN.base} ${BTN.neutral}`}
                onClick={() => setConfirm(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={`${BTN.base} ${confirm.danger
                  ? "border-transparent bg-red-600 text-white hover:bg-red-700"
                  : BTN.primary
                  }`}
                onClick={() => void runConfirm()}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aviso (toast) */}
      {notice && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 px-4">
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${notice.type === "error" ? "bg-red-600" : "bg-neutral-900"
              }`}
          >
            {notice.type === "success" && (
              <span aria-hidden="true" className="text-[var(--gold-light)]">
                ✓
              </span>
            )}

            <span className="flex-1">{notice.text}</span>

            {notice.type === "error" && (
              <button
                type="button"
                className="-my-1 rounded px-1 text-lg leading-none hover:bg-white/20"
                aria-label="Fechar aviso"
                onClick={() => setNotice(null)}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-800">
        {label}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-right text-xs text-neutral-400">{hint}</p>
      )}
    </div>
  );
}

function ImageUrlAdder({
  onAdd,
  disabled,
}: {
  onAdd: (url: string) => string | null;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const result = onAdd(value);

    if (result) {
      setError(result);
      return;
    }

    setError("");
    setValue("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Ou cole um caminho/URL (ex: /assets/img/projeto-1.jpg)"
          aria-label="Caminho ou URL da imagem"
          aria-invalid={error ? true : undefined}
          className={INPUT}
        />

        <button
          type="button"
          disabled={disabled}
          className={`${BTN.base} ${BTN.neutral} shrink-0`}
          onClick={submit}
        >
          Adicionar
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}