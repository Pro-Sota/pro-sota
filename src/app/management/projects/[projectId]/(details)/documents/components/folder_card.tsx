import Link from "next/link";
import { Folder } from "lucide-react";
import {FolderType} from "../types";

export default function FolderCard({ folder }: { folder: FolderType }) {
  return (
    <Link
      href={`/management/projects/${folder.projectId}/documents/folder/${folder.id}`}
      className="rounded-lg border bg-white p-5 transition hover:shadow-md"
    >
      <Folder className="mb-3 h-10 w-10 text-blue-500" />

      <h3 className="font-medium">{folder.name}</h3>

      <p className="mt-1 text-sm text-gray-500">
        {folder.itemCount} items
      </p>
    </Link>
  );
}