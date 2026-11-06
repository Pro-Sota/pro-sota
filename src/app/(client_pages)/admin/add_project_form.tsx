"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type {
  PortfolioProjectInput,
  PortfolioStatus,
} from "@/services/portfolio";

import {
  createPortfolioProjectAction,
  uploadPortfolioImageAction,
  deletePortfolioImageAction,
} from "@/actions/portfolio";

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

const CATEGORIES = [
  "Residencial",
  "Comercial",
  "Industrial",
  "Institucional",
  "Uso misto",
  "Reabilitação",
  "Design de interiores",
  "Paisagismo",
  "Outro",
];

const SPECIALTIES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização",
];

const STATUSES: {
  value: PortfolioStatus;
  label: string;
  hint: string;
}[] = [
  { value: "draft", label: "Rascunho", hint: "Visível só para si" },
  { value: "published", label: "Publicado", hint: "Visível no site" },
  { value: "archived", label: "Arquivado", hint: "Oculto do site" },
];

type FormValues = {
  name: string;
  slug: string;
  category: string;
  speciality: string[];
  location: string;
  year: number | null;
  description: string;
  status: PortfolioStatus;
  featured: boolean;
};

type ImageItem = {
  id: string;
  name: string;
  preview: string;
  path: string | null;
  status: "uploading" | "done" | "error";
  error?: string;
  external?: boolean;
};

