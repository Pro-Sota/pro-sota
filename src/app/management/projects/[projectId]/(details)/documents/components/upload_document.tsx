"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FilePlus,
  FileUp,
  Loader2,
  X,
  ChevronDown,
  Circle,
} from "lucide-react";
import { useParams } from "next/navigation";

import { createClient } from "@/app/lib/supabase/client";

type Folder = {
  folder_id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  type: string | null;
  sort_order: number | null;
  is_system: boolean | null;
  created_at: string | null;
  slug: string | null;
};

type Document = {
  document_id: string;
  project_id: string;
  folder_id: string;
  name: string;
};

type UploadMode = "new" | "version";

const DOCUMENTS_BUCKET = "documents";

type UploadDocumentProps = {
  projectId?: string;
  projects?:{
    project_id: string;
    project_name: string;
  }[];
  open?: boolean;
  onClose?: () => void;
};

export default function UploadDocument({
  projectId: providedProjectId,
  projects = [],
  open: controlledOpen,
  onClose,
}: UploadDocumentProps = {}) {
  const params = useParams();
  const routeProjectId =
    typeof params.projectId === "string" ? params.projectId : "";

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const projectId =
    providedProjectId || routeProjectId || selectedProjectId;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  function setOpen(value: boolean) {
    if (controlledOpen === undefined) {
      setInternalOpen(value);
    }

    if (!value) {
      onClose?.();
    }
  }

  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const [uploadMode, setUploadMode] = useState<UploadMode>("new");

  const [file, setFile] = useState<File | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);

   useEffect(() => {
    if (!open || !projectId) return;

    let cancelled = false;

    async function loadData() {
      setLoadingData(true);
      setError("");

      try {
        const [
          { data: folderData, error: folderError },
          { data: documentData, error: documentError },
        ] = await Promise.all([
          supabase
            .from("folders")
            .select("*")
            .eq("project_id", projectId)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          supabase
            .from("documents")
            .select("document_id, project_id, folder_id, name")
            .eq("project_id", projectId)
            .order("name", { ascending: true }),
        ]);

        if (cancelled) return;

        if (folderError) {
          throw new Error("Não foi possível carregar as pastas.");
        }

        if (documentError) {
          throw new Error("Não foi possível carregar os documentos.");
        }

        setFolders(folderData ?? []);
        setDocuments(documentData ?? []);
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os dados do projecto."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [open, projectId, supabase]);

  const folderOptions = useMemo(() => {
    function getFolderLabel(folder: Folder) {
      const parents: Folder[] = [];

      let currentParentId = folder.parent_id;

      while (currentParentId) {
        const parent = folders.find(
          (item) => item.folder_id === currentParentId
        );

        if (!parent) break;

        parents.unshift(parent);
        currentParentId = parent.parent_id;
      }

      return [...parents.map((parent) => parent.name), folder.name].join(
        " / "
      );
    }

    return folders
      .map((folder) => ({
        ...folder,
        label: getFolderLabel(folder),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [folders]);

  const availableDocuments = useMemo(() => {
    if (!selectedFolderId) {
      return [];
    }

    return documents
      .filter((document) => document.folder_id === selectedFolderId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [documents, selectedFolderId]);

  function resetForm() {
    setUploadMode("new");
    setSelectedFolderId("");
    setSelectedDocumentId("");
    setFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function closeDialog() {
    if (uploading) return;

    setOpen(false);
    resetForm();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setError("");
  }

  function handleFolderChange(folderId: string) {
    setSelectedFolderId(folderId);
    setSelectedDocumentId("");
    setError("");
  }

  function handleModeChange(mode: UploadMode) {
    setUploadMode(mode);
    setSelectedDocumentId("");
    setError("");
  }

  async function handleUpload() {
    if (!projectId) {
      setError("Não foi possível identificar o projecto.");
      return;
    }

    if (!file) {
      setError("Seleccione um documento.");
      return;
    }

    if (!selectedFolderId) {
      setError("Seleccione uma pasta.");
      return;
    }

    if (uploadMode === "version" && !selectedDocumentId) {
      setError("Seleccione o documento que pretende actualizar.");
      return;
    }

    setUploading(true);
    setError("");

    let uploadedPath: string | null = null;

    try {
      const originalName = file.name.trim();

      const safeName = originalName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

      const fileId = crypto.randomUUID();

      uploadedPath = `${projectId}/${selectedFolderId}/${fileId}-${safeName}`;

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "A sua sessão expirou. Inicie sessão novamente."
        );
      }

      /**
       * Upload the physical file first.
       */
      const { error: storageError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(uploadedPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        throw storageError;
      }

      /**
       * NEW DOCUMENT
       *
       * Create the logical document first, then create V1.
       */
      if (uploadMode === "new") {
        const { data: existingDocument, error: existingError } =
          await supabase
            .from("documents")
            .select("document_id")
            .eq("folder_id", selectedFolderId)
            .eq("name", originalName)
            .maybeSingle();

        if (existingError) {
          throw existingError;
        }

        if (existingDocument) {
          await supabase.storage
            .from(DOCUMENTS_BUCKET)
            .remove([uploadedPath]);

          throw new Error(
            "Já existe um documento com este nome nesta pasta. Seleccione 'Nova versão' para adicionar uma nova versão."
          );
        }

        const { data: document, error: documentError } =
          await supabase
            .from("documents")
            .insert({
              folder_id: selectedFolderId,
              project_id: projectId,
              name: originalName,
            })
            .select("document_id")
            .single();

        if (documentError) {
          throw documentError;
        }

        const { error: versionError } = await supabase
          .from("document_versions")
          .insert({
            document_id: document.document_id,
            version_number: 1,
            file_path: uploadedPath,
            uploaded_by: user.id,
          });

        if (versionError) {
          await supabase
            .from("documents")
            .delete()
            .eq("document_id", document.document_id);

          throw versionError;
        }
      }

      /**
       * NEW VERSION
       */
      if (uploadMode === "version") {
        const { data: latestVersion, error: latestVersionError } =
          await supabase
            .from("document_versions")
            .select("version_number")
            .eq("document_id", selectedDocumentId)
            .order("version_number", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (latestVersionError) {
          throw latestVersionError;
        }

        const nextVersion =
          (latestVersion?.version_number ?? 0) + 1;

        const { error: versionError } = await supabase
          .from("document_versions")
          .insert({
            document_id: selectedDocumentId,
            version_number: nextVersion,
            file_path: uploadedPath,
            uploaded_by: user.id,
          });

        if (versionError) {
          throw versionError;
        }
      }

      setOpen(false);
      resetForm();

      window.location.reload();
    } catch (err) {
      console.error("Upload document error:", err);

      if (uploadedPath) {
        await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .remove([uploadedPath]);
      }

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o documento."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {controlledOpen === undefined && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Carregar documento"
          className="flex cursor-pointer items-center gap-2 rounded-sm font-medium bg-[#BD9655] px-3 py-2 text-sm text-[#002950] transition hover:bg-[#Bd9655]/90"
        >
          <FilePlus className="h-4 w-4" />
          Carregar documento
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-document-title"
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2
                  id="upload-document-title"
                  className="text-base font-semibold text-[#002950]"
                >
                  Carregar documento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Adicione um documento ao arquivo do projecto.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={uploading}
                aria-label="Fechar"
                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
                {!providedProjectId && !routeProjectId && (
                <div>
                  <label
                    htmlFor="document-project"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Projecto
                  </label>

                  <select
                    id="document-project"
                    value={selectedProjectId}
                    disabled={uploading}
                    onChange={(event) => {
                      const nextProjectId = event.target.value;

                      setSelectedProjectId(nextProjectId);
                      setFolders([]);
                      setDocuments([]);
                      setLoadingData(Boolean(nextProjectId));
                      resetForm();
                    }}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#BD9655] disabled:opacity-50"
                  >
                    <option value="">Seleccione um projecto</option>

                    {projects.map((project) => (
                      <option
                        key={project.project_id}
                        value={project.project_id}
                      >
                        {project.project_name}
                      </option>
                    ))}
                  </select>

                  {projects.length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-600">
                      Não existem projectos disponíveis para carregamento.
                    </p>
                  )}
                </div>
              )}
              {/* Upload type */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Tipo de carregamento
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleModeChange("new")}
                    disabled={uploading}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                      uploadMode === "new"
                        ? "border-[#BD9655] bg-[#BD9655]/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Circle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        uploadMode === "new"
                          ? "fill-[#BD9655] text-[#BD9655]"
                          : "text-gray-300"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Novo documento
                      </p>

                      <p className="mt-0.5 text-xs leading-4 text-gray-500">
                        Criar um novo documento no projecto.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange("version")}
                    disabled={uploading}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                      uploadMode === "version"
                        ? "border-[#BD9655] bg-[#BD9655]/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Circle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        uploadMode === "version"
                          ? "fill-[#BD9655] text-[#BD9655]"
                          : "text-gray-300"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Nova versão
                      </p>

                      <p className="mt-0.5 text-xs leading-4 text-gray-500">
                        Adicionar uma nova versão existente.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Folder */}
              <div>
                <label
                  htmlFor="document-folder"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Pasta
                </label>

                <div className="relative">
                  <select
                    id="document-folder"
                    value={selectedFolderId}
                    onChange={(event) =>
                      handleFolderChange(event.target.value)
                    }
                    disabled={loadingData || uploading || !projectId}
                    className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="">
                      {loadingData
                        ? "A carregar..."
                        : "Seleccione uma pasta"}
                    </option>

                    {folderOptions.map((folder) => (
                      <option
                        key={folder.folder_id}
                        value={folder.folder_id}
                      >
                        {folder.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                {projectId &&!loadingData && folders.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    Crie uma pasta antes de carregar um documento.
                  </p>
                )}
              </div>

              {/* Existing document */}
              {uploadMode === "version" && (
                <div>
                  <label
                    htmlFor="existing-document"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Documento existente
                  </label>

                  <div className="relative">
                    <select
                      id="existing-document"
                      value={selectedDocumentId}
                      onChange={(event) => {
                        setSelectedDocumentId(event.target.value);
                        setError("");
                      }}
                      disabled={
                        loadingData ||
                        uploading ||
                        !selectedFolderId
                      }
                      className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                    >
                      <option value="">
                        {!selectedFolderId
                          ? "Seleccione primeiro uma pasta"
                          : availableDocuments.length === 0
                            ? "Não existem documentos nesta pasta"
                            : "Seleccione um documento"}
                      </option>

                      {availableDocuments.map((document) => (
                        <option
                          key={document.document_id}
                          value={document.document_id}
                        >
                          {document.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-500">
                    A nova versão será adicionada ao histórico deste
                    documento.
                  </p>
                </div>
              )}

              {/* File */}
              <div>
                <label
                  htmlFor="document-file"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {uploadMode === "version"
                    ? "Ficheiro da nova versão"
                    : "Documento"}
                </label>

                <input
                  ref={fileInputRef}
                  id="document-file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-4 text-left transition hover:border-[#BD9655] hover:bg-[#BD9655]/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
                    <FileUp className="h-5 w-5 text-gray-500" />
                  </div>

                  <div className="min-w-0">
                    {file ? (
                      <>
                        <p className="truncate text-sm font-medium text-gray-900">
                          {file.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700">
                          Seleccionar ficheiro
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Clique para seleccionar um ficheiro
                        </p>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeDialog}
                disabled={uploading}
                className="h-9 rounded-md px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={
                  uploading ||
                  loadingData ||
                  !projectId || !file ||
                  !selectedFolderId ||
                  (uploadMode === "version" && !selectedDocumentId)
                }
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#002950] px-4 text-sm font-medium text-white transition hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {uploading
                  ? "A carregar..."
                  : uploadMode === "version"
                    ? "Carregar nova versão"
                    : "Carregar documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
