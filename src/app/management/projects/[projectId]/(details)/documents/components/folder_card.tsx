import Link from "next/link";
import { Folder } from "lucide-react";
import { FolderType } from "../types";
import { capitalize, removeCharacters } from "@/app/lib/library";

export default function FolderCard({ folder, view }: { folder: FolderType, view:string }) {
    return (
        <Link
            href={`/management/projects/${folder.project_id}/documents/folder/${folder.id}?view=${view}`}
className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">            {/* Background Accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 to-yellow-600" />

            {/* Icon */}
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-slate-100">
                <Folder className="h-10 w-10 text-slate-600 transition-transform duration-300 group-hover:scale-110" />
            </div>

            {/* Folder Name */}
            <h3 className="line-clamp-2 min-h-[3.5rem] text-sm font-semibold text-slate-800">
                {capitalize(folder.name)}
            </h3>

            {/* Hover Arrow */}
            <div className="mt-auto flex items-center text-sm font-medium text-slate-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                Abrir a pasta →
            </div>
        </Link>
    );
}