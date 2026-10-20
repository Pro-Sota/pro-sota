
"use client";

import {
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";

import {
  createPortfolioProject,
  deletePortfolioProject,
  updatePortfolioProject,
  updatePortfolioOrder,
  type PortfolioInput,
  type PortfolioProject,
} from "@/actions/portfolio";

type Props = {
  initialProjects: PortfolioProject[];
};

type Filter = "all" | "published" | "draft" | "featured";

const EMPTY_FORM: PortfolioInput = {
  name: "",
  slug: "",
  category: "",
  location: "",
  year: new Date().getFullYear(),
  description: "",
  cover_image: "",
  gallery: [],
  status: "draft",
  featured: false,
};

const CATEGORIES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização",
  "Reabilitação",
  "Interiores",
  "Outro",
];

const inputClass =
  "mt-2 w-full rounded-md border border-[#dfe2e3] bg-white px-3 py-2.5 text-sm text-[#002950] outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20";

const labelClass = "block text-xs font-semibold text-slate-700";

const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#002950] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#073b69] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-gray-50 disabled:opacity-50";

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toForm(project: PortfolioProject): PortfolioInput {
  return {
    name: project.name,
    slug: project.slug,
    category: project.category,
    location: project.location ?? "",
    year: project.year,
    description: project.description ?? "",
    cover_image: project.cover_image ?? "",
    gallery: project.gallery ?? [],
    status: project.status,
    featured: project.featured,
  };
}

