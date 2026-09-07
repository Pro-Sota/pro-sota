import { Database } from "@/app/lib/supabase/models";
import DocumentSidebar from "./document_side_bar";
import { X } from "lucide-react";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
interface MobileViewProps {
  projectId: string;
  view: "grid" | "list";
  folders: Folder[];
  setSidebarOpen: (open: boolean) => void;
}

export default function MobileView({
  projectId,
  view,
  folders,
  setSidebarOpen,
}: MobileViewProps) {
  return (
    <div className="lg:hidden">
      <div
        role="button"
        tabIndex={-1}
        aria-label="Close sidebar"
        className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-[1px]"
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setSidebarOpen(false);
          }
        }}
      />

      {/* Drawer */}

      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl">
        {/* Drawer Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Documentos do projecto
            </p>

            <p className="text-xs text-gray-500">Procurar pastas</p>
          </div>
          
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <DocumentSidebar
            projectId={projectId}
            view={view}
            folders={folders}
          />
        </div>
      </aside>
    </div>
  );
}