const initialValues: FormValues = {
  name: "",
  slug: "",
  category: "",
  speciality: [],
  location: "",
  year: null,
  description: "",
  status: "draft",
  featured: false,
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10";

function generateSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * crypto.randomUUID() só existe em contextos seguros (HTTPS ou localhost).
 * Em HTTP (por exemplo, via IP da rede) lança erro e bloqueia o envio.
 */
function makeId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** Alguns browsers/sistemas devolvem file.type vazio: validar também pela extensão. */
function isAcceptedImage(file: File) {
  if (ACCEPTED_TYPES.includes(file.type)) return true;

  if (!file.type) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return ACCEPTED_EXTENSIONS.includes(extension);
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Interface components                                                       */
/* -------------------------------------------------------------------------- */

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,41,80,0.04)]">
      <header className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-base font-semibold text-[#002950]">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </header>

      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-gray-800"
      >
        {label}
        {required && <span className="ml-0.5 text-[#BD9655]">*</span>}
      </label>

      {children}

      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main form                                                                  */
/* -------------------------------------------------------------------------- */

export default function CreatePortfolioForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>(initialValues);
  const [slugEdited, setSlugEdited] = useState(false);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageNotice, setImageNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isUploading = images.some(
    (image) => image.status === "uploading",
  );

  const coverImage = images.find((image) => image.id === coverId);

  /* ------------------------------------------------------------------------ */
  /* Fields                                                                   */
  /* ------------------------------------------------------------------------ */

  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(value: string) {
    setValues((current) => ({
      ...current,
      name: value,
      slug: slugEdited ? current.slug : generateSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);

    updateField("slug", generateSlug(value));
  }

  function toggleSpecialty(specialty: string) {
    setValues((current) => ({
      ...current,
      speciality: current.speciality.includes(specialty)
        ? current.speciality.filter((item) => item !== specialty)
        : [...current.speciality, specialty],
    }));
  }

  /* ------------------------------------------------------------------------ */
  /* Image upload                                                             */
  /* ------------------------------------------------------------------------ */

  function markImageError(id: string, message: string) {
    setImages((current) =>
      current.map((image) =>
        image.id === id
          ? { ...image, status: "error", error: message }
          : image,
      ),
    );
  }

  async function uploadOne(item: ImageItem, file: File) {
    try {
      const formData = new FormData();

      formData.set("file", file);
      formData.set("folder", values.slug || "projects");

      const result = await uploadPortfolioImageAction(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      URL.revokeObjectURL(item.preview);

      setImages((current) =>
        current.map((image) =>
          image.id === item.id
            ? {
                ...image,
                preview: result.data.publicUrl,
                path: result.data.path,
                status: "done",
              }
            : image,
        ),
      );
    } catch (err) {
      markImageError(
        item.id,
        err instanceof Error
          ? err.message
          : "Falha ao enviar a imagem.",
      );
    }
  }

  async function addFiles(fileList: FileList | File[]) {
    setImageNotice("");

    try {
      // Copiar já: o input é limpo logo a seguir e a FileList ficaria vazia.
      const files = Array.from(fileList);

      const available = Math.max(0, MAX_IMAGES - images.length);
      const notices: string[] = [];

      const valid = files.filter((file) => {
        if (!isAcceptedImage(file)) {
          notices.push(`"${file.name}" não é um formato suportado.`);
          return false;
        }

        if (file.size > MAX_FILE_SIZE) {
          notices.push(`"${file.name}" excede 8 MB.`);
          return false;
        }

        return true;
      });

      const accepted = valid.slice(0, available);

      if (valid.length > accepted.length) {
        notices.push(`O limite é de ${MAX_IMAGES} imagens por projecto.`);
      }

      if (notices.length) {
        setImageNotice(notices.join(" "));
      }

      if (!accepted.length) return;

      const items: ImageItem[] = accepted.map((file) => ({
        id: makeId(),
        name: file.name,
        preview: URL.createObjectURL(file),
        path: null,
        status: "uploading",
      }));

      setImages((current) => [...current, ...items]);

      setCoverId((current) => current ?? items[0].id);

      // Um de cada vez: as Server Actions do Next.js são executadas em fila.
      for (let index = 0; index < items.length; index++) {
        await uploadOne(items[index], accepted[index]);
      }
    } catch (err) {
      setImageNotice(
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar as imagens.",
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* External image URL                                                       */
  /* ------------------------------------------------------------------------ */

  function addImageUrl() {
    const url = imageUrlInput.trim();

    if (!url) return;

    if (images.length >= MAX_IMAGES) {
      setImageNotice(`O limite é de ${MAX_IMAGES} imagens por projecto.`);
      return;
    }

    if (!url.startsWith("/") && !/^https?:\/\//i.test(url)) {
      setImageNotice("Introduza um URL válido ou um caminho iniciado por /.");
      return;
    }

    const item: ImageItem = {
      id: makeId(),
      name: url.split("/").pop() || "Imagem externa",
      preview: url,
      path: url,
      status: "done",
      external: true,
    };

    setImages((current) => [...current, item]);

    setCoverId((current) => current ?? item.id);

    setImageUrlInput("");
    setImageNotice("");
  }

  /* ------------------------------------------------------------------------ */
  /* Remove image                                                             */
  /* ------------------------------------------------------------------------ */

  async function removeImage(id: string) {
    const target = images.find((image) => image.id === id);

    if (!target) return;

    if (target.status === "uploading") return;

    if (
      target.status === "done" &&
      target.path &&
      !target.external
    ) {
      try {
        const result = await deletePortfolioImageAction(target.path);

        if (!result.success) {
          setImageNotice(result.error);
          return;
        }
      } catch (err) {
        setImageNotice(
          err instanceof Error
            ? err.message
            : "Não foi possível remover a imagem.",
        );
        return;
      }
    }

    if (target.preview.startsWith("blob:")) {
      URL.revokeObjectURL(target.preview);
    }

    setImages((current) =>
      current.filter((image) => image.id !== id),
    );

    if (coverId === id) {
      const remaining = images.filter(
        (image) => image.id !== id && image.status === "done",
      );

      setCoverId(remaining[0]?.id ?? null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Drag and drop                                                            */
  /* ------------------------------------------------------------------------ */

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length) {
      void addFiles(event.dataTransfer.files);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!values.name.trim()) {
      setError("O nome do projecto é obrigatório.");
      return;
    }

    if (!values.slug.trim()) {
      setError("O endereço do projecto é obrigatório.");
      return;
    }

    if (!values.category) {
      setError("Seleccione uma categoria.");
      return;
    }

    if (!values.speciality.length) {
      setError("Seleccione pelo menos uma especialidade.");
      return;
    }

    if (isUploading) {
      setError("Aguarde o fim do envio das imagens.");
      return;
    }

    if (images.some((image) => image.status === "error")) {
      setError("Remova as imagens com falha antes de continuar.");
      return;
    }

    const doneImages = images.filter(
      (image) => image.status === "done" && image.path,
    );

    const cover = doneImages.find(
      (image) => image.id === coverId,
    );

    const ordered = cover
      ? [
          cover,
          ...doneImages.filter((image) => image.id !== cover.id),
        ]
      : doneImages;

    const imagePaths = ordered.map(
      (image) => image.path as string,
    );

    const input: PortfolioProjectInput = {
      title: values.name.trim(),

      slug: generateSlug(values.slug),

      summary:
        values.description.trim().slice(0, 250) ||
        values.name.trim(),

      description: values.description.trim() || null,

      project_type: values.category,

      country: "Angola",

      speciality: values.speciality.join(", "),

      services: values.speciality,

      municipality: values.location.trim() || null,

      location_name: values.location.trim() || null,

      completion_date: values.year
        ? `${values.year}-12-31`
        : null,

      cover_image_path: imagePaths[0] ?? null,

      gallery_image_paths: imagePaths.slice(1),

      cover_image_alt: values.name.trim(),

      status: values.status,

      is_featured: values.featured,
    };

    startTransition(async () => {
      try {
        const result = await createPortfolioProjectAction(input);

        if (!result.success) {
          setError(result.error);
          return;
        }

        router.push("/management/projects");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível criar o projecto.",
        );
      }
    });
  }

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto w-full max-w-6xl pb-16">

      {/* Header */}

      <div className="mb-8">
        <Link
          href="/management/projects"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#002950]"
        >
          <span aria-hidden="true">←</span>
          Voltar ao portefólio
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-[#002950]">
          Adicionar projecto
        </h1>

        <p className="mt-2 max-w-xl text-sm text-gray-500">
          Preencha os dados do projecto e adicione as imagens.
          Pode guardar como rascunho e publicar mais tarde.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start"
      >

        {/* Main column */}

        <div className="space-y-6">

          {/* Project information */}

          <Card
            title="Informação do projecto"
            description="Dados principais apresentados no portefólio."
          >
            <div className="grid gap-5 sm:grid-cols-2">

              <Field
                label="Nome do projecto"
                htmlFor="name"
                required
                className="sm:col-span-2"
              >
                <input
                  id="name"
                  type="text"
                  required
                  maxLength={180}
                  value={values.name}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  placeholder="Ex.: Edifício Residencial Luanda"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Endereço do projecto"
                htmlFor="slug"
                required
                hint="Gerado a partir do nome. Pode editar."
                className="sm:col-span-2"
              >
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white transition focus-within:border-[#BD9655] focus-within:ring-4 focus-within:ring-[#BD9655]/10">
                  <span className="border-r border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-400">
                    /projects/
                  </span>

                  <input
                    id="slug"
                    type="text"
                    required
                    value={values.slug}
                    onChange={(event) =>
                      handleSlugChange(event.target.value)
                    }
                    placeholder="edificio-residencial-luanda"
                    className="min-w-0 flex-1 px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </Field>

              <Field
                label="Categoria"
                htmlFor="category"
                required
              >
                <select
                  id="category"
                  required
                  value={values.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Seleccione uma categoria</option>

                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Ano de conclusão"
                htmlFor="year"
              >
                <input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  value={values.year ?? ""}
                  onChange={(event) =>
                    updateField(
                      "year",
                      event.target.value
                        ? Number(event.target.value)
                        : null,
                    )
                  }
                  placeholder="Ex.: 2026"
                  className={inputClass}
                />
              </Field>

              {/* Specialties */}

              <div className="sm:col-span-2">
                <p
                  id="specialties-label"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Especialidades
                  <span className="ml-0.5 text-[#BD9655]">*</span>
                </p>

                <div
                  role="group"
                  aria-labelledby="specialties-label"
                  className="grid grid-cols-2 gap-3 md:grid-cols-4"
                >
                  {SPECIALTIES.map((speciality) => {
                    const active = values.speciality.includes(speciality);

                    return (
                      <button
                        key={speciality}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleSpecialty(speciality)}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] ${
                          active
                            ? "border-[#002950] bg-[#002950] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-[#BD9655]"
                        }`}
                      >
                        {speciality}

                        <span
                          aria-hidden="true"
                          className={`flex size-4 items-center justify-center rounded-full text-[10px] ${
                            active
                              ? "bg-[#BD9655] text-[#002950]"
                              : "border border-gray-300"
                          }`}
                        >
                          {active && "✓"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  Pode seleccionar mais do que uma.
                </p>
              </div>

              <Field
                label="Localização"
                htmlFor="location"
                className="sm:col-span-2"
              >
                <input
                  id="location"
                  type="text"
                  maxLength={180}
                  value={values.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  placeholder="Ex.: Talatona, Luanda - Angola"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Descrição"
                htmlFor="description"
                className="sm:col-span-2"
              >
                <textarea
                  id="description"
                  rows={5}
                  maxLength={5000}
                  value={values.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Descreva o projecto, os seus objectivos e as soluções implementadas..."
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {values.description.length}/5000
                </p>
              </Field>

            </div>
          </Card>

          {/* Images */}

          <Card
            title="Imagens"
            description={`Adicione até ${MAX_IMAGES} imagens. A imagem marcada como capa aparece primeiro.`}
          >
            <div className="space-y-5">

              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition focus-within:border-[#BD9655] focus-within:ring-4 focus-within:ring-[#BD9655]/10 ${
                  isDragging
                    ? "border-[#BD9655] bg-[#BD9655]/5"
                    : "border-gray-200 bg-gray-50/60 hover:border-[#BD9655]/60"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  className="sr-only"
                  onChange={(event) => {
                    const input = event.currentTarget;

                    if (input.files && input.files.length) {
                      // addFiles copia a lista de imediato, por isso é seguro limpar a seguir.
                      void addFiles(input.files);
                    }

                    input.value = "";
                  }}
                />

                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-full bg-[#002950] text-xl text-white"
                >
                  +
                </span>

                <span className="text-sm font-medium text-[#002950]">
                  Arraste as imagens para aqui ou clique para escolher
                </span>

                <span className="text-xs text-gray-500">
                  JPG, PNG, WebP ou AVIF · até 8 MB cada
                </span>
              </label>

              {/* URL */}

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(event) =>
                    setImageUrlInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addImageUrl();
                    }
                  }}
                  aria-label="Adicionar imagem por URL"
                  placeholder="Ou cole um URL / caminho: /images/projectos/edificio.jpg"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="shrink-0 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-[#002950] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>

              {imageNotice && (
                <p role="status" className="text-sm text-amber-700">
                  {imageNotice}
                </p>
              )}

              {/* Image grid */}

              {images.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {images.length} de {MAX_IMAGES} imagens
                      {isUploading && " · a enviar..."}
                    </span>
                  </div>

                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((image) => {
                      const isCover = image.id === coverId;

                      return (
                        <li
                          key={image.id}
                          className={`group relative aspect-[4/3] overflow-hidden rounded-xl border bg-gray-100 ${
                            isCover
                              ? "border-[#BD9655] ring-2 ring-[#BD9655]/30"
                              : "border-gray-200"
                          }`}
                        >
                          {image.status !== "error" && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image.preview}
                              alt={image.name}
                              className={`size-full object-cover transition ${
                                image.status === "uploading"
                                  ? "opacity-50"
                                  : ""
                              }`}
                            />
                          )}

                          {image.status === "uploading" && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[#002950]">
                              A enviar...
                            </span>
                          )}

                          {image.status === "error" && (
                            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50 p-3 text-center text-xs text-red-700">
                              Falha no envio

                              <span className="line-clamp-3 text-[11px] text-red-500">
                                {image.error}
                              </span>
                            </span>
                          )}

                          {isCover && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#BD9655] px-2.5 py-1 text-[11px] font-semibold text-[#002950]">
                              Capa
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => void removeImage(image.id)}
                            disabled={image.status === "uploading"}
                            aria-label={`Remover ${image.name}`}
                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-sm text-gray-700 shadow transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                          >
                            ×
                          </button>

                          {!isCover && image.status === "done" && (
                            <button
                              type="button"
                              onClick={() => setCoverId(image.id)}
                              className="absolute inset-x-2 bottom-2 rounded-md bg-white/95 px-2 py-1.5 text-xs font-medium text-[#002950] opacity-0 shadow transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
                            >
                              Definir como capa
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}

        <aside className="space-y-6 lg:sticky lg:top-6">

          {/* Preview */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,41,80,0.04)]">
            <div className="aspect-[4/3] bg-gray-100">
              {coverImage && coverImage.status !== "error" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage.preview}
                  alt="Capa do projecto"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-gray-400">
                  Sem imagem de capa
                </div>
              )}
            </div>

            <div className="space-y-3 p-5">
              <div>
                <p className="line-clamp-2 text-base font-semibold text-[#002950]">
                  {values.name || "Nome do projecto"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {[
                    values.category,
                    values.location,
                    values.year,
                  ]
                    .filter(Boolean)
                    .join(" · ") ||
                    "Categoria · Localização · Ano"}
                </p>
              </div>

              {values.speciality.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {values.speciality.map((speciality) => (
                    <li
                      key={speciality}
                      className="rounded-full bg-[#002950]/5 px-2.5 py-1 text-[11px] font-medium text-[#002950]"
                    >
                      {speciality}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Publication */}

          <Card title="Publicação">
            <div className="space-y-5">

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-800">
                  Estado
                </legend>

                <div className="space-y-2">
                  {STATUSES.map((status) => (
                    <label
                      key={status.value}
                      className="block cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={values.status === status.value}
                        onChange={() =>
                          updateField("status", status.value)
                        }
                        className="peer sr-only"
                      />

                      <span className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition peer-checked:border-[#002950] peer-checked:bg-[#002950]/[0.03] peer-focus-visible:ring-4 peer-focus-visible:ring-[#BD9655]/20">
                        <span>
                          <span className="block text-sm font-medium text-gray-800">
                            {status.label}
                          </span>

                          <span className="block text-xs text-gray-500">
                            {status.hint}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={`size-4 rounded-full border-2 ${
                            values.status === status.value
                              ? "border-[#002950] bg-[#BD9655]"
                              : "border-gray-300"
                          }`}
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    Destacar projecto
                  </span>

                  <span className="mt-0.5 block text-xs text-gray-500">
                    Mostra-o entre os projectos em destaque.
                  </span>
                </span>

                <span className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={values.featured}
                    onChange={(event) =>
                      updateField("featured", event.target.checked)
                    }
                    className="peer sr-only"
                  />

                  <span className="block h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-[#002950] peer-focus-visible:ring-4 peer-focus-visible:ring-[#BD9655]/30" />

                  <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
              </label>
            </div>
          </Card>

          {/* Feedback */}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="rounded-lg bg-[#002950] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "A guardar..."
                : isUploading
                  ? "A enviar imagens..."
                  : "Criar projecto"}
            </button>

            <Link
              href="/management/projects"
              className="rounded-lg border border-gray-200 px-6 py-3.5 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}