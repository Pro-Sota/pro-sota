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
    if (newView === view) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function handleFolderCreated() {
    if (onChanged) {
      onChanged();
      return;
    }

    router.refresh();
  }

  const buttonClass = [
    "inline-flex h-9 shrink-0 items-center justify-center gap-2",
    "rounded-md border px-3",
    "text-sm font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[#002950] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" ");

  return (
    <div className="flex min-h-[60px] items-center justify-between gap-3 bg-white px-3 sm:px-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <CreateFolderDialog
          folders={folders}
          parentFolderId={null}
          onCreated={handleFolderCreated}
        />

        <UploadDocument projectId={projectId} />
      </div>

      <div
        role="group"
        aria-label="Modo de visualização"
        className="flex h-10 shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1"
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
              title={`Vista de ${label.toLowerCase()}`}
              className={[
                "inline-flex h-8 shrink-0 items-center justify-center gap-2",
                "rounded-md px-2.5 sm:px-3",
                "text-sm font-medium",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[#002950] focus-visible:ring-inset",
                active
                  ? "bg-[#BD9655] text-[#002950] shadow-sm"
                  : "text-gray-600 hover:bg-gray-200/70 hover:text-[#002950]",
              ].join(" ")}
            >
              <Icon
                aria-hidden="true"
                className="h-4 w-4 shrink-0"
                strokeWidth={2}
              />

              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}