import Link from "next/link";
import { Folder } from "lucide-react";
import { FolderType } from "../types";
import { capitalize, removeCharacters } from "@/app/lib/library";

export default function FolderCard({ folder }: { folder: FolderType }) {
  return (
    <Link
      href={`/management/projects/${folder.project_id}/documents/folder/${folder.id}`}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
    >
      {/* Background Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

      {/* Icon */}
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
        <Folder className="h-8 w-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
      </div>

      {/* Folder Name */}
      <h3 className="line-clamp-2 text-lg font-semibold text-slate-800">
        {removeCharacters(capitalize(folder.name))}
      </h3>

      {/* Subtitle */}
      <p className="mt-2 text-sm text-slate-500">
        Click to view documents
      </p>

      {/* Hover Arrow */}
      <div className="mt-5 flex items-center text-sm font-medium text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
        Open folder →
      </div>
    </Link>
  );
}