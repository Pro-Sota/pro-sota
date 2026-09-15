"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  Folder,
  FolderPlus,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";

import { createClient } from "@/app/lib/supabase/client";

type FolderRow = {
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

type CreateFolderDialogProps = {
  folders?: FolderRow[];
  parentFolderId?: string | null;
  onCreated?: (folder: FolderRow) => void;
  onFoldersChange?: (folders: FolderRow[]) => void;
};

function createSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateFolderDialog({
  folders = [],
  parentFolderId = null,
  onCreated,
  onFoldersChange,
}: CreateFolderDialogProps) {
  const { projectId } = useParams<{ projectId: string }>();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedParentId, setSelectedParentId] =
    useState<string | null>(parentFolderId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  // Update selectedParentId when parentFolderId prop changes
  useEffect(() => {
    if (open) {
      setSelectedParentId(parentFolderId);
    }
  }, [parentFolderId, open]);

  /*
   * Build the complete hierarchy path for every folder.
   *
   * Example:
   *
   * Arquitectura
   * Arquitectura / Plantas
   * Arquitectura / Plantas / Piso 1
   * Construção
   * Construção / Orçamento
   */
  const folderOptions = useMemo(() => {
    const projectFolders = folders.filter(
      (folder) => folder.project_id === projectId,
    );

    function getFolderPath(folder: FolderRow): string {
      const path: string[] = [folder.name];
      const visited = new Set<string>();

      let currentParentId = folder.parent_id;

      while (currentParentId) {
        // Protect against malformed/cyclic folder relationships.
        if (visited.has(currentParentId)) {
          break;
        }

        visited.add(currentParentId);

        const parent = projectFolders.find(
          (item) => item.folder_id === currentParentId,
        );

        if (!parent) {
          break;
        }

        path.unshift(parent.name);
        currentParentId = parent.parent_id;
      }

      return path.join(" / ");
    }

    return projectFolders
      .map((folder) => ({
        ...folder,
        path: getFolderPath(folder),
      }))
      .sort((a, b) =>
        a.path.localeCompare(b.path, "pt", {
          sensitivity: "base",
        }),
      );
  }, [folders, projectId]);

  const selectedParent = useMemo(() => {
    if (!selectedParentId) {
      return null;
    }

    return (
      folders.find(
        (folder) =>
          folder.folder_id === selectedParentId &&
          folder.project_id === projectId,
      ) ?? null
    );
  }, [folders, selectedParentId, projectId]);

  const selectedParentPath = useMemo(() => {
    if (!selectedParentId) {
      return "Pasta principal";
    }

    return (
      folderOptions.find(
        (folder) => folder.folder_id === selectedParentId,
      )?.path ??
      selectedParent?.name ??
      "Pasta principal"
    );
  }, [folderOptions, selectedParent, selectedParentId]);

  function resetForm() {
    setName("");
    setSelectedParentId(parentFolderId);
    setError("");
  }

  function openDialog() {
    setSelectedParentId(parentFolderId);
    setName("");
    setError("");
    setOpen(true);
  }

  function closeDialog() {
    if (loading) {
      return;
    }

    setOpen(false);
    resetForm();
  }

  async function handleCreateFolder() {
    const trimmedName = name.trim();

    if (!projectId) {
      setError("Não foi possível identificar o projecto.");
      return;
    }

    if (!trimmedName) {
      setError("Introduza o nome da pasta.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("O nome da pasta não pode ultrapassar 100 caracteres.");
      return;
    }

    /*
     * Check duplicates only inside the selected parent.
     *
     * This allows:
     *
     * Arquitectura / Plantas
     * Construção / Plantas
     *
     * because they have different parent_id values.
     */
    const duplicate = folders.some(
      (folder) =>
        folder.project_id === projectId &&
        (folder.parent_id ?? null) === selectedParentId &&
        folder.name.trim().toLowerCase() ===
          trimmedName.toLowerCase(),
    );

    if (duplicate) {
      setError(
        "Já existe uma pasta com este nome dentro desta pasta.",
      );
      return;
    }

    const slug = createSlug(trimmedName);

    if (!slug) {
      setError("Introduza um nome de pasta válido.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
       * Get the next sort order only from siblings
       * inside the selected parent.
       */
      let sortQuery = supabase
        .from("folders")
        .select("sort_order")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: false })
        .limit(1);

      if (selectedParentId) {
        sortQuery = sortQuery.eq(
          "parent_id",
          selectedParentId,
        );
      } else {
        sortQuery = sortQuery.is("parent_id", null);
      }

      const {
        data: siblings,
        error: siblingsError,
      } = await sortQuery;

      if (siblingsError) {
        throw siblingsError;
      }

      const nextSortOrder =
        siblings && siblings.length > 0
          ? (siblings[0].sort_order ?? 0) + 1
          : 0;

      const { data, error: insertError } = await supabase
        .from("folders")
        .insert({
          project_id: projectId,
          parent_id: selectedParentId,
          name: trimmedName,
          type: "folder",
          sort_order: nextSortOrder,
          is_system: false,
          slug,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          setError(
            "Já existe uma pasta com este nome dentro desta pasta.",
          );
          return;
        }

        throw insertError;
      }

      if (!data) {
        throw new Error(
          "A pasta foi criada, mas não foi possível obter os seus dados.",
        );
      }

      // Add new folder to the list so it's available immediately
      const updatedFolders = [...folders, data];
      onFoldersChange?.(updatedFolders);
      onCreated?.(data);

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Create folder error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a pasta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Criar nova pasta"
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#BD9655] px-3 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
      >
        <FolderPlus className="h-4 w-4" />
        Nova pasta
      </button>

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
            aria-labelledby="create-folder-title"
            className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <h2
                id="create-folder-title"
                className="text-base font-semibold text-[#002950]"
              >
                Nova pasta
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Organize os documentos do projecto criando uma nova
                pasta.
              </p>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Folder name */}
              <div>
                <label
                  htmlFor="folder-name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Nome da pasta
                </label>

                <input
                  id="folder-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !loading) {
                      event.preventDefault();
                      handleCreateFolder();
                    }
                  }}
                  placeholder="Ex.: Plantas"
                  maxLength={100}
                  autoFocus
                  disabled={loading}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              {/* Parent folder */}
              <div>
                <label
                  htmlFor="folder-parent"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Dentro de
                </label>

                <div className="relative">
                  <select
                    id="folder-parent"
                    value={selectedParentId ?? ""}
                    onChange={(event) => {
                      setSelectedParentId(
                        event.target.value || null,
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    disabled={loading}
                    className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="">
                      Pasta principal
                    </option>

                    {folderOptions.map((folder) => (
                      <option
                        key={folder.folder_id}
                        value={folder.folder_id}
                      >
                        {folder.path}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Selected location */}
                <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                  <Folder className="h-4 w-4 shrink-0 text-[#BD9655]" />

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Localização
                    </p>

                    <p className="truncate text-sm text-[#002950]">
                      {selectedParentPath}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
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
                disabled={loading}
                className="h-9 rounded-md px-4 text-sm font-medium text-[#BD9655] transition hover:bg-[#002950]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={loading || !name.trim()}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#BD9655] px-4 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading ? "A criar..." : "Criar pasta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * ============================================================================
 * EXAMPLE PARENT COMPONENT - How to use CreateFolderDialog correctly
 * ============================================================================
 */

type FolderTreeNodeProps = {
  folder: FolderRow;
  folders: FolderRow[];
  onFoldersChange: (folders: FolderRow[]) => void;
};

function FolderTreeNode({
  folder,
  folders,
  onFoldersChange,
}: FolderTreeNodeProps) {
  const [expanded, setExpanded] = useState(false);

  const childFolders = folders.filter(
    (f) => f.parent_id === folder.folder_id,
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-2 py-1">
        {childFolders.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-gray-100 rounded"
          >
            <ChevronDown
              className={`h-4 w-4 transition ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </button>
        )}

        {childFolders.length === 0 && (
          <div className="w-5" />
        )}

        <Folder className="h-4 w-4 text-[#BD9655]" />
        <span className="text-sm">{folder.name}</span>

        {/* Create subfolder button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="ml-auto text-xs text-[#BD9655] hover:text-[#002950]"
        >
          {/* Use CreateFolderDialog with this folder as parent */}
          <CreateFolderDialog
            folders={folders}
            parentFolderId={folder.folder_id}
            onFoldersChange={onFoldersChange}
          />
        </button>
      </div>

      {expanded && childFolders.length > 0 && (
        <div className="ml-4 space-y-1">
          {childFolders.map((childFolder) => (
            <FolderTreeNode
              key={childFolder.folder_id}
              folder={childFolder}
              folders={folders}
              onFoldersChange={onFoldersChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectFolderPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Fetch all folders on mount
  useEffect(() => {
    const fetchFolders = async () => {
      if (!projectId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("folders")
          .select("*")
          .eq("project_id", projectId)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        setFolders(data || []);
      } catch (err) {
        console.error("Failed to fetch folders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [projectId, supabase]);

  const rootFolders = useMemo(() => {
    return folders.filter((folder) => folder.parent_id === null);
  }, [folders]);

  if (loading) {
    return <div className="p-8">A carregador pastas...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#002950]">
          Pastas do Projecto
        </h1>
        {/* Create root folder button */}
        <CreateFolderDialog
          folders={folders}
          parentFolderId={null}
          onFoldersChange={setFolders}
        />
      </div>

      <div className="space-y-2">
        {rootFolders.length === 0 ? (
          <p className="text-gray-500">
            Nenhuma pasta criada ainda. Crie a primeira pasta para começar.
          </p>
        ) : (
          rootFolders.map((folder) => (
            <FolderTreeNode
              key={folder.folder_id}
              folder={folder}
              folders={folders}
              onFoldersChange={setFolders}
            />
          ))
        )}
      </div>
    </div>
  );
}