function StatCard({
  label,
  value,
  description,
  icon,
  accent = "navy",
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  accent?: "navy" | "green" | "gold" | "gray";
}) {
  const iconColors = {
    navy: "bg-blue-50 text-[#002950]",
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-amber-50 text-[#9b742f]",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <article className="rounded-lg border border-[#e8e8e4] bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span
          className={`grid size-9 place-items-center rounded-md text-base ${iconColors[accent]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <p className="text-3xl font-semibold tracking-tight text-[#002950]">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-2 text-xs text-slate-400">{description}</p>
    </article>
  );
}

export default function PortfolioManager({
  initialProjects,
}: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState<PortfolioInput>(EMPTY_FORM);
  const [galleryText, setGalleryText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<PortfolioProject | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(
    () => ({
      total: projects.length,
      published: projects.filter((p) => p.status === "published").length,
      drafts: projects.filter((p) => p.status === "draft").length,
      featured: projects.filter((p) => p.featured).length,
    }),
    [projects],
  );

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...projects]
      .sort((a, b) => a.display_order - b.display_order)
      .filter((project) => {
        const matchesSearch = [
          project.name,
          project.category,
          project.location ?? "",
          project.year?.toString() ?? "",
        ].some((value) => value.toLowerCase().includes(query));

        const matchesFilter =
          filter === "all" ||
          (filter === "published" && project.status === "published") ||
          (filter === "draft" && project.status === "draft") ||
          (filter === "featured" && project.featured);

        return matchesSearch && matchesFilter;
      });
  }, [projects, search, filter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setGalleryText("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(project: PortfolioProject) {
    setEditing(project);
    setForm(toForm(project));
    setGalleryText((project.gallery ?? []).join("\n"));
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (isPending) return;
    setModalOpen(false);
    setEditing(null);
    setError("");
  }

  function updateField<K extends keyof PortfolioInput>(
    key: K,
    value: PortfolioInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editing ? current.slug : makeSlug(value),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const payload: PortfolioInput = {
      ...form,
      gallery: galleryText
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      const result = editing
        ? await updatePortfolioProject(editing.id, payload)
        : await createPortfolioProject(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.project) {
        setProjects((current) => {
          const exists = current.some(
            (project) => project.id === result.project!.id,
          );

          const next = exists
            ? current.map((project) =>
                project.id === result.project!.id
                  ? result.project!
                  : project,
              )
            : [...current, result.project!];

          return next.sort((a, b) => a.display_order - b.display_order);
        });
      }

      setNotice(
        editing
          ? "Projecto actualizado com sucesso."
          : "Projecto adicionado ao portefólio.",
      );
      setModalOpen(false);
      setEditing(null);
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setError("");

    startTransition(async () => {
      const result = await deletePortfolioProject(target.id);

      if (!result.success) {
        setError(result.error);
        setDeleteTarget(null);
        return;
      }

      setProjects((current) =>
        current.filter((project) => project.id !== target.id),
      );

      setNotice("Projecto eliminado com sucesso.");
      setDeleteTarget(null);
    });
  }

  function toggleFeatured(project: PortfolioProject) {
    const payload = {
      ...toForm(project),
      featured: !project.featured,
    };

    startTransition(async () => {
      const result = await updatePortfolioProject(project.id, payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.project) {
        setProjects((current) =>
          current.map((item) =>
            item.id === project.id ? result.project! : item,
          ),
        );
      }
    });
  }

  function moveProject(project: PortfolioProject, direction: -1 | 1) {
    const ordered = [...projects].sort(
      (a, b) => a.display_order - b.display_order,
    );

    const index = ordered.findIndex((item) => item.id === project.id);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return;
    }

    [ordered[index], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[index],
    ];

    const reordered = ordered.map((item, position) => ({
      ...item,
      sort_order: position + 1,
    }));

    setProjects(reordered);

    startTransition(async () => {
      const result = await updatePortfolioOrder(
        reordered.map((item) => item.id),
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setNotice("Ordem do portefólio actualizada.");
    });
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] p-4 text-[#002950] sm:p-6 xl:p-9">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-[#BD9655]">
            <span className="size-1.5 rounded-full bg-[#BD9655]" />
            GESTÃO DE CONTEÚDO
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Portefólio
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Gira os projectos que representam o trabalho da PRO SOTA.
          </p>
        </div>

        <button type="button" className={primaryButtonClass} onClick={openCreate}>
          <span className="text-lg leading-none" aria-hidden="true">+</span>
          Adicionar projecto
        </button>
      </header>

      {notice && (
        <div
          className="mb-5 flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          <span aria-hidden="true">✓</span>
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            className="text-lg"
            aria-label="Fechar notificação"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div
          className="mb-5 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <span className="flex-1">{error}</span>
          <button
            type="button"
            aria-label="Fechar notificação"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      <section
        className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo do portefólio"
      >
        <StatCard
          label="Total de projectos"
          value={stats.total}
          description="Registos no portefólio"
          icon="▤"
        />
        <StatCard
          label="Publicados"
          value={stats.published}
          description="Visíveis ao público"
          icon="↗"
          accent="green"
        />
        <StatCard
          label="Rascunhos"
          value={stats.drafts}
          description="Ainda não publicados"
          icon="✎"
          accent="gray"
        />
        <StatCard
          label="Em destaque"
          value={stats.featured}
          description="Projectos prioritários"
          icon="★"
          accent="gold"
        />
      </section>

      <section className="rounded-lg border border-[#e8e8e4] bg-white p-4 sm:p-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Os seus projectos</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Consulte, edite e organize os projectos apresentados no site.
            </p>
          </div>

          <span className="w-fit rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-slate-600">
            {visibleProjects.length}{" "}
            {visibleProjects.length === 1 ? "projecto" : "projectos"}
          </span>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-md border border-gray-200 px-3 text-slate-400 focus-within:border-[#BD9655]">
            <span className="text-xl" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por nome, categoria ou localização..."
              aria-label="Pesquisar projectos"
              className="w-full min-w-0 bg-transparent text-sm text-[#002950] outline-none placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                aria-label="Limpar pesquisa"
                className="text-lg"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </label>

          <label className="flex items-center gap-3 text-xs text-slate-500">
            <span>Estado</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className="h-11 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm text-[#002950] outline-none focus:border-[#BD9655] md:min-w-48"
            >
              <option value="all">Todos os projectos</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="featured">Em destaque</option>
            </select>
          </label>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-lg bg-blue-50 text-2xl text-[#002950]">
              ▤
            </div>

            <h3 className="text-base font-semibold">
              {projects.length === 0
                ? "Comece a construir o seu portefólio"
                : "Nenhum projecto encontrado"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {projects.length === 0
                ? "Adicione o primeiro projecto para o apresentar no site institucional."
                : "Experimente outra pesquisa ou altere o filtro seleccionado."}
            </p>

            {projects.length === 0 && (
              <button
                type="button"
                className={`${primaryButtonClass} mt-5`}
                onClick={openCreate}
              >
                + Adicionar primeiro projecto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {visibleProjects.map((project, index) => (
              <article
                key={project.id}
                className="group min-w-0 overflow-hidden rounded-lg border border-[#e8e8e4] bg-white transition hover:border-[#d6d1c7] hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden bg-[#efefeb]">
                  {project.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.cover_image}
                      alt={`Imagem de ${project.name}`}
                      loading="lazy"
                      className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2">
                      <span className="text-lg font-bold tracking-[0.25em] text-[#002950]">
                        PRO SOTA
                      </span>
                      <span className="text-xs text-gray-400">
                        Imagem não definida
                      </span>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded bg-white px-2.5 py-1.5 text-[10px] font-semibold ${
                        project.status === "published"
                          ? "text-emerald-700"
                          : "text-[#85662e]"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          project.status === "published"
                            ? "bg-emerald-500"
                            : "bg-[#BD9655]"
                        }`}
                      />
                      {project.status === "published"
                        ? "Publicado"
                        : "Rascunho"}
                    </span>

                    {project.featured && (
                      <span className="rounded bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold text-[#85662e]">
                        ★ Destaque
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(project)}
                    disabled={isPending}
                    aria-label={
                      project.featured
                        ? "Remover destaque"
                        : "Marcar como destaque"
                    }
                    title={
                      project.featured
                        ? "Remover destaque"
                        : "Marcar como destaque"
                    }
                    className={`absolute right-3 top-3 grid size-9 place-items-center rounded-md border text-lg shadow-sm transition disabled:opacity-50 ${
                      project.featured
                        ? "border-amber-200 bg-amber-50 text-[#9b742f]"
                        : "border-white/80 bg-white/95 text-gray-500 hover:text-[#9b742f]"
                    }`}
                  >
                    ★
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-[#98743a]">
                    <span className="truncate">{project.category}</span>
                    {project.year && (
                      <span className="shrink-0 text-slate-400">
                        {project.year}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 truncate text-base font-semibold tracking-tight text-[#002950]">
                    {project.name}
                  </h3>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <span aria-hidden="true">⌖</span>
                    <span className="truncate">
                      {project.location || "Localização não definida"}
                    </span>
                  </p>

                  <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                    {project.description ||
                      "Sem descrição. Edite o projecto para adicionar mais informação."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-slate-400">
                      Actualizado{" "}
                      {formatDate(project.updated_at || project.created_at)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded border border-gray-200 text-sm text-slate-600 hover:bg-gray-50 disabled:opacity-30"
                        aria-label={`Mover ${project.name} para cima`}
                        title="Mover para cima"
                        disabled={isPending || index === 0}
                        onClick={() => moveProject(project, -1)}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded border border-gray-200 text-sm text-slate-600 hover:bg-gray-50 disabled:opacity-30"
                        aria-label={`Mover ${project.name} para baixo`}
                        title="Mover para baixo"
                        disabled={
                          isPending || index === visibleProjects.length - 1
                        }
                        onClick={() => moveProject(project, 1)}
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 px-2.5 text-xs font-semibold text-[#002950] hover:border-[#002950]"
                        onClick={() => openEdit(project)}
                      >
                        Editar <span aria-hidden="true">↗</span>
                      </button>

                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded border border-gray-200 text-lg text-red-600 hover:border-red-200 hover:bg-red-50"
                        aria-label={`Eliminar ${project.name}`}
                        title="Eliminar projecto"
                        onClick={() => setDeleteTarget(project)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[#00162b]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-modal-title"
            className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#BD9655]">
                  GESTÃO DE PROJECTOS
                </p>
                <h2
                  id="portfolio-modal-title"
                  className="mt-2 text-xl font-semibold text-[#002950]"
                >
                  {editing ? "Editar projecto" : "Novo projecto"}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Preencha os dados que serão apresentados no portefólio.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Fechar formulário"
                className="grid size-9 shrink-0 place-items-center rounded-md border border-gray-200 text-xl text-slate-500 hover:bg-gray-50"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-5 sm:px-7">
                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <section className="border-b border-gray-100 py-6">
                  <h3 className="text-sm font-semibold text-[#002950]">
                    Informação geral
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Identificação e classificação do projecto.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className={`${labelClass} sm:col-span-2`}>
                      Nome do projecto *
                      <input
                        required
                        maxLength={150}
                        className={inputClass}
                        value={form.name}
                        onChange={(event) => handleNameChange(event.target.value)}
                        placeholder="Ex.: Edifício Residencial Luanda"
                      />
                    </label>

                    <label className={labelClass}>
                      Slug / endereço *
                      <input
                        required
                        maxLength={180}
                        className={inputClass}
                        value={form.slug}
                        onChange={(event) =>
                          updateField("slug", makeSlug(event.target.value))
                        }
                        placeholder="edificio-residencial-luanda"
                      />
                      <span className="mt-1 block font-normal text-slate-400">
                        Utilizado no endereço público.
                      </span>
                    </label>

                    <label className={labelClass}>
                      Categoria *
                      <select
                        required
                        className={inputClass}
                        value={form.category}
                        onChange={(event) =>
                          updateField("category", event.target.value)
                        }
                      >
                        <option value="">Seleccionar categoria</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Localização
                      <input
                        maxLength={150}
                        className={inputClass}
                        value={form.location}
                        onChange={(event) =>
                          updateField("location", event.target.value)
                        }
                        placeholder="Luanda, Angola"
                      />
                    </label>

                    <label className={labelClass}>
                      Ano
                      <input
                        type="number"
                        min={1900}
                        max={new Date().getFullYear() + 10}
                        className={inputClass}
                        value={form.year ?? ""}
                        onChange={(event) =>
                          updateField(
                            "year",
                            event.target.value
                              ? Number(event.target.value)
                              : null,
                          )
                        }
                        placeholder="2026"
                      />
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Descrição
                      <textarea
                        rows={4}
                        maxLength={5000}
                        className={inputClass}
                        value={form.description}
                        onChange={(event) =>
                          updateField("description", event.target.value)
                        }
                        placeholder="Descreva o projecto, o conceito e as soluções adoptadas..."
                      />
                      <span className="mt-1 text-right font-normal text-slate-400">
                        {form.description.length}/5000 caracteres
                      </span>
                    </label>
                  </div>
                </section>

                <section className="border-b border-gray-100 py-6">
                  <h3 className="text-sm font-semibold text-[#002950]">
                    Imagens
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Utilize URLs públicas de imagens. Não é necessária uma API.
                  </p>

                  <div className="mt-5 space-y-4">
                    <label className={labelClass}>
                      Imagem de capa (URL)
                      <input
                        type="url"
                        className={inputClass}
                        value={form.cover_image}
                        onChange={(event) =>
                          updateField("cover_image", event.target.value)
                        }
                        placeholder="https://..."
                      />
                    </label>

                    {form.cover_image && (
                      <div className="relative h-40 overflow-hidden rounded-md bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.cover_image}
                          alt="Pré-visualização da capa"
                          className="size-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          onLoad={(event) => {
                            event.currentTarget.style.display = "block";
                          }}
                        />
                        <span className="absolute bottom-2 left-2 rounded bg-[#002950]/85 px-2 py-1 text-[10px] text-white">
                          Pré-visualização da capa
                        </span>
                      </div>
                    )}

                    <label className={labelClass}>
                      Galeria de imagens (opcional)
                      <textarea
                        rows={3}
                        className={inputClass}
                        value={galleryText}
                        onChange={(event) => setGalleryText(event.target.value)}
                        placeholder={"https://imagem-1.jpg\nhttps://imagem-2.jpg"}
                      />
                      <span className="mt-1 block font-normal text-slate-400">
                        Introduza uma URL por linha.
                      </span>
                    </label>
                  </div>
                </section>

                <section className="py-6">
                  <h3 className="text-sm font-semibold text-[#002950]">
                    Publicação
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Defina como o projecto aparece no site.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Estado
                      <select
                        className={inputClass}
                        value={form.status}
                        onChange={(event) =>
                          updateField(
                            "status",
                            event.target.value as PortfolioInput["status"],
                          )
                        }
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                      </select>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(event) =>
                          updateField("featured", event.target.checked)
                        }
                        className="mt-1 size-4 accent-[#002950]"
                      />
                      <span>
                        <span className="block text-xs font-semibold text-[#002950]">
                          Projecto em destaque
                        </span>
                        <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                          Priorizar este projecto na apresentação pública.
                        </span>
                      </span>
                    </label>
                  </div>
                </section>
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={closeModal}
                  disabled={isPending}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={isPending}
                >
                  {isPending
                    ? "A guardar..."
                    : editing
                      ? "Guardar alterações"
                      : "Criar projecto"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#00162b]/60 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="portfolio-delete-title"
            aria-describedby="portfolio-delete-description"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-red-50 text-xl font-bold text-red-600">
              !
            </div>

            <h2
              id="portfolio-delete-title"
              className="text-center text-xl font-semibold text-[#002950]"
            >
              Eliminar projecto?
            </h2>

            <p
              id="portfolio-delete-description"
              className="mt-3 text-center text-sm leading-6 text-slate-500"
            >
              Tem a certeza de que pretende eliminar{" "}
              <strong className="text-slate-700">{deleteTarget.name}</strong>?
              Esta acção não pode ser desfeita.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "A eliminar..." : "Eliminar projecto"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
