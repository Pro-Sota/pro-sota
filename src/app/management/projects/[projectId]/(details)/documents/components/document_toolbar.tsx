import { Grid, List } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import CreateFolderDialog from "./create_folder_dialog";

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
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="sticky top-0 z-10 h-[60px] gap-2 flex items-center justify-between border-b bg-white p-4">
      <CreateFolderDialog />

      <div className="flex gap-2">
        {viewOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setView(value)}
            aria-label={`Switch to ${label} view`}
            className={`flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition ${view === value
                ? "bg-slate-500 text-white hover:bg-slate-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}