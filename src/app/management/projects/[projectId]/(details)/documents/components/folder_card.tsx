import Link from "next/link";
import { Folder, ArrowUpRight } from "lucide-react";
import { capitalize } from "@/app/lib/library";

import { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface FolderCardProps {
  folder: Folder;
  view: string;
}

export default function FolderCard({
  folder,
  view,
}: FolderCardProps) {
  return (
    <Link
      href={`/management/projects/${folder.project_id}/documents/folder/${folder.name}?view=${view}`}
      className="group flex h-full min-h-[210px] w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 transition-colors duration-200 group-hover:bg-slate-900">
          <Folder className="h-6 w-6 text-slate-600 transition-colors duration-200 group-hover:text-white" />
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 group-hover:bg-slate-100 group-hover:text-slate-700">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      {/* Folder Information */}
      <div className="mt-6 flex flex-1 flex-col">
        <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Pasta
        </span>

        <h3
          className="line-clamp-2 text-[15px] font-semibold leading-6 text-slate-900"
          title={capitalize(folder.name)}
        >
          {capitalize(folder.name)}
        </h3>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-900">
          Abrir pasta
        </span>

        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900" />
      </div>
    </Link>
  );
}