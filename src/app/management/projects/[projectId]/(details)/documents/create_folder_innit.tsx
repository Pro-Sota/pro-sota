"use client";

import { createClient } from "@/app/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CreateFolderDialog, {
  type FolderRow,
} from "./components/create_folder_dialog";
import FolderTree from "./components/folder_tree";

export function ProjectFolderPage() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadFolders() {
      if (!projectId) {
        setFolders([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", {
          ascending: true,
        });

      if (error) {
        console.error("Failed to load folders:", error);
        setFolders([]);
        setLoading(false);
        return;
      }

      setFolders((data ?? []) as FolderRow[]);
      setLoading(false);
    }

    loadFolders();
  }, [projectId, supabase]);

  function handleFolderCreated(newFolder: FolderRow) {
    setFolders((current) => {
      if (
        current.some(
          (folder) =>
            folder.folder_id === newFolder.folder_id,
        )
      ) {
        return current;
      }

      return [...current, newFolder];
    });
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">
          A carregar pastas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002950]">
            Pastas do Projecto
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organize os documentos do projecto por pastas.
          </p>
        </div>

        <CreateFolderDialog
          folders={folders}
          parentFolderId={null}
          onCreated={handleFolderCreated}
        />
      </div>

      {/* Folder tree */}
      <FolderTree
        folders={folders}
        onFoldersChange={setFolders}
      />
    </div>
  );
}