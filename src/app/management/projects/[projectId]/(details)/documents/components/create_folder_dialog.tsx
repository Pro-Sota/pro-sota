"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, FolderPlus, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { createClient } from "@/app/lib/supabase/client";

export type FolderRow = {
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
  folders: FolderRow[];
  parentFolderId?: string | null;
  onCreated?: (folder: FolderRow) => void;
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
  folders,
  parentFolderId = null,
  onCreated,
}: CreateFolderDialogProps) {
  const { projectId } = useParams<{ projectId: string }>();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedParentId, setSelectedParentId] =
    useState<string | null>(parentFolderId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (open) {
      setSelectedParentId(parentFolderId);
    }
  }, [parentFolderId, open]);

  const folderOptions = useMemo(() => {
    const projectFolders = folders.filter(
      (folder) => folder.project_id === projectId,
    );

    function getFolderPath(folder: FolderRow): string {
      const path = [folder.name];
      const visited = new Set<string>();

      let currentParentId = folder.parent_id;

      while (currentParentId) {
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

  const selectedParentPath = useMemo(() => {
    if (!selectedParentId) {
      return "Pasta principal";
    }

    return (
      folderOptions.find(
        (folder) => folder.folder_id === selectedParentId,
      )?.path ?? "Pasta principal"
    );
  }, [folderOptions, selectedParentId]);

  function openDialog() {
    setName("");
    setError("");
    setSelectedParentId(parentFolderId);
    setOpen(true);
  }

  function closeDialog() {
    if (loading) {
      return;
    }

    setOpen(false);
    setName("");
    setError("");
    setSelectedParentId(parentFolderId);
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
      setError(
        "O nome da pasta não pode ultrapassar 100 caracteres.",
      );
      return;
    }

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
      let sortQuery = supabase
        .from("folders")
        .select("sort_order")
        .eq("project_id", projectId)
        .order("sort_order", {
          ascending: false,
        })
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
        .select("*")
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

      const newFolder = data as FolderRow;

      onCreated?.(newFolder);

      closeDialog();
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
        aria-label={
          parentFolderId
            ? "Criar subpasta"
            : "Criar nova pasta"
        }
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[#BD9655] px-3 text-xs font-medium text-[#002950] transition hover:bg-[#002950] hover:text-white"
      >
        <FolderPlus className="h-3.5 w-3.5" />
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
                {selectedParentId
                  ? `Criar uma pasta dentro de ${selectedParentPath}.`
                  : "Criar uma nova pasta principal."}
              </p>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <label
                  htmlFor="folder-name"
                  className="mb-1.5 block text-sm font-medium text-[#002950]"
                >
                  Nome da pasta
                </label>

                <input
                  id="folder-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
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
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#002950] outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label
                  htmlFor="folder-parent"
                  className="mb-1.5 block text-sm font-medium text-[#002950]"
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
                      setError("");
                    }}
                    disabled={loading}
                    className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-[#002950] outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-50"
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

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#002950]" />
                </div>
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

            <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeDialog}
                disabled={loading}
                className="h-9 rounded-md px-4 text-sm font-medium text-[#002950] hover:bg-[#BD9655]/10 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={loading || !name.trim()}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#BD9655] px-4 text-sm font-medium text-[#002950] transition hover:bg-[#002950] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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