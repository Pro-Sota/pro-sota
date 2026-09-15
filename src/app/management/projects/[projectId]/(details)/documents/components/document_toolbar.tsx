import { Grid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CreateFolderDialog from "./create_folder_dialog";
import UploadDocument from "./upload_document";

const viewOptions = [
  { value: "list", label: "List", icon: List },
  { value: "grid", label: "Grid", icon: Grid },
] as const;

export default function DocumentToolbar({
  view,
}: {
  view: "list" | "grid";
}) {
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

  return (
    <div className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-2 border-b bg-white px-4">
      <div className="flex items-center gap-2">
        <CreateFolderDialog />
        <UploadDocument />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {viewOptions.map(({ value, label, icon: Icon }) => {
          const isActive = view === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-label={`Switch to ${label} view`}
              aria-pressed={isActive}
              className={[
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5",
                "text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2",
                "focus-visible:ring-[#002950] focus-visible:ring-offset-1",

                isActive
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