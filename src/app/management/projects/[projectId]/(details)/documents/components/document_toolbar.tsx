"use client";

import { Grid, List } from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import CreateFolderDialog from "./create_folder_dialog";
import UploadDocument from "./upload_document";

import type { Database } from "@/app/lib/supabase/models";
import { useState, useEffect } from "react";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

const viewOptions = [
  { value: "list", label: "Lista", icon: List },
  { value: "grid", label: "Grelha", icon: Grid },
] as const;

interface DocumentToolbarProps {
  folders: Folder[];
  view: "list" | "grid";
  projectId: string;
  onChanged?: () => void;
}

export default function DocumentToolbar({
  folders,
  view,
  projectId,
  onChanged,
}: DocumentToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setView(newView: "grid" | "list") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

const [uploadOpen, setUploadOpen] = useState(false);

useEffect(() => {
  function handleOpenUpload() {
    setUploadOpen(true);
  }

  window.addEventListener(
    "pro-sota:open-document-upload",
    handleOpenUpload,
  );

  return () => {
    window.removeEventListener(
      "pro-sota:open-document-upload",
      handleOpenUpload,
    );
  };
}, []);


  return (
    <div className="flex min-h-[60px] items-center justify-between gap-2 bg-white px-2 sm:px-4">
      <div className="flex items-center gap-2">
        <CreateFolderDialog
          folders={folders}
          parentFolderId={null}
          onCreated={() => {
            onChanged?.();
            router.refresh();
          }}
        />

        <UploadDocument projectId={projectId} />
      </div>

      <div
        aria-label="Modo de visualização"
        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1"
      >
        {viewOptions.map(({ value, label, icon: Icon }) => {
          const active = view === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-label={`Mudar para vista de ${label.toLowerCase()}`}
              aria-pressed={active}
              className={[
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5",
                "text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-1",
                active
                  ? "bg-[#BD9655] text-[#002950] shadow-sm"
                  : "text-[#002950] hover:bg-[#BD9655]/20",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}