
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import defaultProjects from "./components/portfolioData";
import "./admin.css";

type PortfolioProject = {
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

type LoadState = "loading" | "ready" | "error";

const emptyForm: ProjectForm = {
  name: "",
  category: "Construção",
  year: "",
  location: "",
  summary: "",
  description: "",
};

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

  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.category === "string" &&
    typeof project.year === "string" &&
    typeof project.location === "string" &&
    typeof project.summary === "string" &&
    typeof project.description === "string" &&
    Array.isArray(project.images) &&
    project.images.every((image) => typeof image === "string")
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [gateError, setGateError] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const [savedFlash, setSavedFlash] = useState(false);
  const [editingId, setEditingId] = useState<string | null | undefined>(
    undefined
  );
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [images, setImages] = useState<string[]>([]);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // sessionStorage só é lido no browser, nunca durante a renderização no servidor.
  useEffect(() => {
    setUnlocked(
      Boolean(sessionStorage.getItem("prosota_admin_password"))
    );
  }, []);

  // Limpeza do temporizador quando a página é desmontada.
  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  // Carrega e valida os dados publicados pela API.
  const loadProjects = useCallback(async (signal?: AbortSignal) => {
    setLoadState("loading");

    try {
      const response = await fetch("/api/projects", { signal });

      if (!response.ok) {
        throw new Error("Falha ao carregar o portefólio.");
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data) || !data.every(isPortfolioProject)) {
        throw new Error("Dados inválidos.");
      }

      if (signal?.aborted) return;

      setProjects(data);
      setLoadState("ready");
    } catch {
      if (!signal?.aborted) setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadProjects(controller.signal);

    return () => controller.abort();
  }, [loadProjects]);

  // Publica a lista completa. A API valida a autorização no servidor.
  async function persist(next: PortfolioProject[]): Promise<boolean> {
    if (loadState !== "ready" || savingRef.current) return false;

    savingRef.current = true;
    setSaving(true);
    setSavedFlash(false);
    setSaveError("");

    try {
      const password = sessionStorage.getItem("prosota_admin_password");

      if (!password) {
        setSaveError("A sessão expirou. Entre novamente.");
        setUnlocked(false);
        return false;
      }

      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(next),
      });

      if (!response.ok) {
        setSaveError(
          "Não foi possível publicar as alterações. Verifique a palavra-passe e o servidor."
        );
        return false;
      }

      setProjects(next);
      setSavedFlash(true);

      if (flashTimer.current) clearTimeout(flashTimer.current);

      flashTimer.current = setTimeout(() => {
        setSavedFlash(false);
      }, 1800);

      return true;
    } catch {
      setSaveError(
        "Não foi possível confirmar a gravação. Verifique a ligação e tente novamente."
      );
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  // Valida a palavra-passe na API antes de abrir o painel.
  async function handleGateSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setGateError(false);

    try {
      const response = await fetch("/api/admin/check", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${passInput}`,
        },
      });

      if (!response.ok) throw new Error("Acesso recusado.");

      sessionStorage.setItem("prosota_admin_password", passInput);
      setPassInput("");
      setUnlocked(true);
    } catch {
      setGateError(true);
      setPassInput("");
    }
  }

  function logout() {
    sessionStorage.removeItem("prosota_admin_password");
    setUnlocked(false);
    setPassInput("");
    setGateError(false);
    setSaveError("");
  }

  // null = novo projecto; undefined = editor fechado.
  function openEditor(project: PortfolioProject | null) {
    setSaveError("");

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

  function closeEditor() {
    if (!savingRef.current) setEditingId(undefined);
  }

  // Reordena os projectos e publica a nova ordem.
  function move(index: number, direction: number) {
    const next = [...projects];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    void persist(next);
  }

  // Reordena as imagens apenas no rascunho.
  function moveImage(index: number, direction: number) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;

      if (target < 0 || target >= next.length) return current;

      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function addImageUrl(url: string) {
    const value = url.trim();

    if (!value) return;

    setImages((current) => [...current, value]);
  }

  // Lê imagens como data URLs. Para produção, recomenda-se Supabase Storage.
  function addImageFiles(fileList: FileList | null) {
    if (!fileList) return;

    const files = Array.from(fileList);

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImages((current) => [...current, reader.result as string]);
        }
      };

      reader.onerror = () => {
        setSaveError(`Não foi possível ler o ficheiro ${file.name}.`);
      };

      reader.readAsDataURL(file);
    }
  }

  async function saveProject() {
    if (!form.name.trim()) {
      window.alert("Dê um nome ao projecto.");
      return;
    }

    if (!images.length) {
      window.alert("Adicione pelo menos uma fotografia.");
      return;
    }

    if (editingId) {
      const next = projects.map((project) =>
        project.id === editingId
          ? {
              ...project,
              ...form,
              name: form.name.trim(),
              images: [...images],
            }
          : project
      );

      if (!(await persist(next))) return;
    } else {
      let id = slugify(form.name);
      let counter = 1;

      while (projects.some((project) => project.id === id)) {
        id = `${slugify(form.name)}-${++counter}`;
      }

      const newProject: PortfolioProject = {
        id,
        ...form,
        name: form.name.trim(),
        images: [...images],
      };

      if (!(await persist([...projects, newProject]))) return;
    }

    closeEditor();
  }

  async function deleteProject() {
    if (!editingId) return;

    if (!window.confirm("Eliminar este projecto do portefólio?")) return;

    const next = projects.filter((project) => project.id !== editingId);

    if (!(await persist(next))) return;

    closeEditor();
  }

  function resetDefaults() {
    if (
      !window.confirm(
        "Repor os dados de fábrica? Isto substitui o portefólio publicado no site."
      )
    ) {
      return;
    }

    const defaults = JSON.parse(
      JSON.stringify(defaultProjects)
    ) as PortfolioProject[];

    if (!defaults.every(isPortfolioProject)) {
      setSaveError("Os dados predefinidos têm um formato inválido.");
      return;
    }

    void persist(defaults);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "projects.json";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  const isEditorOpen = editingId !== undefined;

  if (!unlocked) {
    return (
      <div className="gate">
        <div className="gate__box">
          <img
            src="/assets/logo/logo-vertical.png"
            alt="PRO SOTA"
            className="gate__logo"
          />

          <h1>
            Painel do <span>Portefólio</span>
          </h1>

          <p>
            Acesso reservado à equipa PRO SOTA. Introduza a palavra-passe
            para continuar.
          </p>

          <form onSubmit={handleGateSubmit}>
            <input
              type="password"
              placeholder="Palavra-passe"
              autoComplete="current-password"
              required
              value={passInput}
              onChange={(event) => {
                setPassInput(event.target.value);
                setGateError(false);
              }}
            />

            <button type="submit">Entrar</button>
          </form>

          <p
            className={`gate__error${gateError ? " is-visible" : ""}`}
            role={gateError ? "alert" : undefined}
          >
            Palavra-passe incorrecta. Tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <div className="admin">
        <header className="admin__bar">
          <Link href="/" className="nav__logo">
            <img
              src="/assets/logo/logo-horizontal.png"
              alt="PRO SOTA"
            />
          </Link>

          <div className="admin__bar-title">
            <strong>Painel do Portefólio</strong>
            <span>Adicionar, editar e reordenar projectos</span>
          </div>

          <div className="admin__bar-actions">
            <Link
              href="/portfolio"
              target="_blank"
              rel="noreferrer"
              className="admin__btn admin__btn--ghost"
            >
              Ver site ↗
            </Link>

            <button
              type="button"
              className="admin__btn admin__btn--ghost"
              onClick={logout}
            >
              Sair
            </button>
          </div>
        </header>

        {loadState === "loading" && (
          <p role="status">A carregar o portefólio…</p>
        )}

        {loadState === "error" && (
          <div role="alert">
            <p>
              Não foi possível carregar o portefólio. Carregue os dados
              antes de fazer alterações.
            </p>

            <button
              type="button"
              className="admin__btn"
              onClick={() => void loadProjects()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <fieldset
          disabled={loadState !== "ready" || saving}
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            minWidth: 0,
          }}
        >
          <div className="admin__toolbar">
            <button
              type="button"
              className="admin__btn admin__btn--primary"
              onClick={() => openEditor(null)}
            >
              + Adicionar projecto
            </button>

            <button
              type="button"
              className="admin__btn"
              onClick={exportData}
            >
              ⬇ Exportar cópia de segurança
            </button>

            <button
              type="button"
              className="admin__btn admin__btn--danger"
              onClick={resetDefaults}
            >
              Repor predefinições
            </button>

            <span
              className={`admin__saved${savedFlash ? " is-visible" : ""}`}
              role="status"
            >
              Publicado no site ✓
            </span>

            {saveError && <span role="alert">{saveError}</span>}
          </div>

          <div className="admin__list">
            {loadState === "ready" && projects.length === 0 && (
              <div className="admin__empty">
                Ainda não há projectos. Clique em &quot;Adicionar
                projecto&quot; para começar.
              </div>
            )}

            {projects.map((project, index) => (
              <div className="admin__card" key={project.id}>
                <img src={project.images[0]} alt="" />

                <div className="admin__card-info">
                  <b>{project.name}</b>
                  <span>
                    {project.category} · {project.year} ·{" "}
                    {project.images.length} foto(s)
                  </span>
                </div>

                <div className="admin__card-actions">
                  <button
                    type="button"
                    className="admin__icon-btn"
                    title="Mover para cima"
                    aria-label={`Mover ${project.name} para cima`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    className="admin__icon-btn"
                    title="Mover para baixo"
                    aria-label={`Mover ${project.name} para baixo`}
                    disabled={index === projects.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className="admin__icon-btn"
                    title="Editar"
                    aria-label={`Editar ${project.name}`}
                    onClick={() => openEditor(project)}
                  >
                    ✎
                  </button>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {isEditorOpen && (
        <div className="editor is-open">
          <div
            className="editor__backdrop"
            onClick={closeEditor}
          />

          <div
            className="editor__box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
          >
            <button
              type="button"
              className="lightbox__close"
              aria-label="Fechar"
              onClick={closeEditor}
            >
              &times;
            </button>

            <h2 id="editor-title">
              {editingId ? "Editar projecto" : "Novo projecto"}
            </h2>

            {saveError && <p role="alert">{saveError}</p>}

            <fieldset
              disabled={saving}
              style={{
                border: 0,
                padding: 0,
                margin: 0,
                minWidth: 0,
              }}
            >
              <div className="editor__grid">
                <div>
                  <label htmlFor="project-name">
                    Nome do projecto
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Ex: Hotel Golden Park"
                  />

                  <div className="editor__row2">
                    <div>
                      <label htmlFor="project-category">Categoria</label>
                      <select
                        id="project-category"
                        value={form.category}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            category: event.target.value,
                          })
                        }
                      >
                        <option>Arquitectura</option>
                        <option>Engenharia</option>
                        <option>Construção</option>
                        <option>Fiscalização</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="project-year">Ano</label>
                      <input
                        id="project-year"
                        type="text"
                        value={form.year}
                        onChange={(event) =>
                          setForm({ ...form, year: event.target.value })
                        }
                        placeholder="2026"
                      />
                    </div>
                  </div>

                  <label htmlFor="project-location">Localização</label>
                  <input
                    id="project-location"
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      setForm({ ...form, location: event.target.value })
                    }
                    placeholder="Ex: Luanda"
                  />

                  <label htmlFor="project-summary">
                    Frase curta (aparece no cartão)
                  </label>
                  <input
                    id="project-summary"
                    type="text"
                    value={form.summary}
                    onChange={(event) =>
                      setForm({ ...form, summary: event.target.value })
                    }
                    placeholder="Ex: Campus completo, 36 salas"
                  />

                  <label htmlFor="project-description">
                    Descrição completa (aparece na galeria)
                  </label>
                  <textarea
                    id="project-description"
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Descreva o projecto..."
                  />
                </div>

                <div>
                  <label>Fotografias do projecto</label>

                  <div className="editor__images">
                    {images.length === 0 && (
                      <p className="editor__hint">
                        Sem imagens ainda — adicione pelo menos uma abaixo.
                      </p>
                    )}

                    {images.map((src, index) => (
                      <div className="editor__img-row" key={index}>
                        <img src={src} alt="" />

                        <span>
                          {src.length > 60 && src.includes("base64")
                            ? "[imagem carregada do computador]"
                            : src}
                        </span>

                        <button
                          type="button"
                          className="admin__icon-btn"
                          aria-label="Mover imagem para cima"
                          disabled={index === 0}
                          onClick={() => moveImage(index, -1)}
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className="admin__icon-btn"
                          aria-label="Mover imagem para baixo"
                          disabled={index === images.length - 1}
                          onClick={() => moveImage(index, 1)}
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className="admin__icon-btn"
                          aria-label="Remover imagem"
                          onClick={() => removeImage(index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>

                  <ImageUrlAdder onAdd={addImageUrl} />

                  <div className="editor__addimg">
                    <label className="admin__btn admin__btn--ghost editor__upload">
                      Carregar ficheiro do computador
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(event) => {
                          addImageFiles(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="editor__footer">
                {editingId && (
                  <button
                    type="button"
                    className="admin__btn admin__btn--danger"
                    style={{ marginRight: "auto" }}
                    onClick={() => void deleteProject()}
                  >
                    Eliminar projecto
                  </button>
                )}

                <button
                  type="button"
                  className="admin__btn admin__btn--ghost"
                  onClick={closeEditor}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="admin__btn admin__btn--primary"
                  onClick={() => void saveProject()}
                >
                  {saving ? "A guardar…" : "Guardar projecto"}
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageUrlAdder({
  onAdd,
}: {
  onAdd: (url: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="editor__addimg">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Caminho ou URL da imagem (ex: /assets/img/projeto-1.jpg)"
        aria-label="Caminho ou URL da imagem"
      />

      <button
        type="button"
        className="admin__btn"
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
      >
        Adicionar
      </button>
    </div>
  );
}
